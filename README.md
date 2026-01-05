# Gurktaler 2.0

> Projektverwaltungstool und Think-Tank für die Entwicklung von Kräuterlikör-Spezialitäten

## Über das Projekt

**Gurktaler 2.0** ist eine Windows-Desktop-Anwendung zur Verwaltung von:
- Produktideen und deren Versionierung
- Rezepturen (Mazerate, Destillate, Ausmischungen)
- Projekten für Kleinserienproduktion

## 🌐 PWA (Mobile Web-App) Nutzung

### Voraussetzung: API-Server muss laufen

Die PWA greift über einen Custom API Server (Port 3001) auf die NAS-Daten zu. Dieser muss manuell gestartet werden:

**Option 1: Mit PowerShell-Skript (empfohlen)**
```powershell
.\start-api-server.ps1
```

**Option 2: Direkt mit Node.js**
```powershell
node server.js
```

⚠️ **Wichtig:** 
- Der Server muss während der PWA-Nutzung laufen
- Das Terminal/PowerShell-Fenster nicht schließen
- Server läuft auf `http://localhost:3001`
- Bei 502 Bad Gateway Fehler: Server neu starten

### PWA aufrufen

Nach dem Start des Servers:
- Desktop: `http://localhost:3000/gurktaler/` (während `npm run dev` läuft)
- Produktiv: `http://NAS-IP/gurktaler/` (nach Deployment)


- Recherche-Material und Marktbegleiter-Analyse
- Kontakten und Ressourcen

### Hintergrund

Die Anwendung unterstützt die Entwicklung und regionale Markttests von Kräuterlikör-Spezialitäten in Kleinserien. Mit über 25 verschiedenen Kräutersorten als Basis ermöglicht sie die systematische Erfassung und Weiterentwicklung von Produktideen.

## Features

### Implementiert ✅
- **Projekt-Verwaltung**: Vollständiges CRUD, Status-Tracking, Tag-Zuordnung
- **Produkt-Versionierung**: Hierarchische Struktur (X → X1 → X2), Archivierung mit Begründung
- **Notizen & Chaosablage**: Quick-Entry, Markdown-Editor mit Live-Preview, Projekt-Zuordnung, Bild-Upload
- **Kontakte**: Verwaltung mit Typen, Projekt-Verknüpfung mit Rollen, vCard-Import (Google Contacts)
- **Weblinks & Recherche**: URL-Sammlung, Kategorisierung, Konkurrenz-Tracking
- **Tag-System**: Flexible Kategorisierung mit Farben, Filter in allen Bereichen
- **KI-Assistenten**: ChatGPT, Claude, Qwen & DeepSeek Integration für Recherche und Produktentwicklung
- **Bild-Upload**: Vollständig integriert in Notizen & Produkte (Base64-Speicherung)
- **Rezeptur-Verwaltung**: Card-Grid UI, Zutaten-DB mit Alkohol%/Preisen, Gebinde-Management, Expandierbare Zutatenliste
- **Rezeptur-Versionierung**: Auto-Versionierung (v1.0), Auto-Inkrement bei Ableitungen (1.0→1.1→1.2), Datenübernahme
- **Rezeptur-Kalkulation**: Automatische Berechnung von Volumen, Alkoholgehalt & Kosten mit Unit-Conversion
- **Alkoholsteuer-Berechnung**: Automatische Berechnung (12€/L reiner Alkohol) im Produktformular
- **Git-Integration**: Auto-Commit, Auto-Push, Git-Status UI, Remote-Setup ohne Terminal
- **Excel-Import/Export**: Zutaten & Gebinde mit Template-Generator
- **Data Sync**: JSON-Export/Import für Git-basierte Synchronisation
- **PWA (Android/Mobile)**: Installierbare Web-App, Offline-Funktionalität, Quick-Note Button

### In Entwicklung 🔄
- Volltext-Suche über alle Bereiche (bereits implementiert)
- Kostenkalkulationen und Preisfindung

