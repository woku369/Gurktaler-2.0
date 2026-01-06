import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
} from "@/renderer/services/storage";
import type { Tag } from "@/shared/types";

interface TagBadgeListProps {
  entityType:
    | "project"
    | "product"
    | "note"
    | "recipe"
    | "ingredient"
    | "container"
    | "contact";
  entityId: string;
  onUpdate?: () => void;
}

const COLOR_PALETTE = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

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

export default function TagBadgeList({
  entityType,
  entityId,
  onUpdate,
}: TagBadgeListProps) {
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTags();
  }, [entityId, entityType]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    // Filter tags: show unassigned tags that match search
    const unassignedTags = allTags.filter(
      (tag) => !assignedTags.some((at) => at.id === tag.id)
    );

    if (searchTerm.trim()) {
      setFilteredTags(
        unassignedTags.filter((tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTags(unassignedTags);
    }
  }, [searchTerm, allTags, assignedTags]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsAdding(false);
        setSearchTerm("");
      }
    };

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAdding]);

  const loadTags = async () => {
    const all = await tagsService.getAll();
    setAllTags(all);

    const assignments = await tagAssignmentsService.getByEntity(
      entityType,
      entityId
    );
    const assigned = assignments
      .map((a) => all.find((t) => t.id === a.tag_id))
      .filter((t): t is Tag => t !== undefined);
    setAssignedTags(assigned);
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
      onUpdate?.();
    }
  };

  const handleAddTag = async (tag: Tag) => {
    await tagAssignmentsService.create({
      tag_id: tag.id,
      entity_type: entityType,
      entity_id: entityId,
    });
    await loadTags();
    setIsAdding(false);
    setSearchTerm("");
    onUpdate?.();
  };

  const handleCreateAndAddTag = async () => {
    if (!searchTerm.trim()) return;

    // Check if tag already exists
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === searchTerm.toLowerCase()
    );
    if (existing) {
      await handleAddTag(existing);
      return;
    }

    // Create new tag with auto-assigned color
    const usedColors = allTags.map((t) => t.color);
    const availableColors = COLOR_PALETTE.filter(
      (c) => !usedColors.includes(c)
    );
    const color =
      availableColors.length > 0
        ? availableColors[0]
        : COLOR_PALETTE[allTags.length % COLOR_PALETTE.length];

    const newTag = await tagsService.create({
      name: searchTerm.trim(),
      color,
    });

    await handleAddTag(newTag);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      } else {
        handleCreateAndAddTag();
      }
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Assigned Tags */}
      {assignedTags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleRemoveTag(tag.id)}
          className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: tag.color, color: getTextColor(tag.color) }}
          title={`${tag.name} entfernen`}
        >
          <span>{tag.name}</span>
          <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}

      {/* Add Tag Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-distillery-100 text-distillery-700 hover:bg-distillery-200 transition-colors"
          title="Tag hinzufügen"
        >
          <Plus className="w-3 h-3" />
          Tag
        </button>
      )}

      {/* Inline Tag Add */}
      {isAdding && (
        <div ref={dropdownRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tag suchen oder erstellen..."
            className="px-2 py-0.5 text-xs border border-distillery-300 rounded focus:outline-none focus:ring-1 focus:ring-gurktaler-500 w-40"
          />

          {/* Dropdown */}
          {(filteredTags.length > 0 || searchTerm.trim()) && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-distillery-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
              {/* Existing tags */}
              {filteredTags.slice(0, 5).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-distillery-50 transition-colors flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </button>
              ))}

              {/* Create new tag option */}
              {searchTerm.trim() &&
                !allTags.some(
                  (t) => t.name.toLowerCase() === searchTerm.toLowerCase()
                ) && (
                  <button
                    onClick={handleCreateAndAddTag}
                    className="w-full px-3 py-2 text-left text-sm bg-gurktaler-50 hover:bg-gurktaler-100 transition-colors flex items-center gap-2 border-t border-distillery-200"
                  >
                    <Plus className="w-3 h-3 text-gurktaler-600" />
                    <span className="text-gurktaler-700 font-medium">
                      Erstellen: "{searchTerm}"
                    </span>
                  </button>
                )}

              {/* No results */}
              {filteredTags.length === 0 && !searchTerm.trim() && (
                <div className="px-3 py-2 text-sm text-distillery-500">
                  Keine Tags verfügbar
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
