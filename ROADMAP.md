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

## Phase 9: NAS-Integration & Multi-Device (v1.7.x) 🔄

**Status:** 🚀 **NÄCHSTE PRIORITÄT** - Infrastruktur steht, Application-Layer folgt

**Ziel:** Vollständige Nutzung des zentralen NAS-Speichers durch alle App-Services

### Phase 9a: Entity Services Refactoring (v1.7.0) 📋 NÄCHSTER SCHRITT

**Aufwand:** 3-4 Tage | **Risiko:** Mittel (Async/Await-Kaskade)

| Status | Aufgabe                           | Beschreibung                                    |
| ------ | --------------------------------- | ----------------------------------------------- |
| 📋     | projects.ts Refactor              | localStorage → nasStorage.readJSON('projects.json') |
| 📋     | products.ts Refactor              | localStorage → nasStorage.readJSON('products.json') |
| 📋     | recipes.ts Refactor               | localStorage → nasStorage.readJSON('recipes.json') |
| 📋     | notes.ts Refactor                 | localStorage → nasStorage.readJSON('notes.json') |
| 📋     | ingredients.ts Refactor           | localStorage → nasStorage.readJSON('ingredients.json') |
| 📋     | containers.ts Refactor            | localStorage → nasStorage.readJSON('containers.json') |
| 📋     | contacts.ts Refactor              | localStorage → nasStorage.readJSON('contacts.json') |
| 📋     | research.ts Refactor              | localStorage → nasStorage.readJSON('research.json') |
| 📋     | tasks.ts Refactor                 | localStorage → nasStorage.readJSON('tasks.json') |
| 📋     | workspaces.ts Refactor            | localStorage → nasStorage.readJSON('workspaces.json') |
| 📋     | Async/Await UI Updates            | Alle Komponenten auf async Service-Calls anpassen |
| 📋     | Error Handling                    | NAS offline → Fallback auf LocalStorage Cache |
| 📋     | Caching-Strategie                 | In-Memory Cache für häufige Reads (Performance) |
| 📋     | Race-Condition-Prevention         | Write-Locks oder Queue-Mechanismus             |

**Erwartete Probleme:**
- ⚠️ Async/Await Kaskade durch alle UI-Komponenten
- ⚠️ Race Conditions bei gleichzeitigen Writes
- ⚠️ NAS offline-Handling (Netzwerk-Fehler)
- ⚠️ Performance-Einbußen ohne Caching

### Phase 9b: Binäre Bildspeicherung (v1.7.0) 📋

**Aufwand:** 2-3 Tage | **Risiko:** Mittel (Migration)

| Status | Aufgabe                           | Beschreibung                                    |
| ------ | --------------------------------- | ----------------------------------------------- |
| 📋     | ImageUpload Component Refactor    | saveImage() → Binary File statt Base64         |
| 📋     | gallery.ts Refactor               | loadImage() → Binary File Reference            |
| 📋     | Migration Script                  | Bestehende Base64 → Binary Files konvertieren  |
| 📋     | Thumbnail-Generierung             | Große Bilder automatisch verkleinern           |
| 📋     | Referenz-Update                   | entity.images[] = ['abc123.jpg'] statt Base64  |
| 📋     | Cleanup Service                   | Alte Base64-Daten aus JSON entfernen           |
| 📋     | Image-Vorschau Component          | Lazy-Loading für große Bilder                  |

**Erwartete Probleme:**
- ⚠️ Migration komplexer Daten (Bilder aus JSON extrahieren)
- ⚠️ Thumbnail-Generierung bei großen Dateien
- ⚠️ Speicher-Cleanup ohne Datenverlust

### Phase 9c: Document Service (v1.7.0) 📋

**Aufwand:** 1-2 Tage | **Risiko:** Niedrig

