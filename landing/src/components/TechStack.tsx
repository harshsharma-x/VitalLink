'use client'

const techStack = [
  {
    category: 'Mobile Apps',
    items: [
      { name: 'React Native', version: '0.85', description: 'Cross-platform mobile framework' },
      { name: 'Expo SDK', version: '56', description: 'Managed workflow & build tools' },
      { name: 'TypeScript', version: '5.x', description: 'Type-safe development' },
      { name: 'React Navigation', version: '6.x', description: 'Native stack navigation' },
      { name: 'Socket.io Client', version: '4.x', description: 'Real-time communication' },
    ]
  },
  {
    category: 'Backend',
    items: [
      { name: 'Python FastAPI', version: '0.110', description: 'High-performance API framework' },
      { name: 'PostgreSQL', version: '16', description: 'Primary database' },
      { name: 'SQLite', version: '3.x', description: 'Hospital & blood bank data' },
      { name: 'Redis', version: '7', description: 'Live donor location cache' },
      { name: 'SQLAlchemy + Alembic', version: '2.x', description: 'ORM & migrations' },
    ]
  },
  {
    category: 'ML & AI',
    items: [
      { name: 'scikit-learn', version: '1.4', description: 'ML matching models' },
      { name: 'GradientBoosting', version: '—', description: 'Donor compatibility scoring' },
      { name: 'Random Forest', version: '—', description: 'Acceptance prediction' },
      { name: 'Isolation Forest', version: '—', description: 'Corruption pattern detection' },
    ]
  },
  {
    category: 'Infrastructure',
    items: [
      { name: 'Docker Compose', version: '3.x', description: 'Containerized services' },
      { name: 'Render', version: '—', description: 'Backend deployment' },
      { name: 'Firebase Admin', version: '12.x', description: 'Push notifications' },
      { name: 'Google Places API', version: '—', description: 'Real hospital data' },
    ]
  }
]

export default function TechStack() {
  return (
    <section id="tech" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tech <span className="text-red-400">Stack</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built with modern technologies for performance, scalability, and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techStack.map((category, index) => (
            <div key={index} className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                <span className="w-3 h-3 bg-red-400 rounded-full mr-3"></span>
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-gray-500 ml-2 text-sm">{item.version}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Project Architecture */}
        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold text-red-400 mb-6">Project Architecture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <div className="font-bold text-lg mb-1">Mobile Frontend</div>
              <div className="text-gray-400 text-sm">React Native + Expo</div>
              <div className="text-gray-500 text-xs mt-2">Donor App • Patient App</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">⚙️</div>
              <div className="font-bold text-lg mb-1">API Backend</div>
              <div className="text-gray-400 text-sm">FastAPI + PostgreSQL</div>
              <div className="text-gray-500 text-xs mt-2">REST API + WebSocket</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">🧠</div>
              <div className="font-bold text-lg mb-1">ML Pipeline</div>
              <div className="text-gray-400 text-sm">scikit-learn Models</div>
              <div className="text-gray-500 text-xs mt-2">Matching + Fraud Detection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
