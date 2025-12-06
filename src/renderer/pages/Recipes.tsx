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
  GitBranch,
} from "lucide-react";
import {
  recipes as recipesService,
  products as productsService,
  recipeIngredients as recipeIngredientsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import RecipeForm from "@/renderer/components/RecipeForm";
import Modal from "@/renderer/components/Modal";
import type { Recipe, Product, RecipeIngredient, Tag } from "@/shared/types";

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
  macerate: "bg-green-50 text-green-800 border-green-200",
  distillate: "bg-distillery-50 text-distillery-800 border-distillery-200",
  blend: "bg-bronze-50 text-bronze-800 border-bronze-200",
};

function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [versioningRecipe, setVersioningRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(recipesService.getAll());
    setProducts(productsService.getAll());
    setRecipeIngredients(recipeIngredientsService.getAll());
    setTags(tagsService.getAll());
  };

  const handleSubmit = (
    data: Omit<Recipe, "id" | "created_at" | "updated_at">
  ) => {
    if (editingRecipe) {
      recipesService.update(editingRecipe.id, data);
    } else if (versioningRecipe) {
      // Creating new version
      recipesService.create({
        ...data,
        parent_id: versioningRecipe.id,
      });
    } else {
      // Creating new recipe
      recipesService.create(data);
    }
    setShowForm(false);
    setEditingRecipe(null);
    setVersioningRecipe(null);
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
    setVersioningRecipe(null);
  };

  const handleCreateVersion = (recipe: Recipe) => {
    setVersioningRecipe(recipe);
    setShowForm(true);
  };

  // Build recipe tree structure
  const buildRecipeTree = () => {
    const rootRecipes = recipes.filter((r) => !r.parent_id);
    return rootRecipes.map((root) => ({
      root,
      versions: recipes.filter((r) => r.parent_id === root.id),
    }));
  };

  const recipeTree = buildRecipeTree();
  const filteredTree = recipeTree.filter((item) => {
    const matchesSearch = item.root.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const rootAssignments = tagAssignmentsService.getByEntity(
        "recipe",
        item.root.id
      );
      const versionAssignments = item.versions.flatMap((v) =>
        tagAssignmentsService.getByEntity("recipe", v.id)
      );
      matchesTag = [...rootAssignments, ...versionAssignments].some(
        (a) => a.tag_id === selectedTagId
      );
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
      {filteredTree.length === 0 && (
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

      {/* Recipe Tree */}
      <div className="space-y-4">
        {filteredTree.map((item) => {
          const Icon = typeIcons[item.root.type];
          const rootProduct = item.root.product_id
            ? products.find((p) => p.id === item.root.product_id)
            : null;
          return (
            <div
              key={item.root.id}
              className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 overflow-hidden"
            >
              {/* Root Recipe */}
              <div className="p-6 hover:bg-gurktaler-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-heading font-semibold text-distillery-900">
                        {item.root.name}
                      </h3>
                      {item.root.version && (
                        <span className="text-sm text-distillery-600 font-body font-semibold">
                          v{item.root.version}
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border-vintage ${
                          typeColors[item.root.type]
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {typeLabels[item.root.type]}
                      </span>
                    </div>
                    {item.root.instructions && (
                      <p className="text-sm text-distillery-600 mb-2 font-body">
                        {item.root.instructions}
                      </p>
                    )}
                    {rootProduct && (
                      <div className="mb-2">
                        <span className="text-xs text-distillery-500">
                          🔗 {rootProduct.name}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const ingredientCount = recipeIngredients.filter(
                        (ri) => ri.recipe_id === item.root.id
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
                    {item.root.yield_amount && (
                      <div className="mb-2">
                        <span className="text-xs text-distillery-600">
                          ⚗️ Ausbeute: {item.root.yield_amount}{" "}
                          {item.root.yield_unit || "ml"}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const recipeAssignments =
                        tagAssignmentsService.getByEntity(
                          "recipe",
                          item.root.id
                        );
                      const recipeTags = recipeAssignments
                        .map((a) => tags.find((t) => t.id === a.tag_id))
                        .filter((t): t is Tag => t !== undefined);
                      return (
                        recipeTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {recipeTags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded-full font-body"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  color: tag.color,
                                  border: `1px solid ${tag.color}40`,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )
                      );
                    })()}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        favoritesService.toggle("recipe", item.root.id);
                        loadData();
                      }}
                      className="p-2 hover:bg-bronze-100 rounded-lg transition-colors"
                      title={
                        favoritesService.isFavorite("recipe", item.root.id)
                          ? "Aus Favoriten entfernen"
                          : "Zu Favoriten hinzufügen"
                      }
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favoritesService.isFavorite("recipe", item.root.id)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-distillery-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleCreateVersion(item.root)}
                      className="p-2 hover:bg-gurktaler-100 rounded-lg transition-colors"
                      title="Neue Version erstellen"
                    >
                      <GitBranch className="w-5 h-5 text-gurktaler-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(item.root)}
                      className="p-2 hover:bg-bronze-100 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-5 h-5 text-distillery-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.root.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Version History */}
              {item.versions.length > 0 && (
                <div className="border-t-vintage border-distillery-100">
                  {item.versions.map((version) => {
                    const VersionIcon = typeIcons[version.type];
                    const versionProduct = version.product_id
                      ? products.find((p) => p.id === version.product_id)
                      : null;
                    return (
                      <div
                        key={version.id}
                        className="p-4 pl-12 bg-gurktaler-50/30 hover:bg-gurktaler-50/50 transition-colors border-t-vintage border-distillery-100 first:border-t-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <GitBranch className="w-4 h-4 text-gurktaler-600" />
                              <h4 className="font-heading font-semibold text-distillery-800">
                                {version.name}
                              </h4>
                              {version.version && (
                                <span className="text-sm text-distillery-600 font-body">
                                  v{version.version}
                                </span>
                              )}
                              <span
                                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                  typeColors[version.type]
                                }`}
                              >
                                <VersionIcon className="w-3 h-3" />
                                {typeLabels[version.type]}
                              </span>
                            </div>
                            {version.instructions && (
                              <p className="text-sm text-distillery-600 mb-1 font-body">
                                {version.instructions}
                              </p>
                            )}
                            {versionProduct && (
                              <div className="mb-1">
                                <span className="text-xs text-distillery-500">
                                  🔗 {versionProduct.name}
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-distillery-400 font-body">
                              Erstellt: {formatDate(version.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                favoritesService.toggle("recipe", version.id);
                                loadData();
                              }}
                              className="p-1 hover:bg-bronze-100 rounded transition-colors"
                              title={
                                favoritesService.isFavorite(
                                  "recipe",
                                  version.id
                                )
                                  ? "Aus Favoriten entfernen"
                                  : "Zu Favoriten hinzufügen"
                              }
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  favoritesService.isFavorite(
                                    "recipe",
                                    version.id
                                  )
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-distillery-400"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => handleCreateVersion(version)}
                              className="p-1 hover:bg-gurktaler-100 rounded transition-colors"
                              title="Neue Version erstellen"
                            >
                              <GitBranch className="w-4 h-4 text-gurktaler-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(version)}
                              className="p-1 hover:bg-bronze-100 rounded transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-4 h-4 text-distillery-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(version.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Recipes;
