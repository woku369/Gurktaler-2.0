/**
 * Migrations-Script: LocalStorage → NAS
 * 
 * Überträgt alle Daten von persist:gurktaler LocalStorage
 * auf die zentrale NAS-Dateisystem-Struktur
 * 
 * ⚠️ Wird einmalig beim ersten Start der neuen Architektur ausgeführt
 */

import { nasStorage } from './nasStorage';
import type { Image } from '@/shared/types';

interface LegacyStorageData {
  projects: unknown[];
  products: unknown[];
  recipes: unknown[];
  recipe_ingredients: unknown[];
  notes: unknown[];
  tags: unknown[];
  tag_assignments: unknown[];
  contacts: unknown[];
  contact_project_assignments: unknown[];
  weblinks: unknown[];
  ingredients: unknown[];
  byproducts: unknown[];
  containers: unknown[];
  images: Image[];
  favorites: unknown[];
}

export class MigrationService {
  private migrationKey = "gurktaler_migration_completed";
  
  /**
   * Prüfen ob Migration bereits durchgeführt wurde
   */
  isMigrationCompleted(): boolean {
    return localStorage.getItem(this.migrationKey) === "true";
  }

  /**
   * Migration als abgeschlossen markieren
   */
  markMigrationCompleted(): void {
    localStorage.setItem(this.migrationKey, "true");
    localStorage.setItem("gurktaler_migration_date", new Date().toISOString());
  }

  /**
   * Legacy-Daten aus LocalStorage lesen
   */
  private readLegacyData(): LegacyStorageData | null {
    try {
      const persistData = localStorage.getItem("persist:gurktaler");
      if (!persistData) {
        console.log("Keine Legacy-Daten gefunden (persist:gurktaler ist leer)");
        return null;
      }

      const parsed = JSON.parse(persistData);
      
      // Redux Persist speichert jeden Slice als JSON-String
      const data: LegacyStorageData = {
        projects: JSON.parse(parsed.projects || "[]"),
        products: JSON.parse(parsed.products || "[]"),
        recipes: JSON.parse(parsed.recipes || "[]"),
        recipe_ingredients: JSON.parse(parsed.recipe_ingredients || "[]"),
        notes: JSON.parse(parsed.notes || "[]"),
        tags: JSON.parse(parsed.tags || "[]"),
        tag_assignments: JSON.parse(parsed.tag_assignments || "[]"),
        contacts: JSON.parse(parsed.contacts || "[]"),
        contact_project_assignments: JSON.parse(parsed.contact_project_assignments || "[]"),
        weblinks: JSON.parse(parsed.weblinks || "[]"),
        ingredients: JSON.parse(parsed.ingredients || "[]"),
        byproducts: JSON.parse(parsed.byproducts || "[]"),
        containers: JSON.parse(parsed.containers || "[]"),
        images: JSON.parse(parsed.images || "[]"),
        favorites: JSON.parse(parsed.favorites || "[]"),
      };

      console.log("✅ Legacy-Daten gelesen:", {
        projects: data.projects.length,
        products: data.products.length,
        recipes: data.recipes.length,
        notes: data.notes.length,
        images: data.images.length,
      });

      return data;
    } catch (error) {
      console.error("❌ Fehler beim Lesen der Legacy-Daten:", error);
      return null;
    }
  }

