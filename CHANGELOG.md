# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [1.7.4] - 2026-02-04

### ✨ Neue Features

#### ☁️ Google Calendar Integration ABGESCHLOSSEN ✅

**Settings UI für OAuth-Credentials:**
- Google Calendar Integration Section in Einstellungen
- Input-Felder für Client-ID und API-Key
- Status-Anzeige: Konfiguriert ✅ / Nicht konfiguriert ⚠️
- Save/Clear Buttons für Credential-Management
- LocalStorage-Persistierung (Vorrang vor .env)
- Setup-Anleitung mit Links zu Google Cloud Console

**Umfassende Dokumentation:**
- Neue Anleitungen-Sektion: "Google Calendar Integration"
- 6 detaillierte How-To Guides:
  1. Google Cloud Projekt erstellen
  2. OAuth 2.0 Client-ID erstellen
  3. API-Schlüssel erstellen
  4. Credentials in der App konfigurieren
  5. Bei Google anmelden
  6. TODOs synchronisieren
- Troubleshooting-Guide für häufige Fehler
- 12 Tipps & Best Practices

**Features (bereits vorhanden, jetzt vollständig dokumentiert):**
- OAuth 2.0 Login/Logout über Dashboard
- Automatische Synchronisation: App → Google Calendar
- Nur TODOs mit Fälligkeitsdatum werden synchronisiert
- Event-Prefix: '[Gurktaler]' im Titel
- CRUD-Operationen: Erstellen/Ändern/Löschen synchronisiert
- Bidirektionale Sync: App ist Master, Google ist Slave

### 📚 Dokumentation
- ROADMAP.md: Google Calendar Sync als ✅ ABGESCHLOSSEN markiert (v1.7.4)
- Documentation.tsx: Vollständiger Anleitungs-Abschnitt hinzugefügt
- .env.example: Bereits vorhanden mit Google Credentials Template
- README.md: Feature-Liste aktualisiert (siehe unten)

---

## [1.7.3] - 2026-02-04

### ✨ Neue Features

#### 🖥️ PWA Server-Monitoring - Phase 12 ABGESCHLOSSEN ✅

**Log-Viewer in der App:**
- Letzte 50 Zeilen von server.log direkt in Settings anzeigen
- Farbcodierung: Rot (Fehler/KRITISCH), Gelb (Warnung), Grün (Erfolg)
- Refresh-Button für manuelle Aktualisierung
- Scrollbarer Container mit Terminal-Look (schwarzer Hintergrund)
- API-Endpoint: GET /api/logs?lines=50

**Health-Metriken:**
- Memory Usage: Heap Used / Heap Total in MB
- Process ID (PID) für Monitoring
- Node.js Version
- Uptime formatiert (Tage/Stunden/Minuten)
- API-Endpoint: GET /api/health
- Automatische Abfrage bei Status-Check

**Server.js Erweiterungen:**
- Neuer Endpoint: /api/logs - Server-Logs abrufen
- Neuer Endpoint: /api/health - Health-Check mit Metriken
- formatUptime() Helper-Funktion
- CORS-Header für alle Endpoints

**UI-Verbesserungen:**
- Health-Metriken im grünen Success-Banner
- "Server-Logs anzeigen" Button (Toggle)
- Log-Viewer mit dunklem Theme und Syntax-Highlighting
- Responsive Grid für Health-Daten (2x2 / 4x1)

### 📚 Dokumentation
- README.md aktualisiert: PWA Server-Monitoring komplett
- ROADMAP.md: Phase 12 als ✅ ABGESCHLOSSEN markiert
- Documentation.tsx: Log-Viewer und Health-Metriken How-To hinzugefügt
- AI_ASSISTANT_RULES.md: Regeln für automatische Dokumentation

---

## [1.7.2] - 2026-02-04

### ✨ Neue Features

#### 🖥️ PWA Server-Monitoring (Phase 12 - Teil 1)
- **Server-Status Section in Settings:**
  - Live-Status-Anzeige mit farbigen Indikatoren (Grün/Rot/Gelb)
  - Manueller Status-Check Button mit Refresh-Animation
  - Automatische Prüfung alle 30 Sekunden
  - Server-Details: Endpoint, Port, PWA URL, Uptime
  - Letzte Prüfung mit Zeitstempel

- **Setup-Anleitungen integriert:**
  - Option 1: Manueller Start via SSH (Copy-Paste Commands)
  - Option 2: Automatischer Start mit Synology Task Scheduler
  - Windows: check-server.ps1 Script-Anleitung
  - Fehler-Hinweise bei Offline-Status mit Lösungsvorschlägen

- **Dokumentation:**
  - Neue "PWA Server-Monitoring" Sektion in Anleitungen
  - 5 How-To Guides: Status prüfen, manueller Start, Auto-Start, Windows-Check, Logs ansehen
  - 10 Tipps für Server-Verwaltung und Troubleshooting

### 📚 Dokumentation
- README.md aktualisiert mit PWA Server-Monitoring Feature
- ROADMAP.md: Phase 12 teilweise abgeschlossen (Server-Status UI ✅)
- Documentation.tsx: Vollständige Anleitung für Server-Management

---

## [1.6.0] - 2026-01-11

### ✨ Neue Features

#### 🗂️ Project Workspaces / Projekt-Ebenen (Phase 13)
- **Strategische Projekt-Organisation:** Multi-Level Workspace System für klare Trennung
  - 3 Standard-Workspaces: Standortentwicklung, Produktentwicklung, Sonstige
  - Frei definierbar: Name, Icon (10 Emojis), Farbe (10 Farben), Beschreibung
  - Tab-basierte Navigation auf Projects + Timeline Seiten
  - Separate Gantt-Charts pro Workspace möglich

- **Workspace-Verwaltung in Settings:**
  - WorkspaceManager mit vollständiger CRUD-Funktionalität
  - ➕ Neue Ebene erstellen mit Farbpalette und Icon-Auswahl
  - ✏️ Bestehende Ebenen bearbeiten (alle Felder änderbar)
  - 🗑️ Ebenen löschen mit Sicherheitsabfrage
  - ⚠️ **Sichere Löschung:** Projekte werden NIE gelöscht, nur Zuordnung entfernt
  - Detaillierte Warnung zeigt Anzahl betroffener Projekte

- **Projekt-Integration:**
  - Workspace-Auswahl beim Erstellen/Bearbeiten von Projekten
  - Workspace-Badge auf Projektkarten (Icon + Name, farbig umrahmt)
  - Filter: "Alle Ebenen" oder spezifischer Workspace
  - Rückwärtskompatibel: Projekte ohne Workspace weiterhin sichtbar

- **Timeline/Gantt-Chart Integration:**
  - WorkspaceTabs auf ProjectTimeline-Seite
  - Separate Zeitplanung pro Workspace
  - PDF-Export zeigt aktiven Workspace im Header
  - Filter funktioniert mit Timeline-Projekten

- **TODO-Liste Integration:**
  - Workspace-Badge bei projekt-verknüpften Tasks
  - Zeigt Projekt + zugehörigen Workspace
  - PDF-Export mit Workspace-Info

- **Globale Suche:**
  - Workspace-Filter-Dropdown ("Alle Ebenen" oder spezifisch)
  - Workspace-Badge in Projekt-Suchergebnissen
  - Filtert nur Projekte, andere Entitäten durchlassen

- **Vollständiges Datenmodell:**
  ```typescript
  interface ProjectWorkspace extends BaseEntity {
    name: string;              // Frei definierbarer Name
    description?: string;      
    color: string;             // Hex-Color (#3b82f6)
    icon?: string;             // Emoji (📍)
    order: number;             // Sortierung (0, 1, 2, ...)
  }

  interface Project extends BaseEntity {
    // ... existing fields
    workspace_id?: string;     // Optional für Rückwärtskompatibilität
  }
  ```

### 🔒 Sicherheit & Stabilität
- **Workspace-Löschung:** Sichere Implementierung verhindert versehentliches Löschen von Projekten
  - Nur `workspace_id` Referenz wird entfernt
  - Projekte bleiben vollständig erhalten
  - Erscheinen automatisch im "Alle Ebenen" Filter
  - Console-Logs zur Nachverfolgung

