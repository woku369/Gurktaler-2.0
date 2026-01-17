import { useState, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  backupService,
  type BackupInfo,
  type BackupPreview,
} from "../services/backupService";

export function BackupManager() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [currentStats, setCurrentStats] = useState<BackupPreview | null>(null);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBackupList, setShowBackupList] = useState(false);

  useEffect(() => {
    loadBackups();
    loadCurrentStats();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const backupList = await backupService.listBackups();
      setBackups(backupList);
    } catch (err) {
      setError("Fehler beim Laden der Backups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentStats = async () => {
    try {
      const stats = await backupService.getCurrentStats();
      setCurrentStats(stats);
    } catch (err) {
      console.error("Fehler beim Laden der aktuellen Statistiken:", err);
    }
  };

  const handleSelectBackup = async (backup: BackupInfo) => {
    setSelectedBackup(backup);
    try {
      const backupPreview = await backupService.previewBackup(backup.path);
      setPreview(backupPreview);
    } catch (err) {
      setError("Fehler beim Laden der Backup-Vorschau");
      console.error(err);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      await backupService.createBackup();

      setSuccess("✅ Backup erfolgreich erstellt!");
      await loadBackups();
      await loadCurrentStats();

      // Erfolg-Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Fehler beim Erstellen des Backups");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    const confirmed = window.confirm(
      `⚠️ ACHTUNG: Diese Aktion überschreibt alle aktuellen Daten!\n\n` +
        `Backup vom: ${selectedBackup.timestamp.toLocaleString("de-DE")}\n\n` +
        `Möchten Sie fortfahren?`
    );

    if (!confirmed) return;

    try {
      setRestoring(true);
      setError(null);
      setSuccess(null);

      await backupService.restoreBackup(selectedBackup.path);

      setSuccess(
        "✅ Backup erfolgreich wiederhergestellt! Bitte App neu laden."
      );
      await loadCurrentStats();

      // Nach 2 Sekunden App neu laden
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError("Fehler beim Wiederherstellen des Backups");
      console.error(err);
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-slate-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Backup & Wiederherstellung
            </h2>
            <p className="text-sm text-slate-600">
              Verwalten Sie Ihre Datenbank-Backups
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          {creating ? "Erstelle..." : "Manuelles Backup"}
        </button>
      </div>

      {/* Erfolgs/Fehler-Meldungen */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Aktuelle Statistiken */}
      {currentStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Aktuelle Datenbank</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Projekte</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.projects}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Produkte</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.products}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Rezepturen</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.recipes}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Notizen</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.notes}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Kontakte</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.contacts}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Zutaten</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.ingredients}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Gebinde</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.containers}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Weblinks</div>
              <div className="text-blue-900 text-lg font-bold">
                {currentStats.weblinks}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Liste */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-50">
          <button
            onClick={() => setShowBackupList(!showBackupList)}
            className="flex items-center gap-2 hover:text-slate-900 transition-colors flex-1 text-left"
          >
            {showBackupList ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
            <h3 className="font-semibold text-slate-800">
              Verfügbare Backups ({backups.length})
            </h3>
          </button>
          <button
            onClick={loadBackups}
            disabled={loading}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Aktualisieren"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {showBackupList && (
          <>
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Lade Backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Keine Backups gefunden</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {backups.map((backup) => (
                  <div
                    key={backup.name}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedBackup?.name === backup.name
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => handleSelectBackup(backup)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-sm font-semibold text-slate-800">
                            {formatDate(backup.timestamp)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {backup.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Backup Vorschau & Wiederherstellung */}
      {selectedBackup && preview && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Backup-Vorschau</h3>
            <p className="text-sm text-slate-600 mt-1">
              {formatDate(selectedBackup.timestamp)}
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Statistiken */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Projekte</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.projects}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Produkte</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.products}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Rezepturen</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.recipes}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Notizen</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.notes}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Kontakte</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.contacts}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Zutaten</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.ingredients}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Gebinde</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.containers}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-slate-600 font-medium">Weblinks</div>
                <div className="text-slate-900 text-lg font-bold">
                  {preview.weblinks}
                </div>
              </div>
            </div>

            {/* Wiederherstellungs-Button */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 flex-1">
                Die Wiederherstellung überschreibt alle aktuellen Daten.
                Erstellen Sie zuerst ein manuelles Backup der aktuellen Daten.
              </p>
            </div>

            <button
              onClick={handleRestoreBackup}
              disabled={restoring}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              {restoring ? "Stelle wieder her..." : "Backup wiederherstellen"}
            </button>
          </div>
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        <h4 className="font-semibold text-slate-800 mb-2">ℹ️ Hinweise</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Backups werden stündlich automatisch erstellt</li>
          <li>Backups werden 7 Tage lang aufbewahrt</li>
          <li>Manuelle Backups können jederzeit erstellt werden</li>
          <li>
            Bei der Wiederherstellung werden alle aktuellen Daten überschrieben
          </li>
          <li>
            Nach der Wiederherstellung wird die App automatisch neu geladen
          </li>
        </ul>
      </div>
    </div>
  );
}
