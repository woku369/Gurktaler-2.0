import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  FlaskConical,
  Beaker,
  Box,
  StickyNote,
  Users,
  Globe,
  Tag,
  Search,
  Bot,
  BookOpen,
  Settings,
  Leaf,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projekte" },
  { to: "/products", icon: Package, label: "Produkte" },
  { to: "/recipes", icon: FlaskConical, label: "Rezepturen" },
  { to: "/ingredients", icon: Beaker, label: "Zutaten" },
  { to: "/containers", icon: Box, label: "Gebinde" },
  { to: "/notes", icon: StickyNote, label: "Notizen" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
  { to: "/research", icon: Globe, label: "Recherche" },
  { to: "/ai-assistant", icon: Bot, label: "KI-Assistent" },
  { to: "/tags", icon: Tag, label: "Tags" },
  { to: "/search", icon: Search, label: "Suche" },
  { to: "/documentation", icon: BookOpen, label: "Anleitungen" },
];

function Layout() {
  return (
    <div className="flex h-screen bg-gurktaler-100">
      {/* Sidebar - Distillery Modern */}
      <aside className="w-64 bg-white border-r-vintage border-distillery-200 flex flex-col shadow-vintage">
        {/* Logo */}
        <div className="p-4 border-b-vintage border-distillery-200 bg-gradient-to-br from-gurktaler-500 to-gurktaler-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-vintage flex items-center justify-center border-2 border-white/30">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-lg">
                Gurktaler
              </h1>
              <p className="text-xs text-white/80 font-semibold tracking-wide">
                2.0
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-vintage transition-all ${
                      isActive
                        ? "bg-gurktaler-500 text-white font-semibold shadow-md"
                        : "text-distillery-700 hover:bg-gurktaler-50 hover:text-gurktaler-600"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-body">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-vintage border-distillery-200 bg-gurktaler-50">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-vintage transition-all ${
                isActive
                  ? "bg-gurktaler-500 text-white font-semibold shadow-md"
                  : "text-distillery-700 hover:bg-white hover:text-gurktaler-600"
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-body">Einstellungen</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gurktaler-100">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
