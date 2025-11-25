import { Plus, Search } from 'lucide-react'

function Recipes() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rezepturen</h1>
          <p className="text-slate-500">Mazerate, Destillate und Ausmischungen</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
          <Plus className="w-5 h-5" />
          Neue Rezeptur
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rezepturen durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Rezepturen-Modul in Entwicklung</p>
        <p className="text-sm text-slate-400 mt-2">Hier werden Mazerate, Destillate und deren Ausmischungen verwaltet.</p>
      </div>
    </div>
  )
}

export default Recipes
