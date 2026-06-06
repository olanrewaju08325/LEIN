import json
import os
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
from joblib import dump, load
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

try:
    import anthropic
except ImportError:
    anthropic = None

MODEL_PATH = Path(__file__).resolve().parents[0] / 'models' / 'classifier_fallback.joblib'
TRAINING_CSV = Path(__file__).resolve().parents[0] / 'data' / 'emergency_train.csv'
CATEGORIES = ['Medical', 'Fire', 'Security', 'Accident']
KEYWORD_MAP = {
    'Medical': ['faint', 'unconscious', 'blood', 'bleed', 'sick', 'injury', 'pain', 'wake', 'vomit', 'heart'],
    'Fire': ['smoke', 'burn', 'burning', 'fire', 'flame', 'gas', 'sparks', 'hot'],
    'Security': ['boys', 'break', 'rob', 'steal', 'gun', 'attack', 'fight', 'intruder', 'cutlass'],
    'Accident': ['accident', 'crash', 'collision', 'pileup', 'vehicle', 'hit', 'skid', 'roadblock'],
}


def _build_anthropic_prompt(text: str) -> str:
    return (
        'You are a Lagos emergency classification assistant. '
        'Classify the following incident text into one of these incident types: Medical, Fire, Security, Accident. '
        'Return only valid JSON with keys type, confidence, and keywords. '
        'type must be one of Medical, Fire, Security, Accident. '
        'confidence must be a float between 0.0 and 1.0. '
        'keywords must be a JSON array of strings. '
        f'Text: "{text}"'
    )


def _parse_anthropic_response(response_text: str) -> Dict:
    try:
        data = json.loads(response_text.strip())
        if data.get('type') not in CATEGORIES:
            raise ValueError('invalid type')
        return {
            'type': data['type'],
            'confidence': float(data.get('confidence', 0.6)),
            'keywords': data.get('keywords', []),
        }
    except Exception:
        raise ValueError('Unable to parse Anthropic response')


def extract_keywords(text: str) -> List[str]:
    text_lower = text.lower()
    found: List[str] = []
    for tokens in KEYWORD_MAP.values():
        for token in tokens:
            if token in text_lower and token not in found:
                found.append(token)
    return found


def _choose_fallback_label(text: str) -> str:
    text_lower = text.lower()
    scores = {label: 0 for label in CATEGORIES}
    for label, tokens in KEYWORD_MAP.items():
        for token in tokens:
            if token in text_lower:
                scores[label] += 1
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return 'Medical'
    return best


class ClassifierFallback:
    def __init__(self):
        self.model = None
        self._load_or_train()

    def _load_or_train(self):
        if MODEL_PATH.exists():
            self.model = load(MODEL_PATH)
            return
        self._train()

    def _train(self):
        if not TRAINING_CSV.exists():
            raise FileNotFoundError(f'Training CSV not found at {TRAINING_CSV}')
        df = pd.read_csv(TRAINING_CSV)
        X = df['description']
        y = df['incident_type']
        pipeline = Pipeline([
            ('vectorizer', TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ('clf', LogisticRegression(max_iter=1000, solver='lbfgs')),
        ])
        pipeline.fit(X, y)
        self.model = pipeline
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        dump(self.model, MODEL_PATH)

    def predict(self, text: str) -> Dict:
        probability = 0.0
        label = 'Medical'
        if self.model is not None:
            label = self.model.predict([text])[0]
            probs = self.model.predict_proba([text])[0]
            probability = float(probs.max())
        if label not in CATEGORIES:
            label = _choose_fallback_label(text)
        keywords = extract_keywords(text)
        return {
            'type': label,
            'confidence': probability if probability else 0.66,
            'keywords': keywords,
        }


def classify_incident(text: str) -> Dict:
    text = text.strip()
    if not text:
        return {'type': 'Medical', 'confidence': 0.0, 'keywords': []}

    ai_mode = os.getenv('AI_MODE', 'offline').lower()
    if ai_mode == 'online' and anthropic is not None:
        api_key = os.getenv('ANTHROPIC_API_KEY')
        try:
            if not api_key:
                raise RuntimeError('Missing ANTHROPIC_API_KEY')
            client = anthropic.Client(api_key=api_key)
            prompt = _build_anthropic_prompt(text)
            completion = client.completions.create(
                model='claude-haiku-20240307',
                prompt=prompt,
                max_tokens_to_sample=200,
                temperature=0.0,
            )
            return _parse_anthropic_response(completion.completion)
        except Exception:
            pass

    fallback = ClassifierFallback()
    return fallback.predict(text)
