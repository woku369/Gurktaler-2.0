import { useState, FormEvent } from 'react'
import TagSelector from './TagSelector'
import type { Product, ProductStatus, Project } from '@/shared/types'

interface ProductFormProps {
  product?: Product
  projects: Project[]
  parentProduct?: Product // For creating versions
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'testing', label: 'In Test' },
  { value: 'approved', label: 'Freigegeben' },
  { value: 'archived', label: 'Archiviert' },
]

export default function ProductForm({ product, projects, parentProduct, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || parentProduct?.name || '')
  const [version, setVersion] = useState(product?.version || (parentProduct ? '' : '1.0'))
  const [description, setDescription] = useState(product?.description || '')
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'draft')
  const [projectId, setProjectId] = useState(product?.project_id || '')
  const [archiveReason, setArchiveReason] = useState(product?.archive_reason || '')

  const isVersioning = !!parentProduct

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !version.trim()) return

    onSubmit({
      name: name.trim(),
      version: version.trim(),
      description: description.trim() || undefined,
      status,
      project_id: projectId || undefined,
      parent_id: parentProduct?.id || product?.parent_id || undefined,
      archive_reason: status === 'archived' && archiveReason.trim() ? archiveReason.trim() : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Parent Product Info (when versioning) */}
      {isVersioning && parentProduct && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Neue Version von:</strong> {parentProduct.name} (v{parentProduct.version})
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Produktname *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. Kräuter-Bitter Classic"
          required
        />
      </div>

      {/* Version */}
      <div>
        <label htmlFor="version" className="block text-sm font-medium text-slate-700 mb-1">
          Version *
        </label>
        <input
          id="version"
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. 1.0, 1.1, 2.0"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Empfehlung: 1.0 für Erstversion, 1.1 für kleine Änderungen, 2.0 für größere Überarbeitungen
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
          placeholder="Kurze Beschreibung des Produkts..."
        />
      </div>

      {/* Project Assignment */}
      <div>
        <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">
          Projekt (optional)
        </label>
        <select
          id="project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          <option value="">Kein Projekt</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Archive Reason (only when archived) */}
      {status === 'archived' && (
        <div>
          <label htmlFor="archiveReason" className="block text-sm font-medium text-slate-700 mb-1">
            Grund für Archivierung
          </label>
          <textarea
            id="archiveReason"
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
            placeholder="z.B. Zu süß, Rezeptur überarbeiten"
          />
        </div>
      )}

      {/* Tags */}
      {product && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags
          </label>
          <TagSelector entityType="product" entityId={product.id} />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          {product ? 'Speichern' : isVersioning ? 'Version erstellen' : 'Erstellen'}
        </button>
      </div>
    </form>
  )
}
