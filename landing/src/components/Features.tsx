'use client'

const features = [
  {
    icon: '⚡',
    title: 'Instant Matching',
    description: 'Our ML algorithm matches patients with the perfect donor in seconds, not hours.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: '🛡️',
    title: 'Anti-Corruption',
    description: 'Hash chain auditing and pattern detection prevent blood black market exploitation.',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    icon: '📍',
    title: 'Live Tracking',
    description: 'Real-time GPS tracking of donors as they navigate to the hospital.',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: '🔐',
    title: 'Verified Donors',
    description: 'Every donor is verified with phone OTP and ABHA ID for complete trust.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: '🏥',
    title: 'Real Hospital Data',
    description: 'Integration with Google Places for accurate hospital and blood bank information.',
    color: 'from-red-400 to-rose-500'
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Predictive models for donor acceptance probability and compatibility scoring.',
    color: 'from-cyan-400 to-blue-500'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="gradient-text">VitalLink</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We combine cutting-edge technology with humanitarian values to save lives faster and more efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl card-shadow hover:card-shadow transition-all duration-300 border border-gray-100 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
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
