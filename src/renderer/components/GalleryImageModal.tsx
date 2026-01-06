import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  updateImageMetadata,
  addTagToImage,
  removeTagFromImage,
  type GalleryImage,
} from "@/renderer/services/gallery";
import { tagAssignments } from "@/renderer/services/storage";
import type { Tag } from "@/shared/types";

interface GalleryImageModalProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  allTags: Tag[];
}

export default function GalleryImageModal({
  image,
  isOpen,
  onClose,
  allTags,
}: GalleryImageModalProps) {
  const [caption, setCaption] = useState(image.caption || "");
  const [entityType, setEntityType] = useState(image.entity_type);
  const [entityId, setEntityId] = useState(image.entity_id);
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssignedTags();
      setCaption(image.caption || "");
      setEntityType(image.entity_type);
      setEntityId(image.entity_id);
    }
  }, [isOpen, image]);

  const loadAssignedTags = async () => {
    const assignments = await tagAssignments.getByEntity("image", image.id);
    const tags = assignments
      .map((ta) => allTags.find((t) => t.id === ta.tag_id))
      .filter((t): t is Tag => t !== undefined);
    setAssignedTags(tags);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateImageMetadata(image.id, {
        caption,
        entity_type: entityType,
        entity_id: entityId,
      });
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Änderungen");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async (tagId: string) => {
    await addTagToImage(image.id, tagId);
    await loadAssignedTags();
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromImage(image.id, tagId);
    await loadAssignedTags();
  };

  const entityTypeLabels: Record<string, string> = {
    project: "Projekt",
    product: "Produkt",
    recipe: "Rezeptur",
    ingredient: "Zutat",
    container: "Gebinde",
    contact: "Kontakt",
    note: "Notiz",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-vintage border-distillery-200">
          <h2 className="text-2xl font-heading font-bold text-distillery-900">
            Bild bearbeiten
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-distillery-100 rounded-vintage transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div>
              <img
                src={image.data_url}
                alt={image.file_name}
                className="w-full rounded-vintage border-vintage border-distillery-200"
              />
              <p className="text-sm text-distillery-600 font-body mt-2">
                {image.file_name}
              </p>
              <p className="text-xs text-distillery-500 font-body">
                Hochgeladen:{" "}
                {new Date(image.created_at).toLocaleDateString("de-DE")}
              </p>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                  placeholder="Beschreibung hinzufügen..."
                />
              </div>

              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full px-3 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                >
                  {Object.entries(entityTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-distillery-500 mt-1 font-body">
                  Die Kategorie bestimmt, wo dieses Bild angezeigt wird
                </p>
              </div>

              {/* Entity ID (for advanced users) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Zuordnungs-ID
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full px-3 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                  placeholder="z.B. Projekt-ID, Produkt-ID..."
                />
                <p className="text-xs text-distillery-500 mt-1 font-body">
                  Die ID der zugeordneten Entität (Projekt, Produkt, etc.)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {assignedTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body border-vintage"
                      style={{
                        backgroundColor: tag.color + "20",
                        borderColor: tag.color,
                      }}
                    >
                      <span style={{ color: tag.color }}>{tag.name}</span>
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" style={{ color: tag.color }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tag Selector Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                >
                  <option value="">Tag hinzufügen...</option>
                  {allTags
                    .filter((t) => !assignedTags.find((at) => at.id === t.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-vintage border-distillery-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage hover:bg-distillery-50 transition-colors font-body"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors font-body font-semibold disabled:opacity-50"
          >
            {isSaving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
