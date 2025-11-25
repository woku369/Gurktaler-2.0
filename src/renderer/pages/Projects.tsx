import { Plus, Search, Filter } from 'lucide-react'

// Mock data
const projects = [
    { id: '1', name: 'Weihnachts-Spezial 2024', status: 'active', products: 3, description: 'Limitierte Weihnachtsedition mit Zimt und Nelken' },
    { id: '2', name: 'Sommer-Linie', status: 'paused', products: 2, description: 'Erfrischende Varianten mit Minze und Zitrus' },
    { id: '3', name: 'Premium Reserve', status: 'active', products: 1, description: 'Hochwertige Kleinserie für Spezialitätenhandel' },
]

const statusColors = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    archived: 'bg-slate-100 text-slate-700',
}

const statusLabels = {
    active: 'Aktiv',
    paused: 'Pausiert',
    completed: 'Abgeschlossen',
    archived: 'Archiviert',
}

function Projects() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Projekte</h1>
                    <p className="text-slate-500">Verwalte deine Produktentwicklungs-Projekte</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Neues Projekt
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Projekte durchsuchen..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Filter className="w-5 h-5 text-slate-500" />
                    Filter
                </button>
            </div>

            {/* Project List */}
            <div className="grid gap-4">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-gurktaler-300 cursor-pointer transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}>
                                        {statusLabels[project.status as keyof typeof statusLabels]}
                                    </span>
                                </div>
                                <p className="text-slate-500 mb-4">{project.description}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>{project.products} Produkte</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State (hidden when there are projects) */}
            {projects.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Keine Projekte</h3>
                    <p className="text-slate-500 mb-4">Erstelle dein erstes Projekt, um loszulegen.</p>
                    <button className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
                        Projekt erstellen
                    </button>
                </div>
            )}
        </div>
    )
}

export default Projects
