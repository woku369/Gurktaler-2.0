export interface BackupInfo {
  path: string;
  timestamp: Date;
  size: number;
  fileCount: number;
  name: string;
}

export interface BackupPreview {
  projects: number;
  products: number;
  recipes: number;
  notes: number;
  contacts: number;
  ingredients: number;
  containers: number;
  weblinks: number;
}

interface NasFileInfo {
  name: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

interface NasResult {
  success: boolean;
  error?: string;
  files?: NasFileInfo[];
  content?: string;
}

/**
 * Backup Service - Verwaltet Backups und Wiederherstellung
 */
class BackupService {
  private basePath = 'Y:\\zweipunktnull';
  
  /**
   * Liste alle verfügbaren Backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      // Prüfe ob Electron verfügbar ist
      if (!window.electron || typeof window.electron.invoke !== 'function') {
        console.warn('[BackupService] ⚠️ Electron API nicht verfügbar (PWA/Dev Mode)');
        return [];
      }

      const backupPath = `${this.basePath}\\backups`;
      const result = await window.electron.invoke('nas-readdir', backupPath) as NasResult;
      
      if (!result.success || !result.files) {
        console.error('[BackupService] Fehler beim Auflisten der Backups:', result.error);
        return [];
      }
      
      console.log(`[BackupService] 📋 Gefunden: ${result.files.length} Einträge in backups/`);
      
      // Filtere nur Backup-Verzeichnisse
      const backups: BackupInfo[] = [];
      let skipped = 0;
      for (const file of result.files) {
        if (!file.isDirectory) {
          skipped++;
          continue;
        }
        if (!file.name.startsWith('backup_')) {
          skipped++;
          continue;
        }
        if (file.isDirectory && file.name.startsWith('backup_')) {
          // Parse Timestamp aus Namen: backup_2026-01-15_07-54-49
          const match = file.name.match(/backup_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
          if (match) {
            const timestampStr = match[1].replace('_', ' ').replace(/-/g, ':');
            const [datePart, timePart] = timestampStr.split(' ');
            const [year, month, day] = datePart.split(':');
            const [hour, minute, second] = timePart.split(':');
            
            backups.push({
              path: `${backupPath}\\${file.name}`,
              name: file.name,
              timestamp: new Date(
                parseInt(year), 
                parseInt(month) - 1, 
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
              ),
              size: file.size || 0,
              fileCount: 0 // Wird später gezählt
            });
          }
        }
      }
      
      // Sortiere nach Timestamp (neueste zuerst)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log(
        `[BackupService] ✅ ${backups.length} Backups geladen, ${skipped} Einträge übersprungen`
      );
      
      return backups;
    } catch (error) {
      console.error('[BackupService] Fehler beim Auflisten der Backups:', error);
      return [];
    }
  }
  
  /**
   * Vorschau eines Backups (Anzahl der Einträge)
   */
  async previewBackup(backupPath: string): Promise<BackupPreview> {
    try {
      const preview: BackupPreview = {
        projects: 0,
        products: 0,
        recipes: 0,
        notes: 0,
        contacts: 0,
        ingredients: 0,
        containers: 0,
        weblinks: 0
      };
      
      // Lese alle JSON-Dateien aus dem Backup
      const files = [
        { key: 'projects', file: 'projects.json' },
        { key: 'products', file: 'products.json' },
        { key: 'recipes', file: 'recipes.json' },
        { key: 'notes', file: 'notes.json' },
        { key: 'contacts', file: 'contacts.json' },
        { key: 'ingredients', file: 'ingredients.json' },
        { key: 'containers', file: 'containers.json' },
        { key: 'weblinks', file: 'weblinks.json' }
      ];
      
      for (const { key, file } of files) {
        try {
          const filePath = `${backupPath}\\${file}`;
          const result = await window.electron.invoke('nas-read', filePath) as NasResult;
          
          if (result.success && result.content) {
            const data = JSON.parse(result.content);
            if (Array.isArray(data)) {
              preview[key as keyof BackupPreview] = data.length;
            }
          }
        } catch (error) {
          console.warn(`[BackupService] Konnte ${file} nicht lesen:`, error);
        }
      }
      
      return preview;
    } catch (error) {
      console.error('[BackupService] Fehler bei Backup-Vorschau:', error);
      throw error;
    }
  }
  
