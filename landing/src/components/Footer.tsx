'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold">VitalLink</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Emergency blood matching platform connecting patients with verified donors 
              in under 10 minutes. Built with ML, anti-corruption features, and real-time tracking.
            </p>
            <div className="text-sm text-gray-500">
              <p>MCA Project — Chandigarh University</p>
              <p>Developed by Harsh Sharma</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sections</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#impact" className="text-gray-400 hover:text-white transition-colors">Impact</a></li>
              <li><a href="#future" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#tech" className="text-gray-400 hover:text-white transition-colors">Tech Stack</a></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/harshsharma-x/VitalLink" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub Repo</a></li>
              <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors">Try Demo</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} VitalLink. All rights reserved. Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  )
}
