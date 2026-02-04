import { useState, useEffect } from "react";
import {
  Database,
  FolderSync,
  Info,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  GitBranch,
  GitCommit,
  RefreshCw,
  Server,
  Cloud,
} from "lucide-react";
import {
  exportData,
  importData,
  contacts as contactsService,
} from "@/renderer/services/storage";
import { parseVCard } from "@/renderer/services/vcardParser";
import ContactImportDialog from "@/renderer/components/ContactImportDialog";
import { WorkspaceManager } from "@/renderer/components/WorkspaceManager";
import { ContactCategoryManager } from "@/renderer/components/ContactCategoryManager";
import type { ParsedContact } from "@/renderer/services/vcardParser";
import {
  getGitStatus,
  getGitConfig,
  saveGitConfig,
  pushChanges,
  pullChanges,
  addRemote,
  listRemotes,
  resolveConflictWithRemote,
  abortMerge,
  type GitStatus,
  type GitConfig,
} from "@/renderer/services/git";
import { synologySync } from "@/renderer/services/sync";
import { BackupManager } from "@/renderer/components/BackupManager";
import { SetupService } from "@/renderer/services/setup";

function Settings() {
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error" | "loading"
  >("idle");
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showContactImport, setShowContactImport] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);

  // Server-Status State
  const setupService = new SetupService();
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastServerCheck, setLastServerCheck] = useState<Date | null>(null);
  const [serverUptime, setServerUptime] = useState<string | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  // Git-Integration State
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [gitConfig, setGitConfig] = useState<GitConfig>(getGitConfig());
  const [gitLoading, setGitLoading] = useState(false);
  const [gitError, setGitError] = useState<string>("");
  const [showRemoteSetup, setShowRemoteSetup] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [remoteName, setRemoteName] = useState("origin");
  const [remotes, setRemotes] = useState<
    Array<{ name: string; url: string; type: string }>
  >([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Synology Sync State
  const [syncStatus, setSyncStatus] = useState(synologySync.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [networkPath, setNetworkPath] = useState(
    localStorage.getItem("sync_network_path") || "Y:\\zweipunktnull\\data.json",
  );

  // Git-Status laden
  useEffect(() => {
    loadGitStatus();
    loadRemotes();
    checkServerStatus();
  }, []);

  // Server-Status prüfen
  const checkServerStatus = async () => {
    setIsCheckingServer(true);
    setServerStatus("checking");
    try {
      const connected = await setupService.testConnection();
      setServerStatus(connected ? "online" : "offline");
      setLastServerCheck(new Date());
      
      // Uptime simulieren (könnte aus API kommen)
      if (connected) {
        setServerUptime("Seit letztem Neustart");
      } else {
        setServerUptime(null);
      }
    } catch (error) {
      setServerStatus("offline");
      setLastServerCheck(new Date());
      setServerUptime(null);
    } finally {
      setIsCheckingServer(false);
    }
  };

  const loadGitStatus = async () => {
    const status = await getGitStatus();
    setGitStatus(status);
  };

  const loadRemotes = async () => {
    const list = await listRemotes();
    setRemotes(list);
  };

  const handleAddRemote = async () => {
    if (!remoteUrl.trim()) {
      setGitError("Bitte gib eine Remote-URL ein.");
      return;
    }

    setGitLoading(true);
    setGitError("");
    const result = await addRemote(remoteName, remoteUrl);

    if (result.success) {
      setImportStatus("success");
      setStatusMessage(
        result.updated
          ? `Remote "${remoteName}" aktualisiert!`
          : `Remote "${remoteName}" hinzugefügt!`,
      );
      setShowRemoteSetup(false);
      setRemoteUrl("");
      await loadGitStatus();
      await loadRemotes();
    } else {
      setGitError(result.error || "Fehler beim Hinzufügen des Remotes.");
    }

    setGitLoading(false);
    setTimeout(() => {
      setImportStatus("idle");
      setStatusMessage("");
    }, 3000);
  };
  const handleGitPush = async () => {
    setGitLoading(true);
    setGitError("");
    const success = await pushChanges();
    if (success) {
      setImportStatus("success");
      setStatusMessage("Änderungen erfolgreich gepusht!");
      loadGitStatus();
    } else {
      setGitError("Push fehlgeschlagen. Prüfe deine Git-Konfiguration.");
    }
    setGitLoading(false);
    setTimeout(() => {
      setImportStatus("idle");
      setStatusMessage("");
    }, 3000);
  };

  // Pfad-Validierung und -Normalisierung
  const validateAndNormalizePath = (
    path: string,
  ): { valid: boolean; normalized: string; warning?: string } => {
    let normalized = path.trim();
    let warning: string | undefined;

    // Prüfe auf doppeltes "zweipunktnull" und korrigiere automatisch
    if (normalized.includes("\\zweipunktnull\\zweipunktnull")) {
      normalized = normalized.replace(
        /\\zweipunktnull\\zweipunktnull/g,
        "\\zweipunktnull",
      );
      warning = '⚠️ Pfad wurde korrigiert: Doppeltes "zweipunktnull" entfernt';
    }

    // Prüfe ob Pfad mit data.json endet
    if (!normalized.endsWith("data.json")) {
      return {
        valid: false,
        normalized,
        warning: '❌ Pfad muss mit "data.json" enden',
      };
    }

    // Prüfe auf gültige Basis (Y:\ oder UNC)
    const validPatterns = [
      /^Y:\\zweipunktnull\\data\.json$/,
      /^\\\\[\d\.]+\\Gurktaler\\zweipunktnull\\data\.json$/,
    ];

    const isValid = validPatterns.some((pattern) => pattern.test(normalized));

    return { valid: isValid, normalized, warning };
  };

  const handleSyncConnect = async () => {
    if (!networkPath) {
      setSyncMessage("❌ Bitte Netzwerkpfad eingeben");
      return;
    }

    // Validiere und normalisiere Pfad
    const validation = validateAndNormalizePath(networkPath);

    if (validation.warning) {
      setSyncMessage(validation.warning);
      // Aktualisiere Eingabefeld mit normalisiertem Pfad
      setNetworkPath(validation.normalized);
      // Warte kurz, damit Benutzer die Warnung sieht
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!validation.valid) {
      setSyncMessage(validation.warning || "❌ Ungültiger Pfad");
      return;
    }

    setSyncMessage("🔄 Teste Verbindung...");
    const success = await synologySync.configure(networkPath);

    if (success) {
      setSyncStatus(synologySync.getSyncStatus());
      setSyncMessage("✅ Netzwerkpfad erreichbar");
    } else {
      setSyncMessage("❌ Netzwerkpfad nicht erreichbar");
    }

    setTimeout(() => setSyncMessage(""), 5000);
  };

  const handleSyncSync = async () => {
    setIsSyncing(true);
    setSyncMessage("🔄 Synchronisiere...");

    try {
      await synologySync.sync();
      setSyncStatus(synologySync.getSyncStatus());
      setSyncMessage("✅ Synchronisation erfolgreich");
    } catch (error) {
      setSyncMessage("❌ Synchronisation fehlgeschlagen");
      console.error(error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(""), 5000);
    }
  };

  const handleSyncDisconnect = () => {
    synologySync.disconnect();
    setSyncStatus(synologySync.getSyncStatus());
    setSyncMessage("Verbindung getrennt");
    setTimeout(() => setSyncMessage(""), 3000);
  };

  const handleGitPull = async () => {
    setGitLoading(true);
    setGitError("");
    const success = await pullChanges();
    if (success) {
      setImportStatus("success");
      setStatusMessage(
        "Änderungen erfolgreich gepullt! Seite wird neu geladen...",
      );
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setGitError("Pull fehlgeschlagen. Eventuell gibt es Konflikte.");
      setShowConflictDialog(true);
    }
    setGitLoading(false);
    setTimeout(() => {
      setImportStatus("idle");
      setStatusMessage("");
    }, 3000);
  };

  const handleResolveConflictRemote = async () => {
    setGitLoading(true);
    setShowConflictDialog(false);
    const success = await resolveConflictWithRemote();
    if (success) {
      setImportStatus("success");
      setStatusMessage(
        "Konflikt gelöst! Remote-Daten übernommen. Seite wird neu geladen...",
      );
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setGitError("Konflikt-Lösung fehlgeschlagen.");
    }
    setGitLoading(false);
  };

  const handleAbortMerge = async () => {
    setGitLoading(true);
    setShowConflictDialog(false);
    const success = await abortMerge();
    if (success) {
      setImportStatus("success");
      setStatusMessage("Merge abgebrochen. Lokale Änderungen behalten.");
      loadGitStatus();
    } else {
      setGitError("Merge-Abbruch fehlgeschlagen.");
    }
    setGitLoading(false);
  };

  const handleGitConfigChange = (
    key: keyof GitConfig,
    value: boolean | string,
  ) => {
    const newConfig = { ...gitConfig, [key]: value };
    setGitConfig(newConfig);
    saveGitConfig(newConfig);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gurktaler-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus("success");
      setStatusMessage("Daten erfolgreich exportiert!");
      setTimeout(() => {
        setExportStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      setExportStatus("error");
      setStatusMessage("Fehler beim Exportieren der Daten.");
      setTimeout(() => {
        setExportStatus("idle");
        setStatusMessage("");
      }, 3000);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          importData(jsonData);
          setImportStatus("success");
          setStatusMessage(
            "Daten erfolgreich importiert! Seite wird neu geladen...",
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          setImportStatus("error");
          setStatusMessage(
            "Fehler beim Importieren der Daten. Überprüfe das Dateiformat.",
          );
          setTimeout(() => {
            setImportStatus("idle");
            setStatusMessage("");
          }, 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleVCardImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".vcf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const vcfData = event.target?.result as string;
          const contacts = parseVCard(vcfData);

          if (contacts.length === 0) {
            setImportStatus("error");
            setStatusMessage("Keine Kontakte in der vCard-Datei gefunden.");
            setTimeout(() => {
              setImportStatus("idle");
              setStatusMessage("");
            }, 3000);
            return;
          }

          setParsedContacts(contacts);
          setShowContactImport(true);
        } catch (error) {
          setImportStatus("error");
          setStatusMessage("Fehler beim Lesen der vCard-Datei.");
          setTimeout(() => {
            setImportStatus("idle");
            setStatusMessage("");
          }, 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleContactImportConfirm = async (
    selectedContacts: Array<ParsedContact & { type: string }>,
  ) => {
    try {
      let importedCount = 0;
      for (const contact of selectedContacts) {
        await contactsService.create({
          name: contact.name,
          last_name: contact.last_name,
          type: contact.type as any,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          notes: contact.notes,
        });
        importedCount++;
      }

      setShowContactImport(false);
      setParsedContacts([]);
      setImportStatus("success");
      setStatusMessage(`${importedCount} Kontakt(e) erfolgreich importiert!`);
      setTimeout(() => {
        setImportStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      setImportStatus("error");
      setStatusMessage("Fehler beim Importieren der Kontakte.");
      setTimeout(() => {
        setImportStatus("idle");
        setStatusMessage("");
      }, 3000);
    }
  };

  const getLocalStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2) + " KB";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-distillery-900">
          Einstellungen
        </h1>
        <p className="text-distillery-600 font-body">
          App-Konfiguration und Datenverwaltung
        </p>
      </div>

      <div className="space-y-6">
        {/* PWA API Server Status */}
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-distillery-100 rounded-vintage flex items-center justify-center">
              <Server className="w-5 h-5 text-distillery-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">PWA API Server</h2>
              <p className="text-sm text-slate-500">
                Node.js Server Status & Monitoring
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status Overview */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      serverStatus === "online"
                        ? "bg-green-500 animate-pulse"
                        : serverStatus === "offline"
                        ? "bg-red-500"
                        : "bg-yellow-500 animate-pulse"
                    }`}
                  />
                  <span className="font-medium text-slate-700">
                    {serverStatus === "online"
                      ? "Server läuft"
                      : serverStatus === "offline"
                      ? "Server offline"
                      : "Prüfe..."}
                  </span>
                </div>
                <button
                  onClick={checkServerStatus}
                  disabled={isCheckingServer}
                  className="px-3 py-1.5 bg-distillery-600 text-white rounded-lg hover:bg-distillery-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingServer ? "animate-spin" : ""}`} />
                  Prüfen
                </button>
              </div>

              {lastServerCheck && (
                <p className="text-xs text-slate-500">
                  Letzte Prüfung: {lastServerCheck.toLocaleTimeString("de-DE")}
                </p>
              )}
            </div>

            {/* Server Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Endpoint</p>
                <p className="font-mono text-sm text-slate-800">
                  http://100.121.103.107/api/json
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Port</p>
                <p className="font-mono text-sm text-slate-800">3002</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">PWA URL</p>
                <p className="font-mono text-sm text-slate-800">
                  http://100.121.103.107/gurktaler/
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Uptime</p>
                <p className="font-mono text-sm text-slate-800">
                  {serverUptime || "-"}
                </p>
              </div>
            </div>

            {/* Setup Instructions */}
            {serverStatus === "offline" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Server nicht erreichbar
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Der Node.js API Server läuft nicht. Starte ihn manuell oder richte automatischen Start ein.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">
                      Option 1: Manueller Start (SSH)
                    </p>
                    <div className="bg-yellow-100 rounded p-2 font-mono text-xs text-yellow-900 space-y-1">
                      <div>ssh admin@100.121.103.107</div>
                      <div>cd /volume1/Gurktaler/api</div>
                      <div>nohup node server.js &gt; server.log 2&gt;&amp;1 &amp;</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">
                      Option 2: Automatischer Start (Synology Task Scheduler)
                    </p>
                    <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
                      <li>Synology DSM → Systemsteuerung → Aufgabenplanung</li>
                      <li>Erstellen → Geplante Aufgabe → Benutzerdefiniertes Script</li>
                      <li>Task-Name: "Gurktaler API Server"</li>
                      <li>Benutzer: root</li>
                      <li>Zeitplan: Bei Start</li>
                      <li>Script: cd /volume1/Gurktaler/api &amp;&amp; node server.js &gt; server.log 2&gt;&amp;1</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">
                      Windows: Server-Check Script
                    </p>
                    <div className="bg-yellow-100 rounded p-2 font-mono text-xs text-yellow-900">
                      .\\check-server.ps1
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {serverStatus === "online" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Server läuft einwandfrei!
                  </p>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Die PWA kann auf alle NAS-Ressourcen zugreifen.
                </p>
              </div>
            )}

            {/* Documentation Link */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                💡 <strong>Tipp:</strong> Der Server wird automatisch alle 30 Sekunden geprüft. 
                Für Details siehe <span className="font-mono">check-server.ps1</span> und <span className="font-mono">server.js</span>
              </p>
            </div>
          </div>
        </div>

        {/* Backup & Recovery Management */}
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-6">
          <BackupManager />
        </div>

        {/* Workspace Management */}
        <WorkspaceManager />

        {/* Contact Category Management */}
        <ContactCategoryManager />

        {/* Data Management */}
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-distillery-100 rounded-vintage flex items-center justify-center">
              <Database className="w-5 h-5 text-distillery-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Datenverwaltung</h2>
              <p className="text-sm text-slate-500">
                LocalStorage & Browser-Speicher
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-700">Speicher-Typ</p>
                <p className="text-sm text-slate-500">
                  Browser LocalStorage (JSON-basiert)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-700">Aktuelle Größe</p>
                <p className="text-sm text-slate-500">
                  {getLocalStorageSize()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WebDAV Sync */}
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-gurktaler-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gurktaler-100 rounded-vintage flex items-center justify-center">
              <Server className="w-5 h-5 text-gurktaler-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 font-heading">
                Synology Netzwerk-Synchronisation
              </h2>
              <p className="text-sm text-slate-500 font-body">
                Daten über Netzlaufwerk synchronisieren
              </p>
            </div>
          </div>

          {!syncStatus.isConnected ? (
            <div className="space-y-4">
              <p className="text-slate-600">
                Verbinde das Synology-Netzlaufwerk zum korrekten Pfad:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  ✅ Korrekter Pfad:
                </p>
                <code className="text-xs text-blue-800">
                  Y:\zweipunktnull\data.json
                </code>
                <p className="text-xs text-blue-700 mt-2">oder</p>
                <code className="text-xs text-blue-800">
                  \\100.121.103.107\Gurktaler\zweipunktnull\data.json
                </code>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Netzwerkpfad zur data.json
                  </label>
                  <input
                    type="text"
                    value={networkPath}
                    onChange={(e) => setNetworkPath(e.target.value)}
                    placeholder="Y:\zweipunktnull\data.json"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    ⚠️ Wichtig: Pfad muss exakt Y:\zweipunktnull sein (kein
                    doppeltes "zweipunktnull"!)
                  </p>
                </div>

                <button
                  onClick={handleSyncConnect}
                  className="w-full px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors font-medium"
                >
                  Verbindung testen
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gurktaler-50 rounded-lg p-4 border border-gurktaler-200">
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-gurktaler-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gurktaler-900">
                      ✅ Verbunden mit:{" "}
                      <strong className="font-mono text-xs">
                        {syncStatus.networkPath}
                      </strong>
                    </p>
                    {syncStatus.lastSync && (
                      <p className="text-xs text-gurktaler-600 mt-1">
                        Letzte Synchronisation:{" "}
                        {new Date(syncStatus.lastSync).toLocaleString("de-DE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Aktive Pfade anzeigen */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  📂 Aktive Pfade:
                </p>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Datenbank:</span>
                    <code className="text-slate-800">
                      {syncStatus.networkPath?.replace(
                        "\\data.json",
                        "\\database",
                      )}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Backups:</span>
                    <code className="text-slate-800">
                      {syncStatus.networkPath?.replace(
                        "\\data.json",
                        "\\backups",
                      )}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bilder:</span>
                    <code className="text-slate-800">
                      {syncStatus.networkPath?.replace(
                        "\\data.json",
                        "\\images",
                      )}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSyncSync}
                  disabled={isSyncing}
                  className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  Jetzt synchronisieren
                </button>

                <button
                  onClick={handleSyncDisconnect}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Trennen
                </button>
              </div>
            </div>
          )}

          {syncMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                syncMessage.includes("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : syncMessage.includes("❌")
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {syncMessage}
            </div>
          )}
        </div>

        {/* Git Integration */}
        {gitStatus && (
          <div className="bg-white rounded-vintage shadow-vintage border-vintage border-gurktaler-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gurktaler-100 rounded-vintage flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-gurktaler-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 font-heading">
                  Git-Integration
                </h2>
                <p className="text-sm text-slate-500 font-body">
                  Automatischer Sync & Versionierung
                </p>
              </div>
            </div>

            {!gitStatus.hasRemote && !showRemoteSetup && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-vintage">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      Kein Remote-Repository konfiguriert
                    </span>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  Push/Pull funktionieren erst nach Remote-Setup.
                </p>
                <button
                  onClick={() => setShowRemoteSetup(true)}
                  className="w-full px-4 py-2 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors text-sm font-medium"
                >
                  Remote-Repository einrichten
                </button>
              </div>
            )}

            {showRemoteSetup && (
              <div className="mb-4 p-4 bg-gurktaler-50 border border-gurktaler-200 rounded-vintage">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gurktaler-900">
                    Remote-Repository hinzufügen
                  </h3>
                  <button
                    onClick={() => {
                      setShowRemoteSetup(false);
                      setRemoteUrl("");
                      setGitError("");
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Remote-Name
                    </label>
                    <input
                      type="text"
                      value={remoteName}
                      onChange={(e) => setRemoteName(e.target.value)}
                      placeholder="origin"
                      className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Remote-URL (GitHub/GitLab/etc.)
                    </label>
                    <input
                      type="text"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      placeholder="https://github.com/username/repo.git"
                      className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      💡 Beispiele:
                      <br />
                      • https://github.com/user/repo.git
                      <br />• git@github.com:user/repo.git
                    </p>
                  </div>

                  <button
                    onClick={handleAddRemote}
                    disabled={gitLoading || !remoteUrl.trim()}
                    className="w-full px-4 py-2 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gitLoading ? "Wird eingerichtet..." : "Remote hinzufügen"}
                  </button>
                </div>
              </div>
            )}

            {remotes.length > 0 && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-vintage">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Konfigurierte Remotes:
                </h3>
                <div className="space-y-1">
                  {remotes
                    .filter((r) => r.type === "fetch")
                    .map((remote) => (
                      <div
                        key={remote.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        <code className="px-2 py-0.5 bg-white rounded font-mono text-gurktaler-700">
                          {remote.name}
                        </code>
                        <span className="text-slate-600 truncate">
                          {remote.url}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {gitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-vintage">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Fehler</span>
                </div>
                <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
                  {gitError}
                </pre>
              </div>
            )}

            <div className="space-y-4">
              {/* Status */}
              <div className="p-4 bg-gurktaler-50 rounded-vintage border border-gurktaler-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gurktaler-600" />
                    <span className="font-medium text-gurktaler-900">
                      Branch:
                    </span>
                    <code className="px-2 py-0.5 bg-white rounded text-sm">
                      {gitStatus.branch}
                    </code>
                  </div>
                  <button
                    onClick={loadGitStatus}
                    disabled={gitLoading}
                    className="p-1 hover:bg-gurktaler-100 rounded transition-colors"
                    title="Aktualisieren"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-gurktaler-600 ${
                        gitLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                {gitStatus.lastCommit && (
                  <div className="flex items-start gap-2 mb-3">
                    <GitCommit className="w-4 h-4 text-slate-500 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-slate-700">
                        {gitStatus.lastCommit.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {gitStatus.lastCommit.author} •{" "}
                        {new Date(gitStatus.lastCommit.date).toLocaleString(
                          "de-DE",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {gitStatus.hasUncommitted && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      {gitStatus.modified.length + gitStatus.untracked.length}{" "}
                      ungespeicherte Änderung(en)
                    </span>
                  </div>
                )}

                {!gitStatus.hasUncommitted && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Alle Änderungen committed</span>
                  </div>
                )}
              </div>

              {/* Sync Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGitPull}
                  disabled={gitLoading || !gitStatus.hasRemote}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-vintage border-distillery-200 rounded-vintage hover:bg-distillery-50 transition-colors disabled:opacity-50"
                  title={
                    !gitStatus.hasRemote ? "Remote-Repository erforderlich" : ""
                  }
                >
                  <Download className="w-5 h-5" />
                  Pull
                </button>
                <button
                  onClick={handleGitPush}
                  disabled={
                    gitLoading ||
                    !gitStatus.hasRemote ||
                    !gitStatus.hasUncommitted
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors disabled:opacity-50"
                  title={
                    !gitStatus.hasRemote
                      ? "Remote-Repository erforderlich"
                      : !gitStatus.hasUncommitted
                        ? "Keine Änderungen zum Pushen"
                        : ""
                  }
                >
                  <Upload className="w-5 h-5" />
                  Push
                </button>
              </div>

              {/* Auto-Commit Config */}
              <div className="pt-4 border-t border-gurktaler-100">
                <h3 className="font-medium text-slate-800 mb-3">
                  Automatisierung
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gitConfig.autoCommit}
                      onChange={(e) =>
                        handleGitConfigChange("autoCommit", e.target.checked)
                      }
                      className="w-4 h-4 text-gurktaler-600 rounded border-gray-300 focus:ring-gurktaler-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        Auto-Commit
                      </span>
                      <p className="text-xs text-slate-500">
                        Automatischer Commit bei Datenänderungen
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gitConfig.autoPush}
                      onChange={(e) =>
                        handleGitConfigChange("autoPush", e.target.checked)
                      }
                      disabled={!gitConfig.autoCommit}
                      className="w-4 h-4 text-gurktaler-600 rounded border-gray-300 focus:ring-gurktaler-500 disabled:opacity-50"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        Auto-Push
                      </span>
                      <p className="text-xs text-slate-500">
                        Automatischer Push nach Commit
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Commit Message Prefix
                    </label>
                    <input
                      type="text"
                      value={gitConfig.commitMessagePrefix}
                      onChange={(e) =>
                        handleGitConfigChange(
                          "commitMessagePrefix",
                          e.target.value,
                        )
                      }
                      placeholder="[Auto]"
                      className="w-full px-3 py-2 border border-slate-200 rounded-vintage text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderSync className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Datensicherung</h2>
              <p className="text-sm text-slate-500">
                JSON-Export & Import für Git-Sync
              </p>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                exportStatus === "success" || importStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {exportStatus === "success" || importStatus === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Exportiere deine Daten als JSON-Datei zum Backup oder zur
                Synchronisation mit Git.
              </p>
              <p className="text-xs text-slate-500">
                💡 Tipp: Speichere die Export-Datei im Git-Repository für
                Geräte-übergreifenden Zugriff.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Daten exportieren (JSON)
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Daten importieren (JSON)
              </button>
            </div>

            {/* Vollständiger Export für Remote-Rechner */}
            <div className="pt-4 mt-4 border-t border-amber-100 bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Komplettpaket für Remote-Rechner
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                Exportiert ALLE Daten inklusive Bilder für den Upload auf einem
                entfernten Rechner (z.B. Testrechner ohne Zugang zum NAS).
              </p>
              <button
                onClick={async () => {
                  try {
                    setExportStatus("loading");
                    setStatusMessage(
                      "Erstelle Komplettpaket... Dies kann einige Sekunden dauern.",
                    );

                    // Exportiere alle JSON-Daten
                    const jsonData = await exportData();

                    // Info-Hinweis
                    alert(
                      "✅ Export erfolgreich!\n\n" +
                        "Die JSON-Datei enthält alle Ihre Daten.\n\n" +
                        "WICHTIG für Remote-Rechner:\n" +
                        "1. Kopieren Sie die heruntergeladene JSON-Datei auf den Remote-Rechner\n" +
                        "2. Öffnen Sie dort die Gurktaler App\n" +
                        "3. Gehen Sie zu Einstellungen > Datensicherung\n" +
                        "4. Klicken Sie auf 'Daten importieren'\n" +
                        "5. Wählen Sie die kopierte JSON-Datei\n\n" +
                        "HINWEIS: Bilder aus der Galerie müssen separat übertragen werden,\n" +
                        "da diese zu groß für einen Browser-Download sind.\n" +
                        "Nutzen Sie dafür das PowerShell-Script 'export-for-remote.ps1'",
                    );

                    // Download der JSON-Datei
                    const blob = new Blob([jsonData], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `gurktaler-komplett-${new Date().toISOString().split("T")[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    setExportStatus("success");
                    setStatusMessage(
                      "✅ Komplettpaket erfolgreich erstellt und heruntergeladen!",
                    );
                    setTimeout(() => {
                      setExportStatus("idle");
                      setStatusMessage("");
                    }, 5000);
                  } catch (error) {
                    setExportStatus("error");
                    setStatusMessage(
                      "❌ Fehler beim Erstellen des Komplettpakets: " + error,
                    );
                    setTimeout(() => {
                      setExportStatus("idle");
                      setStatusMessage("");
                    }, 5000);
                  }
                }}
                disabled={exportStatus === "loading"}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Cloud className="w-5 h-5" />
                {exportStatus === "loading"
                  ? "Erstelle Export..."
                  : "Komplettpaket für Remote-Rechner erstellen"}
              </button>
              <p className="text-xs text-amber-700 mt-2">
                💡 Dieser Export enthält alle JSON-Daten. Für Bilder nutzen Sie
                bitte das PowerShell-Script.
              </p>
            </div>

            <p className="text-xs text-amber-600">
              ⚠️ Warnung: Beim Import werden alle aktuellen Daten überschrieben!
            </p>

            {/* vCard Import */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Importiere Kontakte aus Google Contacts (vCard Format .vcf)
              </p>
              <button
                onClick={handleVCardImport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-5 h-5" />
                Kontakte aus vCard importieren
              </button>
              <p className="text-xs text-slate-500 mt-2">
                💡 Tipp: In Google Contacts → Exportieren → vCard Format wählen
              </p>
            </div>
          </div>
        </div>

        {/* Server Info (PWA) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                Custom API Server (PWA)
              </h2>
              <p className="text-sm text-slate-500">
                Node.js Server auf Port 3002
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Der Custom API Server ermöglicht Schreibzugriff auf das NAS über
                Browser/PWA.
              </p>
              <p className="text-xs text-slate-500">
                🖥️ Desktop-App nutzt Y:\\ Laufwerk (direkter NAS-Zugriff)
              </p>
              <p className="text-xs text-slate-500">
                📱 Browser/Mobile nutzt Custom API Server (Port 3002)
              </p>
              <p className="text-xs text-slate-500 mt-2">
                ⚙️ Server prüfen:{" "}
                <code className="bg-slate-100 px-1 rounded">
                  check-server.ps1
                </code>
              </p>
              <p className="text-xs text-slate-500">
                🔄 Server neustarten:{" "}
                <code className="bg-slate-100 px-1 rounded">
                  start-server.ps1 -Restart
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                Über Gurktaler 2.0
              </h2>
              <p className="text-sm text-slate-500">
                Version und Informationen
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Version:</span>{" "}
              <span className="font-medium">0.3.0</span>
            </p>
            <p>
              <span className="text-slate-500">Build:</span>{" "}
              <span className="font-medium">Development</span>
            </p>
            <p>
              <span className="text-slate-500">Electron:</span>{" "}
              <span className="font-medium">28.0.0</span>
            </p>
            <p>
              <span className="text-slate-500">React:</span>{" "}
              <span className="font-medium">18.2.0</span>
            </p>
            <p>
              <span className="text-slate-500">Storage:</span>{" "}
              <span className="font-medium">LocalStorage + JSON</span>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Import Dialog */}
      {showContactImport && (
        <ContactImportDialog
          contacts={parsedContacts}
          existingContacts={[]}
          onImport={handleContactImportConfirm}
          onCancel={() => {
            setShowContactImport(false);
            setParsedContacts([]);
          }}
        />
      )}

      {/* Git Conflict Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-vintage p-6 max-w-md w-full mx-4 shadow-vintage">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-heading font-bold text-slate-800">
                Merge-Konflikt erkannt
              </h3>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-sm text-slate-700">
                Lokale und Remote-Änderungen überschneiden sich. Du kannst:
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-vintage">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Option 1: Remote-Daten übernehmen
                </p>
                <p className="text-xs text-blue-700">
                  Verwirft deine lokalen Änderungen und übernimmt die Daten vom
                  Server. Empfohlen wenn du auf dem anderen Gerät gearbeitet
                  hast.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-vintage">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Option 2: Lokale Änderungen behalten
                </p>
                <p className="text-xs text-amber-700">
                  Bricht den Merge ab und behält deine lokalen Daten. Du musst
                  dann manuell synchronisieren.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-vintage">
                <p className="text-xs text-slate-600">
                  💡 <strong>Tipp:</strong> Bei Unsicherheit wähle Option 1 und
                  exportiere vorher ein Backup über "Daten exportieren".
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResolveConflictRemote}
                disabled={gitLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-vintage hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Remote übernehmen
              </button>
              <button
                onClick={handleAbortMerge}
                disabled={gitLoading}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-vintage hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Lokal behalten
              </button>
              <button
                onClick={() => setShowConflictDialog(false)}
                className="px-4 py-2 border-vintage border-slate-200 rounded-vintage hover:bg-slate-50 transition-colors text-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