  /**
   * Stelle Backup wieder her
   */
  async restoreBackup(backupPath: string): Promise<boolean> {
    try {
      console.log(`[BackupService] 🔄 Stelle Backup wieder her: ${backupPath}`);
      
      const databasePath = `${this.basePath}\\database`;
      
      // Liste alle JSON-Dateien im Backup
      const result = await window.electron.invoke('nas-readdir', backupPath) as NasResult;
      
      if (!result.success || !result.files) {
        throw new Error('Backup-Verzeichnis nicht gefunden');
      }
      
      const jsonFiles = result.files.filter(
        (f: NasFileInfo) => !f.isDirectory && f.name.endsWith('.json')
      );
      
      console.log(`[BackupService] 📋 Gefundene Dateien: ${jsonFiles.length}`);
      
      // Kopiere jede Datei
      for (const file of jsonFiles) {
        const sourcePath = `${backupPath}\\${file.name}`;
        const targetPath = `${databasePath}\\${file.name}`;
        
        console.log(`[BackupService] 📄 Kopiere ${file.name}...`);
        
        // Lese aus Backup
        const readResult = await window.electron.invoke('nas-read', sourcePath) as NasResult;
        if (!readResult.success) {
          throw new Error(`Fehler beim Lesen von ${file.name}`);
        }
        
        // Schreibe in Datenbank
        const writeResult = await window.electron.invoke('nas-write', {
          path: targetPath,
          content: readResult.content
        }) as NasResult;
        
        if (!writeResult.success) {
          throw new Error(`Fehler beim Schreiben von ${file.name}`);
        }
      }
      
      console.log('[BackupService] ✅ Backup erfolgreich wiederhergestellt!');
      return true;
    } catch (error) {
      console.error('[BackupService] ❌ Fehler beim Wiederherstellen:', error);
      throw error;
    }
  }
  
  /**
   * Erstelle manuelles Backup
   */
  async createBackup(): Promise<boolean> {
    try {
      console.log('[BackupService] 📦 Erstelle manuelles Backup...');
      
      const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .split('.')[0];
      
      const sourcePath = `${this.basePath}\\database`;
      const backupPath = `${this.basePath}\\backups\\backup_${timestamp}`;
      
      // Erstelle Backup-Verzeichnis
      await window.electron.invoke('nas-mkdir', backupPath);
      
      // Liste alle JSON-Dateien
      const result = await window.electron.invoke('nas-readdir', sourcePath) as NasResult;
      
      if (!result.success || !result.files) {
        throw new Error('Datenbank-Verzeichnis nicht gefunden');
      }
      
      const jsonFiles = result.files.filter(
        (f: NasFileInfo) => !f.isDirectory && f.name.endsWith('.json')
      );
      
      // Kopiere jede Datei
      for (const file of jsonFiles) {
        const source = `${sourcePath}\\${file.name}`;
        const target = `${backupPath}\\${file.name}`;
        
        const readResult = await window.electron.invoke('nas-read', source) as NasResult;
        if (!readResult.success) continue;
        
        await window.electron.invoke('nas-write', {
          path: target,
          content: readResult.content
        });
      }
      
      console.log('[BackupService] ✅ Backup erfolgreich erstellt:', backupPath);
      return true;
    } catch (error) {
      console.error('[BackupService] ❌ Fehler beim Erstellen des Backups:', error);
      throw error;
    }
  }
  
  /**
   * Zeige aktuelle Datenbank-Statistiken
   */
  async getCurrentStats(): Promise<BackupPreview> {
    const databasePath = `${this.basePath}\\database`;
    return this.previewBackup(databasePath);
  }
}

export const backupService = new BackupService();
