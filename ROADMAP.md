# Roadmap - Gurktaler 2.0

> Entwicklungsplan mit Status-Tracking

## Legende

| Symbol | Bedeutung                |
| ------ | ------------------------ |
| ✅     | Erledigt                 |
| 🔄     | In Arbeit                |
| 📋     | Geplant                  |
| ❌     | Verworfen/Zurückgestellt |

---

## Phase 1: Fundament (v0.1.x)

### Projektstruktur & Tooling

| Status | Aufgabe            | Beschreibung               |
| ------ | ------------------ | -------------------------- |
| ✅     | Projekt-Setup      | package.json, Dependencies |
| ✅     | Vite-Konfiguration | Build-Setup, Hot Reload    |
| ✅     | TypeScript-Setup   | tsconfig, Typen            |
| ✅     | TailwindCSS        | Styling-Framework          |
| 📋     | ESLint/Prettier    | Code-Qualität              |

### Dokumentation

| Status | Aufgabe        | Beschreibung         |
| ------ | -------------- | -------------------- |
| ✅     | README.md      | Projektübersicht     |
| ✅     | ROADMAP.md     | Diese Datei          |
| ✅     | CHANGELOG.md   | Versionshistorie     |
| ✅     | DATENMODELL.md | Schema-Dokumentation |

### Datenbank

| Status | Aufgabe         | Beschreibung                     |
| ------ | --------------- | -------------------------------- |
| ✅     | Schema-Design   | Alle Entitäten definieren        |
| ✅     | Storage-Service | LocalStorage + JSON für Git-Sync |
| 📋     | Seed-Daten      | Testdaten für Entwicklung        |

---

## Phase 2: Kern-UI (v0.2.x)

### Layout & Navigation

| Status | Aufgabe            | Beschreibung             |
| ------ | ------------------ | ------------------------ |
| ✅     | App-Shell          | Header, Sidebar, Content |
| ✅     | Routing            | React Router Setup       |
| ✅     | Sidebar-Navigation | Hauptmenü                |
| ✅     | Dashboard          | Übersichtsseite          |

### Basis-Komponenten

| Status | Aufgabe          | Beschreibung             |
| ------ | ---------------- | ------------------------ |
| ✅     | Modal-Komponente | Wiederverwendbares Modal |
| ✅     | Form-Komponenten | Input, Textarea, Select  |
| ✅     | Card-Komponente  | Einheitliche Darstellung |
| 📋     | Table-Komponente | Listen-Ansichten         |

---

## Phase 3: Projekte & Produkte (v0.3.x)

### Projekt-Verwaltung

| Status | Aufgabe                    | Beschreibung                   |
| ------ | -------------------------- | ------------------------------ |
| ✅     | Projekt-Liste              | Übersicht aller Projekte       |
| ✅     | Projekt erstellen          | Neues Projekt anlegen          |
| ✅     | Projekt bearbeiten/löschen | CRUD-Operationen               |
| ✅     | Projekt-Status             | Aktiv/Archiviert/Abgeschlossen |

### Produkt-Versionierung

| Status | Aufgabe           | Beschreibung                         |
| ------ | ----------------- | ------------------------------------ |
| ✅     | Produkt-Baum      | Hierarchische Ansicht (X → X1)       |
| ✅     | Version erstellen | Neue Version aus bestehendem Produkt |
| ✅     | Archivierung      | Mit Kommentar archivieren            |
| ✅     | Produkt-CRUD      | Create/Read/Update/Delete            |
| ✅     | Projekt-Zuordnung | Produkte zu Projekten zuweisen       |
| 📋     | Versionsvergleich | Unterschiede anzeigen                |

---

## Phase 4: Rezepturen (v0.6.x - v0.9.x) ✅

### Zutaten-Stammdaten

| Status | Aufgabe            | Beschreibung                           |
| ------ | ------------------ | -------------------------------------- |
| ✅     | Zutaten-Liste      | Mazerate, Destillate, Rohstoffe        |
| ✅     | Zutaten-Kategorien | Freie Kategorisierung                  |
| ✅     | Preisverwaltung    | Liter-/Kilopreise für Kalkulation      |
| ✅     | Excel-Import       | Template mit Beispieldaten             |

### Rezeptur-Editor

| Status | Aufgabe                | Beschreibung                              |
| ------ | ---------------------- | ----------------------------------------- |
| ✅     | Rezeptur-Formular      | Zutaten + Mengen mit Sortierung           |
| ✅     | Zubereitungsschritte   | Anleitung als Textfeld                    |
| ✅     | Rezeptur-Kalkulation   | Auto-Berechnung: Volumen, Alkohol, Kosten |
| ✅     | Rezeptur-Versionierung | Tree-View mit parent_id wie bei Produkten |
| ✅     | Unit-Conversion        | ml/l/g/kg/TL/EL Umrechnung                |
| ✅     | Pro-Liter-Kalkulation  | Wenn Ausbeute angegeben                   |

---

## Phase 5: Chaosablage & Notizen (v0.5.x)

