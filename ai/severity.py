from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd
from joblib import dump, load
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

MODEL_PATH = Path(__file__).resolve().parents[0] / 'models' / 'severity.joblib'
TRAINING_CSV = Path(__file__).resolve().parents[0] / 'data' / 'emergency_train.csv'

LGA_RISK_WEIGHTS = {
    'Ikeja': 0.95,
    'Alimosho': 0.92,
    'Lagos Island': 0.94,
    'Lekki': 0.9,
    'Surulere': 0.82,
    'Yaba': 0.78,
    'Ajah': 0.76,
    'Agege': 0.8,
    'Festac': 0.75,
    'Ikorodu': 0.7,
}
TYPE_BASE = {
    'Medical': 8.0,
    'Fire': 8.8,
    'Security': 7.5,
    'Accident': 8.2,
}
HIGH_RISK_KEYWORDS = {'gun', 'blood', 'unconscious', 'fire'}


def _hour_multiplier(hour: int) -> float:
    if 6 <= hour <= 9 or 16 <= hour <= 20:
        return 1.15
    return 1.0


def _encode_lga_weight(lga: str) -> float:
    return float(LGA_RISK_WEIGHTS.get(lga, 0.65))


def _build_target_score(row: pd.Series) -> float:
    base = TYPE_BASE.get(row['incident_type'], 6.5)
    hint = float(row['citizen_severity_hint'])
    hour_factor = _hour_multiplier(int(row['hour_of_day']))
    day_factor = 1.05 if int(row['day_of_week']) in (5, 6) else 1.0
    lga_weight = _encode_lga_weight(str(row['lga']))
    keyword_bonus = float(row['keyword_flags']) * 0.75
    score = base + 0.4 * hint + keyword_bonus
    score *= hour_factor * day_factor
    score += lga_weight * 0.8
    score = np.clip(score, 1.0, 10.0)
    if int(row['keyword_flags']) >= 2:
        score = max(score, 8.5)
    return round(score, 1)


class SeverityScorer:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = Path(model_path)
        self.model = None

    def train_model(self, csv_path: str) -> Path:
        df = pd.read_csv(csv_path)
        if 'priority_score' not in df.columns:
            df['priority_score'] = df.apply(_build_target_score, axis=1)

        feature_columns = ['incident_type', 'lga', 'hour_of_day', 'day_of_week', 'citizen_severity_hint', 'keyword_flags']
        X = df[feature_columns]
        y = df['priority_score']

        transformer = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore'), ['incident_type', 'lga']),
                ('num', StandardScaler(), ['hour_of_day', 'day_of_week', 'citizen_severity_hint', 'keyword_flags']),
            ],
            remainder='drop',
        )

        pipeline = Pipeline([
            ('transform', transformer),
            ('regressor', RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)),
        ])
        pipeline.fit(X, y)
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        dump(pipeline, self.model_path)
        self.model = pipeline
        return self.model_path

    def _load_model(self):
        if self.model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f'Model not found at {self.model_path}')
            self.model = load(self.model_path)

    def predict_score(self, features: Dict) -> float:
        self._load_model()
        feature_input = {
            'incident_type': [features.get('incident_type', 'Medical')],
            'lga': [features.get('lga', 'Ikeja')],
            'hour_of_day': [int(features.get('hour_of_day', 12))],
            'day_of_week': [int(features.get('day_of_week', 0))],
            'citizen_severity_hint': [int(features.get('citizen_severity_hint', 3))],
            'keyword_flags': [int(features.get('keyword_flags', 0))],
        }
        df = pd.DataFrame(feature_input)
        score = float(self.model.predict(df)[0])
        keywords = features.get('keywords', [])
        keyword_flags = int(features.get('keyword_flags', 0))
        if keyword_flags >= 2 or len([k for k in keywords if k in HIGH_RISK_KEYWORDS]) >= 2:
            score = max(score, 8.5)
        return round(min(max(score, 1.0), 10.0), 1)
