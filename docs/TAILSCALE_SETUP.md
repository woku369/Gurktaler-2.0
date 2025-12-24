# Tailscale VPN Setup für Gurktaler 2.0

**Problem gelöst:** Carrier-Grade NAT (CGNAT) verhindert Port-Forwarding und DynDNS → Tailscale umgeht das komplett!

**Ziel:** 3 Arbeitsplätze (Heim, Büro, Smartphone) greifen auf Synology NAS zu, als wären sie im gleichen Netzwerk.

---

## ✅ Vorteile von Tailscale

- **Funktioniert mit CGNAT** (keine Port-Freigaben nötig)
- **Kostenlos** für persönlichen Gebrauch (bis 100 Geräte)
- **Einfach:** 5 Minuten Setup
- **Sicher:** WireGuard-Verschlüsselung
- **Schnell:** Direkter P2P-Zugriff (kein Relay-Server nötig)
- **Multi-Plattform:** Windows, macOS, Linux, iOS, Android, NAS

---

## 📋 Schritt 1: Tailscale Account erstellen

1. Öffne https://tailscale.com
2. Klicke **"Get started"** → **"Sign up"**
3. Login mit:
   - Google Account
   - Microsoft Account
   - GitHub Account
   - Apple ID
4. Bestätige E-Mail-Adresse
5. Fertig! → Du hast jetzt ein **Tailnet** (dein privates VPN-Netzwerk)

---

## 🖥️ Schritt 2: Synology NAS einbinden

### 2.1 Tailscale auf Synology installieren

1. **DSM öffnen** → Paket-Zentrum
2. **Einstellungen** (oben rechts) → Paketquellen → **Hinzufügen**:
   - **Name:** `SynoCommunity`
   - **Ort:** `https://packages.synocommunity.com/`
   - **OK** klicken
3. **Community** (linke Sidebar) → **Tailscale** suchen
4. **Installieren** klicken
5. Warten bis Installation abgeschlossen

### 2.2 Tailscale auf Synology konfigurieren

1. **Hauptmenü** → **Tailscale** öffnen
2. **"Authenticate"** klicken
3. Browser öffnet sich → Mit Tailscale-Account einloggen (z.B. GitHub Account)
4. **"Connect"** erlauben
5. Zurück zu DSM → Status sollte **"Connected"** zeigen
6. **Wichtig:** Notiere die **Tailscale-IP** und den **Hostname**
   - Beispiel: `ds124-rockingk` mit IP `100.121.103.107`
   - Diese findest du auch in der Tailscale Admin Console

### 2.3 SMB/CIFS Freigabe prüfen

1. **Systemsteuerung** → **Dateidienste** → **SMB/AFP/NFS**
2. SMB sollte bereits **aktiviert** sein (Standard bei Synology)
3. ✅ Falls aktiviert → weiter zu Schritt 3
4. ℹ️ Falls nicht aktiviert:
   - **SMB aktivieren** anhaken
   - **Erweiterte Einstellungen** → **Andere**
   - Unter **"Schnittstellen"** → **"Alle Netzwerke"** auswählen
   - **Übernehmen**

---

## 💻 Schritt 3: Rechner 1 (Heim) einbinden

### 3.1 Tailscale Client installieren

1. Download: https://tailscale.com/download/windows
2. **tailscale-setup.exe** ausführen
3. Installation durchlaufen
4. **"Sign in"** → Browser öffnet sich
5. Mit deinem Tailscale-Account einloggen
6. **"Connect"** erlauben

### 3.2 Verbindung testen

1. **Taskleiste** → Tailscale-Icon (Rechtsklick) → **"Admin console"**
2. Du siehst jetzt 2 Geräte:
   - Dein PC (z.B. `DESKTOP-ABC123`)
   - Deine Synology (z.B. `ds124-rockingk`)
3. **Notiere die Tailscale-IP** deiner Synology (z.B. `100.121.103.107`)
4. **Windows Explorer** öffnen → Adressleiste:
   ```
   \\100.121.103.107\Gurktaler
   ```
   *(Ersetze mit deiner Synology Tailscale-IP)*
5. Login mit DSM-Credentials
6. ✅ Funktioniert? → Perfekt!

