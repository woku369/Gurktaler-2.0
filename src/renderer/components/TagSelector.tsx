import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import {
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
} from "@/renderer/services/storage";
import type { Tag } from "@/shared/types";

interface TagSelectorProps {
  entityType:
    | "project"
    | "product"
    | "note"
    | "recipe"
    | "ingredient"
    | "container"
    | "contact";
  entityId: string;
  onChange?: () => void;
}

// Calculate text color (black/white) based on background luminance
function getTextColor(bgColor: string): string {
  // Convert hex to RGB
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export default function TagSelector({
  entityType,
  entityId,
  onChange,
}: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTags();
  }, [entityId]);

  const loadTags = async () => {
    const tags = await tagsService.getAll();
    setAllTags(tags);

    const assignments = await tagAssignmentsService.getByEntity(
      entityType,
      entityId
    );
    const assigned = assignments
      .map((a) => tags.find((t) => t.id === a.tag_id))
      .filter((t): t is Tag => t !== undefined);
    setAssignedTags(assigned);
  };

  const handleAddTag = async (tagId: string) => {
    // Check if already assigned
    const isAssigned = assignedTags.some((t) => t.id === tagId);
    if (isAssigned) return;

    await tagAssignmentsService.create({
      tag_id: tagId,
      entity_type: entityType,
      entity_id: entityId,
    });

    await loadTags();
    setIsAdding(false);
    onChange?.();
  };

  const handleRemoveTag = async (tagId: string) => {
    const assignments = await tagAssignmentsService.getByEntity(
      entityType,
      entityId
    );
    const assignment = assignments.find((a) => a.tag_id === tagId);

    if (assignment) {
      await tagAssignmentsService.delete(assignment.id);
      await loadTags();
      onChange?.();
    }
  };

  const availableTags = allTags.filter(
    (tag) => !assignedTags.some((assigned) => assigned.id === tag.id)
  );

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {assignedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: tag.color,
              color: getTextColor(tag.color),
            }}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              title="Tag entfernen"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {!isAdding && availableTags.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-gray-600 border border-gray-300 hover:border-gurktaler-primary hover:text-gurktaler-primary transition-colors"
          >
            <Plus className="w-3 h-3" />
            Tag hinzufügen
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tag auswählen:
            </span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {availableTags.length === 0 ? (
            <p className="text-sm text-gray-500">
              Alle Tags wurden bereits zugewiesen
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: tag.color,
                    color: getTextColor(tag.color),
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
