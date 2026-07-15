'use client'

export default function Launch() {
  return (
    <section id="launch" className="py-20 bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Launch VitalLink and experience the future of emergency blood matching. 
            Connect with donors, save lives, and fight the blood black market.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="vitallink://" 
              className="bg-white text-red-600 px-10 py-5 rounded-full text-xl font-bold inline-flex items-center justify-center hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Launch VitalLink
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Free</div>
              <div className="text-red-100">No hidden charges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Secure</div>
              <div className="text-red-100">End-to-end encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Trusted</div>
              <div className="text-red-100">Verified donors only</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
