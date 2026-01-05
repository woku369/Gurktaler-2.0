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
  deleteImage(relativePath: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
  getConfig(): StorageConfig;
  getJsonFilePath(entityType: string): string;
  initializeDirectories(): Promise<void>;
}

/**
 * NAS Storage Provider
 * Implementierung für Synology NAS via Electron IPC
 */
export class NasStorageProvider implements StorageProvider {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    // localStorage only available in browser context, not during SSR/build
    let savedPath = "Y:\\zweipunktnull";
    if (typeof window !== 'undefined' && window.localStorage) {
      savedPath = localStorage.getItem("sync_network_path")?.replace("\\data.json", "") || "Y:\\zweipunktnull";
    }
    const basePath = config?.basePath || savedPath;
    
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
 * Custom API Storage Provider
 * Implementierung für Browser-Zugriff via Custom Node.js API auf Port 3002
 * Bypassed broken FileStation Upload API
 */
export class CustomApiStorageProvider implements StorageProvider {
  private config: StorageConfig;
  private baseUrl: string;

  constructor(config?: Partial<StorageConfig>) {
    // Verwende absolute URL mit Port 8080
    this.baseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;
    
    const basePath = config?.basePath || "/database";
    this.config = {
      basePath,
      databasePath: config?.databasePath || "/database",
      imagesPath: config?.imagesPath || "/images",
      documentsPath: config?.documentsPath || "/documents",
      attachmentsPath: config?.attachmentsPath || "/attachments",
    };
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  async readJson<T>(filePath: string): Promise<T[]> {
    try {
      const url = `${this.baseUrl}/api/json?path=${encodeURIComponent(filePath)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Custom API readJson failed: ${response.status}`);
        return [];
      }

      return await response.json() as T[];
    } catch (error) {
      console.error(`Custom API readJson error for ${filePath}:`, error);
      return [];
    }
  }

  async writeJson<T>(filePath: string, data: T[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/json?path=${encodeURIComponent(filePath)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
      });

      if (!response.ok) {
        throw new Error(`Custom API writeJson failed: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error("Custom API writeJson returned success=false");
      }
    } catch (error) {
      console.error(`Custom API writeJson error for ${filePath}:`, error);
      throw error;
    }
  }

  async listFiles(_dirPath: string): Promise<FileInfo[]> {
    // Mock implementation - returns empty array for compatibility
    // CustomAPI doesn't need directory listing
    return [];
  }

  async uploadImage(
    _entityType: string,
    _entityId: string,
    _dataUrl: string,
    _index: number
  ): Promise<string> {
    // TODO: Implement image upload via custom API or keep using FileStation
    throw new Error("Image upload not yet implemented in CustomApiStorageProvider");
  }

  async readImage(_relativePath: string): Promise<string> {
    // TODO: Implement image reading via custom API
    throw new Error("Image reading not yet implemented in CustomApiStorageProvider");
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/json?path=${encodeURIComponent(filePath)}`;
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Custom API deleteFile failed: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error("Custom API deleteFile returned success=false");
      }
    } catch (error) {
      console.error(`Custom API deleteFile error for ${filePath}:`, error);
      throw error;
    }
  }

  async deleteImage(_relativePath: string): Promise<void> {
    // TODO: Implement image deletion
    throw new Error("Image deletion not yet implemented in CustomApiStorageProvider");
  }

  async createDirectory(dirPath: string): Promise<void> {
    // Directories created automatically by Node.js API
    console.log(`✅ Directory ${dirPath} will be created automatically`);
  }

  async initializeDirectories(): Promise<void> {
    console.log("✅ CustomAPI Verzeichnisstruktur wird automatisch erstellt");
  }

  getJsonFilePath(entityType: string): string {
    return `/database/${entityType}.json`;
  }
}

/**
 * Synology FileStation Storage Provider
 * Implementierung für Browser-Zugriff via FileStation API (QuickConnect-Style)
 */
export class FileStationStorageProvider implements StorageProvider {
  private config: StorageConfig;
  private baseUrl: string;
  private sid: string | null = null;

