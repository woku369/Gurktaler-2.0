# Gurktaler API Server - Remote Start/Restart
# Startet den Node.js Server auf dem NAS via SSH

param(
    [switch]$Status,  # Nur Status prüfen
    [switch]$Stop,    # Server stoppen
    [switch]$Restart  # Server neu starten
)

$nasHost = "admin@100.121.103.107"
$serverPath = "/volume1/Gurktaler/api"

Write-Host "🚀 Gurktaler API Server - Remote Control" -ForegroundColor Cyan
Write-Host "=" * 50

# Prüfe ob ssh.exe verfügbar ist
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ssh.exe nicht gefunden! Bitte OpenSSH installieren." -ForegroundColor Red
    exit 10
}

# Funktion: SSH Command ausführen (mit Fehlerbehandlung)
function Invoke-NasCommand {
    param([string]$Command)
    try {
        $result = ssh -o BatchMode=yes -o ConnectTimeout=8 $nasHost "$Command" 2>&1
        return $result
    }
    catch {
        Write-Host "❌ SSH-Verbindung fehlgeschlagen: $_" -ForegroundColor Red
        exit 11
    }
}

# Status prüfen
Write-Host "`n🔍 Prüfe Server-Status..."
$processCheck = Invoke-NasCommand "ps aux | grep '[n]ode server.js'"
$lines = $processCheck -split "`n"
$isRunning = $lines.Count -gt 0 -and $processCheck -match "node server.js"

if ($isRunning) {
    Write-Host "✅ Server läuft bereits" -ForegroundColor Green
    $serverPid = ($lines[0] -split '\s+')[1]
    Write-Host "   PID: $serverPid" -ForegroundColor Gray
    
    if ($Status) {
        # Zeige Log
        Write-Host "`n📋 Server Log (letzte 10 Zeilen):"
        $log = Invoke-NasCommand "tail -10 $serverPath/server.log"
        if ($log) { Write-Host $log -ForegroundColor Gray } else { Write-Host "(Kein Log vorhanden)" -ForegroundColor Yellow }
        exit 0
    }
    
    if ($Stop -or $Restart) {
        Write-Host "`n🛑 Stoppe Server (PID: $serverPid)..."
        Invoke-NasCommand "kill $serverPid"
        Start-Sleep -Seconds 2
        Write-Host "✅ Server gestoppt" -ForegroundColor Yellow
        
        if (-not $Restart) {
            exit 0
        }
    }
    elseif (-not $Restart) {
        Write-Host "`n💡 Server läuft bereits. Optionen:" -ForegroundColor Yellow
        Write-Host "   .\start-server.ps1 -Status   # Status & Log anzeigen"
        Write-Host "   .\start-server.ps1 -Restart  # Server neu starten"
        Write-Host "   .\start-server.ps1 -Stop     # Server stoppen"
        exit 0
    }
}
else {
    Write-Host "❌ Server läuft nicht" -ForegroundColor Red
    
    if ($Status) {
        exit 1
    }
    if ($Stop) {
        Write-Host "   Nichts zu tun." -ForegroundColor Gray
        exit 0
    }
}

# Server starten
Write-Host "`n🚀 Starte Server..."

$startCommand = @"
cd $serverPath && \
nohup node server.js > server.log 2>&1 & \
sleep 2 && \
ps aux | grep '[n]ode server.js'
"@

$result = Invoke-NasCommand $startCommand

if ($result -match "node server.js") {
    $serverPid = ($result -split '\s+')[1]
    Write-Host "✅ Server erfolgreich gestartet!" -ForegroundColor Green
    Write-Host "   PID: $serverPid" -ForegroundColor Gray
    
    # Zeige Log
    Start-Sleep -Seconds 1
    Write-Host "`n📋 Server Log:"
    $log = Invoke-NasCommand "tail -5 $serverPath/server.log"
    if ($log) { Write-Host $log -ForegroundColor Gray } else { Write-Host "(Kein Log vorhanden)" -ForegroundColor Yellow }
    
    # Test API Endpoint
    Write-Host "`n🔌 Teste API Endpoint..."
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://100.121.103.107/api/json?path=/database/projects.json" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API antwortet (HTTP 200)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  API noch nicht bereit (nginx reload erforderlich?)" -ForegroundColor Yellow
    }
    
    Write-Host "`n🌐 PWA erreichbar unter:" -ForegroundColor Cyan
    Write-Host "   http://100.121.103.107/gurktaler/"
    
}
else {
    Write-Host "❌ Server-Start fehlgeschlagen!" -ForegroundColor Red
    Write-Host "`n📋 Log:"
    $log = Invoke-NasCommand "cat $serverPath/server.log"
    if ($log) { Write-Host $log -ForegroundColor Red } else { Write-Host "(Kein Log vorhanden)" -ForegroundColor Yellow }
    exit 1
}
