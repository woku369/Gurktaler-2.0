# Backup-System Dokumentation

## Übersicht

Gurktaler 2.0 verfügt über ein **4-stufiges Backup-System** für maximale Datensicherheit:

1. **Snapshot-System** (automatisch bei jedem Speichervorgang)
2. **Stündliche Backups** (optional via Task Scheduler)
3. **Vollständige Backups** (täglich empfohlen)
4. **Read-Only Mode** (bei NAS-Ausfall)

---

## 1. Snapshot-System ✅ IMPLEMENTIERT

**Was:** Automatische Snapshots bei jedem Schreibvorgang
**Wo:** `Y:\zweipunktnull\backups\snapshots\`
**Aufbewahrung:** Letzte 10 Snapshots pro Datei
**Automatisch:** Ja, läuft bei jedem `writeJson()`

### Funktionsweise

```typescript
// Bei jedem Speichervorgang:
1. Lese aktuelle Daten
2. Erstelle Snapshot mit Timestamp: products_2026-02-04_14-30-15.json
3. Schreibe neue Daten
4. Lösche Snapshots älter als die letzten 10
```

### Vorteile

- ✅ Kein Datenverlust bei versehentlichem Überschreiben
- ✅ Sofortiger Rollback möglich (manuell)
- ✅ Keine zusätzliche Konfiguration nötig
- ✅ Minimaler Overhead (~1-2 Sekunden pro Write)

### Snapshot-Wiederherstellung (Manuell)

```powershell
# Zeige verfügbare Snapshots
Get-ChildItem "Y:\zweipunktnull\backups\snapshots" | Sort-Object LastWriteTime -Descending

# Wiederherstellen (Beispiel: products.json)
$snapshot = "Y:\zweipunktnull\backups\snapshots\products_2026-02-04_14-30-15.json"
$target = "Y:\zweipunktnull\database\products.json"
Copy-Item $snapshot $target -Force
```

---

## 2. Stündliche Backups (Optional)

**Script:** `backup-hourly.ps1`
**Aufbewahrung:** 24 Stunden
**Automatisch:** Nur via Task Scheduler

### Einrichtung (Windows Task Scheduler)

```powershell
# Aufgabe erstellen
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Path\To\zweipunktnullVS\backup-hourly.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At 00:00 -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration ([TimeSpan]::MaxValue)
Register-ScheduledTask -TaskName "Gurktaler Hourly Backup" -Action $action -Trigger $trigger -Description "Stündliches Backup der Gurktaler-Datenbank"
```

---

## 3. Vollständige Backups ⭐ EMPFOHLEN

**Script:** `backup-full.ps1`
**Was:** Komplettes Backup (Datenbank + Bilder + Dokumente)
**Wo:** `Y:\zweipunktnull\backups\full\`
**Aufbewahrung:** 7 Tage (konfigurierbar)
**Automatisch:** Via Task Scheduler (täglich 02:00 Uhr empfohlen)

### Manuelle Ausführung

```powershell
# Standard (7 Tage Aufbewahrung)
.\backup-full.ps1

# Custom Aufbewahrung (14 Tage)
.\backup-full.ps1 -RetentionDays 14

# Erzwinge Backup auch bei fehlenden Pfaden
.\backup-full.ps1 -Force
```

### Automatisierung (Task Scheduler)

```powershell
# Aufgabe erstellen (täglich 02:00 Uhr)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Users\wolfg\Desktop\zweipunktnullVS\backup-full.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 02:00
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "Gurktaler Full Backup" -Action $action -Trigger $trigger -Settings $settings -Description "Tägliches vollständiges Backup um 02:00 Uhr"
```

### Backup-Struktur

```
Y:\zweipunktnull\backups\full\backup_2026-02-04_02-00-00\
├── Database\
│   ├── products.json
│   ├── projects.json
│   └── ...
├── Images\
│   ├── products\
│   └── ...
├── Documents\
│   └── ...
└── backup-info.json
```

### Wiederherstellung (Full Restore)

```powershell
# 1. Neuestes Backup finden
$latestBackup = Get-ChildItem "Y:\zweipunktnull\backups\full" | 
    Where-Object { $_.Name -match "^backup_" } | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1

# 2. App SCHLIESSEN (wichtig!)

# 3. Datenbank wiederherstellen
Copy-Item "$($latestBackup.FullName)\Database\*" -Destination "Y:\zweipunktnull\database" -Recurse -Force

# 4. Bilder wiederherstellen (optional, dauert lange)
Copy-Item "$($latestBackup.FullName)\Images\*" -Destination "Y:\zweipunktnull\images" -Recurse -Force

# 5. Dokumente wiederherstellen (optional)
Copy-Item "$($latestBackup.FullName)\Documents\*" -Destination "Y:\zweipunktnull\documents" -Recurse -Force

