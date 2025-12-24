# ⚠️ VERALTET - OneDrive Sync Setup

**HINWEIS:** Diese Anleitung ist veraltet und nicht mehr gültig.

**Grund:** Microsoft hat die Anforderungen für App-Registrierungen verschärft. Eine kostenlose Registrierung ohne Zahlungsdaten ist nicht mehr möglich.

---

## ✅ Aktuelle Lösung: Synology WebDAV Sync

Bitte verwende stattdessen die **Synology-basierte Sync-Lösung**:

📄 **[SYNOLOGY_SYNC_SETUP.md](SYNOLOGY_SYNC_SETUP.md)**

### Vorteile der Synology-Lösung:
- ✅ 100% kostenlos (keine Cloud-Abos)
- ✅ Volle Kontrolle über deine Daten
- ✅ Unbegrenzter Speicher (nur durch NAS-Größe limitiert)
- ✅ Keine Microsoft-Abhängigkeit
- ✅ Standard WebDAV-Protokoll
- ✅ Einfache Basic-Auth (kein OAuth2)

---

## Archivierte OneDrive-Dokumentation

Die folgende Dokumentation bleibt als Referenz erhalten, ist aber **nicht mehr umsetzbar**:

---

# OneDrive Sync Setup - Vollständige Anleitung

**Datum:** 21. Dezember 2025  
**Projekt:** Gurktaler 2.0  
**Ziel:** Synchronisation zwischen Desktop-App (2 Rechner) und Mobile-App (Smartphone) via OneDrive

---

## 📋 Workflow-Übersicht

```
┌──────────────────────────────────────────────────────────────┐
│                     DEINE ARBEITSUMGEBUNG                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 ZUHAUSE (Heimnetzwerk)                                   │
│     💻 Rechner 1: Gurktaler.exe                              │
│     🖥️  Synology DS 124 (PWA-Hosting + Datenspeicher)       │
│                                                              │
│  🏢 BÜRO (kein eigenes Netzwerk)                             │
│     💻 Rechner 2: Gurktaler.exe                              │
│     🔬 Labor: Produktentwicklung → Daten in App              │
│                                                              │
│  🚗 UNTERWEGS (Storechecks, Messen, Veranstaltungen)         │
│     📱 Smartphone: PWA (über https://gurktaler.deinedomain)  │
│     📸 Schnappschüsse + Notizen → OneDrive                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                           ↓ ↑ SYNC ↓ ↑
                           
                    ☁️  Microsoft OneDrive
                    (5GB kostenlos)
```

### Datenfluss

1. **Rechner 1 (Heim)** → Notiz erstellen → OneDrive Upload
2. **OneDrive** → Sync
3. **Rechner 2 (Büro)** → Gurktaler.exe öffnen → Download von OneDrive → Notiz sichtbar
4. **Smartphone** → Foto auf Messe → OneDrive Upload
5. **Rechner 1/2** → Foto in Projekt sichtbar

---

## 🎯 Architektur-Entscheidung

### Desktop-App (Gurktaler.exe)
- **Technologie:** Electron + React + TypeScript
- **Speicherung:** LocalStorage (lokal auf Rechner)
- **Sync:** OneDrive Microsoft Graph API
- **OAuth2 Flow:** Deviceflow oder Browser-basiert
- **Nutzung:** Hauptarbeitsplatz (Heim + Büro)

### Mobile-App (PWA)
- **Technologie:** React Progressive Web App
- **Hosting:** Synology NAS Web Station (HTTPS)
- **URL:** `https://gurktaler.deinedomain.de` oder `gurktaler.synology.me`
- **Speicherung:** LocalStorage im Browser
- **Sync:** OneDrive Microsoft Graph API (gleiche wie Desktop)
- **Offline:** Service Worker cacht App + Daten
- **Nutzung:** Unterwegs (Smartphone/Tablet)

---

## 📝 SCHRITT-FÜR-SCHRITT-ANLEITUNG

---

### **PHASE 1: Microsoft Azure App Registration** (15 Minuten)

#### 1.1 Azure Portal öffnen

1. Gehe zu: https://portal.azure.com/
2. Melde dich mit deinem Microsoft-Konto an
3. Suche nach **"App-Registrierungen"** oder gehe zu:  
   https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

#### 1.2 Neue App erstellen

