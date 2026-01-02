import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Link2,
  Flag,
  Plus,
  X,
  TrendingUp,
} from "lucide-react";
import {
  ProjectTimeline,
  ProjectMilestone,
  Project,
  ProjectDependency,
  DependencyType,
} from "../../shared/types";
import * as storage from "../services/storage.ts";

interface ProjectTimelineFormProps {
  timeline: ProjectTimeline | undefined;
  onChange: (timeline: ProjectTimeline | undefined) => void;
  currentProjectId?: string; // Um sich selbst aus Abhängigkeiten auszuschließen
}

export default function ProjectTimelineForm({
  timeline,
  onChange,
  currentProjectId,
}: ProjectTimelineFormProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load contacts and projects
  useState(() => {
    storage.contacts.getAll().then(setContacts);
    storage.projects.getAll().then((p) => {
      // Exclude current project from dependencies
      setProjects(p.filter((proj) => proj.id !== currentProjectId));
    });
  });

  const enabled = timeline?.enabled || false;

  const toggleEnabled = () => {
    if (!enabled) {
      // Initialize with defaults
      onChange({
        enabled: true,
        startDate: new Date().toISOString().split("T")[0],
        durationWeeks: 4,
        team: [],
        dependencies: [],
        milestones: [],
      });
    } else {
      onChange(undefined);
    }
  };

  const updateField = <K extends keyof ProjectTimeline>(
    field: K,
    value: ProjectTimeline[K]
  ) => {
    if (!timeline) return;
    onChange({ ...timeline, [field]: value });
  };

  const addTeamMember = (contactId: string) => {
    if (!timeline || timeline.team.includes(contactId)) return;
    updateField("team", [...timeline.team, contactId]);
  };

  const removeTeamMember = (contactId: string) => {
    if (!timeline) return;
    updateField(
      "team",
      timeline.team.filter((id) => id !== contactId)
    );
  };

  const addDependency = (projectId: string, type: DependencyType) => {
    if (
      !timeline ||
      timeline.dependencies.some((d) => d.projectId === projectId)
    )
      return;
    const newDep: ProjectDependency = { projectId, type };
    updateField("dependencies", [...timeline.dependencies, newDep]);
  };

  const removeDependency = (projectId: string) => {
    if (!timeline) return;
    updateField(
      "dependencies",
      timeline.dependencies.filter((d) => d.projectId !== projectId)
    );
  };

  const addMilestone = () => {
    if (!timeline) return;
    const newMilestone: ProjectMilestone = {
      id: Date.now().toString(),
      name: "",
      date: new Date().toISOString().split("T")[0],
      completed: false,
    };
    updateField("milestones", [...timeline.milestones, newMilestone]);
  };

  const updateMilestone = (
    id: string,
    field: keyof ProjectMilestone,
    value: any
  ) => {
    if (!timeline) return;
    updateField(
      "milestones",
      timeline.milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const removeMilestone = (id: string) => {
    if (!timeline) return;
    updateField(
      "milestones",
      timeline.milestones.filter((m) => m.id !== id)
    );
  };

  const calculateEndDate = () => {
    if (!timeline) return "";
    const start = new Date(timeline.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + timeline.durationWeeks * 7);
    return end.toLocaleDateString("de-DE");
  };

  const availableContacts = contacts.filter(
    (c) => !timeline?.team.includes(c.id)
  );
  const availableProjects = projects.filter(
    (p) => !timeline?.dependencies.some((d) => d.projectId === p.id)
  );

  return (
    <div className="space-y-4">
      {/* Enable Timeline Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="timeline-enabled"
          checked={enabled}
          onChange={toggleEnabled}
          className="w-4 h-4 text-gurktaler-600 rounded focus:ring-gurktaler-500"
        />
        <label
          htmlFor="timeline-enabled"
          className="text-sm font-medium text-slate-700"
        >
          In Zeitplanung aufnehmen (Gantt-Chart)
        </label>
      </div>

      {enabled && timeline && (
        <div className="space-y-4 pl-6 border-l-2 border-gurktaler-200">
          {/* Start Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Startdatum
              </label>
              <input
                type="date"
                value={timeline.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Dauer (Wochen)
              </label>
              <input
                type="number"
                min="1"
                value={timeline.durationWeeks}
                onChange={(e) =>
                  updateField("durationWeeks", parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ende (berechnet)
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
                {calculateEndDate()}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Fortschritt: {timeline.progress || 0}%
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={timeline.progress || 0}
                onChange={(e) =>
                  updateField("progress", parseInt(e.target.value))
                }
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gurktaler-600"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={timeline.progress || 0}
                onChange={(e) =>
                  updateField(
                    "progress",
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500 text-center"
              />
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gurktaler-600 transition-all duration-300"
                style={{ width: `${timeline.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Team-Mitglieder
            </label>

            {timeline.team.length > 0 && (
              <div className="space-y-2 mb-2">
                {timeline.team.map((contactId) => {
                  const contact = contacts.find((c) => c.id === contactId);
                  return (
                    <div
                      key={contactId}
                      className="flex items-center justify-between px-3 py-2 bg-gurktaler-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">
                        {contact?.name || "Unbekannt"}
                      </span>
                      <button
                        onClick={() => removeTeamMember(contactId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availableContacts.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) addTeamMember(e.target.value);
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500"
              >
                <option value="">+ Person hinzufügen</option>
                {availableContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Link2 className="w-4 h-4 inline mr-1" />
              Abhängigkeiten
            </label>

            {timeline.dependencies.length > 0 && (
              <div className="space-y-2 mb-2">
                {timeline.dependencies.map((dep) => {
                  const project = projects.find((p) => p.id === dep.projectId);
                  const typeLabels = {
                    "finish-to-start": "→ Start nach Ende",
                    "start-to-start": "⇉ Start parallel",
                    "finish-to-finish": "⇇ Ende gleichzeitig",
                    "start-to-finish": "↔ Start mit Ende",
                  };
                  return (
                    <div
                      key={dep.projectId}
                      className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700">
                          {project?.name || "Unbekannt"}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {typeLabels[dep.type]}
                        </span>
                      </div>
                      <button
                        onClick={() => removeDependency(dep.projectId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availableProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select
                  id="dep-project"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500"
                >
                  <option value="">Projekt wählen...</option>
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <select
                  id="dep-type"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gurktaler-500"
                >
                  <option value="finish-to-start">→ Start nach Ende</option>
                  <option value="start-to-start">⇉ Start parallel</option>
                  <option value="finish-to-finish">⇇ Ende gleichzeitig</option>
                  <option value="start-to-finish">↔ Start mit Ende</option>
                </select>
                <button
                  onClick={() => {
                    const projectSelect = document.getElementById(
                      "dep-project"
                    ) as HTMLSelectElement;
                    const typeSelect = document.getElementById(
                      "dep-type"
                    ) as HTMLSelectElement;
                    if (projectSelect.value) {
                      addDependency(
                        projectSelect.value,
                        typeSelect.value as DependencyType
                      );
                      projectSelect.value = "";
                    }
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Abhängigkeit hinzufügen
                </button>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Meilensteine
            </label>

            {timeline.milestones.length > 0 && (
              <div className="space-y-2 mb-2">
                {timeline.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={(e) =>
                        updateMilestone(
                          milestone.id,
                          "completed",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-gurktaler-600 rounded"
                    />
                    <input
                      type="text"
                      value={milestone.name}
                      onChange={(e) =>
                        updateMilestone(milestone.id, "name", e.target.value)
                      }
                      placeholder="Meilenstein-Name"
                      className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-gurktaler-500"
                    />
                    <input
                      type="date"
                      value={milestone.date}
                      onChange={(e) =>
                        updateMilestone(milestone.id, "date", e.target.value)
                      }
                      className="px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-gurktaler-500"
                    />
                    <button
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addMilestone}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gurktaler-600 hover:bg-gurktaler-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Meilenstein hinzufügen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
