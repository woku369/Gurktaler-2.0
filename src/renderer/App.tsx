import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Products from "./pages/Products";
import Recipes from "./pages/Recipes";
import Ingredients from "./pages/Ingredients";
import Containers from "./pages/Containers";
import Notes from "./pages/Notes";
import Contacts from "./pages/Contacts";
import Research from "./pages/Research";
import Tags from "./pages/Tags";
import GlobalSearch from "./pages/GlobalSearch";
import AIAssistant from "./pages/AIAssistant";
import Documentation from "./pages/Documentation";
import Settings from "./pages/Settings";
import DesignPreview from "./pages/DesignPreview";
import { getGitConfig, isGitRepository, pullChanges } from "./services/git";
import { AlertCircle, Download, RefreshCw } from "lucide-react";

function App() {
  const [syncStatus, setSyncStatus] = useState<{
    show: boolean;
    type: "loading" | "error" | "success";
    message: string;
  }>({ show: false, type: "loading", message: "" });

  useEffect(() => {
    const performAutoPull = async () => {
      const config = getGitConfig();
      
      // Nur wenn Auto-Pull aktiviert ist
      if (!config.autoPush) {
        return;
      }

      // Prüfen ob Git-Repo existiert
      const isRepo = await isGitRepository();
      if (!isRepo) {
        return;
      }

      setSyncStatus({
        show: true,
        type: "loading",
        message: "Synchronisiere mit Remote-Repository...",
      });

      const success = await pullChanges();

      if (success) {
        setSyncStatus({
          show: true,
          type: "success",
          message: "Daten erfolgreich synchronisiert!",
        });
        setTimeout(() => {
          setSyncStatus({ show: false, type: "loading", message: "" });
        }, 2000);
      } else {
        // Bei Fehler (z.B. Konflikt) Warnung anzeigen
        setSyncStatus({
          show: true,
          type: "error",
          message:
            "Sync-Konflikt! Bitte öffne Einstellungen → Git-Integration um das Problem zu lösen.",
        });
        // Warnung bleibt sichtbar bis User sie schließt
      }
    };

    performAutoPull();
  }, []);

  return (
    <>
      {syncStatus.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 min-w-[300px] ${
            syncStatus.type === "loading"
              ? "bg-blue-50 border-blue-200"
              : syncStatus.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {syncStatus.type === "loading" && (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
            )}
            {syncStatus.type === "success" && (
              <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            {syncStatus.type === "error" && (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  syncStatus.type === "loading"
                    ? "text-blue-800"
                    : syncStatus.type === "success"
                    ? "text-green-800"
                    : "text-amber-800"
                }`}
              >
                {syncStatus.message}
              </p>
            </div>
            {syncStatus.type === "error" && (
              <button
                onClick={() =>
                  setSyncStatus({ show: false, type: "loading", message: "" })
                }
                className="text-amber-600 hover:text-amber-800 flex-shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="products" element={<Products />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="containers" element={<Containers />} />
          <Route path="notes" element={<Notes />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="research" element={<Research />} />
          <Route path="tags" element={<Tags />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="design-preview" element={<DesignPreview />} />
        </Route>
      </Routes>
    </>
  );
}
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="products" element={<Products />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="containers" element={<Containers />} />
        <Route path="notes" element={<Notes />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="research" element={<Research />} />
        <Route path="tags" element={<Tags />} />
        <Route path="search" element={<GlobalSearch />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="settings" element={<Settings />} />
        <Route path="design-preview" element={<DesignPreview />} />
      </Route>
    </Routes>
  );
}

export default App;
