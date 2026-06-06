# LEIN

## AI / ML Components

This repository includes the LEIN AI pipeline under the `ai/` folder. Key files:

- `ai/classifier.py` — NLP emergency classifier with online LLM primary and offline scikit-learn fallback.
- `ai/severity.py` — RandomForest severity regressor; trains from `ai/data/emergency_train.csv` and saves to `ai/models/severity.joblib`.
- `ai/router.py` — Haversine-based routing optimizer with simple traffic multipliers.
- `ai/forecaster.py` — Lightweight forecast generator (6-hour window) matching frontend array schema.
- `ai/pipeline.py` — Unified `process_incident(...)` function expected by the backend.

Run the scripts in `scripts/` to regenerate data and train models:

```powershell
python scripts\generate_data.py
python scripts\train_severity.py
python scripts\train_forecaster.py
python scripts\test_pipeline.py
```

Dependencies are pinned in `requirements-ai.txt`.
