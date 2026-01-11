import {
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  ImagePlus,
} from "lucide-react";
import TagBadgeList from "@/renderer/components/TagBadgeList";
import type {
  Project,
  Image,
  Document,
  ProjectStatus,
  ProjectWorkspace,
} from "@/shared/types";

interface ProjectCardProps {
  project: Project;
  image?: Image;
  workspaces?: ProjectWorkspace[];
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

const statusColors: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-bronze-100 text-bronze-800",
  completed: "bg-gurktaler-100 text-gurktaler-800",
  archived: "bg-distillery-100 text-distillery-700",
};

const statusLabels: Record<ProjectStatus, string> = {
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
  archived: "Archiviert",
};

export default function ProjectCard({
  project,
  image,
  workspaces,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddUrl,
  onAddDocument,
  onAddImage,
  onCopy,
  onUpdate,
}: ProjectCardProps) {
  const handleCopyName = () => {
    navigator.clipboard.writeText(project.name);
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
      {/* Header - Titel ganz oben */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-heading font-bold text-distillery-900 break-words">
          {project.name}
        </h3>
      </div>

      {/* Action Buttons Row */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-0.5 text-xs rounded-full font-body font-semibold ${
              statusColors[project.status]
            }`}
          >
            {statusLabels[project.status]}
          </span>
          {project.workspace_id &&
            workspaces &&
            (() => {
              const workspace = workspaces.find(
                (ws) => ws.id === project.workspace_id
              );
              if (workspace) {
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-body font-medium text-slate-700"
                    style={{
                      backgroundColor: `${workspace.color}20`,
                      borderColor: workspace.color,
                      borderWidth: "1px",
                    }}
                    title={`Projekt-Ebene: ${workspace.name}`}
                  >
                    {workspace.icon && <span>{workspace.icon}</span>}
                    <span>{workspace.name}</span>
                  </span>
                );
              }
              return null;
            })()}
        </div>
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

      {/* Content mit Thumbnail */}
      <div className="flex gap-4 px-4 pb-4">
        {/* Thumbnail-Bereich */}
        <div className="flex-shrink-0 w-24 h-24 bg-distillery-50 rounded-vintage border-vintage border-distillery-200 overflow-hidden">
          {image ? (
            <img
              src={image.data_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-distillery-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-distillery-600 line-clamp-3 font-body">
              {project.description}
            </p>
          )}

          {/* Tags */}
          <div className="mt-2">
            <TagBadgeList
              entityType="project"
              entityId={project.id}
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
        {project.documents && project.documents.length > 0 && (
          <div className="flex-1 flex items-center gap-1 ml-2">
            <span className="text-xs text-distillery-500 font-body">
              {project.documents.length} Dokument
              {project.documents.length > 1 ? "e" : ""}:
            </span>
            <div className="flex gap-1">
              {project.documents.slice(0, 3).map((doc) => (
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
              {project.documents.length > 3 && (
                <span className="text-xs text-distillery-400 self-center font-body">
                  +{project.documents.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
