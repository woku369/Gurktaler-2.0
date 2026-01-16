import { useState, useEffect } from "react";
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
  Menu,
  X,
  Calendar,
  Wifi,
  WifiOff,
  Image,
  FileText,
} from "lucide-react";
import { SetupService } from "../services/setup";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projekte" },
  { to: "/project-timeline", icon: Calendar, label: "Zeitplanung" },
  { to: "/products", icon: Package, label: "Produkte" },
  { to: "/recipes", icon: FlaskConical, label: "Rezepturen" },
  { to: "/ingredients", icon: Beaker, label: "Zutaten" },
  { to: "/containers", icon: Box, label: "Gebinde" },
  { to: "/notes", icon: StickyNote, label: "Notizen" },
  { to: "/contacts", icon: Users, label: "Kontakte" },
  { to: "/research", icon: Globe, label: "Recherche" },
  { to: "/documents", icon: FileText, label: "Dokumente" },
  { to: "/gallery", icon: Image, label: "Bildergalerie" },
  { to: "/ai-assistant", icon: Bot, label: "KI-Assistent" },
  { to: "/tags", icon: Tag, label: "Tags" },
  { to: "/search", icon: Search, label: "Suche" },
  { to: "/documentation", icon: BookOpen, label: "Anleitungen" },
];

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const setupService = new SetupService();

  // Platform Detection: Prüfe ob wir in Electron (Desktop) oder Browser (Mobile/PWA) laufen
  const isElectron =
    typeof window !== "undefined" && (window as any).electron !== undefined;

  // Server-Status prüfen
  const checkServerStatus = async () => {
    // Nur im Browser-Modus prüfen (nicht in Electron)
    if (isElectron) {
      setServerStatus("offline");
      return;
    }

    setServerStatus("checking");
    try {
      const connected = await setupService.testConnection();
      setServerStatus(connected ? "online" : "offline");
      setLastCheck(new Date());
    } catch (error) {
      setServerStatus("offline");
      setLastCheck(new Date());
    }
  };

  // Initial check und regelmäßige Prüfung
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Alle 30 Sekunden
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      case "checking":
        return "text-yellow-500";
    }
  };

  const getStatusIcon = () => {
    return serverStatus === "offline" ? WifiOff : Wifi;
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case "online":
        return "NAS-Server online";
      case "offline":
        return "NAS-Server offline";
      case "checking":
        return "Prüfe Verbindung...";
    }
  };

  return (
    <div className="flex h-screen bg-gurktaler-100">
      {/* Mobile Header - nur im Browser auf kleinen Screens */}
      {!isElectron && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-vintage border-distillery-200 shadow-md z-40 flex items-center px-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-vintage hover:bg-gurktaler-50 transition-colors"
            aria-label="Menü öffnen"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-distillery-700" />
            ) : (
              <Menu className="w-6 h-6 text-distillery-700" />
            )}
          </button>
          <div className="flex items-center gap-2 ml-4">
            <Leaf className="w-6 h-6 text-gurktaler-600" />
            <h1 className="font-heading font-bold text-distillery-800 text-lg">
              Gurktaler 2.0
            </h1>
          </div>

          {/* Server-Status Indicator (Mobile) */}
          {!isElectron && (
            <button
              onClick={checkServerStatus}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-vintage hover:bg-gurktaler-50 transition-colors"
              title={`${getStatusText()}${
                lastCheck
                  ? "\nLetzte Prüfung: " + lastCheck.toLocaleTimeString()
                  : ""
              }`}
            >
              {(() => {
                const StatusIcon = getStatusIcon();
                return <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />;
              })()}
            </button>
          )}
        </div>
      )}

      {/* Overlay für Mobile Menu - nur im Browser */}
      {!isElectron && isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Distillery Modern */}
      <aside
        className={`
        ${
          isElectron
            ? "w-64 static"
            : "fixed md:static inset-y-0 left-0 z-50 w-64"
        }
        bg-white border-r-vintage border-distillery-200 flex flex-col shadow-vintage
        ${
          !isElectron &&
          "transform transition-transform duration-300 ease-in-out"
        }
        ${
          !isElectron &&
          (isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0")
        }
      `}
      >
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
                  onClick={() => !isElectron && setIsMobileMenuOpen(false)}
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
          {/* Server-Status Indicator (Desktop/Sidebar) */}
          {!isElectron && (
            <button
              onClick={checkServerStatus}
              className="w-full mb-3 flex items-center gap-3 px-3 py-2.5 rounded-vintage hover:bg-white transition-all text-left"
              title={`${getStatusText()}${
                lastCheck
                  ? "\nLetzte Prüfung: " + lastCheck.toLocaleTimeString()
                  : ""
              }`}
            >
              {(() => {
                const StatusIcon = getStatusIcon();
                return <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />;
              })()}
              <div className="flex-1">
                <span
                  className={`font-body text-sm font-medium ${getStatusColor()}`}
                >
                  {serverStatus === "online"
                    ? "NAS Online"
                    : serverStatus === "offline"
                    ? "NAS Offline"
                    : "Prüfe..."}
                </span>
                {lastCheck && (
                  <div className="text-xs text-distillery-500">
                    {lastCheck.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </button>
          )}

          <NavLink
            to="/settings"
            onClick={() => !isElectron && setIsMobileMenuOpen(false)}
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
      <main
        className={`flex-1 overflow-auto bg-gurktaler-100 ${
          !isElectron && "md:ml-0 pt-16 md:pt-0"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
