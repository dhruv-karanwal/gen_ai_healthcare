# ---------------------------------------------
# DISEASE PROBABILITY TABLES FOR SYNTHETIC PATIENTS
# ---------------------------------------------

DISEASE_PROBABILITY = {
    "diabetes": 0.35,
    "heart_disease": 0.35,
    "kidney_disease": 0.30
}

# ---------------------------------------------
# SYMPTOM PROBABILITIES FOR EACH DISEASE
# ---------------------------------------------

SYMPTOMS = {
    "diabetes": {
        "frequent_urination": 0.7,
        "excessive_thirst": 0.8,
        "fatigue": 0.6,
        "blurred_vision": 0.5,
        "slow_healing_wounds": 0.4
    },
    "heart_disease": {
        "chest_pain": 0.75,
        "shortness_of_breath": 0.65,
        "fatigue": 0.5,
        "dizziness": 0.4,
        "swelling_in_legs": 0.3
    },
    "kidney_disease": {
        "swelling_ankles": 0.7,
        "frequent_urination_at_night": 0.6,
        "back_pain": 0.55,
        "nausea": 0.4,
        "foam_in_urine": 0.35
    }
}

# ---------------------------------------------
# VITALS RANGES FOR EACH DISEASE
# ---------------------------------------------

VITAL_RANGES = {
    "diabetes": {
        "blood_pressure_systolic": (120, 150),
        "blood_pressure_diastolic": (80, 95),
        "heart_rate": (70, 100)
    },
    "heart_disease": {
        "blood_pressure_systolic": (130, 180),
        "blood_pressure_diastolic": (85, 110),
        "heart_rate": (80, 120)
    },
    "kidney_disease": {
        "blood_pressure_systolic": (130, 170),
        "blood_pressure_diastolic": (85, 105),
        "heart_rate": (75, 110)
    }
}

# ---------------------------------------------
# LAB VALUE RANGES (Disease specific)
# ---------------------------------------------

LAB_RANGES = {
    "diabetes": {
        "blood_glucose": (140, 350),
        "hbA1c": (6.5, 12.0),
        "cholesterol": (160, 250)
    },
    "heart_disease": {
        "cholesterol": (200, 350),
        "blood_glucose": (90, 150),
        "creatinine": (0.6, 1.3)
    },
    "kidney_disease": {
        "creatinine": (1.5, 8.0),
        "urea": (50, 180),
        "blood_glucose": (80, 150)
    }
}

# ---------------------------------------------
# RISK FACTORS PROBABILITY
# ---------------------------------------------

RISK_FACTORS = {
    "smoking": 0.3,
    "family_history": 0.4,
    "obesity": 0.35,
    "alcohol": 0.25,
    "physical_inactivity": 0.45
}
