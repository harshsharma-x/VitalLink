'use client'

export default function Download() {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Download VitalLink today and join our network of life-savers. 
            Whether you need blood or want to donate, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#" className="bg-white text-red-600 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center hover:bg-red-50 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.14 4.45-3.74 4.25z"/>
              </svg>
              Download for iOS
            </a>
            <a href="#" className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center hover:bg-gray-800 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.74c.18.12.37.18.56.18.19 0 .38-.06.54-.18l11.04-6.36-2.78-2.78L3.18 23.74zM2.28 21.78L13.54 12 2.28 2.22c-.18.36-.28.78-.28 1.22v17.12c0 .44.1.86.28 1.22zM14.52 12l2.78-2.78 2.78 2.78-2.78 2.78L14.52 12zM3.18.26c-.36.18-.56.54-.56.94v15.6l11.04 6.36L3.18.26z"/>
              </svg>
              Download for Android
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
