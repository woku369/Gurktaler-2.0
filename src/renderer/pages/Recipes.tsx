import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FlaskConical,
  Droplet,
  Beaker,
  Star,
} from "lucide-react";
import {
  recipes as recipesService,
  products as productsService,
  recipeIngredients as recipeIngredientsService,
  ingredients as ingredientsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import RecipeForm from "@/renderer/components/RecipeForm";
import Modal from "@/renderer/components/Modal";
import type {
  Recipe,
  Product,
  RecipeIngredient,
  Ingredient,
  Tag,
} from "@/shared/types";

const typeIcons = {
  macerate: Droplet,
  distillate: Beaker,
  blend: FlaskConical,
};

const typeLabels = {
  macerate: "Mazerat",
  distillate: "Destillat",
  blend: "Ausmischung",
};

const typeColors = {
  macerate: "bg-green-100 text-green-700",
  distillate: "bg-blue-100 text-blue-700",
  blend: "bg-amber-100 text-amber-700",
};

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(recipesService.getAll());
    setProducts(productsService.getAll());
    setRecipeIngredients(recipeIngredientsService.getAll());
    setIngredients(ingredientsService.getAll());
    setTags(tagsService.getAll());
  };

  const handleSubmit = (
    data: Omit<Recipe, "id" | "created_at" | "updated_at">
  ) => {
    if (editingRecipe) {
      recipesService.update(editingRecipe.id, data);
    } else {
      recipesService.create(data);
    }
    setShowForm(false);
    setEditingRecipe(null);
    loadData();
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Rezeptur wirklich löschen?")) {
      recipesService.delete(id);
      loadData();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.instructions?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const assignments = tagAssignmentsService.getByEntity(
        "recipe",
        recipe.id
      );
      matchesTag = assignments.some((a) => a.tag_id === selectedTagId);
    }

    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rezepturen</h1>
          <p className="text-slate-500">
            Mazerate, Destillate und Ausmischungen
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neue Rezeptur
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
            placeholder="Rezepturen durchsuchen..."
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

      {/* Recipe Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          title={editingRecipe ? "Rezeptur bearbeiten" : "Neue Rezeptur"}
          onClose={handleCancel}
        >
          <RecipeForm
            recipe={editingRecipe || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Modal>
      )}

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FlaskConical className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {recipes.length === 0
              ? "Noch keine Rezepturen"
              : "Keine Ergebnisse"}
          </h3>
          <p className="text-slate-600 mb-6">
            {recipes.length === 0
              ? "Erstelle deine erste Rezeptur mit Zutaten und Anleitung."
              : "Keine Rezepturen gefunden für deine Suche."}
          </p>
          {recipes.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors"
            >
              Erste Rezeptur erstellen
            </button>
          )}
        </div>
      )}

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const Icon = typeIcons[recipe.type];
          const product = recipe.product_id
            ? products.find((p) => p.id === recipe.product_id)
            : null;
          return (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    typeColors[recipe.type]
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {typeLabels[recipe.type]}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      favoritesService.toggle("recipe", recipe.id);
                      loadData();
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                    title={
                      favoritesService.isFavorite("recipe", recipe.id)
                        ? "Aus Favoriten entfernen"
                        : "Zu Favoriten hinzufügen"
                    }
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favoritesService.isFavorite("recipe", recipe.id)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-2">
                {recipe.name}
              </h3>

              {recipe.instructions && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                  {recipe.instructions}
                </p>
              )}

              {product && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">
                    🔗 {product.name}
                  </span>
                </div>
              )}

              {(() => {
                const ingredientCount = recipeIngredients.filter(
                  (ri) => ri.recipe_id === recipe.id
                ).length;
                return ingredientCount > 0 ? (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gurktaler-600">
                      📋 {ingredientCount} Zutat
                      {ingredientCount !== 1 ? "en" : ""}
                    </span>
                  </div>
                ) : null;
              })()}

              {recipe.yield_amount && (
                <div className="mb-2">
                  <span className="text-xs text-slate-600">
                    ⚗️ Ausbeute: {recipe.yield_amount}{" "}
                    {recipe.yield_unit || "ml"}
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Erstellt: {formatDate(recipe.created_at)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Recipes;
