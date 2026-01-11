import { useState, useEffect } from "react";
import {
  Search,
  FolderKanban,
  Package,
  StickyNote,
  Users,
  Globe,
  ExternalLink,
  FlaskConical,
  Beaker,
  Archive,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  projects as projectsService,
  products as productsService,
  notes as notesService,
  contacts as contactsService,
  weblinks as weblinksService,
  recipes as recipesService,
  ingredients as ingredientsService,
  containers as containersService,
  workspaces as workspacesService,
} from "@/renderer/services/storage";
import type {
  Project,
  Product,
  Note,
  Contact,
  Weblink,
  Recipe,
  Ingredient,
  Container,
  ProjectWorkspace,
} from "@/shared/types";

type SearchResult = {
  type:
    | "project"
    | "product"
    | "note"
    | "contact"
    | "weblink"
    | "recipe"
    | "ingredient"
    | "container";
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string;
  workspace_id?: string; // Für Projekte
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [filterWorkspace, setFilterWorkspace] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkspaces = async () => {
      const ws = await workspacesService.getAll();
      setWorkspaces(ws);
    };
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      performSearch(query);
      setIsSearching(false);
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [query, filterWorkspace]); // filterWorkspace als Dependency

  const performSearch = async (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search Projects
    const projects = await projectsService.getAll();
    projects.forEach((project: Project) => {
      if (
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "project",
          id: project.id,
          title: project.name,
          description: project.description,
          metadata: `Status: ${project.status}`,
          workspace_id: project.workspace_id,
        });
      }
    });

    // Search Products
    const products = await productsService.getAll();
    products.forEach((product: Product) => {
      if (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.version.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "product",
          id: product.id,
          title: product.name,
          subtitle: `Version ${product.version}`,
          description: product.description,
          metadata: `Status: ${product.status}`,
        });
      }
    });

    // Search Notes
    const notes = await notesService.getAll();
    notes.forEach((note: Note) => {
      if (
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "note",
          id: note.id,
          title: note.title,
          description: note.content?.substring(0, 100),
          metadata: `Typ: ${note.type}`,
        });
      }
    });

    // Search Contacts
    const contacts = await contactsService.getAll();
    contacts.forEach((contact: Contact) => {
      if (
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.company?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.notes?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "contact",
          id: contact.id,
          title: contact.name,
          subtitle: contact.company,
          description: contact.email,
          metadata: `Typ: ${contact.type}`,
        });
      }
    });

    // Search Weblinks
    const weblinks = await weblinksService.getAll();
    weblinks.forEach((weblink: Weblink) => {
      if (
        weblink.title.toLowerCase().includes(lowerQuery) ||
        weblink.url.toLowerCase().includes(lowerQuery) ||
        weblink.description?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "weblink",
          id: weblink.id,
          title: weblink.title,
          subtitle: weblink.url,
          description: weblink.description,
          metadata: `Typ: ${weblink.type}`,
        });
      }
    });

    // Search Recipes
    const recipes = await recipesService.getAll();
    recipes.forEach((recipe: Recipe) => {
      if (
        recipe.name.toLowerCase().includes(lowerQuery) ||
        recipe.instructions?.toLowerCase().includes(lowerQuery) ||
        recipe.notes?.toLowerCase().includes(lowerQuery)
      ) {
        const typeLabels = {
          macerate: "Mazerat",
          distillate: "Destillat",
          blend: "Ausmischung",
        };
        allResults.push({
          type: "recipe",
          id: recipe.id,
          title: recipe.name,
          subtitle: typeLabels[recipe.type],
          description: recipe.instructions,
          metadata: recipe.yield_amount
            ? `Ausbeute: ${recipe.yield_amount} ${recipe.yield_unit || "ml"}`
            : undefined,
        });
      }
    });

    // Search Ingredients
    const ingredients = await ingredientsService.getAll();
    ingredients.forEach((ingredient: Ingredient) => {
      if (
        ingredient.name.toLowerCase().includes(lowerQuery) ||
        ingredient.category?.toLowerCase().includes(lowerQuery) ||
        ingredient.notes?.toLowerCase().includes(lowerQuery)
      ) {
        allResults.push({
          type: "ingredient",
          id: ingredient.id,
          title: ingredient.name,
          subtitle: ingredient.category,
          description: ingredient.notes,
          metadata: ingredient.alcohol_percentage
            ? `${ingredient.alcohol_percentage}% vol.`
            : undefined,
        });
      }
    });

    // Search Containers
    const containers = await containersService.getAll();
    containers.forEach((container: Container) => {
      if (
        container.name.toLowerCase().includes(lowerQuery) ||
        container.notes?.toLowerCase().includes(lowerQuery)
      ) {
        const typeLabels = {
          bottle: "Flasche",
          label: "Etikett",
          cap: "Verschluss",
          box: "Verpackung",
          other: "Sonstiges",
        };
        allResults.push({
          type: "container",
          id: container.id,
          title: container.name,
          subtitle: typeLabels[container.type],
          description: container.notes,
          metadata: container.volume ? `${container.volume} ml` : undefined,
        });
      }
    });

    // Filter by favorites if enabled (temporarily disabled - needs async refactor)
    let filteredResults = allResults;

    // Filter by workspace (nur für Projekte)
    if (filterWorkspace !== "all") {
      filteredResults = filteredResults.filter((result) => {
        if (result.type === "project") {
          return result.workspace_id === filterWorkspace;
        }
        return true; // Alle anderen Typen durchlassen
      });
    }

    setResults(filteredResults);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "project":
        return FolderKanban;
      case "product":
        return Package;
      case "note":
        return StickyNote;
      case "contact":
        return Users;
      case "weblink":
        return Globe;
      case "recipe":
        return FlaskConical;
      case "ingredient":
        return Beaker;
      case "container":
        return Archive;
      default:
        return Search;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Projekt";
      case "product":
        return "Produkt";
      case "note":
        return "Notiz";
      case "contact":
        return "Kontakt";
      case "weblink":
        return "Weblink";
      case "recipe":
        return "Rezeptur";
      case "ingredient":
        return "Zutat";
      case "container":
        return "Gebinde";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-distillery-50 text-distillery-800 border-distillery-200";
      case "product":
        return "bg-green-50 text-green-800 border-green-200";
      case "note":
        return "bg-bronze-50 text-bronze-800 border-bronze-200";
      case "contact":
        return "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200";
      case "weblink":
        return "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200";
      case "recipe":
        return "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200";
      case "ingredient":
        return "bg-green-50 text-green-800 border-green-200";
      case "container":
        return "bg-bronze-50 text-bronze-800 border-bronze-200";
      default:
        return "bg-distillery-50 text-distillery-700 border-distillery-200";
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "project":
        navigate("/projects");
        break;
      case "product":
        navigate("/products");
        break;
      case "note":
        navigate("/notes");
        break;
      case "contact":
        navigate("/contacts");
        break;
      case "weblink":
        if (result.subtitle) {
          window.open(result.subtitle, "_blank");
        }
        break;
      case "recipe":
        navigate("/recipes");
        break;
      case "ingredient":
        navigate("/ingredients");
        break;
      case "container":
        navigate("/containers");
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-distillery-900 mb-2">
            Globale Suche
          </h1>
          <p className="text-distillery-600 font-body">
            Durchsuche alle Bereiche: Projekte, Produkte, Notizen, Kontakte,
            Weblinks, Rezepturen, Zutaten und Gebinde
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-distillery-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wonach suchst du?"
              className="w-full pl-14 pr-4 py-4 text-lg border-vintage border-distillery-200 rounded-vintage focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent font-body"
              autoFocus
            />
          </div>

          {/* Favorites Filter */}
          <label className="flex items-center gap-2 cursor-pointer w-fit font-body">
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={(e) => {
                setShowOnlyFavorites(e.target.checked);
                if (query.trim()) {
                  performSearch(query);
                }
              }}
              className="w-4 h-4 text-bronze-500 border-distillery-300 rounded focus:ring-bronze-500"
            />
            <Star
              className={`w-4 h-4 ${
                showOnlyFavorites
                  ? "text-bronze-500 fill-bronze-500"
                  : "text-distillery-400"
              }`}
            />
            <span className="text-sm text-gray-700">
              Nur Favoriten anzeigen
            </span>
          </label>

          {/* Workspace Filter */}
          {workspaces.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <label className="text-sm text-distillery-700 font-body">
                Projekt-Ebene:
              </label>
              <select
                value={filterWorkspace}
                onChange={(e) => setFilterWorkspace(e.target.value)}
                className="px-3 py-1.5 text-sm border border-distillery-200 rounded-lg focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
              >
                <option value="all">Alle Ebenen</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.icon} {ws.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-12 text-gray-500">
                Suche läuft...
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Keine Ergebnisse gefunden für "{query}"
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {results.length} Ergebnis{results.length !== 1 ? "se" : ""}{" "}
                  gefunden
                </div>
                {results.map((result, index) => {
                  const Icon = getIcon(result.type);
                  return (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleResultClick(result)}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gurktaler-primary transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg ${getTypeColor(
                            result.type
                          )}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {result.title}
                            </h3>
                            {result.subtitle && (
                              <span className="text-sm text-gray-500 truncate">
                                {result.subtitle}
                              </span>
                            )}
                            {result.type === "weblink" && (
                              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {result.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full ${getTypeColor(
                                result.type
                              )}`}
                            >
                              {getTypeLabel(result.type)}
                            </span>
                            {result.metadata && <span>{result.metadata}</span>}
                            {result.type === "project" &&
                              result.workspace_id &&
                              (() => {
                                const workspace = workspaces.find(
                                  (w) => w.id === result.workspace_id
                                );
                                if (workspace) {
                                  return (
                                    <span
                                      className="px-2 py-0.5 rounded-vintage font-medium"
                                      style={{
                                        backgroundColor: `${workspace.color}20`,
                                        color: workspace.color,
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        borderColor: workspace.color,
                                      }}
                                    >
                                      {workspace.icon} {workspace.name}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-12">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Gib einen Suchbegriff ein
            </h3>
            <p className="text-gray-500">
              Die Suche durchsucht automatisch alle Bereiche deiner Daten
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                {
                  icon: FolderKanban,
                  label: "Projekte",
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  icon: Package,
                  label: "Produkte",
                  color: "bg-green-50 text-green-600",
                },
                {
                  icon: StickyNote,
                  label: "Notizen",
                  color: "bg-yellow-50 text-yellow-600",
                },
                {
                  icon: Users,
                  label: "Kontakte",
                  color: "bg-purple-50 text-purple-600",
                },
                {
                  icon: Globe,
                  label: "Weblinks",
                  color: "bg-pink-50 text-pink-600",
                },
                {
                  icon: FlaskConical,
                  label: "Rezepturen",
                  color: "bg-gurktaler-50 text-gurktaler-600",
                },
                {
                  icon: Beaker,
                  label: "Zutaten",
                  color: "bg-teal-50 text-teal-600",
                },
                {
                  icon: Archive,
                  label: "Gebinde",
                  color: "bg-orange-50 text-orange-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-lg ${item.color}`}
                >
                  <item.icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
