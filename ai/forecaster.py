from datetime import datetime, timedelta
from typing import Dict, List

CORE_LGAS = ['Ikeja', 'Alimosho', 'Lekki', 'Lagos Island']
INCIDENT_TYPES = ['Medical', 'Fire', 'Security', 'Accident']


def _format_hour(dt: datetime) -> str:
    return dt.strftime('%I:00 %p').lstrip('0')


def get_forecast(hours_ahead: int = 6) -> List[Dict]:
    now = datetime.now()
    forecast: List[Dict] = []
    for offset in range(1, hours_ahead + 1):
        hour_dt = now + timedelta(hours=offset)
        hour_str = _format_hour(hour_dt)
        hour_slot = hour_dt.hour
        for lga in CORE_LGAS:
            for incident_type in INCIDENT_TYPES:
                base = 3
                if incident_type == 'Medical':
                    base += 2
                if incident_type == 'Accident' and hour_slot in range(6, 10):
                    base += 2
                if incident_type == 'Security' and hour_slot in range(20, 24):
                    base += 1
                if lga in {'Ikeja', 'Lekki'} and hour_slot in range(16, 21):
                    base += 1
                volume = max(1, int(base + (hash(lga + incident_type + str(hour_slot)) % 3)))
                forecast.append({
                    'lga': lga,
                    'type': incident_type,
                    'predicted_incidents': volume,
                    'hour': hour_str,
                })
    return forecast
