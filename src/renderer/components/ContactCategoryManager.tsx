import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Tag } from "lucide-react";
import { contactCategories as categoriesService } from "../services/storage";
import type { ContactCategoryEntity } from "@/shared/types";

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const DEFAULT_ICONS = ["📞", "🏢", "👤", "🔧", "🎨", "📦", "🚚", "💼"];

export function ContactCategoryManager() {
  const [categories, setCategories] = useState<ContactCategoryEntity[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    value: "",
    color: "",
    icon: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    value: "",
    color: "#3b82f6",
    icon: "📞",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await categoriesService.getAll();
    setCategories(cats);
  };

  const handleStartEdit = (category: ContactCategoryEntity) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      value: category.value,
      color: category.color || "",
      icon: category.icon || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await categoriesService.update(editingId, editForm);
    setEditingId(null);
    loadCategories();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Kategorie wirklich löschen? Kontakte mit dieser Kategorie werden auf 'other' gesetzt.",
      )
    ) {
      await categoriesService.delete(id);
      loadCategories();
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.value.trim()) {
      alert("Bitte Name und Wert eingeben");
      return;
    }

    const maxOrder =
      categories.length > 0 ? Math.max(...categories.map((c) => c.order)) : -1;

    await categoriesService.create({
      name: addForm.name.trim(),
      value: addForm.value.trim(),
      color: addForm.color,
      icon: addForm.icon,
      order: maxOrder + 1,
    });

    setAddForm({ name: "", value: "", color: "#3b82f6", icon: "📞" });
    setShowAddForm(false);
    loadCategories();
  };

  return (
    <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gurktaler-100 rounded-vintage flex items-center justify-center">
            <Tag className="w-5 h-5 text-gurktaler-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Kontakt-Kategorien</h2>
            <p className="text-sm text-slate-500">
              Kategorien für Kontaktverwaltung
            </p>
          </div>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Neue Kategorie
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <h3 className="font-medium text-slate-700 mb-3">
            Neue Kategorie erstellen
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name (angezeigt)
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                placeholder="z.B. Lieferant"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Wert (technisch, lowercase)
              </label>
              <input
                type="text"
                value={addForm.value}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="z.B. supplier"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Farbe
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={addForm.color}
                    onChange={(e) =>
                      setAddForm({ ...addForm, color: e.target.value })
                    }
                    className="w-12 h-10 rounded border border-slate-300"
                  />
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAddForm({ ...addForm, color })}
                        className="w-8 h-8 rounded border-2 border-white hover:border-slate-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Icon (Emoji)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addForm.icon}
                    onChange={(e) =>
                      setAddForm({ ...addForm, icon: e.target.value })
                    }
                    maxLength={2}
                    className="w-16 px-3 py-2 border border-slate-300 rounded-lg text-center text-xl"
                  />
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setAddForm({ ...addForm, icon })}
                        className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-200 transition-colors text-lg"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-sm bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            {editingId === category.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-gurktaler-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Wert
                    </label>
                    <input
                      type="text"
                      value={editForm.value}
                      onChange={(e) =>
                        setEditForm({ ...editForm, value: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-gurktaler-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Farbe
                    </label>
                    <input
                      type="color"
                      value={editForm.color}
                      onChange={(e) =>
                        setEditForm({ ...editForm, color: e.target.value })
                      }
                      className="w-full h-8 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) =>
                        setEditForm({ ...editForm, icon: e.target.value })
                      }
                      maxLength={2}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded text-center"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="Abbrechen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Speichern"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div>
                    <div className="font-medium text-slate-800">
                      {category.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Wert: {category.value}
                    </div>
                  </div>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded border border-slate-300"
                      style={{ backgroundColor: category.color }}
                      title={category.color}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(category)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
