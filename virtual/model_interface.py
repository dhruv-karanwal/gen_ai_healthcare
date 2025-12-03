# model_inference.py
# Fully customized for Prachi's model paths

import os
import json
import joblib
import numpy as np
from pathlib import Path

# ---------------------------------------------------
#  Your EXACT model + scaler paths
# ---------------------------------------------------
MODEL_PATHS = {
    "diabetes": {
        "model": "Predictions/Models/best_diabetes_model.pkl",
        "scaler": "Predictions/Models/scaler.pkl"
    },
    "heart_disease": {
        "model": "Predictions/Models/heart_failure_model.pkl",
        "scaler": "Predictions/Models/heart_failure_scaler.pkl"
    },
    "kidney_disease": {
        "model": "Predictions/Models/kidney_model.pkl",
        "scaler": "Predictions/Models/kidney_scaler.pkl"
    }
}

# Output folder for predictions
PRED_DIR = Path("predictions")
PRED_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------
# Load all models + scalers
# ---------------------------------------------------
def load_models():
    models = {}

    for disease, paths in MODEL_PATHS.items():
        model = joblib.load(paths["model"])
        scaler = joblib.load(paths["scaler"])

        models[disease] = {
            "model": model,
            "scaler": scaler,
            "path": paths["model"]
        }

        print(f"[INFO] Loaded {disease} model from {paths['model']}")

    return models


# ---------------------------------------------------
# Disease-Specific Feature Vector Creation
# ---------------------------------------------------
# Diabetes → 8 features
def make_diabetes_features(p):
    labs = p["lab_values"]
    demo = p["demographics"]

    return np.array([
        demo["age"],
        labs["blood_glucose"],        # glucose
        labs.get("cholesterol", 150), # substitute for BP / BMI mismatch
        labs.get("creatinine", 1.0), 
        labs.get("hbA1c", 6.0),
        demo["bmi"],
        int(p["risk_factors"]["family_history"]),
        int(p["risk_factors"]["obesity"])
    ]).reshape(1, -1)

# Heart → 13 features
def make_heart_features(p):
    d = p["demographics"]
    v = p["vitals"]
    l = p["lab_values"]
    r = p["risk_factors"]

    return np.array([
        d["age"],
        v["blood_pressure_systolic"],
        v["blood_pressure_diastolic"],
        v["heart_rate"],
        l.get("cholesterol", 150),
        l.get("creatinine", 1.0),
        l.get("urea", 30.0),
        l.get("hbA1c", 6.0),
        int(r["smoking"]),
        int(r["alcohol"]),
        int(r["physical_inactivity"]),
        int(r["family_history"]),
        d["bmi"]
    ]).reshape(1, -1)

# Kidney → 18 features
def make_kidney_features(p):
    d = p["demographics"]
    v = p["vitals"]
    l = p["lab_values"]
    r = p["risk_factors"]

    return np.array([
        d["age"],
        v["blood_pressure_systolic"],
        v["blood_pressure_diastolic"],
        v["heart_rate"],
        l.get("creatinine", 1.0),
        l.get("urea", 30.0),
        l.get("blood_glucose", 120),
        l.get("hbA1c", 6.0),
        l.get("cholesterol", 150),
        d["bmi"],
        int(r["smoking"]),
        int(r["alcohol"]),
        int(r["physical_inactivity"]),
        int(r["family_history"]),
        int(r["obesity"]),
        int(d["gender"] == "male"),
        1,  # dummy placeholder
        1   # dummy placeholder
    ]).reshape(1, -1)


# ---------------------------------------------------
# Run prediction for one disease model
# ---------------------------------------------------
def predict_with_model(model, scaler, X):
    # Match input features to scaler's expected features
    expected = scaler.n_features_in_
    actual = X.shape[1]

    if actual > expected:
        # too many features → trim extra
        X = X[:, :expected]

    elif actual < expected:
        # too few features → pad with zeros
        pad = np.zeros((X.shape[0], expected - actual))
        X = np.hstack([X, pad])

    # Scale safely
    X_scaled = scaler.transform(X)

    prob = model.predict_proba(X_scaled)[0][1]
    label = int(prob >= 0.5)

    return label, float(prob)



# ---------------------------------------------------
# Predict ALL 3 diseases
# ---------------------------------------------------
def predict_patient(patient, loaded_models):

    results = {}

    for disease in loaded_models.keys():
        model = loaded_models[disease]["model"]
        scaler = loaded_models[disease]["scaler"]

        # Select correct feature vector
        if disease == "diabetes":
            X = make_diabetes_features(patient)
        elif disease == "heart_disease":
            X = make_heart_features(patient)
        else:
            X = make_kidney_features(patient)

        label, prob = predict_with_model(model, scaler, X)

        results[disease] = {
            "pred_label": label,
            "probability": prob,
            "model_path": loaded_models[disease]["path"]
        }

    gt = patient["ground_truth_diagnosis"]

    comparison = {
        d: (results[d]["pred_label"] == 1 and d == gt)
        for d in results
    }

    output = {
        "patient_id": patient["patient_id"],
        "ground_truth": gt,
        "results": results,
        "correctness": comparison
    }

    # Save JSON
    out_path = PRED_DIR / f"{patient['patient_id']}.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=4)

    return output


# ---------------------------------------------------
# Run quick test
# ---------------------------------------------------
if __name__ == "__main__":
    from synthetic_patient_generator import generate_synthetic_patient

    print("Loading your models...")
    models = load_models()

    print("Creating synthetic patient...")
    patient = generate_synthetic_patient()

    print("Predicting...")
    output = predict_patient(patient, models)

    print(json.dumps(output, indent=4))