  constructor(config?: Partial<StorageConfig>) {
    // Synology DSM - Relative URL vermeidet CORS (Proxy über Port 80)
    this.baseUrl = ""; // Leer = Same-Origin, kein CORS-Problem
    
    const basePath = config?.basePath || "/Gurktaler/zweipunktnull";
    this.config = {
      basePath,
      databasePath: config?.databasePath || `${basePath}/database`,
      imagesPath: config?.imagesPath || `${basePath}/images`,
      documentsPath: config?.documentsPath || `${basePath}/documents`,
      attachmentsPath: config?.attachmentsPath || `${basePath}/attachments`,
    };
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  private async ensureLoggedIn(): Promise<void> {
    if (this.sid) return; // Already logged in

    const username = localStorage.getItem("synology_username") || "admin";
    const password = localStorage.getItem("synology_password") || "";

    const url = `${this.baseUrl}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}&session=FileStation&format=cookie`;
    
    try {
      const response = await fetch(url, { credentials: "include" });
      const result = await response.json();
      
      if (result.success) {
        this.sid = result.data.sid;
        console.log("🔐 FileStation Login erfolgreich");
      } else {
        throw new Error(`Login fehlgeschlagen: Error ${result.error.code}`);
      }
    } catch (error) {
      console.error("FileStation Login Error:", error);
      throw error;
    }
  }

  async readJson<T>(filePath: string): Promise<T[]> {
    try {
      await this.ensureLoggedIn();
      
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(filePath)}&mode=download`;
      
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        console.warn(`FileStation Download fehlgeschlagen: ${response.status}`);
        return [];
      }

      const text = await response.text();
      
      // Leere Datei oder nur []
      if (!text || text.trim() === "[]") {
        return [];
      }
      
      return JSON.parse(text) as T[];
    } catch (error) {
      console.error(`FileStation readJson Fehler für ${filePath}:`, error);
      return [];
    }
  }

  async writeJson<T>(filePath: string, data: T[]): Promise<void> {
    try {
      await this.ensureLoggedIn();
      
      // FileStation Upload API
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const fileName = filePath.split("/").pop() || "data.json";
      const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
      
      formData.append("file", blob, fileName);
      formData.append("path", folderPath);
      formData.append("create_parents", "true");
      formData.append("overwrite", "true");
      
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Upload&version=2&method=upload`;
      
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`FileStation Upload fehlgeschlagen: Error ${result.error?.code}`);
      }
    } catch (error) {
      console.error(`FileStation writeJson Fehler für ${filePath}:`, error);
      throw error;
    }
  }

  async listFiles(dirPath: string): Promise<FileInfo[]> {
    try {
      await this.ensureLoggedIn();
      
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(dirPath)}`;
      
      const response = await fetch(url, { credentials: "include" });
      const result = await response.json();
      
      if (!result.success) {
        return [];
      }

      return result.data.files.map((file: any) => ({
        name: file.name,
        path: file.path,
        isDirectory: file.isdir,
        size: file.additional?.size || 0,
      }));
    } catch (error) {
      console.error("FileStation listFiles Fehler:", error);
      return [];
    }
  }

  async uploadImage(
    entityType: string,
    entityId: string,
    dataUrl: string,
    index: number
  ): Promise<string> {
    try {
      await this.ensureLoggedIn();
      
      const fileName = `${entityId}_${index}.png`;
      const folderPath = `${this.config.imagesPath}/${entityType}`;
      
      // Convert data URL to blob
      const blob = await fetch(dataUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("file", blob, fileName);
      formData.append("path", folderPath);
      formData.append("create_parents", "true");
      formData.append("overwrite", "true");
      
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Upload&version=2&method=upload`;
      
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`FileStation image upload fehlgeschlagen: Error ${result.error?.code}`);
      }

      return `${entityType}/${fileName}`;
    } catch (error) {
      console.error("FileStation uploadImage Fehler:", error);
      throw error;
    }
  }

  async readImage(filePath: string): Promise<string> {
    try {
      await this.ensureLoggedIn();
      
      const fullPath = `${this.config.imagesPath}/${filePath}`;
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(fullPath)}&mode=download`;
      
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(`FileStation image read fehlgeschlagen: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("FileStation readImage Fehler:", error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.ensureLoggedIn();
      
      const url = `${this.baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Delete&version=2&method=delete&path=${encodeURIComponent(filePath)}`;
      
      const response = await fetch(url, { 
        method: "POST",
        credentials: "include" 
      });

      const result = await response.json();
      
      if (!result.success && result.error?.code !== 408) {
        // 408 = file not found, ignore
        throw new Error(`FileStation DELETE fehlgeschlagen: Error ${result.error?.code}`);
      }
    } catch (error) {
      console.error("FileStation deleteFile Fehler:", error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await this.ensureLoggedIn();
      
      // Split path into parent and folder name
      const lastSlash = dirPath.lastIndexOf("/");
      const folderPath = dirPath.substring(0, lastSlash) || "/";
      const folderName = dirPath.substring(lastSlash + 1);
      
      const url = `${this.baseUrl}/webapi/entry.cgi`;
      const params = new URLSearchParams({
        api: "SYNO.FileStation.CreateFolder",
        version: "2",
        method: "create",
        folder_path: folderPath,
        name: folderName,
        force_parent: "true"
      });
      
      const response = await fetch(`${url}?${params}`, { 
        method: "POST",
        credentials: "include" 
      });

      const result = await response.json();
      
      // Ignore error 408 (already exists)
      if (!result.success && result.error?.code !== 408) {
        console.warn(`FileStation createDirectory fehlgeschlagen: Error ${result.error?.code}`);
      }
    } catch (error) {
      console.error("FileStation createDirectory Fehler:", error);
    }
  }

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

    const entityTypes = ["products", "notes", "recipes", "projects", "contacts", "weblinks"];
    for (const entityType of entityTypes) {
      await this.createDirectory(`${this.config.imagesPath}/${entityType}`);
    }

    console.log("✅ FileStation Verzeichnisstruktur initialisiert");
  }

  getJsonFilePath(entityType: string): string {
    return `${this.config.databasePath}/${entityType}.json`;
  }

  async deleteImage(relativePath: string): Promise<void> {
    const fullPath = `${this.config.imagesPath}/${relativePath}`;
    await this.deleteFile(fullPath);
  }
}

/**
 * Platform Detection
 */
function isElectron(): boolean {
  return typeof window !== 'undefined' && 
         typeof (window as any).electronAPI !== 'undefined';
}

/**
 * Singleton Instance (lazy initialization with platform detection)
 */
let _storageInstance: StorageProvider | null = null;

export const nasStorage = new Proxy({} as StorageProvider, {
  get(_target, prop) {
    if (!_storageInstance) {
      if (isElectron()) {
        console.log("🖥️ Using Electron IPC Storage");
        _storageInstance = new NasStorageProvider();
      } else {
        console.log("🌐 Using Custom API Storage (Port 8080)");
        _storageInstance = new CustomApiStorageProvider();
      }
    }
    return (_storageInstance as any)[prop];
  }
});
