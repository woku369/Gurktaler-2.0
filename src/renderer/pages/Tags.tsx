import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag as TagIcon } from "lucide-react";
import {
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
} from "@/renderer/services/storage";
import type { Tag } from "@/shared/types";

export default function Tags() {
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", color: "#10b981" });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = () => {
    setTagsList(tagsService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTag) {
      tagsService.update(editingTag.id, formData);
    } else {
      tagsService.create(formData);
    }

    loadTags();
    resetForm();
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tag löschen? Alle Zuordnungen werden ebenfalls entfernt.")) {
      // Delete all assignments for this tag
      const assignments = tagAssignmentsService.getByTag(id);
      assignments.forEach((assignment) =>
        tagAssignmentsService.delete(assignment.id)
      );

      // Delete the tag
      tagsService.delete(id);
      loadTags();
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingTag(null);
    setFormData({ name: "", color: "#10b981" });
  };

  const getTagUsageCount = (tagId: string): number => {
    return tagAssignmentsService.getByTag(tagId).length;
  };

  const getTagUsageDetails = (tagId: string): string => {
    const assignments = tagAssignmentsService.getByTag(tagId);
    const counts = assignments.reduce((acc, assignment) => {
      acc[assignment.entity_type] = (acc[assignment.entity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels: Record<string, string> = {
      project: "Projekte",
      product: "Produkte",
      note: "Notizen",
      recipe: "Rezepturen",
    };

    return Object.entries(counts)
      .map(([type, count]) => `${count} ${labels[type] || type}`)
      .join(", ");
  };

  const filteredTags = tagsList.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const predefinedColors = [
    "#10b981", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Tags
          </h1>
          <p className="text-distillery-600 font-body mt-1">
            Organisieren Sie Projekte, Produkte und Notizen
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neuer Tag
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tags durchsuchen..."
          className="w-full px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent font-body"
        />
      </div>

      {isFormOpen && (
        <div className="mb-6 p-6 bg-white rounded-vintage border-vintage border-gurktaler-300 shadow-vintage-lg">
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-4">
            {editingTag ? "Tag bearbeiten" : "Neuer Tag"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-distillery-700 font-body mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border-vintage border-distillery-200 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent font-body"
                placeholder="z.B. Innovation, Bio, Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-distillery-700 font-body mb-2">
                Farbe *
              </label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Eigene Farbe:</span>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-20 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-gurktaler-primary text-white rounded-lg hover:bg-gurktaler-dark transition-colors"
              >
                {editingTag ? "Aktualisieren" : "Erstellen"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredTags.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchTerm ? "Keine Tags gefunden" : "Noch keine Tags vorhanden"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => {
            const usageCount = getTagUsageCount(tag.id);
            const usageDetails = getTagUsageDetails(tag.id);

            return (
              <div
                key={tag.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1.5 text-gray-600 hover:text-gurktaler-primary hover:bg-gray-100 rounded transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {usageCount > 0 ? (
                    <div>
                      <div className="font-medium text-gray-700">
                        {usageCount} Verwendungen
                      </div>
                      <div className="text-xs mt-1">{usageDetails}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Noch nicht verwendet</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Erstellt:{" "}
                  {new Date(tag.created_at).toLocaleDateString("de-DE")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