| Status | Aufgabe                           | Beschreibung                                    |
| ------ | --------------------------------- | ----------------------------------------------- |
| 📋     | DocumentManager Component         | Upload, Liste, Download, Löschen               |
| 📋     | documents.ts Service              | CRUD für Dokumente (PDF, Excel, Word)          |
| 📋     | File-Browser UI                   | Grid/List-View mit Icons                       |
| 📋     | Upload-Progress-Bar               | Für große Dateien (10-50 MB)                   |
| 📋     | MIME-Type-Detection               | Automatische Icon-Auswahl                      |
| 📋     | Projekt-Verknüpfung               | Dokumente zu Projekten/Produkten zuordnen      |
| 📋     | Vorschau-Integration              | PDF-Vorschau in Modal (optional)               |

**Erwartete Probleme:**
- ⚠️ Große Dateien (Upload-Progress nötig)
- ⚠️ MIME-Type-Handling für verschiedene Formate

### Phase 9d: Deployment-Automatisierung (v1.7.0) 📋

**Aufwand:** 1 Tag | **Risiko:** Niedrig

| Status | Aufgabe                           | Beschreibung                                    |
| ------ | --------------------------------- | ----------------------------------------------- |
| 📋     | package.json Script Update        | Post-Build Hook für PWA-Deploy                 |
| 📋     | Cross-Platform Deploy Script      | PowerShell + Bash für Windows/Linux            |
| 📋     | Build-Validierung                 | Check ob Deploy erfolgreich                    |

### Infrastruktur (ABGESCHLOSSEN ✅)

| Status | Aufgabe                  | Beschreibung                                   |
| ------ | ------------------------ | ---------------------------------------------- |
| ✅     | Tailscale VPN Setup      | CGNAT-Lösung, Synology NAS Zugriff            |
| ✅     | SMB/CIFS Netzlaufwerk    | Y:\ Drive Mapping                              |
| ✅     | Electron IPC Handlers    | 9 File-Operations (JSON, Images, Documents)    |
| ✅     | NAS Storage Provider     | Abstraktionsschicht für zentrale Speicherung   |
| ✅     | Migration Service        | LocalStorage → NAS (einmalig, automatisch)     |
| ✅     | Setup Service            | Verbindungstest, Verzeichnisinit, Console-Tools|

### Phase 9e: Multi-User Konfliktlösung ⏸️ VERSCHOBEN AUF v1.8.0

**Begründung:** Zu komplex für v1.7.0, braucht separates Design-Dokument

**Aufwand:** 5-7 Tage | **Risiko:** ⚠️ HOCH (Komplexe Merge-Logik)

| Status | Aufgabe                           | Beschreibung                                    |
| ------ | --------------------------------- | ----------------------------------------------- |
| ⏸️     | Version-Tracking System           | updatedAt Timestamp in allen Entities          |
| ⏸️     | Optimistic Locking                | Write-Konflikte erkennen                       |
| ⏸️     | Konflikt-Dialog UI                | User entscheidet: Local/Remote/Merge           |
| ⏸️     | Merge-Strategie Design            | Wie 2 JSON-Dateien mergen?                     |
| ⏸️     | File-Locking Mechanismus          | Windows SMB-Lock-Handling                      |
| ⏸️     | Network-Interruption Handling     | Korrupte Dateien verhindern                    |
| ⏸️     | Multi-Device Testing              | 2+ Geräte simultan testen                      |

**Kritische Probleme:**
- 🔥 Last-Write-Wins Problem
- 🔥 JSON-Merge-Konflikte (Git kann das nicht)
- 🔥 Hängende File-Locks
- 🔥 Korrupte Dateien bei Netzwerk-Abbruch

**Nächster Schritt:** Separates Design-Dokument für v1.8.0 erstellen

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

## Phase 11: PWA Optimierung & Monitoring (v1.2.x)

| Status | Aufgabe                   | Beschreibung                                   |
| ------ | ------------------------- | ---------------------------------------------- |
| 📋     | Server-Status UI          | Node.js API Server Status in Settings anzeigen|
| 📋     | Auto-Start API Server     | Synology Task Scheduler Setup                  |
| 📋     | Log-Viewer in App         | Echtzeit-Logs vom Node.js Server               |
| 📋     | Server-Health-Check       | Periodische Prüfung auf Erreichbarkeit         |

---

