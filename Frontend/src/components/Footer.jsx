import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 border-t py-6 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto px-4">
        AI Health Assistant 
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-2">
        {new Date().getFullYear()}
      </div>
    </footer>
  )
}
