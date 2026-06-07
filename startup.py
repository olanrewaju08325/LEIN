from pathlib import Path

from ai.classifier import ClassifierFallback
from ai.severity import SeverityScorer, TRAINING_CSV


def ensure_models_ready():
    print("Checking AI models...")

    severity_model = Path("ai/models/severity.joblib")
    if not severity_model.exists():
        print("Training severity model...")
        scorer = SeverityScorer()
        scorer.train_model(str(TRAINING_CSV))
        print("Severity model trained.")
    else:
        print("Severity model ready.")

    classifier_model = Path("ai/models/classifier_fallback.joblib")
    if not classifier_model.exists():
        print("Training classifier fallback...")
        ClassifierFallback()
        print("Classifier ready.")
    else:
        print("Classifier ready.")

    print("All AI models ready.")


if __name__ == "__main__":
    ensure_models_ready()
