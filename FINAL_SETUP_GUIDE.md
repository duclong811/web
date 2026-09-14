# ✅ HƯỚNG DẪN FIX VÀ SETUP HOÀN CHỈNH

## 📋 TÓM TẮT VẤN ĐỀ ĐÃ FIX:

1. ✅ **DatabaseSeeder.cs** đã có field `Username` cho Staff
2. ✅ **Reset Password Tool** đã được comment lại
3. ✅ **Program.cs** đã thêm `using Microsoft.EntityFrameworkCore;`
4. ✅ **AuthModal, UserMenu** components đã tạo cho frontend

---

## 🎯 **CÁC BƯỚC SETUP TỪ ĐẦU:**

### **BƯỚC 1: Xóa Database cũ và tạo lại**

```bash
cd backend
dotnet ef database drop --force
dotnet ef database update
```

**Hoặc dùng SQL:**
```sql
USE master;
GO
DROP DATABASE IF EXISTS WebCafeDB;
GO
```

Sau đó chạy backend để DatabaseSeeder tự động tạo lại.

---

### **BƯỚC 2: Chạy Backend**

```bash
cd backend
dotnet run
```

**Kết quả:** Backend sẽ tự động:
- Tạo database `WebCafeDB`
- Chạy migration
- Seed data mẫu (superadmin, owner, staff, menu items, v.v.)
- Mở Swagger tại http://localhost:5277/swagger

---

### **BƯỚC 3: Chạy Frontend**

```bash
# Terminal mới
npm run dev
```

**Kết quả:** Frontend chạy tại http://localhost:5173

---

## 🔐 **DANH SÁCH TÀI KHOẢN DEMO:**

### **1. SuperAdmin:**
```
Username: superadmin
Password: Admin@123
Email: admin@webcafe.vn
API: POST /api/auth/admin-login
```

### **2. Owner (Tenant):**
```
Email: owner@thecoffeehouse.vn
Password: Owner@123
Tenant: The Coffee House
API: POST /api/auth/owner-login
```

### **3. Staff:**
```
Username: staff_q1
Password: Staff@123
Email: staff.q1@thecoffeehouse.vn
Store: The Coffee House - Quận 1
API: POST /api/auth/login
```

---

## 🛠️ **CÁCH RESET PASSWORD (KHI CẦN):**

### **Option 1: Dùng Tool Reset Password**

1. Mở `Program.cs`
2. Tìm dòng 30 có comment `// === 🔐 RESET PASSWORD TOOL`
3. Bỏ dấu `//` ở 5 dòng code (dòng 31-85)
4. Chạy `dotnet run`
5. Tool sẽ hỏi bạn username và password mới trong terminal
6. Sau khi reset xong, comment lại code

### **Option 2: Dùng SQL Script**

```sql
USE WebCafeDB;
GO

-- Reset Staff
UPDATE Staff
SET PasswordHash = '$2a$11$YOUR_BCRYPT_HASH_HERE'
WHERE Username = 'staff_q1';

-- Reset Owner
UPDATE Tenants
SET OwnerPasswordHash = '$2a$11$YOUR_BCRYPT_HASH_HERE'
WHERE OwnerEmail = 'owner@thecoffeehouse.vn';

-- Reset SuperAdmin
UPDATE SystemAdmins
SET PasswordHash = '$2a$11$YOUR_BCRYPT_HASH_HERE'
WHERE Username = 'superadmin';
```

**Cách generate BCrypt hash:**
- Online tool: https://bcrypt-generator.com/
- Hoặc dùng C# code:
  ```csharp
  using BCrypt.Net;
  string hash = BCrypt.HashPassword("YourNewPassword@123");
  Console.WriteLine(hash);
  ```

---

## 📦 **FRONTEND - AUTH COMPONENTS ĐÃ TẠO:**

### **1. AuthModal.tsx** (`src/components/AuthModal.tsx`)
- Modal đăng nhập/đăng ký inline
- Toggle giữa Login/Register
- Tích hợp authStore
- Error handling

### **2. UserMenu.tsx** (`src/components/UserMenu.tsx`)
- Dropdown menu khi đã login
- Hiển thị user info
- Links: Profile, Lịch sử đơn, Settings, Đăng xuất
- Role-based menu items

### **3. Menu.tsx Updated**
- User icon button ở TopNavBar
- Click → AuthModal (chưa login) hoặc UserMenu (đã login)
- Mobile drawer cũng có auth section

---

