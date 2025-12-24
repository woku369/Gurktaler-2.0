/**
 * Zentrale NAS-Speicher-Architektur
 * 
 * Storage Provider für File-basierte Speicherung auf Synology NAS
 * Ersetzt LocalStorage-basierte Persistierung mit zentraler Datenhaltung
 */

export interface StorageConfig {
  basePath: string; // z.B. "Y:\\"
  databasePath: string; // z.B. "Y:\\database"
  imagesPath: string; // z.B. "Y:\\images"
  documentsPath: string; // z.B. "Y:\\documents"
  attachmentsPath: string; // z.B. "Y:\\attachments"
}

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

/**
 * Storage Provider Interface
 * Abstraktion für unterschiedliche Speicher-Backends
 */
export interface StorageProvider {
  readJson<T>(filePath: string): Promise<T[]>;
  writeJson<T>(filePath: string, data: T[]): Promise<void>;
  listFiles(dirPath: string): Promise<FileInfo[]>;
  uploadImage(entityType: string, entityId: string, dataUrl: string, index: number): Promise<string>;
  readImage(filePath: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
}

/**
 * NAS Storage Provider
 * Implementierung für Synology NAS via Electron IPC
 */
export class NasStorageProvider implements StorageProvider {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    const basePath = config?.basePath || localStorage.getItem("sync_network_path")?.replace("\\data.json", "") || "Y:\\zweipunktnull";
    
    this.config = {
      basePath,
      databasePath: config?.databasePath || `${basePath}\\database`,
      imagesPath: config?.imagesPath || `${basePath}\\images`,
      documentsPath: config?.documentsPath || `${basePath}\\documents`,
      attachmentsPath: config?.attachmentsPath || `${basePath}\\attachments`,
    };
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  /**
   * JSON-Datei lesen
   * @returns Leeres Array falls Datei nicht existiert
   */
  async readJson<T>(filePath: string): Promise<T[]> {
    try {
      const result = await window.electronAPI.fileReadJson(filePath);
      if (!result.success) {
        console.warn(`Fehler beim Lesen von ${filePath}:`, result.error);
        return [];
      }
      return (result.data || []) as T[];
    } catch (error) {
      console.error(`Fehler beim Lesen von ${filePath}:`, error);
      return [];
    }
  }

  /**
   * JSON-Datei schreiben
   */
  async writeJson<T>(filePath: string, data: T[]): Promise<void> {
    try {
      const result = await window.electronAPI.fileWriteJson(filePath, data);
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Schreiben");
      }
    } catch (error) {
      console.error(`Fehler beim Schreiben von ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Verzeichnis auslesen
   */
  async listFiles(dirPath: string): Promise<FileInfo[]> {
    try {
      const result = await window.electronAPI.fileListDirectory(dirPath);
      if (!result.success) {
        console.warn(`Fehler beim Lesen von Verzeichnis ${dirPath}:`, result.error);
        return [];
      }
      return result.files || [];
    } catch (error) {
      console.error(`Fehler beim Lesen von Verzeichnis ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Bild hochladen
   * @param entityType z.B. "products", "notes", "recipes"
   * @param entityId ID der Entity
   * @param dataUrl Base64 Data-URL
   * @param index Bildnummer (für mehrere Bilder)
   * @returns Relativer Pfad zum Bild (z.B. "products/123_0.jpg")
   */
  async uploadImage(
    entityType: string,
    entityId: string,
    dataUrl: string,
    index: number
  ): Promise<string> {
    try {
      // MIME-Type aus Data-URL extrahieren
      const mimeMatch = dataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      
      // Dateiendung ermitteln
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp"
      };
      const ext = extensions[mimeType] || "jpg";

      // Dateiname: {entityId}_{index}.{ext}
      const filename = `${entityId}_${index}.${ext}`;
      
      // Vollständiger Pfad: Y:\images\{entityType}\{filename}
      const targetPath = `${this.config.imagesPath}\\${entityType}\\${filename}`;
      
      const result = await window.electronAPI.fileUploadImage(targetPath, dataUrl);
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Hochladen");
      }

      // Relativen Pfad zurückgeben (für Datenbank)
      return `${entityType}\\${filename}`;
    } catch (error) {
      console.error("Fehler beim Hochladen von Bild:", error);
      throw error;
    }
  }

  /**
   * Bild lesen (als Data-URL)
   * @param relativePath z.B. "products\\123_0.jpg"
   * @returns Data-URL
   */
  async readImage(relativePath: string): Promise<string> {
    try {
      const fullPath = `${this.config.imagesPath}\\${relativePath}`;
      const result = await window.electronAPI.fileReadImage(fullPath);
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Lesen");
      }
      return result.dataUrl || "";
    } catch (error) {
      console.error(`Fehler beim Lesen von Bild ${relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Datei löschen
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const result = await window.electronAPI.fileDeleteFile(filePath);
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Löschen");
      }
    } catch (error) {
      console.error(`Fehler beim Löschen von ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Verzeichnis erstellen
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      const result = await window.electronAPI.fileCreateDirectory(dirPath);
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Erstellen");
      }
    } catch (error) {
      console.error(`Fehler beim Erstellen von Verzeichnis ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Bild löschen (via relativer Pfad)
   */
  async deleteImage(relativePath: string): Promise<void> {
    const fullPath = `${this.config.imagesPath}\\${relativePath}`;
    await this.deleteFile(fullPath);
  }

  /**
   * Alle Verzeichnisse initialisieren
   */
  async initializeDirectories(): Promise<void> {
    const dirs = [
      this.config.databasePath,
      this.config.imagesPath,
      this.config.documentsPath,
      this.config.attachmentsPath,
    ];

    for (const dir of dirs) {
      await this.createDirectory(dir);
    }

    // Entity-spezifische Image-Ordner
    const entityTypes = ["products", "notes", "recipes", "projects", "contacts", "weblinks"];
    for (const entityType of entityTypes) {
      await this.createDirectory(`${this.config.imagesPath}\\${entityType}`);
    }

    console.log("✅ Verzeichnisstruktur initialisiert:", this.config);
  }

  /**
   * Helper: JSON-Datei-Pfad für Entity-Type
   */
  getJsonFilePath(entityType: string): string {
    return `${this.config.databasePath}\\${entityType}.json`;
  }
}

/**
 * Singleton Instance
 */
export const nasStorage = new NasStorageProvider();
