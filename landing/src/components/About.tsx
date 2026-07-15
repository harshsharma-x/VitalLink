'use client'

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              About <span className="gradient-text">VitalLink</span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                VitalLink is an emergency blood matching platform designed for the Indian 
                healthcare market. It connects patients in urgent need of blood with verified 
                donors in under 10 minutes.
              </p>
              <p>
                Built as a university project at Chandigarh University, VitalLink tackles 
                the real-world problem of emergency blood access in India, where people 
                currently wait 2-4 hours and the black market charges Rs. 4,000-8,000 per unit.
              </p>
              <p>
                The platform uses machine learning to rank donors by compatibility, distance, 
                and reliability, while anti-corruption features prevent exploitation of the 
                blood supply chain.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">Phase 0-1</div>
                <div className="text-sm text-gray-600">Current Status</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">MCA Project</div>
                <div className="text-sm text-gray-600">Chandigarh University</div>
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
              {/* Phone mockup */}
              <div className="bg-gray-900 rounded-[2.5rem] p-4 mx-auto max-w-[280px] shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-red-500 h-28 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">VitalLink</div>
                      <div className="text-red-100 text-sm">Emergency Blood Matching</div>
                    </div>
                  </div>
                  
                  {/* App content mockup */}
                  <div className="p-4 space-y-3">
                    <div className="bg-red-50 rounded-xl p-3 flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 mr-3">🩸</div>
                      <div>
                        <div className="font-semibold text-sm">Blood Request</div>
                        <div className="text-xs text-gray-500">O+ needed urgently</div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-3">✓</div>
                      <div>
                        <div className="font-semibold text-sm">Donor Matched</div>
                        <div className="text-xs text-gray-500">2.3 km away</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">📍</div>
                      <div>
                        <div className="font-semibold text-sm">Live Tracking</div>
                        <div className="text-xs text-gray-500">ETA: 8 minutes</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mr-3">📊</div>
                      <div>
                        <div className="font-semibold text-sm">ML Score: 94%</div>
                        <div className="text-xs text-gray-500">High compatibility</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
