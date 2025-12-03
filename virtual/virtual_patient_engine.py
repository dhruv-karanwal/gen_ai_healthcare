import os
import json
from datetime import datetime
from synthetic_patient_generator import generate_synthetic_patient
from model_interface import load_models, predict_patient  # STEP 4 functions

# -------------------------------
# Create predictions folder if it doesn't exist
# -------------------------------
PREDICTIONS_FOLDER = "predictions"
if not os.path.exists(PREDICTIONS_FOLDER):
    os.makedirs(PREDICTIONS_FOLDER)

# -------------------------------
# Load all models once at startup
# -------------------------------
print("Loading ML models...")
loaded_models = load_models()
print("Models loaded successfully.\n")


# -------------------------------
# Main simulation function
# -------------------------------
def simulate_virtual_patient():
    """
    Generate a synthetic patient, run ML predictions, compare with ground truth,
    and save output JSON.
    """
    # 1️⃣ Generate synthetic patient
    patient = generate_synthetic_patient()

    # 2️⃣ Run ML predictions
    predictions = predict_patient(patient, loaded_models)

    # 3️⃣ Compare predictions vs ground truth
    correctness = {
        disease: (predictions[disease] == (patient["ground_truth_diagnosis"] == disease))
        for disease in predictions
    }

    # 4️⃣ Build final simulation output
    simulation_output = {
        "patient": patient,
        "predictions": predictions,
        "correctness": correctness
    }

    # 5️⃣ Save JSON with timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = os.path.join(PREDICTIONS_FOLDER, f"patient_{timestamp}.json")
    with open(filename, "w") as f:
        json.dump(simulation_output, f, indent=4)

    print(f"Saved simulation JSON: {filename}\n")
    return simulation_output


# -------------------------------
# Batch simulation
# -------------------------------
def simulate_multiple_patients(n=5):
    """
    Simulate multiple patients at once.
    Returns a list of simulation outputs.
    """
    results = []
    for i in range(n):
        result = simulate_virtual_patient()
        results.append(result)
        print(f"[{i+1}/{n}] Generated patient ID: {result['patient']['patient_id']}")
    return results


# -------------------------------
# TEST RUN
# -------------------------------
if __name__ == "__main__":
    print("Running single patient simulation...\n")
    simulation = simulate_virtual_patient()
    print(json.dumps(simulation, indent=4))

    print("\nRunning batch simulation (3 patients)...\n")
    batch_simulation = simulate_multiple_patients(3)
