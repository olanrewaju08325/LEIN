import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from ai.pipeline import process_incident


def main():
    sample_responders = [
        {'id': 1, 'name': 'Ambulance 01', 'lat': 6.53, 'lng': 3.38, 'status': 'available', 'type': 'Ambulance', 'capacity_weight': 1.0},
        {'id': 2, 'name': 'Fire Truck 02', 'lat': 6.52, 'lng': 3.36, 'status': 'available', 'type': 'Fire', 'capacity_weight': 1.2},
        {'id': 3, 'name': 'Patrol 03', 'lat': 6.48, 'lng': 3.40, 'status': 'returning', 'type': 'Security', 'capacity_weight': 0.9},
    ]
    result = process_incident(
        description='Person don faint for road for Ikeja, blood dey everywhere and no one dey help.',
        lat=6.6018,
        lng=3.3515,
        citizen_severity_hint=4,
        lga='Ikeja',
        available_responders=sample_responders,
    )
    print('Pipeline result:')
    print(result)


if __name__ == '__main__':
    main()
