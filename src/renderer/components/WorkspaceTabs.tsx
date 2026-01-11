import type { ProjectWorkspace } from "@/shared/types";

interface WorkspaceTabsProps {
  workspaces: ProjectWorkspace[];
  activeWorkspaceId: string | "all";
  onWorkspaceChange: (workspaceId: string | "all") => void;
  onAddWorkspace?: () => void;
  showAllTab?: boolean;
}

export function WorkspaceTabs({
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onAddWorkspace,
  showAllTab = true,
}: WorkspaceTabsProps) {
  return (
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
              activeWorkspaceId === workspace.id ? workspace.color : undefined,
            borderTopWidth:
              activeWorkspaceId === workspace.id ? "3px" : undefined,
            color:
              activeWorkspaceId === workspace.id ? workspace.color : undefined,
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
  );
}
