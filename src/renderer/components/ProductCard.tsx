import {
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  Package,
  GitBranch,
} from "lucide-react";
import TagBadgeList from "@/renderer/components/TagBadgeList";
import type { Product, Image, Document, ProductStatus } from "@/shared/types";

interface ProductCardProps {
  product: Product;
  image?: Image;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateVersion: () => void;
  onAddUrl: () => void;
  onAddDocument: () => void;
  onCopy: () => void;
  onUpdate?: () => void;
}

const statusColors: Record<ProductStatus, string> = {
  draft: "bg-distillery-100 text-distillery-800",
  testing: "bg-bronze-100 text-bronze-800",
  approved: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<ProductStatus, string> = {
  draft: "Entwurf",
  testing: "In Test",
  approved: "Freigegeben",
  archived: "Archiviert",
};

export default function ProductCard({
  product,
  image,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onCreateVersion,
  onAddUrl,
  onAddDocument,
  onCopy,
  onUpdate,
}: ProductCardProps) {
  const handleCopyName = () => {
    navigator.clipboard.writeText(product.name);
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
      {/* Header mit Thumbnail und Actions */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail-Bereich */}
        <div className="flex-shrink-0 w-24 h-24 bg-distillery-50 rounded-vintage border-vintage border-distillery-200 overflow-hidden">
          {image ? (
            <img
              src={image.data_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-distillery-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name, Version und Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-heading font-bold text-distillery-900 truncate">
                  {product.name}
                </h3>
                {product.version && (
                  <span className="text-sm text-distillery-500 font-body">
                    v{product.version}
                  </span>
                )}
              </div>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full font-body font-semibold ${
                  statusColors[product.status]
                }`}
              >
                {statusLabels[product.status]}
              </span>
            </div>

            {/* Action Buttons - IMMER SICHTBAR */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyName}
                className="p-1.5 text-distillery-600 hover:text-gurktaler-600 hover:bg-distillery-50 rounded transition-colors"
                title="Name kopieren"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onCreateVersion}
                className="p-1.5 text-distillery-600 hover:text-gurktaler-600 hover:bg-distillery-50 rounded transition-colors"
                title="Version erstellen"
              >
                <GitBranch className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleFavorite}
                className={`p-1.5 rounded transition-colors ${
                  isFavorite
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-distillery-400 hover:text-yellow-500 hover:bg-distillery-50"
                }`}
                title={
                  isFavorite
                    ? "Von Favoriten entfernen"
                    : "Zu Favoriten hinzufügen"
                }
              >
                <Star
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
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

          {/* Description */}
          {product.description && (
            <p className="text-sm text-distillery-600 mb-2 line-clamp-2 font-body">
              {product.description}
            </p>
          )}

          {/* Details */}
          <div className="text-sm text-distillery-600 space-y-1 font-body">
            {product.alcohol_percentage && (
              <div>
                <span className="font-semibold">Alkohol:</span>{" "}
                {product.alcohol_percentage}%vol.
              </div>
            )}
            {product.container_size && (
              <div>
                <span className="font-semibold">Gebindegröße:</span>{" "}
                {product.container_size} ml
              </div>
            )}
          </div>

          {/* Archive Reason */}
          {product.archive_reason && (
            <p className="text-sm text-red-600 italic mt-2 font-body">
              Archiviert: {product.archive_reason}
            </p>
          )}

          {/* Notes - gekürzt anzeigen */}
          {product.notes && (
            <p className="text-sm text-distillery-500 mt-2 line-clamp-2 font-body">
              {product.notes}
            </p>
          )}

          {/* Tags */}
          <div className="mt-2">
            <TagBadgeList
              entityType="product"
              entityId={product.id}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-t border-distillery-100 px-4 py-2 bg-distillery-25 flex items-center gap-2">
        <button
          onClick={onAddUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-distillery-200 text-distillery-700 rounded hover:bg-distillery-50 transition-colors font-body font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          URL hinzufügen
        </button>
        <button
          onClick={onAddDocument}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-distillery-200 text-distillery-700 rounded hover:bg-distillery-50 transition-colors font-body font-semibold"
        >
          <FileText className="w-3.5 h-3.5" />
          Dokument
        </button>

        {/* Dokumente/URLs anzeigen */}
        {product.documents && product.documents.length > 0 && (
          <div className="flex-1 flex items-center gap-1 ml-2">
            <span className="text-xs text-distillery-500 font-body">
              {product.documents.length} Dokument
              {product.documents.length > 1 ? "e" : ""}:
            </span>
            <div className="flex gap-1">
              {product.documents.slice(0, 3).map((doc) => (
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
              {product.documents.length > 3 && (
                <span className="text-xs text-distillery-400 self-center font-body">
                  +{product.documents.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
