# Gurktaler 2.0 - Datenexport und Upload für Remote-Rechner
# Erstellt ein ZIP-Archiv mit dem kompletten Datenbestand zum Upload

param(
    [Parameter(Mandatory = $false)]
    [string]$SourcePath = "Y:\zweipunktnull\database",
    
    [Parameter(Mandatory = $false)]
    [string]$OutputPath = "$env:USERPROFILE\Desktop"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Gurktaler 2.0 - Datenexport fuer Remote-Rechner" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob Quelle existiert
if (-not (Test-Path $SourcePath)) {
    Write-Host "FEHLER: Quellpfad nicht gefunden: $SourcePath" -ForegroundColor Red
    exit 1
}

# Erstelle Zeitstempel
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$exportName = "gurktaler_datenbestand_$timestamp"
$exportZip = Join-Path $OutputPath "$exportName.zip"

Write-Host "QUELLE: $SourcePath" -ForegroundColor White
Write-Host "ZIEL: $exportZip" -ForegroundColor White
Write-Host ""

# Zaehle Dateien
$files = Get-ChildItem -Path $SourcePath -Recurse -File
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "STATISTIK:" -ForegroundColor Cyan
Write-Host "   Dateien: $($files.Count)" -ForegroundColor White
Write-Host "   Groesse: $sizeInMB MB" -ForegroundColor White
Write-Host ""

# Erstelle ZIP-Archiv
Write-Host "EXPORT: Erstelle ZIP-Archiv..." -ForegroundColor Yellow

try {
    Compress-Archive -Path "$SourcePath\*" -DestinationPath $exportZip -CompressionLevel Optimal -Force
    
    $zipSize = (Get-Item $exportZip).Length
    $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  EXPORT ERFOLGREICH!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Datei: $exportZip" -ForegroundColor White
    Write-Host "Groesse: $zipSizeMB MB" -ForegroundColor White
    Write-Host ""
    Write-Host "ANLEITUNG zum Upload auf Remote-Rechner:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Kopiere die ZIP-Datei auf den Remote-Rechner" -ForegroundColor White
    Write-Host "   (z.B. via USB-Stick, Netzwerk, Cloud-Upload)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Auf dem Remote-Rechner:" -ForegroundColor White
    Write-Host "   - Stelle sicher dass Y:\zweipunktnull\database existiert" -ForegroundColor Gray
    Write-Host "   - Entpacke die ZIP-Datei nach Y:\zweipunktnull\database" -ForegroundColor Gray
    Write-Host "   - Starte die Gurktaler App neu" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. PowerShell-Befehl zum Entpacken:" -ForegroundColor White
    Write-Host "   Expand-Archive -Path '$exportName.zip' -DestinationPath 'Y:\zweipunktnull\database' -Force" -ForegroundColor Yellow
    Write-Host ""
} 
catch {
    Write-Host ""
    Write-Host "FEHLER beim Erstellen des ZIP-Archivs:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
