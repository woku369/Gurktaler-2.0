import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Layers } from "lucide-react";
import {
  workspaces as workspacesService,
  projects as projectsService,
} from "../services/storage";
import type { ProjectWorkspace } from "@/shared/types";

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6b7280", // gray
];

const DEFAULT_ICONS = [
  "📍",
  "🧪",
  "📁",
  "🎯",
  "🚀",
  "💡",
  "🔧",
  "📊",
  "🌟",
  "🏆",
];

export function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    icon: "",
    color: "",
    description: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    icon: "📍",
    color: "#3b82f6",
    description: "",
  });

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    const ws = await workspacesService.getAll();
    setWorkspaces(ws);
  };

  const handleStartEdit = (workspace: ProjectWorkspace) => {
    setEditingId(workspace.id);
    setEditForm({
      name: workspace.name,
      icon: workspace.icon || "",
      color: workspace.color,
      description: workspace.description || "",
    });
  };

  const handleSaveEdit = async (id: string) => {
    await workspacesService.update(id, editForm);
    setEditingId(null);
    loadWorkspaces();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    // Zähle betroffene Projekte
    const allProjects = await projectsService.getAll();
    const affectedCount = allProjects.filter(
      (p) => p.workspace_id === id
    ).length;

    const workspaceName =
      workspaces.find((w) => w.id === id)?.name || "dieser Workspace";

    let message = `Workspace "${workspaceName}" wirklich löschen?\n\n`;

    if (affectedCount > 0) {
      message += `⚠️ ${affectedCount} ${
        affectedCount === 1 ? "Projekt" : "Projekte"
      } ${
        affectedCount === 1 ? "ist" : "sind"
      } diesem Workspace zugeordnet.\n\n`;
      message += `✅ DIE PROJEKTE BLEIBEN ERHALTEN!\n`;
      message += `Nur die Zuordnung zum Workspace wird entfernt.\n`;
      message += `Die Projekte erscheinen dann im "Alle Ebenen" Filter.`;
    } else {
      message += `Keine Projekte sind diesem Workspace zugeordnet.`;
    }

    if (confirm(message)) {
      await workspacesService.delete(id);
      loadWorkspaces();
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      alert("Bitte einen Namen eingeben");
      return;
    }

    const maxOrder =
      workspaces.length > 0 ? Math.max(...workspaces.map((w) => w.order)) : -1;

    await workspacesService.create({
      name: addForm.name.trim(),
      icon: addForm.icon,
      color: addForm.color,
      description: addForm.description.trim() || undefined,
      order: maxOrder + 1,
    });

    setAddForm({ name: "", icon: "📍", color: "#3b82f6", description: "" });
    setShowAddForm(false);
    loadWorkspaces();
  };

  return (
    <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gurktaler-100 rounded-vintage flex items-center justify-center">
            <Layers className="w-5 h-5 text-gurktaler-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Projekt-Ebenen</h2>
            <p className="text-sm text-slate-500">
              Workspaces für strategische Trennung
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Neue Ebene
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border-2 border-gurktaler-200 rounded-lg bg-gurktaler-50">
          <h3 className="font-semibold text-sm text-slate-700 mb-3">
            Neue Projekt-Ebene
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder="z.B. Marketing"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Icon
                </label>
                <select
                  value={addForm.icon}
                  onChange={(e) =>
                    setAddForm({ ...addForm, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {DEFAULT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon} {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Farbe
                </label>
                <div className="flex gap-1">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAddForm({ ...addForm, color })}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        addForm.color === color
                          ? "border-slate-900 scale-110"
                          : "border-slate-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={addForm.description}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder="Optional"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-sm bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace List */}
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            {editingId === workspace.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Icon
                    </label>
                    <select
                      value={editForm.icon}
                      onChange={(e) =>
                        setEditForm({ ...editForm, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      {DEFAULT_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon} {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Farbe
                    </label>
                    <div className="flex gap-1">
                      {DEFAULT_COLORS.slice(0, 5).map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditForm({ ...editForm, color })}
                          className={`w-7 h-7 rounded border-2 transition-all ${
                            editForm.color === color
                              ? "border-slate-900 scale-110"
                              : "border-slate-300"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Beschreibung
                  </label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Abbrechen
                  </button>
                  <button
                    onClick={() => handleSaveEdit(workspace.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: `${workspace.color}20`,
                      borderColor: workspace.color,
                      borderWidth: "2px",
                    }}
                  >
                    {workspace.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {workspace.name}
                    </div>
                    {workspace.description && (
                      <div className="text-xs text-slate-500">
                        {workspace.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(workspace)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workspace.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {workspaces.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-slate-500">
          <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">Noch keine Projekt-Ebenen vorhanden</p>
          <p className="text-xs mt-1">Klicke auf "Neue Ebene" um zu starten</p>
        </div>
      )}
    </div>
  );
}
