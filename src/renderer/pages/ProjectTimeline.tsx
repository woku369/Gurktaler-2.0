import { useState, useEffect } from "react";
import { Calendar, Download, Settings as SettingsIcon } from "lucide-react";
import { Project } from "../../shared/types";
import * as storage from "../services/storage.ts";
import GanttChart from "../components/GanttChart.tsx";
import { exportTimelineToPDF } from "../services/timelineExport.ts";

export default function ProjectTimeline() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [timelineYears, setTimelineYears] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allProjects, allContacts] = await Promise.all([
      storage.projects.getAll(),
      storage.contacts.getAll(),
    ]);
    setProjects(allProjects);
    setContacts(allContacts);
    setLoading(false);
  };

  // Filter: Nur Projekte mit aktivierter Timeline
  const timelineProjects = projects.filter((p) => p.timeline?.enabled);

  const handleExportPDF = () => {
    exportTimelineToPDF(timelineProjects, contacts, timelineYears);
  };

  const handleProjectClick = (project: Project) => {
    // TODO: Hier ProjectForm Modal öffnen oder zur Projektseite navigieren
    console.log("Projekt öffnen:", project.name);
  };

  const handleReorder = async (projectId: string, newIndex: number) => {
    // Update sortOrder for all timeline projects
    const reorderedProjects = [...timelineProjects];
    const oldIndex = reorderedProjects.findIndex((p) => p.id === projectId);

    if (oldIndex === -1) return;

    const [movedProject] = reorderedProjects.splice(oldIndex, 1);
    reorderedProjects.splice(newIndex, 0, movedProject);

    // Update sortOrder for all projects
    for (let i = 0; i < reorderedProjects.length; i++) {
      const project = reorderedProjects[i];
      if (project.timeline) {
        await storage.projects.update(project.id, {
          timeline: { ...project.timeline, sortOrder: i },
        });
      }
    }

    // Reload data
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Lade Projekte...</div>
      </div>
    );
  }

  if (timelineProjects.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Calendar className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Keine Projekte in der Zeitplanung
          </h3>
          <p className="text-slate-600 mb-4">
            Aktiviere die Zeitplanung in einzelnen Projekten, um sie hier
            anzuzeigen.
          </p>
          <p className="text-sm text-slate-500">
            Gehe zu <strong>Projekte</strong> → Projekt bearbeiten →{" "}
            <strong>"In Zeitplanung aufnehmen"</strong> aktivieren
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Projekt-Zeitplanung
        </h1>
        <p className="text-slate-600">
          Gantt-Chart mit {timelineProjects.length}{" "}
          {timelineProjects.length === 1 ? "Projekt" : "Projekten"}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Zeitraum:
              </span>
              <select
                value={timelineYears}
                onChange={(e) => setTimelineYears(parseInt(e.target.value))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gurktaler-500"
              >
                <option value={1}>1 Jahr</option>
                <option value={2}>2 Jahre</option>
                <option value={3}>3 Jahre</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF Export
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
        <div className="mb-4 text-sm text-slate-600 italic">
          💡 Tipp: Projekte können per Drag & Drop sortiert werden • Doppelklick
          öffnet Projektkarte
        </div>
        <GanttChart
          projects={timelineProjects}
          contacts={contacts}
          years={timelineYears}
          onProjectClick={handleProjectClick}
          onReorder={handleReorder}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Legende</h3>

        {/* Status-Farben */}
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 mb-2">
            Projekt-Status
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-gurktaler-400 rounded"></div>
              <span>Geplant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-gurktaler-600 rounded"></div>
              <span>In Arbeit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-slate-300 rounded"></div>
              <span>Abgeschlossen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-600"></div>
              <span>Meilenstein</span>
            </div>
          </div>
        </div>

        {/* Abhängigkeits-Typen */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">
            Abhängigkeits-Typen
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-4 h-[2px] bg-slate-400"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-slate-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
              <span>→ Start nach Ende</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div
                  className="w-4 h-[2px] bg-blue-500 border-dashed"
                  style={{ borderTop: "2px dashed" }}
                ></div>
                <div className="w-0 h-0 border-l-[4px] border-l-blue-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
              <span>⇉ Start parallel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-4 h-[2px] bg-blue-500"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-blue-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
              <span>⇇ Ende gleichzeitig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div
                  className="w-4 h-[2px] bg-blue-500 border-dashed"
                  style={{ borderTop: "2px dashed" }}
                ></div>
                <div className="w-0 h-0 border-l-[4px] border-l-blue-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
              </div>
              <span>↔ Start mit Ende</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
