import { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import type { Document, Project, DocumentCategoryEntity } from "@/shared/types";
import { documentCategories as categoriesService } from "@/renderer/services/storage";

interface DocumentFormProps {
  document?: Document;
  projects: Project[];
  onSubmit: (data: Omit<Document, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

function DocumentForm({
  document,
  projects,
  onSubmit,
  onCancel,
}: DocumentFormProps) {
  const [type, setType] = useState<"file" | "url">(
    document?.type === "url" ? "url" : "file"
  );
  const [name, setName] = useState(document?.name || "");
  const [path, setPath] = useState(document?.path || "");
  const [category, setCategory] = useState(
    document?.category || "documentation"
  );
  const [description, setDescription] = useState(document?.description || "");
  const [projectId, setProjectId] = useState(document?.project_id || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<DocumentCategoryEntity[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategories(await categoriesService.getAll());
  };

  useEffect(() => {
    if (document) {
      setType(document.type === "url" ? "url" : "file");
      setName(document.name);
      setPath(document.path);
      setCategory(document.category || "documentation");
      setDescription(document.description || "");
      setProjectId(document.project_id || "");
    }
  }, [document]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!name) {
        setName(file.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "url") {
      // URL-Dokument
      onSubmit({
        type: "url",
        name,
        path,
        category,
        description,
        project_id: projectId || undefined,
      });
    } else {
      // File-Upload
      if (!selectedFile && !document) {
        alert("Bitte wähle eine Datei aus.");
        return;
      }

      setIsUploading(true);

      try {
        let filePath = path;
        let fileSize = document?.file_size;
        let mimeType = document?.mime_type;

        if (selectedFile) {
          // TODO: Implement file upload via nasStorage service
          // For now: just use filename as path (will be implemented with Phase 9b)
          filePath = `documents/${selectedFile.name}`;
          fileSize = selectedFile.size;
          mimeType = selectedFile.type;
        }

        onSubmit({
          type: "file",
          name,
          path: filePath,
          category,
          description,
          mime_type: mimeType,
          file_size: fileSize,
          project_id: projectId || undefined,
        });
      } catch (error) {
        console.error("Upload-Fehler:", error);
        alert("Fehler beim Hochladen. Bitte versuche es erneut.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Typ
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="file"
              checked={type === "file"}
              onChange={(e) => setType(e.target.value as "file")}
              className="text-gurktaler-500 focus:ring-gurktaler-500"
            />
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">Datei hochladen</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="url"
              checked={type === "url"}
              onChange={(e) => setType(e.target.value as "url")}
              className="text-gurktaler-500 focus:ring-gurktaler-500"
            />
            <LinkIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">URL verlinken</span>
          </label>
        </div>
      </div>

      {/* File Upload */}
      {type === "file" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Datei
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={handleFileSelect}
              className="flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gurktaler-50 file:text-gurktaler-700 hover:file:bg-gurktaler-100"
            />
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
          {selectedFile && (
            <p className="mt-1 text-xs text-slate-500">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      )}

      {/* URL Input */}
      {type === "url" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            URL
          </label>
          <input
            type="url"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            required
          />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Analyseprotokoll 2026-01"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Kategorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        >
          {categories
            .sort((a, b) => a.order - b.order)
            .map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon && `${cat.icon} `}
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Beschreibung
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optionale Beschreibung..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        />
      </div>

      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Projekt (optional)
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        >
          <option value="">Kein Projekt</option>
          {projects
            .filter((p) => p.status !== "archived")
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isUploading}
          className="flex-1 px-4 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading
            ? "Wird hochgeladen..."
            : document
            ? "Speichern"
            : "Erstellen"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default DocumentForm;
