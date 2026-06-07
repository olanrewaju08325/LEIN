from collections import deque
from datetime import datetime
from typing import Dict, List

from ai.classifier import classify_incident
from ai.router import optimize_routing
from ai.severity import SeverityScorer

classification_cache = deque(maxlen=10)
severity_scorer = SeverityScorer()


def _scale_to_severity(priority_score: float) -> int:
    return int(max(1, min(5, round(priority_score / 2.0))))


def _find_cached(description: str) -> Dict:
    for item in classification_cache:
        if item['description'] == description:
            return item
    return {}


def process_incident(description: str, lat: float, lng: float, citizen_severity_hint: int, lga: str, available_responders: List[Dict]) -> Dict:
    try:
        description = description.strip()
        cache_hit = _find_cached(description)
        if cache_hit:
            classification = cache_hit['result']
        else:
            classification = classify_incident(description)
            classification_cache.append({'description': description, 'result': classification})

        now = datetime.now()
        severity_features = {
            'incident_type': classification['type'],
            'lga': lga,
            'hour_of_day': int(now.hour),
            'day_of_week': int(now.weekday()),
            'citizen_severity_hint': int(citizen_severity_hint),
            'keyword_flags': len(classification.get('keywords', [])),
            'keywords': classification.get('keywords', []),
        }

        priority_score = severity_scorer.predict_score(severity_features)
        route = optimize_routing(
            incident_lat=lat,
            incident_lng=lng,
            responders=available_responders,
            hour_of_day=now.hour,
            lga=lga,
            incident_type=classification['type'],
        )

        return {
            'type': classification['type'],
            'severity': _scale_to_severity(priority_score),
            'priority_score': round(priority_score, 1),
            'recommended_unit': route.get('recommended_unit'),
            'eta_minutes': route.get('eta_minutes'),
        }
    except Exception as exc:
        # Log the error and return safe fallback values so callers can continue
        print(f"AI pipeline error in process_incident: {exc}")
        return {
            'type': 'Medical',
            'severity': 3,
            'priority_score': 5.0,
            'recommended_unit': 'General Response',
            'eta_minutes': 15,
            'nearest_hospital': 'Lagos General Hospital',
            'hospital_capacity': 70,
        }
