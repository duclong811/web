Write-Host "==============================================
" -ForegroundColor Magenta
Write-Host "🔄 FORCE BROWSER REFRESH SCRIPT" -ForegroundColor Magenta
Write-Host "=============================================="

Write-Host "`n📋 HƯỚNG DẪN:" -ForegroundColor Cyan
Write-Host "1. Mở trình duyệt Chrome/Edge" -ForegroundColor White
Write-Host "2. Vào http://192.168.137.1:5173" -ForegroundColor White
Write-Host "3. Nhấn F12 để mở DevTools" -ForegroundColor White
Write-Host "4. Click chuột phải vào nút Reload (↻)" -ForegroundColor White
Write-Host "5. Chọn 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "`n   HOẶC" -ForegroundColor Yellow
Write-Host "`n6. Nhấn Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "7. Chọn 'Cached images and files'" -ForegroundColor White
Write-Host "8. Chọn 'All time'" -ForegroundColor White
Write-Host "9. Click 'Clear data'" -ForegroundColor White
Write-Host "10. Nhấn Ctrl + Shift + R để hard reload`n" -ForegroundColor White

Write-Host "=============================================="
Write-Host "📊 KIỂM TRA SERVICES" -ForegroundColor Cyan
Write-Host "=============================================="

# Check Backend
$backendRunning = Get-NetTCPConnection -LocalPort 5277 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✅ Backend: RUNNING on port 5277" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
}

# Check Frontend
$frontendRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "✅ Frontend: RUNNING on port 5173" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n=============================================="
Write-Host "🧪 TEST LOGIN" -ForegroundColor Cyan
Write-Host "==============================================`n"

Write-Host "Option 1: Mở test-login.html trong trình duyệt" -ForegroundColor Yellow
Write-Host "   Double-click file: test-login.html`n" -ForegroundColor White

Write-Host "Option 2: Test bằng PowerShell (ngay bây giờ)" -ForegroundColor Yellow
$choice = Read-Host "Bạn muốn test ngay không? (y/n)"

if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host "`n🔄 Testing login endpoints...`n" -ForegroundColor Cyan
    
    $body = @{
        username = "minh@minhcafe.vn"
        password = "123123"
    } | ConvertTo-Json

    # Test owner-login
    Write-Host "Testing /api/auth/owner-login..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://192.168.137.1:5277/api/auth/owner-login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ SUCCESS! Login works perfectly!" -ForegroundColor Green
        Write-Host "Token: $($response.data.token.Substring(0, 50))..." -ForegroundColor Yellow
        Write-Host "User: $($response.data.fullName) ($($response.data.role))" -ForegroundColor Yellow
        Write-Host "Store: $($response.data.storeName)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
        }
    }
}

Write-Host "`n==============================================
" -ForegroundColor Magenta
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Green
Write-Host "=============================================="
Write-Host "1. Clear browser cache (Ctrl + Shift + Delete)" -ForegroundColor White
Write-Host "2. Hard reload (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "3. Login với: minh@minhcafe.vn / 123123" -ForegroundColor White
Write-Host "4. Kiểm tra console log (F12 → Console tab)" -ForegroundColor White
Write-Host "5. Kiểm tra Network tab (F12 → Network)" -ForegroundColor White
Write-Host "`nShould see: /login (fail) → /owner-login (success) ✅`n" -ForegroundColor Cyan
