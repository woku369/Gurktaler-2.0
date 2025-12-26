/**
 * Test & Setup Script für NAS-Speicher
 * 
 * Dieses Script:
 * 1. Testet die Verbindung zur NAS
 * 2. Erstellt die Verzeichnisstruktur
 * 3. Führt die Migration durch (falls gewünscht)
 * 4. Testet File-Operationen
 */

import { nasStorage } from './nasStorage';
import { migrationService } from './migration';

export class SetupService {
  /**
   * NAS-Verbindung testen
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Teste NAS-Verbindung...");
      
      const config = nasStorage.getConfig();
      console.log("Konfiguration:", config);

      // Test: Basis-Verzeichnis lesbar?
      const files = await nasStorage.listFiles(config.basePath);
      console.log(`✅ Basis-Verzeichnis lesbar: ${files.length} Dateien/Ordner gefunden`);
      
      return true;
    } catch (error) {
      console.error("❌ Verbindung fehlgeschlagen:", error);
      return false;
    }
  }

  /**
   * Verzeichnisstruktur erstellen
   */
  async setupDirectories(): Promise<void> {
    console.log("\n📁 Erstelle Verzeichnisstruktur...");
    await nasStorage.initializeDirectories();
    console.log("✅ Verzeichnisse erstellt");
  }

  /**
   * Test: Datei schreiben & lesen
   */
  async testFileOperations(): Promise<void> {
    console.log("\n🧪 Teste File-Operationen...");

    try {
      // Test 1: JSON schreiben
      const testData = [
        { id: "test1", name: "Test Item 1", created_at: new Date().toISOString() },
        { id: "test2", name: "Test Item 2", created_at: new Date().toISOString() },
      ];

      const testFilePath = nasStorage.getJsonFilePath("_test");
      console.log("  Schreibe Test-Datei:", testFilePath);
      await nasStorage.writeJson(testFilePath, testData);
      console.log("  ✅ Schreiben erfolgreich");

      // Test 2: JSON lesen
      console.log("  Lese Test-Datei...");
      const readData = await nasStorage.readJson<any>(testFilePath);
      console.log("  ✅ Lesen erfolgreich:", readData.length, "Einträge");

      // Test 3: Vergleichen (prüfe nur die Anzahl und IDs)
      if (
        readData.length === testData.length &&
        readData[0]?.id === testData[0].id &&
        readData[1]?.id === testData[1].id
      ) {
        console.log("  ✅ Daten-Integrität bestätigt");
      } else {
        console.error("  ❌ Daten-Mismatch!");
        console.error("    Erwartet:", testData);
        console.error("    Erhalten:", readData);
      }

      // Test 4: Datei löschen
      console.log("  Lösche Test-Datei...");
      await nasStorage.deleteFile(testFilePath);
      console.log("  ✅ Löschen erfolgreich");

      console.log("✅ Alle File-Operations erfolgreich");
    } catch (error) {
      console.error("❌ File-Operations Test fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Test: Bild hochladen & lesen
   */
  async testImageOperations(): Promise<void> {
    console.log("\n🖼️ Teste Image-Operationen...");

    try {
      // Minimales 1x1 Test-Bild (PNG)
      const testImageDataUrl = 
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      // Upload
      console.log("  Lade Test-Bild hoch...");
      const relativePath = await nasStorage.uploadImage("_test", "test123", testImageDataUrl, 0);
      console.log("  ✅ Upload erfolgreich:", relativePath);

      // Read
      console.log("  Lese Test-Bild...");
      const readDataUrl = await nasStorage.readImage(relativePath);
      console.log("  ✅ Lesen erfolgreich (Länge:", readDataUrl.length, ")");

      // Delete
      console.log("  Lösche Test-Bild...");
      await nasStorage.deleteImage(relativePath);
      console.log("  ✅ Löschen erfolgreich");

      console.log("✅ Alle Image-Operations erfolgreich");
    } catch (error) {
      console.error("❌ Image-Operations Test fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Vollständiges Setup ausführen
   */
  async runFullSetup(): Promise<void> {
    console.log("🚀 Gurktaler 2.0 - NAS Setup");
    console.log("════════════════════════════════════");

    try {
      // Schritt 1: Verbindung testen
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error("NAS-Verbindung fehlgeschlagen");
      }

      // Schritt 2: Verzeichnisse erstellen
      await this.setupDirectories();

      // Schritt 3: File-Operations testen
      await this.testFileOperations();

      // Schritt 4: Image-Operations testen
      await this.testImageOperations();

      // Schritt 5: Migration durchführen
      console.log("\n📦 Führe Daten-Migration durch...");
      await migrationService.runMigration();

      console.log("\n════════════════════════════════════");
      console.log("✅ Setup erfolgreich abgeschlossen!");
      console.log("════════════════════════════════════");
      console.log("\n🎉 Gurktaler 2.0 ist bereit!");
      console.log("   Alle Daten wurden auf die NAS übertragen.");
      console.log("   Die App nutzt jetzt zentrale Speicherung.");
    } catch (error) {
      console.error("\n❌ Setup fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Status anzeigen
   */
  async showStatus(): Promise<void> {
    console.log("\n📊 NAS-Speicher Status");
    console.log("══════════════════════");

    const config = nasStorage.getConfig();
    console.log("Basis-Pfad:", config.basePath);
    console.log("Database:", config.databasePath);
    console.log("Images:", config.imagesPath);
    console.log("Documents:", config.documentsPath);
    console.log("Attachments:", config.attachmentsPath);

    console.log("\nMigration:");
    console.log("  Status:", migrationService.isMigrationCompleted() ? "✅ Abgeschlossen" : "⏳ Ausstehend");

    try {
      // Entity-Statistiken
      const entityTypes = ["projects", "products", "recipes", "notes", "contacts"];
      console.log("\nEntity-Daten:");
      
      for (const entityType of entityTypes) {
        const filePath = nasStorage.getJsonFilePath(entityType);
        const data = await nasStorage.readJson(filePath);
        console.log(`  ${entityType.padEnd(20)}:`, data.length.toString().padStart(5), "Einträge");
      }

      // Image-Statistiken
      console.log("\nBilder:");
      const imageTypes = ["products", "notes", "recipes"];
      for (const entityType of imageTypes) {
        const dirPath = `${config.imagesPath}\\${entityType}`;
        const files = await nasStorage.listFiles(dirPath);
        const imageFiles = files.filter(f => !f.isDirectory);
        console.log(`  ${entityType.padEnd(20)}:`, imageFiles.length.toString().padStart(5), "Dateien");
      }
    } catch (error) {
      console.error("❌ Fehler beim Abrufen der Statistiken:", error);
    }
  }
}

export const setupService = new SetupService();

// Für Browser-Console-Zugriff
(window as any).setupNas = setupService;
(window as any).migrationService = migrationService;
(window as any).nasStorage = nasStorage;

console.log("ℹ️ NAS-Setup Tools verfügbar:");
console.log("  window.setupNas.runFullSetup()      - Vollständiges Setup");
console.log("  window.setupNas.testConnection()    - Verbindung testen");
console.log("  window.setupNas.showStatus()        - Status anzeigen");
console.log("  window.migrationService.runMigration() - Migration durchführen");