### 📄 Dokumentation
- **WORKSPACE_IMPLEMENTATION.md:** Vollständige 5-Phasen Implementierungs-Checkliste
- **ROADMAP.md:** Phase 13 als abgeschlossen markiert
- Alle Features dokumentiert mit Code-Beispielen

### 🎨 UI/UX Verbesserungen
- **WorkspaceTabs Component:** Elegante Tab-Navigation mit:
  - Workspace-Farbe als 3px Top-Border
  - Icon + Name in jedem Tab
  - Hover-Effekte und Transitions
  - Responsive Design (overflow-x-auto)
  - Optional "Alle Ebenen" Tab (📊)

- **Workspace-Badges:** Konsistentes Design überall:
  - Halbtransparenter Hintergrund (color + 20% opacity)
  - 1px farbiger Border
  - Icon + Name
  - Hover-Tooltip mit Workspace-Beschreibung

---

## [1.5.0] - 2026-01-10

### ✨ Neue Features

#### 📋 Aufgabenverwaltung & TODO-Listen (Phase 12)
- **Dashboard-Integration:** TODO-Widget im Dashboard (oben links neben Schnellzugriff)
  - Quick-Add mit Enter-Taste für schnelles Erstellen
  - Auto-Edit-Modal öffnet sich nach Erstellen für vollständige Details
  - Inline-Checkbox für Status-Toggle (Offen ↔ Erledigt)
  - Kompakte Aufgabenliste mit allen wichtigen Informationen

- **Vollständiges Datenbankmodell:**
  ```typescript
  interface Task {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    due_date?: string;
    status: 'open' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    project_id?: string;
    completed_at?: string;
    created_at: string;
    updated_at?: string;
  }
  ```

- **CRUD-Operationen:**
  - Erstellen: Quick-Add Input-Feld mit automatischer Projektzuordnung bei aktivem Filter
  - Bearbeiten: Vollständiger Edit-Dialog mit allen Feldern
  - Löschen: Direktes Löschen aus Liste
  - Status-Toggle: Checkbox zum schnellen Abhaken

- **Filter & Sortierung:**
  - Status-Filter: Alle / Offen / In Arbeit / Erledigt
  - Prioritäts-Filter: Alle / Hoch / Mittel / Niedrig
  - Projekt-Filter: Dropdown mit allen Projekten
  - Sortierung: Neueste zuerst / Fälligkeitsdatum / Priorität / Titel A-Z

- **Projekt-Verknüpfung:**
  - Projekt-Dropdown im Edit-Modal
  - Projekt-Badge in Aufgabenliste (📁 Projektname)
  - Automatische Projektzuordnung bei aktivem Projektfilter

- **Priorisierung:**
  - Hoch (🔴 Rot), Mittel (🟡 Gelb), Niedrig (⚪ Grau)
  - Farbliche Kennzeichnung mit Icons
  - Sortierung nach Priorität möglich

- **Zuweisung & Fälligkeit:**
  - Assignee-Feld (👤 Name)
  - Due Date mit Datepicker (📅 Datum)
  - Vollständige Anzeige in Aufgabenliste

#### 📄 Export & Integration
- **PDF-Export:** Druckbare TODO-Liste
  - Checkboxen für physisches Abhaken
  - Gruppierung nach Priorität
  - Priority-Badges in Farbe (Hoch/Mittel/Niedrig)
  - Alle Task-Details (Titel, Beschreibung, Assignee, Due Date, Projekt)
  - Gurktaler 2.0 Branding mit professionellem Layout
  - Header mit Erstellungsdatum und Aufgabenanzahl

- **iCal Export (.ics):**
  - Einzelne Tasks als .ics exportieren (Button bei jedem Task)
  - Alle Tasks als eine .ics Datei exportieren (Header-Button)
  - Import in Outlook, Apple Calendar, Google Calendar möglich
  - VTODO Format mit Priorität, Status, Due Date
  - Automatische Dateinamen-Generierung

- **E-Mail-Integration:**
  - Mailto-Link bei jedem Task (📧 Icon)
  - Automatischer Betreff: "Aufgabe: [Titel]"
  - Body mit allen Details:
    - Titel und Beschreibung
    - Zuständig und Fälligkeitsdatum
    - Priorität und Status
    - Projekt-Verknüpfung

- **Google Calendar Sync (Vorbereitet):**
  - OAuth2 Login/Logout UI
  - Sync-Button für alle Tasks
  - Einzelne Tasks zu Calendar hinzufügen
  - Service-Datei implementiert (`googleCalendar.ts`)
  - Erfordert Google Cloud Projekt Setup (.env.example erstellt)
  - Optional aktivierbar mit API-Keys

### 🐛 Bugfixes
- **Projekt-Filterung:** Projekt-ID wird jetzt korrekt beim Erstellen gesetzt
- **Auto-Projektzuordnung:** Bei aktivem Projektfilter wird neues TODO automatisch zugeordnet
- **Edit-Modal:** Null-Checks für alle editingTask Felder verhindert TypeScript-Fehler

### 📝 Dokumentation
- **ROADMAP.md:** Phase 12 als abgeschlossen markiert (✅)
- **Documentation.tsx:** TODO-Feature dokumentiert
- **.env.example:** Google Calendar API Konfiguration hinzugefügt
- **Services:** Neue Dateien `taskExport.ts` und `googleCalendar.ts`

### 🎨 UI/UX Verbesserungen
- **Dashboard-Layout:** TODO-Widget prominent platziert (oben links)
- **Farbcodierung:** Prioritäten visuell klar unterscheidbar
- **Icons:** Lucide Icons für alle Aktionen (Edit, Delete, Email, Calendar, iCal)
- **Export-Buttons:** PDF (rot), iCal (lila), Google (blau/grün)

---

## [1.4.0] - 2026-01-09

### ✨ Neue Features

#### 📅 Zeitplanung - Wochengrid wiederhergestellt
- **Kalenderwochengrid:** Wöchentliche Gridlinien im Gantt-Chart
  - Helle Linien alle 7 Tage (border-slate-100)
  - Quartalslinien dunkleren Kontrast (border-slate-200)
  - Dynamische Höhenberechnung basierend auf Projektanzahl
  - Verbesserte visuelle Orientierung für präzise Projektplanung

#### 🔗 Abhängigkeiten vereinfacht
- **Einfache Abhängigkeitslogik:** "Projekt X muss abgeschlossen sein"
  - Entfernung von 4 komplexen Abhängigkeitstypen (finish-to-start, start-to-start, finish-to-finish, start-to-finish)
  - Nur noch eine Abhängigkeitsart: Standard finish-to-start
  - Vereinfachte UI ohne Typ-Dropdown
  - Label: "muss abgeschlossen sein"
  - Tooltip "Abhängigkeit entfernen" am Delete-Button für bessere UX

#### 🎨 Orange Kapazitätsfarbe
- **Neue Farbskala:** Orange statt Ocker für bessere Unterscheidung zur Legende
  - 0% = Sehr helles Orange (rgb(255, 243, 224))
  - 50% = Mittleres Orange (rgb(242, 162, 112))
  - 100% = Kräftiges dunkles Orange (rgb(230, 81, 0))
  - Gilt für App-Ansicht und PDF-Export

#### 🖱️ Doppelklick-Navigation
- **Direkter Projektzugriff:** Doppelklick auf Projektbalken in Zeitplanung
  - Navigiert direkt zur Projektdetailseite
  - useNavigate Hook für React Router Integration
  - Wiederherstellung eines Features aus früherer Version

### 📚 Dokumentation

#### 📖 Anleitungen aktualisiert (Documentation.tsx)
- **Mobile PWA Deployment:** Aktualisierte Beschreibung
  - Custom API Server Port 3002 (statt FileStation API)
  - npm run deploy:pwa mit automatischem Backup
  - Vereinfachte Installations-Anleitung ohne FileStation-Setup
  - Server-Check Befehle: check-server.ps1, start-server.ps1 -Restart
- **Zeitplanung-Features:** Neue Sektion hinzugefügt
  - Gantt-Chart mit Abhängigkeiten
  - Kapazitätsauslastung quartalsweise
  - Wochengrid und Quartalslinien
