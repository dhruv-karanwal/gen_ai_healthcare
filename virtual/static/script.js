document.getElementById("generate-btn").addEventListener("click", () => {
    fetch("/generate_patient")
        .then(response => response.json())
        .then(data => {
            document.getElementById("patient-info").classList.remove("hidden");

            // Display patient details
            const patientTable = document.querySelector("#patient-table tbody");
            patientTable.innerHTML = ""; // clear previous
            const patient = data.patient;
            for (let key in patient.demographics) {
                const row = document.createElement("tr");
                row.innerHTML = `<th>${key}</th><td>${patient.demographics[key]}</td>`;
                patientTable.appendChild(row);
            }
            // Symptoms
            const symptomRow = document.createElement("tr");
            symptomRow.innerHTML = `<th>symptoms</th><td>${patient.symptoms.join(", ")}</td>`;
            patientTable.appendChild(symptomRow);

            // Vitals
            for (let key in patient.vitals) {
                const row = document.createElement("tr");
                row.innerHTML = `<th>${key}</th><td>${patient.vitals[key]}</td>`;
                patientTable.appendChild(row);
            }

            // Lab values
            for (let key in patient.lab_values) {
                const row = document.createElement("tr");
                row.innerHTML = `<th>${key}</th><td>${patient.lab_values[key]}</td>`;
                patientTable.appendChild(row);
            }

            // Risk factors
            for (let key in patient.risk_factors) {
                const row = document.createElement("tr");
                row.innerHTML = `<th>${key}</th><td>${patient.risk_factors[key]}</td>`;
                patientTable.appendChild(row);
            }

            // Display predictions vs ground truth
            const predictionTable = document.querySelector("#prediction-table tbody");
            predictionTable.innerHTML = ""; // clear previous
            const predictions = data.predictions.results;
            const correctness = data.correctness;
            for (let disease in predictions) {
                const row = document.createElement("tr");
                const correctClass = correctness[disease] ? "correct" : "incorrect";
                row.className = correctClass;
                row.innerHTML = `
                    <td>${disease}</td>
                    <td>${predictions[disease].pred_label}</td>
                    <td>${patient.ground_truth_diagnosis === disease ? 1 : 0}</td>
                    <td>${correctness[disease]}</td>
                `;
                predictionTable.appendChild(row);
            }

            // Display synthetic image
            const img = document.getElementById("patient-image");
            img.src = patient.synthetic_image_path;
        });
});
