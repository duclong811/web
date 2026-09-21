# Kill process using port 5277
$port = Get-NetTCPConnection -LocalPort 5277 -ErrorAction SilentlyContinue
if ($port) {
    Stop-Process -Id $port.OwningProcess -Force
    Write-Host "✅ Killed process $($port.OwningProcess) using port 5277" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "✅ Port 5277 is already free" -ForegroundColor Green
}

# Start backend
Write-Host "🚀 Starting backend..." -ForegroundColor Cyan
Set-Location "C:\Users\THANH\Documents\GitHub\web\backend"
dotnet run
