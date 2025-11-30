import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Star } from "lucide-react";
import Modal from "@/renderer/components/Modal";
import ProjectForm from "@/renderer/components/ProjectForm";
import {
  projects as projectsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import type { Project, Tag } from "@/shared/types";

const statusColors = {
  active: "bg-green-50 text-green-800 border-green-200",
  paused: "bg-bronze-50 text-bronze-800 border-bronze-200",
  completed: "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200",
  archived: "bg-distillery-50 text-distillery-700 border-distillery-200",
};

const statusLabels = {
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
  archived: "Archiviert",
};

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(projectsService.getAll());
    setTags(tagsService.getAll());
  };

  const handleCreate = (
    data: Omit<Project, "id" | "created_at" | "updated_at">
  ) => {
    projectsService.create(data);
    loadProjects();
    setIsModalOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleUpdate = (
    data: Omit<Project, "id" | "created_at" | "updated_at">
  ) => {
    if (editingProject) {
      projectsService.update(editingProject.id, data);
      loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Projekt wirklich löschen?")) {
      projectsService.delete(id);
      loadProjects();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const projectAssignments = tagAssignmentsService.getByEntity(
        "project",
        project.id
      );
      matchesTag = projectAssignments.some((a) => a.tag_id === selectedTagId);
    }

    return matchesSearch && matchesTag;
  });

  const getProductCount = (_projectId: string) => {
    // TODO: Implement when products are ready
    return 0;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Projekte
          </h1>
          <p className="text-distillery-600 font-body">
            Verwalte deine Produktentwicklungs-Projekte
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neues Projekt
        </button>
      </div>

      {/* Search & Tag Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
          <input
            type="text"
            placeholder="Projekte durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent font-body bg-white"
          />
        </div>
        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          className="px-4 py-2.5 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body bg-white"
        >
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project List */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-vintage p-6 shadow-vintage border-vintage border-distillery-200 hover:shadow-vintage-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-heading font-semibold text-distillery-900">
                    {project.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border-vintage ${
                      statusColors[project.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </span>
                </div>
                <p className="text-distillery-600 mb-3 font-body">
                  {project.description}
                </p>
                {(() => {
                  const projectAssignments = tagAssignmentsService.getByEntity(
                    "project",
                    project.id
                  );
                  const projectTags = projectAssignments
                    .map((a) => tags.find((t) => t.id === a.tag_id))
                    .filter((t): t is Tag => t !== undefined);
                  return (
                    projectTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {projectTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )
                  );
                })()}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{getProductCount(project.id)} Produkte</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    favoritesService.toggle("project", project.id);
                    loadData();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title={
                    favoritesService.isFavorite("project", project.id)
                      ? "Aus Favoriten entfernen"
                      : "Zu Favoriten hinzufügen"
                  }
                >
                  <Star
                    className={`w-4 h-4 ${
                      favoritesService.isFavorite("project", project.id)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-slate-400"
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Bearbeiten"
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {projects.length === 0 ? "Keine Projekte" : "Keine Suchergebnisse"}
          </h3>
          <p className="text-slate-500 mb-4">
            {projects.length === 0
              ? "Erstelle dein erstes Projekt, um loszulegen."
              : "Versuche es mit anderen Suchbegriffen."}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
            >
              Projekt erstellen
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProject ? "Projekt bearbeiten" : "Neues Projekt"}
      >
        <ProjectForm
          project={editingProject || undefined}
          onSubmit={editingProject ? handleUpdate : handleCreate}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}

export default Projects;
