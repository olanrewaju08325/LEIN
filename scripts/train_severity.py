import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from ai.severity import SeverityScorer


def main():
    repo_root = Path(__file__).resolve().parents[1]
    csv_path = repo_root / 'ai' / 'data' / 'emergency_train.csv'
    scorer = SeverityScorer()
    scorer.train_model(str(csv_path))
    print('Severity model trained and saved.')


if __name__ == '__main__':
    main()
