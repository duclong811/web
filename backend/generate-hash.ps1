# Generate BCrypt hash for password 123123
$dllPath = Get-ChildItem -Path "$env:USERPROFILE\.nuget\packages\bcrypt.net-next" -Recurse -Filter "BCrypt.Net-Next.dll" | Select-Object -First 1

if ($dllPath) {
    Add-Type -Path $dllPath.FullName
    
    $password = "123123"
    $hash = [BCrypt.Net.BCrypt]::HashPassword($password, 11)
    
    Write-Host "=== BCrypt Hash Generator ===" -ForegroundColor Cyan
    Write-Host "Password: $password" -ForegroundColor Yellow
    Write-Host "Hash: $hash" -ForegroundColor Green
    Write-Host ""
    
    # Verify
    $verify = [BCrypt.Net.BCrypt]::Verify($password, $hash)
    Write-Host "Verification: $verify" -ForegroundColor $(if($verify){"Green"}else{"Red"})
    Write-Host ""
    
    Write-Host "=== SQL Update Commands ===" -ForegroundColor Cyan
    Write-Host "UPDATE Tenants SET OwnerPasswordHash = '$hash' WHERE OwnerEmail = 'minh@minhcafe.vn';" -ForegroundColor White
    Write-Host "UPDATE Tenants SET OwnerPasswordHash = '$hash' WHERE OwnerEmail = 'lan@lancoffee.vn';" -ForegroundColor White
    Write-Host "UPDATE SystemAdmins SET PasswordHash = '$hash' WHERE Username = 'superadmin';" -ForegroundColor White
    
    # Create SQL file
    @"
USE WebCafeDb;
GO

UPDATE Tenants SET OwnerPasswordHash = '$hash' WHERE OwnerEmail = 'minh@minhcafe.vn';
UPDATE Tenants SET OwnerPasswordHash = '$hash' WHERE OwnerEmail = 'lan@lancoffee.vn';
UPDATE SystemAdmins SET PasswordHash = '$hash' WHERE Username = 'superadmin';

SELECT 'Updated' AS Status, OwnerEmail, OwnerPasswordHash FROM Tenants WHERE OwnerEmail IN ('minh@minhcafe.vn', 'lan@lancoffee.vn');
"@ | Out-File -FilePath "apply-new-hash.sql" -Encoding UTF8
    
    Write-Host ""
    Write-Host "✓ SQL file created: apply-new-hash.sql" -ForegroundColor Green
    Write-Host "Run: sqlcmd -S YoungerOnlyAim\SQLEXPRESS -d WebCafeDb -i apply-new-hash.sql" -ForegroundColor Yellow
} else {
    Write-Host "BCrypt.Net-Next.dll not found" -ForegroundColor Red
    Write-Host "Installing BCrypt.Net-Next..." -ForegroundColor Yellow
    dotnet add package BCrypt.Net-Next
}
