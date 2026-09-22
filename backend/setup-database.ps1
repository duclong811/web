# Database Setup Script for Team Members
# Run this after pulling code to sync database schema

param(
    [string]$ServerName = "localhost\SQLEXPRESS",
    [string]$DatabaseName = "WebCafeDb"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  WebCafe Database Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SQL Server: $ServerName" -ForegroundColor Yellow
Write-Host "Database: $DatabaseName" -ForegroundColor Yellow
Write-Host ""

# Test SQL Server connection
Write-Host "[1/4] Testing SQL Server connection..." -ForegroundColor Green
try {
    sqlcmd -S $ServerName -d "master" -Q "SELECT 1" -h -1 > $null
    Write-Host "✓ Connected to SQL Server successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Cannot connect to SQL Server" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server is running" -ForegroundColor Yellow
    Write-Host "  2. Server name is correct: $ServerName" -ForegroundColor Yellow
    exit 1
}

# Check if database exists
Write-Host ""
Write-Host "[2/4] Checking database..." -ForegroundColor Green
$dbExists = sqlcmd -S $ServerName -Q "SELECT name FROM sys.databases WHERE name = '$DatabaseName'" -h -1
if ($dbExists -like "*$DatabaseName*") {
    Write-Host "✓ Database '$DatabaseName' exists" -ForegroundColor Green
} else {
    Write-Host "✗ Database '$DatabaseName' not found" -ForegroundColor Red
    Write-Host "Please create database first or run migrations" -ForegroundColor Yellow
    exit 1
}

# Run SQL scripts
Write-Host ""
Write-Host "[3/4] Running SQL scripts..." -ForegroundColor Green

$scripts = @(
    @{Name="Guest Columns (Orders)"; File="add-guest-columns.sql"},
    @{Name="Username Column (Staff)"; File="add-username-column.sql"},
    @{Name="Soft Delete Columns (Menu)"; File="add-soft-delete-columns.sql"}
)

foreach ($script in $scripts) {
    if (Test-Path $script.File) {
        Write-Host "  → Running: $($script.Name)..." -ForegroundColor Cyan
        sqlcmd -S $ServerName -d $DatabaseName -i $script.File -b > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Success" -ForegroundColor Green
        } else {
            Write-Host "    ⚠ Warning (may already exist)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⊘ Skipped: $($script.File) not found" -ForegroundColor Gray
    }
}

# Verify setup
Write-Host ""
Write-Host "[4/4] Verifying database setup..." -ForegroundColor Green

$checks = @(
    @{Table="Orders"; Column="GuestId"},
    @{Table="Orders"; Column="GuestName"},
    @{Table="Staff"; Column="Username"},
    @{Table="Categories"; Column="IsDeleted"},
    @{Table="MenuItems"; Column="IsDeleted"}
)

$allGood = $true
foreach ($check in $checks) {
    $query = "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='$($check.Table)' AND COLUMN_NAME='$($check.Column)'"
    $result = sqlcmd -S $ServerName -d $DatabaseName -Q $query -h -1
    if ($result -like "*1*") {
        Write-Host "  ✓ $($check.Table).$($check.Column)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($check.Table).$($check.Column) - MISSING" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
if ($allGood) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✓ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run backend: dotnet run" -ForegroundColor White
    Write-Host "  2. Run frontend: npm run dev" -ForegroundColor White
} else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ⚠ Setup completed with warnings" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Some columns are missing. Please:" -ForegroundColor Yellow
    Write-Host "  1. Check if SQL scripts exist" -ForegroundColor White
    Write-Host "  2. Run scripts manually" -ForegroundColor White
    Write-Host "  3. Contact team lead if issues persist" -ForegroundColor White
}

Write-Host ""
