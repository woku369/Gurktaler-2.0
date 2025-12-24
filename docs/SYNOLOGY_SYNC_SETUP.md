# Synology WebDAV Sync Setup - Vollständige Anleitung

**Datum:** 21. Dezember 2025  
**Projekt:** Gurktaler 2.0  
**Ziel:** Synchronisation zwischen Desktop-App (2 Rechner) und Mobile-App (Smartphone) via Synology NAS WebDAV

---

## 📋 Workflow-Übersicht

```
┌──────────────────────────────────────────────────────────────┐
│                     DEINE ARBEITSUMGEBUNG                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 ZUHAUSE (Heimnetzwerk)                                   │
│     💻 Rechner 1: Gurktaler.exe                              │
│     🖥️  Synology DS 124 (WebDAV-Server + PWA-Hosting)       │
│                                                              │
│  🏢 BÜRO (kein eigenes Netzwerk)                             │
│     💻 Rechner 2: Gurktaler.exe                              │
│     🔬 Labor: Produktentwicklung → Daten in App              │
│                                                              │
│  🚗 UNTERWEGS (Storechecks, Messen, Veranstaltungen)         │
│     📱 Smartphone: PWA (über https://gurktaler.deinedomain)  │
│     📸 Schnappschüsse + Notizen → Synology WebDAV            │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                           ↓ ↑ SYNC ↓ ↑
                           
                    🏠 Synology DS 124
                    (WebDAV Server, 24/7)
```

### Datenfluss

1. **Rechner 1 (Heim)** → Notiz erstellen → WebDAV Upload zu Synology
2. **Synology** → Datei gespeichert in `/homes/gurktaler/data.json`
3. **Rechner 2 (Büro)** → Gurktaler.exe öffnen → WebDAV Download von Synology → Notiz sichtbar
4. **Smartphone** → Foto auf Messe → WebDAV Upload zu Synology
5. **Rechner 1/2** → Foto in Projekt sichtbar

---

## 🎯 Architektur

### Desktop-App (Gurktaler.exe)
- **Technologie:** Electron + React + TypeScript
- **Speicherung:** LocalStorage (lokal auf Rechner)
- **Sync:** WebDAV-Protokoll (HTTPS) zu Synology
- **Auth:** Basic Auth (Benutzername + Passwort)
- **Nutzung:** Hauptarbeitsplatz (Heim + Büro)

### Mobile-App (PWA)
- **Technologie:** React Progressive Web App
- **Hosting:** Synology NAS Web Station (HTTPS)
- **URL:** `https://gurktaler.deinedomain.de` oder `gurktaler.duckdns.org`
- **Speicherung:** LocalStorage im Browser
- **Sync:** WebDAV-Protokoll (gleicher Server)
- **Offline:** Service Worker cacht App + Daten
- **Nutzung:** Unterwegs (Smartphone/Tablet)

### Synology NAS (Backend)
- **WebDAV Server:** Port 5006 (HTTPS)
- **Datei-Speicher:** `/homes/gurktaler/data.json`
- **PWA-Hosting:** Web Station (Port 443)
- **Zugriff:** DynDNS oder QuickConnect

---

## 📝 SCHRITT-FÜR-SCHRITT-ANLEITUNG

---

### **PHASE 1: Synology WebDAV aktivieren** (10 Minuten)

#### 1.1 WebDAV aktivieren