- **Roadmap:** Version 1.4.0 und abgeschlossene Phasen
  - Phase 10: Zeitplanung ✅
  - Phase 11: Kapazitätsauslastung ✅
  - Phase 12: Custom API Server ✅
  - Phase 13: Backup-System ✅

#### ⚙️ Einstellungen bereinigt (Settings.tsx)
- **Veraltete Sektion entfernt:** Synology FileStation Credentials
  - Keine localStorage-Credentials mehr benötigt
  - Custom API Server benötigt keine Authentifizierung
- **Neue Server-Info Sektion:** Custom API Server (PWA)
  - Beschreibung: Node.js Server auf Port 3002
  - Desktop nutzt Y:\ Laufwerk (direkter NAS-Zugriff)
  - Browser/Mobile nutzt Custom API Server (Port 3002)
  - Server-Prüfung: check-server.ps1
  - Server-Neustart: start-server.ps1 -Restart

### 🔧 Technische Verbesserungen
- **PDF Export:** Wochengrid und Quartalslinien durchgehend
  - Linien gehen bis zum Ende der Chart-Höhe (nicht nur -10px)
  - Konsistente Darstellung auf allen Seiten
- **GanttChart Rendering:** Explizite Höhen für Grid-Linien
  - height: ${bars.length * ROW_HEIGHT}px statt h-full
  - Container minHeight für korrekte Positionierung
  - Behebt Problem mit nicht sichtbarem Grid in EXE

### 🗑️ Entfernte Features
- Abhängigkeitstypen (start-to-start, finish-to-finish, start-to-finish)
- Synology FileStation Credentials UI in Settings
- localStorage synology_username/synology_password Verwaltung

### 📁 Geänderte Dateien
- src/renderer/components/GanttChart.tsx: +Wochengrid, +Orange-Farbskala, Höhenberechnung
- src/renderer/components/ProjectTimelineForm.tsx: Vereinfachte Dependencies, Tooltip
- src/renderer/services/timelineExport.ts: +Orange-Farbskala, durchgehende Gridlinien
- src/renderer/pages/ProjectTimeline.tsx: +useNavigate, handleProjectClick Navigation
- src/renderer/pages/Documentation.tsx: Aktualisierte Beschreibungen (Port 3002, Deployment, Roadmap)
- src/renderer/pages/Settings.tsx: Entfernte FileStation-Sektion, +Custom API Server Info

---

## [1.3.0] - 2026-01-08

### ✨ Neue Features

#### 📊 Kapazitätsauslastung - Quartalsweise Ressourcenplanung
- **Kapazitäts-Visualisierung:** Neue Timeline-Funktion zur Personalplanung
  - Quartalsweise Eingabe von Kapazitätsprozentsätzen (Q1/26 - Q4/28, 3 Jahre = 12 Quartale)
  - Settings-Modal mit übersichtlichem Grid-Layout (2-4 Spalten responsive)
  - Checkbox "Kapazitätsauslastung anzeigen" zum Ein-/Ausblenden
  - BarChart3-Icon für schnellen Zugriff auf Einstellungen
- **Farbskala:** Ocker-Gradient zeigt Auslastungsintensität
  - 0% = Sehr helles Ocker/Beige (rgb(248, 244, 232))
  - 50% = Mittleres Ocker (rgb(193, 177, 151))
  - 100% = Dunkles Ocker/Braun (rgb(139, 111, 71))
  - Prozentanzeige in jedem Quartalssegment
- **App-Integration:**
  - Kapazitätsbalken unter Gantt-Chart-Projekten
  - Automatische Quartalsaufteilung synchron zur Timeline
  - Hover-Tooltips mit Quartal und Prozentsatz
- **PDF-Export:**
  - Kapazitätsbalken nach Legende, vor Projekt-Details
  - Quartalsweise farbige Segmente mit Prozentwerten
  - Identische Farbgebung wie in App-Ansicht
- **Datenhaltung:**
  - Neue Datei: database/capacity.json (global für alle Projekte)
  - API: storage.capacity.get() und storage.capacity.update()
  - Nicht projekt-spezifisch, sondern Timeline-weit
- **Typisierung:**
  - CapacityQuarter: { quarter: string, percentage: number }
  - CapacityUtilization: { enabled: boolean, quarters: CapacityQuarter[] }

### 🐛 Bugfixes
- **HTML-Struktur:** Checkbox "Kapazitätsauslastung anzeigen" aus <select> verschoben (ungültige Verschachtelung)
- **Null-Safety:** Optional chaining für capacity.quarters (prevents "Cannot read properties of undefined")
  - handlePercentageChange: (capacity.quarters || []).find()
  - getPercentage: capacity.quarters?.find()
  - handleSave: (capacity.quarters || []).filter()
- **SVG-Pfade:** viewBox für Dependency-Arrows (behebt "Expected number" Fehler)
  - Entfernte %-Zeichen aus Pfad-Koordinaten
  - viewBox="0 0 100 ${CHART_HEIGHT}" mit preserveAspectRatio="none"
  - Angepasste strokeWidth (0.3) und strokeDasharray (1,1)
- **Quartalslabels:** Einheitliches Format "Q1/26" statt gemischt "Q1 2026" / "Q1/26"
  - GanttChart und CapacitySettingsModal verwenden identisches Format
  - Ermöglicht korrekte Zuordnung gespeicherter Werte

### 📁 Neue Dateien
- src/renderer/components/CapacitySettingsModal.tsx (159 Zeilen)
- database/capacity.json

### 🔧 Geänderte Dateien
- src/shared/types/index.ts: +CapacityQuarter, +CapacityUtilization
- src/renderer/services/storage.ts: +capacity.get/update API
- src/renderer/pages/ProjectTimeline.tsx: +Checkbox, +Settings-Button, +Modal-State
- src/renderer/components/GanttChart.tsx: +Kapazitätsbalken-Rendering, SVG viewBox Fix
- src/renderer/services/timelineExport.ts: +PDF-Kapazitätsbalken mit Ocker-Farbskala

---

## [Unveröffentlicht]

### ✨ Neue Features

#### 🖼️ Bildergalerie
- **Zentrale Bildverwaltung:** Neue Galerie-Seite mit Sidebar-Button
  - Übersicht aller Bilder aus allen Kategorien (Projekte, Produkte, Rezepturen, Zutaten, Gebinde, Kontakte, Notizen)
  - Drag-and-Drop Upload (Desktop) + Button-Upload (Mobile)
  - Responsive Grid-Ansicht (2-5 Spalten je nach Bildschirmgröße)
  - Hover-Effekte mit Edit/Delete Buttons
- **Filter & Suche:**
  - Filter nach Kategorie (Projekt/Produkt/Rezeptur/etc)
  - Filter nach Tags
  - Volltext-Suche (Dateiname + Beschreibung)
  - "Filter zurücksetzen" Button
- **Bearbeitungs-Modal:**
  - Beschreibung hinzufügen/bearbeiten
  - Kategorie ändern (entityType)
  - Entity-ID ändern (Zuordnung zu anderer Entität)
  - Tags hinzufügen/entfernen über Dropdown
  - Visuelles Tag-Management mit farbigen Badges
- **Gallery Service Layer:** `gallery.ts` mit erweiterten Metadaten-Funktionen
  - `getAllGalleryImages()` - Alle Bilder mit aufgelösten Tags
  - `getFilteredImages()` - Gefilterte Bildliste
  - `uploadToGallery()` - Direkter Upload ohne Entity-Zuordnung
  - `updateImageMetadata()` - Nachträgliche Metadaten-Änderung
  - `addTagToImage()` / `removeTagFromImage()` - Tag-Verwaltung

#### 🤖 KI-Assistent Modell-Updates
- **GPT-4o:** Hauptmodell von `gpt-4-turbo-preview` auf neuestes `gpt-4o` aktualisiert
- **GPT-4o-mini:** Günstigeres Modell zu Auswahlliste hinzugefügt
- **Modell-Array:** `['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']`

### 🐛 Fieldtest Bugfixes

#### KRITISCH: Zutaten anlegen nicht möglich
- **Bug:** Nach Create-Operation fehlte die `documents`-Property im formData State
- **Fix:** `documents: newIngredient.documents || []` in Ingredients.tsx Line 127 hinzugefügt
- **Impact:** Rezept-Erstellung war komplett blockiert

