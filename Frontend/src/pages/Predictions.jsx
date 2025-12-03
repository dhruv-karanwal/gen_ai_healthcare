/* File: src/pages/Predictions.jsx */
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';

export default function Predictions() {
    const [model, setModel] = useState('diabetes'); // diabetes, heart, kidney
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    // Initial states for each model
    const initialStates = {
        diabetes: { gender: '0', age: '', hypertension: '0', heart_disease: '0', smoking: '0', bmi: '', hba1c: '', glucose: '' },
        heart: { age: '', anaemia: '0', cpk: '', diabetes: '0', ef: '', hbp: '0', platelets: '', creatinine: '', sodium: '', sex: '0', smoking: '0', time: '' },
        kidney: { age: '', bp: '', sg: '', al: '', su: '', rbc: '', pc: '', pcc: '', ba: '', bgr: '', bu: '', sc: '', sod: '', pot: '', hemo: '', pcv: '', wc: '', rc: '', htn: '', dm: '', cad: '', appet: '', pe: '', ane: '' }
    };

    const [form, setForm] = useState(initialStates.diabetes);

    // Handle incoming state from Simulator
    useEffect(() => {
        if (location.state) {
            const { targetModel, formData } = location.state;
            if (targetModel && initialStates[targetModel]) {
                setModel(targetModel);
                // Merge incoming data with initial state to ensure all fields exist
                setForm(prev => ({
                    ...initialStates[targetModel],
                    ...formData
                }));
            }
        }
    }, [location.state]);

    // Update form when model changes
    function handleModelChange(e) {
        const newModel = e.target.value;
        setModel(newModel);
        setForm(initialStates[newModel]);
        setResult(null);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function predict() {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/predict/${model}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                setResult(data);
            }
        } catch (error) {
            console.error("Prediction error:", error);
            alert("Failed to get prediction.");
        } finally {
            setLoading(false);
        }
    }

    // Render form fields based on model
    const renderFields = () => {
        switch (model) {
            case 'diabetes':
                return (
                    <>
                        <div className="col-span-1"><label className="block text-sm font-medium">Gender</label><select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">Male</option><option value="1">Female</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Age</label><input type="number" name="age" value={form.age} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Hypertension</label><select name="hypertension" value={form.hypertension} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Heart Disease</label><select name="heart_disease" value={form.heart_disease} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Smoking History</label><select name="smoking" value={form.smoking} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">Never</option><option value="1">Current</option><option value="2">Former</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">BMI</label><input type="number" name="bmi" value={form.bmi} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">HbA1c Level</label><input type="number" name="hba1c" value={form.hba1c} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Blood Glucose Level</label><input type="number" name="glucose" value={form.glucose} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    </>
                );
            case 'heart':
                return (
                    <>
                        <div className="col-span-1"><label className="block text-sm font-medium">Age</label><input type="number" name="age" value={form.age} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Anaemia</label><select name="anaemia" value={form.anaemia} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">CPK (mcg/L)</label><input type="number" name="cpk" value={form.cpk} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Diabetes</label><select name="diabetes" value={form.diabetes} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Ejection Fraction (%)</label><input type="number" name="ef" value={form.ef} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">High Blood Pressure</label><select name="hbp" value={form.hbp} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Platelets</label><input type="number" name="platelets" value={form.platelets} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Serum Creatinine</label><input type="number" name="creatinine" value={form.creatinine} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Serum Sodium</label><input type="number" name="sodium" value={form.sodium} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Sex</label><select name="sex" value={form.sex} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">Female</option><option value="1">Male</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Smoking</label><select name="smoking" value={form.smoking} onChange={handleChange} className="w-full p-2 border rounded"><option value="0">No</option><option value="1">Yes</option></select></div>
                        <div className="col-span-1"><label className="block text-sm font-medium">Time (Follow-up days)</label><input type="number" name="time" value={form.time} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    </>
                );
            case 'kidney':
                // Displaying a subset of key fields for brevity, or full list if needed. Let's do a grid of inputs.
                // Keys: age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane
                return Object.keys(initialStates.kidney).map(key => (
                    <div key={key} className="col-span-1">
                        <label className="block text-sm font-medium uppercase">{key}</label>
                        <input type="text" name={key} value={form[key]} onChange={handleChange} className="w-full p-2 border rounded" placeholder={key} />
                    </div>
                ));
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Disease Prediction System</h2>

            <div className="bg-white p-6 rounded-lg shadow-lg">

                {/* Model Selector */}
                <div className="mb-6">
                    <label className="block text-lg font-medium mb-2">Select Disease Model</label>
                    <select
                        value={model}
                        onChange={handleModelChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="diabetes">Diabetes Prediction</option>
                        <option value="heart">Heart Failure Prediction</option>
                        <option value="kidney">Chronic Kidney Disease Prediction</option>
                    </select>
                </div>

                {/* Dynamic Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {renderFields()}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={predict}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Predict Risk'}
                    </button>
                    <button
                        onClick={() => { setForm(initialStates[model]); setResult(null); }}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Reset
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className={`mt-8 p-6 rounded-lg border-l-8 ${result.prediction.includes('NO') || result.prediction === 'LOW RISK' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                        }`}>
                        <h3 className="text-2xl font-bold mb-2">{result.prediction}</h3>
                        <div className="flex items-center gap-4">
                            <div className="text-lg">Confidence: <span className="font-bold">{result.confidence.toFixed(2)}%</span></div>
                            {result.risk_score && <div className="text-lg">Risk Score: <span className="font-bold">{result.risk_score.toFixed(2)}</span></div>}
                        </div>
                        <p className="mt-2 text-gray-600">
                            {result.prediction.includes('NO') || result.prediction === 'LOW RISK'
                                ? "Great news! The model predicts a low probability of this condition."
                                : "The model indicates a potential risk. Please consult a healthcare professional for further diagnosis."}
                        </p>

                        {/* Medical Reasons */}
                        {result.reasons && result.reasons.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-bold text-lg mb-2">Medical Reasons & Explanation:</h4>
                                <ul className="list-none space-y-1">
                                    {result.reasons.map((reason, index) => (
                                        <li key={index} className="text-gray-800 font-medium">
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}