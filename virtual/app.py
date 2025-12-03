from flask import Flask, render_template, jsonify, send_from_directory
import traceback
from virtual_patient_engine import simulate_virtual_patient
import os

app = Flask(__name__)
app.config["DEBUG"] = True

# Serve synthetic images from virtual/synthetic_images
@app.route('/synthetic_images/<path:filename>')
def synthetic_images(filename):
    # Folder path relative to app.py
    folder = os.path.join(app.root_path, 'virtual', 'synthetic_images')
    return send_from_directory(folder, filename)

@app.route("/")
def index():
    return render_template("virtual_patient.html")

@app.route("/generate_patient", methods=["GET"])
def generate_patient():
    try:
        simulation = simulate_virtual_patient()
        return jsonify(simulation)

    except Exception as e:
        tb = traceback.format_exc()
        print("Error generating patient:\n", tb)
        return jsonify({"error": str(e), "traceback": tb}), 500

if __name__ == "__main__":
    app.run(debug=True)