1. **Synology DSM** öffnen (http://192.168.x.x:5000)
2. **Systemsteuerung** → **Dateidienste** → **WebDAV**
3. Aktiviere:
   - ✅ **WebDAV aktivieren**
   - ✅ **WebDAV HTTPS-Verbindung aktivieren**
   - **HTTPS-Port:** `5006` (Standard)
4. **Übernehmen** klicken

#### 1.2 Benutzer erstellen

1. **Systemsteuerung** → **Benutzer & Gruppe**
2. **Erstellen** → Neuer Benutzer:
   ```
   Name: gurktaler_sync
   Passwort: [Sicheres Passwort, z.B. Generator]
   E-Mail: optional
   ```
3. **Berechtigungen:**
   - Anwendung: ✅ **WebDAV**
   - Freigegebener Ordner: ✅ **homes** (Lesen/Schreiben)
4. Fertig

#### 1.3 Ordner erstellen

1. **File Station** öffnen
2. Navigiere zu `/homes/gurktaler_sync/`
3. Neuen Ordner erstellen: `Gurktaler`
4. Rechtklick → **Eigenschaften** → Berechtigung prüfen (Lesen/Schreiben für gurktaler_sync)

**✅ Phase 1 abgeschlossen!**

---

### **PHASE 2: Externe Erreichbarkeit (DynDNS)** (20-30 Minuten)

#### 2.1 DynDNS-Service wählen

**Option A: DuckDNS (kostenlos, empfohlen)**
1. Gehe zu: https://www.duckdns.org/
2. Mit Google/GitHub einloggen
3. Domain erstellen: `gurktaler` → Ergibt: `gurktaler.duckdns.org`
4. **Token kopieren** (später benötigt)

**Option B: Synology QuickConnect**
- Einfacher, aber langsamer
- **Systemsteuerung** → **Externer Zugriff** → **QuickConnect**
- ID wählen: z.B. `gurktaler2024`
- URL: `https://gurktaler2024.quickconnect.to`

#### 2.2 DynDNS in Synology konfigurieren

1. **Systemsteuerung** → **Externer Zugriff** → **DDNS**
2. **Hinzufügen**:
   ```
   Dienstanbieter: DuckDNS
   Hostname: gurktaler.duckdns.org
   Benutzername/E-Mail: [leer lassen oder Token]
   Passwort/Schlüssel: [DuckDNS Token einfügen]
   ```
3. **Testen** → Sollte grün werden
4. **OK**

#### 2.3 Router Port-Forwarding

1. Router-Admin öffnen (z.B. 192.168.0.1)
2. **Port-Weiterleitung / NAT** finden
3. Neue Regel:
   ```
   Service-Name: Synology_HTTPS
   Extern Port: 443
   Intern IP: [Synology IP, z.B. 192.168.0.100]
   Intern Port: 443
   Protokoll: TCP
   ```
4. Zweite Regel für WebDAV:
   ```
   Service-Name: Synology_WebDAV
   Extern Port: 5006
   Intern IP: [Synology IP]
   Intern Port: 5006
   Protokoll: TCP
   ```
5. Speichern

#### 2.4 HTTPS-Zertifikat (Let's Encrypt)

1. **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. **Hinzufügen** → **Neues Zertifikat hinzufügen**
3. Wähle **"Zertifikat von Let's Encrypt abrufen"**
4. Einstellungen:
   ```
   Domain-Name: gurktaler.duckdns.org
   E-Mail: deine@email.com
   Alternativer Betreff: [leer]
   ```
5. **Übernehmen** → Zertifikat wird automatisch erstellt (2-3 Min)
6. Nach Erstellung: **Konfigurieren** → Zertifikat für alle Dienste aktivieren

#### 2.5 Testen

Von einem **externen Netzwerk** (z.B. Smartphone mit mobilem Internet):
```
https://gurktaler.duckdns.org:5006
```
Sollte eine WebDAV-Login-Seite oder "401 Unauthorized" zeigen → **Funktioniert!**

**✅ Phase 2 abgeschlossen!**

---

### **PHASE 3: Web Station für PWA-Hosting** (15 Minuten)

#### 3.1 Web Station installieren

1. **Paket-Zentrum** öffnen
2. Suche **"Web Station"**
3. **Installieren**

#### 3.2 Virtuellen Host erstellen

1. **Web Station** öffnen
2. **Webdienstportal** → **Virtueller Host** → **Erstellen**
3. Einstellungen:
   ```
   Name: gurktaler
   Hostname: gurktaler.duckdns.org
   Port: HTTPS (443)
   Dokumentenstamm: /web/gurktaler
   HTTP/2: ✅ Aktivieren
   HSTS: ✅ Aktivieren
   ```
4. **OK**

#### 3.3 Ordner für PWA erstellen

1. **File Station** → `/web/` (falls nicht vorhanden: erstellen)
2. Ordner erstellen: `gurktaler`
3. Berechtigung: **http** Benutzer benötigt Lesezugriff

**✅ Phase 3 abgeschlossen!**

---

### **PHASE 4: Code-Implementierung (Sync-Service)** (Entwicklung)

#### 4.1 Umgebungsvariablen erstellen

Erstelle `.env.local` im Projekt-Root:

```env
# Synology WebDAV-Konfiguration
VITE_WEBDAV_URL=https://gurktaler.duckdns.org:5006
VITE_WEBDAV_PATH=/homes/gurktaler_sync/Gurktaler
VITE_WEBDAV_FILE=data.json

# PWA Production URL
VITE_PWA_URL=https://gurktaler.duckdns.org

# Entwicklung (lokales Netzwerk)
VITE_WEBDAV_URL_DEV=https://192.168.x.x:5006
```

#### 4.2 WebDAV-Client Library installieren

```powershell
npm install webdav
```

#### 4.3 Sync-Service erstellen

Die Datei wurde bereits erstellt: `src/renderer/services/sync.ts`

**Datei:** `src/renderer/services/sync.ts`

```typescript
import { createClient, WebDAVClient } from "webdav";
import type {
  Note,
  Project,
  Product,
  Container,
  Recipe,
  Ingredient,
  Tag,
  Weblink,
  Contact,
  Image,
} from "@/shared/types";

interface SyncData {
  notes: Note[];
  projects: Project[];
  products: Product[];
  containers: Container[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  tags: Tag[];
  weblinks: Weblink[];
  contacts: Contact[];
  images: Image[];
  lastSync: string;
}

class SynologySync {
  private client: WebDAVClient | null = null;
  private syncInProgress = false;
  private serverUrl: string;
  private remotePath: string;
  private fileName: string;

  constructor() {
    this.serverUrl = import.meta.env.DEV
      ? import.meta.env.VITE_WEBDAV_URL_DEV || ""
      : import.meta.env.VITE_WEBDAV_URL || "";
    this.remotePath = import.meta.env.VITE_WEBDAV_PATH || "/Gurktaler";
    this.fileName = import.meta.env.VITE_WEBDAV_FILE || "data.json";
  }

  // WebDAV-Verbindung herstellen
  async connect(username: string, password: string): Promise<boolean> {
    try {
      this.client = createClient(this.serverUrl, {
        username,
        password,
      });

      // Verbindung testen
      await this.client.getDirectoryContents("/");

      // Credentials speichern (verschlüsselt wäre besser, aber für MVP ok)
      localStorage.setItem("webdav_username", username);
      localStorage.setItem("webdav_password", password);
      localStorage.setItem("webdav_url", this.serverUrl);

      console.log("✅ WebDAV-Verbindung hergestellt");
      return true;
    } catch (error) {
      console.error("❌ WebDAV-Verbindung fehlgeschlagen:", error);
      return false;
    }
  }

  // Verbindung trennen
  disconnect(): void {
    this.client = null;
    localStorage.removeItem("webdav_username");
    localStorage.removeItem("webdav_password");
    localStorage.removeItem("webdav_url");
  }

  // Prüfen ob verbunden
  isConnected(): boolean {
    const username = localStorage.getItem("webdav_username");
    const password = localStorage.getItem("webdav_password");

    if (username && password && !this.client) {
      // Auto-Reconnect
      this.client = createClient(this.serverUrl, { username, password });
    }

    return this.client !== null;
  }

  // Daten aus LocalStorage sammeln
  private collectLocalData(): SyncData {
    try {
      const persist = localStorage.getItem("persist:gurktaler");
      if (!persist) {
        throw new Error("Keine Daten in LocalStorage gefunden");
      }

      const parsed = JSON.parse(persist);

      return {
        notes: JSON.parse(parsed.notes || "[]"),
        projects: JSON.parse(parsed.projects || "[]"),
        products: JSON.parse(parsed.products || "[]"),
        containers: JSON.parse(parsed.containers || "[]"),
        recipes: JSON.parse(parsed.recipes || "[]"),
        ingredients: JSON.parse(parsed.ingredients || "[]"),
        tags: JSON.parse(parsed.tags || "[]"),
        weblinks: JSON.parse(parsed.weblinks || "[]"),
        contacts: JSON.parse(parsed.contacts || "[]"),
        images: JSON.parse(parsed.images || "[]"),
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Fehler beim Sammeln lokaler Daten:", error);
      return {
        notes: [],
        projects: [],
        products: [],
        containers: [],
        recipes: [],
        ingredients: [],
        tags: [],
        weblinks: [],
        contacts: [],
        images: [],
        lastSync: new Date().toISOString(),
      };
    }
  }

  // Daten in LocalStorage schreiben
  private writeLocalData(data: SyncData): void {
    try {
      const persist = JSON.parse(
        localStorage.getItem("persist:gurktaler") || "{}"
      );

      persist.notes = JSON.stringify(data.notes);
      persist.projects = JSON.stringify(data.projects);
      persist.products = JSON.stringify(data.products);
      persist.containers = JSON.stringify(data.containers);
      persist.recipes = JSON.stringify(data.recipes);
      persist.ingredients = JSON.stringify(data.ingredients);
      persist.tags = JSON.stringify(data.tags);
      persist.weblinks = JSON.stringify(data.weblinks);
      persist.contacts = JSON.stringify(data.contacts);
      persist.images = JSON.stringify(data.images);

      localStorage.setItem("persist:gurktaler", JSON.stringify(persist));
      localStorage.setItem("lastSync", data.lastSync);

      console.log("✅ Lokale Daten aktualisiert");
    } catch (error) {
      console.error("Fehler beim Schreiben lokaler Daten:", error);
    }
  }

  // Upload: LocalStorage → Synology
  async uploadData(): Promise<void> {
    if (!this.client) {
      throw new Error("Nicht verbunden. Bitte zuerst connect() aufrufen.");
    }

    if (this.syncInProgress) {
      console.log("Sync bereits aktiv, überspringe...");
      return;
    }

    this.syncInProgress = true;

    try {
      const data = this.collectLocalData();
      const jsonContent = JSON.stringify(data, null, 2);
      const remotePath = `${this.remotePath}/${this.fileName}`;

      // Prüfe ob Ordner existiert, falls nicht: erstellen
      try {
        await this.client.stat(this.remotePath);
      } catch {
        console.log("Erstelle Ordner:", this.remotePath);
        await this.client.createDirectory(this.remotePath);
      }

      // Datei hochladen
      await this.client.putFileContents(remotePath, jsonContent, {
        overwrite: true,
      });

      console.log("✅ Daten erfolgreich hochgeladen zu:", remotePath);
    } catch (error) {
      console.error("❌ Upload fehlgeschlagen:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Download: Synology → LocalStorage
  async downloadData(): Promise<void> {
    if (!this.client) {
      throw new Error("Nicht verbunden. Bitte zuerst connect() aufrufen.");
    }

    if (this.syncInProgress) {
      console.log("Sync bereits aktiv, überspringe...");
      return;
    }

    this.syncInProgress = true;

    try {
      const remotePath = `${this.remotePath}/${this.fileName}`;

      // Prüfe ob Datei existiert
      try {
        await this.client.stat(remotePath);
      } catch {
        console.log("Keine Remote-Daten gefunden, überspringe Download");
        return;
      }

      // Datei herunterladen
      const content = await this.client.getFileContents(remotePath, {
        format: "text",
      });

      const cloudData: SyncData = JSON.parse(content as string);

      // Merge-Strategie: Neueste Version gewinnt
      const localLastSync = localStorage.getItem("lastSync") || "1970-01-01";
      const cloudLastSync = cloudData.lastSync || "1970-01-01";

      if (cloudLastSync > localLastSync) {
        console.log("Cloud-Daten sind neuer, aktualisiere lokal...");
        this.writeLocalData(cloudData);

        // Seite neu laden um UI zu aktualisieren
        window.location.reload();
      } else {
        console.log("Lokale Daten sind aktuell");
      }
    } catch (error) {
      console.error("❌ Download fehlgeschlagen:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Bidirektionale Sync
  async sync(): Promise<void> {
    console.log("🔄 Starte Synchronisation...");
    await this.uploadData();
    await this.downloadData();
    console.log("✅ Synchronisation abgeschlossen");
  }

  // Sync-Status abrufen
  getSyncStatus(): {
    isConnected: boolean;
    lastSync: string | null;
    serverUrl: string;
  } {
    return {
      isConnected: this.isConnected(),
      lastSync: localStorage.getItem("lastSync"),
      serverUrl: this.serverUrl,
    };
  }
}

// Singleton-Instanz exportieren
export const synologySync = new SynologySync();
```

**✅ Phase 4 abgeschlossen!**

---

### **PHASE 5: Settings-Page erweitern** (Integration)

**Datei:** `src/renderer/pages/Settings.tsx`

Füge WebDAV-Sync-Sektion hinzu (nach imports):

```typescript
import { synologySync } from "@/renderer/services/sync";
import { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, Server } from "lucide-react";

// In der Settings-Component:

const [syncStatus, setSyncStatus] = useState(synologySync.getSyncStatus());
const [isSyncing, setIsSyncing] = useState(false);
const [statusMessage, setStatusMessage] = useState("");

// Login-Formular State
const [webdavUrl, setWebdavUrl] = useState(
  localStorage.getItem("webdav_url") || ""
);
const [webdavUsername, setWebdavUsername] = useState(
  localStorage.getItem("webdav_username") || ""
);
const [webdavPassword, setWebdavPassword] = useState("");

const handleConnect = async () => {
  if (!webdavUrl || !webdavUsername || !webdavPassword) {
    setStatusMessage("❌ Bitte alle Felder ausfüllen");
    return;
  }

  setStatusMessage("🔄 Verbinde...");
  const success = await synologySync.connect(webdavUsername, webdavPassword);

  if (success) {
    setSyncStatus(synologySync.getSyncStatus());
    setStatusMessage("✅ Verbindung hergestellt");
    setWebdavPassword(""); // Passwort löschen aus UI
  } else {
    setStatusMessage("❌ Verbindung fehlgeschlagen");
  }
};

const handleSync = async () => {
  setIsSyncing(true);
  setStatusMessage("🔄 Synchronisiere...");

  try {
    await synologySync.sync();
    setSyncStatus(synologySync.getSyncStatus());
    setStatusMessage("✅ Synchronisation erfolgreich");
  } catch (error) {
    setStatusMessage("❌ Synchronisation fehlgeschlagen");
  } finally {
    setIsSyncing(false);
  }
};

const handleDisconnect = () => {
  synologySync.disconnect();
  setSyncStatus(synologySync.getSyncStatus());
  setStatusMessage("Verbindung getrennt");
};

// JSX in Settings-Component einfügen:
<div className="bg-white rounded-lg shadow p-6 mb-6">
  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
    <Server className="w-5 h-5" />
    Synology WebDAV Synchronisation
  </h2>

  {!syncStatus.isConnected ? (
    <div>
      <p className="text-slate-600 mb-4">
        Verbinde dich mit deiner Synology NAS, um Daten zwischen 
        Desktop und Mobile zu synchronisieren.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            WebDAV-URL
          </label>
          <input
            type="text"
            value={webdavUrl}
            onChange={(e) => setWebdavUrl(e.target.value)}
            placeholder="https://gurktaler.duckdns.org:5006"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Benutzername
          </label>
          <input
            type="text"
            value={webdavUsername}
            onChange={(e) => setWebdavUsername(e.target.value)}
            placeholder="gurktaler_sync"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Passwort
          </label>
          <input
            type="password"
            value={webdavPassword}
            onChange={(e) => setWebdavPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          />
        </div>

        <button
          onClick={handleConnect}
          className="w-full px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          Verbinden
        </button>
      </div>
    </div>
  ) : (
    <div>
      <p className="text-slate-600 mb-3">
        ✅ Verbunden mit: <strong>{syncStatus.serverUrl}</strong>
      </p>
      
      {syncStatus.lastSync && (
        <p className="text-sm text-slate-500 mb-4">
          Letzte Synchronisation: {new Date(syncStatus.lastSync).toLocaleString("de-DE")}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          Jetzt synchronisieren
        </button>

        <button
          onClick={handleDisconnect}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Verbindung trennen
        </button>
      </div>
    </div>
  )}

  {statusMessage && (
    <p className="mt-3 text-sm text-slate-600">{statusMessage}</p>
  )}
</div>
```

**✅ Phase 5 abgeschlossen!**

---

### **PHASE 6: Auto-Sync beim App-Start** (Integration)

**Datei:** `src/renderer/App.tsx`

```typescript
import { useEffect } from "react";
import { synologySync } from "./services/sync";

function App() {
  useEffect(() => {
    // Beim App-Start: Automatischer Download
    if (synologySync.isConnected()) {
      console.log("Auto-Sync beim Start...");
      synologySync
        .downloadData()
        .catch((error) => console.error("Auto-Sync fehlgeschlagen:", error));
    }
  }, []);

  // Rest der Component...
}
```

**✅ Phase 6 abgeschlossen!**

---

### **PHASE 7: PWA-Build und Deployment** (Production)

#### 7.1 Production-Build erstellen

```powershell
# Im Projekt-Ordner
npm run build
```

Dies erstellt einen `dist/` Ordner mit der PWA.

#### 7.2 Build auf Synology hochladen

**Via File Station (GUI):**
1. Synology DSM → File Station
2. Navigiere zu `/web/gurktaler`
3. Alle Dateien aus lokalem `dist/` hochladen

**Via SSH/rsync (schneller):**
```powershell
# SSH in Synology aktivieren: Systemsteuerung → Terminal & SNMP
scp -r dist/* admin@gurktaler.duckdns.org:/volume1/web/gurktaler/
```

#### 7.3 Testen

1. Browser öffnen (Desktop oder Smartphone)
2. Gehe zu: `https://gurktaler.duckdns.org`
3. PWA sollte laden
4. Chrome/Edge: **"Zum Startbildschirm hinzufügen"** (auf Smartphone)

**✅ Phase 7 abgeschlossen!**

---

## 🚀 NUTZUNG IM WORKFLOW

### Szenario 1: Neue Notiz zu Hause (Rechner 1)

1. **Gurktaler.exe** öffnen (Rechner 1, Heim)
2. Bei erstem Start: **Settings** → WebDAV verbinden
   ```
   URL: https://192.168.x.x:5006 (lokales Netzwerk)
   Benutzer: gurktaler_sync
   Passwort: [dein Passwort]
   ```
3. Notiz erstellen: "Neue Rezeptur-Idee mit Enzian"
4. **Settings** → **"Jetzt synchronisieren"**
5. ✅ Daten auf Synology

### Szenario 2: Im Büro auf Notiz zugreifen (Rechner 2)

1. **Gurktaler.exe** öffnen (Rechner 2, Büro)
2. Bei erstem Start: **Settings** → WebDAV verbinden
   ```
   URL: https://gurktaler.duckdns.org:5006 (extern)
   Benutzer: gurktaler_sync
   Passwort: [dein Passwort]
   ```
3. App startet → **Auto-Sync** lädt Daten
4. ✅ Notiz "Neue Rezeptur-Idee mit Enzian" sichtbar
5. Labor-Messwerte hinzufügen
6. **Settings** → **"Jetzt synchronisieren"**

### Szenario 3: Unterwegs auf Messe (Smartphone)

1. **Browser** → `https://gurktaler.duckdns.org`
2. PWA installieren (Chrome: Menü → **Zum Startbildschirm hinzufügen**)
3. Bei erstem Start: **Settings** → WebDAV verbinden (gleiche Daten)
4. Offline funktioniert (Service Worker)
5. Foto von Konkurrenzprodukt 📸
6. Notiz: "Neue Verpackungsidee"
7. Bei Internetverbindung: Auto-Sync zu Synology

### Szenario 4: Zurück zu Hause

1. **Gurktaler.exe** öffnen (Rechner 1)
2. App startet → **Auto-Sync**
3. ✅ Foto und Notiz von Messe sichtbar
4. Projekt zuordnen

---

## 🔧 TROUBLESHOOTING

### Problem: "Verbindung fehlgeschlagen" in Settings

**Lösungen:**
1. Prüfe WebDAV-URL: `https://gurktaler.duckdns.org:5006` (Port nicht vergessen!)
2. Prüfe Benutzername/Passwort
3. Synology: WebDAV aktiviert? (Systemsteuerung → Dateidienste)
4. Router: Port 5006 weitergeleitet?
5. Firewall: Port 5006 erlaubt?
6. Zertifikat: Let's Encrypt gültig?

### Problem: "Sync fehlgeschlagen" - Upload Error

**Lösungen:**
1. Prüfe Schreibrechte: Benutzer `gurktaler_sync` hat Zugriff auf `/homes/gurktaler_sync/Gurktaler`?
2. Prüfe Speicherplatz auf Synology (File Station)
3. Prüfe Internetverbindung
4. Browser-Konsole öffnen (F12) → Netzwerk-Tab → Fehlerdetails

### Problem: PWA nicht erreichbar (https://gurktaler.duckdns.org)

**Lösungen:**
1. Prüfe DynDNS: Ist Domain aktiv? (DuckDNS.org Dashboard)
2. Prüfe Router: Port 443 weitergeleitet?
3. Prüfe Synology Web Station: Virtueller Host aktiv?
4. Prüfe Zertifikat: HTTPS-Zertifikat gültig?

### Problem: Konflikt - Daten auf beiden Geräten geändert

**Aktuelles Verhalten:**
- Neueste Version (höherer Timestamp) gewinnt
- Ältere Version wird überschrieben

**Zukünftige Lösung:**
- Manuelle Konfliktauflösung (Phase 10)
- UI zeigt beide Versionen
- Benutzer wählt

---

## 📊 DATENSPEICHERUNG

### LocalStorage-Struktur (gleich wie vorher)

```json
{
  "persist:gurktaler": { ... },
  "webdav_username": "gurktaler_sync",
  "webdav_password": "encrypted_or_plain",
  "webdav_url": "https://gurktaler.duckdns.org:5006",
  "lastSync": "2025-12-21T14:30:00.000Z"
}
```

### Synology-Struktur

```
/volume1/homes/gurktaler_sync/
└── Gurktaler/
    └── data.json (alle Entities + Bilder als Base64)
```

---

## 🎯 VORTEILE DIESER LÖSUNG

✅ **100% kostenlos** (keine Cloud-Abos)  
✅ **Volle Kontrolle** (Daten auf eigener Hardware)  
✅ **Unbegrenzter Speicher** (nur durch NAS-Größe limitiert)  
✅ **Offline-fähig** (LocalStorage + Service Worker)  
✅ **Einfache Auth** (Basic Auth, kein OAuth2-Drama)  
✅ **Standard-Protokoll** (WebDAV = gut dokumentiert)  
✅ **Überall erreichbar** (DynDNS oder QuickConnect)  

---

## 📞 NÄCHSTE SCHRITTE

### Sofort umsetzbar:
1. ✅ Phase 1: Synology WebDAV aktivieren
2. ✅ Phase 2: DynDNS konfigurieren (optional, erst wenn extern nötig)
3. ✅ Phase 3: Web Station für PWA (optional)
4. ✅ Phase 4-6: Code implementieren und testen

### Später (Production):
1. ✅ Phase 7: PWA-Build deployen
2. ✅ Electron-App auf Rechner 2 installieren
3. ✅ Testing: Sync zwischen allen 3 Geräten

---

**Viel Erfolg! 🚀**
