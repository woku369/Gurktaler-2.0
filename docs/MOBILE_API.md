# Mobile PWA - Custom API Lösung

## Problem

Das Synology FileStation Upload API war auf diesem NAS defekt:
- Authentifizierung funktionierte
- Read-Operationen (Download, List) funktionierten
- **Upload API hing komplett** - keine Response, auch nach 5+ Minuten
- Tests: Browser (504), nginx proxy (504), direkter curl (hang)
- Diagnose: FileStation Upload API selbst ist kaputt (nicht konfigurierbar)

## Lösung

Custom Node.js API Server mit direktem Filesystem-Zugriff, bypassed alle Synology APIs.

### Architektur

```
Browser (PWA)
    ↓ fetch('/api/json?path=/database/projects.json')
nginx Port 80
    ↓ proxy_pass http://127.0.0.1:3001
Node.js API Server (Port 3001, localhost only)
    ↓ fs.promises.readFile/writeFile
Filesystem (/volume1/Gurktaler/zweipunktnull/database/)
```

### Komponenten

#### 1. Node.js API Server (`/volume1/Gurktaler/api/server.js`)

- **Port:** 3001 (localhost only - keine externe Exposition)
- **Zero Dependencies:** Native Node.js modules (http, fs.promises, path)
- **Auto-Start:** Muss mit `nohup node server.js > server.log 2>&1 &` gestartet werden
- **Endpoints:**
  - `GET /api/json?path=/database/projects.json` - Liest JSON-Datei
  - `POST /api/json?path=/database/projects.json` - Schreibt JSON-Datei (Body = JSON Array)
- **Features:**
  - CORS Headers (Access-Control-Allow-Origin: *)
  - Automatische Verzeichniserstellung (mkdir -p)
  - Error Handling mit 500-Responses

#### 2. nginx Reverse Proxy (`/usr/syno/share/nginx/conf.d/www.00-gurktaler.conf`)

```nginx
location ^~ /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_read_timeout 60;
}
```

- Proxied `/api/*` Requests zu Port 3001
- Same-Origin = kein CORS Problem
- 60 Sekunden Timeout (für große JSON-Dateien)

#### 3. CustomApiStorageProvider (`src/renderer/services/nasStorage.ts`)

```typescript
export class CustomApiStorageProvider implements StorageProvider {
  async readJson<T>(filePath: string): Promise<T[]> {
    const url = `/api/json?path=${encodeURIComponent(filePath)}`;
    const response = await fetch(url);
    return await response.json() as T[];
  }

  async writeJson<T>(filePath: string, data: T[]): Promise<void> {
    const url = `/api/json?path=${encodeURIComponent(filePath)}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data, null, 2),
    });
  }
}
```

- Verwendet relative URLs (`/api/json`) - kein CORS
- Einfache fetch()-Aufrufe
- Image-Upload noch nicht implementiert (TODO)

#### 4. Platform Detection

```typescript
export const nasStorage = new Proxy({} as StorageProvider, {
  get(_target, prop) {
    if (!_storageInstance) {
      if (isElectron()) {
        _storageInstance = new NasStorageProvider(); // Y:\ Drive
      } else {
        _storageInstance = new CustomApiStorageProvider(); // Custom API
      }
    }
    return (_storageInstance as any)[prop];
  }
});
```

- Desktop (Electron): NasStorageProvider über Y:\ Drive
- Browser (PWA): CustomApiStorageProvider über `/api/json`

### Deployment

#### Server starten (einmalig nach NAS-Neustart)

```bash
ssh admin@100.121.103.107
cd /volume1/Gurktaler/api
nohup node server.js > server.log 2>&1 &
```

**Prüfen:**
```bash
cat server.log  # Sollte: "🚀 Gurktaler API Server running on port 3001"
curl http://localhost:3001/api/json?path=/database/projects.json
```

#### PWA Build & Deploy

```powershell
# Lokaler PC
cd C:\Users\wolfg\Desktop\zweipunktnullVS
npm run build

# Deployment
robocopy dist Y:\web\html\gurktaler /MIR
# ODER manuell über FileStation/Explorer
```

**Wichtig:** Bei Problemen mit Cache:
- Service Worker deaktivieren (DevTools → Application → Service Workers → Unregister)
- Incognito-Fenster verwenden
- Oder Cache löschen (Strg+Shift+Delete)

### Fehlende Features (TODO)

- `deleteFile()` - File deletion endpoint
- `listFiles()` - Directory listing endpoint
- Image Upload/Download via Custom API
- Startup-Script für Node.js Server (Synology Task Scheduler)

### Vorteile

✅ Bypassed kaputte FileStation Upload API komplett
✅ Zero Dependencies - nur native Node.js
✅ Einfache Architektur - leicht wartbar
✅ Localhost-only Server - keine Security-Exposition
✅ Funktioniert identisch wie Electron-Version

### Nachteile

⚠️ Server muss manuell gestartet werden
⚠️ Keine automatische Startup nach NAS-Neustart
⚠️ Image-Upload noch nicht implementiert
⚠️ Keine File-Deletion (für Cleanup-Tests)

## Testen

### Browser Konsole (F12)

Sollte zeigen:
```
🌐 Using Custom API Storage (Port 3001)
```

**NICHT:**
```
🌐 Using FileStation API Storage
```

### Netzwerk-Tab

Bei QuickNote-Button oder Projekt erstellen:
```
POST http://100.121.103.107/api/json?path=/database/notes.json
Status: 200
Response: {"success":true}
```

### Daten-Verifikation

**Desktop App öffnen** → Daten sollten sofort sichtbar sein (sync via NAS).

## Troubleshooting

### Server läuft nicht

```bash
ps aux | grep node  # Prüfen ob Prozess läuft
cd /volume1/Gurktaler/api
cat server.log      # Fehler lesen
```

### 404 auf /api/json

```bash
sudo nginx -t       # Config testen
sudo nginx -s reload
curl http://localhost:3001/api/json?path=/database/projects.json  # Direkt testen
```

### Browser zeigt alte Version

- Service Worker deregister (DevTools → Application)
- Cache löschen
- Incognito-Fenster verwenden
- `index.html` Zeitstempel prüfen

### Schreiben funktioniert nicht

```bash
# Server-Log live anschauen
tail -f /volume1/Gurktaler/api/server.log

# Manuell testen
curl -X POST -H "Content-Type: application/json" \
  -d '[{"test":true}]' \
  "http://localhost:3001/api/json?path=/database/_test.json"
```

## Version History

- **v1.0.0** - Desktop App mit FileStation API für Browser
- **v1.1.0** - Custom API Server (FileStation Upload defekt)
