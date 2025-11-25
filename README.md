# Gurktaler 2.0

> Projektverwaltungstool und Think-Tank für die Entwicklung von Kräuterlikör-Spezialitäten

## Über das Projekt

**Gurktaler 2.0** ist eine Windows-Desktop-Anwendung zur Verwaltung von:
- Produktideen und deren Versionierung
- Rezepturen (Mazerate, Destillate, Ausmischungen)
- Projekten für Kleinserienproduktion
- Recherche-Material und Marktbegleiter-Analyse
- Kontakten und Ressourcen

### Hintergrund

Die Anwendung unterstützt die Entwicklung und regionale Markttests von Kräuterlikör-Spezialitäten in Kleinserien. Mit über 25 verschiedenen Kräutersorten als Basis ermöglicht sie die systematische Erfassung und Weiterentwicklung von Produktideen.

## Features

### Implementiert ✅
- [ ] *Noch keine Features implementiert - Projekt in Entwicklung*

### Geplant 📋
- Projekt-Dashboard mit Statusübersicht
- Produkt-Versionierung (X → X1 → X2)
- Rezeptur-Editor mit Zutaten-Verwaltung
- Chaosablage für schnelle Notizen
- Tag-System für flexible Kategorisierung
- Volltext-Suche
- Git-basierte Datensynchronisation
- Android-Companion-App (PWA)

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Framework | Electron 28 |
| Frontend | React 18 + TypeScript |
| Styling | TailwindCSS |
| Datenbank | SQLite (better-sqlite3) |
| Build-Tool | Vite |
| Sync | JSON-Export für Git |

## Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Git

### Entwicklungsumgebung starten

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten (Browser-Preview)
npm run dev

# Electron-App im Dev-Modus
npm run electron:dev
```

### Produktions-Build

```bash
# Windows 64-bit Installer erstellen
npm run build
```

Der Installer wird im `release/` Ordner erstellt.

## Projektstruktur

```
gurktaler-2.0/
├── src/
│   ├── main/              # Electron Main Process
│   ├── renderer/          # React Frontend
│   │   ├── components/    # UI-Komponenten
│   │   ├── pages/         # Seiten/Views
│   │   ├── hooks/         # Custom React Hooks
│   │   ├── services/      # Datenbank-Services
│   │   └── types/         # TypeScript Typen
│   └── shared/            # Geteilter Code
├── database/              # SQLite Datenbank
├── docs/                  # Zusätzliche Dokumentation
├── public/                # Statische Assets
├── ROADMAP.md            # Entwicklungs-Roadmap
├── CHANGELOG.md          # Versionshistorie
└── README.md             # Diese Datei
```

## Dokumentation

- [ROADMAP.md](./ROADMAP.md) - Entwicklungsplan und offene Aufgaben
- [CHANGELOG.md](./CHANGELOG.md) - Versionshistorie
- [docs/DATENMODELL.md](./docs/DATENMODELL.md) - Datenbankschema

## Datensynchronisation

Die Anwendung speichert Daten lokal in SQLite. Für die Synchronisation zwischen Geräten:

1. **Export**: Daten werden als JSON exportiert
2. **Git**: JSON-Dateien werden via Git synchronisiert
3. **Import**: Auf anderem Gerät werden die Daten importiert

```bash
# Daten exportieren (in der App oder via CLI)
# → Erzeugt data-export/*.json

# Via Git synchronisieren
git add data-export/
git commit -m "Daten-Sync $(date +%Y-%m-%d)"
git push
```

## Versionierung

- **Major** (X.0.0): Große Funktionserweiterungen
- **Minor** (0.X.0): Neue Features
- **Patch** (0.0.X): Bugfixes, kleine Verbesserungen

Commits erfolgen regelmäßig, Dokumentation wird bei jedem Versionssprung aktualisiert.

## Lizenz

Proprietär - Nur für internen Gebrauch.

---

**Aktuelle Version**: 0.1.0 (Entwicklungsstart)  
**Letztes Update**: 25. November 2024