## Phase 12: Aufgabenverwaltung & TODO-Listen (v1.5.0) ✅

### TODO-Liste Dashboard-Widget
| Status | Aufgabe                    | Beschreibung                                    |
| ------ | -------------------------- | ----------------------------------------------- |
| ✅     | Dashboard-Integration      | TODO-Widget im Dashboard (oben links)           |
| ✅     | TODO-Datenbankmodell       | Task { id, title, description, assignee, due_date, status, priority, project_id, completed_at } |
| ✅     | Aufgaben-Liste             | Übersicht aller TODOs mit Filteroptionen        |
| ✅     | CRUD-Operationen           | Erstellen, Bearbeiten, Löschen von Aufgaben    |
| ✅     | Zuweisung & Status         | Wer macht was? Status: Offen/In Arbeit/Erledigt|
| ✅     | Fälligkeitsdatum           | Wann muss was fertig sein?                      |
| ✅     | Projekt-Verknüpfung        | TODOs zu Projekten zuordnen                     |
| ✅     | Priorisierung              | Hoch/Mittel/Niedrig mit farblicher Kennzeichnung|
| ✅     | Auto-Edit-Modal            | Nach Erstellen öffnet sich Bearbeiten-Dialog   |

### Export & Integration
| Status | Aufgabe                    | Beschreibung                                    |
| ------ | -------------------------- | ----------------------------------------------- |
| ✅     | PDF-Export                 | Druckbare TODO-Liste mit Checkboxen, Gruppierung nach Priorität |
| ✅     | E-Mail-Integration         | Einzelne TODOs per Mail versenden (mailto:)     |
| ✅     | iCal Export                | .ics Datei für Kalender-Import (einzeln & alle) |
| ✅     | Filter & Sortierung        | Nach Projekt, Person, Status, Datum, Priorität  |
| 📋     | Google Calendar Sync       | OAuth2-basierte Synchronisierung (vorbereitet, API-Keys erforderlich) |

### Implementierte Features
- ✅ Quick-Add mit Enter-Taste
- ✅ Inline-Checkbox für Status-Toggle (Erledigt ↔ Offen)
- ✅ Prioritäts-Indikatoren mit Farben und Icons
- ✅ Projekt-Badge in Aufgabenliste
- ✅ Filter: Status, Priorität, Projekt
- ✅ Sortierung: Neueste, Fälligkeitsdatum, Priorität, Titel A-Z
- ✅ PDF-Export mit professionellem Layout
- ✅ iCal-Export für Kalender-Apps
- ✅ E-Mail-Sharing mit allen Details
- ✅ Google Calendar API Integration (Optional, Setup erforderlich)

---

## Phase 13: Native Mobile (v1.6.x)
| 📋     | PDF-Export                 | Druckbare TODO-Liste mit Checkboxen            |
| 📋     | E-Mail-Integration         | Einzelne TODOs per Mail versenden (mailto:)     |
| 📋     | Google Calendar Sync       | Aufgaben mit Fälligkeitsdatum zu Calendar       |
| 📋     | iCal Export                | .ics Datei für Kalender-Import                  |
| 📋     | Filter & Sortierung        | Nach Projekt, Person, Status, Datum             |
| 📋     | Dashboard-Widget           | Übersicht offener Aufgaben auf Dashboard        |

### Beispiel-Anwendungsfälle
- "Bürgermeister anrufen - Thema: Förderantrag, Zuständig: Wolfgang, Fällig: 15.01.2026"
- "Etikettendesign finalisieren - Projekt: Gurktaler X2, Zuständig: Grafikdesigner, Prio: Hoch"
- "Rohstoffe bestellen - Zuständig: Einkauf, Fällig: KW 3, Status: Offen"

---

## Phase 13: Project Workspaces (v1.6.0) ✅

**Ziel:** Projekt-Ebenen für strategische Trennung (z.B. Standortentwicklung, Produktentwicklung, Sonstige)

**Status:** 🎉 **ABGESCHLOSSEN** (11. Januar 2026)

