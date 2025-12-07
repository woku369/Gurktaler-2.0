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
  Bot,
  Key,
  Eye,
  EyeOff,
  GitBranch,
  GitCommit,
  RefreshCw,
} from "lucide-react";
import {
  getAvailableProviders,
  saveAPIKey,
  loadAPIKey,
  deleteAPIKey,
  hasAPIKey,
  type AIProvider,
} from "@/renderer/services/aiAssistant";
import {
  exportData,
  importData,
  contacts as contactsService,
} from "@/renderer/services/storage";
import { parseVCard } from "@/renderer/services/vcardParser";
import ContactImportDialog from "@/renderer/components/ContactImportDialog";
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

function Settings() {
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showContactImport, setShowContactImport] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<AIProvider | null>(null);

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

  // Git-Status laden
  useEffect(() => {
    loadGitStatus();
    loadRemotes();
  }, []);

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
          : `Remote "${remoteName}" hinzugefügt!`
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

  const handleGitPull = async () => {
    setGitLoading(true);
    setGitError("");
    const success = await pullChanges();
    if (success) {
      setImportStatus("success");
      setStatusMessage(
        "Änderungen erfolgreich gepullt! Seite wird neu geladen..."
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
      setStatusMessage("Konflikt gelöst! Remote-Daten übernommen. Seite wird neu geladen...");
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
    value: boolean | string
  ) => {
    const newConfig = { ...gitConfig, [key]: value };
    setGitConfig(newConfig);
    saveGitConfig(newConfig);
  };

  const handleExport = () => {
    try {
      const data = exportData();
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
            "Daten erfolgreich importiert! Seite wird neu geladen..."
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          setImportStatus("error");
          setStatusMessage(
            "Fehler beim Importieren der Daten. Überprüfe das Dateiformat."
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

  const handleContactImportConfirm = (
    selectedContacts: Array<ParsedContact & { type: string }>
  ) => {
    try {
      let importedCount = 0;
      selectedContacts.forEach((contact) => {
        contactsService.create({
          name: contact.name,
          type: contact.type as any,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          notes: contact.notes,
        });
        importedCount++;
      });

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

  const handleSaveAPIKey = (provider: AIProvider) => {
    const key = apiKeys[provider];
    if (!key || !key.trim()) return;

    saveAPIKey(provider, key.trim());
    setApiKeys({ ...apiKeys, [provider]: "" });
    setEditingKey(null);
    setImportStatus("success");
    setStatusMessage(`API-Key für ${provider} gespeichert!`);
    setTimeout(() => {
      setImportStatus("idle");
      setStatusMessage("");
    }, 3000);
  };

  const handleDeleteAPIKey = (provider: AIProvider) => {
    if (confirm(`API-Key für ${provider} wirklich löschen?`)) {
      deleteAPIKey(provider);
      setImportStatus("success");
      setStatusMessage(`API-Key für ${provider} gelöscht!`);
      setTimeout(() => {
        setImportStatus("idle");
        setStatusMessage("");
      }, 3000);
    }
  };

  const toggleShowKey = (provider: AIProvider) => {
    if (!showKeys[provider] && !apiKeys[provider]) {
      const key = loadAPIKey(provider);
      if (key) {
        setApiKeys({ ...apiKeys, [provider]: key });
      }
    }
    setShowKeys({ ...showKeys, [provider]: !showKeys[provider] });
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
                          "de-DE"
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
                          e.target.value
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
                Daten exportieren
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Daten importieren
              </button>
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

        {/* AI API Keys */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                KI-Assistenten API-Keys
              </h2>
              <p className="text-sm text-slate-500">
                API-Schlüssel für ChatGPT, Claude, Qwen & DeepSeek
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Hinterlege deine API-Keys um den KI-Assistenten zu nutzen.
              </p>
              <p className="text-xs text-slate-500">
                🔒 API-Keys werden verschlüsselt in LocalStorage gespeichert.
              </p>
            </div>

            {getAvailableProviders().map((provider) => (
              <div
                key={provider.id}
                className="p-4 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-800">
                      {provider.name}
                    </span>
                    {hasAPIKey(provider.id) && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Konfiguriert
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {hasAPIKey(provider.id) && (
                      <>
                        <button
                          onClick={() => toggleShowKey(provider.id)}
                          className="p-1 hover:bg-slate-100 rounded"
                          title={
                            showKeys[provider.id] ? "Verbergen" : "Anzeigen"
                          }
                        >
                          {showKeys[provider.id] ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAPIKey(provider.id)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Löschen"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {(editingKey === provider.id || !hasAPIKey(provider.id)) && (
                  <div className="flex gap-2">
                    <input
                      type={showKeys[provider.id] ? "text" : "password"}
                      value={apiKeys[provider.id] || ""}
                      onChange={(e) =>
                        setApiKeys({
                          ...apiKeys,
                          [provider.id]: e.target.value,
                        })
                      }
                      placeholder="API-Key eingeben..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleSaveAPIKey(provider.id)}
                      disabled={!apiKeys[provider.id]?.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Speichern
                    </button>
                  </div>
                )}

                {hasAPIKey(provider.id) && editingKey !== provider.id && (
                  <button
                    onClick={() => setEditingKey(provider.id)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Ändern
                  </button>
                )}

                {showKeys[provider.id] && apiKeys[provider.id] && (
                  <div className="bg-slate-50 p-2 rounded text-xs font-mono break-all">
                    {apiKeys[provider.id]}
                  </div>
                )}
              </div>
            ))}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Wo bekomme ich API-Keys?</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                <li>
                  • <strong>OpenAI:</strong> platform.openai.com/api-keys
                </li>
                <li>
                  • <strong>Claude:</strong> console.anthropic.com
                </li>
                <li>
                  • <strong>Qwen:</strong> dashscope.console.aliyun.com
                </li>
                <li>
                  • <strong>DeepSeek:</strong> platform.deepseek.com/api_keys
                </li>
              </ul>
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
          existingContacts={contactsService.getAll()}
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
