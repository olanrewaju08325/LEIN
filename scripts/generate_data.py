import random
from pathlib import Path
import numpy as np
import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[1] / 'ai' / 'data' / 'emergency_train.csv'

type_templates = {
    'Medical': [
        'Person don faint for road for {lga}',
        'One person dey vomit and no fit wake inside {lga}',
        'Patient no dey breathe after accident for {lga}',
        'Injured man dey bleed for {lga} bus stop',
    ],
    'Fire': [
        'Heavy smoke dey come out from market for {lga}',
        'House for {lga} dey burn with flame and people dey run',
        'Fire don start for apartment block for {lga}',
        'Electric pole catch fire near {lga} junction',
    ],
    'Security': [
        'Boys dey break enter compound with cutlass for {lga}',
        'Thief don use gun dey rob people for {lga}',
        'Fight and attack dey happen for {lga} street',
        'House owners dey complain say em intruder don enter for {lga}',
    ],
    'Accident': [
        'Accident happen for expressway near {lga} with many injured',
        'Vehicle don crash for {lga} road and traffic don jam',
        'Motorcycle hit pedestrian for {lga} during morning rush',
        'Pileup accident just happen for {lga} bridge',
    ],
}

LGA_LIST = ['Ikeja', 'Alimosho', 'Lagos Island', 'Lekki', 'Surulere', 'Yaba', 'Ajah', 'Agege', 'Festac', 'Ikorodu']
KEYWORD_PATTERNS = {
    'gun': ['gun', 'attack', 'rob', 'shoot'],
    'blood': ['blood', 'bleed', 'bleeding'],
    'fire': ['fire', 'burn', 'smoke', 'flame'],
    'unconscious': ['unconscious', 'faint', 'sleep', 'wake'],
    'accident': ['accident', 'crash', 'collision', 'pileup']
}

rush_hours = list(range(6, 10)) + list(range(16, 21))


def build_description(incident_type, lga):
    template = random.choice(type_templates[incident_type])
    return template.format(lga=lga)


def count_keyword_flags(description):
    lower = description.lower()
    count = 0
    for keywords in KEYWORD_PATTERNS.values():
        for token in keywords:
            if token in lower:
                count += 1
                break
    return count


def generate_records(count=620):
    records = []
    for _ in range(count):
        incident_type = random.choices(
            population=list(type_templates.keys()),
            weights=[0.35, 0.2, 0.25, 0.2],
            k=1,
        )[0]
        lga = random.choice(LGA_LIST)
        hour_of_day = random.choice(rush_hours) if incident_type == 'Accident' else random.randint(0, 23)
        day_of_week = random.randint(0, 6)
        description = build_description(incident_type, lga)
        if incident_type == 'Medical' and random.random() < 0.35:
            description += ' person still no fit wake'
        if incident_type == 'Security' and random.random() < 0.3:
            description += ' boys don dey there'
        if incident_type == 'Fire' and random.random() < 0.25:
            description += ' smoke everywhere'

        keyword_flags = count_keyword_flags(description)
        citizen_severity_hint = min(5, max(1, int(np.random.normal(3 + keyword_flags * 0.5, 1))))
        records.append({
            'description': description,
            'incident_type': incident_type,
            'hour_of_day': int(hour_of_day),
            'day_of_week': int(day_of_week),
            'lga': lga,
            'citizen_severity_hint': int(citizen_severity_hint),
            'keyword_flags': int(keyword_flags),
        })
    return records


def main():
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    records = generate_records()
    df = pd.DataFrame(records)
    df.to_csv(DATA_PATH, index=False)
    print(f'Wrote {len(df)} records to {DATA_PATH}')


if __name__ == '__main__':
    main()
