import React from 'react'
import { Link } from 'react-router-dom'

function Icon({ name, className = '' }) {
  const map = { home: '', chat: '', image: '', heart: '', dice: '', login: '🔐', moon: '', sun: '' }
  return <span className={className}>{map[name] || '•'}</span>
}

export default function Navbar({ user, onLogout, onToggleTheme, theme }) {
  return (
    <nav className="bg-white/90 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo + Branding */}
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-full bg-blue-600 text-white p-2 text-lg">AI</div>
            <div>
              <div className="font-semibold text-gray-800">AI Health Assistant</div>
              <div className="text-xs text-gray-500">Smart Diagnosis . Better Decisions . Healthier You</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="home" /> Home</Link>
            <Link to="/chat" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="chat" /> AI Assistant</Link>
            <Link to="/report-analysis" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="image" /> Report Analyzer</Link>
            <Link to="/image" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="image" /> Image Diagnosis</Link>
            <Link to="/predictions" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="heart" /> Predictions</Link>
            <Link to="/simulator" className="px-3 py-2 rounded hover:bg-gray-100"><Icon name="dice" /> Simulator</Link>
          </div>

          {/* Theme Toggle, Login/Logout */}
          <div className="flex items-center gap-3">
            <button onClick={onToggleTheme} className="p-2 rounded hover:bg-gray-100">
              {theme === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">{user.name}</div>
                <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2">
                <Icon name="login" /> Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