# 6. App neu starten
```

---

## 4. Read-Only Mode ✅ IMPLEMENTIERT

**Was:** Automatischer Offline-Modus bei NAS-Ausfall
**Wie:** LocalStorage als Zwischenspeicher
**Auto-Sync:** Sobald NAS wieder verfügbar

### Funktionsweise

```
1. App-Start → NAS-Check
2. NAS offline → Read-Only Mode aktiviert
3. Alle Schreibvorgänge → LocalStorage (Pending Changes)
4. NAS wieder online → Auto-Sync aller Pending Changes
```

### Vorteile

- ✅ Keine Datenverlust-Gefahr bei NAS-Ausfall
- ✅ App bleibt nutzbar (Read-Write auf LocalStorage)
- ✅ Automatische Synchronisation beim Reconnect
- ✅ Visuelle Warnung (gelber Banner oben)

### Manueller Sync

```javascript
// In der App (wenn gelber Banner angezeigt wird):
1. Klicke "Sync" Button im Banner
2. Oder warte 30 Sekunden (Auto-Check)
```

---

## Empfohlene Backup-Strategie

### Für Produktiv-Nutzung

1. **Snapshot-System:** ✅ Automatisch aktiviert
2. **Vollständige Backups:** ⭐ Task Scheduler (täglich 02:00 Uhr)
3. **Stündliche Backups:** Optional (nur bei kritischer Nutzung)
4. **Externe Sicherung:** Wöchentlich manuell auf USB/OneDrive

### Task Scheduler Setup (Einmalig)

```powershell
# Als Administrator ausführen
cd C:\Users\wolfg\Desktop\zweipunktnullVS

# Vollständiges Backup (täglich 02:00 Uhr)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File $PWD\backup-full.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 02:00
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "Gurktaler Full Backup" -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM" -Description "Tägliches Backup um 02:00 Uhr"

Write-Host "✅ Task Scheduler konfiguriert!"
Write-Host "   Überprüfen: taskschd.msc → Aufgabe 'Gurktaler Full Backup'"
```

---

## Fehlerbehebung

### Problem: Backup-Script funktioniert nicht

```powershell
# Prüfe PowerShell Execution Policy
Get-ExecutionPolicy

# Erlaube lokale Scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Teste Script manuell
.\backup-full.ps1 -Verbose
```

### Problem: Y:\ Laufwerk nicht verfügbar

```powershell
# Prüfe Netzlaufwerk
net use Y:

# Neu verbinden
net use Y: \\100.121.103.107\Gurktaler /persistent:yes
```

### Problem: Task Scheduler startet nicht

```powershell
# Prüfe Task
Get-ScheduledTask -TaskName "Gurktaler Full Backup"

# Prüfe letztes Ergebnis
Get-ScheduledTask -TaskName "Gurktaler Full Backup" | Get-ScheduledTaskInfo

# Starte Task manuell
Start-ScheduledTask -TaskName "Gurktaler Full Backup"
```

---

## Monitoring

### Backup-Status prüfen

```powershell
# Zeige alle Backups
Get-ChildItem "Y:\zweipunktnull\backups" -Recurse -Directory | 
    Where-Object { $_.Name -match "^backup_" } | 
    Sort-Object LastWriteTime -Descending | 
    Format-Table Name, LastWriteTime, @{L="Size (MB)"; E={(Get-ChildItem $_.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB}}

# Zeige Snapshot-Status
Get-ChildItem "Y:\zweipunktnull\backups\snapshots" -File | 
    Group-Object {$_.Name -replace '_\d{4}-.*', ''} | 
    Format-Table Count, Name -AutoSize
```

### Speicherplatz-Warnung

```powershell
# Prüfe Backup-Größe
$backupSize = (Get-ChildItem "Y:\zweipunktnull\backups" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "Backup-Speicher: $([math]::Round($backupSize, 2)) GB"

if ($backupSize -gt 50) {
    Write-Host "⚠️ WARNUNG: Backup-Speicher > 50 GB!" -ForegroundColor Yellow
    Write-Host "   Erwäge Cleanup oder kürzere Retention-Periode"
}
```

---

## Sicherheits-Checkliste

- [ ] Task Scheduler für tägliche Vollbackups konfiguriert
- [ ] Snapshot-System funktioniert (prüfe `Y:\zweipunktnull\backups\snapshots`)
- [ ] Read-Only Mode getestet (Y: Laufwerk trennen → App starten)
- [ ] Manuelle Wiederherstellung getestet (Snapshot + Full Backup)
- [ ] Externe Sicherung eingerichtet (USB/OneDrive)
- [ ] Speicherplatz-Monitoring aktiv

---

**Stand:** 4. Februar 2026
**Version:** 1.7.1
