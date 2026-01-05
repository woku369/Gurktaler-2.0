# Gurktaler 2.0 - API Server auf Synology einrichten

## Schritt 1: Node.js auf Synology installieren

1. **Paket-Zentrum** öffnen
2. Nach **"Node.js"** suchen (offizielles Synology-Paket)
3. Installieren (Version 18 oder höher empfohlen)

## Schritt 2: Server-Dateien auf NAS kopieren

Via SSH oder File Station:
```bash
# Zielverzeichnis auf NAS
/volume1/Gurktaler/zweipunktnull/
```

Kopiere folgende Datei:
- `server.js`

## Schritt 3: Server per SSH starten (Test)

1. SSH auf Synology aktivieren (Systemsteuerung > Terminal & SNMP > Terminal aktivieren)
2. Mit SSH verbinden:
   ```powershell
   ssh admin@100.121.103.107
   ```

3. Server testen:
   ```bash
   cd /volume1/Gurktaler/zweipunktnull
   node server.js
   ```
   
   Sollte anzeigen: `🚀 Gurktaler API Server running on port 3001`

4. Mit Ctrl+C beenden

## Schritt 4: Als automatischer Dienst einrichten

### Option A: Task Scheduler (einfach, GUI)

1. **Systemsteuerung > Aufgabenplanung** öffnen
2. **Erstellen > Geplante Aufgabe > Benutzerdefiniertes Script**
3. Einstellungen:
   - **Name**: Gurktaler API Server
   - **Benutzer**: root (wichtig für Port 3001)
   - **Ereignis**: Bootvorgang
4. **Aufgabe**-Tab > **Auszuführendes Skript**:
   ```bash
   cd /volume1/Gurktaler/zweipunktnull && node server.js > /var/log/gurktaler-server.log 2>&1 &
   ```
5. **Aktiviert** ankreuzen und speichern
6. Rechtsklick auf Aufgabe > **Ausführen** (sofort starten)

### Option B: systemd Service (fortgeschritten)

SSH als root:
```bash
sudo -i
```

Service-Datei erstellen:
```bash
cat > /etc/systemd/system/gurktaler-api.service << 'EOF'
[Unit]
Description=Gurktaler 2.0 API Server
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/volume1/Gurktaler/zweipunktnull
ExecStart=/usr/local/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/gurktaler-server.log
StandardError=append:/var/log/gurktaler-server.log

[Install]
WantedBy=multi-user.target
EOF
```

Service aktivieren:
```bash
systemctl enable gurktaler-api.service
systemctl start gurktaler-api.service
systemctl status gurktaler-api.service
```

## Schritt 5: Firewall-Regel (falls aktiviert)

Systemsteuerung > Sicherheit > Firewall:
- **Neue Regel erstellen**
- Port: 3001
- Protokoll: TCP
- Aktion: Zulassen

## Schritt 6: Testen

Im Browser auf deinem Rechner:
```
http://100.121.103.107:3001/api/json?path=/database/projects.json
```

Sollte JSON zurückgeben (oder 404 wenn Datei nicht existiert).

## Überwachung

Server-Status prüfen:
```bash
# Via SSH
ps aux | grep "node server.js"

# Logs ansehen
tail -f /var/log/gurktaler-server.log

# Mit Task Scheduler
# Systemsteuerung > Aufgabenplanung > Status prüfen
```

Server neustarten:
```bash
# Task Scheduler: Rechtsklick > Stoppen, dann Ausführen

# systemd:
sudo systemctl restart gurktaler-api.service
```

## Troubleshooting

### Port bereits belegt
```bash
# Prüfen was auf Port 3001 läuft
netstat -tuln | grep 3001

# Prozess finden und beenden
lsof -i :3001
kill <PID>
```

### Berechtigungsprobleme
```bash
# Sicherstellen dass Node.js Zugriff hat
chmod +x /volume1/Gurktaler/zweipunktnull/server.js
chown admin:users /volume1/Gurktaler/zweipunktnull/server.js
```

### Server startet nicht
```bash
# Manuell im Vordergrund starten um Fehler zu sehen
cd /volume1/Gurktaler/zweipunktnull
node server.js
```

## Wichtig

- Der Server läuft dann **immer** auf der Synology, auch wenn dein PC aus ist
- Die PWA ist von überall im Netzwerk erreichbar (oder über Tailscale/VPN auch extern)
- Logs werden nach `/var/log/gurktaler-server.log` geschrieben
