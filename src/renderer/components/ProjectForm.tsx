import { useState, FormEvent } from "react";
import TagSelector from "./TagSelector";
import DocumentManager from "./DocumentManager";
import ProjectTimelineForm from "./ProjectTimelineForm";
import type {
  Project,
  ProjectStatus,
  Document,
  ProjectTimeline,
} from "@/shared/types";

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Aktiv" },
  { value: "paused", label: "Pausiert" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "archived", label: "Archiviert" },
];

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status || "active"
  );
  const [color, setColor] = useState(project?.color || "#3b82f6");
  const [documents, setDocuments] = useState<Document[]>(
    project?.documents || []
  );
  const [timeline, setTimeline] = useState<ProjectTimeline | undefined>(
    project?.timeline
  );

  const handleAddDocument = (doc: Omit<Document, "id" | "created_at">) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleOpenDocument = async (doc: Document) => {
    if (doc.type === "file") {
      await window.electron.invoke("file:open", doc.path);
    } else {
      window.open(doc.path, "_blank");
    }
  };

  const handleShowInFolder = async (doc: Document) => {
    await window.electron.invoke("file:show", doc.path);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      timeline,
      color,
      description: description.trim() || undefined,
      status,
      documents: documents.length > 0 ? documents : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Projektname *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. Weihnachts-Spezial 2024"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
          placeholder="Kurze Beschreibung des Projekts..."
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Picker */}
      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Projekt-Farbe (für Timeline)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-20 border border-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex-1">
            <div className="text-xs text-slate-500">
              Wird als Rahmen im Gantt-Chart angezeigt
            </div>
            <div
              className="mt-1 h-6 rounded border-4"
              style={{
                borderColor: color,
                backgroundColor: status === "completed" ? "#cbd5e1" : "#65a30d",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      {project && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags
          </label>
          <TagSelector entityType="project" entityId={project.id} />
        </div>
      )}

      {/* Documents */}
      {project && (
        <div>
          <DocumentManager
            documents={documents}
            onAdd={handleAddDocument}
            onDelete={handleDeleteDocument}
            onOpen={handleOpenDocument}
            onShowInFolder={handleShowInFolder}
          />
        </div>
      )}

      {/* Timeline / Gantt */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Zeitplanung (Gantt-Chart)
        </h3>
        <ProjectTimelineForm
          timeline={timeline}
          onChange={setTimeline}
          currentProjectId={project?.id}
        />
      </div>

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
          {project ? "Speichern" : "Erstellen"}
        </button>
      </div>
    </form>
  );
}
