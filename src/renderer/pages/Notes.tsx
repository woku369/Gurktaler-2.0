import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Lightbulb,
  FileText,
  CheckSquare,
  BookOpen,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
  Share2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Modal from "@/renderer/components/Modal";
import NoteForm from "@/renderer/components/NoteForm";
import { share } from "@/renderer/services/shareService";
import {
  notes as notesService,
  projects as projectsService,
  tags as tagsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import type { Note, Project, Tag } from "@/shared/types";

type NoteType = "idea" | "note" | "todo" | "research";

const typeIcons: Record<NoteType, any> = {
  idea: Lightbulb,
  note: FileText,
  todo: CheckSquare,
  research: BookOpen,
};

const typeColors = {
  idea: "bg-bronze-50 text-bronze-800 border-bronze-200",
  note: "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200",
  todo: "bg-green-50 text-green-800 border-green-200",
  research: "bg-distillery-50 text-distillery-800 border-distillery-200",
};

const typeLabels = {
  idea: "Idee",
  note: "Notiz",
  todo: "Aufgabe",
  research: "Recherche",
};

// Calculate text color (black/white) based on background luminance
function getTextColor(bgColor: string): string {
  // Convert hex to RGB
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [quickNote, setQuickNote] = useState("");
  const [selectedType, setSelectedType] = useState<NoteType>("note");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "chaos" | "project">(
    "all"
  );
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setNotes(await notesService.getAll());
    setProjects(await projectsService.getAll());
    setTags(await tagsService.getAll());
  };

  const handleQuickSave = async () => {
    if (!quickNote.trim()) return;

    await notesService.create({
      title: quickNote.substring(0, 50) + (quickNote.length > 50 ? "..." : ""),
      content: quickNote,
      type: selectedType,
      project_id: undefined,
    });

    setQuickNote("");
    await loadData();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleUpdate = async (
    data: Omit<Note, "id" | "created_at" | "updated_at">
  ) => {
    if (editingNote) {
      await notesService.update(editingNote.id, data);
    } else {
      await notesService.create(data);
    }
    await loadData();
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Notiz wirklich löschen?")) {
      await notesService.delete(id);
      await loadData();
    }
  }; // Filter notes
  const filteredNotes = notes
    .filter((note) => {
      // Search filter
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;

      // Tab filter
      let matchesTab = true;
      if (filterTab === "chaos") {
        matchesTab = !note.project_id;
      } else if (filterTab === "project") {
        matchesTab = !!note.project_id;
      }

      // Tag filter
      let matchesTag = true;
      if (selectedTagId) {
        // TODO: Tag filtering temporarily disabled (needs async refactor)
        matchesTag = true;
      }

      return matchesSearch && matchesTab && matchesTag;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Notizen & Chaosablage
          </h1>
          <p className="text-distillery-600 font-body">
            Ideen, Gedanken und schnelle Notizen
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold">
          <Plus className="w-5 h-5" />
          Neue Notiz
        </button>
      </div>

      {/* Quick Entry */}
      <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-4 mb-6">
        <textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleQuickSave();
            }
          }}
          placeholder="Schnelle Notiz eingeben... (Gedankenfetzen, Ideen, alles was gerade wichtig ist) - Strg+Enter zum Speichern"
          className="w-full p-3 border-vintage border-distillery-200 rounded-vintage resize-none focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {Object.entries(typeLabels).map(([key, label]) => {
              const Icon = typeIcons[key as NoteType];
              const isSelected = selectedType === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key as NoteType)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all border-vintage font-body font-semibold ${
                    isSelected
                      ? typeColors[key as NoteType]
                      : "bg-gurktaler-50 text-distillery-700 border-distillery-200 hover:bg-gurktaler-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleQuickSave}
            disabled={!quickNote.trim()}
            className="px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
            filterTab === "all"
              ? "bg-gurktaler-500 text-white shadow-md"
              : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
          }`}
        >
          Alle ({notes.length})
        </button>
        <button
          onClick={() => setFilterTab("chaos")}
          className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
            filterTab === "chaos"
              ? "bg-gurktaler-500 text-white shadow-md"
              : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
          }`}
        >
          Chaosablage ({notes.filter((n) => !n.project_id).length})
        </button>
        <button
          onClick={() => setFilterTab("project")}
          className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
            filterTab === "project"
              ? "bg-gurktaler-500 text-white shadow-md"
              : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
          }`}
        >
          Mit Projekt ({notes.filter((n) => n.project_id).length})
        </button>
      </div>

      {/* Search and Tag Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Notizen durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          />
        </div>
        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
        >
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-distillery-300 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-2">
            {notes.length === 0 ? "Noch keine Notizen" : "Keine Ergebnisse"}
          </h3>
          <p className="text-distillery-600 font-body">
            {notes.length === 0
              ? "Nutze das Quick-Entry-Feld oben für spontane Gedanken."
              : "Keine Notizen gefunden für deine Filter."}
          </p>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const Icon = typeIcons[note.type as NoteType];
          const project = note.project_id
            ? projects.find((p) => p.id === note.project_id)
            : null;
          // TODO: Tag assignments temporarily disabled (needs async refactor)
          const noteTags: Tag[] = [];

          return (
            <div
              key={note.id}
              className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-4 hover:shadow-vintage-lg hover:border-gurktaler-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border-vintage font-body ${
                    typeColors[note.type as NoteType]
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {typeLabels[note.type as NoteType]}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">
                    {formatDate(note.created_at)}
                  </span>
                  <button
                    onClick={async () => {
                      const existing = await favoritesService.getByEntity(
                        "note",
                        note.id
                      );
                      if (existing) {
                        await favoritesService.delete(existing.id);
                      } else {
                        await favoritesService.create({
                          entity_type: "note",
                          entity_id: note.id,
                        });
                      }
                      await loadData();
                    }}
                    className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Favorit"
                  >
                    <Star className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={async () => await share(note, "note")}
                    className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Teilen"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-slate-800 mb-2">{note.title}</h3>

              {/* URL Link */}
              {note.url && (
                <a
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gurktaler-600 hover:text-gurktaler-700 mb-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  {note.url}
                </a>
              )}

              {/* Image Preview entfernt - Images werden async geladen */}

              <div className="text-sm text-slate-600 line-clamp-3 prose prose-sm max-w-none">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>

              {noteTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {noteTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color),
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {project ? (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    📁 {project.name}
                  </span>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-amber-600">📁 Chaosablage</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingNote ? "Notiz bearbeiten" : "Neue Notiz"}
          size="lg"
        >
          <NoteForm
            note={editingNote || undefined}
            projects={projects}
            onSubmit={handleUpdate}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}

export default Notes;
