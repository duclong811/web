$loginBody = @{
    Username = "owner@thecoffeehouse.vn"
    Password = "Owner@123"
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "http://localhost:5277/api/Auth/owner-login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.token
    Write-Host "✅ Login Success! Role: $($loginRes.data.role) | Store: $($loginRes.data.storeName)"
    $headers = @{ "Authorization" = "Bearer $token" }

    $shift = Invoke-RestMethod -Uri "http://localhost:5277/api/Analytics/shift-operations/store/1" -Method Get -Headers $headers
    Write-Host "`n=== SHIFT OPERATIONS (/admin) ==="
    Write-Host "Store: $($shift.data.storeName)"
    Write-Host "Today Revenue: $($shift.data.todayRevenue) VND"
    Write-Host "Cash: $($shift.data.cashRevenue) VND | Bank: $($shift.data.bankTransferRevenue) VND"
    Write-Host "Tables Total: $($shift.data.totalTables) | Occupied: $($shift.data.occupiedTables)"
    Write-Host "Active Tables in Map: $($shift.data.activeTablesList.Count)"
    Write-Host "Low Stock Alerts: $($shift.data.lowStockAlerts.Count)"
    Write-Host "Hourly Traffic: $($shift.data.hourlyTraffic.Count) hours"

    $biz = Invoke-RestMethod -Uri "http://localhost:5277/api/Analytics/business-report/store/1" -Method Get -Headers $headers
    Write-Host "`n=== BUSINESS REPORT (/admin/analytics) ==="
    Write-Host "Net Revenue: $($biz.data.netRevenue) VND"
    Write-Host "Estimated COGS: $($biz.data.estimatedCOGS) VND"
    Write-Host "Gross Profit: $($biz.data.grossProfit) VND ($($biz.data.grossMarginPercent)%)"
    Write-Host "Menu Stars: $($biz.data.menuEngineering.stars.Count)"
    Write-Host "Menu Plowhorses: $($biz.data.menuEngineering.plowhorses.Count)"
    Write-Host "Menu Puzzles: $($biz.data.menuEngineering.puzzles.Count)"
    Write-Host "Menu Dogs: $($biz.data.menuEngineering.dogs.Count)"
    Write-Host "Channels: $($biz.data.channelBreakdown.Count)"
    Write-Host "Categories: $($biz.data.categoryBreakdown.Count)"
    Write-Host "Payment Methods: $($biz.data.paymentMethodBreakdown.Count)"
} catch {
    Write-Host "❌ Error: $_"
}
