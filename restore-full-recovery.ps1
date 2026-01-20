# Gurktaler 2.0 - VOLLSTAENDIGE Wiederherstellung
# Rekonstruiert den kompletten Datenbestand aus vollen + inkrementellen Backups

param(
    [Parameter(Mandatory = $false)]
    [string]$TargetDateTime  # Format: "2026-01-19 08:57:31"
)

$backupBasePath = "Y:\zweipunktnull\backups"
$basePath = "Y:\zweipunktnull"
$tempRestorePath = "$env:TEMP\gurktaler_restore_temp"

# Liste der wiederherzustellenden Ordner
$foldersToRestore = @("database", "images", "documents", "attachments")

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Gurktaler 2.0 - VOLLSTAENDIGE Datenwiederherstellung  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Parse Zieldatum
if ([string]::IsNullOrEmpty($TargetDateTime)) {
    Write-Host "INFO: Kein Zieldatum angegeben - verwende neueste verfuegbare Daten" -ForegroundColor Yellow
    $targetDate = Get-Date
} 
else {
    try {
        $targetDate = [DateTime]::Parse($TargetDateTime)
        Write-Host "ZIEL: Zieldatum: $targetDate" -ForegroundColor Cyan
    } 
    catch {
        Write-Host "FEHLER: Ungueltiges Datumsformat: $TargetDateTime" -ForegroundColor Red
        Write-Host "   Verwende Format: 'YYYY-MM-DD HH:MM:SS'" -ForegroundColor Yellow
        exit 1
    }
}

# Finde alle Backups bis zum Zieldatum
Write-Host ""
Write-Host "SUCHE: Suche nach allen relevanten Backups..." -ForegroundColor Cyan

$allBackups = Get-ChildItem $backupBasePath -Directory | Where-Object {
    $_.Name -match "^(backup_|incremental_|full_)(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})$"
} | ForEach-Object {
    if ($_.Name -match "(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})") {
        $year = $matches[1]
        $month = $matches[2]
        $day = $matches[3]
        $hour = $matches[4]
        $minute = $matches[5]
        $second = $matches[6]
        $dateStr = "$year-$month-$day $hour`:$minute`:$second"
        try {
            $backupDate = [DateTime]::Parse($dateStr)
            if ($backupDate -le $targetDate) {
                $isFullBackup = $_.Name -like "backup_*" -or $_.Name -like "full_*"
                $backupType = if ($isFullBackup) { "Full" } else { "Incremental" }
                $fileCount = (Get-ChildItem $_.FullName -File -Recurse).Count
                
                [PSCustomObject]@{
                    Name  = $_.Name
                    Path  = $_.FullName
                    Date  = $backupDate
                    Type  = $backupType
                    Files = $fileCount
                }
            }
        }
        catch {
            # Ignoriere Backups mit ungueltigem Datum
        }
    }
} | Sort-Object Date

