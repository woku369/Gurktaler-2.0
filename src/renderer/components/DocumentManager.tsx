import { useState } from "react";
import {
  FileText,
  Link2,
  Image as ImageIcon,
  Folder,
  ExternalLink,
  Eye,
  Trash2,
  X,
  Plus,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import type { Document, DocumentCategory, DocumentType } from "@/shared/types";

interface DocumentManagerProps {
  documents: Document[];
  onAdd: (document: Omit<Document, "id" | "created_at">) => void;
  onDelete: (id: string) => void;
  onOpen: (document: Document) => void;
  onShowInFolder: (document: Document) => void;
}

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "recipe", label: "Rezeptur" },
  { value: "analysis", label: "Analyse" },
  { value: "marketing", label: "Marketing" },
  { value: "label", label: "Etikett" },
  { value: "documentation", label: "Dokumentation" },
  { value: "other", label: "Sonstiges" },
];

const MIME_TYPE_ICONS: Record<
  string,
  { icon: typeof FileText; color: string }
> = {
  "application/pdf": { icon: FileText, color: "text-red-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-600",
  },
  "application/msword": { icon: FileText, color: "text-blue-600" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: FileText,
    color: "text-green-600",
  },
  "application/vnd.ms-excel": { icon: FileText, color: "text-green-600" },
  "text/plain": { icon: FileText, color: "text-gray-600" },
  "image/jpeg": { icon: ImageIcon, color: "text-purple-600" },
  "image/png": { icon: ImageIcon, color: "text-purple-600" },
  "image/gif": { icon: ImageIcon, color: "text-purple-600" },
  "image/webp": { icon: ImageIcon, color: "text-purple-600" },
};

function getDocumentIcon(mimeType?: string) {
  if (!mimeType) return { icon: FileText, color: "text-gray-600" };
  return (
    MIME_TYPE_ICONS[mimeType] || { icon: FileText, color: "text-gray-600" }
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentManager({
  documents,
  onAdd,
  onDelete,
  onOpen,
  onShowInFolder,
}: DocumentManagerProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<DocumentType>("file");
  const [urlInput, setUrlInput] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddLocalFile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = (await window.electron.invoke("file:select")) as {
        success: boolean;
        canceled?: boolean;
        error?: string;
        file?: {
          path: string;
          name: string;
          mimeType: string;
          size: number;
        };
      };

      if (!result.success) {
        if (!result.canceled) {
          setError(result.error || "Fehler beim Auswählen der Datei");
        }
        setIsLoading(false);
        return;
      }

      if (!result.file) {
        setError("Keine Datei ausgewählt");
        setIsLoading(false);
        return;
      }

      const newDoc: Omit<Document, "id" | "created_at"> = {
        type: "file",
        path: result.file.path,
        name: result.file.name,
        category,
        description: description || undefined,
        mime_type: result.file.mimeType,
        file_size: result.file.size,
        updated_at: new Date().toISOString(),
      };

      onAdd(newDoc);
      setShowAddModal(false);
      setCategory("other");
      setDescription("");
    } catch (err) {
      setError("Fehler beim Hinzufügen der Datei");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      setError("Bitte gib eine URL ein");
      return;
    }

    try {
      new URL(urlInput); // Validierung
    } catch {
      setError("Ungültige URL");
      return;
    }

    const fileName = urlInput.split("/").pop() || "Link";
    const newDoc: Omit<Document, "id" | "created_at"> = {
      type: addType,
      path: urlInput,
      name: fileName,
      category,
      description: description || undefined,
      updated_at: new Date().toISOString(),
    };

    onAdd(newDoc);
    setShowAddModal(false);
    setUrlInput("");
    setCategory("other");
    setDescription("");
    setError("");
  };

  const openAddModal = (type: DocumentType) => {
    setAddType(type);
    setShowAddMenu(false);
    setShowAddModal(true);
    setError("");
  };

  const handleOpenDocument = async (doc: Document) => {
    if (doc.type === "file") {
      // Prüfe erst ob Datei existiert
      const existsResult = (await window.electron.invoke(
        "file:exists",
        doc.path
      )) as {
        success: boolean;
        exists?: boolean;
      };
      if (!existsResult.success || !existsResult.exists) {
        alert("Datei nicht gefunden. Wurde sie verschoben oder gelöscht?");
        return;
      }
    }
    onOpen(doc);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          Dokumente ({documents.length})
        </h3>

        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Hinzufügen
            <ChevronDown className="w-3 h-3" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-vintage shadow-vintage border-vintage border-slate-200 py-2 z-10">
              <button
                onClick={() => openAddModal("file")}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"
              >
                <Folder className="w-4 h-4" />
                Lokale Datei durchsuchen
              </button>
              <button
                onClick={() => openAddModal("url")}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"
              >
                <Link2 className="w-4 h-4" />
                URL/Link eingeben
              </button>
              <button
                onClick={() => openAddModal("google-photos")}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"
              >
                <ImageIcon className="w-4 h-4" />
                Google Photos Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dokumente Liste */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Noch keine Dokumente hinzugefügt
          </div>
        ) : (
          documents.map((doc) => {
            const { icon: Icon, color } = getDocumentIcon(doc.mime_type);
            const categoryLabel = DOCUMENT_CATEGORIES.find(
              (c) => c.value === doc.category
            )?.label;

            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-vintage border-vintage border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className={`p-2 rounded ${color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800 truncate">
                      {doc.name}
                    </p>
                    {categoryLabel && (
                      <span className="px-2 py-0.5 bg-gurktaler-100 text-gurktaler-700 rounded text-xs">
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{doc.type === "file" ? "Lokale Datei" : "Link"}</span>
                    {doc.file_size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-1">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {doc.type === "file" ? (
                    <>
                      <button
                        onClick={() => handleOpenDocument(doc)}
                        className="p-2 hover:bg-slate-200 rounded transition-colors"
                        title="Öffnen"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => onShowInFolder(doc)}
                        className="p-2 hover:bg-slate-200 rounded transition-colors"
                        title="Im Explorer zeigen"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenDocument(doc)}
                      className="p-2 hover:bg-slate-200 rounded transition-colors"
                      title="Link öffnen"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-2 hover:bg-red-100 rounded transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-vintage p-6 max-w-md w-full mx-4 shadow-vintage">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {addType === "file"
                  ? "Lokale Datei hinzufügen"
                  : addType === "url"
                  ? "URL hinzufügen"
                  : "Google Photos Link hinzufügen"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-vintage flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {addType !== "file" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {addType === "google-photos" ? "Google Photos Link" : "URL"}
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={
                      addType === "google-photos"
                        ? "https://photos.app.goo.gl/..."
                        : "https://..."
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DocumentCategory)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                  placeholder="Kurze Beschreibung..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border-vintage border-slate-200 rounded-vintage hover:bg-slate-50 transition-colors text-sm"
                >
                  Abbrechen
                </button>
                <button
                  onClick={
                    addType === "file" ? handleAddLocalFile : handleAddUrl
                  }
                  disabled={
                    isLoading || (addType !== "file" && !urlInput.trim())
                  }
                  className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? "Wird hinzugefügt..." : "Hinzufügen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
