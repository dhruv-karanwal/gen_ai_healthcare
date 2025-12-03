import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Simulator() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function generate() {
    setLoading(true);
    setPatient(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/virtual/generate');
      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        // Map backend structure to frontend convenience
        const p = data.patient;
        const demographics = p.demographics || {};
        const vitals = p.vitals || {};
        const labs = p.lab_values || {};

        // Generate a random name since backend doesn't provide one
        const names = ['Alex', 'Priya', 'Rahul', 'Sana', 'Maya', 'Omar', 'John', 'Sarah'];
        const randomName = names[Math.floor(Math.random() * names.length)];

        // Determine diagnosis from ground_truth dictionary
        let diagnosis = "Unknown";
        if (p.ground_truth_diagnosis) {
          diagnosis = JSON.stringify(p.ground_truth_diagnosis);
        }

        const mappedPatient = {
          patient_name: randomName,
          patient_id: p.patient_id,
          age: demographics.age,
          gender: demographics.gender,
          symptoms: p.symptoms || [],
          conditions: Object.keys(p.risk_factors || {}).filter(k => p.risk_factors[k]),
          vitals: {
            bp: `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`,
            hr: vitals.heart_rate
          },
          labs: {
            glucose: labs.blood_glucose || labs.glucose || 'N/A',
            creatinine: labs.creatinine || 'N/A',
            hbA1c: labs.hbA1c,
            urea: labs.urea,
            cholesterol: labs.cholesterol
          },
          demographics: demographics, // Keep raw for detailed mapping
          image_url: p.image_url,
          diagnosis: diagnosis
        };

        setPatient(mappedPatient);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate patient");
    } finally {
      setLoading(false);
    }
  }

  function handleSendToChatbot() {
    if (!patient) return;
    const context = `I have a patient case:
Name: ${patient.patient_name}
Age: ${patient.age}
Gender: ${patient.gender}
Symptoms: ${patient.symptoms.join(', ')}
Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}
Labs: Glucose ${patient.labs.glucose}, Creatinine ${patient.labs.creatinine}
Risk Factors: ${patient.conditions.join(', ')}

Please analyze this case.`;

    navigate('/chat', { state: { message: context } });
  }

  function handlePredictRisk() {
    if (!patient) return;

    // Determine the most likely model based on diagnosis
    let targetModel = 'diabetes'; // Always default to diabetes as requested
    // if (patient.diagnosis && patient.diagnosis.includes('heart')) targetModel = 'heart';
    // if (patient.diagnosis && patient.diagnosis.includes('kidney')) targetModel = 'kidney';

    // Map data to the specific field names expected by Predictions.jsx
    const formData = {
      // Common
      age: patient.age,

      // Diabetes
      gender: patient.gender === 'male' ? '0' : '1', // Diabetes: 0=Male, 1=Female
      bmi: patient.demographics?.bmi || '',
      hba1c: patient.labs.hbA1c || '',
      glucose: patient.labs.glucose || '',
      // Infer Hypertension from BP (Systolic > 140 or Diastolic > 90)
      hypertension: (parseInt(patient.vitals.bp.split('/')[0]) > 140 || parseInt(patient.vitals.bp.split('/')[1]) > 90) ? '1' : '0',
      // Infer Heart Disease from Diagnosis or History
      heart_disease: (patient.diagnosis.includes('heart') || patient.conditions.includes('heart_disease')) ? '1' : '0',
      smoking: patient.conditions.includes('smoking') ? '1' : '0',

      // Heart (Note: Sex mapping is opposite in some datasets, checking Predictions.jsx usually clarifies)
      // Predictions.jsx Heart: 0=Female, 1=Male
      sex: patient.gender === 'male' ? '1' : '0',
      cpk: '',
      anaemia: '0',
      diabetes: patient.conditions.includes('diabetes') ? '1' : '0',
      hbp: patient.vitals.bp.split('/')[0] > 140 ? '1' : '0',
      platelets: '',
      creatinine: patient.labs.creatinine || '',
      sodium: '',
      ef: '',
      time: '',

      // Kidney
      bp: patient.vitals.bp.split('/')[0],
      sg: '',
      al: '',
      su: '',
      bgr: patient.labs.glucose || '',
      bu: patient.labs.urea || '',
      sc: patient.labs.creatinine || '',
      sod: '',
      pot: '',
      hemo: '',
      pcv: '',
      wc: '',
      rc: '',
      htn: patient.vitals.bp.split('/')[0] > 140 ? 'yes' : 'no',
      dm: patient.conditions.includes('diabetes') ? 'yes' : 'no',
      cad: patient.conditions.includes('heart_disease') ? 'yes' : 'no',
      appet: 'good',
      pe: 'no',
      ane: 'no'
    };

    navigate('/predictions', { state: { targetModel, formData } });
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Virtual Patient Simulator</h2>

      <div className="mb-6">
        <button
          onClick={generate}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating Patient...' : 'Generate New Patient'}
        </button>
      </div>

      {patient ? (
        <div className="bg-white p-6 rounded shadow-lg border border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{patient.patient_name}</h3>
              <div className="text-gray-600">
                {patient.age} years • {patient.gender} • ID: {patient.patient_id.substring(0, 8)}...
              </div>
              {/* Diagnosis might be complex object, simplifying display */}
              <div className="mt-2 text-xs text-gray-500">
                Diagnosis Data: {patient.diagnosis}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={handleSendToChatbot} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 text-sm">
                💬 Discuss with Chatbot
              </button>
              <button onClick={handlePredictRisk} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 text-sm">
                📊 Predict Risk
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            {/* Left Column: Medical Info (Now Full Width) */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Clinical History</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {patient.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Risk Factors:</span> {patient.conditions.join(', ') || "None"}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Vitals & Labs</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Blood Pressure</div>
                    <div className="font-medium">{patient.vitals.bp}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Heart Rate</div>
                    <div className="font-medium">{patient.vitals.hr} bpm</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Glucose</div>
                    <div className="font-medium">{patient.labs.glucose} mg/dL</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Creatinine</div>
                    <div className="font-medium">{patient.labs.creatinine} mg/dL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500">
          Click "Generate New Patient" to start a simulation.
        </div>
      )}
    </div>
  );
}