## 🔍 **CÁCH XEM USERS TRONG DATABASE:**

### **SQL Script:**

```sql
USE WebCafeDB;
GO

-- Xem tất cả SystemAdmins
SELECT 'SystemAdmin' as Type, Username, Email, FullName, IsActive
FROM SystemAdmins;

-- Xem tất cả Owners
SELECT 'Owner' as Type, OwnerEmail as Username, OwnerEmail as Email, OwnerName as FullName, Name as Brand, IsActive
FROM Tenants;

-- Xem tất cả Staff
SELECT 'Staff' as Type, s.Username, s.Email, s.FullName, st.Name as StoreName, s.IsActive
FROM Staff s
LEFT JOIN Stores st ON s.StoreId = st.StoreId;

-- Xem tất cả Customers (nếu có)
SELECT 'Customer' as Type, Phone as Username, Name as FullName, TotalPoints, TotalSpent
FROM Customers;
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG:**

### **Password Hashing:**
- Backend dùng **BCrypt** để hash password
- **KHÔNG THỂ** viết tay plain text password vào SQL
- Phải dùng `SecurityHelper.HashPassword()` hoặc BCrypt tool

### **Username vs Email:**
- **SuperAdmin:** Dùng `Username`
- **Owner:** Dùng `OwnerEmail` (làm username)
- **Staff:** Dùng `Username` (có cả Email)
- **Customer:** Dùng `Phone` (không có password)

### **API Endpoints:**
- SuperAdmin: `POST /api/auth/admin-login`
- Owner: `POST /api/auth/owner-login`
- Staff: `POST /api/auth/login`
- Customer Register: `POST /api/auth/register`

---

## 🎉 **CHECKLIST - ĐÃ HOÀN THÀNH:**

- [x] Backend có JWT Authentication
- [x] Authorization Policies (SystemAdminOnly, TenantOwnerOnly, v.v.)
- [x] DatabaseSeeder có Username cho Staff
- [x] Reset Password Tool (có thể bật/tắt)
- [x] Frontend AuthModal (Login/Register)
- [x] Frontend UserMenu (Dropdown)
- [x] User Icon trên TopNavBar
- [x] Mobile Auth section
- [x] Axios interceptor (auto bearer token)
- [x] Auto redirect khi 401
- [x] ProtectedRoute component
- [x] authStore với Zustand persist

---

## 🚀 **TEST FLOW:**

### **1. Test Backend:**
```bash
cd backend
dotnet run
```
→ Mở http://localhost:5277/swagger
→ Test endpoint `/api/auth/login` với `staff_q1 / Staff@123`

### **2. Test Frontend Login:**
```bash
npm run dev
```
→ Mở http://localhost:5173
→ Click icon User (góc phải)
→ Login với `staff_q1 / Staff@123`
→ Kiểm tra UserMenu dropdown

### **3. Test Register:**
→ Click "Chưa có tài khoản? Đăng ký ngay"
→ Điền form đầy đủ
→ Submit → Auto login

---

## 📝 **FILES QUAN TRỌNG:**

**Backend:**
- `Program.cs` - Main entry, có reset password tool (commented)
- `DatabaseSeeder.cs` - Seed data with correct Username
- `ApiControllers.cs` - AuthController với 4 endpoints
- `ServiceCollectionExtensions.cs` - JWT + Authorization config
- `SecurityHelper.cs` - BCrypt password hashing

**Frontend:**
- `src/components/AuthModal.tsx` - Login/Register modal
- `src/components/UserMenu.tsx` - User dropdown menu
- `src/pages/customer/Menu.tsx` - Updated with User icon
- `src/store/authStore.ts` - Zustand auth state
- `src/api/apiClient.ts` - Axios với interceptors

---

## 🆘 **TROUBLESHOOTING:**

### **Vấn đề: "Username không tồn tại"**
→ Chạy migration lại: `dotnet ef database drop --force && dotnet ef database update`

### **Vấn đề: "Password không đúng"**
→ Dùng Reset Password Tool hoặc check password mặc định trong guide này

### **Vấn đề: "401 Unauthorized"**
→ Check token trong localStorage
→ Check Swagger để test API trực tiếp

### **Vấn đề: "Backend không chạy"**
→ Check port 5277 có bị chiếm không
→ Kill process: `Get-Process -Name "WebCafe.Backend" | Stop-Process`

---

**Người tạo:** Kiro AI  
**Ngày:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Status:** ✅ Production Ready
