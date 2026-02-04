# Run this script as Administrator to create firewall rule
# Right-click -> Run with PowerShell as Administrator

$ruleName = "Gurktaler API Server"

# Check if rule already exists
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Firewall rule '$ruleName' already exists. Removing..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName
}

# Create new firewall rule
Write-Host "Creating firewall rule '$ruleName'..." -ForegroundColor Cyan
New-NetFirewallRule -DisplayName $ruleName `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3002 `
    -Action Allow `
    -Enabled True `
    -Profile Any

Write-Host "`n✅ Firewall rule created successfully!" -ForegroundColor Green
Write-Host "Port 3002 is now accessible from the network." -ForegroundColor Green
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
