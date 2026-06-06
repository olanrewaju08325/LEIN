import sys
from pathlib import Path
import joblib

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from ai.forecaster import get_forecast


def main():
    repo_root = Path(__file__).resolve().parents[1]
    model_path = repo_root / 'ai' / 'models' / 'forecaster.joblib'
    model_path.parent.mkdir(parents=True, exist_ok=True)
    forecast = get_forecast()
    joblib.dump(forecast, model_path)
    print(f'Forecast model placeholder saved to {model_path}')


if __name__ == '__main__':
    main()
