import { useState, FormEvent } from 'react'
import { Globe, ShoppingCart, Users, FileText } from 'lucide-react'
import type { Weblink, Project, WeblinkType } from '@/shared/types'

interface WeblinkFormProps {
  weblink?: Weblink
  projects: Project[]
  onSubmit: (data: Omit<Weblink, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

const typeOptions: { value: WeblinkType; label: string; icon: any }[] = [
  { value: 'competitor', label: 'Konkurrenz', icon: Users },
  { value: 'supplier', label: 'Lieferant', icon: ShoppingCart },
  { value: 'research', label: 'Recherche', icon: Globe },
  { value: 'other', label: 'Sonstiges', icon: FileText },
]

export default function WeblinkForm({ weblink, projects, onSubmit, onCancel }: WeblinkFormProps) {
  const [url, setUrl] = useState(weblink?.url || '')
  const [title, setTitle] = useState(weblink?.title || '')
  const [description, setDescription] = useState(weblink?.description || '')
  const [type, setType] = useState<WeblinkType>(weblink?.type || 'research')
  const [projectId, setProjectId] = useState(weblink?.project_id || '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!url.trim() || !title.trim()) {
      alert('Bitte URL und Titel eingeben')
      return
    }

    // Validate URL format
    try {
      new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
    } catch {
      alert('Bitte gültige URL eingeben')
      return
    }

    onSubmit({
      url: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      project_id: projectId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="https://beispiel.com"
          required
        />
      </div>

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
          placeholder="Seitentitel oder Beschreibung"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notizen
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
          placeholder="Was ist interessant an dieser Seite?"
          rows={3}
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
          <option value="">Kein Projekt</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          {weblink ? 'Speichern' : 'Erstellen'}
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