  /**
   * Bilder von Base64 → NAS-Dateien migrieren
   */
  private async migrateImages(images: Image[]): Promise<void> {
    console.log(`🖼️ Migriere ${images.length} Bilder...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const image of images) {
      try {
        // Alte Struktur: { id, entity_id, data_url, entity_type, file_name }
        if (!image.data_url || !image.entity_type || !image.entity_id) {
          console.warn("⚠️ Bild übersprungen (fehlende Daten):", image.id);
          errorCount++;
          continue;
        }

        // Entity-Type normalisieren (Singular)
        const entityType = image.entity_type.replace(/s$/, ""); // "products" → "product"
        
        // Index aus ID oder 0 verwenden
        const index = parseInt(image.id.split('_').pop() || '0', 10) || 0;
        
        // Bild auf NAS hochladen
        const relativePath = await nasStorage.uploadImage(
          entityType + "s", // Plural für Ordnername
          String(image.entity_id),
          image.data_url,
          index
        );

        console.log(`✅ Bild migriert: ${relativePath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Fehler bei Bild-Migration (ID: ${image.id}):`, error);
        errorCount++;
      }
    }

    console.log(`✅ Bild-Migration abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`);
  }

  /**
   * Entity-Daten nach NAS schreiben
   */
  private async migrateEntityData(data: LegacyStorageData): Promise<void> {
    console.log("📊 Migriere Entity-Daten...");

    const entities = [
      { name: "projects", data: data.projects },
      { name: "products", data: data.products },
      { name: "recipes", data: data.recipes },
      { name: "recipe_ingredients", data: data.recipe_ingredients },
      { name: "notes", data: data.notes },
      { name: "tags", data: data.tags },
      { name: "tag_assignments", data: data.tag_assignments },
      { name: "contacts", data: data.contacts },
      { name: "contact_project_assignments", data: data.contact_project_assignments },
      { name: "weblinks", data: data.weblinks },
      { name: "ingredients", data: data.ingredients },
      { name: "byproducts", data: data.byproducts },
      { name: "containers", data: data.containers },
      { name: "favorites", data: data.favorites },
    ];

    for (const entity of entities) {
      try {
        const filePath = nasStorage.getJsonFilePath(entity.name);
        await nasStorage.writeJson(filePath, entity.data);
        console.log(`✅ ${entity.name}: ${entity.data.length} Einträge geschrieben`);
      } catch (error) {
        console.error(`❌ Fehler bei Migration von ${entity.name}:`, error);
      }
    }

    console.log("✅ Entity-Daten-Migration abgeschlossen");
  }

  /**
   * Haupt-Migrations-Prozess
   */
  async runMigration(force = false): Promise<void> {
    if (!force && this.isMigrationCompleted()) {
      console.log("ℹ️ Migration bereits durchgeführt (Überspringe)");
      return;
    }

    console.log("🚀 Starte Migration: LocalStorage → NAS");
    console.log("═══════════════════════════════════════");

    try {
      // Schritt 1: Verzeichnisstruktur erstellen
      console.log("\n1️⃣ Erstelle Verzeichnisstruktur...");
      await nasStorage.initializeDirectories();

      // Schritt 2: Legacy-Daten lesen
      console.log("\n2️⃣ Lese Legacy-Daten...");
      const legacyData = this.readLegacyData();
      
      if (!legacyData) {
        console.log("⚠️ Keine Legacy-Daten vorhanden → Erstelle leere Struktur");
        
        // Leere JSON-Dateien erstellen
        const entityTypes = [
          "projects", "products", "recipes", "recipe_ingredients",
          "notes", "tags", "tag_assignments", "contacts",
          "contact_project_assignments", "weblinks", "ingredients",
          "byproducts", "containers", "favorites"
        ];
        
        for (const entityType of entityTypes) {
          const filePath = nasStorage.getJsonFilePath(entityType);
          await nasStorage.writeJson(filePath, []);
        }
        
        this.markMigrationCompleted();
        console.log("\n✅ Migration abgeschlossen (leere Struktur erstellt)");
        return;
      }

      // Schritt 3: Bilder migrieren
      console.log("\n3️⃣ Migriere Bilder...");
      await this.migrateImages(legacyData.images);

      // Schritt 4: Entity-Daten migrieren
      console.log("\n4️⃣ Migriere Entity-Daten...");
      await this.migrateEntityData(legacyData);

      // Schritt 5: Migration als abgeschlossen markieren
      this.markMigrationCompleted();

      console.log("\n═══════════════════════════════════════");
      console.log("✅ Migration erfolgreich abgeschlossen!");
      console.log("═══════════════════════════════════════");
      console.log("\nℹ️ Hinweis: Die alten LocalStorage-Daten bleiben als Backup erhalten.");
      console.log("   Du kannst sie manuell löschen: localStorage.removeItem('persist:gurktaler')");
    } catch (error) {
      console.error("\n❌ Migration fehlgeschlagen:", error);
      throw error;
    }
  }

  /**
   * Migration zurücksetzen (für Tests)
   */
  resetMigration(): void {
    localStorage.removeItem(this.migrationKey);
    localStorage.removeItem("gurktaler_migration_date");
    console.log("🔄 Migration-Status zurückgesetzt");
  }

  /**
   * Legacy-Daten löschen (nach erfolgreicher Migration)
   */
  cleanupLegacyData(): void {
    const confirmed = confirm(
      "⚠️ LocalStorage-Daten löschen?\n\n" +
      "Alle Daten wurden bereits auf die NAS übertragen.\n" +
      "Die LocalStorage-Daten werden nicht mehr benötigt.\n\n" +
      "Fortfahren?"
    );

    if (confirmed) {
      localStorage.removeItem("persist:gurktaler");
      console.log("✅ Legacy-Daten (persist:gurktaler) gelöscht");
      alert("✅ LocalStorage-Daten erfolgreich gelöscht!");
    }
  }
}

export const migrationService = new MigrationService();
