import requests
import json
from medical_chatbot import API_KEY

MODEL = "gemini-2.5-flash"
BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

def reconstruct_layout_from_doctr(doc):
    """
    Reconstructs text from a Doctr Document object.
    """
    full_text = ""
    for page in doc.pages:
        for block in page.blocks:
            for line in block.lines:
                line_text = " ".join([word.value for word in line.words])
                full_text += line_text + "\n"
            full_text += "\n"
    return full_text

def analyze_medical_report(text):
    """
    Analyzes the extracted text using Gemini to extract structured medical data.
    """
    
    system_prompt = """
You are an AI Medical Report Analyzer.  
Your job is to extract structured information from medical reports, prescriptions, lab test results, or doctor notes.

You MUST return results in a clean structured JSON format.

────────────────────────────────────
🧾 REQUIRED ENTITIES TO EXTRACT
────────────────────────────────────

1. Patient Details:
   - patient_name
   - age
   - gender
   - patient_id
   - collection_date
   - report_date

2. Test Information:
   - test_name (CBC, LFT, KFT, Lipid Profile, etc.)
   - test_category (Blood test, Urine test, Imaging, etc.)
   - laboratory_name
   - referring_doctor

3. Test Results:
   For every test parameter, extract:
   - parameter_name
   - value
   - unit
   - reference_range
   - status (Low / Normal / High / Critical)

   Example:
   {
     "parameter_name": "Hemoglobin",
     "value": 10.2,
     "unit": "g/dL",
     "reference_range": "12–16 g/dL",
     "status": "Low"
   }

4. Key Medical Indicators (if present):
   - RBC count
   - WBC count
   - Platelets
   - Hemoglobin
   - Creatinine
   - Urea
   - Bilirubin (Total/Direct/Indirect)
   - SGOT / SGPT
   - LDL / HDL / Total Cholesterol
   - Triglycerides
   - Blood Glucose (Fasting/PP/RBS)
   - TSH / T3 / T4
   - Vitamin D / Vitamin B12
   - HbA1c

5. Summary:
   - abnormalities_detected (list)
   - tests_out_of_range (list of parameter names)
   - possible_conditions (based on abnormal values)
   - severity_level (Mild / Moderate / Severe / Critical)

6. Doctor Instruction Section:
   - prescribed_tests
   - clinical_notes
   - doctor_comments
   - medication_names (extract only names, not dosage)
   - follow_up_recommendation

────────────────────────────────────
⚠️ STRICT SAFETY RULES
────────────────────────────────────
- DO NOT prescribe medications.
- DO NOT give dosage instructions.
- DO NOT give treatment steps.
- Only give general health insights and possible reasons.
- If any value appears critical, recommend visiting a doctor.

────────────────────────────────────
🧠 OUTPUT FORMAT (MANDATORY)
────────────────────────────────────
Return result ONLY in this JSON format:

{
  "patient_details": {},
  "test_info": {},
  "results": [],
  "key_indicators": {},
  "summary": {},
  "doctor_section": {}
}
"""

    prompt = f"{system_prompt}\n\n────────────────────────────────────\n🔍 INPUT\nHere is the extracted OCR text from the report:\n{text}"

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    try:
        response = requests.post(
            BASE_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )

        if response.status_code == 200:
            data = response.json()
            # Extract JSON from the response text
            result_text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean up potential markdown code blocks if present (though response_mime_type should handle it)
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            return json.loads(result_text)
        else:
            return {"error": f"API Error {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": f"Exception: {str(e)}"}