### Geplant 📋
- Google Contacts OAuth Integration (Live-Sync)
- Capacitor Native App (falls native Features benötigt)
- Dashboard mit erweiterten Statistiken

## Mobile & PWA Support

**Progressive Web App (PWA) - Installation auf Android:**

Die App kann als eigenständige Web-App auf Android-Geräten installiert werden:

1. **Im Browser öffnen**: Öffne `http://your-server-ip:3000` in Chrome auf Android
2. **Zum Startbildschirm hinzufügen**: Chrome → Menü → "Zum Startbildschirm hinzufügen"
3. **App nutzen**: Icon erscheint auf dem Home-Screen, läuft wie native App

**Mobile Features:**
- ✅ **Responsive Design**: Platform Detection (Electron = Desktop-UI, Browser = Mobile-UI)
- ✅ **Hamburger-Navigation**: Slide-in Drawer auf kleinen Screens (< 768px)
- ✅ **Quick-Note Button**: Floating Action Button für schnelle Notizen (nur Mobile)
- ✅ **Offline-Funktionalität**: Service Worker cached Assets & Fonts
- ✅ **Touch-optimiert**: Größere Touch-Targets, kompakte Cards
- ✅ **Git-Sync**: Gleicher Datenaustausch wie Desktop (Auto-Pull/Push)

**Platform-Verhalten:**
- **Windows-Desktop (Electron)**: UI bleibt unverändert, feste Sidebar
- **Browser/Android (PWA)**: Responsive Mobile-UI, Hamburger-Menü

## Backup-Strategie

**Automatisches Backup via Git-Integration:**

✅ **Echtzeit-Backup**: Jede Datenänderung wird automatisch committed und zu GitHub gepusht (wenn Auto-Commit/Push aktiv)
✅ **Remote-Sicherheit**: Alle Daten sicher auf GitHub (privates Repository empfohlen)
✅ **Multi-Device-Sync**: Auto-Pull beim App-Start synchronisiert automatisch
✅ **Konfliktlösung**: Dialog mit 2 Optionen bei Merge-Konflikten
✅ **Versionierung**: Vollständige Git-Historie aller Änderungen

**Zusätzliche Backup-Optionen:**

📦 **JSON-Export**: Manuelles lokales Backup (Settings → Daten exportieren)
📦 **Vor kritischen Aktionen**: Export vor Import/Mass-Delete empfohlen

**Empfohlenes Setup:**
1. Privates GitHub-Repository erstellen
2. Remote in App einrichten (Settings → Git-Integration)
3. Auto-Commit + Auto-Push aktivieren
4. Fertig - Backups laufen automatisch im Hintergrund

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

#### Desktop-App (Windows EXE)
```bash
# Standard Build (Desktop)
npm run build

# Oder explizit Desktop
npm run build:desktop
```
**Ergebnis:** `build-output/Gurktaler 2.0-1.1.1-Setup.exe`

