'use client'

import { useState, useEffect } from 'react'

export default function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">VitalLink</span>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-red-600 transition-colors">About</a>
              <a href="#features" className="text-gray-600 hover:text-red-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-red-600 transition-colors">How It Works</a>
              <a href="#impact" className="text-gray-600 hover:text-red-600 transition-colors">Impact</a>
              <a href="#tech" className="text-gray-600 hover:text-red-600 transition-colors">Tech Stack</a>
              <a href="#launch" className="btn-primary text-white px-6 py-2 rounded-full font-medium">Launch App</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-red-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-red-600">About</a>
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-red-600">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-red-600">How It Works</a>
              <a href="#impact" className="block px-3 py-2 text-gray-600 hover:text-red-600">Impact</a>
              <a href="#tech" className="block px-3 py-2 text-gray-600 hover:text-red-600">Tech Stack</a>
              <a href="#launch" className="block px-3 py-2 btn-primary text-white rounded-lg text-center">Launch App</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-red-700 text-sm font-medium">Emergency Blood Matching Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Save Lives in{' '}
              <span className="gradient-text">Under 10 Minutes</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              An ML-powered platform that connects patients in urgent need of blood 
              with verified donors instantly. Built to fight the blood black market 
              and make emergency blood accessible to everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#launch" className="btn-primary text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Launch App
              </a>
              <a href="#about" className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center hover:border-red-500 hover:text-red-600 transition-all">
                Learn More
              </a>
            </div>

            <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>React Native + Expo</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>FastAPI + ML Backend</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Built in India</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
