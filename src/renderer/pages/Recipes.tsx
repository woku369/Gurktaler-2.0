import { useState, useEffect } from "react";
import { Plus, Search, FlaskConical } from "lucide-react";
import {
  recipes as recipesService,
  recipeIngredients as recipeIngredientsService,
  ingredients as ingredientsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
  images as imagesService,
} from "@/renderer/services/storage";
import RecipeForm from "@/renderer/components/RecipeForm";
import RecipeCard from "@/renderer/components/RecipeCard";
import Modal from "@/renderer/components/Modal";
import QuickAddUrlDialog from "@/renderer/components/QuickAddUrlDialog";
import type {
  Recipe,
  RecipeIngredient,
  Ingredient,
  Tag,
  Image,
  Document,
} from "@/shared/types";

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [recipeImages, setRecipeImages] = useState<Record<string, Image[]>>({});
  const [recipeDocuments, setRecipeDocuments] = useState<
    Record<string, Document[]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [versioningRecipe, setVersioningRecipe] = useState<Recipe | null>(null);
  const [showQuickUrlDialog, setShowQuickUrlDialog] = useState(false);
  const [quickUrlRecipe, setQuickUrlRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allRecipes = recipesService.getAll();
    setRecipes(allRecipes);
    setRecipeIngredients(recipeIngredientsService.getAll());
    setIngredients(ingredientsService.getAll());
    setTags(tagsService.getAll());

    // Load images for all recipes
    const imagesMap: Record<string, Image[]> = {};
    allRecipes.forEach((recipe) => {
      imagesMap[recipe.id] = imagesService.getByEntity("recipe", recipe.id);
    });
    setRecipeImages(imagesMap);
    setRecipeDocuments({}); // Documents currently not loaded
  };

  const handleSubmit = (
    data: Omit<Recipe, "id" | "created_at" | "updated_at">
  ) => {
    if (editingRecipe) {
      recipesService.update(editingRecipe.id, data);
    } else if (versioningRecipe) {
      // Creating new version - increment version if not provided
      const parentVersion = versioningRecipe.version || "1.0";
      const newVersion = data.version || incrementVersion(parentVersion);
      recipesService.create({
        ...data,
        version: newVersion,
        parent_id: versioningRecipe.id,
      });
    } else {
      // Creating new recipe - set version to 1.0 if not provided
      recipesService.create({
        ...data,
        version: data.version || "1.0",
      });
    }
    setShowForm(false);
    setEditingRecipe(null);
    setVersioningRecipe(null);
    loadData();
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split(".");
    if (parts.length === 2) {
      const minor = parseInt(parts[1]) + 1;
      return `${parts[0]}.${minor}`;
    }
    return version;
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
    setVersioningRecipe(null);
  };

  const handleCreateVersion = (recipe: Recipe) => {
    setVersioningRecipe(recipe);
    setShowForm(true);
  };

  const handleToggleFavorite = (id: string) => {
    const existing = favoritesService.getByEntity("recipe", id);
    if (existing) {
      favoritesService.delete(existing.id);
    } else {
      favoritesService.create({
        entity_type: "recipe",
        entity_id: id,
      });
    }
    loadData();
  };

  const handleCopyName = (recipeName: string) => {
    navigator.clipboard.writeText(recipeName);
    // Visual feedback could be added here
  };

  const handleQuickAddUrl = (recipe: Recipe) => {
    setQuickUrlRecipe(recipe);
    setShowQuickUrlDialog(true);
  };

  const handleAddQuickUrl = (url: string, name?: string) => {
    if (!quickUrlRecipe) return;

    // TODO: Implement document creation when documents service is available
    console.log("Quick URL add:", { url, name, recipeId: quickUrlRecipe.id });

    setShowQuickUrlDialog(false);
    setQuickUrlRecipe(null);
    loadData();
  };

  const handleQuickAddDocument = (recipe: Recipe) => {
    // Open full form for document
    handleEdit(recipe);
  };

  // Simplified: Get flat filtered list instead of tree
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Rezepturen
          </h1>
          <p className="text-distillery-600 font-body">
            Mazerate, Destillate und Ausmischungen
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neue Rezeptur
        </button>
      </div>

      {/* Search & Tag Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
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
          title={
            editingRecipe
              ? "Rezeptur bearbeiten"
              : versioningRecipe
              ? `Neue Version: ${versioningRecipe.name}`
              : "Neue Rezeptur"
          }
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

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => {
          const isFavorite = favoritesService.isFavorite("recipe", recipe.id);
          return (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              images={recipeImages[recipe.id] || []}
              documents={recipeDocuments[recipe.id] || []}
              recipeIngredients={recipeIngredients}
              ingredients={ingredients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onCopy={() => handleCopyName(recipe.name)}
              onCreateVersion={handleCreateVersion}
              onUpdate={loadData}
              onQuickAddUrl={handleQuickAddUrl}
              onQuickAddDocument={handleQuickAddDocument}
              isFavorite={isFavorite}
            />
          );
        })}
      </div>

      {/* Quick Add URL Dialog */}
      {showQuickUrlDialog && quickUrlRecipe && (
        <QuickAddUrlDialog
          isOpen={showQuickUrlDialog}
          onClose={() => {
            setShowQuickUrlDialog(false);
            setQuickUrlRecipe(null);
          }}
          onAdd={handleAddQuickUrl}
          entityName={quickUrlRecipe.name}
        />
      )}
    </div>
  );
}

export default Recipes;
