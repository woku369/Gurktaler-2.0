import type {
  Note,
  Project,
  Product,
  Container,
  Recipe,
  Ingredient,
  Tag,
  Weblink,
  Contact,
  Image,
} from "@/shared/types";

interface SyncData {
  notes: Note[];
  projects: Project[];
  products: Product[];
  containers: Container[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  tags: Tag[];
  weblinks: Weblink[];
  contacts: Contact[];
  images: Image[];
  lastSync: string;
}

class SynologySync {
  private syncInProgress = false;
  private networkPath: string;

  constructor() {
    // Standardpfad: Y:\zweipunktnull\data.json (Laufwerk Y: = \\100.121.103.107\Gurktaler)
    this.networkPath = localStorage.getItem("sync_network_path") || "Y:\\zweipunktnull\\data.json";
  }

  // Netzwerkpfad testen
  async testConnection(networkPath: string): Promise<boolean> {
    try {
      const result = await window.electronAPI.syncTest(networkPath);
      if (result.success && result.accessible) {
        console.log("✅ Netzwerkpfad erreichbar:", networkPath);
        return true;
      }
      console.error("❌ Netzwerkpfad nicht erreichbar:", result.error);
      return false;
    } catch (error) {
      console.error("❌ Verbindungstest fehlgeschlagen:", error);
      return false;
    }
  }

  // Pfad konfigurieren
  async configure(networkPath: string): Promise<boolean> {
    const accessible = await this.testConnection(networkPath);
    if (accessible) {
      this.networkPath = networkPath;
      localStorage.setItem("sync_network_path", networkPath);
      return true;
    }
    return false;
  }

  // Verbindung trennen
  disconnect(): void {
    localStorage.removeItem("sync_network_path");
    this.networkPath = "";
  }

  // Prüfen ob konfiguriert
  isConnected(): boolean {
    return !!localStorage.getItem("sync_network_path");
  }

  // Daten aus LocalStorage sammeln
  private collectLocalData(): SyncData {
    try {
      const persist = localStorage.getItem("persist:gurktaler");
      if (!persist) {
        throw new Error("Keine Daten in LocalStorage gefunden");
      }

      const parsed = JSON.parse(persist);

      return {
        notes: JSON.parse(parsed.notes || "[]"),
        projects: JSON.parse(parsed.projects || "[]"),
        products: JSON.parse(parsed.products || "[]"),
        containers: JSON.parse(parsed.containers || "[]"),
        recipes: JSON.parse(parsed.recipes || "[]"),
        ingredients: JSON.parse(parsed.ingredients || "[]"),
        tags: JSON.parse(parsed.tags || "[]"),
        weblinks: JSON.parse(parsed.weblinks || "[]"),
        contacts: JSON.parse(parsed.contacts || "[]"),
        images: JSON.parse(parsed.images || "[]"),
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Fehler beim Sammeln lokaler Daten:", error);
      return {
        notes: [],
        projects: [],
        products: [],
        containers: [],
        recipes: [],
        ingredients: [],
        tags: [],
        weblinks: [],
        contacts: [],
        images: [],
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Daten in LocalStorage schreiben
  private writeLocalData(data: SyncData): void {
    try {
      const persist = JSON.parse(
        localStorage.getItem("persist:gurktaler") || "{}"
      );

      persist.notes = JSON.stringify(data.notes);
      persist.projects = JSON.stringify(data.projects);
      persist.products = JSON.stringify(data.products);
      persist.containers = JSON.stringify(data.containers);
      persist.recipes = JSON.stringify(data.recipes);
      persist.ingredients = JSON.stringify(data.ingredients);
      persist.tags = JSON.stringify(data.tags);
      persist.weblinks = JSON.stringify(data.weblinks);
      persist.contacts = JSON.stringify(data.contacts);
      persist.images = JSON.stringify(data.images);

      localStorage.setItem("persist:gurktaler", JSON.stringify(persist));
      localStorage.setItem("lastSync", data.lastSync);

      console.log("✅ Lokale Daten aktualisiert");
    } catch (error) {
      console.error("Fehler beim Schreiben lokaler Daten:", error);
    }
  }


  // Upload: LocalStorage → Synology
  async uploadData(): Promise<void> {
    if (!this.networkPath) {
      throw new Error("Netzwerkpfad nicht konfiguriert. Bitte configure() aufrufen.");
    }

    if (this.syncInProgress) {
      console.log("Sync bereits aktiv, überspringe...");
      return;
    }

    this.syncInProgress = true;

    try {
      const data = this.collectLocalData();
      const jsonContent = JSON.stringify(data, null, 2);

      const result = await window.electronAPI.syncWrite(this.networkPath, jsonContent);

      if (!result.success) {
        throw new Error(result.error || "Upload fehlgeschlagen");
      }

      console.log("✅ Daten erfolgreich hochgeladen zu:", this.networkPath);
    } catch (error) {
      console.error("❌ Upload fehlgeschlagen:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Download: Synology → LocalStorage
  async downloadData(): Promise<void> {
    if (!this.networkPath) {
      throw new Error("Netzwerkpfad nicht konfiguriert. Bitte configure() aufrufen.");
    }

    if (this.syncInProgress) {
      console.log("Sync bereits aktiv, überspringe...");
      return;
    }

    this.syncInProgress = true;

    try {
      const result = await window.electronAPI.syncRead(this.networkPath);

      if (!result.success) {
        console.log("Keine Remote-Daten gefunden, überspringe Download");
        return;
      }

      if (!result.data) {
        throw new Error("Keine Daten empfangen");
      }

      const cloudData: SyncData = JSON.parse(result.data);

      // Merge-Strategie: Neueste Version gewinnt
      const localLastSync = localStorage.getItem("lastSync") || "1970-01-01";
      const cloudLastSync = cloudData.lastSync || "1970-01-01";

      if (cloudLastSync > localLastSync) {
        console.log("Cloud-Daten sind neuer, aktualisiere lokal...");
        this.writeLocalData(cloudData);

        // Seite neu laden um UI zu aktualisieren
        window.location.reload();
      } else {
        console.log("Lokale Daten sind aktuell");
      }
    } catch (error) {
      console.error("❌ Download fehlgeschlagen:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Bidirektionale Sync
  async sync(): Promise<void> {
    console.log("🔄 Starte Synchronisation...");
    await this.uploadData();
    await this.downloadData();
    console.log("✅ Synchronisation abgeschlossen");
  }

  // Sync-Status abrufen
  getSyncStatus(): {
    isConnected: boolean;
    lastSync: string | null;
    networkPath: string;
  } {
    return {
      isConnected: this.isConnected(),
      lastSync: localStorage.getItem("lastSync"),
      networkPath: this.networkPath,
    };
  }
}

// Singleton-Instanz exportieren
export const synologySync = new SynologySync();