#### Mobile PWA (Android/iOS)
```bash
# Nur PWA Build
npm run build:pwa

# PWA Build + automatisches Deployment zum NAS
npm run deploy:pwa
```
**Ergebnis:** `dist/` Ordner wird auf NAS kopiert (`Y:\web\html\gurktaler\`)

#### Beide Builds
```bash
# Desktop + PWA nacheinander
npm run build:all
```

### Verfügbare Scripts

| Script | Zweck |
|--------|-------|
| `npm run dev` | Entwicklungsserver (Vite) |
| `npm run build` | Desktop-EXE (Standard) |
| `npm run build:desktop` | Desktop-EXE (explizit) |
| `npm run build:pwa` | Mobile PWA Build |
| `npm run deploy:pwa` | PWA Build + NAS Upload |
| `npm run build:all` | Desktop + PWA |

### Deployment

**Desktop:** Installer verteilen (E-Mail, USB, Download-Link)
**Mobile PWA:** Automatisch via `npm run deploy:pwa` oder manuell:
```powershell
.\deploy-pwa.ps1
```

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

## Production Build

Die Anwendung nutzt einen lokalen HTTP Server für ES Module Support:

```bash
# Build erstellen
npm run build  # oder: npx tsc && npx vite build && npx electron-builder

# Portable App
build-output/win-unpacked/Gurktaler 2.0.exe

# NSIS Installer
build-output/Gurktaler 2.0-0.9.1-Setup.exe
```

**Technische Details:**
- Minimaler HTTP Server (Node.js http) für ES Module Loading
- Client-Side Routing Fallback für React Router
- ASAR deaktiviert für bessere Kompatibilität
- DevTools mit F12 zugänglich

## Dokumentation

- [ROADMAP.md](./ROADMAP.md) - Entwicklungsplan und offene Aufgaben
- [CHANGELOG.md](./CHANGELOG.md) - Versionshistorie
- [docs/DATENMODELL.md](./docs/DATENMODELL.md) - Datenbankschema

## GitHub Remote Repository einrichten

### Variante 1: Über die Anwendung (empfohlen)

1. **GitHub Repository erstellen**
   - Gehe zu [github.com](https://github.com) und melde dich an
   - Klicke auf "New Repository" (grüner Button oben rechts)
   - Repository-Name: z.B. `gurktaler-data-sync`
   - Visibility: **Private** (wichtig für sensible Daten!)
   - **Wichtig**: Haken bei "Initialize this repository with a README" **NICHT** setzen
   - Klicke "Create repository"

2. **Remote-URL kopieren**
   - GitHub zeigt dir die Repository-URL an (z.B. `https://github.com/username/gurktaler-data-sync.git`)
   - Oder nutze SSH: `git@github.com:username/gurktaler-data-sync.git` (empfohlen)

3. **In der App einrichten**
   - Öffne **Einstellungen** → Bereich **Git-Integration**
   - Klicke auf "Remote-Repository einrichten"
   - Füge die URL ein und klicke "Remote hinzufügen"
   - Fertig! Ab jetzt synchronisiert die App automatisch

4. **Erstmaliges Pushen**
   - Die App wird nach dem Remote-Setup automatisch versuchen zu pushen
   - Falls du SSH verwendest, musst du vorher deinen SSH-Key zu GitHub hinzufügen:
     * Gehe zu GitHub → Settings → SSH and GPG keys
     * Füge deinen öffentlichen SSH-Key hinzu (~/.ssh/id_rsa.pub)

### Variante 2: Über Git Bash / Terminal

```bash
# Im Projekt-Verzeichnis
cd c:\Users\wolfg\Desktop\zweipunktnullVS

# Remote hinzufügen (HTTPS)
git remote add origin https://github.com/username/gurktaler-data-sync.git

# Oder mit SSH (empfohlen)
git remote add origin git@github.com:username/gurktaler-data-sync.git

# Ersten Push mit Upstream setzen
git push -u origin master

# Branch-Tracking prüfen
git branch -vv
```

### SSH-Key für GitHub erstellen (einmalig)

Falls du noch keinen SSH-Key hast:

```bash
# SSH-Key generieren
ssh-keygen -t ed25519 -C "deine@email.com"

# Key anzeigen und kopieren
cat ~/.ssh/id_ed25519.pub

# Zu GitHub hinzufügen:
# GitHub → Settings → SSH and GPG keys → New SSH key
# Füge den kopierten Key ein
```

### Authentifizierung mit HTTPS (GitHub Personal Access Token)

Seit 2021 akzeptiert GitHub keine Passwörter mehr für HTTPS. Du benötigst ein **Personal Access Token**:

1. **Token erstellen**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token" → "Generate new token (classic)"
   - Note: z.B. "Gurktaler App Sync"
   - Expiration: Wähle eine Laufzeit (z.B. 90 Tage oder "No expiration")
   - Scopes: Wähle **repo** (voller Repository-Zugriff)
   - Klicke "Generate token"
   - **Wichtig**: Kopiere das Token sofort, es wird nur einmal angezeigt!

2. **Token verwenden**:
   - Bei HTTPS-Push/Pull wirst du nach Username/Passwort gefragt
   - Username: Dein GitHub-Username
   - Password: Das generierte Token (nicht dein GitHub-Passwort!)

3. **Token speichern (Git Credential Manager)**:
   ```bash
   # Windows speichert das Token automatisch beim ersten Push
   git config --global credential.helper wincred
   ```

### Auto-Commit, Auto-Push & Auto-Pull Einstellungen

In der App unter **Einstellungen → Git-Integration**:

- ✅ **Auto-Commit**: Erstellt automatisch einen Commit bei jeder Datenänderung
- ✅ **Auto-Push**: Pusht automatisch nach jedem Commit (benötigt Remote-Setup)
- ✅ **Auto-Pull beim Start**: Holt automatisch neueste Daten beim App-Start
- **Commit Message Prefix**: Standardmäßig `[Auto]`, anpassbar

**Beispiel Auto-Commit Nachrichten**:
- `[Auto] Produkt "Gurktaler Kräuter Reserve" erstellt`
- `[Auto] Rezept "Maischebasis V3" aktualisiert`
- `[Auto] Projekt "Markttest Graz" aktualisiert`

**Auto-Pull Verhalten**:
- Beim App-Start wird automatisch `git pull` ausgeführt (wenn Auto-Push aktiviert)
- Lokale Änderungen werden vorher automatisch committed
- Bei Merge-Konflikten erscheint ein Dialog mit 2 Optionen:
  - **Remote übernehmen**: Verwirft lokale Änderungen, lädt Remote-Daten
  - **Lokal behalten**: Behält lokale Daten, Sync muss später manuell erfolgen

### Manuelle Sync-Operationen

Falls Auto-Push deaktiviert ist oder du manuell synchronisieren willst:

- **Pull** (Download): Ändert lokale Daten mit Remote-Stand ab
- **Push** (Upload): Lädt lokale Commits zu GitHub hoch

⚠️ **Wichtig**: Pull überschreibt lokale Änderungen! Stelle sicher, dass du vorher committed hast.

### Mehrere Geräte synchronisieren

**Gerät 1 (Initial)**:
1. Remote-Repository einrichten (siehe oben)
2. Auto-Commit & Auto-Push aktivieren
3. Arbeite normal → Daten werden automatisch gepusht

**Gerät 2 (Neu)**:
1. Repository klonen:
   ```bash
   git clone https://github.com/username/gurktaler-data-sync.git zweipunktnullVS
   cd zweipunktnullVS
   npm install
   npm run build
   ```
2. Öffne die App → Einstellungen
3. Remote ist bereits konfiguriert
4. Aktiviere Auto-Commit & Auto-Push

**Bei jedem Start**:
- ✅ **Automatisch**: Auto-Pull holt neueste Daten beim App-Start
- 🔄 **Manuell**: Klicke **Pull** in den Einstellungen wenn Auto-Pull deaktiviert ist
- Bei Konflikten: Dialog hilft bei der Lösung (Remote übernehmen oder Lokal behalten)
- Arbeite normal → Auto-Push synchronisiert automatisch

**Konflikt-Vermeidung**:
- Arbeite möglichst nicht gleichzeitig auf beiden Geräten an denselben Daten
- Auto-Pull stellt sicher, dass du immer mit dem neuesten Stand startest
- Bei Konflikten: Wähle im Dialog "Remote übernehmen" (empfohlen)

### Datensynchronisation (Legacy JSON-Export)

Alternativ zur Git-Integration kannst du weiterhin JSON-Export/Import nutzen:

1. **Export**: Daten werden als JSON exportiert
2. **Git**: JSON-Dateien werden via Git synchronisiert
3. **Import**: Auf anderem Gerät werden die Daten importiert

```bash
# Daten exportieren (in der App: Einstellungen → Daten exportieren)
# → Erzeugt gurktaler-backup-YYYY-MM-DD.json

# Via Git synchronisieren
git add gurktaler-backup-*.json
git commit -m "Daten-Sync $(date +%Y-%m-%d)"
git push
```

⚠️ **Wichtig**: JSON-Import überschreibt ALLE lokalen Daten!

## Rezepturen-Workflow

### Neue Rezeptur erstellen

1. **Seite öffnen**: Klicke auf "Rezepturen" in der Sidebar
2. **Neue Rezeptur**: Klicke auf den "+ Neue Rezeptur" Button
3. **Grunddaten eingeben**:
   - Name (z.B. "Kräuter-Mazerat Basis")
   - Typ (Mazerat, Destillat, Ausmischung)
   - Version (optional - wird automatisch "1.0" wenn leer)
   - Produkt (optional - Verknüpfung zu bestehendem Produkt)
   - Anleitung/Herstellung
   - Ausbeute (Menge + Einheit)
   - Notizen (optional)
4. **Speichern**: Die Rezeptur erscheint als Karte mit Version v1.0

### Zutaten hinzufügen

1. **Rezeptur bearbeiten**: Klicke auf das Stift-Icon auf der Karte
2. **Zutaten-Editor**: Im unteren Bereich findest du den Zutaten-Editor
3. **Zutat hinzufügen**:
   - Wähle eine Zutat aus der Dropdown-Liste
   - Gib Menge und Einheit ein
   - Optional: Notizen hinzufügen
   - Sortierreihenfolge wird automatisch gesetzt
4. **Speichern**: Die Zutaten werden in der Karte angezeigt

### Zutatenliste anzeigen

- **Expandierbar**: Klicke auf "X Zutaten" in der Karte
- **Details**: Zutat + Menge/Einheit werden angezeigt
- **Sortiert**: Nach sort_order (aufsteigend)

### Rezeptur versionieren

1. **Version erstellen**: Klicke auf das GitBranch-Icon (Verzweigungs-Symbol)
2. **Daten übernehmen**: Alle Daten der Basis-Rezeptur werden vorausgefüllt
3. **Änderungen vornehmen**: Modifiziere nur was sich ändern soll
4. **Version**: Wird automatisch inkrementiert (1.0 → 1.1 → 1.2)
5. **Speichern**: Neue Version ist mit der Basis-Rezeptur verknüpft
6. **Badges**: Die Karte zeigt:
   - Typ-Badge (Mazerat/Destillat/Ausmischung)
   - Version-Badge (z.B. "v1.1")
   - Ableitungs-Badge ("Abgeleitet" mit GitBranch-Icon)

### Bilder & Tags

- **Bilder hochladen**: Nach dem Speichern kannst du im Bearbeitungsmodus Bilder hochladen (max. 5)
- **Tags zuweisen**: Im Bearbeitungsmodus findest du den Tag-Selector
- **Inline-Editing**: In der Kartenansicht kannst du Tags direkt hinzufügen/entfernen

### Kalkulation

- **Im Bearbeitungsmodus**: Der Rezeptur-Kalkulator zeigt:
  - Gesamtvolumen (basierend auf Zutaten)
  - Alkoholgehalt (berechnet aus Zutaten-Alkohol%)
  - Kosten (basierend auf Zutaten-Preisen)
- **Unit-Conversion**: Automatische Umrechnung verschiedener Einheiten (ml, L, g, kg)

### Quick-Add Funktionen

Direkt von der Karte aus:
- **+ URL**: Weblink schnell hinzufügen (z.B. Inspiration, Quelle)
- **+ Dokument**: PDF/Dokument verknüpfen

### Favoriten & Suche

- **Stern-Icon**: Rezeptur als Favorit markieren
- **Suche**: Durchsucht Name, Anleitung, Notizen
- **Tag-Filter**: Filtere nach Tags (Dropdown rechts)

## Mobile PWA - Setup & Betrieb

**Progressive Web App mit vollständiger Schreib-/Lesefunktion**

### Architektur

Die mobile App verwendet eine Custom Node.js API (Port 3001), da das Synology FileStation Upload API defekt ist:

- **Browser** → nginx (Port 80) → Custom API (Port 3001) → Dateisystem
- **Desktop App** → Direkter Y:\\ Drive Zugriff (keine API)

### Server-Management

**Automatischer Start nach NAS-Neustart** (einmalig einrichten):

```bash
# Synology DSM → Systemsteuerung → Aufgabenplanung
# Erstellen → Ausgelöste Aufgabe → Benutzerdefiniertes Script
# Benutzer: root
# Ereignis: Hochfahren
# Script:
cd /volume1/Gurktaler/api
nohup node server.js > server.log 2>&1 &
sleep 2
echo "$(date): Gurktaler API Server gestartet" >> /var/log/gurktaler-startup.log
```

**Remote-Verwaltung (Windows Desktop)**:

Von deinem Windows-Rechner aus kannst du den Server über PowerShell steuern:

```powershell
# Server-Status prüfen
.\check-server.ps1

# Server starten (falls gestoppt)
.\start-server.ps1

# Server Status & Log anzeigen
.\start-server.ps1 -Status

# Server neu starten
.\start-server.ps1 -Restart

# Server stoppen
.\start-server.ps1 -Stop
```

**Voraussetzung**: OpenSSH Client in Windows installiert:
```powershell
# PowerShell als Administrator
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

**Deployment nach Build**:

```powershell
# Nach npm run build:
.\deploy-pwa.ps1         # Hash-basiertes Deployment
.\deploy-pwa.ps1 -Force  # Force-Deployment (überschreibt alles)
```

### Manueller Server-Start (Fallback)

```bash
ssh admin@100.121.103.107
cd /volume1/Gurktaler/api
nohup node server.js > server.log 2>&1 &
```

**Prüfen:**
```bash
cat server.log  # "🚀 Gurktaler API Server running on port 3001"
ps aux | grep node  # Prozess läuft
```

### Zugriff

- **Desktop-App**: Wie gewohnt
- **Mobile (Browser)**: `http://100.121.103.107/gurktaler/`
- **Installation (Android)**: Browser-Menü → "Zum Startbildschirm hinzufügen"

### Features

✅ Vollständige CRUD-Operationen (Erstellen, Lesen, Bearbeiten, Löschen)  
✅ QuickNote-Button für schnelle Notizen  
✅ Offline-Funktionalität (Service Worker)  
✅ Automatische Synchronisation mit Desktop-App via NAS  
✅ Identische UI wie Desktop-App  

### Troubleshooting

**Server läuft nicht:**
```bash
cd /volume1/Gurktaler/api
nohup node server.js > server.log 2>&1 &
```

**Browser zeigt alte Version:**
- DevTools (F12) → Application → Service Workers → Unregister
- Cache löschen (Strg+Shift+Delete)
- Incognito-Fenster verwenden

**Weitere Details:** Siehe [docs/MOBILE_API.md](docs/MOBILE_API.md)

## Versionierung

- **Major** (X.0.0): Große Funktionserweiterungen
- **Minor** (0.X.0): Neue Features
- **Patch** (0.0.X): Bugfixes, kleine Verbesserungen

Commits erfolgen regelmäßig, Dokumentation wird bei jedem Versionssprung aktualisiert.

## Lizenz

Proprietär - Nur für internen Gebrauch.

---

**Aktuelle Version**: 1.1.0 (Mobile Write Support)  
**Letztes Update**: 26. Dezember 2025
