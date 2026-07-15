'use client'

const features = [
  {
    icon: '⚡',
    title: 'Instant ML Matching',
    description: 'GradientBoosting + Random Forest algorithms match patients with compatible donors in seconds, ranking by blood type, distance, and reliability.',
    color: 'from-yellow-400 to-orange-500',
    tag: 'Machine Learning'
  },
  {
    icon: '🛡️',
    title: 'Anti-Corruption System',
    description: 'Hash chain auditing, Isolation Forest pattern detection, and ABHA ID deduplication prevent blood black market exploitation.',
    color: 'from-blue-400 to-indigo-500',
    tag: 'Security'
  },
  {
    icon: '📍',
    title: 'Live GPS Tracking',
    description: 'Real-time donor location tracking via Redis-cached GPS data with 5-minute TTL, plus navigation integration.',
    color: 'from-green-400 to-emerald-500',
    tag: 'Real-time'
  },
  {
    icon: '🔐',
    title: 'Multi-Auth System',
    description: 'Google OAuth, phone OTP verification, Firebase Phone Auth, and ABHA ID integration for complete identity verification.',
    color: 'from-purple-400 to-pink-500',
    tag: 'Authentication'
  },
  {
    icon: '🏥',
    title: 'Google Places Integration',
    description: 'Real hospital and blood bank data sourced from Google Places API, with 2,566 verified locations across India.',
    color: 'from-red-400 to-rose-500',
    tag: 'Data'
  },
  {
    icon: '📊',
    title: 'Predictive Analytics',
    description: 'ML models predict donor acceptance probability (87% accuracy) and compatibility scoring using 50,000+ synthetic training samples.',
    color: 'from-cyan-400 to-blue-500',
    tag: 'Analytics'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Key <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete emergency blood matching system with ML-powered matching, 
            anti-corruption measures, and real-time tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl card-shadow hover:card-shadow transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
