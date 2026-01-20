# GURKTALER 2.0 - BACKUP-STRATEGIE ANALYSE UND EMPFEHLUNGEN
## Datum: 19. Januar 2026

## PROBLEM-ZUSAMMENFASSUNG

### Kritische Probleme identifiziert:
1. **Inkrementelle Backups sind unvollstaendig**: Stellen nur einzelne geaenderte Dateien wieder her
2. **Kein klares Backup-Schema**: Mix aus "backup_", "incremental_" und fehlenden "full_" Backups
3. **Restore-Prozess fehlerhaft**: `restore-database.ps1` kennt nur einfache Backups, nicht die Kombination
4. **Datenverlustnach Sync**: Leerdaten ueberschreiben echte Daten
5. **IPC-Kanal Fehler**: `nas:check-drive` nicht in preload.ts registriert → App laeuft im Legacy-Modus

---

## AKTUELLE BACKUP-STRUKTUR

### Vorhandene Backup-Scripts:
1. **backup-database.ps1**: Vollstaendiges Backup (manuell)
2. **backup-hourly.ps1**: Stuendliche Backups mit 7-Tage-Aufbewahrung
3. **restore-database.ps1**: Einfache Wiederherstellung (FEHLERHAFT)

### Backup-Typen gefunden:
- `backup_YYYY-MM-DD_HH-mm-ss`: Vollstaendige Backups (19 Dateien)
- `incremental_YYYY-MM-DD_HH-mm-ss`: Inkrementelle Backups (1 Datei jeweils)
- Keine `full_` Backups gefunden

### Problem:
- Das stündliche Backup-Script erstellt KEINE inkrementellen Backups
- Es erstellt immer vollständige Backups mit Praefix "backup_"
- Die "incremental_" Backups kommen aus einer ANDEREN Quelle
- Diese Quelle ist NICHT dokumentiert und NICHT kontrollierbar

---

## URSACHENANALYSE

### 1. Woher kommen die inkrementellen Backups?

**THEORIE A - Electron Auto-Backup beim Speichern:**
Suche in `electron/main.ts` nach file:writeJson Handler...

**THEORIE B - Service Worker oder Frontend-Logik:**
Moegliche automatische Backups beim Speichern von Dateien in der NAS-Storage-Schicht

**THEORIE C - NAS-Sync-Mechanismus:**
Tailscale oder NAS-eigene Backup-Funktion

### 2. Warum werden Leerdaten geschrieben?

**MOEGLICHE URSACHEN:**
1. App startet mit leerem LocalStorage (Legacy-Modus)
2. Schreibt sofort leere Arrays in die NAS
3. Ueberschreibt echte Daten BEVOR Migration stattfindet

**BELEG aus Konsolenlog:**
```
❌ NAS-Setup fehlgeschlagen: Error: Invalid IPC channel: nas:check-drive
⚠️ App läuft im Legacy-Modus (LocalStorage)
```
→ App kann NAS nicht pruefen → faellt auf LocalStorage zurueck → schreibt leere Daten

---

## LOESUNGSANSATZ

### SOFORTMASSNAHMEN (Implementiert):

#### 1. IPC-Channel repariert ✅
- `nas:check-drive` und `nas:mount` zu `preload.ts` hinzugefuegt
- App kann jetzt NAS-Status korrekt pruefen

#### 2. Vollstaendiges Restore-Script ✅
- `restore-full-recovery.ps1` erstellt
- Kombiniert letztes Full-Backup + alle inkrementellen Updates
- Rekonstruiert kompletten Datenbestand

#### 3. Export fuer Remote-Rechner ✅
- `export-for-remote.ps1` erstellt
- ZIP-Archiv mit komplettem Datenbestand
- Upload-Anleitung inkludiert

---

## NEUE BACKUP-STRATEGIE - EMPFEHLUNG

### Drei-Stufen-Backup-System:

#### STUFE 1: Vollstaendige Backups (FULL)
- **Haeufigkeit**: Taeglich um 02:00 Uhr
- **Praefix**: `full_YYYY-MM-DD_HH-mm-ss`
- **Inhalt**: Kompletter database/ Ordner (alle JSON + images/)
- **Aufbewahrung**: 7 Tage (7 vollstaendige Backups)
- **Script**: `backup-full.ps1` (NEU zu erstellen)

#### STUFE 2: Inkrementelle Backups (INCREMENTAL)
- **Haeufigkeit**: Stuendlich (00:00 bis 23:00)
- **Praefix**: `incremental_YYYY-MM-DD_HH-mm-ss`
- **Inhalt**: Nur geaenderte Dateien seit letztem Backup
- **Aufbewahrung**: 24 Stunden
- **Script**: `backup-hourly.ps1` (ANPASSEN)

#### STUFE 3: Change-Detection Backups (SNAPSHOT)
- **Haeufigkeit**: Bei jedem Speichervorgang
- **Praefix**: `snapshot_YYYY-MM-DD_HH-mm-ss`
- **Inhalt**: Nur die gerade geaenderte Datei
- **Aufbewahrung**: 1 Stunde (nur letzte 10 Snapshots)
- **Implementierung**: In NAS-Storage Service

---

## WIEDERHERSTELLUNGS-STRATEGIE

### Szenario 1: Kuerzliche Aenderung rueckgaengig (< 1h)
```powershell
# Verwende letzten Snapshot
.\restore-from-snapshot.ps1 -File "projects.json" -Minutes 30
```

