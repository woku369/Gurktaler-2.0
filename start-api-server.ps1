# Gurktaler 2.0 - Custom API Server Starter
# Startet den Node.js Server für PWA-Zugriff auf NAS-Daten

Write-Host "Starte Gurktaler 2.0 Custom API Server..." -ForegroundColor Green
Write-Host "Port: 3001" -ForegroundColor Cyan
Write-Host "NAS-Pfad: Y:\" -ForegroundColor Cyan
Write-Host ""
Write-Host "WICHTIG: Dieses Fenster nicht schliessen!" -ForegroundColor Yellow
Write-Host "Der Server muss laufen, damit die PWA auf Daten zugreifen kann." -ForegroundColor Yellow
Write-Host ""

node server.js