| Status | Aufgabe                    | Beschreibung                                    |
| ------ | -------------------------- | ----------------------------------------------- |
| ✅     | Workspace-Datenmodell      | ProjectWorkspace Entity mit Name, Farbe, Icon   |
| ✅     | Project.workspace_id       | Zuordnung Projekt → Workspace                   |
| ✅     | Storage API                | workspaces.getAll/create/update/delete          |
| ✅     | WorkspaceTabs Component    | Tab-Navigation mit Farb-Codierung               |
| ✅     | Projects-Seite Integration | Filter nach aktivem Workspace                   |
| ✅     | Gantt-Chart Workspace-Filter| Separate Zeitplanung pro Workspace             |
| ✅     | Settings Workspace-Manager | CRUD für Workspaces (Name, Farbe, Reihenfolge)  |
| ✅     | Export-Integration         | Workspace-Name auf PDF/iCal                     |
| ✅     | Sichere Löschung           | Projekte bleiben bei Workspace-Löschung erhalten|
| ✅     | Dashboard TODOs            | Workspace-Badge bei projekt-verknüpften Tasks   |
| ✅     | Suche & Filter             | Workspace-Filter in GlobalSearch                |

**Implementierte Features:**
- Tab-basierte Navigation zwischen Workspaces
- Farbcodierung zur visuellen Unterscheidung
- Separate Gantt-Charts pro Workspace
- Workspace-Info auf allen Exports (PDF Task-Listen, PDF Timeline)
- Vollständige Rückwärtskompatibilität (Projekte ohne workspace_id = "Alle Ebenen")
- Sichere Löschung: workspace_id wird entfernt, Projekte bleiben bestehen
- Workspace-Badges auf TODO-Liste (Dashboard) für projekt-verknüpfte Tasks
- Globale Suche mit Workspace-Filter-Dropdown
- Workspace-Badges in Projekt-Suchergebnissen

**Vorteile:**
- Klare Trennung strategischer Projekt-Ebenen
- Keine Vermischung in Gantt-Charts
- Flexible Anzahl von Workspaces
- Alle bestehenden Features bleiben in allen Workspaces erhalten
- Konsistente Workspace-Sichtbarkeit überall im System

**Detaillierte Aufgabenliste:** Siehe `docs/WORKSPACE_IMPLEMENTATION.md`

**Nächste Schritte (v1.7.0):**
- Workspace-Badges bei Notizen (wenn mit Projekt verknüpft)
- Workspace-Filter bei Containern/Gebinden
- Workspace-Badges bei Produkten
- Workspace-Filter bei Rezepten
- **Optimierung Datenbackup:** 
  - ✅ Backup-Liste standardmäßig eingeklappt (verhindert langes Scrollen bei 168 Backups)
  - Stündliche Backups testen und optimieren
  - Backup-Verifizierung nach Erstellung

---

## Phase 14: Native Mobile (v1.7.x)

| Status | Aufgabe         | Beschreibung             |
| ------ | --------------- | ------------------------ |
| 📋     | Capacitor-Build | APK/IPA erstellen        |
| 📋     | Native Features | Kamera, Push, Offline    |
| 📋     | App Store Deploy| iOS & Android Stores     |

---

## Phase 14: Polish & Release (v1.0.0) ✅

| Status | Aufgabe        | Beschreibung                                  |
| ------ | -------------- | --------------------------------------------- |
| ✅     | Performance    | Optimiert                                     |
| ✅     | Error-Handling | Robustheit gewährleistet                      |
| ✅     | Backup-System  | Git-basiert (Auto-Commit/Push zu GitHub)      |
| ✅     | Installer      | Windows Setup (NSIS)                          |
| ✅     | Dokumentation  | In-App vollständig, README aktuell            |

---

## 🚨 KRITISCHE AUFGABEN (Diese Woche - Januar 2026)

### Backup & Datensicherheit

