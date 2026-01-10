import { useMemo, useState } from "react";
import {
  Project,
  ProjectDependency,
  CapacityUtilization,
} from "../../shared/types";

interface GanttChartProps {
  projects: Project[];
  contacts: any[];
  years: number;
  onProjectClick?: (project: Project) => void;
  onReorder?: (projectId: string, newIndex: number) => void;
  showCapacity?: boolean;
  capacityData?: CapacityUtilization;
}

interface TimelineBar {
  project: Project;
  startDate: Date;
  endDate: Date;
  startX: number;
  width: number;
  color: string;
  dependencies: ProjectDependency[];
  progress: number;
}

export default function GanttChart({
  projects,
  contacts,
  years,
  onProjectClick,
  onReorder,
  showCapacity = false,
  capacityData,
}: GanttChartProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    // Timeline-Berechnung
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // 1. Tag aktueller Monat
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Math.ceil(years * 12)); // +X Monate
    endDate.setDate(0); // Letzter Tag des vorherigen Monats

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Bars für jedes Projekt erstellen und nach sortOrder sortieren
    const bars: TimelineBar[] = projects
      .filter((p) => p.timeline?.enabled)
      .sort((a, b) => {
        // Erst nach sortOrder, dann nach Startdatum
        const orderA = a.timeline?.sortOrder ?? 999;
        const orderB = b.timeline?.sortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (
          new Date(a.timeline!.startDate).getTime() -
          new Date(b.timeline!.startDate).getTime()
        );
      })
      .map((project) => {
        const timeline = project.timeline!;
        const pStart = new Date(timeline.startDate);
        const pEnd = new Date(pStart);
        pEnd.setDate(pEnd.getDate() + timeline.durationWeeks * 7);

        // Position berechnen (0-100%)
        const daysFromStart = Math.ceil(
          (pStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const projectDays = Math.ceil(
          (pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        const startX = (daysFromStart / totalDays) * 100;
        const width = (projectDays / totalDays) * 100;

        // Farbe basierend auf Status (für Füllung)
        let color = "#84cc16"; // gurktaler-400 (geplant)
        if (project.status === "active") color = "#65a30d"; // gurktaler-600
        if (project.status === "completed") color = "#cbd5e1"; // slate-300
        if (project.status === "archived") color = "#e2e8f0"; // slate-200

        return {
          project,
          startDate: pStart,
          endDate: pEnd,
          startX,
          width,
          color,
          dependencies: timeline.dependencies,
          progress: timeline.progress || 0,
        };
      });

    // Quartale für Timeline generieren
    const quarters: Array<{ label: string; x: number }> = [];
    for (let y = 0; y < years; y++) {
      for (let q = 0; q < 4; q++) {
        const quarterStart = new Date(today.getFullYear() + y, q * 3, 1);
        const daysFromStart = Math.ceil(
          (quarterStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const x = (daysFromStart / totalDays) * 100;

        quarters.push({
          label: `Q${q + 1}/${(today.getFullYear() + y) % 100}`,
          x,
        });
      }
    }

    return { bars, quarters, startDate, endDate, totalDays };
  }, [projects, years]);

  const { bars, quarters } = chartData;

  const ROW_HEIGHT = 60;
  const CHART_HEIGHT = bars.length * ROW_HEIGHT + 50; // +50 für Header

  return (
    <div style={{ minHeight: CHART_HEIGHT }}>
      {/* Timeline Header */}
      <div className="relative h-12 border-b border-slate-300 mb-4">
        <div className="relative h-full">
          {quarters.map((q, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center text-xs font-medium text-slate-600"
              style={{ left: `${q.x}%` }}
            >
              <div className="px-2">{q.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Bars */}
      <div
        className="relative"
        style={{ minHeight: `${bars.length * ROW_HEIGHT}px` }}
      >
        {/* Weekly Grid Lines (Kalenderwochen) */}
        {Array.from({ length: Math.ceil(years * 52) }).map((_, i) => {
          const weekX = (i / (years * 52)) * 100;
          return (
            <div
              key={`week-${i}`}
              className="absolute top-0 border-l border-slate-100"
              style={{
                left: `${weekX}%`,
                height: `${bars.length * ROW_HEIGHT}px`,
              }}
            />
          );
        })}

        {/* Quarterly Grid Lines */}
        {quarters.map((q, i) => (
          <div
            key={i}
            className="absolute top-0 border-l border-slate-200"
            style={{
              left: `${q.x}%`,
              height: `${bars.length * ROW_HEIGHT}px`,
            }}
          />
        ))}

        {/* Project Rows */}
        {bars.map((bar, index) => {
          const timeline = bar.project.timeline!;
          const team = timeline.team
            .map((cId) => contacts.find((c) => c.id === cId)?.name)
            .filter(Boolean);

          const deps = timeline.dependencies
            .map((d) => {
              const depProject = projects.find((p) => p.id === d.projectId);
              const typeLabels = {
                "finish-to-start": "→",
                "start-to-start": "⇉",
                "finish-to-finish": "⇇",
                "start-to-finish": "↔",
              };
              return depProject
                ? `${typeLabels[d.type]} ${depProject.name}`
                : null;
            })
            .filter(Boolean);

          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={bar.project.id}
              className={`relative border-b border-slate-100 transition-all ${
                isDragging ? "opacity-50" : ""
              } ${isDragOver ? "bg-gurktaler-50" : "hover:bg-slate-50"}`}
              style={{ height: ROW_HEIGHT }}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (
                  draggedIndex !== null &&
                  draggedIndex !== index &&
                  onReorder
                ) {
                  onReorder(bars[draggedIndex].project.id, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
            >
              {/* Project Name - Above Timeline */}
              <div
                className="absolute left-0 right-0 px-2"
                style={{ top: "-8px" }}
              >
                <div className="text-xs font-semibold text-slate-700 truncate">
                  {bar.project.name}
                </div>
              </div>

              {/* Timeline Bar */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-10 rounded-md shadow-sm hover:shadow-lg transition-all cursor-move group overflow-visible"
                style={{
                  left: `${bar.startX}%`,
                  width: `${bar.width}%`,
                  backgroundColor: bar.color,
                  minWidth: "40px",
                  border: `3px solid ${bar.project.color || bar.color}`,
                }}
                onDoubleClick={() => onProjectClick?.(bar.project)}
              >
                {/* Progress Bar (darker overlay) */}
                <div
                  className="absolute inset-0 opacity-40 rounded-sm"
                  style={{
                    width: `${bar.progress}%`,
                    backgroundColor:
                      bar.project.status === "completed"
                        ? "#64748b"
                        : "#365314",
                    transition: "width 0.3s ease",
                  }}
                />

                {/* Bar Label */}
                <div className="relative flex items-center justify-between h-full px-2 text-xs font-medium text-white z-10">
                  <span className="truncate">{timeline.durationWeeks}w</span>
                  <span className="text-[10px] opacity-90">
                    {bar.progress}%
                  </span>
                </div>

                {/* Hover Tooltip - nur oben */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 max-w-sm whitespace-pre-line">
                    <div className="font-bold mb-1">{bar.project.name}</div>
                    <div className="text-slate-300">
                      {bar.startDate.toLocaleDateString("de-DE")} -{" "}
                      {bar.endDate.toLocaleDateString("de-DE")}
                    </div>
                    <div className="text-slate-300">
                      Dauer: {timeline.durationWeeks} Wochen • Fortschritt:{" "}
                      {bar.progress}%
                    </div>
                    {bar.project.description && (
                      <div className="mt-2 text-slate-300 border-t border-slate-700 pt-2">
                        {bar.project.description}
                      </div>
                    )}
                    {team.length > 0 && (
                      <div className="mt-2 text-slate-300">
                        <span className="font-semibold">Team:</span>{" "}
                        {team.join(", ")}
                      </div>
                    )}
                    {deps.length > 0 && (
                      <div className="mt-2 text-slate-300">
                        <div className="font-semibold">Abhängigkeiten:</div>
                        {deps.map((d, i) => (
                          <div key={i} className="ml-2">
                            • {d}
                          </div>
                        ))}
                      </div>
                    )}
                    {timeline.milestones.length > 0 && (
                      <div className="mt-2 text-slate-300">
                        <div className="font-semibold">
                          Meilensteine ({timeline.milestones.length}):
                        </div>
                        {timeline.milestones.slice(0, 3).map((m, i) => (
                          <div key={i} className="ml-2">
                            {m.completed ? "✓" : "○"} {m.name}
                          </div>
                        ))}
                        {timeline.milestones.length > 3 && (
                          <div className="ml-2 text-slate-400">
                            ... und {timeline.milestones.length - 3} weitere
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestones */}
                {timeline.milestones.map((milestone) => {
                  const mDate = new Date(milestone.date);
                  if (mDate < bar.startDate || mDate > bar.endDate) return null;

                  const daysFromProjectStart = Math.ceil(
                    (mDate.getTime() - bar.startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const projectTotalDays = Math.ceil(
                    (bar.endDate.getTime() - bar.startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const milestoneX =
                    (daysFromProjectStart / projectTotalDays) * 100;

                  return (
                    <div
                      key={milestone.id}
                      className="absolute top-0 -translate-y-1/2"
                      style={{ left: `${milestoneX}%` }}
                      title={`${milestone.name} - ${new Date(
                        milestone.date
                      ).toLocaleDateString("de-DE")}`}
                    >
                      <div
                        className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] ${
                          milestone.completed
                            ? "border-b-green-600"
                            : "border-b-amber-600"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Dependencies (Arrows) */}
              {bar.dependencies.map((dep) => {
                const depBar = bars.find((b) => b.project.id === dep.projectId);
                if (!depBar) return null;

                const depIndex = bars.findIndex(
                  (b) => b.project.id === dep.projectId
                );

                // Berechne Arrow-Position basierend auf Dependency-Typ
                let x1: number, x2: number;
                const y1 = depIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
                const y2 = index * ROW_HEIGHT + ROW_HEIGHT / 2;

                switch (dep.type) {
                  case "finish-to-start":
                    x1 = depBar.startX + depBar.width; // Ende von dep
                    x2 = bar.startX; // Start von bar
                    break;
                  case "start-to-start":
                    x1 = depBar.startX; // Start von dep
                    x2 = bar.startX; // Start von bar
                    break;
                  case "finish-to-finish":
                    x1 = depBar.startX + depBar.width; // Ende von dep
                    x2 = bar.startX + bar.width; // Ende von bar
                    break;
                  case "start-to-finish":
                    x1 = depBar.startX; // Start von dep
                    x2 = bar.startX + bar.width; // Ende von bar
                    break;
                  default:
                    x1 = depBar.startX + depBar.width;
                    x2 = bar.startX;
                }

                // Farbe basierend auf Typ
                const strokeColor =
                  dep.type === "start-to-start" ||
                  dep.type === "finish-to-finish"
                    ? "#3b82f6" // blue-500 für parallele/gleichzeitige
                    : "#94a3b8"; // slate-400 für sequentielle

                return (
                  <svg
                    key={dep.projectId}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ height: CHART_HEIGHT }}
                    viewBox={`0 0 100 ${CHART_HEIGHT}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker
                        id={`arrowhead-${dep.type}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill={strokeColor} />
                      </marker>
                    </defs>
                    <path
                      d={`M ${x1} ${y1} L ${(x1 + x2) / 2} ${y1} L ${
                        (x1 + x2) / 2
                      } ${y2} L ${x2} ${y2}`}
                      stroke={strokeColor}
                      strokeWidth="0.3"
                      fill="none"
                      markerEnd={`url(#arrowhead-${dep.type})`}
                      strokeDasharray={dep.type.includes("start") ? "1,1" : "0"}
                    />
                  </svg>
                );
              })}
            </div>
          );
        })}

        {/* Capacity Utilization Bar */}
        {showCapacity &&
          capacityData &&
          capacityData.quarters &&
          capacityData.quarters.length > 0 && (
            <div className="mt-8 mb-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Kapazitätsauslastung
              </div>
              <div className="relative h-8 rounded-lg overflow-hidden border border-slate-300">
                {quarters.map((q, i) => {
                  const nextQ = quarters[i + 1];
                  const width = nextQ ? nextQ.x - q.x : 100 - q.x;

                  // Finde Kapazität für dieses Quartal
                  const capacity = capacityData.quarters.find(
                    (cap) => cap.quarter === q.label
                  );
                  const percentage = capacity?.percentage || 0;

                  // Berechne Farbintensität (Orange-Skala: hell bei 0%, dunkel bei 100%)
                  const r = Math.round(255 - (percentage / 100) * 25); // 255 -> 230
                  const g = Math.round(243 - (percentage / 100) * 162); // 243 -> 81
                  const b = Math.round(224 - (percentage / 100) * 224); // 224 -> 0
                  const bgColor = `rgb(${r}, ${g}, ${b})`;

                  return (
                    <div
                      key={i}
                      className="absolute top-0 h-full flex items-center justify-center text-xs font-medium"
                      style={{
                        left: `${q.x}%`,
                        width: `${width}%`,
                        backgroundColor: percentage > 0 ? bgColor : "#f8f9fa",
                        color: percentage > 50 ? "white" : "#334155",
                      }}
                      title={`${q.label}: ${percentage}%`}
                    >
                      {percentage > 0 && `${percentage}%`}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
