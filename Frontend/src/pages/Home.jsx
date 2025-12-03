import React from 'react';
import { Link } from 'react-router-dom';

function Card({ title, image, description }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-5 hover:shadow-xl transition text-center">
      <img src={image} alt={title} className="w-24 h-24 mx-auto mb-4 object-cover rounded-full" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/2966/2966484.png" 
            alt="logo" 
            className="w-12 h-12"
          />
          AI Health Assistant
        </h1>
        <p className="text-gray-600 mt-2 text-lg">"Smart Diagnosis . Better Decisions . Healthier You"</p>
      </section>

      {/* Background Section */}
      <div
        className="bg-cover bg-center py-20"
        style={{
          backgroundImage: "url('src/assets/images/netetet.jpg')",
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm py-16">

          {/* Description Section */}
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Smart AI-Powered Healthcare
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
<p>Your personal AI-powered healthcare companion that understands symptoms, analyzes medical reports, guides diagnoses, and helps monitor chronic health conditions.
Whether it's early detection, disease prediction, or health guidance, this AI system uses advanced machine learning to provide accurate, quick, and intelligent medical support—anytime, anywhere.
</p>
<p> Healthcare made simple, smart, and accessible for everyone.</p>
            </p>
          </div>

          {/* Feature Cards */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6 mt-10">

            <Card
              title="AI Assistant "
              image="https://cdn-icons-png.flaticon.com/512/4712/4712105.png"
              description="Ask health-related questions and get instant AI guidance."
            />

            <Card
              title="Image Diagnosis"
              image="src/assets/images/dia.png"
              description="Upload X-rays, kidney scans, or heart images for AI-based medical analysis."
            />

            <Card
              title="Health Predictions"
              image="src/assets/images/pred1.jpg"
              description="Get AI-based risk scores for diabetes, heart disease, and more."
            />

          </div>

        </div>
      </div>

       {/* About Section */}
      <section className="bg-white/80 backdrop-blur-sm py-16 mt-10 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">About Us</h2>
        <p className="text-gray-700 max-w-4xl mx-auto">
          We are dedicated to making healthcare smart, accessible, and affordable using advanced AI technologies.
          Our platform bridges the gap between patients and medical intelligence, enabling early detection, personalized
          health advice, and AI-assisted diagnosis — anywhere, anytime.
        </p>
      </section>

      {/* Contact Section */}
      <section className="bg-white/80 backdrop-blur-sm py-16 mt-10 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Contact Us</h2>
        <p className="text-gray-700 max-w-xl mx-auto">
          Have questions, suggestions, or want to collaborate?
          <p>📧 Email: support.aihealth@gmail.com </p>
          <p>📞 Phone: +91-9876543210</p>

      

          
          <br />
          
          <br />
          
        </p>
      </section>

      {/* Reach Us */}
      <section className="bg-gray-800 text-white py-14 text-center rounded-lg shadow-md mt-10">
        <h2 className="text-3xl font-bold mb-4">Reach Us</h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          📍 AI Health Solutions, Pune, Maharashtra, India🚀 <br />
          Empowering Smarter Healthcare with Artificial Intelligence  
        </p>
      </section>

    </div>
  );
}