import { useState, useEffect } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import {
  ingredients as ingredientsService,
  recipeIngredients as recipeIngredientsService,
} from "@/renderer/services/storage";
import type { Ingredient, RecipeIngredient } from "@/shared/types";

interface RecipeIngredientEditorProps {
  recipeId: string;
}

export default function RecipeIngredientEditor({
  recipeId,
}: RecipeIngredientEditorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("ml");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [recipeId]);

  const loadData = async () => {
    setIngredients(await ingredientsService.getAll());
    const allRecipeIngredients = await recipeIngredientsService.getAll();
    const filtered = allRecipeIngredients.filter(
      (ri: RecipeIngredient) => ri.recipe_id === recipeId
    );
    // Sort by sort_order
    filtered.sort(
      (a: RecipeIngredient, b: RecipeIngredient) => a.sort_order - b.sort_order
    );
    setRecipeIngredients(filtered);
  };

  const handleAdd = async () => {
    if (!selectedIngredientId || !amount) return;

    const maxOrder =
      recipeIngredients.length > 0
        ? Math.max(...recipeIngredients.map((ri) => ri.sort_order))
        : 0;

    await recipeIngredientsService.create({
      recipe_id: recipeId,
      ingredient_id: selectedIngredientId,
      amount: parseFloat(amount),
      unit,
      notes: notes.trim() || undefined,
      sort_order: maxOrder + 1,
    });

    // Reset form
    setSelectedIngredientId("");
    setAmount("");
    setUnit("ml");
    setNotes("");
    setShowAddForm(false);
    await loadData();
  };

  const handleRemove = async (id: string) => {
    if (confirm("Zutat aus Rezeptur entfernen?")) {
      await recipeIngredientsService.delete(id);
      await loadData();
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...recipeIngredients];
    [updated[index - 1].sort_order, updated[index].sort_order] = [
      updated[index].sort_order,
      updated[index - 1].sort_order,
    ];
    await recipeIngredientsService.update(updated[index - 1].id, {
      sort_order: updated[index - 1].sort_order,
    });
    await recipeIngredientsService.update(updated[index].id, {
      sort_order: updated[index].sort_order,
    });
    await loadData();
  };

  const moveDown = async (index: number) => {
    if (index === recipeIngredients.length - 1) return;
    const updated = [...recipeIngredients];
    [updated[index].sort_order, updated[index + 1].sort_order] = [
      updated[index + 1].sort_order,
      updated[index].sort_order,
    ];
    await recipeIngredientsService.update(updated[index].id, {
      sort_order: updated[index].sort_order,
    });
    await recipeIngredientsService.update(updated[index + 1].id, {
      sort_order: updated[index + 1].sort_order,
    });
    await loadData();
  };

  const getIngredientName = (ingredientId: string): string => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    return ingredient?.name || "Unbekannt";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Zutaten</h3>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Zutat hinzufügen
        </button>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2 mb-4">
        {recipeIngredients.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            Noch keine Zutaten hinzugefügt
          </p>
        )}
        {recipeIngredients.map((ri, index) => (
          <div
            key={ri.id}
            className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30"
                title="Nach oben"
              >
                <GripVertical className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === recipeIngredients.length - 1}
                className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30"
                title="Nach unten"
              >
                <GripVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {getIngredientName(ri.ingredient_id)}
              </p>
              <p className="text-sm text-slate-600">
                {ri.amount} {ri.unit}
                {ri.notes && ` • ${ri.notes}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(ri.id)}
              className="p-1.5 hover:bg-red-50 rounded"
              title="Entfernen"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3">
          <h4 className="font-medium text-slate-800">Zutat hinzufügen</h4>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Zutat *
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              required
            >
              <option value="">Zutat wählen...</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                  {ingredient.alcohol_percentage
                    ? ` (${ingredient.alcohol_percentage}% vol.)`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Menge *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                placeholder="500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Einheit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              >
                <option value="ml">ml</option>
                <option value="l">Liter</option>
                <option value="g">Gramm</option>
                <option value="kg">Kilogramm</option>
                <option value="stk">Stück</option>
                <option value="TL">Teelöffel</option>
                <option value="EL">Esslöffel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notiz
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              placeholder="z.B. frisch gemahlen"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedIngredientId || !amount}
              className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedIngredientId("");
                setAmount("");
                setUnit("ml");
                setNotes("");
              }}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