#### Tag-Beschriftung: Kontrast bei hellen Farben
- **Problem:** Weiße Text-Farbe auf gelben/hellen Tags kaum lesbar
- **Lösung:** Luminanz-basierte Textfarbe mit WCAG-Berechnung
  - Formel: `(0.299*R + 0.587*G + 0.114*B) / 255`
  - Threshold: 0.5 (schwarz für luminance > 0.5, weiß für <= 0.5)
- **Komponenten:** TagBadgeList.tsx, TagSelector.tsx, Notes.tsx

#### PWA Speicher-Feedback
- **Problem:** Keine visuelle Bestätigung nach Save-Operationen (lange NAS-Sync)
- **Lösung:** Toast-Component mit Auto-Dismiss
  - Types: success, error, info
  - Dauer: 3000ms (konfigurierbar)
  - Position: fixed bottom-4 right-4
  - Animation: slide-up (bestehende CSS Keyframes)
- **Integration:** Ingredients.tsx mit Success-Messages bei Create/Update

#### Notizen: Formatierung in Vorschau
- **Problem:** Markdown-Zeilenumbrüche und Absätze wurden nicht korrekt dargestellt
- **Ursprüngliche Lösung:** remarkBreaks Plugin (später entfernt wegen fehlender Dependency)
- **Status:** ReactMarkdown ohne Plugins (Standard-Rendering)

#### URL zu Notizen hinzufügen
- **Feature:** Optional URL-Feld für externe Ressourcen-Verknüpfung
- **Schema:** `url?: string` Property zu Note Interface hinzugefügt
- **UI:** 
  - Input-Feld (type="url") in NoteForm mit Validation
  - ExternalLink-Icon mit klickbarem Link in Notes-Karten
  - Hilfetext: "Verknüpfe eine Website oder Ressource mit dieser Notiz"

#### Bilderupload: Alle Kategorien
- **Problem:** ContactForm hatte keine ImageUpload-Komponente
- **Fix:** ImageUpload zu ContactForm.tsx hinzugefügt (maxImages: 3)
- **Typen:** `Image.entity_type` erweitert um `'contact'`

#### Kontakte: Custom Kategorien
- **Problem:** Fixe Typen (Lieferant/Partner/Kunde) zu limitierend
- **Lösung:** Tags-System für Contacts aktiviert
  - TagSelector zu ContactForm hinzugefügt
  - Hilfetext: "Nutze Tags um eigene Kategorien über die Standard-Typen hinaus zu definieren"
  - entityType in TagSelector/TagBadgeList erweitert um `'contact'`

### 🔧 Technische Verbesserungen

#### Type System Updates
- **TagAssignment.entity_type:** Erweitert um `'contact'` und `'image'`
- **Image.entity_type:** Erweitert um `'contact'`
- **Konsistenz:** Alle Tag-fähigen Komponenten unterstützen jetzt einheitliche Entity-Types

#### Imports Cleanup
- **remark-breaks:** Komplett entfernt (Package nicht installiert)
  - Aus Notes.tsx, NoteForm.tsx entfernt
  - ReactMarkdown nutzt Standard-Rendering
- **Ungenutzte Imports:** Bereinigt in Gallery.tsx und GalleryImageModal.tsx

#### Service Layer
- **tagAssignments:** Keine `assign()`/`unassign()` Methoden
  - Gallery Service nutzt `create()` mit korrekter Struktur
  - `removeTagFromImage()` nutzt `getByEntity()` + `delete()`

### 🔧 Technische Verbesserungen (Vorherige Version)

#### Desktop-EXE Port-Fix
- **Electron Server Port:** Geändert von 58888/58889 auf Port 3456
  - Behebt Permission-Denied-Fehler unter Windows
  - Ports 58888/58889 waren von anderen Diensten blockiert
  - Desktop-EXE startet jetzt fehlerfrei

#### Server Status Indicator (PWA)
- **Live-Verbindungsanzeige:** Neuer visueller Indikator in der Browser-Version
  - Zeigt NAS-Server-Status an (Online/Offline/Prüfend)
  - Automatische Prüfung alle 30 Sekunden
  - Mobile: Icon-Button im Header (rechts oben)
  - Desktop: Voller Status-Display in Sidebar-Footer
  - Farbcodiert: 🟢 Grün (online), 🔴 Rot (offline), 🟡 Gelb (prüfend)
  - Hover zeigt Zeitpunkt der letzten Prüfung
  - Nur in Browser-Modus sichtbar (nicht in Desktop-EXE)

#### Storage Provider Improvements
- **CustomApiStorageProvider:**
  - `listFiles()` gibt leeres Array zurück statt Fehler zu werfen
  - `deleteFile()` vollständig implementiert mit DELETE-Endpunkt
  - Ermöglicht erfolgreiche Setup-Tests

#### PWA Manifest Fixes
- **Icon-Pfade korrigiert:** Alle Pfade mit `/gurktaler/` Präfix versehen
  - `start_url: "/gurktaler/"`
  - Icon-Pfade: `/gurktaler/icon-192.png`, `/gurktaler/icon-512.png`
  - Shortcut-URLs: `/gurktaler/notes`, `/gurktaler/recipes`, etc.
  - Behebt 404-Fehler für PWA-Icons

#### NAS-Server Deployment
- **API-Server auf Synology NAS:** Node.js Server auf Port 3002 (localhost)
  - DELETE-Endpunkt hinzugefügt (zusätzlich zu GET/POST)
  - Vollständige CORS-Header für alle Methoden
  - Nginx Reverse Proxy auf Port 8080 (umgeht Web Station Konflikte)
  - Task Scheduler für Auto-Start bei Boot konfiguriert
- **Datensynchronisation:** Desktop-EXE und PWA teilen zentrale Datenbank
  - Desktop: Y:\zweipunktnull\database\ (Netzwerk-Share)
  - NAS: /volume1/Gurktaler/zweipunktnull/database/
  - Bidirektionale Synchronisation verifiziert

### 📝 Dokumentation
- **SYNOLOGY_SERVER_SETUP.md:** Vollständige Anleitung für NAS-Deployment
  - Nginx Konfiguration auf Port 8080
  - Node.js Server Setup mit Task Scheduler
  - CORS-Troubleshooting Guide

---

## [1.2.0] - 2026-01-02 🎉

### ✨ Neue Features

#### Gantt-Chart Projektzeitplanung
- **Projekt-Timeline-Verwaltung:** Projekte können mit Zeitplanung versehen werden
  - Startdatum und Dauer in Wochen
  - Team-Zuordnung aus Kontakten
  - Projektabhängigkeiten (4 Typen: finish-to-start, start-to-start, finish-to-finish, start-to-finish)
  - Meilensteine mit Datum und Completion-Status
  - Fortschrittsanzeige 0-100%
- **Interaktive Gantt-Ansicht:**
  - Quartalsweise Timeline-Darstellung (1-3 Jahre wählbar)
  - Projekt-Balken mit individuellen Farben (3px dicker Rahmen)
  - Fortschrittsanzeige als Überlagerung
  - Projektnamen über dem Balken positioniert
  - Drag & Drop zum Ändern der Anzeigereihenfolge
  - Doppelklick auf Balken öffnet Projektkarte (vorbereitet)
  - Rich Hover-Tooltip mit allen Projektdetails, Team, Abhängigkeiten, Meilensteinen
  - Meilenstein-Dreiecke mit Completion-Status
  - Dependency-Pfeile zwischen Projekten (farbcodiert)
- **PDF-Export:** Gantt-Chart als Landscape A4 PDF exportieren
- **Navigation:** Neuer Menüpunkt "Zeitplanung" mit Calendar-Icon

#### Verbesserte Card-Layouts
- **Neue 3-Ebenen-Struktur für alle Cards:**
  - Titel ganz oben in eigener Section
  - Action-Buttons (Status/Type + Icons) in separater Zeile
  - Content mit Thumbnail unten
- **Vorteile:**
  - Titel wird nicht mehr von Icons verdeckt
  - Vollständiger Titel sichtbar (break-words statt truncate)
  - Übersichtlichere, einheitliche Darstellung
