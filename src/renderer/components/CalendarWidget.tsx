import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { Task } from "@/shared/types";

interface CalendarWidgetProps {
  tasks: Task[];
  googleEvents?: any[];
  onDateClick?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  googleEvents: any[];
}

export function CalendarWidget({
  tasks,
  googleEvents = [],
  onDateClick,
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  useEffect(() => {
    generateCalendar();
  }, [currentDate, tasks, googleEvents]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    // Letzter Tag des Monats
    const lastDay = new Date(year, month + 1, 0);

    // Wochentag des ersten Tags (0=Sonntag, 1=Montag, ..., 6=Samstag)
    let firstDayOfWeek = firstDay.getDay();
    // Konvertiere zu Montag=0, Sonntag=6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vorherige Monatstage
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date),
        googleEvents: getGoogleEventsForDate(date),
      });
    }

    // Aktuelle Monatstage
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date),
        googleEvents: getGoogleEventsForDate(date),
      });
    }

    // Nächste Monatstage (bis Kalender voll ist - 42 Tage = 6 Wochen)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date),
        googleEvents: getGoogleEventsForDate(date),
      });
    }

    setCalendarDays(days);
  };

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === compareDate.getTime();
    });
  };

  const getGoogleEventsForDate = (date: Date): any[] => {
    return googleEvents.filter((event) => {
      const eventDate = event.start?.date || event.start?.dateTime;
      if (!eventDate) return false;

      const evtDate = new Date(eventDate);
      evtDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      return evtDate.getTime() === compareDate.getTime();
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gurktaler-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-gurktaler-600 hover:text-gurktaler-700 font-medium"
          >
            Heute
          </button>
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded text-gray-700"
            title="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded text-gray-700"
            title="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kalendertage */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          return (
            <div
              key={index}
              onClick={() => day.isCurrentMonth && onDateClick?.(day.date)}
              className={`
                min-h-[60px] p-1 rounded border
                ${
                  day.isCurrentMonth
                    ? "bg-white border-gray-200 cursor-pointer hover:bg-gray-50"
                    : "bg-gray-50 border-gray-100"
                }
                ${day.isToday ? "ring-2 ring-gurktaler-500" : ""}
                transition-colors
              `}
            >
              <div className="flex flex-col h-full">
                {/* Tagesnummer */}
                <div
                  className={`
                  text-xs font-medium mb-1
                  ${
                    day.isCurrentMonth
                      ? day.isToday
                        ? "text-gurktaler-600 font-bold"
                        : "text-gray-900"
                      : "text-gray-400"
                  }
                `}
                >
                  {day.date.getDate()}
                </div>

                {/* Task & Event Indicators */}
                {(day.tasks.length > 0 || day.googleEvents.length > 0) &&
                  day.isCurrentMonth && (
                    <div className="flex flex-col gap-0.5 flex-1">
                      {/* TODOs aus der App */}
                      {day.tasks.slice(0, 1).map((task, i) => (
                        <div
                          key={`task-${i}`}
                          className={`
                          text-[9px] px-1 py-0.5 rounded truncate
                          ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700 line-through"
                              : `${getPriorityColor(task.priority)} bg-opacity-20`
                          }
                        `}
                          title={`TODO: ${task.title}`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {/* Google Calendar Events */}
                      {day.googleEvents.slice(0, 1).map((event, i) => (
                        <div
                          key={`event-${i}`}
                          className="text-[9px] px-1 py-0.5 rounded truncate bg-purple-100 text-purple-700"
                          title={`Event: ${event.summary}`}
                        >
                          📅 {event.summary}
                        </div>
                      ))}
                      {day.tasks.length + day.googleEvents.length > 2 && (
                        <div className="text-[9px] text-gray-500 px-1">
                          +{day.tasks.length + day.googleEvents.length - 2}{" "}
                          weitere
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legende */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500 bg-opacity-20"></div>
              <span>Hohe Priorität</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-500 bg-opacity-20"></div>
              <span>Mittlere Priorität</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500 bg-opacity-20"></div>
              <span>Niedrige Priorität</span>
            </div>
          </div>
          <div className="text-gray-500">
            {tasks.filter((t) => t.due_date && t.status !== "completed").length}{" "}
            offene TODOs
          </div>
        </div>
      </div>
    </div>
  );
}
