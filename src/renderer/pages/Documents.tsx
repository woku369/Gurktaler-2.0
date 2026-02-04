import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Download,
  Edit2,
  Trash2,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  ExternalLink,
  Star,
  Grid3x3,
  List,
} from "lucide-react";
import Modal from "@/renderer/components/Modal";
import DocumentForm from "@/renderer/components/DocumentForm";
import {
  documents as documentsService,
  projects as projectsService,
  documentCategories as categoriesService,
} from "@/renderer/services/storage";
import { useDragSort } from "@/renderer/hooks/useDragSort";
import type { Document, Project, DocumentCategoryEntity } from "@/shared/types";

function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDocuments(await documentsService.getAll());
    setProjects(await projectsService.getAll());
    setCategories(await categoriesService.getAll());
  };

  const handleSubmit = async (
    data: Omit<Document, "id" | "created_at" | "updated_at">,
  ) => {
    if (editingDocument) {
      await documentsService.update(editingDocument.id, data);
    } else {
      await documentsService.create(data);
    }
    await loadData();
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Dokument wirklich löschen?")) {
      await documentsService.delete(id);
      await loadData();
    }
  };

  const handleDownload = async (document: Document) => {
    if (document.type === "url") {
      window.open(document.path, "_blank");
      return;
    }

    // For file type, trigger download via NAS
    const link = window.document.createElement("a");
    link.href = document.path;
    link.download = document.name;
    link.click();
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || doc.category === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by display_order if set, otherwise by created_at
      const orderA = a.display_order ?? 9999;
      const orderB = b.display_order ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const handleReorder = async (reordered: Document[]) => {
    // Update display_order only for documents that changed position
    const updates = reordered
      .map((document, index) => {
        const currentDocument = filteredDocuments.find(
          (d) => d.id === document.id,
        );
        const oldOrder = currentDocument?.display_order ?? 9999;
        if (oldOrder !== index) {
          return documentsService.update(document.id, { display_order: index });
        }
        return null;
      })
      .filter((p): p is Promise<Document> => p !== null);

    if (updates.length > 0) {
      await Promise.all(updates);
      await loadData();
    }
  };

  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  } = useDragSort(filteredDocuments, handleReorder);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "–";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileIcon;
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Dokumente
          </h1>
          <p className="text-distillery-600 font-body">
            PDF-Dateien, Analysen, Marketing-Material und Dokumentation
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neues Dokument
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-distillery-200 overflow-hidden mr-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 flex items-center gap-2 transition-colors ${
              viewMode === "grid"
                ? "bg-gurktaler-500 text-white"
                : "bg-white text-distillery-600 hover:bg-distillery-50"
            }`}
            title="Kartenansicht"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 flex items-center gap-2 transition-colors ${
              viewMode === "list"
                ? "bg-gurktaler-500 text-white"
                : "bg-white text-distillery-600 hover:bg-distillery-50"
            }`}
            title="Listenansicht"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
            filterCategory === "all"
              ? "bg-gurktaler-500 text-white shadow-md"
              : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
          }`}
        >
          Alle ({documents.length})
        </button>
        {categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <button
              key={category.value}
              onClick={() => setFilterCategory(category.value)}
              className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
                filterCategory === category.value
                  ? "bg-gurktaler-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name} (
              {documents.filter((d) => d.category === category.value).length})
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
            placeholder="Dokumente durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {documents.length === 0
              ? "Noch keine Dokumente"
              : "Keine Ergebnisse"}
          </h3>
          <p className="text-slate-600 mb-6">
            {documents.length === 0
              ? "Lade PDF-Dateien, Analysen oder Marketing-Material hoch."
              : "Keine Dokumente gefunden für deine Suche."}
          </p>
          {documents.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors"
            >
              Erstes Dokument hochladen
            </button>
          )}
        </div>
      )}

      {/* Documents Grid */}
      {viewMode === "grid" && (
        <>
          {filteredDocuments.length > 0 && (
            <div className="mb-2 text-xs text-distillery-500 italic font-body">
              💡 Tipp: Karten können per Drag & Drop sortiert werden
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document, index) => {
              const category = categories.find(
                (c) => c.value === document.category,
              );
              const FileTypeIcon = getFileIcon(document.mime_type);
              const project = document.project_id
                ? projects.find((p) => p.id === document.project_id)
                : null;

              return (
                <div
                  key={document.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-all group ${draggedIndex === index ? "opacity-50" : ""} ${dragOverIndex === index ? "ring-2 ring-gurktaler-500" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200"
                      style={
                        category?.color
                          ? {
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                              borderColor: `${category.color}40`,
                            }
                          : undefined
                      }
                    >
                      {category?.icon && <span>{category.icon}</span>}
                      {category?.name || document.category}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async () => {
                          // TODO: Add document to Favorite entity_type union
                          // For now: Skip favorites for documents
                          console.log("Favorites for documents: Coming soon");
                        }}
                        className="p-1 hover:bg-slate-100 rounded"
                        title="Favorit (bald verfügbar)"
                      >
                        <Star className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(document)}
                        className="p-1 hover:bg-slate-100 rounded"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="p-1 hover:bg-red-50 rounded"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <FileTypeIcon className="w-10 h-10 text-gurktaler-600" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {document.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(document.file_size)}
                      </p>
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  {project && (
                    <div className="mb-2">
                      <span className="text-xs text-slate-500">
                        📁 {project.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDownload(document)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gurktaler-50 text-gurktaler-700 rounded-lg hover:bg-gurktaler-100 transition-colors text-sm font-medium"
                    >
                      {document.type === "url" ? (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Öffnen
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDate(document.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Documents List */}
      {viewMode === "list" && (
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-distillery-50 border-b border-distillery-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-distillery-900">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-distillery-900">
                  Kategorie
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-distillery-900">
                  Größe
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-distillery-900">
                  Erstellt
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-distillery-900">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-distillery-100">
              {filteredDocuments.map((document, index) => {
                const category = categories.find(
                  (c) => c.value === document.category,
                );
                const FileTypeIcon = getFileIcon(document.mime_type);
                return (
                  <tr
                    key={document.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`hover:bg-distillery-25 transition-all ${draggedIndex === index ? "opacity-50" : ""} ${dragOverIndex === index ? "bg-gurktaler-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <div className="font-medium text-distillery-900">
                            {document.name}
                          </div>
                          {document.description && (
                            <div className="text-sm text-distillery-600">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium border"
                        style={
                          category?.color
                            ? {
                                backgroundColor: `${category.color}15`,
                                color: category.color,
                                borderColor: `${category.color}40`,
                              }
                            : undefined
                        }
                      >
                        {category?.icon && (
                          <span className="mr-1">{category.icon}</span>
                        )}
                        {category?.name || document.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-distillery-600">
                      {formatFileSize(document.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-distillery-600">
                      {formatDate(document.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(document)}
                          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          title={
                            document.type === "url" ? "Öffnen" : "Download"
                          }
                        >
                          {document.type === "url" ? (
                            <ExternalLink className="w-4 h-4 text-slate-600" />
                          ) : (
                            <Download className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(document)}
                          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(document.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingDocument ? "Dokument bearbeiten" : "Neues Dokument"}
          size="md"
        >
          <DocumentForm
            document={editingDocument || undefined}
            projects={projects}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}

export default Documents;