1. Klicke auf **"+ Neue Registrierung"**
2. Fülle das Formular aus:

   ```
   Name der Anwendung: Gurktaler 2.0
   
   Unterstützte Kontotypen:
   ● Nur Konten in diesem Organisationsverzeichnis
     (Nur dieses Verzeichnis - Einzelner Mandant)
   
   Umleitungs-URI (optional):
   [Typ: Einzelseitenanwendung (SPA)]
   http://localhost:3000
   ```

3. Klicke **"Registrieren"**

#### 1.3 Client-ID und Tenant-ID notieren

Nach der Registrierung siehst du die Übersichtsseite:

```
┌─────────────────────────────────────────┐
│ Anwendungs-ID (Client):                 │
│ 12345678-abcd-1234-abcd-123456789abc    │ ← WICHTIG: Kopieren!
├─────────────────────────────────────────┤
│ Verzeichnis-ID (Mandant):               │
│ 87654321-dcba-4321-dcba-cba987654321    │ ← WICHTIG: Kopieren!
└─────────────────────────────────────────┘
```

**Speichere diese IDs in einer Textdatei!**

#### 1.4 API-Berechtigungen hinzufügen

1. Im linken Menü: **"API-Berechtigungen"**
2. Klicke **"+ Berechtigung hinzufügen"**
3. Wähle **"Microsoft Graph"**
4. Wähle **"Delegierte Berechtigungen"**
5. Suche und aktiviere:
   - ✅ `Files.ReadWrite` (OneDrive-Dateien lesen/schreiben)
   - ✅ `Files.ReadWrite.All` (Alle Dateien)
   - ✅ `offline_access` (Refresh-Token für dauerhafte Anmeldung)
   - ✅ `User.Read` (Benutzerprofil abrufen)
6. Klicke **"Berechtigungen hinzufügen"**
7. Klicke **"Administratoreinwilligung für [Dein Name] erteilen"** (blauer Button oben)

#### 1.5 Weitere Redirect-URIs hinzufügen (später)

1. Im linken Menü: **"Authentifizierung"**
2. Unter **"Plattformkonfigurationen"** → **"Einzelseitenanwendung"**
3. Füge später hinzu:
   ```
   https://gurktaler.synology.me (oder deine eigene Domain)
   ```
4. Speichern

**✅ Phase 1 abgeschlossen!**

---

### **PHASE 2: Synology NAS als PWA-Host konfigurieren** (30-45 Minuten)

#### 2.1 DynDNS oder QuickConnect einrichten

**Option A: Synology QuickConnect (einfachste Lösung)**

1. Synology DSM öffnen
2. **Systemsteuerung** → **QuickConnect**
3. QuickConnect aktivieren
4. QuickConnect-ID wählen (z.B. `gurktaler2024`)
5. Deine URL: `https://gurktaler2024.quickconnect.to`

**Option B: Eigene Domain mit DynDNS (empfohlen)**

1. Domain kaufen oder kostenlosen DynDNS-Service nutzen:
   - DuckDNS.org (kostenlos)
   - No-IP.com (kostenlos)
2. Synology DSM: **Systemsteuerung** → **Externer Zugriff** → **DDNS**
3. Hinzufügen → Anbieter auswählen → Domain eintragen
4. Beispiel: `gurktaler.duckdns.org`

#### 2.2 HTTPS-Zertifikat (Let's Encrypt)

1. Synology DSM: **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. **Hinzufügen** → **Neues Zertifikat hinzufügen**
3. Wähle **"Zertifikat von Let's Encrypt abrufen"**
4. Trage deine Domain ein (z.B. `gurktaler.duckdns.org`)
5. E-Mail-Adresse eingeben
6. **Übernehmen** → Zertifikat wird automatisch erstellt

#### 2.3 Web Station installieren

1. **Paket-Zentrum** öffnen
2. Suche nach **"Web Station"**
3. Installieren
4. Nach Installation öffnen

#### 2.4 Web Station konfigurieren

1. **Web Station** öffnen
2. **Allgemeine Einstellungen**:
   - PHP: Nicht erforderlich (statische PWA)
   - HTTP Backend-Server: Nginx (Standard)
3. **Virtueller Host erstellen**:
   - Klicke **"Virtuellen Host erstellen"**
   - Hostname: `gurktaler.duckdns.org` (deine Domain)
   - Port: HTTPS (443)
   - Dokumentenstamm: `/web/gurktaler` (wird gleich erstellt)
   - HTTP/2: Aktivieren ✅
   - HSTS: Aktivieren ✅

