# Update Node.js API Server auf Synology NAS
# Kopiert neuen server.js und startet Service neu

$serverPath = "\\DS124-RockingK\Gurktaler\zweipunktnull\server.js"
$localServer = "C:\Users\wolfg\Desktop\zweipunktnullVS\server.js"

Write-Host "🔄 Aktualisiere API Server auf NAS..." -ForegroundColor Cyan
Write-Host "=" * 50

# Kopiere neue server.js
try {
    Copy-Item $localServer $serverPath -Force
    Write-Host "✅ server.js kopiert" -ForegroundColor Green
}
catch {
    Write-Host "❌ Fehler beim Kopieren: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  Bitte den Node.js Service manuell neustarten:" -ForegroundColor Yellow
Write-Host "   1. SSH: ssh admin@100.121.103.107" -ForegroundColor Gray
Write-Host "   2. Process finden: ps aux | grep server.js" -ForegroundColor Gray
Write-Host "   3. Beenden: kill <PID>" -ForegroundColor Gray
Write-Host "   4. Neustarten: cd /volume1/Gurktaler/zweipunktnull && node server.js &" -ForegroundColor Gray
Write-Host ""
Write-Host "   ODER über Task Scheduler in Synology DSM neu starten" -ForegroundColor Gray
