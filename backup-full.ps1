# Gurktaler 2.0 - Vollständiges Backup-System
# Führt ein komplettes Backup aller Daten durch (Datenbank, Bilder, Dokumente)
# Empfohlen: Täglich um 02:00 Uhr via Task Scheduler

param(
    [switch]$Force,
    [int]$RetentionDays = 7
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dateOnly = Get-Date -Format "yyyy-MM-dd"
$sourcePaths = @{
    Database = "Y:\zweipunktnull\database"
    Images = "Y:\zweipunktnull\images"
    Documents = "Y:\zweipunktnull\documents"
}
$backupBasePath = "Y:\zweipunktnull\backups\full"
$backupPath = "$backupBasePath\backup_$timestamp"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔐 Gurktaler 2.0 - Vollständiges Backup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Y: Laufwerk verfügbar
if (-not (Test-Path "Y:\")) {
    Write-Host "❌ Fehler: Y:\ Laufwerk nicht verfügbar!" -ForegroundColor Red
    Write-Host "   Bitte Netzlaufwerk verbinden und erneut versuchen." -ForegroundColor Yellow
    exit 1
}

# Prüfe ob Quellen existieren
$missingPaths = @()
foreach ($path in $sourcePaths.Values) {
    if (-not (Test-Path $path)) {
        $missingPaths += $path
    }
}

if ($missingPaths.Count -gt 0 -and -not $Force) {
    Write-Host "⚠️  Warnung: Einige Quellpfade nicht gefunden:" -ForegroundColor Yellow
    foreach ($missing in $missingPaths) {
        Write-Host "   - $missing" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "   Verwende -Force um trotzdem fortzufahren." -ForegroundColor Yellow
    exit 1
}

# Erstelle Backup-Verzeichnis
Write-Host "📦 Erstelle Backup-Verzeichnis..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

$totalFiles = 0
$totalSize = 0
$errors = @()

# Backup für jeden Bereich
foreach ($area in $sourcePaths.Keys) {
    $sourcePath = $sourcePaths[$area]
    $destPath = "$backupPath\$area"
    
    Write-Host ""
    Write-Host "📋 Backup: $area" -ForegroundColor Cyan
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "   ⚠️  Übersprungen (Pfad nicht gefunden)" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Erstelle Zielverzeichnis
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        
        # Kopiere Dateien
        Write-Host "   Kopiere Dateien..." -ForegroundColor Gray
        $copyResult = Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force -PassThru -ErrorAction Stop
        
        # Zähle Dateien und Größe
        $files = Get-ChildItem $destPath -Recurse -File
        $fileCount = $files.Count
        $areaSize = ($files | Measure-Object -Property Length -Sum).Sum
        $areaSizeMB = [math]::Round($areaSize / 1MB, 2)
        
        $totalFiles += $fileCount
        $totalSize += $areaSize
        
        Write-Host "   ✅ $fileCount Dateien ($areaSizeMB MB)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
        $errors += "$area`: $($_.Exception.Message)"
    }
}

# Erstelle Backup-Info-Datei
$backupInfo = @{
    Timestamp = $timestamp
    Date = $dateOnly
    Time = Get-Date -Format "HH:mm:ss"
    TotalFiles = $totalFiles
    TotalSizeMB = [math]::Round($totalSize / 1MB, 2)
    Areas = @{}
    Errors = $errors
    RetentionDays = $RetentionDays
    Machine = $env:COMPUTERNAME
    User = $env:USERNAME
}

foreach ($area in $sourcePaths.Keys) {
    $destPath = "$backupPath\$area"
    if (Test-Path $destPath) {
        $files = Get-ChildItem $destPath -Recurse -File
        $backupInfo.Areas[$area] = @{
            Files = $files.Count
            SizeMB = [math]::Round(($files | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
        }
    }
}

$backupInfo | ConvertTo-Json -Depth 5 | Out-File "$backupPath\backup-info.json" -Encoding UTF8

# Zusammenfassung
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Backup-Zusammenfassung" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Zeitstempel: $timestamp" -ForegroundColor White
Write-Host "   Dateien gesamt: $totalFiles" -ForegroundColor White
Write-Host "   Größe gesamt: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Pfad: $backupPath" -ForegroundColor White

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Fehler aufgetreten:" -ForegroundColor Yellow
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Gray
    }
}

# Cleanup: Lösche alte Backups
Write-Host ""
Write-Host "🧹 Cleanup: Lösche Backups älter als $RetentionDays Tage..." -ForegroundColor Yellow

$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem $backupBasePath -Directory | Where-Object { 
    $_.Name -match "^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$" -and 
    $_.LastWriteTime -lt $cutoffDate
}

if ($oldBackups.Count -gt 0) {
    foreach ($old in $oldBackups) {
        Write-Host "   Lösche: $($old.Name)" -ForegroundColor Gray
        try {
            Remove-Item $old.FullName -Recurse -Force -ErrorAction Stop
        }
        catch {
            Write-Host "   ⚠️  Fehler beim Löschen: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Write-Host "   ✅ $($oldBackups.Count) alte Backups gelöscht" -ForegroundColor Green
}
else {
    Write-Host "   Keine alten Backups gefunden" -ForegroundColor Gray
}

# Zeige verbleibende Backups
$remainingBackups = Get-ChildItem $backupBasePath -Directory | Where-Object { 
    $_.Name -match "^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$"
}

Write-Host ""
Write-Host "💾 Verfügbare Backups: $($remainingBackups.Count)" -ForegroundColor Cyan
if ($remainingBackups.Count -gt 0) {
    $totalBackupSize = ($remainingBackups | Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $totalBackupSizeGB = [math]::Round($totalBackupSize / 1GB, 2)
    Write-Host "   Speicherplatz: $totalBackupSizeGB GB" -ForegroundColor White
    
    Write-Host "   Neueste: $($remainingBackups | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Select-Object -ExpandProperty Name)" -ForegroundColor White
    Write-Host "   Älteste: $($remainingBackups | Sort-Object LastWriteTime | Select-Object -First 1 | Select-Object -ExpandProperty Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Backup-Vorgang abgeschlossen!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Exit Code
if ($errors.Count -gt 0) {
    exit 1
}
exit 0
