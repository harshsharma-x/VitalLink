'use client'

export default function Demo() {
  const expoUrl = "http://localhost:8081"

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Try VitalLink <span className="text-yellow-300">Demo</span>
          </h2>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Experience the complete emergency blood matching platform right now. 
            No sign-up required — just click and explore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Donor Demo Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🩸
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Donor Demo</h3>
              <p className="text-red-100 text-sm">
                See how donors receive emergency alerts, navigate to hospitals, 
                and complete life-saving donations.
              </p>
            </div>
            <ul className="space-y-3 text-red-100 text-sm mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full-screen critical alert notifications
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Live GPS navigation to hospital
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Donation history & tracking
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ML-based donor scoring & ranking
              </li>
            </ul>
            <a
              href={expoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-red-600 text-center py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-all transform hover:scale-[1.02]"
            >
              🩸 Try as Donor
            </a>
          </div>

          {/* Patient Demo Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🏥
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Patient Demo</h3>
              <p className="text-red-100 text-sm">
                Experience how patients raise emergency SOS requests, get matched 
                with donors instantly, and track their life-saving support.
              </p>
            </div>
            <ul className="space-y-3 text-red-100 text-sm mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                One-tap emergency SOS request
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instant ML-based donor matching
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Live donor tracking on map
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Blood bank & hospital locator
              </li>
            </ul>
            <a
              href={expoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-red-600 text-center py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-all transform hover:scale-[1.02]"
            >
              🏥 Try as Patient
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-red-100 text-sm">
            💡 No sign-up required. The demo automatically uses a dev account.
            {' '}Your app is running at <a href={expoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{expoUrl}</a>
          </p>
        </div>
      </div>
    </section>
  )
}