#### 2.5 Ordnerstruktur vorbereiten

1. **File Station** öffnen
2. Navigiere zu `/web`
3. Neuen Ordner erstellen: `gurktaler`
4. In diesen Ordner werden später die Build-Dateien hochgeladen

**✅ Phase 2 abgeschlossen!**

---

### **PHASE 3: Code-Implementierung (Sync-Service)** (Entwicklung)

#### 3.1 Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei im Projekt-Root:

```env
# Microsoft Azure App Registration
VITE_AZURE_CLIENT_ID=12345678-abcd-1234-abcd-123456789abc
VITE_AZURE_TENANT_ID=87654321-dcba-4321-dcba-cba987654321

# Redirect URIs
VITE_REDIRECT_URI_DEV=http://localhost:3000
VITE_REDIRECT_URI_PROD=https://gurktaler.duckdns.org

# OneDrive API
VITE_ONEDRIVE_API_BASE=https://graph.microsoft.com/v1.0
```

#### 3.2 Microsoft Authentication Library installieren

```powershell
npm install @azure/msal-browser
```

#### 3.3 Sync-Service erstellen

**Datei:** `src/renderer/services/sync.ts`

```typescript
import { PublicClientApplication } from "@azure/msal-browser";
import type { 
  Note, Project, Product, Container, Recipe, Ingredient, Tag, Weblink, Contact, Image 
} from "@/shared/types";

// MSAL-Konfiguration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.DEV 
      ? import.meta.env.VITE_REDIRECT_URI_DEV 
      : import.meta.env.VITE_REDIRECT_URI_PROD,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// OneDrive Sync Service
class OneDriveSync {
  private accessToken: string | null = null;
  private syncInProgress = false;

  // Authentifizierung
  async login(): Promise<boolean> {
    try {
      const loginRequest = {
        scopes: ["Files.ReadWrite", "offline_access", "User.Read"],
      };

      const response = await msalInstance.loginPopup(loginRequest);
      this.accessToken = response.accessToken;
      
      // Token in LocalStorage für späteren Zugriff
      localStorage.setItem("onedrive_token", this.accessToken);
      localStorage.setItem("onedrive_user", response.account?.username || "");
      
      return true;
    } catch (error) {
      console.error("OneDrive Login failed:", error);
      return false;
    }
  }

  // Token aktualisieren (silent)
  async refreshToken(): Promise<void> {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) throw new Error("No accounts found");

      const response = await msalInstance.acquireTokenSilent({
        scopes: ["Files.ReadWrite", "offline_access"],
        account: accounts[0],
      });

      this.accessToken = response.accessToken;
      localStorage.setItem("onedrive_token", this.accessToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Fallback: Popup-Login
      await this.login();
    }
  }

  // Logout
  async logout(): Promise<void> {
    await msalInstance.logoutPopup();
    this.accessToken = null;
    localStorage.removeItem("onedrive_token");
    localStorage.removeItem("onedrive_user");
  }

  // Prüfen ob eingeloggt
  isAuthenticated(): boolean {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 || this.accessToken !== null;
  }

  // Upload: LocalStorage → OneDrive
  async uploadData(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      if (!this.accessToken) await this.refreshToken();

      // Alle Daten aus LocalStorage sammeln
      const data = {
        notes: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"notes":"(.*)"/)?.[1] || "[]"),
        projects: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"projects":"(.*)"/)?.[1] || "[]"),
        products: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"products":"(.*)"/)?.[1] || "[]"),
        containers: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"containers":"(.*)"/)?.[1] || "[]"),
        recipes: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"recipes":"(.*)"/)?.[1] || "[]"),
        ingredients: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"ingredients":"(.*)"/)?.[1] || "[]"),
        tags: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"tags":"(.*)"/)?.[1] || "[]"),
        weblinks: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"weblinks":"(.*)"/)?.[1] || "[]"),
        contacts: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"contacts":"(.*)"/)?.[1] || "[]"),
        images: JSON.parse(localStorage.getItem("persist:gurktaler")?.match(/"images":"(.*)"/)?.[1] || "[]"),
        lastSync: new Date().toISOString(),
      };

      // OneDrive Ordner erstellen falls nicht existiert
      await this.ensureFolder("Gurktaler");

      // Daten als JSON hochladen
      await this.uploadFile("Gurktaler/data.json", JSON.stringify(data, null, 2));

      console.log("✅ Sync completed: Upload to OneDrive");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Download: OneDrive → LocalStorage
  async downloadData(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      if (!this.accessToken) await this.refreshToken();

      // Daten von OneDrive abrufen
      const response = await fetch(
        `${import.meta.env.VITE_ONEDRIVE_API_BASE}/me/drive/root:/Gurktaler/data.json:/content`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No data on OneDrive yet, skipping download");
          return;
        }
        throw new Error(`OneDrive API error: ${response.status}`);
      }

      const cloudData = await response.json();

      // Merge-Strategie: Neueste Version gewinnt
      const localLastSync = localStorage.getItem("lastSync") || "1970-01-01";
      const cloudLastSync = cloudData.lastSync || "1970-01-01";

      if (cloudLastSync > localLastSync) {
        // Cloud ist neuer → Lokale Daten überschreiben
        const persist = JSON.parse(localStorage.getItem("persist:gurktaler") || "{}");
        persist.notes = JSON.stringify(cloudData.notes);
        persist.projects = JSON.stringify(cloudData.projects);
        persist.products = JSON.stringify(cloudData.products);
        persist.containers = JSON.stringify(cloudData.containers);
        persist.recipes = JSON.stringify(cloudData.recipes);
        persist.ingredients = JSON.stringify(cloudData.ingredients);
        persist.tags = JSON.stringify(cloudData.tags);
        persist.weblinks = JSON.stringify(cloudData.weblinks);
        persist.contacts = JSON.stringify(cloudData.contacts);
        persist.images = JSON.stringify(cloudData.images);
        localStorage.setItem("persist:gurktaler", JSON.stringify(persist));
        localStorage.setItem("lastSync", cloudLastSync);

        console.log("✅ Sync completed: Downloaded from OneDrive");
        
        // Seite neu laden um Daten anzuzeigen
        window.location.reload();
      } else {
        console.log("Local data is up-to-date");
      }
    } catch (error) {
      console.error("❌ Download failed:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Bidirektionale Sync (Upload + Download)
  async sync(): Promise<void> {
    await this.uploadData();
    await this.downloadData();
  }

  // Helper: OneDrive Ordner erstellen
  private async ensureFolder(folderName: string): Promise<void> {
    try {
      await fetch(
        `${import.meta.env.VITE_ONEDRIVE_API_BASE}/me/drive/root/children`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: folderName,
            folder: {},
            "@microsoft.graph.conflictBehavior": "fail",
          }),
        }
      );
    } catch (error) {
      // Ordner existiert bereits - ignorieren
    }
  }

  // Helper: Datei auf OneDrive hochladen
  private async uploadFile(path: string, content: string): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_ONEDRIVE_API_BASE}/me/drive/root:/${path}:/content`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: content,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
  }
}

