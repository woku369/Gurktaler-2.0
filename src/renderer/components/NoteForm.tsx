import { useState, FormEvent } from 'react'
import { Lightbulb, FileText, CheckSquare, BookOpen } from 'lucide-react'
import type { Note, Project } from '@/shared/types'

type NoteType = 'idea' | 'note' | 'todo' | 'research'

interface NoteFormProps {
  note?: Note
  projects: Project[]
  onSubmit: (data: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

const typeOptions: { value: NoteType; label: string; icon: any }[] = [
  { value: 'idea', label: 'Idee', icon: Lightbulb },
  { value: 'note', label: 'Notiz', icon: FileText },
  { value: 'todo', label: 'Aufgabe', icon: CheckSquare },
  { value: 'research', label: 'Recherche', icon: BookOpen },
]

export default function NoteForm({ note, projects, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [type, setType] = useState<NoteType>(note?.type || 'note')
  const [projectId, setProjectId] = useState(note?.project_id || '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Bitte Titel und Inhalt eingeben')
      return
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      type,
      project_id: projectId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Titel <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="Kurze Zusammenfassung..."
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Inhalt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
          placeholder="Detaillierte Notiz..."
          rows={6}
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Typ <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = type === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-gurktaler-500 bg-gurktaler-50 text-gurktaler-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Project Assignment */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Projekt zuordnen (optional)
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        >
          <option value="">📁 Chaosablage (kein Projekt)</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Chaosablage = keine Projekt-Zuordnung, für spontane Gedanken
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          {note ? 'Speichern' : 'Erstellen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
