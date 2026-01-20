import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectTimeline from "./pages/ProjectTimeline";
import Products from "./pages/Products";
import Recipes from "./pages/Recipes";
import Ingredients from "./pages/Ingredients";
import Containers from "./pages/Containers";
import Notes from "./pages/Notes";
import Contacts from "./pages/Contacts";
import Research from "./pages/Research";
import Documents from "./pages/Documents";
import Gallery from "./pages/Gallery";
import Tags from "./pages/Tags";
import GlobalSearch from "./pages/GlobalSearch";
import AIAssistant from "./pages/AIAssistant";
import Documentation from "./pages/Documentation";
import Settings from "./pages/Settings";
import DesignPreview from "./pages/DesignPreview";
import QuickNoteButton from "./components/QuickNoteButton";
import { NasMountDialog } from "./components/NasMountDialog";
import { setupService } from "./services/setup";
import { nasStorage } from "./services/nasStorage";
import { AlertCircle, Download, RefreshCw } from "lucide-react";

function App() {
  const [syncStatus, setSyncStatus] = useState<{
    show: boolean;
    type: "loading" | "error" | "success";
    message: string;
  }>({ show: false, type: "loading", message: "" });

  const [showNasMountDialog, setShowNasMountDialog] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  // 🔄 Prüfe periodisch auf Pending Changes
  useEffect(() => {
    const checkPendingChanges = () => {
      if (typeof nasStorage.getPendingChangesCount === "function") {
        setPendingChangesCount(nasStorage.getPendingChangesCount());
      }
    };
    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Prüfe periodisch ob NAS wieder verfügbar (alle 30s)
  useEffect(() => {
    if (!readOnlyMode) return;

    const checkNasReconnect = async () => {
      try {
        const connected = await setupService.testConnection();
        if (connected) {
          console.log("[App] ✅ NAS wieder verfügbar! Synchronisiere...");
          setReadOnlyMode(false);

          if (typeof nasStorage.setReadOnlyMode === "function") {
            nasStorage.setReadOnlyMode(false);
          }

          if (typeof nasStorage.syncPendingChanges === "function") {
            const result = await nasStorage.syncPendingChanges();
            if (result.success) {
              setSyncStatus({
                show: true,
                type: "success",
                message: `✅ NAS verfügbar! ${result.synced} Änderung(en) synchronisiert`,
              });
              setPendingChangesCount(0);
              setTimeout(
                () =>
                  setSyncStatus({ show: false, type: "loading", message: "" }),
                5000,
              );
            }
          }
        }
      } catch (error) {
        console.log("[App] NAS noch offline");
      }
    };

    const interval = setInterval(checkNasReconnect, 30000);
    return () => clearInterval(interval);
  }, [readOnlyMode]);

  useEffect(() => {
    const performNasSetup = async () => {
      // NAS-Setup beim App-Start (nur wenn noch nicht migriert)
      try {
        console.log("🚀 Prüfe NAS-Setup...");

        // Prüfe ob Y: Laufwerk verfügbar ist (nur in Electron)
        if (window.electron) {
          const driveCheck = (await window.electron.invoke(
            "nas:check-drive",
          )) as { success: boolean; available?: boolean; configured?: boolean };

          if (driveCheck.success && !driveCheck.available) {
            // Y: ist NICHT verfügbar → Mount-Dialog anzeigen
            console.warn("⚠️ Laufwerk Y: nicht verfügbar - zeige Mount-Dialog");
            setShowNasMountDialog(true);
            return;
          }
        }

        const connected = await setupService.testConnection();

        if (connected) {
          console.log("✅ NAS-Verbindung OK");
          await setupService.runFullSetup();

          setReadOnlyMode(false);
          if (typeof nasStorage.setReadOnlyMode === "function") {
            nasStorage.setReadOnlyMode(false);
          }
        } else {
          console.warn("⚠️ NAS nicht erreichbar - Offline-Modus");
          setReadOnlyMode(true);

          if (typeof nasStorage.setReadOnlyMode === "function") {
            nasStorage.setReadOnlyMode(true);
          }

          setSyncStatus({
            show: true,
            type: "error",
            message: "⚠️ Offline-Modus - Änderungen werden lokal gespeichert",
          });
        }
      } catch (error) {
        console.error("❌ NAS-Setup fehlgeschlagen:", error);
        setReadOnlyMode(true);

        if (typeof nasStorage.setReadOnlyMode === "function") {
          nasStorage.setReadOnlyMode(true);
        }

        setSyncStatus({
          show: true,
          type: "error",
          message: "❌ NAS-Fehler - Offline-Modus aktiv",
        });
      }
    };

    performNasSetup();
  }, []);

  // 🔄 Manuelle Synchronisation
  const handleManualSync = async () => {
    if (readOnlyMode) {
      alert("NAS ist noch nicht verfügbar.");
      return;
    }

    if (typeof nasStorage.syncPendingChanges !== "function") return;

    setSyncStatus({
      show: true,
      type: "loading",
      message: "Synchronisiere...",
    });

    try {
      const result = await nasStorage.syncPendingChanges();

      if (result.success) {
        setSyncStatus({
          show: true,
          type: "success",
          message: `✅ ${result.synced} Änderung(en) synchronisiert`,
        });
        setPendingChangesCount(0);
        setTimeout(
          () => setSyncStatus({ show: false, type: "loading", message: "" }),
          3000,
        );
      } else {
        setSyncStatus({
          show: true,
          type: "error",
          message: `❌ Sync-Fehler`,
        });
      }
    } catch (error) {
      setSyncStatus({
        show: true,
        type: "error",
        message: `❌ Sync fehlgeschlagen`,
      });
    }
  };

  const handleNasMountSuccess = () => {
    setShowNasMountDialog(false);
    // Reload um NAS-Verbindung zu nutzen
    window.location.reload();
  };

  return (
    <>
      {/* 🔄 Offline-Modus Banner */}
      {readOnlyMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white py-2.5 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">🔄 OFFLINE-MODUS</div>
                <div className="text-xs text-amber-100 truncate">
                  Änderungen werden lokal gespeichert
                  {pendingChangesCount > 0 &&
                    ` • ${pendingChangesCount} wartend`}
                </div>
              </div>
            </div>
            {pendingChangesCount > 0 && !readOnlyMode && (
              <button
                onClick={handleManualSync}
                className="bg-white text-amber-700 px-3 py-1 rounded text-xs font-medium hover:bg-amber-50 flex items-center gap-1.5 flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* NAS Mount Dialog */}
      {showNasMountDialog && (
        <NasMountDialog
          onClose={() => setShowNasMountDialog(false)}
          onSuccess={handleNasMountSuccess}
        />
      )}

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="project-timeline" element={<ProjectTimeline />} />
          <Route path="products" element={<Products />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="containers" element={<Containers />} />
          <Route path="notes" element={<Notes />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="research" element={<Research />} />
          <Route path="documents" element={<Documents />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="tags" element={<Tags />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="design-preview" element={<DesignPreview />} />
        </Route>
      </Routes>

      {/* Quick Note Button - nur auf Mobile/Browser */}
      <QuickNoteButton />
    </>
  );
}

export default App;
