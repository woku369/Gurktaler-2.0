# NOTFALL-WIEDERHERSTELLUNG - Gurktaler 2.0

## 🚨 WENN ALLE DATEN WEG SIND

### Schritt 1: RUHE BEWAHREN! Daten sind im Backup!

```powershell
# Terminal öffnen (PowerShell)
cd C:\Users\wolfg\Desktop\zweipunktnullVS
```

### Schritt 2: Backups prüfen

```powershell
# Liste alle Backups (neueste zuerst)
Get-ChildItem "Y:\zweipunktnull\backups" -Directory | Sort-Object Name -Descending | Select-Object -First 10 Name, LastWriteTime
```

### Schritt 3: Neuestes Backup prüfen

```powershell
# Prüfe Inhalt des neuesten Backups
$backup = "Y:\zweipunktnull\backups\backup_YYYY-MM-DD_HH-mm-ss"  # <-- Ersetze mit neuestem!
Get-ChildItem "$backup\*.json" | ForEach-Object { 
    $data = Get-Content $_.FullName -Raw | ConvertFrom-Json
    Write-Host "$($_.Name): $($data.Count) Einträge"
}
```

### Schritt 4: SOFORT WIEDERHERSTELLEN

```powershell
# Kopiere neuestes Backup (ERSETZE DATUM/ZEIT!)
$backup = "Y:\zweipunktnull\backups\backup_2026-01-16_08-02-15"
$db = "Y:\zweipunktnull\database"

Write-Host "🔄 Stelle Daten wieder her..."
Copy-Item "$backup\projects.json" "$db\projects.json" -Force
Copy-Item "$backup\products.json" "$db\products.json" -Force
Copy-Item "$backup\recipes.json" "$db\recipes.json" -Force
Copy-Item "$backup\notes.json" "$db\notes.json" -Force
Copy-Item "$backup\contacts.json" "$db\contacts.json" -Force
Copy-Item "$backup\containers.json" "$db\containers.json" -Force
Copy-Item "$backup\ingredients.json" "$db\ingredients.json" -Force
Copy-Item "$backup\images.json" "$db\images.json" -Force
Copy-Item "$backup\documents.json" "$db\documents.json" -Force
Copy-Item "$backup\tasks.json" "$db\tasks.json" -Force
Write-Host "✅ Daten wiederhergestellt!"
```

### Schritt 5: Prüfen

```powershell
# Prüfe wiederhergestellte Daten
@("projects", "products", "recipes", "notes", "contacts") | ForEach-Object {
    $count = (Get-Content "Y:\zweipunktnull\database\$_.json" -Raw | ConvertFrom-Json).Count
    Write-Host "$_ : $count Einträge"
}
```

### Schritt 6: App neu laden

**Drücke F5 in der App oder starte neu!**

---

## 🏢 IM BÜRO OHNE VS CODE

### Option 1: Remote Desktop zum Home-Office-Rechner

1. Verbinde per Remote Desktop zu deinem Home-Rechner
2. Führe dort die PowerShell-Befehle aus
3. Backups werden auf NAS wiederhergestellt
4. Büro-App automatisch synchronisiert

### Option 2: Direkte NAS-Verbindung im Büro

```powershell
# Im Büro: Verbinde NAS-Laufwerk
net use Y: \\100.121.103.107\Gurktaler\zweipunktnull /persistent:yes

# Dann normale Wiederherstellung wie oben
```

### Option 3: Web-Interface (PWA)

1. Öffne: http://100.121.103.107/gurktaler
2. Gehe zu Einstellungen → Backup & Wiederherstellung
3. **ACHTUNG:** Funktioniert NUR in Desktop-App vollständig!
4. PWA zeigt keine Backups → Desktop-App nutzen!

---

## � DATEN FÜR REMOTE-RECHNER EXPORTIEREN (NEU in v1.7.1)

### Szenario: Testrechner ohne Zugang zum NAS

**Problem:** Du bist auf einem entfernten Rechner (z.B. Testrechner) und hast keinen Zugang zum NAS-Laufwerk Y:\. Du brauchst aber einen aktuellen Datenbestand zum Testen.

**Lösung: In-App Export/Import-Funktion**

### Schritt 1: Auf dem Home-Office-Rechner (mit NAS-Zugang)