if ($allBackups.Count -eq 0) {
    Write-Host "FEHLER: Keine Backups gefunden bis $targetDate" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Gefunden: $($allBackups.Count) Backups" -ForegroundColor Green
Write-Host ""

# Finde letztes vollstaendiges Backup
$lastFullBackup = $allBackups | Where-Object { $_.Type -eq "Full" } | Sort-Object Date -Descending | Select-Object -First 1

if (-not $lastFullBackup) {
    Write-Host "FEHLER: Kein vollstaendiges Backup gefunden!" -ForegroundColor Red
    Write-Host "   Verwende alle inkrementellen Backups..." -ForegroundColor Yellow
    $startBackup = $allBackups | Select-Object -First 1
}
else {
    Write-Host "BASIS-BACKUP:" -ForegroundColor Cyan
    Write-Host "   $($lastFullBackup.Name)" -ForegroundColor White
    $dateString = $lastFullBackup.Date.ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "   Datum: $dateString" -ForegroundColor Gray
    Write-Host "   Dateien: $($lastFullBackup.Files)" -ForegroundColor Gray
    $startBackup = $lastFullBackup
}

# Finde alle inkrementellen Backups nach dem letzten vollen Backup
$incrementalBackups = $allBackups | Where-Object { 
    $_.Date -gt $startBackup.Date -and $_.Type -eq "Incremental"
} | Sort-Object Date

Write-Host ""
Write-Host "UPDATES: Inkrementelle Updates: $($incrementalBackups.Count)" -ForegroundColor Cyan

# Erstelle temporaeres Wiederherstellungsverzeichnis
if (Test-Path $tempRestorePath) {
    Remove-Item $tempRestorePath -Recurse -Force
}
New-Item -Path $tempRestorePath -ItemType Directory -Force | Out-Null

# Kopiere Basis-Backup
Write-Host ""
Write-Host "SCHRITT 1: Kopiere Basis-Backup..." -ForegroundColor Yellow
Copy-Item -Path "$($startBackup.Path)\*" -Destination $tempRestorePath -Force
$currentFiles = Get-ChildItem $tempRestorePath -File
Write-Host "   OK: Kopiert: $($currentFiles.Count) Basis-Dateien" -ForegroundColor Green

# Wende inkrementelle Backups an
if ($incrementalBackups.Count -gt 0) {
    Write-Host ""
    Write-Host "SCHRITT 2: Wende inkrementelle Updates an..." -ForegroundColor Yellow
    
    foreach ($incBackup in $incrementalBackups) {
        $files = Get-ChildItem "$($incBackup.Path)" -File
        foreach ($file in $files) {
            Copy-Item -Path $file.FullName -Destination $tempRestorePath -Force
        }
        $fileCountStr = $files.Count.ToString()
        Write-Host "   OK: $($incBackup.Name) angewendet - $fileCountStr Dateien" -ForegroundColor Gray
    }
}

# Zeige Zusammenfassung
$restoredFiles = Get-ChildItem $tempRestorePath -File
$totalSize = ($restoredFiles | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Wiederherstellung vorbereitet" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "STATISTIK:" -ForegroundColor Cyan
Write-Host "   Dateien: $($restoredFiles.Count)" -ForegroundColor White
$sizeStr = $sizeInMB.ToString()
Write-Host "   Groesse: $sizeStr MB" -ForegroundColor White
$standStr = $targetDate.ToString("yyyy-MM-dd HH:mm:ss")
Write-Host "   Stand: $standStr" -ForegroundColor White
Write-Host ""

# Liste alle Dateien auf
Write-Host "DATEIEN: Wiederhergestellte Dateien:" -ForegroundColor Cyan
$restoredFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    $sizeKBStr = $sizeKB.ToString()
    Write-Host "   - $($_.Name) - $sizeKBStr Kilobyte" -ForegroundColor Gray
}

Write-Host ""
Write-Host "WARNUNG: Aktuelle Daten werden ueberschrieben!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Wiederherstellung durchfuehren? (ja/nein)"

if ($confirm -ne "ja") {
    Write-Host "ABBRUCH: Wiederherstellung abgebrochen." -ForegroundColor Yellow
    Remove-Item $tempRestorePath -Recurse -Force
    exit 0
}

# Erstelle Sicherheits-Backup
Write-Host ""
Write-Host "SICHERUNG: Erstelle Sicherheits-Backup..." -ForegroundColor Cyan
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$safetyBackup = "$backupBasePath\safety_backup_$timestamp"
New-Item -Path $safetyBackup -ItemType Directory -Force | Out-Null

foreach ($folder in $foldersToRestore) {
    $sourcePath = "$basePath\$folder"
    if (Test-Path $sourcePath) {
        $targetBackup = "$safetyBackup\$folder"
        Copy-Item -Path $sourcePath -Destination $targetBackup -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "   OK: Sicherung erstellt: $safetyBackup" -ForegroundColor Green

# Loesche aktuelle Daten
Write-Host ""
Write-Host "LOESCHE: Loesche aktuelle Daten..." -ForegroundColor Yellow
foreach ($folder in $foldersToRestore) {
    $targetPath = "$basePath\$folder"
    if (Test-Path $targetPath) {
        Remove-Item "$targetPath\*" -Force -Recurse -ErrorAction SilentlyContinue
    }
}

# Stelle wieder her
Write-Host ""
Write-Host "RESTORE: Stelle Daten wieder her..." -ForegroundColor Cyan
foreach ($folder in $foldersToRestore) {
    $sourcePath = "baseestorePath\$folder"
    $targetPath = "$basePath\$folder"
    
    if (Test-Path $sourcePath) {
        Write-Host "   Kopiere $folder..." -ForegroundColor Yellow
        Copy-Item -Path "$sourcePath\*" -Destination $targetPath -Recurse -Force
        $fileCount = (Get-ChildItem $targetPath -File -Recurse).Count
        Write-Host "   ✅ $fileCount Dateien wiederhergestellt" -ForegroundColor Green
    }
}

# Aufraeumen
Remove-Item $tempRestorePath -Recurse -Force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  WIEDERHERSTELLUNG ERFOLGREICH!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ziel: $targetPath" -ForegroundColor White
Write-Host "Dateien: $($restoredFiles.Count)" -ForegroundColor White
Write-Host "Groesse: $sizeStr MB" -ForegroundColor White
Write-Host "Stand: $standStr" -ForegroundColor White
Write-Host ""
Write-Host "INFO: Starten Sie die Anwendung neu um die Daten zu laden." -ForegroundColor Cyan
Write-Host ""
