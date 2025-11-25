import { useState, useEffect } from 'react'
import { Plus, Search, Lightbulb, FileText, CheckSquare, BookOpen, Trash2, Edit2 } from 'lucide-react'
import Modal from '@/renderer/components/Modal'
import NoteForm from '@/renderer/components/NoteForm'
import { notes as notesService, projects as projectsService } from '@/renderer/services/storage'
import type { Note, Project } from '@/shared/types'

type NoteType = 'idea' | 'note' | 'todo' | 'research'

const typeIcons: Record<NoteType, any> = {
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
  const [notes, setNotes] = useState<Note[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [quickNote, setQuickNote] = useState('')
  const [selectedType, setSelectedType] = useState<NoteType>('note')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'chaos' | 'project'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setNotes(notesService.getAll())
    setProjects(projectsService.getAll())
  }

  const handleQuickSave = () => {
    if (!quickNote.trim()) return

    notesService.create({
      title: quickNote.substring(0, 50) + (quickNote.length > 50 ? '...' : ''),
      content: quickNote,
      type: selectedType,
      project_id: undefined
    })

    setQuickNote('')
    loadData()
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleUpdate = (data: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingNote) {
      notesService.update(editingNote.id, data)
    } else {
      notesService.create(data)
    }
    loadData()
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Notiz wirklich löschen?')) {
      notesService.delete(id)
      loadData()
    }
  }    // Filter notes
    const filteredNotes = notes.filter(note => {
        // Search filter
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.content?.toLowerCase().includes(searchQuery.toLowerCase()) || false)

        // Tab filter
        let matchesTab = true
        if (filterTab === 'chaos') {
            matchesTab = !note.project_id
        } else if (filterTab === 'project') {
            matchesTab = !!note.project_id
        }

        return matchesSearch && matchesTab
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

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
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            handleQuickSave()
                        }
                    }}
                    placeholder="Schnelle Notiz eingeben... (Gedankenfetzen, Ideen, alles was gerade wichtig ist) - Strg+Enter zum Speichern"
                    className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                    rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                        {Object.entries(typeLabels).map(([key, label]) => {
                            const Icon = typeIcons[key as NoteType]
                            const isSelected = selectedType === key
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(key as NoteType)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                                        isSelected
                                            ? typeColors[key as NoteType]
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                    <button
                        onClick={handleQuickSave}
                        disabled={!quickNote.trim()}
                        className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Speichern
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilterTab('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filterTab === 'all'
                            ? 'bg-gurktaler-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Alle ({notes.length})
                </button>
                <button
                    onClick={() => setFilterTab('chaos')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filterTab === 'chaos'
                            ? 'bg-gurktaler-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Chaosablage ({notes.filter(n => !n.project_id).length})
                </button>
                <button
                    onClick={() => setFilterTab('project')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filterTab === 'project'
                            ? 'bg-gurktaler-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Mit Projekt ({notes.filter(n => n.project_id).length})
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
                        placeholder="Notizen durchsuchen..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                    />
                </div>
            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {notes.length === 0 ? 'Noch keine Notizen' : 'Keine Ergebnisse'}
                    </h3>
                    <p className="text-slate-600">
                        {notes.length === 0
                            ? 'Nutze das Quick-Entry-Feld oben für spontane Gedanken.'
                            : 'Keine Notizen gefunden für deine Filter.'}
                    </p>
                </div>
            )}

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => {
                    const Icon = typeIcons[note.type as NoteType]
                    const project = note.project_id ? projects.find(p => p.id === note.project_id) : null
                    return (
                        <div
                            key={note.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-gurktaler-300 transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[note.type as NoteType]}`}>
                                    <Icon className="w-3 h-3" />
                                    {typeLabels[note.type as NoteType]}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400">{formatDate(note.created_at)}</span>
                                    <button
                                        onClick={() => handleEdit(note)}
                                        className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Bearbeiten"
                                    >
                                        <Edit2 className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Löschen"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-medium text-slate-800 mb-2">{note.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                            {project ? (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <span className="text-xs text-slate-500">📁 {project.name}</span>
                                </div>
                            ) : (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <span className="text-xs text-amber-600">📁 Chaosablage</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setEditingNote(null)
                    }}
                    title={editingNote ? 'Notiz bearbeiten' : 'Neue Notiz'}
                    size="lg"
                >
                    <NoteForm
                        note={editingNote || undefined}
                        projects={projects}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setEditingNote(null)
                        }}
                    />
                </Modal>
            )}
        </div>
    )
}

export default Notes