1. Öffne die **Gurktaler Desktop-App** oder **PWA** (http://100.121.103.107/gurktaler)
2. Gehe zu **Einstellungen** (⚙️ Icon in der Sidebar)
3. Scrolle zur Sektion **"Datensicherung"**
4. Finde den Bereich **"Komplettpaket für Remote-Rechner"** (gelber/oranger Kasten)
5. Klicke auf **"Komplettpaket für Remote-Rechner erstellen"**
6. Die App erstellt eine JSON-Datei mit ALLEN Daten und lädt sie herunter
7. Dateiname: `gurktaler-komplett-2026-01-19.json` (mit aktuellem Datum)

### Schritt 2: Datei auf Remote-Rechner übertragen

**Optionen:**
- USB-Stick
- E-Mail (Achtung: Dateigröße beachten!)
- Cloud-Upload (OneDrive, Dropbox, etc.)
- Netzwerk-Freigabe

### Schritt 3: Auf dem Remote-Rechner importieren

1. Öffne die **Gurktaler App** (Desktop oder PWA)
2. Gehe zu **Einstellungen** → **"Datensicherung"**
3. Klicke auf **"Daten importieren (JSON)"**
4. Wähle die kopierte JSON-Datei aus
5. Bestätige die Warnung (⚠️ Aktuelle Daten werden überschrieben!)
6. Die App lädt sich automatisch neu
7. ✅ **Alle Daten sind jetzt verfügbar!**

### Was ist enthalten?

✅ **Vollständiger Datenbestand:**
- Alle Projekte (24+)
- Alle Produkte
- Alle Rezepturen
- Alle Kontakte
- Alle Notizen
- Alle Tasks
- Alle Workspaces
- Alle Zutaten, Gebinde, Weblinks
- Alle Tags und Zuordnungen

⚠️ **NICHT enthalten:** Bildergalerie (zu groß)

### Für Bilder: PowerShell-Script nutzen

Wenn auch Bilder benötigt werden:

```powershell
# Auf Home-Office-Rechner:
.\export-for-remote.ps1

# Erstellt ZIP-Archiv mit ALLEM (inkl. Bilder)
# Dann manuell auf Remote-Rechner kopieren und entpacken
```

### Vorteile der In-App-Lösung

✅ Kein VS Code oder Terminal nötig
✅ Funktioniert in Desktop-App UND PWA
✅ Ein Klick zum Export
✅ Ein Klick zum Import
✅ Detaillierte Anleitungen direkt in der App
✅ Automatische Validierung der Daten

---

## �🛡️ NEUE SICHERHEITS-FEATURES (v1.6.1)

### Automatisches Backup bei jedem Speichern

**Seit v1.6.1:** Die App erstellt AUTOMATISCH ein Backup BEVOR Daten geschrieben werden!

```
Backup-Pfad: Y:\zweipunktnull\backups\incremental_YYYY-MM-DD_HH-mm-ss\
```

### Schutz vor leerem Überschreiben

**Die App verhindert jetzt:**
- ❌ Überschreiben von Daten mit leerem Array
- ❌ Datenverlust durch fehlerhafte Speicheroperationen
- ✅ Warnung bei gefährlichen Operationen

**Fehlermeldung wenn Datenverlust droht:**
```
🚨 KRITISCHER FEHLER VERHINDERT:
Versuch 20 Einträge mit leerem Array zu überschreiben!
Datei: Y:\zweipunktnull\database\projects.json
Dies würde zum Datenverlust führen!
```

### Inkrementelle Backups

**Jeder Speichervorgang erstellt ein Backup mit:**
- Zeitstempel
- Anzahl der Einträge (vorher → nachher)
- Alle betroffenen Dateien

**Beispiel-Log:**
```
[NasStorage] 💾 Backup: projects (20 → 21 Einträge)
[NasStorage] ✅ Geschrieben: 21 Einträge → Y:\zweipunktnull\database\projects.json
```

---

## 📊 BACKUP-STATUS PRÜFEN

### Wie viele Backups existieren?

```powershell
(Get-ChildItem "Y:\zweipunktnull\backups" -Directory).Count
```

**Sollte sein:** 168 (stündliche Backups für 7 Tage)

### Neuestes Backup

```powershell
Get-ChildItem "Y:\zweipunktnull\backups" -Directory | 
    Sort-Object Name -Descending | 
    Select-Object -First 1 Name, LastWriteTime
```

### Backup-Größe

```powershell
$totalSize = (Get-ChildItem "Y:\zweipunktnull\backups" -Recurse -File | 
    Measure-Object -Property Length -Sum).Sum
"Gesamt: $([math]::Round($totalSize / 1MB, 2)) MB"
```

---

## ⚠️ BEKANNTE PROBLEME

### Problem 1: BackupManager zeigt 0 Backups (✅ GEFIXT v1.6.1)

**Ursache:** BackupService nutzt Electron API die nur in Desktop-App funktioniert

**Lösung:** Jetzt mit Fehlerbehandlung:
- PWA/Dev: Zeigt Warnung "Nur in Desktop-App verfügbar"
- Desktop: Funktioniert mit detailliertem Logging

### Problem 2: Stündliches Backup läuft nicht

**Ursache:** Task Scheduler nicht eingerichtet oder Script läuft nicht

**Prüfen:**
```powershell
# Läuft das Backup-Script?
Get-Process | Where-Object {$_.ProcessName -like "*powershell*"} | 
    Where-Object {$_.CommandLine -like "*backup-hourly*"}
```

**Lösung:** Siehe [BACKUP_SYSTEM.md](BACKUP_SYSTEM.md) - Task Scheduler einrichten

### Problem 3: Daten verschwinden trotz Backups

**Ursache (v1.6.0):** Keine Validierung vor dem Schreiben

**Lösung (v1.6.1):** 
- ✅ Automatisches Backup vor jedem Write
- ✅ Validierung gegen leere Arrays
- ✅ Fehler-Prevention bei gefährlichen Operationen

---

## 🔧 WARTUNG

### Alte Backups manuell löschen

```powershell
# Lösche Backups älter als 7 Tage
$cutoffDate = (Get-Date).AddDays(-7)
Get-ChildItem "Y:\zweipunktnull\backups" -Directory | 
    Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
    Remove-Item -Recurse -Force
```

### Manuelles Backup erstellen

```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupPath = "Y:\zweipunktnull\backups\backup_MANUAL_$timestamp"
New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
Copy-Item "Y:\zweipunktnull\database\*.json" $backupPath -Force
Write-Host "✅ Manuelles Backup: $backupPath"
```

---

## 📞 HILFE

**Bei Datenverlust:**
1. NICHT PANIKEN!
2. App SOFORT schließen (keine weiteren Speichervorgänge!)
3. Diese Anleitung befolgen
4. Im Zweifel: Wolfgang kontaktieren

**Datei zum Ausdrucken:** Drucke diese Seite aus und lege sie neben deinen Office-Rechner!
