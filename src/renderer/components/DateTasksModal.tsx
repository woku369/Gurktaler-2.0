import {
  X,
  Plus,
  Clock,
  CheckSquare,
  Square,
  FileText,
  Save,
} from "lucide-react";
import type { Task, TaskStatus, Project } from "@/shared/types";
import { GoogleEventCard } from "./GoogleEventCard";

interface DateTasksModalProps {
  selectedDate: Date;
  allTasks: Task[];
  googleCalendarEvents: any[];
  availableProjects: Project[];
  showEventForm: boolean;
  editingEvent: any | null;
  newEvent: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
  };
  onClose: () => void;
  onNewEventClick: () => void;
  onTaskStatusToggle: (
    taskId: string,
    currentStatus: TaskStatus,
  ) => Promise<void>;
  onTaskEdit: (task: Task) => void;
  onEventEdit: (event: any) => void;
  onEventDelete: (eventId: string) => void;
  onEventChange: (field: string, value: any) => void;
  onEventSave: () => void;
  onEventFormCancel: () => void;
}

export function DateTasksModal({
  selectedDate,
  allTasks,
  googleCalendarEvents,
  availableProjects,
  showEventForm,
  editingEvent,
  newEvent,
  onClose,
  onNewEventClick,
  onTaskStatusToggle,
  onTaskEdit,
  onEventEdit,
  onEventDelete,
  onEventChange,
  onEventSave,
  onEventFormCancel,
}: DateTasksModalProps) {
  const dateTasks = allTasks.filter((task) => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === compareDate.getTime();
  });

  const dateEvents = googleCalendarEvents.filter((event) => {
    const eventDate = event.start?.date || event.start?.dateTime;
    if (!eventDate) return false;
    const evtDate = new Date(eventDate);
    evtDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    return evtDate.getTime() === compareDate.getTime();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-vintage shadow-vintage-lg max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b-vintage border-distillery-200 bg-gurktaler-50 flex items-center justify-between shrink-0">
          <h2 className="font-heading font-semibold text-distillery-900">
            {selectedDate.toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewEventClick}
              className="px-3 py-1 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors text-sm font-body flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Neuer Termin
            </button>
            <button
              onClick={onClose}
              className="text-distillery-500 hover:text-distillery-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {showEventForm ? (
            /* Event Form */
            <div className="bg-gurktaler-50 p-4 rounded-vintage border-vintage border-distillery-200">
              <h3 className="font-heading font-semibold text-distillery-900 mb-4">
                {editingEvent ? "Termin bearbeiten" : "Neuer Termin"}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-distillery-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => onEventChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-distillery-300 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                    placeholder="z.B. Meeting mit Team"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-distillery-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      onEventChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-distillery-300 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                    rows={3}
                    placeholder="Details zum Termin..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.isAllDay}
                      onChange={(e) =>
                        onEventChange("isAllDay", e.target.checked)
                      }
                      className="rounded border-distillery-300 text-gurktaler-600 focus:ring-gurktaler-500"
                    />
                    <span className="text-sm font-medium text-distillery-700">
                      Ganztägig
                    </span>
                  </label>
                </div>
                {!newEvent.isAllDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-distillery-700 mb-1">
                        Startzeit
                      </label>
                      <input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) =>
                          onEventChange("startTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-distillery-300 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-distillery-700 mb-1">
                        Endzeit
                      </label>
                      <input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) =>
                          onEventChange("endTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-distillery-300 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-distillery-200">
                  <button
                    onClick={onEventFormCancel}
                    className="px-4 py-2 border border-distillery-300 text-distillery-700 rounded-vintage hover:bg-distillery-50 transition-colors font-body"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={onEventSave}
                    disabled={!newEvent.title}
                    className="px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvent ? "Aktualisieren" : "Erstellen"}
                  </button>
                </div>
              </div>
            </div>
          ) : dateTasks.length === 0 && dateEvents.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-distillery-300 mb-3" />
              <p className="text-distillery-500 font-body">
                Keine Termine für dieses Datum
              </p>
              <p className="text-sm text-distillery-400 mt-2 font-body">
                Klicke auf "Neuer Termin" um einen hinzuzufügen
              </p>
            </div>
          ) : (
            /* Tasks & Events List */
            <div className="space-y-4">
              {/* Google Calendar Events */}
              {dateEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-distillery-700 mb-2 flex items-center gap-2">
                    📅 Google Calendar ({dateEvents.length})
                  </h3>
                  <div className="space-y-2">
                    {dateEvents.map((event) => (
                      <GoogleEventCard
                        key={event.id}
                        event={event}
                        onEdit={(evt) => {
                          const eventDate =
                            evt.start?.date ||
                            evt.start?.dateTime?.split("T")[0];
                          const isAllDay = !!evt.start?.date;
                          let startTime = "09:00";
                          let endTime = "10:00";

                          if (evt.start?.dateTime) {
                            const start = new Date(evt.start.dateTime);
                            const end = new Date(evt.end.dateTime);
                            startTime = start.toTimeString().substring(0, 5);
                            endTime = end.toTimeString().substring(0, 5);
                          }

                          onEventChange("title", evt.summary || "");
                          onEventChange("description", evt.description || "");
                          onEventChange("date", eventDate);
                          onEventChange("isAllDay", isAllDay);
                          onEventChange("startTime", startTime);
                          onEventChange("endTime", endTime);
                          onEventEdit(evt);
                        }}
                        onDelete={onEventDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* App TODOs */}
              {dateTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-distillery-700 mb-2 flex items-center gap-2">
                    ✓ TODOs ({dateTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-vintage border-vintage transition-all ${
                          task.status === "completed"
                            ? "bg-green-50 border-green-200"
                            : task.priority === "high"
                              ? "bg-red-50 border-red-200"
                              : task.priority === "medium"
                                ? "bg-amber-50 border-amber-200"
                                : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() =>
                                onTaskStatusToggle(task.id, task.status)
                              }
                              className="mt-1"
                            >
                              {task.status === "completed" ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Square className="w-5 h-5 text-distillery-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h3
                                className={`font-body font-medium ${
                                  task.status === "completed"
                                    ? "line-through text-distillery-500"
                                    : "text-distillery-900"
                                }`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-distillery-600 mt-1 font-body">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-distillery-500">
                                <span
                                  className={`px-2 py-0.5 rounded ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : task.priority === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {task.priority === "high"
                                    ? "Hoch"
                                    : task.priority === "medium"
                                      ? "Mittel"
                                      : "Niedrig"}
                                </span>
                                {task.project_id && (
                                  <span>
                                    Projekt:{" "}
                                    {
                                      availableProjects.find(
                                        (p) => p.id === task.project_id,
                                      )?.name
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onTaskEdit(task)}
                            className="text-gurktaler-600 hover:text-gurktaler-700 transition-colors"
                            title="Bearbeiten"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
