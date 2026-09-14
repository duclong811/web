# 🔐 Cách Reset Password Khi Quên (NHANH)

## ⚡ CÁCH 1: Dùng Tool Có Sẵn (Khuyến Nghị)

### **Bước 1:** Mở file `Program.cs`

### **Bước 2:** Thêm code này vào TRƯỚC dòng `app.Run();`

```csharp
// === UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
//     await ResetPasswordTool.InteractiveReset(db);
//     return; // Dừng app sau khi reset xong
// }
// === KẾT THÚC RESET PASSWORD CODE ===

app.Run();
```

### **Bước 3:** Uncomment (bỏ dấu //) và chạy:

```bash
cd backend
dotnet run
```

### **Bước 4:** Tool sẽ hỏi bạn:

```
📋 DANH SÁCH TẤT CẢ USER:
================================================================================

🔑 SYSTEM ADMINS:
  • Username: superadmin | Email: admin@webcafe.vn | Name: Hệ thống WebCafe Master

👑 OWNERS (Tenant):
  • Email: owner@thecoffeehouse.vn | Name: Nguyễn Văn Chủ Quán | Brand: The Coffee House

👤 STAFF:
  • Username: staff_q1 | Email: staff.q1@thecoffeehouse.vn | Name: Lê Phục Vụ | Store: The Coffee House - Quận 1

================================================================================

📝 Nhập username hoặc email cần reset: staff_q1
🔒 Nhập password mới (hoặc Enter để dùng mặc định 'Password@123'): NewPass@123

🔍 Đang tìm user: staff_q1...
✅ Reset password cho Staff 'staff_q1' (Lê Phục Vụ) thành công!
   Username: staff_q1
   Password mới: NewPass@123

✨ Hoàn tất!
```

### **Bước 5:** Comment lại code và chạy app bình thường

```csharp
// === UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
//     await ResetPasswordTool.InteractiveReset(db);
//     return;
// }
// === KẾT THÚC RESET PASSWORD CODE ===

app.Run(); // App chạy bình thường
```

---

## 🛠️ CÁCH 2: Reset Bằng SQL (Nhanh nhất nhưng cần biết hash)

### **Bước 1:** Generate hash của password mới

Chạy C# code này (hoặc dùng online BCrypt tool):

```csharp
using BCrypt.Net;
string newPassword = "MyNewPassword@123";
string hash = BCrypt.HashPassword(newPassword);
Console.WriteLine(hash);
// Output: $2a$11$abc123xyz...
```

### **Bước 2:** Update trực tiếp SQL

**Reset Staff:**
```sql
UPDATE Staff
SET PasswordHash = '$2a$11$YOUR_HASH_HERE'
WHERE Username = 'staff_q1';
```

**Reset Owner:**
```sql
UPDATE Tenants
SET OwnerPasswordHash = '$2a$11$YOUR_HASH_HERE'
WHERE OwnerEmail = 'owner@thecoffeehouse.vn';
```

**Reset SuperAdmin:**
```sql
UPDATE SystemAdmins
SET PasswordHash = '$2a$11$YOUR_HASH_HERE'
WHERE Username = 'superadmin';
```

---

## 📋 DANH SÁCH TÀI KHOẢN MẶC ĐỊNH

### **SuperAdmin:**
- Username: `superadmin`
- Password: `Admin@123`
- Email: `admin@webcafe.vn`

### **Owner:**
- Email: `owner@thecoffeehouse.vn`
- Password: `Owner@123`

### **Staff:**
- Username: `staff_q1`
- Password: `Staff@123`
- Email: `staff.q1@thecoffeehouse.vn`

---

## ⚠️ LƯU Ý:

1. **Development:** Dùng Cách 1 (Tool) - dễ nhất
2. **Production:** Nên implement Reset Password API + Email
3. **Password mặc định:** `Password@123` nếu không nhập gì
4. **Sau khi reset:** Login với password mới ngay

---

## 🎯 VÍ DỤ SỬ DỤNG:

### Reset tất cả về password mặc định:

```bash
# Chạy tool và nhập:
staff_q1 → Enter (dùng Password@123)
owner@thecoffeehouse.vn → Enter
superadmin → Enter
```

### Reset về password tùy chỉnh:

```bash
# Chạy tool và nhập:
staff_q1 → MyNewPassword@123
```

---

**✨ Xong! Giờ bạn có thể reset password bất kỳ lúc nào trong vài giây!**
