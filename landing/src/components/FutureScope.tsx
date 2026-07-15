'use client'

const futureScope = [
  {
    phase: 'Phase 1 — Production Launch',
    status: 'In Progress',
    statusColor: 'text-yellow-400',
    items: [
      'Play Store & App Store deployment for both apps',
      'Real SMS OTP via production Fast2SMS gateway',
      'Google OAuth with verified client IDs',
      'Production PostgreSQL on Render with 99.9% uptime',
      'Full Firebase Cloud Messaging for push notifications',
    ]
  },
  {
    phase: 'Phase 2 — AI & Scale',
    status: 'Planned',
    statusColor: 'text-blue-400',
    items: [
      'Real-time ML model retraining on live donation data',
      'Integration with 10,000+ hospitals across India',
      'Multi-language support (Hindi, Bengali, Tamil, etc.)',
      'Predictive blood shortage alerts for hospitals',
      'Automated donor reward & gamification system',
    ]
  },
  {
    phase: 'Phase 3 — Ecosystem',
    status: 'Future',
    statusColor: 'text-purple-400',
    items: [
      'VitalLink API for third-party hospital integrations',
      'Blood bank inventory management system',
      'Government health record (ABHA) deep integration',
      'Cross-border emergency matching for neighboring countries',
      'Blockchain-based immutable audit trail for all donations',
    ]
  }
]

export default function FutureScope() {
  return (
    <section id="future" className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Future <span className="gradient-text">Roadmap</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            VitalLink has a clear vision for growth — from a working prototype 
            to a nationwide emergency blood network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {futureScope.map((phase, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">{phase.phase}</h3>
                <span className={`text-sm font-semibold ${phase.statusColor}`}>
                  {phase.status}
                </span>
              </div>
              <div className="space-y-4">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            "From a university project to a nationwide life-saving platform — that's the VitalLink vision."
          </p>
        </div>
      </div>
    </section>
  )
}
