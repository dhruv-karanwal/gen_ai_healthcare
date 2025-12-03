import os
import sys
import pickle
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import base64
import uuid
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input

# Ensure heat map folder exists
HEATMAP_FOLDER = 'heat map'
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

# Import Chatbot Logic
from medical_chatbot import send_message

# Import OCR Logic
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from ocr_new import reconstruct_layout_from_doctr, analyze_medical_report

# Virtual Patient Imports
sys.path.append('virtual')
from virtual_patient_engine import simulate_virtual_patient



app = Flask(__name__)
CORS(app)

# ======================================================
# CONFIGURATION
# ======================================================
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
IMG_SIZE = 224
HEART_CLASSES = ["NORMAL", "PNEUMONIA"]
DIABETES_CLASSES = ["DR", "No_DR"]

# ======================================================
# LOAD MODELS (Predictions)
# ======================================================
MODEL_DIR = os.path.join("Predictions", "Models")

def load_model(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        print(f"Warning: Model file not found: {path}")
        return None
    return pickle.load(open(path, "rb"))

print("Loading Prediction Models...")
diabetes_model = load_model("best_diabetes_model.pkl")
diabetes_scaler = load_model("scaler.pkl")

heart_model = load_model("heart_failure_model.pkl")
heart_scaler = load_model("heart_failure_scaler.pkl")

kidney_model = load_model("kidney_model.pkl")
kidney_scaler = load_model("kidney_scaler.pkl")
print("Models loaded.")

# ======================================================
# LOAD IMAGE MODELS (Heat Map)
# ======================================================
print("Loading Image Models...")
try:
    # Adjust paths to match your workspace structure
    HEART_MODEL_PATH = os.path.join("heat map", "DATASETS", "HEART", "HEART_best_model.h5")
    DIABETES_MODEL_PATH = os.path.join("heat map", "DATASETS", "DIABETES", "DIABETES_best_model.h5")
    
    heart_image_model = tf.keras.models.load_model(HEART_MODEL_PATH)
    diabetes_image_model = tf.keras.models.load_model(DIABETES_MODEL_PATH)
    print("Image Models loaded.")
except Exception as e:
    print(f"Error loading image models: {e}")
    heart_image_model = None
    diabetes_image_model = None

# ======================================================
# LOAD OCR MODEL
# ======================================================
print("Loading OCR Model...")
try:
    ocr_model = ocr_predictor(pretrained=True)
    print("OCR Model loaded.")
except Exception as e:
    print(f"Error loading OCR model: {e}")
    ocr_model = None

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    
    response = send_message(user_input)
    


    return jsonify({"response": response})

@app.route('/api/ocr', methods=['POST'])
def ocr():
    # Check if request is JSON (Direct Text Analysis)
    if request.is_json:
        data = request.json
        text = data.get('text', '')
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        try:
            analysis_result = analyze_medical_report(text)
            return jsonify({
                "text": text,
                "analysis": analysis_result
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # File Upload Logic
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        if not ocr_model:
            return jsonify({"error": "OCR model not loaded"}), 500

        try:
            if filename.lower().endswith('.pdf'):
                doc = DocumentFile.from_pdf(filepath)
            else:
                doc = DocumentFile.from_images([filepath])
            
            result = ocr_model(doc)
            text = reconstruct_layout_from_doctr(result)
            
            # Analyze text with Gemini
            analysis_result = analyze_medical_report(text)
            
            return jsonify({
                "text": text,
                "analysis": analysis_result
            })
        except Exception as e:
            with open("ocr_error.log", "w") as f:
                f.write(str(e))
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

@app.route('/api/predict/diabetes', methods=['POST'])
def predict_diabetes():
    data = request.json
    try:
        features = [
            int(data.get('gender', 0)), # 0=Male, 1=Female
            float(data.get('age', 0)),
            int(data.get('hypertension', 0)),
            int(data.get('heart_disease', 0)),
            int(data.get('smoking', 0)), # Map to 0-5 scale if needed, assuming int passed
            float(data.get('bmi', 0)),
            float(data.get('hba1c', 0)),
            float(data.get('glucose', 0))
        ]
        
        arr = np.array(features).reshape(1, -1)
        scaled = diabetes_scaler.transform(arr)
        pred = diabetes_model.predict(scaled)[0]
        prob = diabetes_model.predict_proba(scaled)[0][pred] * 100
        
        result = "DIABETIC" if pred else "NON-DIABETIC"
        
        # ---------------- MEDICAL REASONS ----------------
        reasons = []
        
        # HbA1c rules
        hba1c_val = float(data.get('hba1c', 0))
        if hba1c_val >= 6.5:
            reasons.append(f"â€¢ HbA1c {hba1c_val}% is in DIABETIC range (â‰¥ 6.5%)")
        elif hba1c_val >= 5.7:
            reasons.append(f"â€¢ HbA1c {hba1c_val}% is PREDIABETIC (5.7â€“6.4%)")

        # Blood glucose rules
        glucose_val = float(data.get('glucose', 0))
        if glucose_val >= 200:
            reasons.append(f"â€¢ Blood glucose {glucose_val} mg/dL is VERY HIGH (â‰¥ 200)")
        elif glucose_val >= 140:
            reasons.append(f"â€¢ Blood glucose {glucose_val} mg/dL is prediabetic (140â€“199)")

        # BMI rules
        bmi_val = float(data.get('bmi', 0))
        if bmi_val >= 30:
            reasons.append(f"â€¢ BMI {bmi_val} indicates obesity (major diabetes risk)")
        elif bmi_val >= 25:
            reasons.append(f"â€¢ BMI {bmi_val} indicates overweight")

        # Smoking
        smoking_val = int(data.get('smoking', 0))
        if smoking_val in [3, 4]:  # current or ever
            reasons.append("â€¢ Smoking history increases insulin resistance")

        # Age
        age_val = float(data.get('age', 0))
        if age_val >= 45:
            reasons.append(f"â€¢ Age {age_val} increases risk of type 2 diabetes")

        # Hypertension
        if int(data.get('hypertension', 0)) == 1:
            reasons.append("â€¢ Hypertension present â†’ closely linked with diabetes")

        # Heart Disease
        if int(data.get('heart_disease', 0)) == 1:
            reasons.append("• Heart disease increases metabolic risk")

        if len(reasons) == 0:
            reasons.append("• No strong medical risk factors detected.")

        result_json = {
            "prediction": result, 
            "confidence": float(prob), 
            "risk_score": float(prob if pred else 100-prob),
            "reasons": reasons
        }



        return jsonify(result_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict/heart', methods=['POST'])
def predict_heart():
    data = request.json
    try:
        # Expected: age, anaemia, cpk, diabetes, ef, hbp, platelets, creatinine, sodium, sex, smoking, time
        features = [
            float(data.get('age', 0)),
            int(data.get('anaemia', 0)),
            float(data.get('cpk', 0)),
            int(data.get('diabetes', 0)),
            float(data.get('ef', 0)),
            int(data.get('hbp', 0)),
            float(data.get('platelets', 0)),
            float(data.get('creatinine', 0)),
            float(data.get('sodium', 0)),
            int(data.get('sex', 0)),
            int(data.get('smoking', 0)),
            float(data.get('time', 0))
        ]
        
        arr = np.array(features).reshape(1, -1)
        scaled = heart_scaler.transform(arr)
        pred = heart_model.predict(scaled)[0]
        prob = heart_model.predict_proba(scaled)[0][pred] * 100
        
        result = "HIGH RISK" if pred else "LOW RISK"
        
        # ---------------- MEDICAL EXPLANATION ----------------
        reasons = []
        
        # EF
        ef_val = float(data.get('ef', 0))
        if ef_val < 30:
            reasons.append(f"â€¢ Ejection Fraction {ef_val}% is critically low.")
        elif ef_val < 40:
            reasons.append(f"â€¢ Ejection Fraction {ef_val}% indicates mild dysfunction.")

        # Creatinine
        creatinine_val = float(data.get('creatinine', 0))
        if creatinine_val >= 2:
            reasons.append(f"â€¢ Serum Creatinine {creatinine_val} mg/dL is very high.")
        elif creatinine_val >= 1.5:
            reasons.append(f"â€¢ Serum Creatinine {creatinine_val} mg/dL is slightly high.")

        # Sodium
        sodium_val = float(data.get('sodium', 0))
        if sodium_val < 130:
            reasons.append(f"â€¢ Serum Sodium {sodium_val} mEq/L is dangerously low.")
        elif sodium_val < 135:
            reasons.append(f"â€¢ Serum Sodium {sodium_val} mEq/L is below normal.")

        # CPK
        cpk_val = float(data.get('cpk', 0))
        if cpk_val > 1000:
            reasons.append(f"â€¢ CPK {cpk_val} is extremely high â€” heart muscle damage.")
        elif cpk_val > 500:
            reasons.append(f"â€¢ CPK {cpk_val} is elevated.")

        # Platelets
        platelets_val = float(data.get('platelets', 0))
        if platelets_val < 150000:
            reasons.append(f"â€¢ Platelet count {platelets_val} is low.")

        # Age
        age_val = float(data.get('age', 0))
        if age_val > 70:
            reasons.append(f"â€¢ Age {age_val} increases mortality risk.")
        elif age_val > 60:
            reasons.append(f"â€¢ Age {age_val} slightly increases risk.")

        # Hypertension
        if int(data.get('hbp', 0)) == 1:
            reasons.append("â€¢ Patient has hypertension.")

        # Diabetes
        if int(data.get('diabetes', 0)) == 1:
            reasons.append("â€¢ Patient has diabetes.")

        # Smoking
        if int(data.get('smoking', 0)) == 1:
            reasons.append("â€¢ Patient is a smoker.")

        # Time (follow-up)
        time_val = float(data.get('time', 0))
        if time_val < 10:
            reasons.append(f"â€¢ Low follow-up time {time_val} days indicates recent severe injury.")

        if len(reasons) == 0:
            reasons.append("• No major medical risk factors detected.")

        result_json = {
            "prediction": result, 
            "confidence": float(prob), 
            "risk_score": float(prob if pred else 100-prob),
            "reasons": reasons
        }



        return jsonify(result_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict/kidney', methods=['POST'])
def predict_kidney():
    data = request.json
    try:
        # Full list from unified2.py:
        # age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane
        
        keys = ['age','bp','sg','al','su','rbc','pc','pcc','ba','bgr','bu','sc','sod','pot','hemo','pcv','wc','rc','htn','dm','cad','appet','pe','ane']
        features = [float(data.get(k, 0)) for k in keys]

        arr = np.array(features).reshape(1, -1)
        scaled = kidney_scaler.transform(arr)
        pred = kidney_model.predict(scaled)[0]
        prob = kidney_model.predict_proba(scaled)[0][pred] * 100
        
        result = "CKD (Kidney Disease)" if pred else "No CKD"
        
        # --------------- EXPLANATION ----------------
        reasons = []
        
        sc_val = float(data.get('sc', 0))
        if sc_val > 1.5:
            reasons.append("â€¢ High serum creatinine â†’ reduced kidney filtration")

        bu_val = float(data.get('bu', 0))
        if bu_val > 50:
            reasons.append("â€¢ High blood urea â†’ kidneys unable to remove waste")

        pot_val = float(data.get('pot', 0))
        if pot_val > 5.2:
            reasons.append("â€¢ High potassium â†’ electrolyte imbalance due to CKD")

        bp_val = float(data.get('bp', 0))
        if bp_val > 140:
            reasons.append("â€¢ Very high blood pressure â†’ damages kidneys")

        hemo_val = float(data.get('hemo', 0))
        if hemo_val < 12:
            reasons.append("â€¢ Low hemoglobin â†’ anemia due to kidney disease")

        sg_val = float(data.get('sg', 0))
        if sg_val <= 1.010:
            reasons.append("â€¢ Low specific gravity â†’ kidneys cannot concentrate urine")

        if int(data.get('rbc', 1)) == 0:
            reasons.append("â€¢ RBC abnormal â†’ kidney inflammation / infection")

        if int(data.get('pc', 1)) == 0:
            reasons.append("â€¢ Pus cells abnormal â†’ possible kidney infection")

        if int(data.get('pcc', 0)) == 1:
            reasons.append("â€¢ Pus cell clumps detected â†’ strong CKD indicator")

        if int(data.get('dm', 0)) == 1:
            reasons.append("â€¢ Diabetes present â†’ #1 cause of CKD")

        if int(data.get('htn', 0)) == 1:
            reasons.append("â€¢ Hypertension present â†’ long-term kidney damage")

        if len(reasons) == 0:
            reasons.append("• No major medical risk factors detected.")

        result_json = {
            "prediction": result, 
            "confidence": float(prob), 
            "risk_score": float(prob if pred else 100-prob),
            "reasons": reasons
        }



        return jsonify(result_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# IMAGE ANALYSIS & HEATMAP
# ======================================================
def generate_gradcam(img_array, model, layer_name="conv5_block3_out"):
    try:
        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[model.get_layer(layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            if isinstance(predictions, list):
                predictions = predictions[0]
            pred_index = tf.argmax(predictions[0])
            loss = predictions[:, pred_index]

        grads = tape.gradient(loss, conv_outputs)
        weights = tf.reduce_mean(grads, axis=(0, 1, 2))

        cam = tf.reduce_sum(tf.multiply(weights, conv_outputs), axis=-1)[0]
        cam = np.maximum(cam, 0)

        if isinstance(cam, tf.Tensor):
            cam = cam.numpy()

        cam = cam / (np.max(cam) + 1e-8)
        cam = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        cam = (cam * 255).astype("uint8")

        heatmap = cv2.applyColorMap(cam, cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        return heatmap
    except Exception as e:
        print(f"GradCAM error: {e}")
        return None

def process_image_heatmap(filepath, model, classes):
    # Read image
    img = cv2.imread(filepath)
    if img is None:
        return {"error": "Failed to read image file. Please ensure it is a valid image."}
        
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_array = np.expand_dims(img_resized, axis=0)
    # Model was trained with rescale=1./255, so we must match that.
    img_array = img_array.astype('float32') / 255.0

    # Predict
    preds = model.predict(img_array)
    class_idx = np.argmax(preds[0])
    class_name = classes[class_idx]
    confidence = float(preds[0][class_idx] * 100)

    # Heatmap
    heatmap = generate_gradcam(img_array, model)
    
    if heatmap is not None:
        # Overlay
        overlay = cv2.addWeighted(cv2.resize(img, (IMG_SIZE, IMG_SIZE)), 0.6, heatmap, 0.4, 0)
        
        # Save to heat map folder
        try:
            heatmap_filename = f"heatmap_{uuid.uuid4().hex}.jpg"
            heatmap_path = os.path.join(HEATMAP_FOLDER, heatmap_filename)
            cv2.imwrite(heatmap_path, cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
            print(f"Saved heatmap to {heatmap_path}")
        except Exception as e:
            print(f"Failed to save heatmap: {e}")

        _, buffer = cv2.imencode(".jpg", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        overlay_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode()
    else:
        overlay_b64 = None

    # Generate Description
    description = ""
    if "PNEUMONIA" in classes: # Heart Model
        if class_name == "PNEUMONIA":
            description = (f"The model has detected signs of Pneumonia with {confidence:.1f}% confidence.\n\n"
                           "â€¢ What the Heatmap Shows: The red and yellow areas indicate regions in the lungs "
                           "where the model identified patterns consistent with infection, such as opacities or fluid buildup.\n"
                           "â€¢ Recommendation: Clinical correlation is advised.")
        else:
            description = (f"The model indicates the chest X-ray appears Normal ({confidence:.1f}% confidence).\n\n"
                           "â€¢ What the Heatmap Shows: The highlighted areas represent the lung fields the model analyzed "
                           "to confirm the absence of pathological features.")
            
    elif "DR" in classes: # Diabetes Model
        if class_name == "DR":
            description = (f"The model has detected signs of Diabetic Retinopathy (DR) with {confidence:.1f}% confidence.\n\n"
                           "â€¢ What the Heatmap Shows: The heatmap highlights specific regions of the retina where the model "
                           "detected abnormalities such as microaneurysms, hemorrhages, or exudates.\n"
                           "â€¢ Recommendation: Consult an ophthalmologist for a comprehensive eye exam.")
        else:
            description = (f"The model indicates No Diabetic Retinopathy (No_DR) with {confidence:.1f}% confidence.\n\n"
                           "â€¢ What the Heatmap Shows: The model focused on the optic disc and blood vessels to verify "
                           "structural integrity and lack of lesions.")

    return {
        "class": class_name, 
        "confidence": confidence,
        "heatmap": overlay_b64,
        "description": description
    }

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    print("DEBUG: Analyze image request received")
    if 'image' not in request.files or 'model' not in request.form:
        print("DEBUG: Missing image or model")
        return jsonify({"error": "No image or model selected"}), 400

    file = request.files['image']
    model_name = request.form['model']
    print(f"DEBUG: Model: {model_name}, File: {file.filename}")
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        result = None
        if model_name.lower() == "heart":
            if heart_image_model:
                result = process_image_heatmap(filepath, heart_image_model, HEART_CLASSES)
            else:
                return jsonify({"error": "Heart model not loaded"}), 500
        elif model_name.lower() == "diabetes":
            if diabetes_image_model:
                result = process_image_heatmap(filepath, diabetes_image_model, DIABETES_CLASSES)
            else:
                return jsonify({"error": "Diabetes model not loaded"}), 500
        elif model_name.lower() == "kidney":
             return jsonify({"error": "Kidney model not available"}), 400
        else:
            return jsonify({"error": "Invalid model selected"}), 400

        if result and "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

# ======================================================
# VIRTUAL PATIENT ROUTES
# ======================================================
@app.route('/api/virtual/generate', methods=['GET'])
def generate_virtual_patient():
    try:
        simulation = simulate_virtual_patient()
        # Add full image URL
        if "patient" in simulation and "chest_xray" in simulation["patient"]:
            img_name = simulation["patient"]["chest_xray"]
            simulation["patient"]["image_url"] = f"http://127.0.0.1:5000/synthetic_images/{img_name}"
            
        return jsonify(simulation)
    except Exception as e:
        print(f"Error generating patient: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/synthetic_images/<path:filename>')
def serve_synthetic_image(filename):
    folder = os.path.join(app.root_path, 'virtual', 'synthetic_images')
    return send_from_directory(folder, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