- **Betrifft alle Kategorien:** Projects, Products, Recipes, Ingredients, Containers

#### Bild-Upload Button
- Neuer "Bild"-Button in allen Card-Footern
- Einheitlich neben URL- und Dokument-Buttons
- Öffnet Edit-Formular für Bild-Upload
- Verfügbar für: Projects, Products, Ingredients, Containers

### 🐛 Bug-Fixes

#### Gantt-Chart Verbesserungen
- Doppelte Tooltip-Anzeige behoben (title-Attribut entfernt)
- Projektname-Positionierung optimiert (top: -8px)
- Ungenutzte Variable entfernt

### 📚 Abhängigkeiten

#### Hinzugefügt
- `jspdf@^2.5.2` - PDF-Export für Gantt-Charts

---

## [1.1.1] - 2026-01-01 🐛

### 🐛 Kritischer Bug-Fix

#### Desktop-EXE startet mit leerem Fenster - GEFIXT
- **Problem:** Production Build lud Assets mit falschem `/gurktaler/` Prefix
- **Root Cause:** Vite `base` Pfad vermischte Desktop- und PWA-Anforderungen
- **Lösung:** Separate Build-Prozesse mit unterschiedlichen base-Pfaden

### ✨ Neue Features

#### Separate Build-System für Desktop & PWA
- **`npm run build:desktop`** - Erstellt EXE mit Root-Pfaden (`/assets/...`)
- **`npm run build:pwa`** - Erstellt PWA mit Subdir-Pfaden (`/gurktaler/assets/...`)
- **`npm run build:all`** - Beide Builds nacheinander
- **`npm run deploy:pwa`** - Build + automatischer Upload zum NAS
- **Environment Variable:** `VITE_BASE_PATH` steuert Asset-Pfade

### 🔧 Technische Details

#### Änderungen
- **vite.config.ts:** `base` nutzt jetzt `process.env.VITE_BASE_PATH`
- **package.json:** Neue Scripts mit `cross-env` für plattformübergreifende Env-Vars
- **Build-Output:** Desktop → `build-output/`, PWA → `dist/`

#### Bestätigte Fixes
- ✅ Desktop-EXE lädt korrekt (`/assets/index-xxx.js`)
- ✅ PWA lädt korrekt (`/gurktaler/assets/index-xxx.js`)
- ✅ Beide Plattformen funktionieren unabhängig
- ✅ Tailscale-Konfiguration unverändert
- ✅ Keine Änderungen am Backend (nginx, Node.js API, NAS-Zugriff)

### 📚 Dokumentation
- README.md: Build-Scripts Sektion hinzugefügt
- ROADMAP.md: Phase 9 abgeschlossen, Phase 11 (Server-Status UI) geplant
- Documentation.tsx: Build-Prozess Anleitung ergänzt

---

### 🛠️ Verwaltung & Automatisierung
- **start-server.ps1**: SSH-basierte Remote-Server-Steuerung
  - Status-Abfrage mit Log-Ausgabe
  - Start, Restart, Stop Funktionen
  - Automatische PID-Erkennung
  - API-Endpoint-Test nach Start
- **check-server.ps1**: Schneller Server-Status-Check via HTTP
- **deploy-pwa.ps1**: Automatisiertes Deployment mit Hash-basierter Änderungserkennung

### 📚 Dokumentation
- **In-App "Anleitungen"**: Neue "Mobile PWA" Sektion mit:
  - Installations-Anleitung (Android/iOS)
  - Erste Schritte
  - Schreib-Operationen testen
  - Troubleshooting-Tipps
- **MOBILE_API.md**: Erweitert um Automatisierungs-Scripts
- **README.md**: Server-Management Sektion mit Remote-Steuerung

---

## [1.1.0] - 2025-12-26 📱

### ✨ Neu

#### 📱 Mobile PWA - Vollständige Schreibfunktion
- **Custom Node.js API Server**: Bypassed defekte Synology FileStation Upload API
  - Port 3001 (localhost only), Zero Dependencies
  - Endpoints: `GET/POST /api/json?path=<file>`
  - Direkter Filesystem-Zugriff via fs.promises
  - Auto-Directory-Creation
- **CustomApiStorageProvider**: Neue StorageProvider-Implementierung
  - fetch()-basiert für Browser-Kontext
  - Same-Origin `/api/` Requests (kein CORS)
  - Platform-Detection: Electron = Y:\\ Drive, Browser = Custom API
- **nginx Reverse Proxy**: `/api/` → `http://127.0.0.1:3001`
- **Vite Config**: `base: '/gurktaler/'` für korrekte Asset-Pfade
- **Vollständige CRUD-Operationen** auf Mobile/Tablet
- **QuickNote-Button** funktioniert jetzt auch mobil
- **Automatische Synchronisation** mit Desktop-App via NAS

### 🐛 Bugfixes
- **PWA Asset Loading**: Korrektur der base-Path-Konfiguration
- **Service Worker Caching**: Dokumentierte Workarounds für hartnäckiges Caching

### 📚 Dokumentation
- **docs/MOBILE_API.md**: Vollständige Custom API Dokumentation
  - Architektur-Übersicht
  - Setup-Anleitung
  - Troubleshooting Guide
- **README.md**: Mobile PWA Setup-Sektion hinzugefügt
  - Server-Start Anleitung
  - Troubleshooting
  - Feature-Übersicht

### 🔧 Technische Details
- **FileStation Upload API Problem**: Diagnostiziert als defekt (hängt indefinitely)
- **Lösung**: Eigener API-Server umgeht alle Synology-APIs komplett
- **Security**: Server nur auf localhost exposed, nginx proxied requests

---

## [1.0.0] - 2025-12-21 🎉

### 🎊 PRODUCTION RELEASE

**Gurktaler 2.0 erreicht Version 1.0.0** - Alle Kern-Features implementiert und stabil!

### ✨ Neu

#### 🔄 Rezepturen-Versionierung (Final)
- **Version-Feld in RecipeForm**: Benutzer kann Version manuell eingeben oder leer lassen
- **Auto-Versionierung**: Neue Rezepturen erhalten automatisch Version "1.0" wenn leer
- **Auto-Inkrement**: Abgeleitete Versionen werden automatisch inkrementiert (1.0 → 1.1 → 1.2)
- **Datenübernahme**: GitBranch-Button übernimmt alle Daten der Basis-Rezeptur
- **Version-Badges**: RecipeCard zeigt 3 Badges:
  - Typ-Badge (Mazerat/Destillat/Ausmischung) - immer sichtbar
  - Version-Badge (z.B. "v1.1") - wenn Version gesetzt
  - Ableitungs-Badge ("Abgeleitet" mit GitBranch-Icon) - wenn parent_id existiert
- **Hybrid UI**: Expandierbare Zutatenliste in RecipeCard (Klick auf "X Zutaten")

### 📚 Dokumentation

- **README.md**: Vollständig aktualisiert mit Rezepturen-Workflow
- **ROADMAP.md**: Phase 10 (v1.0.0) als erledigt markiert
- **Anleitungssektion**: Ausführliche Beschreibung des Rezepturen-Workflows:
  - Neue Rezeptur erstellen
  - Zutaten hinzufügen
  - Zutatenliste anzeigen (expandierbar)
  - Rezeptur versionieren (mit Datenübernahme)
  - Bilder & Tags verwalten
  - Kalkulation nutzen
  - Quick-Add Funktionen
  - Favoriten & Suche

### 🎯 Status

Alle Features der Roadmap Phase 1-10 implementiert:
- ✅ Projekt-Verwaltung mit Status-Tracking
- ✅ Produkt-Versionierung (hierarchisch)
- ✅ Rezeptur-Verwaltung mit Versionierung
- ✅ Zutaten-DB mit Gebinde-Management
- ✅ Rezeptur-Kalkulation (Volumen, Alkohol%, Kosten)
- ✅ Notizen mit Markdown-Editor
- ✅ Kontakte mit vCard-Import
- ✅ Weblinks & Recherche
- ✅ Tag-System mit Inline-Editing
- ✅ Favoriten-System
- ✅ Global Search über alle Entitäten
- ✅ Git-Integration (Auto-Commit/Push/Pull)
- ✅ Bild-Upload (Base64)
- ✅ Excel-Import/Export
- ✅ Windows Installer (NSIS)

