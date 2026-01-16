import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exportTasksToPDF } from "@/renderer/services/taskExport";
import {
  initGoogleCalendar,
  loginGoogleCalendar,
  logoutGoogleCalendar,
  syncAllTasksToGoogleCalendar,
  addTaskToGoogleCalendar,
  isGoogleCalendarLoggedIn,
} from "@/renderer/services/googleCalendar";
import {
  FolderKanban,
  Package,
  FlaskConical,
  StickyNote,
  Plus,
  Star,
  ExternalLink,
  Users,
  Beaker,
  Archive,
  CheckSquare,
  Square,
  X,
  Clock,
  AlertCircle,
  Globe,
  FileText,
} from "lucide-react";
import {
  projects as projectsStorage,
  products,
  recipes,
  notes,
  favorites,
  contacts,
  weblinks,
  ingredients,
  containers,
  tasks,
  workspaces as workspacesService,
} from "@/renderer/services/storage";
import type {
  Favorite,
  Task,
  TaskStatus,
  TaskPriority,
  Project,
  ProjectWorkspace,
} from "@/shared/types";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      label: "Aktive Projekte",
      value: 0,
      icon: FolderKanban,
      color: "bg-blue-500",
    },
    { label: "Produkte", value: 0, icon: Package, color: "bg-gurktaler-500" },
    {
      label: "Rezepturen",
      value: 0,
      icon: FlaskConical,
      color: "bg-amber-500",
    },
    { label: "Notizen", value: 0, icon: StickyNote, color: "bg-purple-500" },
  ]);
  const [favoriteItems, setFavoriteItems] = useState<
    Array<{ favorite: Favorite; name: string; icon: any; route: string }>
  >([]);
  const [todoList, setTodoList] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Ungefiltertes Original
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter & Sort States
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all"
  );
  const [filterProject, setFilterProject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "due_date" | "priority" | "title" | "created"
  >("created");
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);

  // Google Calendar
  const [googleCalendarReady, setGoogleCalendarReady] = useState(false);
  const [googleCalendarLoggedIn, setGoogleCalendarLoggedIn] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Google Calendar initialisieren (optional)
    initGoogleCalendar()
      .then(() => {
        setGoogleCalendarReady(true);
        setGoogleCalendarLoggedIn(isGoogleCalendarLoggedIn());
      })
      .catch((error) => {
        console.warn(
          "Google Calendar konnte nicht initialisiert werden:",
          error
        );
      });
  }, []);

  const loadDashboardData = async () => {
    const allProjects = await projectsStorage.getAll();
    const allProducts = await products.getAll();
    const allRecipes = await recipes.getAll();
    const allNotes = await notes.getAll();

    // Update stats
    setStats([
      {
        label: "Aktive Projekte",
        value: allProjects.filter((p) => p.status === "active").length,
        icon: FolderKanban,
        color: "bg-blue-500",
      },
      {
        label: "Produkte",
        value: allProducts.length,
        icon: Package,
        color: "bg-gurktaler-500",
      },
      {
        label: "Rezepturen",
        value: allRecipes.length,
        icon: FlaskConical,
        color: "bg-amber-500",
      },
      {
        label: "Notizen",
        value: allNotes.length,
        icon: StickyNote,
        color: "bg-purple-500",
      },
    ]);

    // Load favorites
    const allFavorites = await favorites.getAll();
    const allContacts = await contacts.getAll();
    const allWeblinks = await weblinks.getAll();
    const allIngredients = await ingredients.getAll();
    const allContainers = await containers.getAll();

    const favItems = allFavorites.slice(0, 8).map((fav) => {
      let name = "";
      let icon = Star;
      let route = "/";

      switch (fav.entity_type) {
        case "project":
          const proj = allProjects.find((p) => p.id === fav.entity_id);
          name = proj?.name || "Unbekanntes Projekt";
          icon = FolderKanban;
          route = "/projects";
          break;
        case "product":
          const prod = allProducts.find((p) => p.id === fav.entity_id);
          name = prod?.name || "Unbekanntes Produkt";
          icon = Package;
          route = "/products";
          break;
        case "recipe":
          const rec = allRecipes.find((r) => r.id === fav.entity_id);
          name = rec?.name || "Unbekannte Rezeptur";
          icon = FlaskConical;
          route = "/recipes";
          break;
        case "note":
          const note = allNotes.find((n) => n.id === fav.entity_id);
          name = note?.title || "Unbekannte Notiz";
          icon = StickyNote;
          route = "/notes";
          break;
        case "contact":
          const cont = allContacts.find((c) => c.id === fav.entity_id);
          name = cont?.name || "Unbekannter Kontakt";
          icon = Users;
          route = "/contacts";
          break;
        case "weblink":
          const web = allWeblinks.find((w) => w.id === fav.entity_id);
          name = web?.title || "Unbekannter Link";
          icon = ExternalLink;
          route = "/research";
          break;
        case "ingredient":
          const ing = allIngredients.find((i) => i.id === fav.entity_id);
          name = ing?.name || "Unbekannte Zutat";
          icon = Beaker;
          route = "/ingredients";
          break;
        case "container":
          const con = allContainers.find((c) => c.id === fav.entity_id);
          name = con?.name || "Unbekanntes Gebinde";
          icon = Archive;
          route = "/containers";
          break;
      }

      return { favorite: fav, name, icon, route };
    });

    setFavoriteItems(favItems);

    // Load tasks & projects
    const loadedTasks = await tasks.getAll();
    setAllTasks(loadedTasks);
    applyFiltersAndSort(loadedTasks);

    const loadedProjects = await projectsStorage.getAll();
    setAvailableProjects(loadedProjects);

    const loadedWorkspaces = await workspacesService.getAll();
    setWorkspaces(loadedWorkspaces);
  };

  // Filter & Sort Logik
  const applyFiltersAndSort = (tasksToFilter: Task[] = allTasks) => {
    let filtered = [...tasksToFilter];

    // Status Filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Priority Filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    // Project Filter
    if (filterProject !== "all") {
      filtered = filtered.filter((t) => t.project_id === filterProject);
    }

    // Sortierung
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "due_date":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    setTodoList(filtered);
  };

  // Filter/Sort bei Änderung anwenden
  useEffect(() => {
    applyFiltersAndSort();
  }, [filterStatus, filterPriority, filterProject, sortBy, allTasks]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask = await tasks.create({
      title: newTaskTitle,
      status: "open",
      priority: "medium",
      project_id: filterProject !== "all" ? filterProject : undefined, // Projekt vorauswählen wenn Filter aktiv
    });

    setNewTaskTitle("");
    await loadDashboardData();

    // Edit-Modal direkt öffnen für weitere Details
    setEditingTask(newTask);
    setShowEditModal(true);
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus: TaskStatus =
      task.status === "completed" ? "open" : "completed";
    await tasks.update(task.id, {
      status: newStatus,
      completed_at:
        newStatus === "completed" ? new Date().toISOString() : undefined,
    });
    await loadDashboardData();
  };

  const handleDeleteTask = async (id: string) => {
    await tasks.delete(id);
    await loadDashboardData();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;

    await tasks.update(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      assignee: editingTask.assignee,
      due_date: editingTask.due_date,
      priority: editingTask.priority,
      project_id: editingTask.project_id,
    });

    setShowEditModal(false);
    setEditingTask(null);
    await loadDashboardData();
  };

  // iCal Export
  const generateICalString = (task: Task): string => {
    const now =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dueDate = task.due_date
      ? new Date(task.due_date)
          .toISOString()
          .replace(/[-:]/g, "")
          .split(".")[0] + "Z"
      : now;

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gurktaler 2.0//TODO Export//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTODO",
      `UID:${task.id}@gurktaler.app`,
      `DTSTAMP:${now}`,
      `CREATED:${
        new Date(task.created_at)
          .toISOString()
          .replace(/[-:]/g, "")
          .split(".")[0] + "Z"
      }`,
      `SUMMARY:${task.title}`,
      task.description
        ? `DESCRIPTION:${task.description.replace(/\n/g, "\\n")}`
        : "",
      `DUE:${dueDate}`,
      `PRIORITY:${
        task.priority === "high" ? "1" : task.priority === "medium" ? "5" : "9"
      }`,
      `STATUS:${
        task.status === "completed"
          ? "COMPLETED"
          : task.status === "in-progress"
          ? "IN-PROCESS"
          : "NEEDS-ACTION"
      }`,
      task.completed_at
        ? `COMPLETED:${
            new Date(task.completed_at)
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0] + "Z"
          }`
        : "",
      "END:VTODO",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
  };

  const handleExportICalSingle = (task: Task) => {
    const icalContent = generateICalString(task);
    const blob = new Blob([icalContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${task.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.ics`;
    link.click();
  };

  const handleExportICalAll = () => {
    const header = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gurktaler 2.0//TODO Export//DE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n");

    const todos = todoList
      .map((task) => {
        const lines = generateICalString(task).split("\r\n");
        return lines.slice(5, -1).join("\r\n"); // Nur VTODO Teil ohne Calendar wrapper
      })
      .join("\r\n");

    const footer = "END:VCALENDAR";
    const icalContent = `${header}\r\n${todos}\r\n${footer}`;

    const blob = new Blob([icalContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gurktaler_aufgaben_${
      new Date().toISOString().split("T")[0]
    }.ics`;
    link.click();
  };

  // PDF Export
  const handleExportPDF = () => {
    exportTasksToPDF(todoList, availableProjects, {
      title: "Gurktaler 2.0 — Aufgabenliste",
      groupBy: "priority",
      showCompleted: true,
      workspaces: workspaces,
      filterProject: filterProject !== "all" ? filterProject : undefined,
    });
  };

  // Google Calendar Functions
  const handleGoogleCalendarLogin = async () => {
    try {
      await loginGoogleCalendar();
      setGoogleCalendarLoggedIn(true);
      alert("✅ Erfolgreich mit Google Calendar verbunden!");
    } catch (error) {
      console.error("Google Calendar Login fehlgeschlagen:", error);
      alert(
        "❌ Google Calendar Login fehlgeschlagen. Bitte versuche es erneut."
      );
    }
  };

  const handleGoogleCalendarLogout = () => {
    logoutGoogleCalendar();
    setGoogleCalendarLoggedIn(false);
    alert("✅ Von Google Calendar abgemeldet.");
  };

  // Prevent unused warning (function wird bei Logout-Button verwendet, aber nicht alle Branches nutzen es)
  void handleGoogleCalendarLogout;

  const handleSyncToGoogleCalendar = async () => {
    if (!googleCalendarLoggedIn) {
      alert("⚠️ Bitte zuerst mit Google Calendar verbinden!");
      return;
    }

    try {
      const result = await syncAllTasksToGoogleCalendar(todoList);
      alert(
        `✅ Synchronisierung abgeschlossen!\n\n${result.success} Aufgaben erfolgreich synchronisiert\n${result.failed} Fehler`
      );
    } catch (error) {
      console.error("Sync fehlgeschlagen:", error);
      alert("❌ Synchronisierung fehlgeschlagen. Siehe Console für Details.");
    }
  };

  const handleAddSingleToGoogleCalendar = async (task: Task) => {
    if (!googleCalendarLoggedIn) {
      alert("⚠️ Bitte zuerst mit Google Calendar verbinden!");
      return;
    }

    try {
      await addTaskToGoogleCalendar(task);
      alert(`✅ "${task.title}" zu Google Calendar hinzugefügt!`);
    } catch (error) {
      console.error("Fehler beim Hinzufügen:", error);
      alert("❌ Fehler beim Hinzufügen zu Google Calendar.");
    }
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-slate-500";
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      case "low":
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-distillery-900">
          Dashboard
        </h1>
        <p className="text-distillery-600 font-body">
          Willkommen bei Gurktaler 2.0 — Tradition trifft Innovation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 ${stat.color} rounded-vintage flex items-center justify-center shadow-md border-2 border-white/20`}
              >
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-distillery-900">
                  {stat.value}
                </p>
                <p className="text-sm text-distillery-600 font-body">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO & Schnellzugriff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* TODO-Liste */}
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200">
          <div className="p-4 border-b-vintage border-distillery-200 bg-gurktaler-50">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-distillery-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Aufgaben
              </h2>
              <div className="flex gap-2">
                {/* Google Calendar */}
                {googleCalendarReady && (
                  <>
                    {!googleCalendarLoggedIn ? (
                      <button
                        onClick={handleGoogleCalendarLogin}
                        className="text-sm px-3 py-1 bg-blue-500 text-white rounded-vintage hover:bg-blue-600 transition-colors font-body flex items-center gap-1"
                        title="Mit Google Calendar verbinden"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Google
                      </button>
                    ) : (
                      <button
                        onClick={handleSyncToGoogleCalendar}
                        className="text-sm px-3 py-1 bg-green-500 text-white rounded-vintage hover:bg-green-600 transition-colors font-body flex items-center gap-1"
                        title="Mit Google Calendar synchronisieren"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Sync
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={handleExportPDF}
                  className="text-sm px-3 py-1 bg-red-500 text-white rounded-vintage hover:bg-red-600 transition-colors font-body flex items-center gap-1"
                  title="Als PDF exportieren"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={handleExportICalAll}
                  className="text-sm px-3 py-1 bg-purple-500 text-white rounded-vintage hover:bg-purple-600 transition-colors font-body flex items-center gap-1"
                  title="Alle als iCal exportieren"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  iCal
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* Filter & Sort */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as TaskStatus | "all")
                }
                className="px-2 py-1 text-sm border border-distillery-200 rounded-vintage font-body"
              >
                <option value="all">Alle Status</option>
                <option value="open">Offen</option>
                <option value="in-progress">In Arbeit</option>
                <option value="completed">Erledigt</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(e.target.value as TaskPriority | "all")
                }
                className="px-2 py-1 text-sm border border-distillery-200 rounded-vintage font-body"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>

              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-2 py-1 text-sm border border-distillery-200 rounded-vintage font-body"
              >
                <option value="all">Alle Projekte</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 text-sm border border-distillery-200 rounded-vintage font-body"
              >
                <option value="created">Neueste zuerst</option>
                <option value="due_date">Fälligkeitsdatum</option>
                <option value="priority">Priorität</option>
                <option value="title">Titel A-Z</option>
              </select>
            </div>

            {/* Add Task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Neue Aufgabe hinzufügen..."
                className="flex-1 px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors font-body"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {todoList.length > 0 ? (
                todoList.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 hover:bg-gurktaler-50 rounded-vintage transition-colors"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="flex-shrink-0 text-gurktaler-600 hover:text-gurktaler-700"
                    >
                      {task.status === "completed" ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-body text-sm ${
                          task.status === "completed"
                            ? "line-through text-distillery-500"
                            : "text-distillery-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {task.assignee && (
                          <span className="text-xs text-distillery-500 font-body">
                            👤 {task.assignee}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-distillery-500 font-body flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString(
                              "de-DE",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                        {task.project_id &&
                          (() => {
                            const project = availableProjects.find(
                              (p) => p.id === task.project_id
                            );
                            if (!project) return null;

                            const workspace = project.workspace_id
                              ? workspaces.find(
                                  (w) => w.id === project.workspace_id
                                )
                              : null;

                            return (
                              <>
                                <span className="text-xs bg-gurktaler-100 text-gurktaler-700 px-2 py-0.5 rounded-vintage font-body">
                                  📁 {project.name}
                                </span>
                                {workspace && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-vintage font-body font-medium"
                                    style={{
                                      backgroundColor: `${workspace.color}20`,
                                      color: workspace.color,
                                      borderWidth: "1px",
                                      borderStyle: "solid",
                                      borderColor: workspace.color,
                                    }}
                                    title={`Projekt-Ebene: ${workspace.name}`}
                                  >
                                    {workspace.icon} {workspace.name}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                      </div>
                    </div>
                    <div
                      className={`flex-shrink-0 ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {getPriorityIcon(task.priority)}
                    </div>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        `Aufgabe: ${task.title}`
                      )}&body=${encodeURIComponent(
                        `Aufgabe: ${task.title}\n` +
                          (task.description
                            ? `\nBeschreibung: ${task.description}\n`
                            : "") +
                          (task.assignee
                            ? `Zuständig: ${task.assignee}\n`
                            : "") +
                          (task.due_date
                            ? `Fällig am: ${new Date(
                                task.due_date
                              ).toLocaleDateString("de-DE")}\n`
                            : "") +
                          `Priorität: ${
                            task.priority === "high"
                              ? "Hoch"
                              : task.priority === "medium"
                              ? "Mittel"
                              : "Niedrig"
                          }\n` +
                          `Status: ${
                            task.status === "open"
                              ? "Offen"
                              : task.status === "in-progress"
                              ? "In Arbeit"
                              : "Erledigt"
                          }`
                      )}`}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                      title="Per E-Mail teilen"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleExportICalSingle(task)}
                      className="flex-shrink-0 text-purple-600 hover:text-purple-700"
                      title="Als iCal exportieren"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    {googleCalendarReady &&
                      googleCalendarLoggedIn &&
                      task.due_date && (
                        <button
                          onClick={() => handleAddSingleToGoogleCalendar(task)}
                          className="flex-shrink-0 text-green-600 hover:text-green-700"
                          title="Zu Google Calendar hinzufügen"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      )}
                    <button
                      onClick={() => handleEditTask(task)}
                      className="flex-shrink-0 text-gurktaler-600 hover:text-gurktaler-700"
                      title="Bearbeiten"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex-shrink-0 text-red-500 hover:text-red-700"
                      title="Löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-distillery-500 py-4 font-body text-sm">
                  Keine offenen Aufgaben
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Schnellzugriff & Favoriten */}
        <div className="space-y-6">
          <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-4">
            <h2 className="font-heading font-semibold text-distillery-900 mb-4">
              Schnellzugriff
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction("/notes")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
              >
                <Plus className="w-5 h-5" />
                Neue Notiz
              </button>
              <button
                onClick={() => handleQuickAction("/projects")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gurktaler-50 text-gurktaler-700 rounded-vintage hover:bg-gurktaler-100 transition-colors border-vintage border-distillery-200 font-body"
              >
                <Plus className="w-5 h-5" />
                Neues Projekt
              </button>
              <button
                onClick={() => handleQuickAction("/products")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gurktaler-50 text-gurktaler-700 rounded-vintage hover:bg-gurktaler-100 transition-colors border-vintage border-distillery-200 font-body"
              >
                <Plus className="w-5 h-5" />
                Neues Produkt
              </button>
            </div>
          </div>

          {/* Favorites Widget */}
          {favoriteItems.length > 0 && (
            <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-bronze-500 fill-bronze-500" />
                <h2 className="font-heading font-semibold text-distillery-900">
                  Favoriten
                </h2>
              </div>
              <div className="space-y-1">
                {favoriteItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(item.route)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gurktaler-50 rounded-vintage transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gurktaler-600 flex-shrink-0" />
                      <span className="text-sm text-distillery-700 truncate font-body">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kategorien-Cards - 2 pro Reihe */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-bold text-distillery-900 mb-4">
          Kategorien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projekte */}
          <button
            onClick={() => navigate("/projects")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-vintage flex items-center justify-center shadow-md">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Projekte
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  {stats.find((s) => s.label === "Aktive Projekte")?.value || 0}{" "}
                  Aktiv
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Verwalte deine Projekte mit Gantt-Charts und Dokumentation
            </p>
          </button>

          {/* Produkte */}
          <button
            onClick={() => navigate("/products")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gurktaler-500 rounded-vintage flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Produkte
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  {stats.find((s) => s.label === "Produkte")?.value || 0}{" "}
                  Produkte
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Produktkatalog mit Versionen und Preiskalkulationen
            </p>
          </button>

          {/* Rezepturen */}
          <button
            onClick={() => navigate("/recipes")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-amber-500 rounded-vintage flex items-center justify-center shadow-md">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Rezepturen
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  {stats.find((s) => s.label === "Rezepturen")?.value || 0}{" "}
                  Rezepte
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Mazerate, Destillate und Ausmischungen verwalten
            </p>
          </button>

          {/* Notizen */}
          <button
            onClick={() => navigate("/notes")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-vintage flex items-center justify-center shadow-md">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Notizen
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  {stats.find((s) => s.label === "Notizen")?.value || 0} Notizen
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Ideen, Aufgaben und Recherchen dokumentieren
            </p>
          </button>

          {/* Kontakte */}
          <button
            onClick={() => navigate("/contacts")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-slate-500 rounded-vintage flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Kontakte
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  Adressbuch
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Kunden, Lieferanten und Partner verwalten
            </p>
          </button>

          {/* Recherche/Weblinks */}
          <button
            onClick={() => navigate("/research")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-teal-500 rounded-vintage flex items-center justify-center shadow-md">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Recherche
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  Weblinks
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Wichtige Links, Konkurrenz und Lieferanten
            </p>
          </button>

          {/* Zutaten */}
          <button
            onClick={() => navigate("/ingredients")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-vintage flex items-center justify-center shadow-md">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Zutaten
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  Inventar
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Kräuter, Früchte, Destillate und Spirituosen
            </p>
          </button>

          {/* Gebinde */}
          <button
            onClick={() => navigate("/containers")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-indigo-500 rounded-vintage flex items-center justify-center shadow-md">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Gebinde
                </h3>
                <p className="text-sm text-distillery-600 font-body">
                  Verpackungen
                </p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Flaschen, Etiketten, Verschlüsse und Verpackungen
            </p>
          </button>

          {/* Dokumente */}
          <button
            onClick={() => navigate("/documents")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-vintage flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Dokumente
                </h3>
                <p className="text-sm text-distillery-600 font-body">Dateien</p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              PDFs, Analysen, Marketing und Dokumentation
            </p>
          </button>

          {/* Galerie */}
          <button
            onClick={() => navigate("/gallery")}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-pink-500 rounded-vintage flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-distillery-900 group-hover:text-gurktaler-600 transition-colors">
                  Galerie
                </h3>
                <p className="text-sm text-distillery-600 font-body">Bilder</p>
              </div>
            </div>
            <p className="text-sm text-distillery-600 font-body">
              Zentrale Bildverwaltung mit Tagging
            </p>
          </button>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-vintage shadow-vintage-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b-vintage border-distillery-200 bg-gurktaler-50">
              <h2 className="font-heading font-semibold text-distillery-900">
                Aufgabe bearbeiten
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={editingTask?.title || ""}
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={editingTask?.description || ""}
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Priorität
                </label>
                <select
                  value={editingTask?.priority || "medium"}
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({
                      ...editingTask,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                >
                  <option value="low">Niedrig</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Zuständig
                </label>
                <input
                  type="text"
                  value={editingTask?.assignee || ""}
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({
                      ...editingTask,
                      assignee: e.target.value,
                    })
                  }
                  placeholder="Name der Person..."
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Fällig am
                </label>
                <input
                  type="date"
                  value={
                    editingTask?.due_date
                      ? editingTask.due_date.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({
                      ...editingTask,
                      due_date: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-body font-semibold text-distillery-700 mb-2">
                  Projekt
                </label>
                <select
                  value={editingTask?.project_id || ""}
                  onChange={(e) =>
                    editingTask &&
                    setEditingTask({
                      ...editingTask,
                      project_id: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
                >
                  <option value="">Kein Projekt</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-vintage border-distillery-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 border border-distillery-300 text-distillery-700 rounded-vintage hover:bg-distillery-50 transition-colors font-body"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors font-body"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
