import { Trash2, Edit, Calendar } from "lucide-react";

interface GoogleEventCardProps {
  event: any;
  onEdit: (event: any) => void;
  onDelete: (eventId: string) => void;
}

export function GoogleEventCard({
  event,
  onEdit,
  onDelete,
}: GoogleEventCardProps) {
  const getEventTime = () => {
    if (event.start?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      return `${start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "Ganztägig";
  };

  return (
    <div className="p-3 rounded-vintage border-vintage bg-purple-50 border-purple-200 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Calendar className="w-5 h-5 text-purple-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-body font-medium text-distillery-900">
              {event.summary || "Ohne Titel"}
            </h3>
            {event.description && (
              <p className="text-sm text-distillery-600 mt-1 font-body">
                {event.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-purple-700">
              <span className="px-2 py-0.5 rounded bg-purple-100">
                📅 {getEventTime()}
              </span>
              <span className="text-distillery-500">Google Calendar</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(event)}
            className="p-1 text-gurktaler-600 hover:text-gurktaler-700 transition-colors"
            title="Bearbeiten"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Termin "${event.summary}" wirklich löschen?`)) {
                onDelete(event.id);
              }
            }}
            className="p-1 text-red-600 hover:text-red-700 transition-colors"
            title="Löschen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
