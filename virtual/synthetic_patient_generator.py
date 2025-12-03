import random
import uuid
import os
from disease_probability_tables import DISEASE_PROBABILITY, SYMPTOMS, VITAL_RANGES, LAB_RANGES, RISK_FACTORS

# ---------------------------------------------
# HELPER: Choose random synthetic image for disease
# ---------------------------------------------
def choose_synthetic_image(disease):
    folder = f"C:/Users/PRACHI/Documents/gen_ai/virtual/synthetic_images/{disease}/"
    if not os.path.exists(folder):
        return None  # No image available
    files = [f for f in os.listdir(folder) if f.endswith((".png", ".jpg", ".jpeg"))]
    if not files:
        return None
    return folder + random.choice(files)


# ---------------------------------------------
# HELPER: Weighted random selection
# ---------------------------------------------
def weighted_choice(choices_dict):
    items = list(choices_dict.items())
    names = [item[0] for item in items]
    weights = [item[1] for item in items]
    return random.choices(names, weights=weights, k=1)[0]


# ---------------------------------------------
# HELPER: Generate value within a range
# ---------------------------------------------
def random_range(r):
    return round(random.uniform(r[0], r[1]), 2)


# ---------------------------------------------
# GENERATE DEMOGRAPHICS
# ---------------------------------------------
def generate_demographics():
    height = random.randint(140, 190)
    weight = random.randint(45, 110)
    bmi = round(weight / ((height / 100) ** 2), 2)

    return {
        "age": random.randint(18, 80),
        "gender": random.choice(["male", "female"]),
        "height_cm": height,
        "weight_kg": weight,
        "bmi": bmi
    }


# ---------------------------------------------
# GENERATE SYMPTOMS
# ---------------------------------------------
def generate_symptoms(disease):
    symptom_list = []
    for symptom, prob in SYMPTOMS[disease].items():
        if random.random() < prob:
            symptom_list.append(symptom)
    return symptom_list


# ---------------------------------------------
# GENERATE VITALS
# ---------------------------------------------
def generate_vitals(disease):
    ranges = VITAL_RANGES[disease]
    return {
        "blood_pressure_systolic": int(random_range(ranges["blood_pressure_systolic"])),
        "blood_pressure_diastolic": int(random_range(ranges["blood_pressure_diastolic"])),
        "heart_rate": int(random_range(ranges["heart_rate"])),
        "respiratory_rate": random.randint(12, 22),
        "temperature_c": round(random.uniform(36.0, 38.0), 2)
    }


# ---------------------------------------------
# GENERATE LAB VALUES
# ---------------------------------------------
def generate_lab_values(disease):
    lab = {}
    for key, value_range in LAB_RANGES[disease].items():
        lab[key] = random_range(value_range)
    return lab


# ---------------------------------------------
# GENERATE RISK FACTORS
# ---------------------------------------------
def generate_risk_factors():
    return {
        factor: (random.random() < prob)
        for factor, prob in RISK_FACTORS.items()
    }


# ---------------------------------------------
# MAIN FUNCTION: GENERATE FULL SYNTHETIC PATIENT
# ---------------------------------------------
def generate_synthetic_patient():
    # Step 1: Choose disease based on probability
    disease = weighted_choice(DISEASE_PROBABILITY)

    patient = {
        "patient_id": str(uuid.uuid4()),
        "demographics": generate_demographics(),
        "symptoms": generate_symptoms(disease),
        "vitals": generate_vitals(disease),
        "lab_values": generate_lab_values(disease),
        "risk_factors": generate_risk_factors(),
        "synthetic_image_path": choose_synthetic_image(disease),  # UPDATED LINE
        "ground_truth_diagnosis": {
        "diabetes": 0,
        "heart_disease": 0,
        "kidney_disease": 1
    }
    }

    return patient


# ---------------------------------------------
# TEST RUN (Optional)
# ---------------------------------------------
if __name__ == "__main__":
    example = generate_synthetic_patient()
    print(example)
