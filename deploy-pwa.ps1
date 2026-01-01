# Gurktaler PWA Deployment Script
# Kopiert dist-Build zum Synology NAS

param(
    [switch]$Force
)

$distPath = "C:\Users\wolfg\Desktop\zweipunktnullVS\dist"
$nasPath = "Y:\web\html\gurktaler"

Write-Host "🚀 Gurktaler PWA Deployment" -ForegroundColor Cyan
Write-Host "=" * 50

# Gurktaler PWA Deployment Script (explizite Kopier-Logik, robust, ohne Emojis)
$ErrorActionPreference = 'Stop'

$src = "C:\Users\wolfg\Desktop\zweipunktnullVS\dist"
$dst = "\\DS124-RockingK\web\html\gurktaler"

Write-Host "Gurktaler PWA Deployment"
Write-Host "========================="

# Prüfe ob Quelle und Ziel erreichbar sind
if (-not (Test-Path $src)) {
    Write-Host "Quellverzeichnis nicht gefunden: $src" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $dst)) {
    Write-Host "Zielverzeichnis nicht gefunden: $dst" -ForegroundColor Red
    exit 2
}

# Zielverzeichnis leeren
Write-Host "Zielverzeichnis wird geleert..."
try {
    Get-ChildItem -Path $dst -Recurse -Force | Remove-Item -Recurse -Force -ErrorAction Stop
}
catch {
    Write-Host "Fehler beim Löschen: $_" -ForegroundColor Yellow
}

# Kopieren (ALLE Dateien und Ordner, rekursiv, überschreiben)
Write-Host "Kopiere alle Dateien..."
$srcFiles = Get-ChildItem -Path $src -Recurse | Where-Object { -not $_.PSIsContainer }
$copyErrors = @()
foreach ($file in $srcFiles) {
    $relPath = $file.FullName.Substring($src.Length).TrimStart('\', '/')
    $target = Join-Path $dst $relPath
    $targetDir = Split-Path $target -Parent
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir | Out-Null
    }
    try {
        Copy-Item -Path $file.FullName -Destination $target -Force -ErrorAction Stop
        Write-Host "Kopiert: $relPath"
    }
    catch {
        Write-Host "Fehler beim Kopieren: $relPath" -ForegroundColor Red
        $copyErrors += $relPath
    }
}

if ($copyErrors.Count -eq 0) {
    Write-Host "Deployment erfolgreich: Alle Dateien wurden kopiert und überschrieben." -ForegroundColor Green
}
else {
    Write-Host "Warnung: Folgende Dateien konnten NICHT kopiert werden:" -ForegroundColor Yellow
    $copyErrors | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    exit 3
}

Write-Host "Fertig. Zugriff: http://100.121.103.107/gurktaler/"