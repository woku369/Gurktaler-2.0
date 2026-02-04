import { useState, FormEvent, useRef } from "react";
import {
  Lightbulb,
  FileText,
  CheckSquare,
  BookOpen,
  Eye,
  Code,
  Camera,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import TagSelector from "./TagSelector";
import ImageUpload from "./ImageUpload";
import DocumentManager from "./DocumentManager";
import type { Note, Project, Document } from "@/shared/types";

type NoteType = "idea" | "note" | "todo" | "research";

interface NoteFormProps {
  note?: Note;
  projects: Project[];
  onSubmit: (data: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const typeOptions: { value: NoteType; label: string; icon: any }[] = [
  { value: "idea", label: "Idee", icon: Lightbulb },
  { value: "note", label: "Notiz", icon: FileText },
  { value: "todo", label: "Aufgabe", icon: CheckSquare },
  { value: "research", label: "Recherche", icon: BookOpen },
];

export default function NoteForm({
  note,
  projects,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [type, setType] = useState<NoteType>(note?.type || "note");
  const [projectId, setProjectId] = useState(note?.project_id || "");
  const [url, setUrl] = useState(note?.url || "");
  const [showPreview, setShowPreview] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(note?.documents || []);
  const [pendingImages, setPendingImages] = useState<string[]>([]); // Base64 Data URLs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAddDocument = (doc: Omit<Document, "id" | "created_at">) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPendingImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input for re-selection
    e.target.value = "";
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
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

    if (!title.trim() || !content.trim()) {
      alert("Bitte Titel und Inhalt eingeben");
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      type,
      project_id: projectId || undefined,
      url: url.trim() || undefined,
      documents: documents.length > 0 ? documents : undefined,
    });

    // Save pending images after note is created (in parent component)
    // Parent should handle this via callback after getting the new note ID
    if (pendingImages.length > 0 && !note) {
      // Signal to parent that images need to be saved
      (window as any)._pendingNoteImages = pendingImages;
    }
  };

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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">
            Inhalt <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                !showPreview
                  ? "bg-gurktaler-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" />
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                showPreview
                  ? "bg-gurktaler-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Vorschau
            </button>
          </div>
        </div>
        {!showPreview ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none font-mono text-sm"
            placeholder="Detaillierte Notiz... (Markdown unterstützt: **fett**, *kursiv*, - Listen, etc.)"
            rows={8}
            required
          />
        ) : (
          <div className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[200px] bg-slate-50">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {content || "*Keine Vorschau verfügbar*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Typ <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-gurktaler-500 bg-gurktaler-50 text-gurktaler-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* URL Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL (optional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="https://example.com"
        />
        <p className="text-xs text-slate-500 mt-1">
          Verknüpfe eine Website oder Ressource mit dieser Notiz
        </p>
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

      {/* Tags */}
      {note && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags / Eigene Kategorien
          </label>
          <TagSelector entityType="note" entityId={note.id} />
          <p className="text-xs text-slate-500 mt-1">
            Nutze Tags um eigene Kategorien über die Standard-Typen (Idee,
            Notiz, Aufgabe, Recherche) hinaus zu definieren
          </p>
        </div>
      )}

      {/* Images - Now available for new notes too! */}
      {note ? (
        <div>
          <ImageUpload entityType="note" entityId={note.id} maxImages={20} />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bilder ({pendingImages.length})
          </label>

          {/* Mobile-First Upload Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gurktaler-500 hover:bg-gurktaler-600 text-white rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              Aus Galerie
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-300"
            >
              <Camera className="w-5 h-5" />
              Foto aufnehmen
            </button>
          </div>

          {/* Hidden Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Image Preview */}
          {pendingImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pendingImages.map((dataUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={dataUrl}
                    alt={`Bild ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingImage(index)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-2">
            💡 Bilder werden gespeichert sobald du die Notiz erstellst
          </p>
        </div>
      )}

      {/* Documents */}
      {note && (
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

      {/* Buttons - Sticky am unteren Rand für Mobile */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 mt-4 border-t border-slate-200 flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors font-semibold"
        >
          {note ? "Speichern" : "Erstellen"}
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
  );
}
