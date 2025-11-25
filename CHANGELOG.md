# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant
- Rezeptur-Verwaltung
- Notizen & Chaosablage
- Recherche-Links
- Volltext-Suche

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
- **Such-Filterung**: Echtzeit-Suche in Produktnamen
- **Status-Management**: Entwurf, In Test, Freigegeben, Archiviert

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

*Dokumentation wird bei jedem Versionssprung aktualisiert.*
