import { useState, useEffect } from 'react'
import { Search, FolderKanban, Package, StickyNote, Users, Globe, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  projects as projectsService,
  products as productsService,
  notes as notesService,
  contacts as contactsService,
  weblinks as weblinksService,
} from '@/renderer/services/storage'
import type { Project, Product, Note, Contact, Weblink } from '@/shared/types'

type SearchResult = {
  type: 'project' | 'product' | 'note' | 'contact' | 'weblink'
  id: string
  title: string
  subtitle?: string
  description?: string
  metadata?: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(() => {
      performSearch(query)
      setIsSearching(false)
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase()
    const allResults: SearchResult[] = []

    // Search Projects
    const projects = projectsService.getAll()
    projects.forEach((project: Project) => {
      if (
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: 'project',
          id: project.id,
          title: project.name,
          description: project.description,
          metadata: `Status: ${project.status}`,
        })
      }
    })

    // Search Products
    const products = productsService.getAll()
    products.forEach((product: Product) => {
      if (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.version.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: `Version ${product.version}`,
          description: product.description,
          metadata: `Status: ${product.status}`,
        })
      }
    })

    // Search Notes
    const notes = notesService.getAll()
    notes.forEach((note: Note) => {
      if (
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: 'note',
          id: note.id,
          title: note.title,
          description: note.content?.substring(0, 100),
          metadata: `Typ: ${note.type}`,
        })
      }
    })

    // Search Contacts
    const contacts = contactsService.getAll()
    contacts.forEach((contact: Contact) => {
      if (
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.company?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.notes?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: 'contact',
          id: contact.id,
          title: contact.name,
          subtitle: contact.company,
          description: contact.email,
          metadata: `Typ: ${contact.type}`,
        })
      }
    })

    // Search Weblinks
    const weblinks = weblinksService.getAll()
    weblinks.forEach((weblink: Weblink) => {
      if (
        weblink.title.toLowerCase().includes(lowerQuery) ||
        weblink.url.toLowerCase().includes(lowerQuery) ||
        weblink.description?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: 'weblink',
          id: weblink.id,
          title: weblink.title,
          subtitle: weblink.url,
          description: weblink.description,
          metadata: `Typ: ${weblink.type}`,
        })
      }
    })

    setResults(allResults)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return FolderKanban
      case 'product':
        return Package
      case 'note':
        return StickyNote
      case 'contact':
        return Users
      case 'weblink':
        return Globe
      default:
        return Search
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Projekt'
      case 'product':
        return 'Produkt'
      case 'note':
        return 'Notiz'
      case 'contact':
        return 'Kontakt'
      case 'weblink':
        return 'Weblink'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-700'
      case 'product':
        return 'bg-green-100 text-green-700'
      case 'note':
        return 'bg-yellow-100 text-yellow-700'
      case 'contact':
        return 'bg-purple-100 text-purple-700'
      case 'weblink':
        return 'bg-pink-100 text-pink-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'project':
        navigate('/projects')
        break
      case 'product':
        navigate('/products')
        break
      case 'note':
        navigate('/notes')
        break
      case 'contact':
        navigate('/contacts')
        break
      case 'weblink':
        if (result.subtitle) {
          window.open(result.subtitle, '_blank')
        }
        break
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Globale Suche</h1>
          <p className="text-gray-600">Durchsuche alle Bereiche: Projekte, Produkte, Notizen, Kontakte und Weblinks</p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wonach suchst du?"
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gurktaler-primary focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-12 text-gray-500">
                Suche läuft...
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Keine Ergebnisse gefunden für "{query}"</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden
                </div>
                {results.map((result, index) => {
                  const Icon = getIcon(result.type)
                  return (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleResultClick(result)}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gurktaler-primary transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                            {result.subtitle && (
                              <span className="text-sm text-gray-500 truncate">{result.subtitle}</span>
                            )}
                            {result.type === 'weblink' && (
                              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{result.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                              {getTypeLabel(result.type)}
                            </span>
                            {result.metadata && <span>{result.metadata}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-12">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Gib einen Suchbegriff ein</h3>
            <p className="text-gray-500">Die Suche durchsucht automatisch alle Bereiche deiner Daten</p>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
              {[
                { icon: FolderKanban, label: 'Projekte', color: 'bg-blue-50 text-blue-600' },
                { icon: Package, label: 'Produkte', color: 'bg-green-50 text-green-600' },
                { icon: StickyNote, label: 'Notizen', color: 'bg-yellow-50 text-yellow-600' },
                { icon: Users, label: 'Kontakte', color: 'bg-purple-50 text-purple-600' },
                { icon: Globe, label: 'Weblinks', color: 'bg-pink-50 text-pink-600' },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-lg ${item.color}`}>
                  <item.icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
