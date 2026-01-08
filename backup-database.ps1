# Gurktaler 2.0 - Automatisches Datenbank-Backup
# Führt ein timestamped Backup der gesamten Datenbank durch

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$sourcePath = "Y:\zweipunktnull\database"
$backupBasePath = "Y:\zweipunktnull\backups"
$backupPath = "$backupBasePath\backup_$timestamp"

# Prüfe ob Quelle existiert
if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Fehler: Quellpfad nicht gefunden: $sourcePath" -ForegroundColor Red
    exit 1
}

# Erstelle Backup-Verzeichnis
Write-Host "📦 Erstelle Backup: $backupPath" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Kopiere alle Dateien
Write-Host "📋 Kopiere Datenbank-Dateien..." -ForegroundColor Yellow
Copy-Item -Path "$sourcePath\*" -Destination $backupPath -Recurse -Force

# Zähle Dateien
$fileCount = (Get-ChildItem $backupPath -Recurse -File).Count
$totalSize = (Get-ChildItem $backupPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "✅ Backup erfolgreich!" -ForegroundColor Green
Write-Host "   Dateien: $fileCount" -ForegroundColor White
Write-Host "   Größe: $sizeInMB MB" -ForegroundColor White
Write-Host "   Pfad: $backupPath" -ForegroundColor White

# Lösche Backups älter als 30 Tage
Write-Host "`n🧹 Lösche alte Backups (älter als 30 Tage)..." -ForegroundColor Yellow
$oldBackups = Get-ChildItem $backupBasePath -Directory | Where-Object { 
    $_.Name -match "^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$" -and 
    $_.LastWriteTime -lt (Get-Date).AddDays(-30) 
}

if ($oldBackups.Count -gt 0) {
    foreach ($old in $oldBackups) {
        Write-Host "   Lösche: $($old.Name)" -ForegroundColor Gray
        Remove-Item $old.FullName -Recurse -Force
    }
    Write-Host "✅ $($oldBackups.Count) alte Backups gelöscht" -ForegroundColor Green
}
else {
    Write-Host "   Keine alten Backups gefunden" -ForegroundColor Gray
}

Write-Host "`n✅ Backup-Vorgang abgeschlossen!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
