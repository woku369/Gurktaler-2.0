import {
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import type { Container, Image, ContainerType } from "@/shared/types";

interface ContainerCardProps {
  container: Container;
  image?: Image;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddUrl: () => void;
  onAddDocument: () => void;
  onCopy: () => void;
}

const containerTypeLabels: Record<ContainerType, string> = {
  bottle: "Flasche",
  label: "Etikett",
  cap: "Verschluss",
  box: "Verpackung",
  other: "Sonstiges",
};

export default function ContainerCard({
  container,
  image,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddUrl,
  onAddDocument,
  onCopy,
}: ContainerCardProps) {
  const handleCopyName = () => {
    navigator.clipboard.writeText(container.name);
    onCopy();
  };

  const openDocument = async (doc: any) => {
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
              alt={container.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-distillery-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name und Type */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-heading font-bold text-distillery-900 truncate">
                {container.name}
              </h3>
              <span className="inline-block px-2 py-0.5 text-xs bg-distillery-100 text-distillery-700 rounded-full font-body">
                {containerTypeLabels[container.type]}
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

          {/* Details */}
          <div className="text-sm text-distillery-600 space-y-1 font-body">
            {container.volume && (
              <div>
                <span className="font-semibold">Volumen:</span>{" "}
                {container.volume} ml
              </div>
            )}
            {container.price && (
              <div>
                <span className="font-semibold">Preis:</span> €
                {container.price.toFixed(2)}
              </div>
            )}
          </div>

          {/* Notes - gekürzt anzeigen */}
          {container.notes && (
            <p className="text-sm text-distillery-500 mt-2 line-clamp-2 font-body">
              {container.notes}
            </p>
          )}
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
        {container.documents && container.documents.length > 0 && (
          <div className="flex-1 flex items-center gap-1 ml-2">
            <span className="text-xs text-distillery-500 font-body">
              {container.documents.length} Dokument
              {container.documents.length > 1 ? "e" : ""}:
            </span>
            <div className="flex gap-1">
              {container.documents.slice(0, 3).map((doc) => (
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
              {container.documents.length > 3 && (
                <span className="text-xs text-distillery-400 self-center font-body">
                  +{container.documents.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
