# Gurktaler API Server Status Check
# Prüft ob der Server auf dem NAS läuft

param(
    [switch]$Restart
)

Write-Host "🔍 Gurktaler API Server Status" -ForegroundColor Cyan
Write-Host "=" * 50

# Test ob NAS erreichbar ist
Write-Host "`n🌐 NAS-Erreichbarkeit..."
$nasReachable = Test-Connection -ComputerName 100.121.103.107 -Count 1 -Quiet

if (-not $nasReachable) {
    Write-Host "❌ NAS nicht erreichbar!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ NAS erreichbar" -ForegroundColor Green

# Test API Endpoint
Write-Host "`n🔌 API Server..."
try {
    $response = Invoke-WebRequest -Uri "http://100.121.103.107/api/json?path=/database/projects.json" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server läuft (HTTP 200)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Datenbank: $($data.Count) Projekte gefunden" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Server antwortet nicht!" -ForegroundColor Red
    Write-Host "   Fehler: $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($Restart) {
        Write-Host "`n🔄 Versuche Server zu starten..." -ForegroundColor Yellow
        Write-Host "Bitte im SSH-Terminal ausführen:" -ForegroundColor Yellow
        Write-Host "  ssh admin@100.121.103.107" -ForegroundColor Cyan
        Write-Host "  cd /volume1/Gurktaler/api" -ForegroundColor Cyan
        Write-Host "  nohup node server.js > server.log 2>&1 &" -ForegroundColor Cyan
    }
    exit 1
}

Write-Host "`n✅ Alles OK!" -ForegroundColor Green
Write-Host "`n📊 Server-Info:" -ForegroundColor Cyan
Write-Host "  Endpoint: http://100.121.103.107/api/json"
Write-Host "  PWA:      http://100.121.103.107/gurktaler/"

Write-Host "`n💡 Tipp:" -ForegroundColor Yellow
Write-Host "  Bei Problemen: .\check-server.ps1 -Restart"
