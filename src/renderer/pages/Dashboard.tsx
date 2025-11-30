import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  projects,
  products,
  recipes,
  notes,
  favorites,
  contacts,
  weblinks,
  ingredients,
  containers,
} from "@/renderer/services/storage";
import type { Favorite } from "@/shared/types";

type RecentItem = {
  type: "project" | "product" | "recipe" | "note";
  title: string;
  date: string;
  id: string;
};

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
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<
    Array<{ favorite: Favorite; name: string; icon: any; route: string }>
  >([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const allProjects = projects.getAll();
    const allProducts = products.getAll();
    const allRecipes = recipes.getAll();
    const allNotes = notes.getAll();

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

    // Collect recent items
    const items: RecentItem[] = [
      ...allProjects.map((p) => ({
        type: "project" as const,
        title: p.name,
        date: new Date(p.created_at).toLocaleDateString("de-DE"),
        id: p.id,
      })),
      ...allProducts.map((p) => ({
        type: "product" as const,
        title: p.name,
        date: new Date(p.created_at).toLocaleDateString("de-DE"),
        id: p.id,
      })),
      ...allRecipes.map((r) => ({
        type: "recipe" as const,
        title: r.name,
        date: new Date(r.created_at).toLocaleDateString("de-DE"),
        id: r.id,
      })),
      ...allNotes.map((n) => ({
        type: "note" as const,
        title: n.title,
        date: new Date(n.created_at).toLocaleDateString("de-DE"),
        id: n.id,
      })),
    ];

    // Sort by date and take latest 10
    const sortedItems = items
      .sort((a, b) => {
        const dateA = new Date(a.date.split(".").reverse().join("-")).getTime();
        const dateB = new Date(b.date.split(".").reverse().join("-")).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    setRecentItems(sortedItems);

    // Load favorites
    const allFavorites = favorites.getAll();
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
          const cont = contacts.getAll().find((c) => c.id === fav.entity_id);
          name = cont?.name || "Unbekannter Kontakt";
          icon = Users;
          route = "/contacts";
          break;
        case "weblink":
          const web = weblinks.getAll().find((w) => w.id === fav.entity_id);
          name = web?.title || "Unbekannter Link";
          icon = ExternalLink;
          route = "/research";
          break;
        case "ingredient":
          const ing = ingredients.getAll().find((i) => i.id === fav.entity_id);
          name = ing?.name || "Unbekannte Zutat";
          icon = Beaker;
          route = "/ingredients";
          break;
        case "container":
          const con = containers.getAll().find((c) => c.id === fav.entity_id);
          name = con?.name || "Unbekanntes Gebinde";
          icon = Archive;
          route = "/containers";
          break;
      }

      return { favorite: fav, name, icon, route };
    });

    setFavoriteItems(favItems);
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200">
            <div className="p-4 border-b-vintage border-distillery-200 bg-gurktaler-50">
              <h2 className="font-heading font-semibold text-distillery-900">
                Letzte Aktivitäten
              </h2>
            </div>
            <div className="divide-y divide-distillery-100">
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gurktaler-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body font-semibold text-distillery-800">
                          {item.title}
                        </p>
                        <p className="text-sm text-distillery-600 capitalize font-body">
                          {item.type}
                        </p>
                      </div>
                      <span className="text-sm text-distillery-500 font-body">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-distillery-600">
                  <p className="font-body">Noch keine Aktivitäten</p>
                  <p className="text-sm text-distillery-500 mt-1 font-body">
                    Erstelle dein erstes Projekt, um loszulegen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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

      {/* Info Box */}
      <div className="bg-gradient-to-br from-distillery-600 to-distillery-700 border-vintage border-distillery-800 rounded-vintage p-6 shadow-vintage-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <h3 className="font-heading font-bold text-white mb-2 text-lg">
            🌿 Seit 1865 — Entwicklungsmodus
          </h3>
          <p className="text-white/90 text-sm font-body leading-relaxed">
            Dies ist eine Entwicklungsversion. Daten werden lokal im Browser
            (LocalStorage) gespeichert. Für Synchronisation zwischen Geräten
            nutze den JSON-Export und Git.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
