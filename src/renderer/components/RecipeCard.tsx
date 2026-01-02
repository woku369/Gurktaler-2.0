import React, { useState } from "react";
import {
  Recipe,
  Image,
  Document,
  RecipeIngredient,
  Ingredient,
} from "../../shared/types";
import {
  Droplet,
  Beaker,
  FlaskConical,
  Star,
  Copy,
  Edit2,
  Trash2,
  GitBranch,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import TagBadgeList from "./TagBadgeList";

interface RecipeCardProps {
  recipe: Recipe;
  images: Image[];
  documents: Document[];
  recipeIngredients: RecipeIngredient[];
  ingredients: Ingredient[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: () => void;
  onCreateVersion?: (recipe: Recipe) => void;
  onUpdate: () => void;
  onQuickAddUrl?: (recipe: Recipe) => void;
  onQuickAddDocument?: (recipe: Recipe) => void;
  isFavorite: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  images,
  documents,
  recipeIngredients,
  ingredients,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  onCreateVersion,
  onUpdate,
  onQuickAddUrl,
  onQuickAddDocument,
  isFavorite,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainImage = images[0];

  // Get ingredients for this recipe
  const recipeIngredientsList = recipeIngredients.filter(
    (ri) => ri.recipe_id === recipe.id
  );

  // Recipe type configuration
  const typeConfig = {
    macerate: {
      icon: Droplet,
      label: "Mazerat",
      color: "bg-blue-100 text-blue-700",
    },
    distillate: {
      icon: Beaker,
      label: "Destillat",
      color: "bg-purple-100 text-purple-700",
    },
    blend: {
      icon: FlaskConical,
      label: "Ausmischung",
      color: "bg-green-100 text-green-700",
    },
  };

  const config = typeConfig[recipe.type as keyof typeof typeConfig];
  const TypeIcon = config?.icon || FlaskConical;

  return (
    <div className="bg-paper border-vintage rounded-vintage shadow-paper hover:shadow-lg transition-shadow overflow-hidden">
      {/* Titel Section */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-distillery/10 flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-4 h-4 text-distillery" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-distillery break-words">
              {recipe.name}
            </h3>
            {recipe.version && (
              <span className="text-xs text-gray-500">
                Version {recipe.version}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-4 pb-2 flex items-center justify-between">
        {/* Type Badge */}
        {config && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}
          >
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Name kopieren"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Favorit"
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              }`}
            />
          </button>
          {onCreateVersion && (
            <button
              onClick={() => onCreateVersion(recipe)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Neue Version erstellen"
            >
              <GitBranch className="w-4 h-4 text-distillery" />
            </button>
          )}
          <button
            onClick={() => onEdit(recipe)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Bearbeiten"
          >
            <Edit2 className="w-4 h-4 text-distillery" />
          </button>
          <button
            onClick={() => onDelete(recipe.id)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Löschen"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4">
        {/* Version und Parent Badges */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {/* Version Badge */}
          {recipe.version && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-distillery/10 text-distillery font-medium">
              v{recipe.version}
            </span>
          )}

          {/* Parent Indicator */}
          {recipe.parent_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
              <GitBranch className="w-3 h-3" />
              Abgeleitet
            </span>
          )}
        </div>

        {/* Image */}
        <div className="mb-3">
          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage.data_url}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <TypeIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Details */}
        <div className="space-y-1.5 mb-3 text-sm">
          {recipe.yield_amount && recipe.yield_unit && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ausbeute:</span>
              <span className="text-distillery font-medium">
                {recipe.yield_amount} {recipe.yield_unit}
              </span>
            </div>
          )}
          {recipe.instructions && (
            <div className="text-xs text-gray-500 italic line-clamp-2">
              {recipe.instructions}
            </div>
          )}
        </div>

        {/* Expandable Ingredients List */}
        {recipeIngredientsList.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors text-sm font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                {recipeIngredientsList.length} Zutat
                {recipeIngredientsList.length !== 1 ? "en" : ""}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-1.5 px-2">
                {recipeIngredientsList
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((ri) => {
                    const ingredient = ingredients.find(
                      (ing) => ing.id === ri.ingredient_id
                    );
                    return (
                      <div
                        key={ri.id}
                        className="flex items-start justify-between text-xs py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-700 flex-1">
                          {ingredient?.name || "Unbekannte Zutat"}
                        </span>
                        <span className="text-gray-600 ml-2 whitespace-nowrap">
                          {ri.amount} {ri.unit}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="mb-3">
          <TagBadgeList
            entityType="recipe"
            entityId={recipe.id}
            onUpdate={onUpdate}
          />
        </div>

        {/* Documents */}
        {documents.length > 0 && (
          <div className="mb-3 space-y-1">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-distillery hover:underline"
              >
                <FileText className="w-3 h-3" />
                <span className="truncate">{doc.name || doc.path}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {onQuickAddUrl && (
            <button
              onClick={() => onQuickAddUrl(recipe)}
              className="flex-1 text-xs py-1.5 border border-distillery text-distillery rounded hover:bg-distillery/5 transition-colors"
            >
              + URL
            </button>
          )}
          {onQuickAddDocument && (
            <button
              onClick={() => onQuickAddDocument(recipe)}
              className="flex-1 text-xs py-1.5 border border-distillery text-distillery rounded hover:bg-distillery/5 transition-colors"
            >
              + Dokument
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
