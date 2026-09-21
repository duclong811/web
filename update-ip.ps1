# Auto-update API Base URL with current LAN IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Where-Object { $_.IPAddress -notlike "169.*" }).IPAddress

if ($ip) {
    Write-Host "🔍 Found IP: $ip" -ForegroundColor Green
    
    $apiClientPath = "src/api/apiClient.ts"
    $content = Get-Content $apiClientPath -Raw
    
    # Update API_BASE_URL
    $content = $content -replace "http://[\d\.]+:5277/api", "http://${ip}:5277/api"
    
    # Update HUB_URL
    $content = $content -replace "http://[\d\.]+:5277/hubs/orders", "http://${ip}:5277/hubs/orders"
    
    Set-Content $apiClientPath $content
    
    Write-Host "✅ Updated apiClient.ts with IP: $ip" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Your demo URL: http://${ip}:5173/menu?storeId=1&table=1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. cd backend && dotnet run"
    Write-Host "   2. npm run dev"
    Write-Host "   3. Scan QR code with phone!"
} else {
    Write-Host "❌ Could not find Wi-Fi IP address" -ForegroundColor Red
    Write-Host "💡 Make sure you're connected to Wi-Fi" -ForegroundColor Yellow
}
