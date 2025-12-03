# Gen AI Healthcare Project

This project is a comprehensive AI-powered healthcare assistant that combines **OCR (Optical Character Recognition)**, **LLMs (Large Language Models)**, and **Machine Learning** to provide smart diagnostics, medical insights, and educational simulations.

## Features

### 1. Virtual Patient Simulator 🫀 (NEW!)
- **Synthetic Patient Generation**: Generates realistic virtual patient profiles including:
    - **Demographics**: Age, Gender, BMI.
    - **Clinical History**: Symptoms, Risk Factors (Smoking, Hypertension, etc.).
    - **Vitals**: Blood Pressure, Heart Rate, Temperature.
    - **Lab Results**: Glucose, Creatinine, HbA1c, Cholesterol, etc.
- **Interactive Simulation**:
    - **Predict Risk**: Seamlessly transfer the virtual patient's data to the disease prediction models to assess risk.
    - **Chat with Bot**: Discuss the virtual patient's case with the AI chatbot for analysis and recommendations.

### 2. Medical Report Analyzer 📄
- **OCR Technology**: Uses `doctr` (Document Text Recognition) to extract text from medical reports (Images & PDFs).
- **AI Analysis**: Powered by **Google Gemini 2.5 Flash**, it analyzes extracted text to provide:
    - **Patient Details**
    - **Test Results Table**
    - **Medical Summary**
    - **Doctor's Notes & Recommendations**
- **PDF Support**: Automatically handles PDF files using `pypdfium2`.

### 3. AI Health Chatbot 🤖
- A conversational AI assistant integrated with Google Gemini.
- Provides general medical advice and answers health-related queries.
- Features formatted responses (bullet points, bold text) for better readability.

### 4. Disease Prediction Models 🔮
Predicts the risk of specific diseases based on user input parameters, providing **detailed medical explanations** for the results.

- **Diabetes Prediction**: Analyzes Glucose, BMI, HbA1c, etc.
- **Heart Failure Prediction**: Analyzes Ejection Fraction, Creatinine, Sodium, etc.
- **Chronic Kidney Disease (CKD)**: Analyzes Blood Pressure, Specific Gravity, Hemoglobin, etc.

*All models return a confidence score and a list of medical reasons contributing to the prediction.*

### 5. User Authentication 🔐
- Secure Login and Signup functionality using **Supabase Auth**.
- Persistent user sessions.

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js & npm
- Git

### Backend Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dhruv-karanwal/gen_ai_healthcare.git
    cd gen_ai_healthcare
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables:**
    Ensure you have your API keys set up (Google Gemini API Key, Supabase URL/Key) in a `.env` file or environment variables.

4.  **Run the Backend Server:**
    ```bash
    python app.py
    ```
    The server runs on `http://localhost:5000`.

### Frontend Setup
1.  **Navigate to Frontend directory:**
    ```bash
    cd Frontend
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Usage Guide

1.  **Login/Signup**: Create an account to access the dashboard.
2.  **Virtual Simulator**:
    - Click **"Generate New Patient"** to create a unique medical case.
    - Use **"Predict Risk"** to auto-fill the prediction form with the patient's data.
    - Use **"Discuss with Chatbot"** to analyze the case with AI.
3.  **Assistant (Chat & Analysis)**:
    - **Chat**: Type health questions to get AI responses.
    - **Report Analysis**: Upload a PDF/Image report or paste text to get a structured summary.
4.  **Predictions**:
    - Select a disease model (Diabetes, Heart, Kidney).
    - Enter the required medical parameters (or use the Simulator to fill them).
    - View the **Risk Level**, **Confidence Score**, and **Medical Explanations**.

---

## Tech Stack
- **Backend**: Flask, Python, Doctr (OCR), Google Gemini (LLM), XGBoost/Scikit-learn (ML Models).
- **Frontend**: React, Vite, TailwindCSS, Supabase (Auth).
- **Database**: Supabase (PostgreSQL).