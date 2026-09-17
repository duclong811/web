# ⚡ CÁCH RESET PASSWORD NHANH NHẤT (30 GIÂY)

## ❌ KHÔNG THẾ VIẾT TAY VÀO SQL!

Password đã được **hash bằng BCrypt** nên bạn KHÔNG thể viết tay vào SQL như:
```sql
-- ❌ SAI - Không work!
UPDATE Staff SET PasswordHash = 'Password123' WHERE Username = 'staff_q1';
```

---

## ✅ CÁCH ĐÚNG - 3 BƯỚC:

### **Bước 1: Mở file `Program.cs`**

Tìm dòng có comment:
```csharp
// === 🔐 RESET PASSWORD TOOL: UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
```

### **Bước 2: Bỏ dấu `//` (uncomment)**

**Từ:**
```csharp
// === 🔐 RESET PASSWORD TOOL: UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
//     await ResetPasswordTool.InteractiveReset(db);
//     return;
// }
// === KẾT THÚC RESET PASSWORD CODE ===
```

**Thành:**
```csharp
// === 🔐 RESET PASSWORD TOOL: UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
    await ResetPasswordTool.InteractiveReset(db);
    return;
}
// === KẾT THÚC RESET PASSWORD CODE ===
```

### **Bước 3: Chạy backend**

```bash
cd backend
dotnet run
```

### **Kết quả:**

```
📋 DANH SÁCH TẤT CẢ USER:
================================================================================

🔑 SYSTEM ADMINS:
  • Username: superadmin | Email: admin@webcafe.vn

👑 OWNERS:
  • Email: owner@thecoffeehouse.vn | Name: Nguyễn Văn Chủ Quán

👤 STAFF:
  • Username: staff_q1 | Email: staff.q1@thecoffeehouse.vn | Name: Lê Phục Vụ

================================================================================

📝 Nhập username hoặc email cần reset: staff_q1
🔒 Nhập password mới (hoặc Enter để dùng 'Password@123'): MyNewPass@123

🔍 Đang tìm user: staff_q1...
✅ Reset password thành công!
   Username: staff_q1
   Password mới: MyNewPass@123
```

### **Bước 4: Comment lại và chạy app bình thường**

Thêm `//` vào lại:
```csharp
// === 🔐 RESET PASSWORD TOOL: UNCOMMENT DƯỚI ĐÂY ĐỂ RESET PASSWORD ===
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
//     await ResetPasswordTool.InteractiveReset(db);
//     return;
// }
// === KẾT THÚC RESET PASSWORD CODE ===
```

Rồi chạy lại: `dotnet run`

---

## 🎯 VÍ DỤ THỰC TẾ:

### **Reset staff_q1 về password mặc định:**
```
📝 Nhập username: staff_q1
🔒 Password mới: [Enter] ← Không gõ gì, chỉ Enter

→ Password sẽ là: Password@123
```

### **Reset với password tùy chọn:**
```
📝 Nhập username: staff_q1
🔒 Password mới: HelloWorld@456

→ Password mới: HelloWorld@456
```

---

## 📋 TÀI KHOẢN MẶC ĐỊNH:

| Username/Email | Password Gốc | Role |
|---|---|---|
| `superadmin` | `Admin@123` | SystemAdmin |
| `owner@thecoffeehouse.vn` | `Owner@123` | Owner |
| `staff_q1` | `Staff@123` | Staff |

---

## ⚠️ LƯU Ý:

✅ **Làm được:**
- Reset bất kỳ user nào trong database
- Đặt password mới tùy ý
- Xem danh sách tất cả users

❌ **Không được:**
- Viết tay password vào SQL (không work!)
- Quên comment lại code sau khi reset (app sẽ không chạy)

---

## 💡 TÓM TẮT:

1. ✏️ Mở `Program.cs` → Bỏ dấu `//` ở đoạn reset password
2. ▶️ Chạy `dotnet run`
3. 📝 Nhập username + password mới
4. ✅ Xong! Comment lại và chạy app bình thường

**Thời gian:** ~30 giây ⚡
