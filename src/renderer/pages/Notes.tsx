import { Plus, Search, Lightbulb, FileText, CheckSquare, BookOpen } from 'lucide-react'

// Mock data
const notes = [
  { id: '1', title: 'Idee: Sommeredition mit Minze', type: 'idea', content: 'Frische Minze aus dem Garten...', project: null, date: '25.11.2024' },
  { id: '2', title: 'Rezept-Notiz: Mehr Wacholder?', type: 'note', content: 'Bei der letzten Probe...', project: 'Weihnachts-Spezial', date: '24.11.2024' },
  { id: '3', title: 'TODO: Etiketten bestellen', type: 'todo', content: 'Für die neue Charge...', project: 'Premium Reserve', date: '23.11.2024' },
  { id: '4', title: 'Recherche: Konkurrenzprodukt XY', type: 'research', content: 'Interessante Kräutermischung...', project: null, date: '22.11.2024' },
]

const typeIcons = {
  idea: Lightbulb,
  note: FileText,
  todo: CheckSquare,
  research: BookOpen,
}

const typeColors = {
  idea: 'bg-yellow-100 text-yellow-700',
  note: 'bg-blue-100 text-blue-700',
  todo: 'bg-green-100 text-green-700',
  research: 'bg-purple-100 text-purple-700',
}

const typeLabels = {
  idea: 'Idee',
  note: 'Notiz',
  todo: 'Aufgabe',
  research: 'Recherche',
}

function Notes() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notizen & Chaosablage</h1>
          <p className="text-slate-500">Ideen, Gedanken und schnelle Notizen</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
          <Plus className="w-5 h-5" />
          Neue Notiz
        </button>
      </div>

      {/* Quick Entry */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <textarea
          placeholder="Schnelle Notiz eingeben... (Gedankenfetzen, Ideen, alles was gerade wichtig ist)"
          className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {Object.entries(typeLabels).map(([key, label]) => {
              const Icon = typeIcons[key as keyof typeof typeIcons]
              return (
                <button
                  key={key}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${typeColors[key as keyof typeof typeColors]} hover:opacity-80 transition-opacity`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              )
            })}
          </div>
          <button className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
            Speichern
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg">Alle</button>
        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Chaosablage</button>
        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Mit Projekt</button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Notizen durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => {
          const Icon = typeIcons[note.type as keyof typeof typeIcons]
          return (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-gurktaler-300 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[note.type as keyof typeof typeColors]}`}>
                  <Icon className="w-3 h-3" />
                  {typeLabels[note.type as keyof typeof typeLabels]}
                </span>
                <span className="text-xs text-slate-400">{note.date}</span>
              </div>
              <h3 className="font-medium text-slate-800 mb-2">{note.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{note.content}</p>
              {note.project && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Projekt: {note.project}</span>
                </div>
              )}
              {!note.project && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-amber-600">📁 Chaosablage</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Notes
