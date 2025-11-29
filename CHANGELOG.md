# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant

- Rezeptur-Verwaltung mit Zutaten
- Volltext-Suche über alle Bereiche
- Git-Integration für automatischen Sync
- Android-PWA

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
