# 🗄️ Hướng Dẫn Cài Đặt & Chạy Database SQL — WebCafe SaaS

Thư mục này chứa toàn bộ mã nguồn SQL Server phục vụ cho hệ thống đặt món QR WebCafe.

---

## 📁 Cấu trúc thư mục `database/`

| File | Mô tả |
|------|-------|
| 🌟 **[`WebCafe_Full_Init.sql`](file:///c:/Users/Admin/Desktop/WebCafe/database/WebCafe_Full_Init.sql)** | **File All-in-One (Khuyên dùng):** Tạo DB + 22 Bảng + Seed Data + Stored Procedures chỉ trong 1 lần chạy F5 |
| [`01_schema.sql`](file:///c:/Users/Admin/Desktop/WebCafe/database/01_schema.sql) | Tạo CSDL, 22 bảng, khóa ngoại (FK), ràng buộc UNIQUE/CHECK và các Indexes |
| [`02_seed_data.sql`](file:///c:/Users/Admin/Desktop/WebCafe/database/02_seed_data.sql) | Dữ liệu mẫu (17 Quyền, 2 Tenants chuỗi/độc lập, 3 Chi nhánh, Menu 11 món, Bàn, NV, Đơn hàng) |
| [`03_stored_procedures.sql`](file:///c:/Users/Admin/Desktop/WebCafe/database/03_stored_procedures.sql) | Các SP nghiệp vụ: lấy menu, cập nhật trạng thái đơn + tích điểm, thống kê doanh thu |

---

## 🚀 Cách chạy Script

### Cách 1: Dùng SQL Server Management Studio (SSMS) (Khuyên dùng)
1. Mở **SQL Server Management Studio (SSMS)** và kết nối vào SQL Server của bạn (`localhost` hoặc `.\SQLEXPRESS`).
2. Chọn **File → Open → File...** và chọn file:
   `c:\Users\Admin\Desktop\WebCafe\database\WebCafe_Full_Init.sql`
3. Nhấn **Execute** (hoặc phím **F5**) để chạy.
4. Khi thấy thông báo `🎉 CHÚC MỪNG! HỆ THỐNG CƠ SỞ DỮ LIỆU ĐÃ ĐƯỢC TẠO HOÀN TẤT!` ở khung Messages là xong!

---

### Cách 2: Dùng Azure Data Studio hoặc VS Code (Extension mssql)
1. Mở file [`WebCafe_Full_Init.sql`](file:///c:/Users/Admin/Desktop/WebCafe/database/WebCafe_Full_Init.sql).
2. Chọn Connection đến SQL Server instance của máy bạn.
3. Nhấn **Run** (`Ctrl + Shift + E` hoặc `F5`).

---

### Cách 3: Chạy bằng Command Line (`sqlcmd` hoặc PowerShell)
Mở PowerShell tại thư mục dự án và chạy:

```powershell
# Chạy với quyền Windows Authentication
sqlcmd -S localhost -E -i "database\WebCafe_Full_Init.sql"

# Hoặc nếu dùng SQLEXPRESS:
sqlcmd -S ".\SQLEXPRESS" -E -i "database\WebCafe_Full_Init.sql"
```

---

## 🔑 Tài khoản mẫu có sẵn sau khi Seed

| Vai trò | Email / Username | Mật khẩu mặc định | Ghi chú |
|---------|------------------|-------------------|---------|
| **Super Admin** | `admin@webcafe.vn` (`superadmin`) | `Admin@123` | Quản trị nền tảng SaaS |
| **Tenant Owner** (Minh Cafe) | `minh@minhcafe.vn` | `Admin@123` | Chủ chuỗi 2 chi nhánh |
| **Tenant Owner** (Lan Coffee) | `lan@lancoffee.vn` | `Admin@123` | Chủ quán độc lập |
| **Manager Q1** | `manager.q1@minhcafe.vn` | `123456` | Quản lý chi nhánh Quận 1 |
| **Barista Q1** | `barista1.q1@minhcafe.vn` | `123456` | Pha chế chi nhánh Quận 1 |
| **Server Q1** | `server1.q1@minhcafe.vn` | `123456` | Phục vụ chi nhánh Quận 1 |