---

## [0.9.3] - 2025-12-11

### 🔥 KRITISCHE BUGFIXES

#### Datenverlust bei App-Neustart behoben
- **ROOT CAUSE**: LocalStorage ist Origin-basiert (Protocol + Host + Port)
  - Production-Server verwendete Random-Port (listen(0))
  - Bei jedem App-Start: Neuer Port → Neue Origin → LEERER LocalStorage
  - Beispiel: localhost:52795 → localhost:63315 → ALLE DATEN VERLOREN
- **LÖSUNG**: Fester Port 58888 in Production
  - Immer gleiche Origin: http://localhost:58888
  - Partition 'persist:gurktaler' bleibt aktiv
  - LocalStorage jetzt persistent über App-Neustarts
- **IMPACT**: Kritischer Fix - App jetzt produktionsreif
  - Projekte, Produkte, Rezepte überleben Neustart
  - Keine Datenverluste mehr bei geschlossener App

### Neu

#### 📋 Production Logging
- Console-Logs werden in Log-Datei geschrieben
- Log-Pfad: `%APPDATA%\Gurktaler-2.0\logs\gurktaler-YYYY-MM-DD.log`
- IPC-Handler `logs:open` öffnet Log-Verzeichnis
- Tägliche Log-Rotation (Datum im Dateinamen)
- Main-Process-Logs: Server-Start, userData-Path, Fehler
- Debugging von Production-Builds möglich

### Technische Details

- **Electron**: Fester Port 58888 statt Random-Port
- **Logging**: fs.appendFileSync für Production-Logs
- **IPC**: Neuer Handler `logs:open` für Explorer-Zugriff

---

## [0.9.2] - 2025-12-07

### Neu

#### 📄 Dokumentenverwaltung für alle Entitäten
- **DocumentManager Komponente**: Universelles Modal-UI für Dokumente
  - 3 Dokumenttypen: Lokale Dateien, URL-Links, Google Photos
  - 6 Kategorien: Rezeptur, Analyse, Marketing, Etikett, Dokumentation, Sonstiges
  - Dateiauswahl mit Metadaten-Extraktion (Name, Größe, MIME-Type)
  - Relative Pfade für Portabilität zwischen Geräten
  - Thumbnail-Support für Bilder
- **Unterstützte Dateitypen**:
  - Dokumente: PDF, Word (DOCX), Excel (XLSX), Text (TXT)
  - Bilder: JPG, PNG, WEBP, GIF, BMP
  - Farbcodierte Icons: Rot (PDF), Grün (Excel), Blau (Word), Lila (Bilder)
- **Datei-Operationen**:
  - Öffnen mit System-App (shell.openPath)
  - Im Explorer anzeigen (shell.showItemInFolder)
  - Existenz-Validierung vor Öffnen
  - Löschen der Dokumentreferenz (Datei bleibt erhalten)
- **Integration in allen Entitäten**:
  - Projekte: ProductForm.tsx
  - Produkte: ProjectForm.tsx
  - Rezepte: RecipeForm.tsx
  - Zutaten: Ingredients.tsx (Inline-Form)
  - Gebinde: Containers.tsx (Inline-Form)
  - Kontakte: ContactForm.tsx
- **Electron IPC Handler**:
  - file:select - Dateiauswahl-Dialog mit Metadaten
  - file:open - Öffnet Datei mit Standard-App
  - file:show - Zeigt Datei im Explorer
  - file:exists - Validiert Dateipfad
- **Storage-Strategie**:
  - Hybrid: Base64 für Bilder (mobile Kompatibilität)
  - Relative Pfade für Dokumente (Desktop-Optimierung)
  - Automatische Persistenz via storage.ts
- **User Guide**: Vollständige Dokumentation in Documentation.tsx
  - 4 How-To Anleitungen (Lokale Datei, URL, Google Photos, Verwalten)
  - 7 Tipps für optimale Nutzung
  - Google Photos Caveat dokumentiert

### Behoben
- **Form-Submission**: Alle Buttons in DocumentManager haben `type="button"` gegen versehentliches Absenden
- **Git-Commit-Escaping**: Doppelte Backslash- und Quote-Escapes für Sonderzeichen in Commit-Messages
- **Duplikate**: Entfernte doppelte State-Deklarationen in ProjectForm und ContactForm
- **TypeScript**: Alle Compilation-Fehler behoben

### Technisch
- Document Interface mit 8 Feldern (type, path, name, category, description, mime_type, file_size, thumbnail)
- DocumentType: 'file' | 'url' | 'google-photos'
- DocumentCategory: 6 vordefinierte Kategorien
- Alle 6 Entity Interfaces erweitert mit `documents?: Document[]`
- Preload-Whitelist erweitert um file:* Channels
- MIME-Type-Detection für gängige Formate
- Path-Normalisierung mit path.relative() von Projekt-Root

---

## [0.9.1] - 2025-12-06

### Geändert
- **Production Build System**: Komplette Überarbeitung für funktionierende EXE
  - Minimaler HTTP Server ersetzt file:// Protokoll für ES Module Support
  - Client-Side Routing Fallback für Single Page Application
  - ASAR deaktiviert für bessere Kompatibilität
  - Express und serve-handler Dependencies hinzugefügt
- **Build-Konfiguration**: `build-output/` Verzeichnis für bessere Trennung

### Behoben
- ES Module Loading in Production Build
- 404 Fehler bei React Router Navigation
- DevTools Console nicht sichtbar in packaged App

---

## [0.9.0] - 2025-11-30

### Neu

#### 🌿 Rezeptur-Versionierung (Phase 4 komplett)
- **parent_id & version**: Recipe Interface erweitert für Versionierungs-Support
- **Tree-View**: Hierarchische Darstellung wie bei Produkten
  - Root-Rezeptur zeigt alle Versionen darunter
  - Eingerücktes Layout für Versionshistorie
  - Jede Version kann selbst wieder versioniert werden
- **Versionierungs-Button**: GitBranch Icon erstellt neue Version mit parent_id Link
- **Automatische Kalkulation**: RecipeCalculator Komponente
  - Gesamtvolumen mit Unit-Conversion (ml/l/g/kg/TL/EL)
  - Gewichteter Durchschnitts-Alkoholgehalt
  - Materialkosten gesamt + pro Liter (wenn Ausbeute angegeben)
  - Distillery Modern Styling mit Droplet/Euro Icons
- **Suche & Filter**: Berücksichtigt Root-Rezepturen + alle Versionen
- **Favoriten**: Individuell für jede Version
- **Tags**: Anzeige und Filter für Rezepturen und Versionen

### Geändert

#### 📝 Recipes.tsx
- Von Grid-Layout zu Tree-View-Struktur umgestellt
- Modal-Titel dynamisch: "Neue Version: [Name]" bei Versionierung
- Vintage Borders und gurktaler/bronze Farben durchgehend
- Version-Badge mit "v" Präfix wenn vorhanden

#### 🧮 RecipeForm.tsx
- RecipeCalculator nach RecipeIngredientEditor integriert
- Nur im Edit-Modus sichtbar (wenn recipe existiert)
- Props: recipeId, yieldAmount, yieldUnit

### Technisch

- **Erweitert**:
  - `Recipe` Interface: `parent_id?: string`, `version?: string`
  - `buildRecipeTree()`: Erstellt hierarchische Struktur
  - `handleCreateVersion()`: Kopiert Rezeptur mit parent_id Link
- **Neue Komponente**:
  - `RecipeCalculator.tsx`: ~180 Zeilen mit Unit-Conversion & Kalkulation

---

## [0.8.0] - 2025-11-30

### Neu

#### 🔄 Git-Integration & Automatischer Sync
- **Git-Service**: Vollständige Integration für Git-Operationen (status, commit, push, pull)
- **Auto-Commit**: Automatische Commits bei Datenänderungen (create/update/delete)
- **Auto-Push**: Optionaler automatischer Push nach Commit
- **Git-Status UI**: Echtzeit-Anzeige in Settings
  - Aktueller Branch und letzter Commit
  - Anzahl uncommitted changes
  - Letzte Commit-Message mit Author und Timestamp