### Szenario 2: Datenverlust heute (< 24h)
```powershell
# Verwende letztes Full + Incremental bis Zeitpunkt
.\restore-full-recovery.ps1 -TargetDateTime "2026-01-19 14:30:00"
```

### Szenario 3: Aeltere Daten wiederherstellen (< 7 Tage)
```powershell
# Verwende spezifisches Full-Backup
.\restore-full-recovery.ps1 -TargetDateTime "2026-01-15 02:00:00"
```

---

## DATENVERLUST-PRAEVENTION

### 1. Startup-Sequenz anpassen

**AKTUELL (FEHLERHAFT):**
```
App startet → LocalStorage leer → Schreibt [] → NAS Setup → Migration → ZU SPAET!
```

**NEU (SICHER):**
```
App startet → Warte auf NAS Check → NAS OK? → Lade von NAS → Dann erst Rendering
                                   → NAS Fehler? → Nur-Lese-Modus ODER Mount-Dialog
```

### 2. Schreibschutz im Legacy-Modus

**REGEL:** Wenn `nas:check-drive` fehlschlaegt → NUR LESEN, NICHT SCHREIBEN

```typescript
// In NasStorage.ts
private async writeJson(file: string, data: any) {
    // SAFETY CHECK
    if (!this.nasAvailable) {
        console.error('NAS nicht verfuegbar - SCHREIBEN BLOCKIERT');
        throw new Error('NAS nicht verfuegbar');
    }
    // ... rest
}
```

### 3. Backup VOR jedem Schreibvorgang

```typescript
// Vor JEDEM writeJson:
await this.createSnapshot(file, oldData);
await this.writeJson(file, newData);
```

---

## IMPLEMENTATION-PLAN

### Phase 1: Sofort (HEUTE) ✅
- [x] IPC-Channel reparieren
- [x] Vollstaendiges Restore-Script
- [x] Export-Script fuer Remote
- [x] Daten wiederherstellen

### Phase 2: Diese Woche (KRITISCH)
- [ ] Startup-Sequenz anpassen (NAS Check ZUERST)
- [ ] Schreibschutz im Legacy-Modus
- [ ] Snapshot-System in NasStorage
- [ ] backup-full.ps1 erstellen
- [ ] backup-hourly.ps1 auf incremental umstellen

### Phase 3: Naechste Woche (Optimierung)
- [ ] Backup-Monitoring Dashboard
- [ ] Automatische Integritaets-Pruefung
- [ ] E-Mail-Benachrichtigung bei Backup-Fehler
- [ ] Backup-Rotation automatisieren

---

## SKRIPT-UEBERSICHT (Neu)

### Backup-Scripts:
1. `backup-full.ps1` - Taegliches vollstaendiges Backup
2. `backup-hourly.ps1` - Stuendliche inkrementelle Backups (ANPASSEN)
3. `backup-snapshot.ps1` - Bei jedem Speichervorgang (NEU)

### Restore-Scripts:
4. `restore-full-recovery.ps1` - Vollstaendige Wiederherstellung ✅
5. `restore-from-snapshot.ps1` - Schnelle Einzeldatei-Wiederherstellung (NEU)
6. `restore-database.ps1` - Legacy (DEPRECATED)

### Utility-Scripts:
7. `export-for-remote.ps1` - Daten fuer Remote-Rechner ✅
8. `import-from-remote.ps1` - Daten auf Remote-Rechner entpacken (NEU)
9. `backup-verify.ps1` - Prueft Backup-Integritaet (NEU)
10. `backup-list.ps1` - Zeigt alle verfuegbaren Backups (NEU)

---

## EMPFOHLENE BACKUP-ROTATION

### Vollstaendige Backups (Full):
- **Behalten**: 7 x taeglich = 7 Backups
- **Speicherplatz**: ~200 MB (bei 20 MB pro Backup)

### Inkrementelle Backups:
- **Behalten**: 24 x stuendlich = 24 Backups
- **Speicherplatz**: ~50 MB (bei 2 MB durchschnittlich)

### Snapshots:
- **Behalten**: 10 letzte
- **Speicherplatz**: ~20 MB

**GESAMT**: ~270 MB Backup-Daten bei vollstaendiger 7-Tage-Historie

---

## RISIKO-BEWERTUNG

### VORHER (Aktueller Stand):
- **Datenverlust-Risiko**: HOCH (🔴)
- **Wiederherstellbarkeit**: GERING (🟡)
- **Integritaet**: MANGELHAFT (🔴)

### NACHHER (Mit neuer Strategie):
- **Datenverlust-Risiko**: MINIMAL (🟢)
- **Wiederherstellbarkeit**: EXZELLENT (🟢)
- **Integritaet**: GUT (🟢)

---

## FAZIT

Die aktuelle Backup-Strategie hat **kritische Luecken**:
1. Inkrementelle Backups sind nicht dokumentiert/kontrolliert
2. Restore-Prozess ist unvollstaendig
3. Keine Praevention gegen Leerdaten-Ueberschreibung

**DRINGENDE EMPFEHLUNG**: 
Implementieren Sie die **Startup-Sequenz-Anpassung** und den **Schreibschutz** SOFORT,
um weitere Datenverluste zu verhindern!

Die vollstaendige neue Backup-Strategie sollte innerhalb einer Woche implementiert werden.
