import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { containers as containersService } from "@/renderer/services/storage";
import type { Container, ContainerType } from "@/shared/types";

const containerTypeLabels: Record<ContainerType, string> = {
  bottle: "Flasche",
  label: "Etikett",
  cap: "Verschluss",
  box: "Verpackung",
  other: "Sonstiges",
};

function Containers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    setContainers(containersService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingId) {
      containersService.update(editingId, formData);
    } else {
      containersService.create(
        formData as Omit<Container, "id" | "created_at">
      );
    }

    resetForm();
    loadData();
  };

  const handleEdit = (container: Container) => {
    setFormData({
      name: container.name,
      type: container.type,
      volume: container.volume,
      notes: container.notes,
      price: container.price,
    });
    setEditingId(container.id);
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
    setEditingId(null);
    setShowForm(false);
  };

  const filteredContainers = containers.filter(
    (cont) =>
      cont.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cont.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Gebinde durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Gebinde bearbeiten" : "Neues Gebinde"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    {Object.entries(containerTypeLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
                >
                  {editingId ? "Speichern" : "Erstellen"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
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
