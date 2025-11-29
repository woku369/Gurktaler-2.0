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
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gurktaler-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Gurktaler</h1>
              <p className="text-xs text-slate-500">Version 2.0</p>
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
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gurktaler-50 text-gurktaler-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gurktaler-50 text-gurktaler-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Einstellungen
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
