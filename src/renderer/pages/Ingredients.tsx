import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Beaker,
  FileSpreadsheet,
  Download,
  Upload,
  Grid3x3,
  List,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  ingredients as ingredientsService,
  images as imagesService,
  tags as tagsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import Modal from "@/renderer/components/Modal";
import ImageUpload from "@/renderer/components/ImageUpload";
import TagSelector from "@/renderer/components/TagSelector";
import DocumentManager from "@/renderer/components/DocumentManager";
import IngredientCard from "@/renderer/components/IngredientCard";
import QuickAddUrlDialog from "@/renderer/components/QuickAddUrlDialog";
import IngredientImportDialog from "@/renderer/components/IngredientImportDialog";
import Toast, { ToastType } from "@/renderer/components/Toast";
import {
  generateTemplate,
  exportIngredients,
} from "@/renderer/services/ingredientImport";
import { useDragSort } from "@/renderer/hooks/useDragSort";
import type { Ingredient, Image, Tag, Document } from "@/shared/types";

function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientImages, setIngredientImages] = useState<
    Record<string, Image[]>
  >({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categorySort, setCategorySort] = useState<"name" | "category">("name");
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showQuickUrlDialog, setShowQuickUrlDialog] = useState(false);
  const [quickUrlIngredient, setQuickUrlIngredient] =
    useState<Ingredient | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: "",
    alcohol_percentage: undefined,
    category: "",
    price_per_unit: undefined,
    unit: "liter",
    notes: "",
    documents: [],
  });
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
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
    const allIngredients = await ingredientsService.getAll();
    setIngredients(allIngredients);
    const allTags = await tagsService.getAll();
    setTags(allTags);

    // Load images for all ingredients
    const imageMap: Record<string, Image[]> = {};
    for (const ingredient of allIngredients) {
      imageMap[ingredient.id] = await imagesService.getByEntity(
        "ingredient",
        ingredient.id,
      );
    }
    setIngredientImages(imageMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingIngredient) {
      await ingredientsService.update(editingIngredient.id, formData);
      setToast({ message: "Zutat erfolgreich aktualisiert", type: "success" });
      await loadData();
      resetForm(); // This closes the form
    } else {
      const newIngredient = await ingredientsService.create(
        formData as Omit<Ingredient, "id" | "created_at">,
      );
      setToast({ message: "Zutat erfolgreich erstellt", type: "success" });
      // Open the newly created ingredient for editing (to add images/tags)
      setEditingIngredient(newIngredient);
      setFormData({
        name: newIngredient.name,
        alcohol_percentage: newIngredient.alcohol_percentage,
        category: newIngredient.category,
        price_per_unit: newIngredient.price_per_unit,
        unit: newIngredient.unit,
        notes: newIngredient.notes,
        documents: newIngredient.documents || [],
      });
      await loadData();
      return; // Keep form open for images/tags
    }
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
      documents: ingredient.documents || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Zutat wirklich löschen?")) {
      await ingredientsService.delete(id);
      await loadData();
    }
  };

  const handleQuickAddUrl = (ingredient: Ingredient) => {
    setQuickUrlIngredient(ingredient);
    setShowQuickUrlDialog(true);
  };

  const handleAddQuickUrl = async (url: string, name: string) => {
    if (!quickUrlIngredient) return;

    const newDoc: Document = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      type: "url",
      path: url,
      name: name || url,
    };

    const currentDocs = quickUrlIngredient.documents || [];
    await ingredientsService.update(quickUrlIngredient.id, {
      documents: [...currentDocs, newDoc],
    });

    setShowQuickUrlDialog(false);
    setQuickUrlIngredient(null);
    await loadData();
  };

  const handleQuickAddDocument = (ingredient: Ingredient) => {
    handleEdit(ingredient);
  };

  const handleQuickAddImage = (ingredient: Ingredient) => {
    handleEdit(ingredient);
  };

  const handleCopyName = () => {
    // Clipboard copy happens in IngredientCard
  };

  const resetForm = () => {
    setFormData({
      name: "",
      alcohol_percentage: undefined,
      category: "",
      price_per_unit: undefined,
      unit: "liter",
      notes: "",
      documents: [],
    });
    setEditingIngredient(null);
    setShowForm(false);
  };

  const filteredIngredients = ingredients
    .filter((ing) => {
      const matchesSearch =
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTag = true;
      // TODO: Tag filtering disabled (needs async refactor with pre-loaded assignments)
      // if (selectedTagId) {
      //   const assignments = await tagAssignmentsService.getByEntity(
      //     "ingredient",
      //     ing.id
      //   );
      //   matchesTag = assignments.some((a) => a.tag_id === selectedTagId);
      // }

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (categorySort === "category") {
        // Sort by category first, then by name
        const catA = a.category || "Zzz";
        const catB = b.category || "Zzz";
        if (catA !== catB) return catA.localeCompare(catB);
        return a.name.localeCompare(b.name);
      }
      // Sort by display_order if set, otherwise by created_at
      const orderA = a.display_order ?? 9999;
      const orderB = b.display_order ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const handleReorder = async (reordered: Ingredient[]) => {
    // Update display_order only for ingredients that changed position
    const updates = reordered
      .map((ingredient, index) => {
        const currentIngredient = filteredIngredients.find(
          (i) => i.id === ingredient.id,
        );
        const oldOrder = currentIngredient?.display_order ?? 9999;
        if (oldOrder !== index) {
          return ingredientsService.update(ingredient.id, {
            display_order: index,
          });
        }
        return null;
      })
      .filter((p): p is Promise<Ingredient> => p !== null);

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
  } = useDragSort(filteredIngredients, handleReorder);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Zutaten
          </h1>
          <p className="text-distillery-600 font-body">
            Verwaltung der Rohstoffe und Zutaten
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
            onClick={() => exportIngredients(ingredients)}
            disabled={ingredients.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-bronze-100 text-bronze-700 rounded-vintage hover:bg-bronze-200 transition-all font-body font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title="Alle Zutaten exportieren"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gurktaler-100 text-gurktaler-700 rounded-vintage hover:bg-gurktaler-200 transition-all font-body font-semibold"
            title="Zutaten aus Excel importieren"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
          >
            <Plus className="w-5 h-5" />
            Neue Zutat
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
            placeholder="Zutaten durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          />
        </div>
        <select
          value={categorySort}
          onChange={(e) =>
            setCategorySort(e.target.value as "name" | "category")
          }
          className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
        >
          <option value="name">Sortierung: Manuell</option>
          <option value="category">Sortierung: Kategorie</option>
        </select>
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
        <div className="flex border border-distillery-200 rounded-vintage overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 transition-colors ${
              viewMode === "grid"
                ? "bg-gurktaler-500 text-white"
                : "bg-white text-distillery-600 hover:bg-distillery-50"
            }`}
            title="Kartenansicht"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 transition-colors ${
              viewMode === "list"
                ? "bg-gurktaler-500 text-white"
                : "bg-white text-distillery-600 hover:bg-distillery-50"
            }`}
            title="Listenansicht"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Import Dialog */}
      <IngredientImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={loadData}
        existingIngredients={ingredients}
      />

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
                  maxImages={20}
                />
              </div>
            )}

            {/* Documents (only when editing) */}
            {editingIngredient && (
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

      {/* Ingredients Grid */}
      {filteredIngredients.length > 0 && viewMode === "grid" && (
        <>
          <div className="mb-2 text-xs text-distillery-500 italic font-body">
            💡 Tipp: Karten können per Drag & Drop sortiert werden
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIngredients.map((ingredient, index) => (
              <div
                key={ingredient.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`transition-opacity ${draggedIndex === index ? "opacity-50" : ""} ${dragOverIndex === index ? "ring-2 ring-gurktaler-500" : ""}`}
              >
                <IngredientCard
                  ingredient={ingredient}
                  image={ingredientImages[ingredient.id]?.[0]}
                  isFavorite={false}
                  onToggleFavorite={() => {
                    favoritesService.toggle("ingredient", ingredient.id);
                    loadData();
                  }}
                  onEdit={() => handleEdit(ingredient)}
                  onDelete={() => handleDelete(ingredient.id)}
                  onAddUrl={() => handleQuickAddUrl(ingredient)}
                  onAddDocument={() => handleQuickAddDocument(ingredient)}
                  onAddImage={() => handleQuickAddImage(ingredient)}
                  onCopy={handleCopyName}
                  onUpdate={loadData}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Ingredients List */}
      {filteredIngredients.length > 0 && viewMode === "list" && (
        <>
          <div className="mb-2 text-xs text-distillery-500 italic font-body">
            💡 Tipp: Zeilen können per Drag & Drop sortiert werden
          </div>
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
                    Alkohol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-distillery-900">
                    Preis/Einheit
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-distillery-900">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-distillery-100">
                {filteredIngredients.map((ingredient, index) => (
                  <tr
                    key={ingredient.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`hover:bg-distillery-25 transition-colors cursor-move ${
                      draggedIndex === index ? "opacity-50" : ""
                    } ${
                      dragOverIndex === index ? "ring-2 ring-gurktaler-500" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-distillery-900">
                      {ingredient.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-distillery-700">
                      {ingredient.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-distillery-600">
                      {ingredient.alcohol_percentage
                        ? `${ingredient.alcohol_percentage}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-distillery-600">
                      {ingredient.price_per_unit
                        ? `€ ${ingredient.price_per_unit.toFixed(2)}/${ingredient.unit}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="p-1.5 text-distillery-600 hover:bg-distillery-100 rounded transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Quick Add URL Dialog */}
      <QuickAddUrlDialog
        isOpen={showQuickUrlDialog}
        onClose={() => {
          setShowQuickUrlDialog(false);
          setQuickUrlIngredient(null);
        }}
        onAdd={handleAddQuickUrl}
        entityName={quickUrlIngredient?.name || ""}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Ingredients;
