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
| ✅     | Auto-Push                   | Automatisch zu GitHub pushen        |
| ✅     | Auto-Pull                   | Beim App-Start mit Konfliktlösung   |
| ✅     | Manual Push/Pull            | Sync-Buttons in Settings            |
| ✅     | Konflikt-Handling           | Dialog: Remote übernehmen / Lokal   |
| ✅     | Backup via Git              | Remote-Repository = Backup-System   |
| 📋     | Google Contacts OAuth API   | Direkter Sync (für v1.1.x)          |

---

## Phase 9: NAS-Integration & Multi-Device (v1.1.x)

### Infrastruktur
| Status | Aufgabe                  | Beschreibung                                   |
| ------ | ------------------------ | ---------------------------------------------- |
| ✅     | Tailscale VPN Setup      | CGNAT-Lösung, Synology NAS Zugriff            |
| ✅     | SMB/CIFS Netzlaufwerk    | Y:\ Drive Mapping                              |
| 🔄     | Electron IPC Handlers    | 9 File-Operations (JSON, Images, Documents)    |
| 🔄     | NAS Storage Provider     | Abstraktionsschicht für zentrale Speicherung   |
| 🔄     | Migration Service        | LocalStorage → NAS (einmalig, automatisch)     |
| 🔄     | Setup Service            | Verbindungstest, Verzeichnisinit, Console-Tools|
| 📋     | Entity Services Refactor | notes.ts, products.ts, etc. → NAS statt LocalStorage |
| 📋     | Binäre Bildspeicherung   | Base64 → Binary Files (90% Speichereinsparung)|
| 📋     | Document Service         | PDF/Excel/Word Upload & Management            |
| 📋     | Multi-User Konfliktlösung| Version-Tracking, Optimistic Locking          |

---

## Phase 10: Projekt-Planung & Visualisierung (v1.2.x)

### Gantt-Export
| Status | Aufgabe                 | Beschreibung                                    |
| ------ | ----------------------- | ----------------------------------------------- |
| 📋     | Projekt-Auswahl Dialog  | Multi-Select mit Checkboxen                     |
| 📋     | Dauer-Eingabe UI        | Startdatum + Dauer pro Projekt                  |
| 📋     | Gantt-Chart Generator   | Frappe Gantt oder eigene SVG-Lösung             |
| 📋     | Timeline-Visualisierung | Überlappungen erkennen, Farben, Notizen         |
| 📋     | Export-Funktionen       | HTML/PNG/PDF Download                           |
| 📋     | Live-Preview            | Interaktive Vorschau vor Export                 |

---

## Phase 11: Android-App (v1.3.x)

| Status | Aufgabe         | Beschreibung             |
| ------ | --------------- | ------------------------ |
| 📋     | PWA-Setup       | Manifest, Service Worker |
| 📋     | Mobile UI       | Responsive Design        |
| 📋     | Quick-Entry     | Schnelle Notiz mobil     |
| 📋     | Capacitor-Build | APK erstellen            |

---

## Phase 12: Polish & Release (v1.0.0) ✅

| Status | Aufgabe        | Beschreibung                                  |
| ------ | -------------- | --------------------------------------------- |
| ✅     | Performance    | Optimiert                                     |
| ✅     | Error-Handling | Robustheit gewährleistet                      |
| ✅     | Backup-System  | Git-basiert (Auto-Commit/Push zu GitHub)      |
| ✅     | Installer      | Windows Setup (NSIS)                          |
| ✅     | Dokumentation  | In-App vollständig, README aktuell            |

---

## Notizen & Ideen (Backlog)

- [ ] Dark Mode
- [ ] Druckansichten für Rezepturen
- [ ] Barcode/QR für Gebinde
- [ ] Kostenkalkulation
- [ ] Produktionsplanung
- [ ] Mehrsprachigkeit (DE/EN)
- [ ] **Google Contacts OAuth Integration** - Live-Sync statt manueller vCard-Import
  - OAuth 2.0 Authentifizierung
  - Google People API Integration
  - Automatische Synchronisation
  - Conflict Resolution bei Updates
- [ ] **Gantt-Chart Erweiterungen** (nach v1.2.x)
  - Meilensteine definieren
  - Abhängigkeiten zwischen Projekten
  - Ressourcenzuweisung (Kontakte zu Projekten)
  - Critical Path Analyse

---

## Changelog-Referenz

Siehe [CHANGELOG.md](./CHANGELOG.md) für detaillierte Versionshistorie.

---

**Letzte Aktualisierung:** 24. Dezember 2025 - NAS-Integration Phase 9 aktiv