| Status | Aufgabe           | Beschreibung                   |
| ------ | ----------------- | ------------------------------ |
| ✅     | Quick-Entry       | Schnelle Notiz-Eingabe         |
| ✅     | Notiz-Liste       | Chronologisch/Nach Tags        |
| ✅     | Notiz-Typen       | Idee, Notiz, TODO, Recherche   |
| ✅     | Filter-Tabs       | Alle, Chaosablage, Mit Projekt |
| ✅     | Projekt-Zuordnung | Nachträgliches Zuordnen        |
| ✅     | Rich-Text-Editor  | Markdown mit Live-Preview      |
| ✅     | Bild-Upload       | Komponente bereit              |

---

## Phase 6: Erweiterungen (v0.6.x)

### Recherche & Links

| Status | Aufgabe            | Beschreibung           |
| ------ | ------------------ | ---------------------- |
| ✅     | Webseiten-Sammlung | URL + Notiz/Kategorien |
| ✅     | Marktbegleiter     | Konkurrenzprodukte     |
| 📋     | Dokumente          | PDF-Ablage             |

### Kontakte

| Status | Aufgabe             | Beschreibung              |
| ------ | ------------------- | ------------------------- |
| ✅     | Kontakt-Verwaltung  | Name, Firma, Notizen      |
| ✅     | Kontakt-Typen       | Lieferant, Partner, Kunde |
| ✅     | Filter nach Typ     | Schnellfilter             |
| ✅     | Kontakt-Verknüpfung | Zu Projekten zuordnen     |

### By-Products

| Status | Aufgabe            | Beschreibung            |
| ------ | ------------------ | ----------------------- |
| 📋     | Marketing-Material | Zu Produkten zugeordnet |
| 📋     | Gebinde-Verwaltung | Flaschen, Etiketten     |

---

## Phase 7: Suche & Tags (v0.7.x) ✅

| Status | Aufgabe        | Beschreibung                                      |
| ------ | -------------- | ------------------------------------------------- |
| ✅     | Volltext-Suche | Über alle 8 Bereiche (inkl. Rezepturen, Zutaten, Gebinde)|
| ✅     | Tag-System     | Vollständig implementiert                         |
| ✅     | Filter         | Tag-Filter in allen Views (inkl. Recipes, Gebinde)|
| ✅     | Dokumentation  | Anleitungs-Seite mit allen Features               |
| ✅     | Favoriten      | Star-Icons, Dashboard-Widget, GlobalSearch-Filter |

---

## Phase 8: Sync & Export (v0.8.x) 🔄

| Status | Aufgabe                     | Beschreibung                        |
| ------ | --------------------------- | ----------------------------------- |
| ✅     | JSON-Export                 | Alle Daten exportieren              |
| ✅     | JSON-Import                 | Daten importieren                   |
| ✅     | Settings-UI                 | Export/Import Buttons               |
| ✅     | vCard-Import                | Google Contacts importieren (.vcf)  |
| ✅     | Git-Integration             | Automatischer Sync                  |
| ✅     | Auto-Commit                 | Bei Datenänderungen                 |
| ✅     | Manual Push/Pull            | Sync-Buttons in Settings            |
| 📋     | Konflikt-Handling           | Bei Merge-Konflikten (v0.9.x)       |
| 📋     | Google Contacts OAuth API   | Direkter Sync (für v0.9.x)          |

---

## Phase 9: Android-App (v0.9.x)

| Status | Aufgabe         | Beschreibung             |
| ------ | --------------- | ------------------------ |
| 📋     | PWA-Setup       | Manifest, Service Worker |
| 📋     | Mobile UI       | Responsive Design        |
| 📋     | Quick-Entry     | Schnelle Notiz mobil     |
| 📋     | Capacitor-Build | APK erstellen            |

---

## Phase 10: Polish & Release (v1.0.0)

| Status | Aufgabe        | Beschreibung         |
| ------ | -------------- | -------------------- |
| 📋     | Performance    | Optimierung          |
| 📋     | Error-Handling | Robustheit           |
| 📋     | Backup-System  | Automatische Backups |
| 📋     | Installer      | Windows Setup        |
| 📋     | Dokumentation  | Vollständig          |

---

## Notizen & Ideen (Backlog)

- [ ] Dark Mode
- [ ] Druckansichten für Rezepturen
- [ ] Barcode/QR für Gebinde
- [ ] Kostenkalkulation
- [ ] Produktionsplanung
- [ ] Mehrsprachigkeit (DE/EN)
- [ ] **Google Contacts OAuth Integration** - Live-Sync statt manueller vCard-Import (geplant für v0.9.x)
  - OAuth 2.0 Authentifizierung
  - Google People API Integration
  - Automatische Synchronisation
  - Conflict Resolution bei Updates

---

## Changelog-Referenz

Siehe [CHANGELOG.md](./CHANGELOG.md) für detaillierte Versionshistorie.

---

**Letzte Aktualisierung:** 30. November 2025
