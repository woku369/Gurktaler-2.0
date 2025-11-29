import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Beaker, Star } from "lucide-react";
import {
  ingredients as ingredientsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import Modal from "@/renderer/components/Modal";
import ImageUpload from "@/renderer/components/ImageUpload";
import TagSelector from "@/renderer/components/TagSelector";
import type { Ingredient, Tag } from "@/shared/types";

function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: "",
    alcohol_percentage: undefined,
    category: "",
    price_per_unit: undefined,
    unit: "liter",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIngredients(ingredientsService.getAll());
    setTags(tagsService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingIngredient) {
      ingredientsService.update(editingIngredient.id, formData);
    } else {
      const newIngredient = ingredientsService.create(
        formData as Omit<Ingredient, "id" | "created_at">
      );
      // Open the newly created ingredient for editing (to add images/tags)
      setEditingIngredient(newIngredient);
      setFormData({
        name: newIngredient.name,
        alcohol_percentage: newIngredient.alcohol_percentage,
        category: newIngredient.category,
        price_per_unit: newIngredient.price_per_unit,
        unit: newIngredient.unit,
        notes: newIngredient.notes,
      });
      loadData();
      return; // Keep form open for images/tags
    }

    resetForm();
    loadData();
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      alcohol_percentage: ingredient.alcohol_percentage,
      category: ingredient.category,
      price_per_unit: ingredient.price_per_unit,
      unit: ingredient.unit,
      notes: ingredient.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Zutat wirklich löschen?")) {
      ingredientsService.delete(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      alcohol_percentage: undefined,
      category: "",
      price_per_unit: undefined,
      unit: "liter",
      notes: "",
    });
    setEditingIngredient(null);
    setShowForm(false);
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const assignments = tagAssignmentsService.getByEntity(
        "ingredient",
        ing.id
      );
      matchesTag = assignments.some((a) => a.tag_id === selectedTagId);
    }

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Zutaten</h1>
          <p className="text-slate-500">Verwaltung der Rohstoffe und Zutaten</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neue Zutat
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
            placeholder="Zutaten durchsuchen..."
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
          title={editingIngredient ? "Zutat bearbeiten" : "Neue Zutat"}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name der Zutat *
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
                  Alkoholgehalt (%vol.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.alcohol_percentage ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alcohol_percentage: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategorie (optional)
                </label>
                <input
                  type="text"
                  value={formData.category ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="z.B. Spirituose, Gewürz, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preis pro Einheit (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_unit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_per_unit: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Einheit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value as "liter" | "kilogram",
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                >
                  <option value="liter">Liter</option>
                  <option value="kilogram">Kilogramm</option>
                </select>
              </div>
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
            {editingIngredient && (
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <TagSelector
                  entityType="ingredient"
                  entityId={editingIngredient.id}
                />
              </div>
            )}

            {/* Images (only when editing) */}
            {editingIngredient && (
              <div className="border-t border-slate-200 pt-4">
                <ImageUpload
                  entityType="ingredient"
                  entityId={editingIngredient.id}
                  maxImages={3}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                {editingIngredient ? "Speichern" : "Erstellen"}
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
      {filteredIngredients.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Beaker className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {ingredients.length === 0
              ? "Noch keine Zutaten"
              : "Keine Ergebnisse"}
          </h3>
          <p className="text-slate-600">
            {ingredients.length === 0
              ? "Legen Sie Ihre erste Zutat an."
              : "Keine Zutaten gefunden für Ihre Suche."}
          </p>
        </div>
      )}

      {/* Ingredients Table */}
      {filteredIngredients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Alkohol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Bemerkung
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Beaker className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="font-medium text-slate-800">
                        {ingredient.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ingredient.category && (
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                        {ingredient.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {ingredient.alcohol_percentage
                      ? `${ingredient.alcohol_percentage}%vol.`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {ingredient.price_per_unit
                      ? `€${ingredient.price_per_unit.toFixed(2)}/${
                          ingredient.unit === "liter" ? "L" : "kg"
                        }`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {ingredient.notes || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        favoritesService.toggle("ingredient", ingredient.id);
                        loadData();
                      }}
                      className="mr-3"
                      title={
                        favoritesService.isFavorite("ingredient", ingredient.id)
                          ? "Aus Favoriten entfernen"
                          : "Zu Favoriten hinzufügen"
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favoritesService.isFavorite(
                            "ingredient",
                            ingredient.id
                          )
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-slate-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleEdit(ingredient)}
                      className="text-gurktaler-600 hover:text-gurktaler-700 mr-3"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Ingredients;
