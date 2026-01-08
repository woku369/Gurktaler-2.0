# Gurktaler 2.0 - Datenbank wiederherstellen
# Stellt ein vorheriges Backup wieder her

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupName
)

$backupBasePath = "Y:\zweipunktnull\backups"
$targetPath = "Y:\zweipunktnull\database"

# Liste verfügbare Backups
$backups = Get-ChildItem $backupBasePath -Directory | 
    Where-Object { $_.Name -match "^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$" } |
    Sort-Object Name -Descending

if ($backups.Count -eq 0) {
    Write-Host "❌ Keine Backups gefunden in: $backupBasePath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Verfügbare Backups:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

for ($i = 0; $i -lt $backups.Count; $i++) {
    $backup = $backups[$i]
    $size = (Get-ChildItem $backup.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($size / 1MB, 2)
    $fileCount = (Get-ChildItem $backup.FullName -Recurse -File).Count
    
    Write-Host "[$i] $($backup.Name)" -ForegroundColor Yellow
    Write-Host "    Erstellt: $($backup.LastWriteTime)" -ForegroundColor Gray
    Write-Host "    Dateien: $fileCount | Größe: $sizeInMB MB" -ForegroundColor Gray
    Write-Host ""
}

# Wähle Backup
if ([string]::IsNullOrEmpty($BackupName)) {
    $selection = Read-Host "Welches Backup wiederherstellen? [0-$($backups.Count - 1)] oder 'q' für Abbruch"
    
    if ($selection -eq 'q') {
        Write-Host "Abgebrochen." -ForegroundColor Yellow
        exit 0
    }
    
    $selectedBackup = $backups[[int]$selection]
} else {
    $selectedBackup = $backups | Where-Object { $_.Name -eq $BackupName } | Select-Object -First 1
    
    if (-not $selectedBackup) {
        Write-Host "❌ Backup nicht gefunden: $BackupName" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n⚠️ WARNUNG: Aktuelle Daten werden überschrieben!" -ForegroundColor Red
$confirm = Read-Host "Fortfahren? (ja/nein)"

if ($confirm -ne "ja") {
    Write-Host "Abgebrochen." -ForegroundColor Yellow
    exit 0
}

# Erstelle Sicherheits-Backup der aktuellen Daten
Write-Host "`n💾 Erstelle Sicherheits-Backup der aktuellen Daten..." -ForegroundColor Cyan
$safetyBackup = "$backupBasePath\safety_backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
Copy-Item -Path "$targetPath\*" -Destination $safetyBackup -Recurse -Force
Write-Host "✅ Sicherheits-Backup erstellt: $safetyBackup" -ForegroundColor Green

# Lösche aktuelle Datenbank
Write-Host "`n🗑️ Lösche aktuelle Datenbank..." -ForegroundColor Yellow
Remove-Item "$targetPath\*" -Recurse -Force

# Stelle Backup wieder her
Write-Host "📥 Stelle Backup wieder her..." -ForegroundColor Cyan
Copy-Item -Path "$($selectedBackup.FullName)\*" -Destination $targetPath -Recurse -Force

$fileCount = (Get-ChildItem $targetPath -Recurse -File).Count
Write-Host "`n✅ Wiederherstellung erfolgreich!" -ForegroundColor Green
Write-Host "   Dateien: $fileCount" -ForegroundColor White
Write-Host "   Von: $($selectedBackup.Name)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
