import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react";
import {
  containers as containersService,
  images as imagesService,
  tags as tagsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import Modal from "@/renderer/components/Modal";
import ImageUpload from "@/renderer/components/ImageUpload";
import TagSelector from "@/renderer/components/TagSelector";
import DocumentManager from "@/renderer/components/DocumentManager";
import ContainerCard from "@/renderer/components/ContainerCard";
import QuickAddUrlDialog from "@/renderer/components/QuickAddUrlDialog";
import ContainerImportDialog from "@/renderer/components/ContainerImportDialog";
import {
  generateTemplate,
  exportContainers,
} from "@/renderer/services/containerImport";
import type {
  Container,
  ContainerType,
  Image,
  Tag,
  Document,
} from "@/shared/types";

const containerTypeLabels: Record<ContainerType, string> = {
  bottle: "Flasche",
  label: "Etikett",
  cap: "Verschluss",
  box: "Verpackung",
  other: "Sonstiges",
};

function Containers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [containerImages, setContainerImages] = useState<
    Record<string, Image[]>
  >({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showQuickUrlDialog, setShowQuickUrlDialog] = useState(false);
  const [quickUrlContainer, setQuickUrlContainer] = useState<Container | null>(
    null
  );
  const [editingContainer, setEditingContainer] = useState<Container | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Container>>({
    name: "",
    type: "bottle",
    volume: undefined,
    notes: "",
    price: undefined,
    documents: [],
  });
  const [_copiedContainerId, setCopiedContainerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDocument = (doc: Omit<Document, "id" | "created_at">) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setFormData({
      ...formData,
      documents: [...(formData.documents || []), newDoc],
    });
  };

  const handleDeleteDocument = (id: string) => {
    setFormData({
      ...formData,
      documents: (formData.documents || []).filter((d) => d.id !== id),
    });
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

  const loadData = async () => {
    const allContainers = await containersService.getAll();
    setContainers(allContainers);
    const allTags = await tagsService.getAll();
    setTags(allTags);

    // Load images for each container
    const imagesMap: Record<string, Image[]> = {};
    for (const container of allContainers) {
      imagesMap[container.id] = await imagesService.getByEntity(
        "container",
        container.id
      );
    }
    setContainerImages(imagesMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingContainer) {
      await containersService.update(editingContainer.id, formData);
    } else {
      const newContainer = await containersService.create(
        formData as Omit<Container, "id" | "created_at">
      );
      // Open the newly created container for editing (to add images/tags)
      setEditingContainer(newContainer);
      setFormData({
        name: newContainer.name,
        type: newContainer.type,
        volume: newContainer.volume,
        notes: newContainer.notes,
        price: newContainer.price,
      });
      await loadData();
      return; // Keep form open for images/tags
    }

    resetForm();
    await loadData();
  };

  const handleEdit = (container: Container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name,
      type: container.type,
      volume: container.volume,
      notes: container.notes,
      price: container.price,
      documents: container.documents || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Gebinde wirklich löschen?")) {
      await containersService.delete(id);
      await loadData();
    }
  };

  const handleQuickAddUrl = (container: Container) => {
    setQuickUrlContainer(container);
    setShowQuickUrlDialog(true);
  };

  const handleAddQuickUrl = async (url: string, name: string) => {
    if (!quickUrlContainer) return;

    const newDoc: Document = {
      id: crypto.randomUUID(),
      type: "url",
      path: url,
      name: name,
      category: "other",
      created_at: new Date().toISOString(),
    };

    const updatedDocs = [...(quickUrlContainer.documents || []), newDoc];
    await containersService.update(quickUrlContainer.id, {
      documents: updatedDocs,
    });
    await loadData();
  };

  const handleQuickAddDocument = (container: Container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name,
      type: container.type,
      volume: container.volume,
      notes: container.notes,
      price: container.price,
      documents: container.documents || [],
    });
    setShowForm(true);
  };

  const handleQuickAddImage = (container: Container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name,
      type: container.type,
      volume: container.volume,
      notes: container.notes,
      price: container.price,
      documents: container.documents || [],
    });
    setShowForm(true);
  };

  const handleCopyName = (containerId: string) => {
    setCopiedContainerId(containerId);
    setTimeout(() => setCopiedContainerId(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bottle",
      volume: undefined,
      notes: "",
      price: undefined,
      documents: [],
    });
    setEditingContainer(null);
    setShowForm(false);
  };

  const filteredContainers = containers.filter((cont) => {
    const matchesSearch =
      cont.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cont.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      // Note: This is synchronous filtering, assignments already loaded
      // We'll need to refactor this if we want to support dynamic tag filtering
      matchesTag = false; // Placeholder - needs async refactor
    }

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Gebinde
          </h1>
          <p className="text-distillery-600 font-body">
            Verwaltung von Flaschen, Verschraubungen, Packmittel etc.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => generateTemplate()}
            className="flex items-center gap-2 px-4 py-2 bg-distillery-100 text-distillery-700 rounded-vintage hover:bg-distillery-200 transition-all font-body font-semibold"
            title="Excel-Vorlage herunterladen"
          >
            <Download className="w-5 h-5" />
            Template
          </button>
          <button
            onClick={() => exportContainers(containers)}
            disabled={containers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-bronze-100 text-bronze-700 rounded-vintage hover:bg-bronze-200 transition-all font-body font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title="Alle Gebinde exportieren"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gurktaler-100 text-gurktaler-700 rounded-vintage hover:bg-gurktaler-200 transition-all font-body font-semibold"
            title="Gebinde aus Excel importieren"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
          >
            <Plus className="w-5 h-5" />
            Neues Gebinde
          </button>
        </div>
      </div>

      {/* Search & Tag Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Gebinde durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          />
        </div>
        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
        >
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Import Dialog */}
      <ContainerImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={loadData}
        existingContainers={containers}
      />

      {/* Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          title={editingContainer ? "Gebinde bearbeiten" : "Neues Gebinde"}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Typ
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ContainerType,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                >
                  {Object.entries(containerTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Volumen (ml)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.volume ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      volume: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Preis (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bemerkung
              </label>
              <textarea
                value={formData.notes ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
              />
            </div>

            {/* Tags (only when editing) */}
            {editingContainer && (
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <TagSelector
                  entityType="container"
                  entityId={editingContainer.id}
                />
              </div>
            )}

            {/* Images (only when editing) */}
            {editingContainer && (
              <div className="border-t border-slate-200 pt-4">
                <ImageUpload
                  entityType="container"
                  entityId={editingContainer.id}
                  maxImages={3}
                />
              </div>
            )}

            {/* Documents (only when editing) */}
            {editingContainer && (
              <div className="border-t border-slate-200 pt-4">
                <DocumentManager
                  documents={formData.documents || []}
                  onAdd={handleAddDocument}
                  onDelete={handleDeleteDocument}
                  onOpen={handleOpenDocument}
                  onShowInFolder={handleShowInFolder}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                {editingContainer ? "Speichern" : "Erstellen"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Empty State */}
      {filteredContainers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {containers.length === 0
              ? "Noch keine Gebinde"
              : "Keine Ergebnisse"}
          </h3>
          <p className="text-slate-600">
            {containers.length === 0
              ? "Legen Sie Ihr erstes Gebinde an."
              : "Keine Gebinde gefunden für Ihre Suche."}
          </p>
        </div>
      )}

      {/* Containers Grid */}
      {filteredContainers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContainers.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              image={containerImages[container.id]?.[0]}
              isFavorite={false}
              onToggleFavorite={() => {
                favoritesService.toggle("container", container.id);
                loadData();
              }}
              onEdit={() => handleEdit(container)}
              onDelete={() => handleDelete(container.id)}
              onAddUrl={() => handleQuickAddUrl(container)}
              onAddDocument={() => handleQuickAddDocument(container)}
              onAddImage={() => handleQuickAddImage(container)}
              onCopy={() => handleCopyName(container.id)}
              onUpdate={loadData}
            />
          ))}
        </div>
      )}

      {/* Quick Add URL Dialog */}
      <QuickAddUrlDialog
        isOpen={showQuickUrlDialog}
        onClose={() => {
          setShowQuickUrlDialog(false);
          setQuickUrlContainer(null);
        }}
        onAdd={handleAddQuickUrl}
        entityName={quickUrlContainer?.name || ""}
      />
    </div>
  );
}

export default Containers;
