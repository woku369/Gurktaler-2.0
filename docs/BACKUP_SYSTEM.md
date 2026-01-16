# Backup & Wiederherstellung - Gurktaler 2.0

## 🔄 Übersicht

Das Backup-System erstellt automatisch stündliche Sicherungen der Datenbank und ermöglicht einfache Wiederherstellung über die App.

## ⚙️ Einrichtung

### 1. Stündliche Backups aktivieren

#### Windows:

**Option A: PowerShell im Hintergrund starten**

1. Öffne PowerShell als Administrator
2. Starte das Backup-Script:
   ```powershell
   Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File 'C:\Users\wolfg\Desktop\zweipunktnullVS\backup-hourly.ps1'" -WindowStyle Hidden
   ```

**Option B: Windows Task Scheduler (Empfohlen)**

1. Öffne "Aufgabenplanung" (Task Scheduler)
2. Klicke auf "Aufgabe erstellen"
3. **Allgemein:**
   - Name: `Gurktaler Stündliches Backup`
   - Beschreibung: `Erstellt stündlich Backups der Gurktaler Datenbank`
   - "Unabhängig von der Benutzeranmeldung ausführen" aktivieren
4. **Trigger:**
   - Neu → Bei Anmeldung
   - Wiederholen alle: `1 Stunde`
   - Dauer: `Unbegrenzt`
5. **Aktionen:**
   - Neu → Programm starten
   - Programm: `powershell.exe`
   - Argumente: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\wolfg\Desktop\zweipunktnullVS\backup-hourly.ps1"`
6. **Bedingungen:**
   - "Aufgabe nur starten, falls Computer im Netzbetrieb läuft" DEAKTIVIEREN
7. **Einstellungen:**
   - "Aufgabe bei Bedarf ausführen" AKTIVIEREN

**Option C: Einmalige Ausführung (manuell starten)**

```powershell
.\backup-hourly.ps1
```

Das Script läuft dann dauerhaft und erstellt alle 60 Minuten ein Backup.

### 2. Backup-Pfad prüfen

Stelle sicher, dass das NAS-Laufwerk `Y:\zweipunktnull` verbunden ist:

```powershell
Test-Path "Y:\zweipunktnull\database"
```

Falls nicht verbunden, siehe [NAS_ARCHITEKTUR.md](NAS_ARCHITEKTUR.md) für Setup-Anweisungen.

## 📦 Backup-Verzeichnis

- **Pfad:** `Y:\zweipunktnull\backups\`
- **Format:** `backup_YYYY-MM-DD_HH-mm-ss`
- **Aufbewahrung:** 7 Tage (bei stündlichen Backups = ca. 168 Backups)
- **Inhalt:** Alle JSON-Dateien aus `database/`

⚠️ **Hinweis:** Der alte "Datenbank-Backup" Bereich in den Einstellungen wurde durch den neuen **Backup & Wiederherstellung** Manager ersetzt. Dieser bietet:
- ✅ Vollständige Backup-Liste mit Vorschau
- ✅ Ein-Klick-Wiederherstellung
- ✅ Manuelle Backup-Erstellung
- ✅ Detaillierte Statistiken

### Beispiel:
```
Y:\zweipunktnull\backups\
  ├── backup_2026-01-16_08-00-00\
  │   ├── projects.json
  │   ├── products.json
  │   ├── recipes.json
  │   ├── notes.json
  │   ├── contacts.json
  │   └── ...
  ├── backup_2026-01-16_09-00-00\
  └── backup_2026-01-16_10-00-00\
```

## 🖥️ In-App Wiederherstellung

### Via Einstellungen:

1. Öffne **Einstellungen** (⚙️)
2. Gehe zur **ersten Sektion: Backup & Wiederherstellung** (ganz oben)
3. **Aktuelle Datenbank:**
   - Sieh dir die Statistiken an (8 Entitätstypen mit Anzahlen)
   - Projekte, Produkte, Rezepturen, Notizen, Kontakte, Zutaten, Gebinde, Weblinks
4. **Manuelles Backup erstellen:**
   - Klicke auf den grünen Button "Manuelles Backup"
   - Empfohlen vor jeder Wiederherstellung!
5. **Backup-Liste:**
   - Alle verfügbaren Backups werden angezeigt (neueste zuerst)
   - Klicke auf 🔄 **Aktualisieren** um Liste zu aktualisieren
   - Klicke auf ein Backup um es auszuwählen
6. **Backup-Vorschau:**
   - Nach Auswahl wird detaillierte Statistik angezeigt
   - Vergleiche Zahlen mit aktueller Datenbank
7. **Wiederherstellung:**
   - Klicke auf **"Backup wiederherstellen"**
   - Bestätige die Warnung (alle aktuellen Daten werden überschrieben!)
   - Die App lädt automatisch neu

### Was passiert bei der Wiederherstellung?

1. Alle JSON-Dateien werden aus dem Backup nach `Y:\zweipunktnull\database\` kopiert
2. Aktuelle Daten werden überschrieben (deshalb vorher manuelles Backup!)
3. App lädt neu und zeigt wiederhergestellte Daten

## 🛠️ Manuelle Wiederherstellung (PowerShell)

Falls die App nicht funktioniert:

```powershell
# 1. Backup-Liste anzeigen
Get-ChildItem "Y:\zweipunktnull\backups" -Directory | Sort-Object Name -Descending | Select-Object Name, LastWriteTime

