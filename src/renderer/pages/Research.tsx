import { useState, useEffect } from 'react'
import { Plus, Search, ExternalLink, Edit2, Trash2, Globe, ShoppingCart, Users, FileText, Star } from 'lucide-react'
import Modal from '@/renderer/components/Modal'
import WeblinkForm from '@/renderer/components/WeblinkForm'
import { weblinks as weblinksService, projects as projectsService, favorites as favoritesService } from '@/renderer/services/storage'
import type { Weblink, Project } from '@/shared/types'

const typeIcons = {
  competitor: Users,
  supplier: ShoppingCart,
  research: Globe,
  other: FileText,
}

const typeLabels = {
  competitor: 'Konkurrenz',
  supplier: 'Lieferant',
  research: 'Recherche',
  other: 'Sonstiges',
}

const typeColors = {
  competitor: 'bg-red-100 text-red-700',
  supplier: 'bg-blue-100 text-blue-700',
  research: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
}

function Research() {
  const [weblinks, setWeblinks] = useState<Weblink[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWeblink, setEditingWeblink] = useState<Weblink | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setWeblinks(weblinksService.getAll())
    setProjects(projectsService.getAll())
  }

  const handleSubmit = (data: Omit<Weblink, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingWeblink) {
      weblinksService.update(editingWeblink.id, data)
    } else {
      weblinksService.create(data)
    }
    loadData()
    setIsModalOpen(false)
    setEditingWeblink(null)
  }

  const handleEdit = (weblink: Weblink) => {
    setEditingWeblink(weblink)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Weblink wirklich löschen?')) {
      weblinksService.delete(id)
      loadData()
    }
  }

  const filteredWeblinks = weblinks.filter(weblink => {
    const matchesSearch = 
      weblink.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weblink.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weblink.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || weblink.type === filterType

    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recherche & Links</h1>
          <p className="text-slate-500">Webseiten, Konkurrenz, Lieferanten und Inspiration</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neuer Link
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'all'
              ? 'bg-gurktaler-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Alle ({weblinks.length})
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === key
                ? 'bg-gurktaler-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label} ({weblinks.filter(w => w.type === key).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Links durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredWeblinks.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Globe className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {weblinks.length === 0 ? 'Noch keine Links' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-slate-600 mb-6">
            {weblinks.length === 0
              ? 'Sammle interessante Webseiten, Konkurrenzprodukte und Lieferanten.'
              : 'Keine Links gefunden für deine Suche.'}
          </p>
          {weblinks.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors"
            >
              Ersten Link erstellen
            </button>
          )}
        </div>
      )}

      {/* Weblinks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWeblinks.map((weblink) => {
          const Icon = typeIcons[weblink.type]
          const project = weblink.project_id ? projects.find(p => p.id === weblink.project_id) : null
          return (
            <div
              key={weblink.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[weblink.type]}`}>
                  <Icon className="w-3 h-3" />
                  {typeLabels[weblink.type]}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      favoritesService.toggle('weblink', weblink.id)
                      loadWeblinks()
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                    title={favoritesService.isFavorite('weblink', weblink.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  >
                    <Star className={`w-4 h-4 ${
                      favoritesService.isFavorite('weblink', weblink.id)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-slate-400'
                    }`} />
                  </button>
                  <button
                    onClick={() => handleEdit(weblink)}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(weblink.id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-2">{weblink.title}</h3>

              <a
                href={weblink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gurktaler-600 hover:text-gurktaler-700 mb-3"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{getDomain(weblink.url)}</span>
              </a>

              {weblink.description && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{weblink.description}</p>
              )}

              {project && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">📁 {project.name}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Hinzugefügt: {formatDate(weblink.created_at)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingWeblink(null)
          }}
          title={editingWeblink ? 'Link bearbeiten' : 'Neuer Link'}
          size="md"
        >
          <WeblinkForm
            weblink={editingWeblink || undefined}
            projects={projects}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false)
              setEditingWeblink(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default Research
