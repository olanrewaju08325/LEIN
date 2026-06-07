import math
from typing import Dict, List

HEAVY_TRAFFIC_LGAS = {'Ikeja', 'Lekki', 'Lagos Island'}
TYPE_TO_RESPONDER = {
    'Medical': 'Ambulance',
    'Fire': 'Fire Truck',
    'Security': 'Police',
    'Accident': 'Ambulance',
}


def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return 6371.0 * c


def optimize_routing(
    incident_lat: float,
    incident_lng: float,
    responders: List[Dict],
    hour_of_day: int,
    lga: str,
    incident_type: str = 'Medical',
) -> Dict:
    available = [res for res in responders if res.get('status') in ('available', 'active')]
    if not available:
        return {'error': 'No available responders', 'recommended_unit': None, 'eta_minutes': None}

    preferred_type = TYPE_TO_RESPONDER.get(incident_type, 'Ambulance')
    type_map = {
        'Medical': ['medical', 'ambulance'],
        'Fire': ['fire'],
        'Security': ['police', 'security'],
        'Accident': ['ambulance', 'rescue'],
    }
    preferred_types = [t.lower() for t in type_map.get(incident_type, [preferred_type])]
    typed = [
        res
        for res in available
        if str(res.get('type', '')).strip().lower() in preferred_types
    ]
    pool = typed if typed else available

    traffic_multiplier = 1.0
    if hour_of_day in range(6, 10) or hour_of_day in range(16, 21):
        if str(lga).title() in HEAVY_TRAFFIC_LGAS:
            traffic_multiplier = 2.5

    best_score = None
    best_responder = None
    best_distance = 0.0
    for responder in pool:
        distance = calculate_haversine(incident_lat, incident_lng, float(responder.get('lat', 0.0)), float(responder.get('lng', 0.0)))
        capacity_weight = float(responder.get('capacity_weight', 1.0)) if responder.get('capacity_weight') is not None else 1.0
        if capacity_weight <= 0:
            capacity_weight = 1.0
        score = (distance * traffic_multiplier) / capacity_weight
        if best_score is None or score < best_score:
            best_score = score
            best_responder = responder
            best_distance = distance

    eta_minutes = int(max(1, round((best_distance * traffic_multiplier) / 30.0 * 60.0)))
    return {
        'recommended_unit': best_responder.get('name'),
        'eta_minutes': eta_minutes,
        'score': round(best_score, 3),
        'distance_km': round(best_distance, 3),
    }
