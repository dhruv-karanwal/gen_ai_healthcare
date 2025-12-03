import React, { useState } from 'react';

export default function ImageDiagnosis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [model, setModel] = useState('Heart');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Handle file selection
  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // Simulate prediction
  async function predict() {
    if (!file) return alert('Please upload an image first!');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('model', model);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          label: data.class,
          confidence: typeof data.confidence === 'number' ? data.confidence.toFixed(2) : data.confidence,
          heatmap: data.heatmap,
          description: data.description
        });
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Image Diagnosis</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <label className="block mb-2">Choose Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
        >
          <option>Heart</option>
          <option>Kidney</option>
          <option>Diabetes</option>
        </select>

        <div className="mt-4">
          <label className="block mb-2">Upload Image</label>
          <input type="file" accept="image/*" onChange={onFile} />
        </div>

        <div className="mt-4">
          <button
            onClick={predict}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
            }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Result section */}
      <div className="bg-white p-4 rounded shadow flex gap-6">
        {/* Image preview */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border rounded p-2">
          {result && result.heatmap ? (
            <img src={result.heatmap} alt="heatmap" className="max-h-60 rounded" />
          ) : preview ? (
            <img src={preview} alt="preview" className="max-h-60 rounded" />
          ) : (
            <div className="text-gray-500">No image uploaded</div>
          )}

          {loading && <div className="mt-3 text-gray-600">Processing...</div>}

          {result && (
            <div className="mt-3 px-3 py-1 rounded text-white font-medium text-center"
              style={{ backgroundColor: result.label === 'NORMAL' || result.label === 'No_DR' ? 'green' : 'red' }}>
              {result.label} — {result.confidence}%
            </div>
          )}
        </div>

        {/* Description area */}
        <div className="flex-1 border rounded p-3 flex flex-col">
          <h3 className="font-semibold mb-2">Description</h3>
          {result && result.description ? (
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {result.description}
            </div>
          ) : (
            <textarea
              placeholder="Analysis details will appear here..."
              className="w-full h-full p-2 border rounded resize-none bg-gray-50"
              readOnly
            />
          )}
        </div>
      </div>
    </div>
  );
}
