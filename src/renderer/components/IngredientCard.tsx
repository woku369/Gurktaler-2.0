import {
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  Beaker,
  ImagePlus,
} from "lucide-react";
import TagBadgeList from "@/renderer/components/TagBadgeList";
import type { Ingredient, Image, Document } from "@/shared/types";

interface IngredientCardProps {
  ingredient: Ingredient;
  image?: Image;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddUrl: () => void;
  onAddDocument: () => void;
  onAddImage: () => void;
  onCopy: () => void;
  onUpdate?: () => void;
}

export default function IngredientCard({
  ingredient,
  image,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddUrl,
  onAddDocument,
  onAddImage,
  onCopy,
  onUpdate,
}: IngredientCardProps) {
  const handleCopyName = () => {
    navigator.clipboard.writeText(ingredient.name);
    onCopy();
  };

  const openDocument = async (doc: Document) => {
    if (doc.type === "file") {
      await window.electron.invoke("file:open", doc.path);
    } else if (doc.type === "url") {
      window.open(doc.path, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-vintage border-vintage border-distillery-200 shadow-paper hover:shadow-vintage transition-all duration-200 overflow-hidden">
      {/* Titel Section */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-heading font-bold text-distillery-900 break-words">
          {ingredient.name}
        </h3>
      </div>

      {/* Action Buttons Row */}
      <div className="px-4 pb-2 flex items-center justify-between">
        {ingredient.category && (
          <span className="inline-block px-2 py-0.5 text-xs bg-distillery-100 text-distillery-700 rounded-full font-body">
            {ingredient.category}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyName}
            className="p-1.5 text-distillery-600 hover:text-gurktaler-600 hover:bg-distillery-50 rounded transition-colors"
            title="Name kopieren"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded transition-colors ${
              isFavorite
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-distillery-400 hover:text-yellow-500 hover:bg-distillery-50"
            }`}
            title={
              isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"
            }
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-distillery-600 hover:text-gurktaler-600 hover:bg-distillery-50 rounded transition-colors"
            title="Bearbeiten"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-distillery-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Löschen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section mit Thumbnail */}
      <div className="flex gap-4 px-4 pb-4">
        {/* Thumbnail-Bereich */}
        <div className="flex-shrink-0 w-24 h-24 bg-distillery-50 rounded-vintage border-vintage border-distillery-200 overflow-hidden">
          {image ? (
            <img
              src={image.data_url}
              alt={ingredient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Beaker className="w-8 h-8 text-distillery-300" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Details */}
          <div className="text-sm text-distillery-600 space-y-1 font-body">
            {ingredient.alcohol_percentage && (
              <div>
                <span className="font-semibold">Alkohol:</span>{" "}
                {ingredient.alcohol_percentage}%vol.
              </div>
            )}
            {ingredient.price_per_unit && (
              <div>
                <span className="font-semibold">Preis:</span> €
                {ingredient.price_per_unit.toFixed(2)}/
                {ingredient.unit === "liter" ? "L" : "kg"}
              </div>
            )}
          </div>

          {/* Notes - gekürzt anzeigen */}
          {ingredient.notes && (
            <p className="text-sm text-distillery-500 mt-2 line-clamp-2 font-body">
              {ingredient.notes}
            </p>
          )}

          {/* Tags */}
          <div className="mt-2">
            <TagBadgeList
              entityType="ingredient"
              entityId={ingredient.id}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t border-distillery-100 px-4 py-2 bg-distillery-25 flex items-center gap-2">
        <button
          onClick={onAddImage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-distillery-200 text-distillery-700 rounded hover:bg-distillery-50 transition-colors font-body font-semibold"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Bild
        </button>
        <button
          onClick={onAddUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-distillery-200 text-distillery-700 rounded hover:bg-distillery-50 transition-colors font-body font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          URL
        </button>
        <button
          onClick={onAddDocument}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-distillery-200 text-distillery-700 rounded hover:bg-distillery-50 transition-colors font-body font-semibold"
        >
          <FileText className="w-3.5 h-3.5" />
          Dokument
        </button>

        {/* Dokumente/URLs anzeigen */}
        {ingredient.documents && ingredient.documents.length > 0 && (
          <div className="flex-1 flex items-center gap-1 ml-2">
            <span className="text-xs text-distillery-500 font-body">
              {ingredient.documents.length} Dokument
              {ingredient.documents.length > 1 ? "e" : ""}:
            </span>
            <div className="flex gap-1">
              {ingredient.documents.slice(0, 3).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => openDocument(doc)}
                  className="p-1 text-gurktaler-600 hover:text-gurktaler-700 hover:bg-gurktaler-50 rounded transition-colors"
                  title={doc.name}
                >
                  {doc.type === "url" ? (
                    <ExternalLink className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
              {ingredient.documents.length > 3 && (
                <span className="text-xs text-distillery-400 self-center font-body">
                  +{ingredient.documents.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
