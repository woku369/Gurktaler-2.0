# Gurktaler 2.0 - Stündliches Windows Backup Script
# Erstellt timestamped Backup der Datenbank alle 60 Minuten

param(
    [string]$BasePath = "Y:\zweipunktnull",
    [switch]$Once  # Neuer Parameter: Nur ein Backup, dann beenden
)

$ErrorActionPreference = "Stop"

function Create-Backup {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $sourcePath = "$BasePath\database"
    $backupBase = "$BasePath\backups"
    $backupPath = "$backupBase\backup_$timestamp"
    
    Write-Host "📦 Gurktaler Backup - $timestamp" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    
    # Prüfe ob Quelle existiert
    if (-not (Test-Path $sourcePath)) {
        Write-Host "❌ Fehler: Quellpfad nicht gefunden: $sourcePath" -ForegroundColor Red
        return $false
    }
    
    # Erstelle Backup-Verzeichnis
    New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
    
    # Kopiere alle JSON-Dateien
    Write-Host "📋 Kopiere Datenbank-Dateien..." -ForegroundColor Yellow
    $files = Get-ChildItem -Path $sourcePath -Filter "*.json"
    
    foreach ($file in $files) {
        Copy-Item -Path $file.FullName -Destination $backupPath -Force
    }
    
    # Zähle Dateien und Größe
    $fileCount = (Get-ChildItem -Path $backupPath -File).Count
    $totalSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-Host "✅ Backup erfolgreich!" -ForegroundColor Green
    Write-Host "   Dateien: $fileCount" -ForegroundColor White
    Write-Host "   Größe: $sizeInMB MB" -ForegroundColor White
    Write-Host "   Pfad: $backupPath" -ForegroundColor White
    
    # Lösche Backups älter als 7 Tage (bei stündlichen Backups)
    Write-Host ""
    Write-Host "🧹 Lösche alte Backups (älter als 7 Tage)..." -ForegroundColor Yellow
    $cutoffDate = (Get-Date).AddDays(-7)
    $oldBackups = Get-ChildItem -Path $backupBase -Directory -Filter "backup_*" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($oldBackups.Count -gt 0) {
        foreach ($backup in $oldBackups) {
            Remove-Item -Path $backup.FullName -Recurse -Force
        }
        Write-Host "✅ $($oldBackups.Count) alte Backups gelöscht" -ForegroundColor Green
    }
    else {
        Write-Host "   Keine alten Backups gefunden" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "✅ Backup-Vorgang abgeschlossen!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    
    return $true
}

# Hauptlogik
if ($Once) {
    # Einmaliges Backup (für App-Schließen)
    Write-Host "💾 Einmaliges Backup beim App-Schließen" -ForegroundColor Cyan
    Write-Host "   Backup-Pfad: $BasePath\backups" -ForegroundColor White
    Write-Host ""
    
    try {
        Create-Backup
        exit 0
    }
    catch {
        Write-Host "❌ Backup-Fehler: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    # Stündliche Backups (Endlosschleife)
    Write-Host "🕐 Stündliches Backup-System gestartet" -ForegroundColor Cyan
    Write-Host "   Backup-Pfad: $BasePath\backups" -ForegroundColor White
    Write-Host "   Intervall: 60 Minuten" -ForegroundColor White
    Write-Host "   Aufbewahrung: 7 Tage" -ForegroundColor White
    Write-Host ""

    while ($true) {
        try {
            Create-Backup
            Write-Host ""
            Write-Host "⏰ Nächstes Backup in 60 Minuten..." -ForegroundColor Cyan
            Start-Sleep -Seconds 3600  # 60 Minuten
        }
        catch {
            Write-Host "❌ Backup-Fehler: $_" -ForegroundColor Red
            Write-Host "⏰ Erneuter Versuch in 5 Minuten..." -ForegroundColor Yellow
            Start-Sleep -Seconds 300  # 5 Minuten Wartezeit bei Fehler
        }
    }
}
