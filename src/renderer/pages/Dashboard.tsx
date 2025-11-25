import { FolderKanban, Package, FlaskConical, StickyNote, Plus } from 'lucide-react'

// Mock data for demonstration
const stats = [
  { label: 'Aktive Projekte', value: 3, icon: FolderKanban, color: 'bg-blue-500' },
  { label: 'Produkte', value: 12, icon: Package, color: 'bg-gurktaler-500' },
  { label: 'Rezepturen', value: 8, icon: FlaskConical, color: 'bg-amber-500' },
  { label: 'Notizen', value: 24, icon: StickyNote, color: 'bg-purple-500' },
]

const recentItems = [
  { type: 'note', title: 'Idee: Sommeredition mit Minze', date: '25.11.2024' },
  { type: 'product', title: 'Kräuter-Bitter X3 (Version)', date: '24.11.2024' },
  { type: 'recipe', title: 'Basis-Mazerat Melisse', date: '23.11.2024' },
  { type: 'project', title: 'Weihnachts-Spezial 2024', date: '22.11.2024' },
]

function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Willkommen bei Gurktaler 2.0</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Letzte Aktivitäten</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentItems.map((item, index) => (
                <div key={index} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">{item.title}</p>
                      <p className="text-sm text-slate-500 capitalize">{item.type}</p>
                    </div>
                    <span className="text-sm text-slate-400">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-4">Schnellzugriff</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gurktaler-50 text-gurktaler-700 rounded-lg hover:bg-gurktaler-100 transition-colors">
                <Plus className="w-5 h-5" />
                Neue Notiz
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                <Plus className="w-5 h-5" />
                Neues Projekt
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                <Plus className="w-5 h-5" />
                Neues Produkt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gurktaler-50 border border-gurktaler-200 rounded-xl p-6">
        <h3 className="font-semibold text-gurktaler-800 mb-2">Entwicklungsmodus</h3>
        <p className="text-gurktaler-700 text-sm">
          Dies ist eine Entwicklungsversion. Daten werden lokal in SQLite gespeichert.
          Für Synchronisation zwischen Geräten nutze den JSON-Export und Git.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
