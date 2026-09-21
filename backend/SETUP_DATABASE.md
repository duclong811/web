# Database Setup Instructions

Sau khi pull code, chạy các lệnh sau để sync database:

## Bước 1: Kiểm tra SQL Server
Đảm bảo SQL Server đang chạy và có database `WebCafeDb`.

## Bước 2: Chạy SQL Scripts

**Lưu ý:** Thay `YourServerName\SQLEXPRESS` bằng tên SQL Server instance của bạn.

### Windows PowerShell:

```powershell
# Vào thư mục backend
cd backend

# 1. Thêm Guest columns (GuestId, GuestName, GuestPhone) vào Orders
sqlcmd -S "YourServerName\SQLEXPRESS" -d "WebCafeDb" -i "add-guest-columns.sql"

# 2. Thêm Username column vào Staff
sqlcmd -S "YourServerName\SQLEXPRESS" -d "WebCafeDb" -i "add-username-column.sql"

# 3. (Optional) Thêm soft delete columns vào Categories và MenuItems
sqlcmd -S "YourServerName\SQLEXPRESS" -d "WebCafeDb" -i "add-soft-delete-columns.sql"
```

### Hoặc chạy tất cả cùng lúc:

```powershell
cd backend

# Tạo file setup-all.sql tổng hợp
Get-Content add-guest-columns.sql, add-username-column.sql, add-soft-delete-columns.sql | Set-Content setup-all.sql

# Chạy
sqlcmd -S "YourServerName\SQLEXPRESS" -d "WebCafeDb" -i "setup-all.sql"
```

## Bước 3: Verify Database

Kiểm tra các columns đã được thêm:

```sql
-- Check Orders table
SELECT TOP 1 * FROM Orders;

-- Check Staff table  
SELECT TOP 1 * FROM Staff;

-- Check Categories table
SELECT TOP 1 * FROM Categories;

-- Check MenuItems table
SELECT TOP 1 * FROM MenuItems;
```

## Bước 4: Run Backend

```powershell
dotnet run
```

Nếu thấy lỗi "Invalid column name", làm theo:
1. Stop backend (Ctrl+C)
2. Xóa cache: `Remove-Item bin, obj -Recurse -Force`
3. Rebuild: `dotnet clean && dotnet build`
4. Chạy lại: `dotnet run`

## Troubleshooting

**Lỗi: "Column already exists"**
→ Không sao, có nghĩa là column đã có rồi. Bỏ qua.

**Lỗi: "Invalid column name 'Username'"**
→ Chưa chạy `add-username-column.sql` hoặc cần rebuild backend.

**Lỗi: "Cannot connect to SQL Server"**
→ Kiểm tra SQL Server đang chạy và connection string trong `appsettings.json`.

## Note cho Frontend

Nếu dùng mobile hotspot, update IP trong `src/api/apiClient.ts`:
- Hotspot: `http://192.168.137.1:5277`
- WiFi: Chạy `ipconfig` để lấy IP WiFi
