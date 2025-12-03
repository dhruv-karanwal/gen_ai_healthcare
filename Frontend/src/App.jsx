import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MedicalChat from './pages/MedicalChat'
import ReportAnalyzer from './pages/ReportAnalyzer'
import ImageDiagnosis from './pages/ImageDiagnosis'
import Predictions from './pages/Predictions'
import Simulator from './pages/Simulator'
import Login from './pages/Login'



export default function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Auth logic removed


  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
        <Navbar
          user={null}
          onLogout={() => { }}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          theme={theme}
        />

        <main className="py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Separated Chat and Report Analyzer */}
            <Route path="/chat" element={<MedicalChat />} />
            <Route path="/report-analysis" element={<ReportAnalyzer />} />

            <Route path="/image" element={<ImageDiagnosis />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}