- **Manual Sync**: Push/Pull Buttons in Settings für manuellen Sync
- **Konfigurierbar**: Toggle für Auto-Commit, Auto-Push, Custom Commit-Prefix

#### 🔧 Electron IPC Erweiterung
- Neues `window.electron.invoke()` API für flexiblere Backend-Kommunikation
- Git-Handler im Electron Main Process mit `child_process.execSync()`
- TypeScript-Definitionen für IPC-Channels

### Geändert

#### 📦 Storage Service
- Auto-Commit Hook in `createEntity()`, `updateEntity()`, `deleteEntity()`
- Entity-Namen werden aus `name` oder `title` extrahiert für aussagekräftige Commit-Messages

#### ⚙️ Settings-Seite
- Git-Integration Sektion mit Status-Anzeige
- Refresh-Button für Git-Status
- Konfiguration für Auto-Commit/Push
- Error-Handling für fehlgeschlagene Git-Operationen

### Technisch
- **Neue Dateien**:
  - `src/renderer/services/git.ts` - Git-Service mit allen Operationen
  - `src/renderer/types/electron.d.ts` - TypeScript Definitionen
- **Dependencies**: Keine neuen (nutzt Node.js `child_process`)
- **IPC-Channels**: `git:status`, `git:commit`, `git:push`, `git:pull`

---

## [Unreleased]

### Geplant

- Kostenrechnung pro Produkt inkl. Gebinde- und Zutatenkalkulation
- Volltext-Suche über alle Bereiche
- Git-Integration für automatischen Sync
- Google Contacts OAuth Integration (Live-Sync)
- Android-PWA

---

## [0.7.0] - 2025-11-30

### Hinzugefügt