| Status | Priorität | Aufgabe | Beschreibung |
| ------ | --------- | ------- | ------------ |
| 🔄 | **KRITISCH** | Startup-Sequenz anpassen | NAS-Check ZUERST, dann Daten laden. Verhindert, dass leere Daten auf NAS geschrieben werden. |
| 📋 | **KRITISCH** | Schreibschutz im Legacy-Modus | Wenn NAS nicht verfügbar → NUR LESEN, kein Schreiben erlauben. |
| 📋 | HOCH | Snapshot-System aktivieren | Backup bei JEDEM Speichervorgang (letzte 10 Snapshots, 1h Aufbewahrung). |
| 📋 | HOCH | backup-full.ps1 erstellen | Tägliche vollständige Backups um 02:00 Uhr, 7 Tage Aufbewahrung. |

**Grund:** Nach Datenverlust-Vorfällen am 19.01.2026 müssen diese Sicherheitsmaßnahmen SOFORT implementiert werden!

**Details:** Siehe `docs/BACKUP_STRATEGY_ANALYSIS.md` und `NOTFALL_MASSNAHMEN_19_01_2026.md`

---

## Notizen & Ideen (Backlog)

- [ ] Dark Mode
- [ ] Druckansichten für Rezepturen
- [ ] Barcode/QR für Gebinde
- [ ] Kostenkalkulation
- [ ] Produktionsplanung
- [ ] Mehrsprachigkeit (DE/EN)
- [x] **Kontakte: Mehrere Telefonnummern & E-Mails** ✅ v1.8.0
  - Implementiert: Array-basiertes Datenmodell mit Labels
  - UI: Dynamisches Hinzufügen/Entfernen von Feldern mit "+ Weitere hinzufügen"
  - Primär-Markierung mit ★-Button
  - Labels für Kontextualisierung (Geschäftlich, Mobil, Privat, etc.)
  - Rückwärtskompatibel mit alten Kontakten
- [x] **Kontakte: Eigene Kategorien definierbar** ✅ v1.8.0
  - Settings: ContactCategoryManager (CRUD für Kategorien)
  - Farben und Icons wählbar (8 Presets + eigene)
  - Sortierung verwalten
  - Kategorie-Filter in Kontaktliste
- [x] **Projekte: Timeline horizontal verschieben** ✅ v1.8.0
  - Gantt-Chart: Strg+Drag auf Projekt-Balken
  - Startdatum wird automatisch aktualisiert
  - Pixel-zu-Datums-Konvertierung
- [x] **Projekte: Workspace-Ebenen ein-/ausblenden** ✅ v1.8.0
  - Checkboxen über Workspace-Tabs (nur bei "Alle Ebenen")
  - Echtzeit-Filterung der Projekt-Ansicht
  - Set-basierte Sichtbarkeitsverwaltung
  - Eye/EyeOff Icons für visuelle Rückmeldung
- [x] **Drag & Drop Sortierung** ✅ v1.8.0
  - useDragSort Hook für Produkte
  - Visuelle Drag-Indikatoren
  - Order-Feld automatisch aktualisiert
- [x] **Batch-Druck** ✅ v1.8.0
  - Checkbox-Auswahl für mehrere Produkte
  - BatchPrintView Komponente
  - Alle/Keine Selektoren
- [x] **Bilder in Notizen (PWA)** ✅ v1.8.0
  - Kamera + Galerie-Buttons in Mobile-Ansicht
  - ImageUpload Komponente integriert
- [x] **Globaler Loading-Spinner** ✅ v1.8.0
  - LoadingContext für zentrales State-Management
  - Overlay mit Spinner in allen Views
- [x] **Auto-Close Modals** ✅ v1.8.0
  - Automatisches Schließen nach erfolgreicher Aktion
  - Implementiert in allen Formularen
- [x] **Image-Cache (23 MB JSON)** ✅ v1.8.0
  - imageCache.ts Service
  - Cached Bilder für schnelleren Zugriff
- [ ] **Bildergalerie & Dokumente: Zuordnung in Klartext**
  - Statt nur ID anzeigen: Projekt-/Produkt-/Entitätsname
  - Klickbare Zuordnung öffnet die verknüpfte Entität
  - Gilt für Galerie-Ansicht und Dokumenten-Ansicht
  - Verbessertes User-Experience: Man sieht sofort WAS das Bild/Dokument zeigt
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
