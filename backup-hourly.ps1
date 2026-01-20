# Gurktaler 2.0 - Stuendliches Windows Backup Script
# Erstellt timestamped Backup aller Daten alle 60 Minuten

param(
    [string]$BasePath = "Y:\zweipunktnull",
    [switch]$Once
)

$ErrorActionPreference = "Stop"

function Create-Backup {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupBase = "$BasePath\backups"
    $backupPath = "$backupBase\backup_$timestamp"
    
    Write-Host "Gurktaler Backup - $timestamp" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    
    if (-not (Test-Path $BasePath)) {
        Write-Host "Fehler: Basis-Pfad nicht gefunden: $BasePath" -ForegroundColor Red
        return $false
    }
    
    New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
    
    $foldersToBackup = @("database", "images", "documents", "attachments")
    $totalFiles = 0
    $totalSize = 0
    
    foreach ($folder in $foldersToBackup) {
        $sourcePath = "$BasePath\$folder"
        
        if (Test-Path $sourcePath) {
            Write-Host "Kopiere $folder..." -ForegroundColor Yellow
            
            $targetPath = "$backupPath\$folder"
            New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
            
            $files = Get-ChildItem -Path $sourcePath -File -Recurse
            
            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
                $targetFile = Join-Path $targetPath $relativePath
                $targetDir = Split-Path $targetFile -Parent
                
                if (-not (Test-Path $targetDir)) {
                    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                }
                
                Copy-Item -Path $file.FullName -Destination $targetFile -Force
                $totalFiles++
                $totalSize += $file.Length
            }
            
            $fileCount = (Get-ChildItem -Path $targetPath -File -Recurse).Count
            Write-Host "   OK: $fileCount Dateien kopiert" -ForegroundColor Green
        }
        else {
            Write-Host "   Warnung: $folder nicht gefunden" -ForegroundColor Yellow
        }
    }
    
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "Backup erfolgreich!" -ForegroundColor Green
    Write-Host "   Dateien: $totalFiles" -ForegroundColor White
    Write-Host "   Groesse: $sizeInMB MB" -ForegroundColor White
    Write-Host "   Pfad: $backupPath" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Loesche alte Backups (aelter als 7 Tage)..." -ForegroundColor Yellow
    $cutoffDate = (Get-Date).AddDays(-7)
    $oldBackups = Get-ChildItem -Path $backupBase -Directory -Filter "backup_*" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($oldBackups.Count -gt 0) {
        foreach ($backup in $oldBackups) {
            Remove-Item -Path $backup.FullName -Recurse -Force
        }
        Write-Host "OK: $($oldBackups.Count) alte Backups geloescht" -ForegroundColor Green
    }
    else {
        Write-Host "   Keine alten Backups gefunden" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Backup-Vorgang abgeschlossen!" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Cyan
    
    return $true
}

if ($Once) {
    Write-Host "Einmaliges Backup" -ForegroundColor Cyan
    Write-Host "   Backup-Pfad: $BasePath\backups" -ForegroundColor White
    Write-Host ""
    
    try {
        Create-Backup
        exit 0
    }
    catch {
        Write-Host "Backup-Fehler: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "Stuendliches Backup-System gestartet" -ForegroundColor Cyan
    Write-Host "   Backup-Pfad: $BasePath\backups" -ForegroundColor White
    Write-Host "   Intervall: 60 Minuten" -ForegroundColor White
    Write-Host "   Aufbewahrung: 7 Tage" -ForegroundColor White
    Write-Host ""

    while ($true) {
        try {
            Create-Backup
            Write-Host ""
            Write-Host "Naechstes Backup in 60 Minuten..." -ForegroundColor Cyan
            Start-Sleep -Seconds 3600
        }
        catch {
            Write-Host "Backup-Fehler: $_" -ForegroundColor Red
            Write-Host "Erneuter Versuch in 5 Minuten..." -ForegroundColor Yellow
            Start-Sleep -Seconds 300
        }
    }
}