# 2. Backup auswählen (Beispiel: backup_2026-01-16_10-00-00)
$backup = "Y:\zweipunktnull\backups\backup_2026-01-16_10-00-00"
$database = "Y:\zweipunktnull\database"

# 3. Alle Dateien wiederherstellen
Copy-Item "$backup\*.json" "$database\" -Force

# 4. Prüfen
(Get-Content "$database\projects.json" | ConvertFrom-Json).Count
```

## 🔍 Backup-Status prüfen

### PowerShell:

```powershell
# Anzahl der Backups
(Get-ChildItem "Y:\zweipunktnull\backups" -Directory).Count

# Neuestes Backup
Get-ChildItem "Y:\zweipunktnull\backups" -Directory | Sort-Object Name -Descending | Select-Object -First 1

# Backup-Größe
$totalSize = (Get-ChildItem "Y:\zweipunktnull\backups" -Recurse -File | Measure-Object -Property Length -Sum).Sum
"$([math]::Round($totalSize / 1MB, 2)) MB"
```

### In der App:

1. Öffne **Einstellungen**
2. Gehe zu **Backup & Wiederherstellung** (erste Sektion)
3. Klicke auf 🔄 **Aktualisieren** (oben rechts in der Backup-Liste)
4. Siehe aktualisierte Liste aller verfügbaren Backups

💡 **Der Aktualisieren-Button:**
- Lädt die Backup-Liste neu vom NAS
- Zeigt neu erstellte Backups an (z.B. vom stündlichen Script)
- Aktualisiert Zeitstempel und Anzahl der Backups
- Nutze ihn nach manuellem Backup oder nach längerer Zeit

## ⚠️ Wichtige Hinweise

### Vor Wiederherstellung:

- ✅ Erstelle ein manuelles Backup der aktuellen Daten
- ✅ Prüfe die Backup-Vorschau (Anzahl der Einträge)
- ✅ Vergleiche mit aktuellen Statistiken
- ⚠️ Alle aktuellen Daten werden überschrieben!

### Backup-Frequenz:

- **Stündlich:** 168 Backups (7 Tage × 24 Stunden)
- **Speicherplatz:** Ca. 1-5 MB pro Backup
- **Gesamt:** Ca. 168-840 MB für 7 Tage

### Bei Problemen:

1. **Backups werden nicht erstellt:**
   - Prüfe Task Scheduler Status
   - Prüfe PowerShell-Script-Ausführung
   - Prüfe NAS-Verbindung

2. **Wiederherstellung schlägt fehl:**
   - Prüfe NAS-Verbindung
   - Prüfe Schreibrechte auf `Y:\zweipunktnull\database\`
   - Nutze manuelle PowerShell-Wiederherstellung

3. **App zeigt keine Backups:**
   - Klicke auf 🔄 Aktualisieren
   - Prüfe `Y:\zweipunktnull\backups` im Explorer
   - Öffne Developer Console (F12) für Fehlermeldungen

## 📊 Monitoring

### Log-Dateien:

Das Backup-Script schreibt ausführliche Logs in die Console:

```
📦 Gurktaler Backup - 2026-01-16_10-00-00
═══════════════════════════════════════
📋 Kopiere Datenbank-Dateien...
✅ Backup erfolgreich!
   Dateien: 19
   Größe: 1.23 MB
   Pfad: Y:\zweipunktnull\backups\backup_2026-01-16_10-00-00

🧹 Lösche alte Backups (älter als 7 Tage)...
✅ 5 alte Backups gelöscht

✅ Backup-Vorgang abgeschlossen!
═══════════════════════════════════════
⏰ Nächstes Backup in 60 Minuten...
```

### In-App Monitoring:

- **Aktuelle Statistiken:** Anzahl der Einträge pro Entitätstyp
- **Backup-Liste:** Alle verfügbaren Backups mit Zeitstempel
- **Backup-Vorschau:** Detaillierte Statistiken eines ausgewählten Backups

## 🚀 Best Practices

1. **Regelmäßige Überprüfung:**
   - Prüfe wöchentlich ob Backups erstellt werden
   - Teste gelegentlich eine Wiederherstellung (in Testumgebung)

2. **Vor größeren Änderungen:**
   - Erstelle ein manuelles Backup
   - Notiere das Backup-Datum

3. **Bei Dateninkonsistenzen:**
   - Prüfe aktuelles Backup
   - Stelle vorheriges stabiles Backup wieder her

4. **Externe Sicherung:**
   - Kopiere wichtige Backups zusätzlich auf externe Festplatte
   - Nutze Synology-Backup für redundante Sicherung

## 🔗 Weitere Dokumentation

- [NAS_ARCHITEKTUR.md](NAS_ARCHITEKTUR.md) - NAS-Setup und Verbindung
- [SYNOLOGY_SYNC_SETUP.md](SYNOLOGY_SYNC_SETUP.md) - Synology-Synchronisation
- [README.md](../README.md) - Allgemeine App-Dokumentation
