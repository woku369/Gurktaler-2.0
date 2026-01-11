import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import Modal from "@/renderer/components/Modal";
import ProjectForm from "@/renderer/components/ProjectForm";
import ProjectCard from "@/renderer/components/ProjectCard";
import QuickAddUrlDialog from "@/renderer/components/QuickAddUrlDialog";
import { WorkspaceTabs } from "@/renderer/components/WorkspaceTabs";
import {
  projects as projectsService,
  images as imagesService,
  tags as tagsService,
  favorites as favoritesService,
  workspaces as workspacesService,
  initializeDefaultWorkspaces,
} from "@/renderer/services/storage";
import type {
  Project,
  Image,
  Tag,
  Document,
  ProjectWorkspace,
} from "@/shared/types";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<Record<string, Image[]>>(
    {}
  );
  const [tags, setTags] = useState<Tag[]>([]);
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showQuickUrlDialog, setShowQuickUrlDialog] = useState(false);
  const [quickUrlProject, setQuickUrlProject] = useState<Project | null>(null);
  const [_copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    const init = async () => {
      await initializeDefaultWorkspaces();
      await loadWorkspaces();
      await loadProjects();
    };
    init();
  }, []);

  const loadWorkspaces = async () => {
    const ws = await workspacesService.getAll();
    setWorkspaces(ws);
  };

  const loadProjects = async () => {
    const allProjects = await projectsService.getAll();
    setProjects(allProjects);
    setTags(await tagsService.getAll());

    // Load images for all projects
    const imageMap: Record<string, Image[]> = {};
    for (const project of allProjects) {
      imageMap[project.id] = await imagesService.getByEntity(
        "project",
        project.id
      );
    }
    setProjectImages(imageMap);
  };

  const handleCreate = async (
    data: Omit<Project, "id" | "created_at" | "updated_at">
  ) => {
    await projectsService.create(data);
    await loadProjects();
    setIsModalOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleUpdate = async (
    data: Omit<Project, "id" | "created_at" | "updated_at">
  ) => {
    if (editingProject) {
      await projectsService.update(editingProject.id, data);
      await loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Projekt wirklich löschen?")) {
      await projectsService.delete(id);
      await loadProjects();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleQuickAddUrl = (project: Project) => {
    setQuickUrlProject(project);
    setShowQuickUrlDialog(true);
  };

  const handleAddQuickUrl = async (url: string, name: string) => {
    if (!quickUrlProject) return;

    const newDoc: Document = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      type: "url",
      path: url,
      name: name || url,
    };

    const currentDocs = quickUrlProject.documents || [];
    await projectsService.update(quickUrlProject.id, {
      documents: [...currentDocs, newDoc],
    });

    setShowQuickUrlDialog(false);
    setQuickUrlProject(null);
    await loadProjects();
  };

  const handleQuickAddDocument = (project: Project) => {
    handleEdit(project);
  };

  const handleQuickAddImage = (project: Project) => {
    handleEdit(project);
  };

  const handleCopyName = (projectId: string) => {
    setCopiedProjectId(projectId);
    setTimeout(() => setCopiedProjectId(null), 2000);
  };

  const filteredProjects = useMemo(() => {
    // Erst nach Workspace filtern
    let filtered = projects;
    if (activeWorkspace !== "all") {
      filtered = projects.filter(
        (project) => project.workspace_id === activeWorkspace
      );
    }

    // Dann nach Suchbegriff filtern
    filtered = filtered.filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesTag = true;
      if (selectedTagId) {
        // TODO: Tag filtering temporarily disabled (needs async refactor)
        matchesTag = true;
      }

      return matchesSearch && matchesTag;
    });

    return filtered;
  }, [projects, activeWorkspace, searchQuery, selectedTagId]);

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

      {/* Workspace Tabs */}
      <WorkspaceTabs
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        showAllTab={true}
      />

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

      {/* Project Grid */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              image={projectImages[project.id]?.[0]}
              workspaces={workspaces}
              isFavorite={false}
              onToggleFavorite={async () => {
                const existing = await favoritesService.getByEntity(
                  "project",
                  project.id
                );
                if (existing) {
                  await favoritesService.delete(existing.id);
                } else {
                  await favoritesService.create({
                    entity_type: "project",
                    entity_id: project.id,
                  });
                }
                await loadProjects();
              }}
              onEdit={() => handleEdit(project)}
              onDelete={() => handleDelete(project.id)}
              onAddUrl={() => handleQuickAddUrl(project)}
              onAddDocument={() => handleQuickAddDocument(project)}
              onAddImage={() => handleQuickAddImage(project)}
              onCopy={() => handleCopyName(project.id)}
              onUpdate={loadProjects}
            />
          ))}
        </div>
      )}

      {/* Quick Add URL Dialog */}
      <QuickAddUrlDialog
        isOpen={showQuickUrlDialog}
        onClose={() => {
          setShowQuickUrlDialog(false);
          setQuickUrlProject(null);
        }}
        onAdd={handleAddQuickUrl}
        entityName={quickUrlProject?.name || ""}
      />

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