### 3.3 Netzlaufwerk verbinden (empfohlen)

1. **Windows Explorer** → Rechtsklick auf **"Dieser PC"**
2. **"Netzlaufwerk verbinden..."**
3. **Laufwerk:** `Y:`
4. **Ordner:** `\\100.121.103.107\Gurktaler`
   *(Ersetze mit deiner Synology Tailscale-IP)*
5. ☑️ **"Verbindung bei Anmeldung wiederherstellen"**
6. **Fertig stellen**
7. Login mit DSM-Credentials
8. **Fertig!** → `Y:\` ist jetzt dein Synology-Ordner
9. ✅ Test: Erstelle eine Testdatei auf `Y:\` und prüfe ob sie auf der Synology erscheint

---

## 🏢 Schritt 4: Rechner 2 (Büro) einbinden

**Gleiche Schritte wie Rechner 1:**

1. Tailscale Client installieren (siehe Schritt 3.1)
2. Mit deinem Account einloggen
3. Netzlaufwerk `Y:` verbinden → `\\100.64.0.1\Gurktaler`

**Das war's!** Dein Büro-Rechner kann jetzt auf die Synology zugreifen, als wärst du im Heimnetz.

---

## 📱 Schritt 5: Smartphone einbinden

### 5.1 Tailscale App installieren

**iOS:**
1. App Store → "Tailscale" suchen
2. **Installieren**
3. App öffnen → **"Sign in"**
4. Mit deinem Account einloggen
5. VPN-Profil installieren (iOS fragt)
6. **"Connect"** aktivieren

**Android:**
1. Play Store → "Tailscale" suchen
2. **Installieren**
3. App öffnen → **"Sign in"**
4. Mit deinem Account einloggen
5. VPN-Berechtigung erlauben
6. **"Connect"** aktivieren

### 5.2 Synology File App nutzen

**Für Smartphone-Zugriff gibt es 2 Wege:**

**Option A: Dateimanager-App (empfohlen)**
1. **Android:** Solid Explorer, FX File Explorer (unterstützen SMB)
2. **iOS:** Documents by Readdle, FE File Explorer
3. In der App → **"Neue Verbindung"** → **SMB/CIFS**
4. **Server:** `100.64.0.1` (Synology Tailscale-IP)
5. **Freigabe:** `Gurktaler`
6. **Username/Passwort:** DSM-Credentials
7. Verbinden → ✅ Zugriff!

**Option B: Synology Drive App**
1. **Synology Drive** installieren (App Store / Play Store)
2. App öffnen → **"Server hinzufügen"**
3. **QuickConnect-ID** ODER **Tailscale-IP** (`100.64.0.1`)
4. Login mit DSM-Credentials
5. Ordner "Gurktaler" auswählen
6. Optional: Offline-Zugriff aktivieren

**Für Gurktaler 2.0 App (später als PWA):**
- Smartphone öffnet PWA → App läuft im Browser
- Browser kann keine SMB-Freigaben öffnen
- → Synology Drive oder WebDAV-Lösung nötig (für mobile Web-Version)

---

## 🚀 Schritt 6: Gurktaler 2.0 App konfigurieren

### 6.1 Netzwerkpfad in App eintragen

**Rechner 1 & 2:**

1. **App öffnen** → **Settings** (Zahnrad)
2. Runterscrollen zu **"Synology Netzwerk-Synchronisation"**
3. **Netzwerkpfad** eingeben:
   ```
   Y:\zweipunktnull\data.json
   ```
   *(falls Laufwerk verbunden)*
   
   **ODER** (ohne Laufwerksbuchstabe):
   ```
   \\100.121.103.107\Gurktaler\zweipunktnull\data.json
   ```
   *(Ersetze `100.121.103.107` mit deiner Synology Tailscale-IP)*

4. **"Verbindung testen"** klicken
5. ✅ **"Netzwerkpfad erreichbar"** → Perfekt!

### 6.2 Erste Synchronisation

1. **"Jetzt synchronisieren"** klicken
2. Beim **ersten Mal:**
   - Wenn `data.json` noch nicht existiert → wird erstellt
   - Alle lokalen Daten werden hochgeladen
3. **Folgende Male:**
   - Download: Cloud → Lokal (wenn Cloud neuer)
   - Upload: Lokal → Cloud (immer)

---

## 📊 Workflow: 3 Arbeitsplätze

### Szenario 1: Von Heim zu Büro

**Heim (Rechner 1):**
1. Notiz erstellen: "Messe Innsbruck - Stand 42"
2. Sync klicken → `data.json` wird auf Synology gespeichert
3. Rechner ausschalten, ins Büro fahren

**Büro (Rechner 2):**
1. Tailscale aktivieren (automatisch bei Windows-Start)
2. App öffnen → Auto-Sync beim Start lädt neue Daten
3. ✅ Notiz "Messe Innsbruck" ist da!
4. Notiz ergänzen, Sync klicken
5. Zurück ins Heim fahren

**Heim (Rechner 1):**
1. App öffnen → Auto-Sync
2. ✅ Ergänzungen vom Büro sind da!

### Szenario 2: Smartphone unterwegs

**Unterwegs (Messe):**
1. Tailscale VPN aktivieren (Smartphone)
2. Synology Drive App öffnen
3. Ordner "Gurktaler" → `data.json` ansehen
4. Foto mit Kamera-App machen
5. Foto in Synology Drive hochladen → Ordner "Gurktaler/images/"
6. Nach Hause kommen

**Heim (Rechner 1):**
1. App öffnen → Sync
2. Neue Bilder werden heruntergeladen
3. ✅ Messe-Fotos sind in der App!

---

## 🔧 Troubleshooting

### Problem: "Netzwerkpfad nicht erreichbar"

**Lösung:**
1. **Tailscale aktiv?** → Taskbar-Icon prüfen (grün = verbunden)
2. **Synology online?** → Admin Console: Ist NAS-Gerät "Connected"?
3. **Ping-Test:**
   ```powershell
   ping 100.64.0.1
   ```
   *(Ersetze mit deiner Synology Tailscale-IP)*
4. **SMB-Test:**
   ```powershell
   Test-NetConnection -ComputerName 100.64.0.1 -Port 445
   ```

### Problem: "Verbindung langsam"

**Lösung:**
1. **Direkter Modus prüfen:**
   - Tailscale Admin Console → Device-Details
   - "Direct" sollte angezeigt werden (nicht "Relay")
2. **Firewall-Regel:**
   - Windows Firewall → Tailscale erlauben
   - UDP Port 41641 öffnen (für direkte Verbindung)

### Problem: "Smartphone kann nicht auf SMB zugreifen"

**Lösung:**
- SMB über VPN funktioniert nur mit speziellen Apps
- **Empfehlung:** Synology Drive App nutzen (einfacher)
- Alternativ: Dateimanager-App mit SMB-Support (siehe Schritt 5.2)

### Problem: "VPN aktiviert, aber keine Verbindung"

**Lösung:**
1. **Tailscale neu starten:**
   - Windows: Taskbar → Tailscale → "Quit" → Neu starten
   - Smartphone: App Force-Close → Neu öffnen
2. **Neuauthentifizierung:**
   - Tailscale → "Settings" → "Sign out" → Neu anmelden
3. **Synology Tailscale neu starten:**
   - DSM → Paket-Zentrum → Tailscale → Stoppen → Starten

---

## ⚙️ Erweiterte Einstellungen (optional)

### Exit Node (Internet über Synology routen)

**Use Case:** Im Büro-WLAN surfen, aber als wärst du zuhause

1. **DSM → Tailscale** → Settings
2. **"Advertise as exit node"** aktivieren
3. **Rechner:** Tailscale → Settings → "Use exit node" → Synology auswählen
4. Dein gesamter Internet-Traffic geht jetzt über dein Heimnetz!

### Subnet Routing (ganzes Heimnetz erreichbar)

**Use Case:** Nicht nur NAS, sondern auch Drucker, Smart Home, etc. erreichbar

1. **DSM → Tailscale** → Settings
2. **"Advertise routes"** → `192.168.0.0/24` eintragen
3. **Tailscale Admin Console** → Synology-Device → "Edit route settings"
4. ☑️ Route genehmigen
5. Jetzt erreichbar: `\\192.168.0.9\Gurktaler` statt `\\100.64.0.1\Gurktaler`

### MagicDNS (Namen statt IPs)

**Use Case:** `\\synology-ds124\Gurktaler` statt `\\100.64.0.1\Gurktaler`

1. **Tailscale Admin Console** → **DNS**
2. **"Enable MagicDNS"**
3. Geräte sind jetzt per Name erreichbar:
   ```
   \\synology-ds124\Gurktaler\data.json
   ```

---

## 📱 Mobile Workflow (PWA später)

**Wenn Gurktaler 2.0 als PWA läuft:**

### Variante A: Synology Drive Sync
- Drive App synchronisiert `data.json` automatisch
- PWA liest lokale Kopie (schnell, auch offline)
- Bei Änderung: Drive synchronisiert im Hintergrund

### Variante B: WebDAV API
- PWA ruft WebDAV-API auf (über Tailscale VPN)
- Direkter Zugriff auf `data.json`
- Benötigt WebDAV Server auf Synology (aktivieren)

**Code bereits vorbereitet** für beide Varianten in `sync.ts`!

---

## 🎯 Nächste Schritte

✅ **Sofort einsatzbereit:**
1. Tailscale auf allen Geräten installiert
2. Netzwerkpfad in App konfiguriert
3. Erste Sync durchgeführt

🔜 **Optional erweitern:**
- Exit Node aktivieren (Internet über Heim-IP)
- MagicDNS aktivieren (Namen statt IPs)
- Subnet Routing (ganzes Heimnetz erreichbar)

📱 **Mobile später:**
- PWA auf Synology Web Station deployen
- Synology Drive Sync für Offline-Zugriff
- Oder WebDAV-API für Direktzugriff

---

## 💡 Tipps & Best Practices

### Sicherheit
- ✅ Tailscale nutzt WireGuard (modernste Verschlüsselung)
- ✅ Zero-Trust-Architektur (jede Verbindung authentifiziert)
- ✅ Keine offenen Ports (Firewall bleibt geschlossen)
- ⚠️ Trotzdem: Starke DSM-Passwörter verwenden!

### Performance
- ✅ Direkter P2P wenn möglich (schnell)
- ⚠️ Relay-Modus wenn Firewall zu strikt (langsamer)
- 💡 Tipp: UDP Port 41641 freigeben für direkte Verbindung

### Kosten
- ✅ Personal-Plan: **Kostenlos** (bis 100 Geräte, 3 User)
- ✅ Keine Abo-Gebühren
- ✅ Keine Traffic-Limits
- 💰 Premium-Plan: $6/Monat (für Teams, ACLs, etc.)

---

## 📞 Support & Links

- **Tailscale Dokumentation:** https://tailscale.com/kb/
- **Synology Community Package:** https://synocommunity.com/package/tailscale
- **Gurktaler 2.0 Sync-Dokumentation:** `SYNOLOGY_SYNC_SETUP.md` (veraltet)

---

## ✅ Checkliste: Ist alles bereit?

- [ ] Tailscale Account erstellt
- [ ] Tailscale auf Synology installiert & verbunden
- [ ] Tailscale auf Rechner 1 installiert
- [ ] Tailscale auf Rechner 2 installiert
- [ ] Netzlaufwerk `Y:` auf beiden Rechnern verbunden
- [ ] Unterordner `Y:\zweipunktnull` erstellt
- [ ] App auf Rechner 1 konfiguriert (`Y:\zweipunktnull\data.json`)
- [ ] App auf Rechner 2 konfiguriert (`Y:\zweipunktnull\data.json`)
- [ ] Erste Sync erfolgreich durchgeführt
- [ ] Tailscale auf Smartphone installiert
- [ ] Synology Drive App installiert (Smartphone)
- [ ] Test: Daten zwischen Rechner 1 & 2 synchronisiert

**Alles ✅? → Du bist startklar! 🎉**

---

**Hinweis:** WebDAV ist durch Tailscale + SMB obsolet geworden. Du kannst `webdav` Paket aus `package.json` entfernen und `.env.local` löschen falls gewünscht.
