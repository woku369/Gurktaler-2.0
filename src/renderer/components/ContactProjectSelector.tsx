import { useState, useEffect } from "react";
import { X, Plus, Briefcase } from "lucide-react";
import {
  contactProjectAssignments as cpaService,
  projects as projectsService,
} from "@/renderer/services/storage";
import type { Project } from "@/shared/types";

interface ContactProjectSelectorProps {
  contactId: string;
  onChange?: () => void;
}

interface ProjectWithRole extends Project {
  role?: string;
}

export default function ContactProjectSelector({
  contactId,
  onChange,
}: ContactProjectSelectorProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<ProjectWithRole[]>(
    []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    loadProjects();
  }, [contactId]);

  const loadProjects = () => {
    const projects = projectsService.getAll();
    setAllProjects(projects);

    const assignments = cpaService.getByContact(contactId);
    const assigned: ProjectWithRole[] = [];
    assignments.forEach((a) => {
      const project = projects.find((p) => p.id === a.project_id);
      if (project) {
        assigned.push({ ...project, role: a.role });
      }
    });
    setAssignedProjects(assigned);
  };

  const handleAdd = () => {
    if (!selectedProjectId) return;

    cpaService.create({
      contact_id: contactId,
      project_id: selectedProjectId,
      role: role.trim() || undefined,
    });

    loadProjects();
    setIsAdding(false);
    setSelectedProjectId("");
    setRole("");
    onChange?.();
  };

  const handleRemove = (projectId: string) => {
    const assignments = cpaService.getByContact(contactId);
    const assignment = assignments.find((a) => a.project_id === projectId);

    if (assignment) {
      cpaService.delete(assignment.id);
      loadProjects();
      onChange?.();
    }
  };

  const availableProjects = allProjects.filter(
    (project) =>
      !assignedProjects.some((assigned) => assigned.id === project.id)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Zugeordnete Projekte
      </label>

      <div className="space-y-2">
        {assignedProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-medium text-slate-800">{project.name}</div>
                {project.role && (
                  <div className="text-xs text-slate-500">{project.role}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleRemove(project.id)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              title="Zuordnung entfernen"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ))}

        {assignedProjects.length === 0 && !isAdding && (
          <p className="text-sm text-slate-500 py-2">
            Noch keine Projekt-Zuordnungen
          </p>
        )}
      </div>

      {!isAdding && availableProjects.length > 0 && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-3 flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:border-gurktaler-500 hover:text-gurktaler-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Projekt zuordnen
        </button>
      )}

      {isAdding && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">
              Projekt zuordnen
            </span>
            <button
              onClick={() => {
                setIsAdding(false);
                setSelectedProjectId("");
                setRole("");
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {availableProjects.length === 0 ? (
            <p className="text-sm text-slate-500">
              Alle Projekte wurden bereits zugeordnet
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Projekt *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                >
                  <option value="">Projekt auswählen...</option>
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Rolle (optional)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="z.B. Hauptlieferant, Berater..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!selectedProjectId}
                className="w-full px-3 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Zuordnen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
