import React, { useState } from 'react';
import { Upload, FileText, Activity, AlertCircle, X } from 'lucide-react';

export default function MedicalAssistant() {
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setTextInput(''); // Clear text if file is selected
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file && !textInput.trim()) {
            setError("Please upload a file or paste report text.");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            let res;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                res = await fetch('http://127.0.0.1:5000/api/ocr', {
                    method: 'POST',
                    body: formData
                });
            } else {
                res = await fetch('http://127.0.0.1:5000/api/ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput })
                });
            }

            const result = await res.json();
            if (result.error) {
                throw new Error(result.error);
            }

            // The backend returns { text: "...", analysis: { ...JSON... } }
            let analysisData = result.analysis;

            // Ensure analysisData is an object (in case it came back as a string)
            if (typeof analysisData === 'string') {
                try {
                    analysisData = JSON.parse(analysisData);
                } catch (e) {
                    console.error("Parsing error", e);
                }
            }

            setData(analysisData);

        } catch (err) {
            setError(err.message || "Failed to analyze report.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setTextInput('');
        setData(null);
        setError(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: INPUT */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Upload PDF/Image Report</h2>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                        {file && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                <FileText size={16} />
                                <span className="truncate">{file.name}</span>
                                <button onClick={() => setFile(null)} className="ml-auto hover:text-red-500"><X size={16} /></button>
                            </div>
                        )}
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Text Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paste Report Text</label>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Paste medical report text here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={!!file}
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || (!file && !textInput)}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                        >
                            {loading ? <Activity className="animate-spin" /> : 'Extract & Analyze'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: RESULTS */}
                <div className="space-y-6">
                    {data ? (
                        <>
                            {/* Patient Details Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 rounded text-blue-600"><Activity size={18} /></div>
                                    Patient Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium">{data.patient_details?.patient_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Age/Gender</p>
                                        <p className="font-medium">{data.patient_details?.age || '-'} / {data.patient_details?.gender || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date</p>
                                        <p className="font-medium">{data.patient_details?.report_date || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">ID</p>
                                        <p className="font-medium">{data.patient_details?.patient_id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    Summary ({data.summary?.severity_level || 'Unknown'})
                                </h3>
                                <ul className="space-y-2 text-sm text-orange-900">
                                    {data.summary?.abnormalities_detected?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                    {data.summary?.possible_conditions?.map((cond, idx) => (
                                        <li key={`cond-${idx}`} className="flex items-start gap-2 font-medium">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                            Possible: {cond}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Test Results Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-bold text-gray-800">Test Results</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">Test</th>
                                                <th className="px-6 py-3">Value</th>
                                                <th className="px-6 py-3">Ref Range</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.results?.map((row, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{row.parameter_name}</td>
                                                    <td className="px-6 py-4">{row.value} {row.unit}</td>
                                                    <td className="px-6 py-4 text-gray-500">{row.reference_range}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status?.toLowerCase().includes('high') || row.status?.toLowerCase().includes('low') || row.status?.toLowerCase().includes('critical')
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-xl">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p>Analysis results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
