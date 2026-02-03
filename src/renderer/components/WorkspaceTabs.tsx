import { Eye, EyeOff } from "lucide-react";
import type { ProjectWorkspace } from "@/shared/types";

interface WorkspaceTabsProps {
  workspaces: ProjectWorkspace[];
  activeWorkspaceId: string | "all";
  onWorkspaceChange: (workspaceId: string | "all") => void;
  onAddWorkspace?: () => void;
  showAllTab?: boolean;
  visibleWorkspaces?: Set<string>;
  onToggleVisibility?: (workspaceId: string) => void;
  showVisibilityToggles?: boolean;
}

export function WorkspaceTabs({
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onAddWorkspace,
  showAllTab = true,
  visibleWorkspaces,
  onToggleVisibility,
  showVisibilityToggles = false,
}: WorkspaceTabsProps) {
  return (
    <div className="space-y-3">
      {/* Visibility Toggles (wenn aktiviert) */}
      {showVisibilityToggles && visibleWorkspaces && onToggleVisibility && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
            <Eye className="w-4 h-4" />
            <span>Ebenen-Sichtbarkeit:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {workspaces.map((workspace) => {
              const isVisible = visibleWorkspaces.has(workspace.id);
              return (
                <label
                  key={workspace.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleVisibility(workspace.id)}
                    className="w-4 h-4 rounded border-slate-300"
                    style={{
                      accentColor: workspace.color,
                    }}
                  />
                  <span className="text-sm">
                    {workspace.icon && (
                      <span className="mr-1">{workspace.icon}</span>
                    )}
                    {workspace.name}
                  </span>
                  {!isVisible && <EyeOff className="w-3 h-3 text-slate-400" />}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-distillery-200 mb-6 overflow-x-auto pb-0">
        {/* "Alle" Tab (optional) */}
        {showAllTab && (
          <button
            onClick={() => onWorkspaceChange("all")}
            className={`px-4 py-2 rounded-t-vintage border-2 transition-colors font-body whitespace-nowrap ${
              activeWorkspaceId === "all"
                ? "bg-white border-distillery-300 border-b-white -mb-0.5 font-semibold text-distillery-900"
                : "bg-distillery-50 border-transparent hover:bg-distillery-100 text-distillery-600"
            }`}
          >
            📊 Alle Ebenen
          </button>
        )}

        {/* Workspace Tabs */}
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => onWorkspaceChange(workspace.id)}
            className={`px-4 py-2 rounded-t-vintage border-2 transition-colors font-body whitespace-nowrap ${
              activeWorkspaceId === workspace.id
                ? "bg-white border-distillery-300 border-b-white -mb-0.5 font-semibold"
                : "bg-distillery-50 border-transparent hover:bg-distillery-100"
            }`}
            style={{
              borderTopColor:
                activeWorkspaceId === workspace.id
                  ? workspace.color
                  : undefined,
              borderTopWidth:
                activeWorkspaceId === workspace.id ? "3px" : undefined,
              color:
                activeWorkspaceId === workspace.id
                  ? workspace.color
                  : undefined,
            }}
            title={workspace.description}
          >
            {workspace.icon && <span className="mr-2">{workspace.icon}</span>}
            {workspace.name}
          </button>
        ))}

        {/* Optional: + Button */}
        {onAddWorkspace && (
          <button
            onClick={onAddWorkspace}
            className="px-3 py-2 text-distillery-400 hover:text-distillery-600 transition-colors font-body whitespace-nowrap"
            title="Neue Ebene hinzufügen"
          >
            + Ebene
          </button>
        )}
      </div>
    </div>
  );
}
