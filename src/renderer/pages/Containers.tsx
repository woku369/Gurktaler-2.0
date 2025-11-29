import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package, Star } from "lucide-react";
import {
  containers as containersService,
  images as imagesService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import Modal from "@/renderer/components/Modal";
import ImageUpload from "@/renderer/components/ImageUpload";
import TagSelector from "@/renderer/components/TagSelector";
import type { Container, ContainerType, Image, Tag } from "@/shared/types";

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
  const [editingContainer, setEditingContainer] = useState<Container | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Container>>({
    name: "",
    type: "bottle",
    volume: undefined,
    notes: "",
    price: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allContainers = containersService.getAll();
    setContainers(allContainers);

    // Load images for each container
    const imagesMap: Record<string, Image[]> = {};
    allContainers.forEach((container) => {
      imagesMap[container.id] = imagesService.getByEntity(
        "container",
        container.id
      );
    });
    setContainerImages(imagesMap);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingContainer) {
      containersService.update(editingContainer.id, formData);
    } else {
      const newContainer = containersService.create(
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
      loadData();
      return; // Keep form open for images/tags
    }

    resetForm();
    loadData();
  };

  const handleEdit = (container: Container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name,
      type: container.type,
      volume: container.volume,
      notes: container.notes,
      price: container.price,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Gebinde wirklich löschen?")) {
      containersService.delete(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bottle",
      volume: undefined,
      notes: "",
      price: undefined,
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
      const assignments = tagAssignmentsService.getByEntity(
        "container",
        cont.id
      );
      matchesTag = assignments.some((a) => a.tag_id === selectedTagId);
    }

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gebinde</h1>
          <p className="text-slate-500">
            Verwaltung von Flaschen, Verschraubungen, Packmittel etc.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neues Gebinde
        </button>
      </div>

      {/* Search & Tag Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Gebinde durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        >
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContainers.map((container) => (
            <div
              key={container.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {containerTypeLabels[container.type]}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      favoritesService.toggle('container', container.id)
                      loadData()
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                    title={favoritesService.isFavorite('container', container.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  >
                    <Star className={`w-4 h-4 ${
                      favoritesService.isFavorite('container', container.id)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-slate-400'
                    }`} />
                  </button>
                  <button
                    onClick={() => handleEdit(container)}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(container.id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Image Section */}
              {containerImages[container.id]?.length > 0 && (
                <div className="mb-3 -mx-5 -mt-5">
                  <div className="grid grid-cols-3 gap-1">
                    {containerImages[container.id].slice(0, 3).map((image) => (
                      <div
                        key={image.id}
                        className="aspect-square bg-slate-100 overflow-hidden first:rounded-tl-xl"
                      >
                        <img
                          src={image.data_url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start mb-3">
                <Package className="w-5 h-5 text-slate-400 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">
                    {container.name}
                  </h3>
                  {container.volume && (
                    <p className="text-sm text-slate-600">
                      {container.volume} ml
                    </p>
                  )}
                </div>
              </div>

              {container.price && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    €{container.price.toFixed(2)}
                  </span>
                </div>
              )}

              {container.notes && (
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                  {container.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Containers;
