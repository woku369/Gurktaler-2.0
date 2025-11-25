import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, FlaskConical, Droplet, Beaker } from 'lucide-react'
import { recipes as recipesService, products as productsService } from '@/renderer/services/storage'
import type { Recipe, Product } from '@/shared/types'

const typeIcons = {
  macerate: Droplet,
  distillate: Beaker,
  blend: FlaskConical,
}

const typeLabels = {
  macerate: 'Mazerat',
  distillate: 'Destillat',
  blend: 'Ausmischung',
}

const typeColors = {
  macerate: 'bg-green-100 text-green-700',
  distillate: 'bg-blue-100 text-blue-700',
  blend: 'bg-amber-100 text-amber-700',
}

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setRecipes(recipesService.getAll())
    setProducts(productsService.getAll())
  }

  const handleDelete = (id: string) => {
    if (confirm('Rezeptur wirklich löschen?')) {
      recipesService.delete(id)
      loadData()
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.instructions?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rezepturen</h1>
          <p className="text-slate-500">Mazerate, Destillate und Ausmischungen</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
          disabled
          title="Rezeptur-Editor in Entwicklung"
        >
          <Plus className="w-5 h-5" />
          Neue Rezeptur
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rezepturen durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>🚧 In Entwicklung:</strong> Der Rezeptur-Editor mit Zutaten-Verwaltung und Mengenberechnung wird in Phase 4 implementiert.
          Aktuell sind nur Lese-Ansichten verfügbar.
        </p>
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FlaskConical className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {recipes.length === 0 ? 'Noch keine Rezepturen' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-slate-600">
            {recipes.length === 0
              ? 'Der Rezeptur-Editor ist in Entwicklung.'
              : 'Keine Rezepturen gefunden für deine Suche.'}
          </p>
        </div>
      )}

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const Icon = typeIcons[recipe.type]
          const product = recipe.product_id ? products.find(p => p.id === recipe.product_id) : null
          return (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[recipe.type]}`}>
                  <Icon className="w-3 h-3" />
                  {typeLabels[recipe.type]}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled
                    className="p-1 hover:bg-slate-100 rounded opacity-50 cursor-not-allowed"
                    title="Bearbeitung in Entwicklung"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-2">{recipe.name}</h3>

              {recipe.instructions && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">{recipe.instructions}</p>
              )}

              {product && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">🔗 {product.name}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Erstellt: {formatDate(recipe.created_at)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Recipes
