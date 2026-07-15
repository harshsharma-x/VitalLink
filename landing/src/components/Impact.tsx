'use client'

const stats = [
  { number: '10 min', label: 'Average Response Time', description: 'Down from 2-4 hours' },
  { number: '2,566', label: 'Hospitals Connected', description: 'Across India' },
  { number: '50K+', label: 'Donor Profiles', description: 'In our ML database' },
  { number: '0', label: 'Corruption Cases', description: 'With our audit system' }
]

const problems = [
  {
    stat: '2-4 hours',
    description: 'Current average wait time for emergency blood in India',
    solution: 'VitalLink reduces this to under 10 minutes'
  },
  {
    stat: '₹4,000-8,000',
    description: 'Black market price per unit of blood',
    solution: 'VitalLink connects you directly with voluntary donors'
  },
  {
    stat: '81 districts',
    description: 'With zero donor coverage in India',
    solution: 'VitalLink is expanding coverage to underserved areas'
  },
  {
    stat: '3,000x',
    description: 'Higher HIV rate in unscreened blood vs. US',
    solution: 'VitalLink ensures verified, screened donations only'
  }
]

export default function Impact() {
  return (
    <section id="impact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Problems we solve */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            The Problem We <span className="gradient-text">Solve</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            India faces a critical blood shortage crisis. VitalLink is the solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border border-red-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 mb-1">{problem.stat}</div>
                  <div className="text-gray-700 mb-2">{problem.description}</div>
                  <div className="text-green-700 font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {problem.solution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