// Singleton-Instanz exportieren
export const oneDriveSync = new OneDriveSync();
```

#### 3.4 Settings-Page erweitern

**Datei:** `src/renderer/pages/Settings.tsx`

Füge eine neue Sektion für OneDrive-Sync hinzu:

```typescript
import { oneDriveSync } from "@/renderer/services/sync";
import { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

// In der Settings-Component:

const [isSyncing, setIsSyncing] = useState(false);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [syncStatus, setSyncStatus] = useState<string>("");

useEffect(() => {
  setIsAuthenticated(oneDriveSync.isAuthenticated());
}, []);

const handleLogin = async () => {
  const success = await oneDriveSync.login();
  if (success) {
    setIsAuthenticated(true);
    setSyncStatus("✅ Erfolgreich angemeldet");
  }
};

const handleSync = async () => {
  setIsSyncing(true);
  setSyncStatus("🔄 Synchronisierung läuft...");
  try {
    await oneDriveSync.sync();
    setSyncStatus("✅ Synchronisierung abgeschlossen");
  } catch (error) {
    setSyncStatus("❌ Fehler bei der Synchronisierung");
  } finally {
    setIsSyncing(false);
  }
};

const handleLogout = async () => {
  await oneDriveSync.logout();
  setIsAuthenticated(false);
  setSyncStatus("Abgemeldet");
};

// JSX:
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
    <Cloud className="w-5 h-5" />
    OneDrive Synchronisation
  </h2>

  {!isAuthenticated ? (
    <div>
      <p className="text-slate-600 mb-4">
        Melde dich mit deinem Microsoft-Konto an, um Daten zwischen 
        Desktop und Mobile zu synchronisieren.
      </p>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Mit Microsoft anmelden
      </button>
    </div>
  ) : (
    <div>
      <p className="text-slate-600 mb-4">
        ✅ Angemeldet: {localStorage.getItem("onedrive_user")}
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          Jetzt synchronisieren
        </button>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Abmelden
        </button>
      </div>

      {syncStatus && (
        <p className="mt-3 text-sm text-slate-600">{syncStatus}</p>
      )}
    </div>
  )}
</div>
```

#### 3.5 Auto-Sync beim App-Start

**Datei:** `src/renderer/App.tsx`

```typescript
import { useEffect } from "react";
import { oneDriveSync } from "./services/sync";

function App() {
  useEffect(() => {
    // Beim App-Start: Daten von OneDrive laden
    if (oneDriveSync.isAuthenticated()) {
      oneDriveSync.downloadData().catch(console.error);
    }
  }, []);

  // Rest der Component...
}
```

**✅ Phase 3 abgeschlossen!**

---

### **PHASE 4: PWA-Build und Deployment auf Synology** (20 Minuten)

#### 4.1 Production-Build erstellen

```powershell
# Im Projekt-Ordner (c:\Users\wolfg\Desktop\zweipunktnullVS)
npm run build
```

Dies erstellt einen `dist/` Ordner mit der kompilierten PWA.

#### 4.2 Build-Dateien auf Synology hochladen

**Option A: Über File Station (GUI)**
1. Synology DSM → File Station öffnen
2. Navigiere zu `/web/gurktaler`
3. Alle Dateien aus dem lokalen `dist/` Ordner hochladen
   - `index.html`
   - `manifest.json`
   - `assets/` (Ordner mit JS/CSS)
   - `icon-192.png`, `icon-512.png`

**Option B: Über SSH/rsync (schneller)**
```powershell
# SSH aktivieren in Synology DSM: Systemsteuerung → Terminal & SNMP
# Von Windows aus (PowerShell):
scp -r dist/* admin@192.168.x.x:/volume1/web/gurktaler/
```

#### 4.3 Testen

1. Öffne Browser (Desktop oder Smartphone)
2. Gehe zu `https://gurktaler.duckdns.org`
3. PWA sollte laden
4. In Chrome/Edge: Menü → **"Zum Startbildschirm hinzufügen"** (auf Smartphone)

**✅ Phase 4 abgeschlossen!**

---

### **PHASE 5: Electron-App für Production** (10 Minuten)

#### 5.1 .env.local in die kompilierte App einbinden

Electron muss die Umgebungsvariablen ebenfalls kennen.

**Datei:** `electron/main.ts`

```typescript
// Lade Umgebungsvariablen
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Rest des Codes...
```

#### 5.2 Electron-App builden

```powershell
npm run build
npm run electron:build
```

Dies erstellt eine `.exe` Datei in `dist-electron/`.

#### 5.3 Deployment

1. Kopiere die `.exe` auf **Rechner 1** (Heim)
2. Kopiere die `.exe` auf **Rechner 2** (Büro)
3. Optional: Auf USB-Stick für portable Nutzung

**✅ Phase 5 abgeschlossen!**

---

## 🚀 NUTZUNG IM WORKFLOW

### Szenario 1: Neue Notiz zu Hause (Rechner 1)

1. **Gurktaler.exe** öffnen (Rechner 1, Heim)
2. Notiz erstellen: "Neue Rezeptur-Idee mit Enzian"
3. Speichern (lokal in LocalStorage)
4. **Settings** → **"Jetzt synchronisieren"** klicken
5. ✅ Daten werden zu OneDrive hochgeladen

### Szenario 2: Im Büro auf Notiz zugreifen (Rechner 2)

1. **Gurktaler.exe** öffnen (Rechner 2, Büro)
2. App startet → **Auto-Sync** läuft im Hintergrund
3. ✅ Notiz "Neue Rezeptur-Idee mit Enzian" ist sichtbar
4. Ergänzung: Labor-Messwerte hinzufügen
5. **Settings** → **"Jetzt synchronisieren"**
6. ✅ Änderungen zu OneDrive hochgeladen

### Szenario 3: Unterwegs auf Messe (Smartphone)

1. **Browser** öffnen → `https://gurktaler.duckdns.org`
2. PWA lädt (auch offline durch Service Worker)
3. Quick-Note öffnen (grüner FAB-Button)
4. Foto von Konkurrenzprodukt machen 📸
5. Notiz: "Neue Verpackungsidee gesehen"
6. Speichern → **Auto-Sync** zu OneDrive
7. ✅ Daten in der Cloud

### Szenario 4: Zurück zu Hause - Daten synchronisieren

1. **Gurktaler.exe** öffnen (Rechner 1, Heim)
2. App startet → **Auto-Sync** läuft
3. ✅ Foto und Notiz von Messe sind sichtbar
4. Notiz zu Projekt zuordnen: **Projekte** → "Verpackungsdesign 2025" → Notiz verlinken

---

## 🔧 TROUBLESHOOTING

### Problem: "Login failed" beim OneDrive-Login

**Lösung:**
1. Prüfe, ob die Client-ID korrekt in `.env.local` eingetragen ist
2. Azure Portal: Prüfe, ob Redirect-URI korrekt ist (`http://localhost:3000` oder deine Domain)
3. Prüfe Browser-Konsole für Fehlermeldungen (F12)

### Problem: "Sync failed" - Daten werden nicht hochgeladen

**Lösung:**
1. Prüfe Internetverbindung
2. Prüfe OneDrive-Speicherplatz (5GB Limit)
3. Browser-Konsole öffnen (F12) → Fehlermeldung kopieren
4. Token abgelaufen? → **Abmelden** und **erneut anmelden**

### Problem: PWA auf Synology nicht erreichbar

**Lösung:**
1. Prüfe DynDNS: Ist Domain korrekt konfiguriert?
2. Prüfe Router-Portfreigabe: Port 443 (HTTPS) auf Synology weiterleiten
3. Synology Firewall: Port 443 erlauben
4. Web Station: Prüfe, ob virtueller Host aktiv ist

### Problem: Konflikt - Daten auf beiden Geräten geändert

**Aktuell:** Neueste Version überschreibt ältere (Cloud-Timestamp gewinnt)

**Später:** Manuelle Konfliktauflösung implementieren (Phase 10 der Todo-Liste)

---

## 📊 DATENSPEICHERUNG

### LocalStorage-Struktur

```json
{
  "persist:gurktaler": {
    "notes": "[{id: '1', title: 'Notiz', ...}]",
    "projects": "[...]",
    "products": "[...]",
    "containers": "[...]",
    "recipes": "[...]",
    "ingredients": "[...]",
    "tags": "[...]",
    "weblinks": "[...]",
    "contacts": "[...]",
    "images": "[{id: '1', data_url: 'data:image/png;base64,...'}]"
  },
  "onedrive_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "onedrive_user": "wolfgang@example.com",
  "lastSync": "2025-12-21T14:30:00.000Z"
}
```

### OneDrive-Struktur

```
OneDrive Root
└── Gurktaler/
    └── data.json (alle Entities + Bilder als Base64)
```

**Hinweis:** Bilder werden als Base64 in JSON gespeichert. Bei sehr großen Datenmengen kann später eine Optimierung erfolgen (separate Bild-Dateien).

---

## 🎯 NÄCHSTE SCHRITTE

### Sofort umsetzbar:
1. ✅ Azure App Registration (Phase 1)
2. ✅ Client-ID in `.env.local` eintragen
3. ✅ Code implementieren (Phase 3)
4. ✅ Testen im Dev-Mode (`npm run dev`)

### Später (wenn PWA gebraucht wird):
1. ✅ Synology NAS konfigurieren (Phase 2)
2. ✅ Production-Build erstellen und hochladen (Phase 4)
3. ✅ Redirect-URI in Azure anpassen

---

## 📞 SUPPORT & DOKUMENTATION

- **Microsoft Graph API Docs:** https://learn.microsoft.com/en-us/graph/api/overview
- **MSAL.js Dokumentation:** https://github.com/AzureAD/microsoft-authentication-library-for-js
- **Synology DynDNS:** https://kb.synology.com/de-de/DSM/help/DSM/AdminCenter/connection_ddns
- **Synology Web Station:** https://kb.synology.com/de-de/DSM/help/WebStation/application_webserv_virtualhost

---

**Viel Erfolg bei der Umsetzung! 🚀**