- **Distillery Modern Design System - Komplette UI-Überarbeitung**:
  - Neue Farbpalette: Copper (#B87333), Steel (#4A6363), Bronze (#CD7F32)
  - Warmer Cream-Hintergrund (#F8F6F3) für vintage Look
  - Google Fonts Integration: Playfair Display (Serif-Überschriften), Source Sans Pro (Body)
  - Custom Tailwind Extensions:
    - Farbskalen: gurktaler (50-900), distillery (50-900), bronze (50-900)
    - rounded-vintage (12px), border-vintage (2px)
    - font-heading, font-body
    - shadow-vintage, shadow-vintage-lg mit Copper-Tönung
  - Copper-themed Scrollbar
  - Gradient Header im Sidebar (copper)
  - Logo mit white backdrop blur und vintage Border
- **Excel-Import/Export für Zutaten**:
  - Template-Generator mit Beispiel-Daten (Download-Button)
  - Excel-Parser für .xlsx/.xls Dateien
  - Import-Dialog mit Live-Validierung:
    - Statistik-Cards: Gültig (grün), Duplikate (bronze), Fehler (rot)
    - Selektive Auswahl (einzeln oder alle)
    - Duplikat-Management: Überspringen oder Überschreiben
    - Fehlerhafte Einträge mit Zeilennummer und Details
  - Validierung:
    - Name (Pflichtfeld)
    - Alkoholgehalt 0-100%
    - Keine negativen Werte (Kosten, Lagerbestand)
  - Export-Funktion für alle vorhandenen Zutaten
  - Template-Spalten: Name*, Kategorie, Alkoholgehalt, Lieferant, Kosten, Lagerbestand, Lagereinheit, Mindestbestand, Notizen
- **Excel-Import/Export für Gebinde**:
  - Gleiche Funktionalität wie Zutaten-Import
  - Template mit 4 Beispielen (Flasche, Etikett, Verschluss, Verpackung)
  - Typ-Mapping: bottle/Flasche, label/Etikett, cap/Verschluss, box/Verpackung, other/Sonstiges
  - Template-Spalten: Name*, Typ, Volumen (ml), Preis pro Stück, Lieferant, Lagerbestand, Notizen
  - Validierung: Name, keine negativen Werte
  - Export-Funktion für alle vorhandenen Gebinde
- **UI-Komponenten**:
  - IngredientImportDialog.tsx - Import-Dialog für Zutaten
  - ContainerImportDialog.tsx - Import-Dialog für Gebinde
  - Distillery Modern Design durchgehend in allen Dialogen

### Geändert

- **Komplettes Design-Refresh aller Seiten**:
  - Dashboard: Vintage Cards, größere Icons, copper Buttons
  - Projects: Status-Colors auf vintage Palette, shadow-vintage
  - Products: Version-Badges mit distillery Colors
  - Notes: Type-Colors (bronze/gurktaler/green/distillery), Quick-Entry vintage
  - Recipes: Type-Colors auf distillery Palette
  - Contacts: Type-Colors mit vintage Borders
  - Research: Type-Colors aktualisiert
  - Tags: Copper Buttons, vintage Form-Card
  - GlobalSearch: Type-Colors harmonisiert, vintage Search-Input
  - Settings: Section-Cards mit vintage Styling
  - Ingredients: Header mit Template/Export/Import-Buttons, vintage Search
  - Containers: Header mit Template/Export/Import-Buttons, vintage Search
  - Layout/Sidebar: Gradient copper Header, vintage Navigation
  - Modal: Vintage Borders und copper hover-states

### Technisch

- Neue Dependencies:
  - xlsx ^0.18.5 für Excel-Verarbeitung
- Neue Services:
  - `ingredientImport.ts` - Excel-Import/Export für Zutaten
  - `containerImport.ts` - Excel-Import/Export für Gebinde
- Tailwind Config erweitert mit custom Design-Tokens
- index.html: Google Fonts Preconnect
- index.css: Root-Styling, Scrollbar, Custom Shadow-Klassen

### Verbessert

- Konsistente Typografie: Playfair Display für alle Überschriften
- Harmonisierte Farbverwendung über alle Komponenten
- Einheitliche Border-Radien (12px) und Border-Stärken (2px)
- Copper-Schatten für visuelle Tiefe
- Verbesserte Hover-States mit gurktaler-50 Background
- Button-Hierarchie: Primary (copper), Secondary (distillery), Tertiary (bronze)

---

## [0.6.0] - 2024-11-29

### Hinzugefügt

- **Rezeptur-Verwaltung - Phase 4 komplett**:
  - Zutatendatenbank mit Name, Alkoholgehalt (% vol.), Kategorie, Preis pro Einheit (Liter/Kg), Bemerkung
  - Gebindedatenbank für Flaschen, Etiketten, Verschlüsse, Kartons mit Typ, Volumen (ml), Preis, Bemerkung
  - Rezeptur-Editor mit vollständiger Zutatenverwaltung:
    - Mazerate, Destillate & Ausmischungen als Typen
    - Zutatenliste mit Menge, Einheit, Notiz und Sortierung
    - Anleitung/Herstellungsschritte als Textfeld
    - Ausbeute (Yield) mit Menge und Einheit
    - Optionale Verknüpfung mit Produkten
  - RecipeIngredient Junction-Table für M:N-Beziehung mit sort_order
  - Container-Auswahl im ProductForm mit Auto-Fill der Gebindegröße
  - Alkoholsteuerberechnung im ProductForm:
    - Automatische Berechnung: 12 € pro Liter reinem Alkohol
    - Live-Anzeige des Steuerbetrags
    - Checkbox zur Berücksichtigung in der Preisfindung
    - Gespeichert als `include_alcohol_tax` und `alcohol_tax_amount`
  - Neue Sidebar-Navigation: "Zutaten" und "Gebinde"
  - Vollständige CRUD-Operationen für Ingredients, Containers, Recipes und RecipeIngredients
  - Type-Definition Extensions: Product, Ingredient, Container, Image (entity_type)
  - calculateAlcoholTax() Utility-Funktion in shared/types
- **Tag-Filter erweitert**:
  - Tag-Filter zu Rezepturen-Seite hinzugefügt
  - Tag-Filter zu Gebinde-Seite hinzugefügt
  - Tag-Filter zu Zutaten-Seite hinzugefügt
  - Konsistente Tag-Filter-UI in allen Bereichen (Projekte, Produkte, Notizen, Rezepturen, Gebinde, Zutaten)
- **Bildergalerie für Gebinde**:
  - Gebinde-Cards zeigen Bilder in kompakter Galerie (bis zu 3 Bilder)
  - Automatisches Laden der Bilder beim Start
- **URL-basierter Bild-Import**:
  - "Bild von URL einfügen" Button in ImageUpload-Komponente
  - Unterstützung für Google Photos Shared Links, Imgur, direkte Bild-URLs
  - Fetch-basiertes Laden mit Base64-Konvertierung
  - Enter-Taste-Support und Loading-State

### Geändert

- Recipe.product_id ist jetzt optional (Rezeptur kann ohne Produkt existieren)

---

## [0.5.0] - 2024-11-29

### Hinzugefügt

- **KI-Assistenten Integration**:
  - Neuer Sidebar-Tab "KI-Assistent" mit Chat-Interface
  - Support für 4 AI-Provider: ChatGPT (OpenAI), Claude (Anthropic), Qwen (Alibaba), DeepSeek
  - Chat-Verlauf mit User/Assistant Messages
  - Provider-Auswahl per Dropdown
  - API-Key Management in Settings mit Verschlüsselung
  - Show/Hide Toggle für API-Keys
  - Fehlerbehandlung mit detaillierten Meldungen
  - Tastatur-Shortcuts (Enter = Senden, Shift+Enter = Neue Zeile)
- **Google Contacts vCard Import**:
  - vCard Parser (.vcf) für Google Contacts Export
  - ContactImportDialog mit selektiver Auswahl
  - Automatische Duplikat-Erkennung (E-Mail & Name)
  - Typ-Zuordnung beim Import (Lieferant/Partner/Kunde/Sonstiges)
  - "Alle auswählen" Toggle
  - Duplikate ein-/ausblenden
  - Import-Counter und Status-Feedback
- **Bild-Upload vollständig integriert**:
  - ImageUpload-Komponente mit Persistenz in LocalStorage
  - Base64-Speicherung (Git-freundlich)
  - Integration in NoteForm und ProductForm
  - Bild-Thumbnails in Notes.tsx und Products.tsx
  - Max. 5 Bilder pro Produkt, unbegrenzt für Notizen
  - "+X mehr" Anzeige bei vielen Bildern

### Verbessert

- Settings-Seite erweitert um:
  - KI-Assistenten API-Key Verwaltung
  - vCard Import-Button mit Hilfe-Text
  - Links zu API-Provider-Portalen
- Layout: Bot-Icon für KI-Assistent in Sidebar
- Type-Safety für AI Provider und Messages

### Technisch

- Neue Services:
  - `aiAssistant.ts` für AI-API-Calls und Key-Management
  - `vcardParser.ts` für Google Contacts Import
- Neue Komponenten:
  - `AIChat.tsx` - Chat-Interface
  - `ContactImportDialog.tsx` - Import-Auswahl-Dialog
- Neue Page: `AIAssistant.tsx`
- API-Key Storage mit Base64-Encoding in LocalStorage

---

## [0.4.0] - 2024-11-28

### Hinzugefügt

- **Tag-System vollständig implementiert**:
  - TagSelector-Komponente für Projekte, Produkte und Notizen
  - Tag-Anzeige in allen Listen-Views
  - Tag-Filter in Projects, Products und Notes
  - Tag-Verwaltungsseite mit Farbauswahl
- **Weblinks & Recherche**:
  - Vollständige Weblink-Verwaltung
  - Typen: Konkurrenz, Lieferant, Recherche, Sonstiges
  - Projekt-Zuordnung möglich
  - Domain-Extraktion aus URLs
- **Kontakt-Projekt-Verknüpfung**:
  - ContactProjectAssignment-Junction-Table
  - ContactProjectSelector-Komponente
  - Rollenbasierte Zuordnung (z.B. "Hauptlieferant")
  - Integration in ContactForm
- **Rich-Text-Editor für Notizen**:
  - Markdown-Unterstützung mit Live-Preview
  - Edit/Preview-Toggle
  - Rendering mit react-markdown
  - Prose-Styling für optimale Lesbarkeit
- **Bild-Upload-Infrastruktur**:
  - ImageUpload-Komponente
  - Drag & Drop Support
  - Bildunterschriften
  - Base64-Speicherung (bereit für File-System-Integration)

### Verbessert

- Notizen können nachträglich Projekten zugeordnet werden
- Markdown-Rendering in Notiz-Karten
- Bessere Visualisierung von Zuordnungen

---

## [0.3.0] - 2024-11-25

### Hinzugefügt

- **ProductForm**: Formular-Komponente für Produkte mit Versionierungs-Support
- **Produkt-CRUD**: Create/Read/Update/Delete für Produkte
- **Versionierung**: Hierarchische Produkt-Struktur (X → X1 → X1.1)
  - Neue Version aus bestehendem Produkt erstellen
  - parent_id verlinkt Versionen
  - Baum-Ansicht mit Root-Produkten und Versionen
- **Archivierung**: Produkte mit Begründung archivieren
- **Projekt-Zuordnung**: Produkte optional Projekten zuweisen
- **Status-Management**: Entwurf, In Test, Freigegeben, Archiviert
- **Notizen & Chaosablage**:
  - Quick-Entry mit Strg+Enter
  - Notiz-Typen: Idee, Notiz, Aufgabe, Recherche
  - Filter-Tabs (Alle, Chaosablage, Mit Projekt)
  - Chronologische Sortierung
- **Kontakte-Verwaltung**:
  - ContactForm Komponente
  - Kontakt-Typen: Lieferant, Partner, Kunde, Sonstiges
  - Klickbare E-Mail/Telefon-Links
  - Filter nach Typ
- **Settings-Seite**:
  - JSON-Export (Download)
  - JSON-Import (File-Upload mit Warnung)
  - LocalStorage-Größenanzeige
  - Status-Feedback

---

## [0.2.0] - 2024-11-25

### Hinzugefügt

- **Layout**: App-Shell mit Sidebar-Navigation und Gurktaler-Branding
- **Routing**: React Router DOM Setup für Navigation
- **Dashboard**: Übersichtsseite mit Statistiken und letzten Aktivitäten
- **Projekt-CRUD**: Vollständige Projektverwaltung
  - ProjectForm Komponente
  - Liste, Erstellen, Bearbeiten, Löschen
  - Status-Verwaltung (Aktiv/Abgeschlossen/Archiviert)
  - Such-Filterung
- **Modal**: Wiederverwendbare Modal-Komponente
- **Storage-Service**: LocalStorage-basierte Datenpersistenz mit JSON Export/Import

### Geändert

- Datenbank von SQLite zu LocalStorage gewechselt (keine Build-Tools erforderlich)

---

## [0.1.0] - 2024-11-25

### Hinzugefügt

- **Projektstruktur**: Initiales Setup mit Electron + Vite + React
- **Dokumentation**: README.md mit Projektübersicht
- **Roadmap**: ROADMAP.md mit Entwicklungsplan
- **Changelog**: Diese Datei
- **Package.json**: Dependencies und Build-Konfiguration

### Technische Details

- Electron 28 als Desktop-Framework
- React 18 mit TypeScript
- Vite als Build-Tool
- TailwindCSS für Styling (vorbereitet)
- SQLite via better-sqlite3 (vorbereitet)

---

## Versionsschema

### Major Release (X.0.0)

- Große neue Funktionsbereiche
- Breaking Changes
- Wichtige Architektur-Änderungen

### Minor Release (0.X.0)

- Neue Features
- Erweiterungen bestehender Funktionen
- Neue UI-Bereiche

### Patch Release (0.0.X)

- Bugfixes
- Kleine Verbesserungen
- Dokumentations-Updates

---

## Release-Prozess

1. Alle Änderungen in `[Unreleased]` dokumentieren
2. Bei Release: Unreleased → Versionsnummer + Datum
3. ROADMAP.md aktualisieren (Status-Updates)
4. Git-Tag erstellen: `git tag -a v0.1.0 -m "Version 0.1.0"`
5. Commit: `git commit -m "Release v0.1.0"`

---

_Dokumentation wird bei jedem Versionssprung aktualisiert._
