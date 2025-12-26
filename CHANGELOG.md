# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

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
