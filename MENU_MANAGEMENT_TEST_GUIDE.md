# 🧪 Menu Management - Tenant Isolation Test Guide

## Prerequisites
- Backend đang chạy (`dotnet run` trong folder `backend`)
- Frontend đang chạy (`npm run dev`)
- 2 tenant accounts với password `123123`:
  - Tenant A: `minh@minhcafe.vn`
  - Tenant B: `lan@lancoffee.vn`

---

## Test Case 1: Login và truy cập Menu Management

### Tenant A - Minh Cafe
1. ✅ Logout nếu đang login
2. ✅ Login với `minh@minhcafe.vn` / `123123`
3. ✅ Verify: Auto-redirect đến dashboard tenant
4. ✅ Navigate to "Quản Lý Thực Đơn" (Menu Management)
5. ✅ Verify: Trang load thành công, không có lỗi console

### Tenant B - Lan Coffee
1. ✅ Logout
2. ✅ Login với `lan@lancoffee.vn` / `123123`
3. ✅ Verify: Auto-redirect đến dashboard tenant
4. ✅ Navigate to "Quản Lý Thực Đơn"
5. ✅ Verify: Trang load thành công, list rỗng hoặc khác với Tenant A

**Expected Result:**
- Mỗi tenant chỉ thấy menu items của mình
- Không có lỗi 401/403 trong console

---

## Test Case 2: Create Category (Tenant Isolation)

### Tenant A - Minh Cafe
1. ✅ Login as `minh@minhcafe.vn`
2. ✅ Click "Danh Mục" button
3. ✅ Thêm category: "Cà phê ☕" (sortOrder: 1)
4. ✅ Thêm category: "Trà sữa 🧋" (sortOrder: 2)
5. ✅ Verify: 2 categories xuất hiện trong danh sách
6. ✅ Check browser DevTools Network tab:
   - `POST /api/menu/categories` → Status 200
   - Response body có `categoryId` và `tenantId`

### Tenant B - Lan Coffee
1. ✅ Login as `lan@lancoffee.vn`
2. ✅ Click "Danh Mục" button
3. ✅ Thêm category: "Đồ uống lạnh 🧊" (sortOrder: 1)
4. ✅ Thêm category: "Bánh ngọt 🍰" (sortOrder: 2)
5. ✅ Verify: Chỉ thấy 2 categories vừa tạo
6. ✅ Verify: KHÔNG thấy categories của Minh Cafe (Cà phê, Trà sữa)

**Expected Result:**
- Tenant A có: Cà phê, Trà sữa
- Tenant B có: Đồ uống lạnh, Bánh ngọt
- Không có cross-tenant visibility

---

## Test Case 3: Create Menu Items (Data Isolation)

### Tenant A - Minh Cafe
1. ✅ Login as `minh@minhcafe.vn`
2. ✅ Click "Thêm Món Mới"
3. ✅ Thêm món:
   ```
   Tên: Cà phê sữa đá
   Mô tả: Cà phê phin truyền thống
   Giá: 35000
   Danh mục: Cà phê
   URL ảnh: https://via.placeholder.com/200
   Đang bán: ✓
   ```
4. ✅ Thêm thêm 2-3 món nữa
5. ✅ Verify: Các món xuất hiện trong table
6. ✅ Check Network tab:
   - `POST /api/menu/items` → Status 200
   - Response có `menuItemId` và `tenantId = <Minh's tenantId>`

### Tenant B - Lan Coffee
1. ✅ Login as `lan@lancoffee.vn`
2. ✅ Click "Thêm Món Mới"
3. ✅ Thêm món:
   ```
   Tên: Trà đào cam sả
   Mô tả: Trà trái cây tươi mát
   Giá: 45000
   Danh mục: Đồ uống lạnh
   URL ảnh: https://via.placeholder.com/200
   Đang bán: ✓
   ```
4. ✅ Verify: Chỉ thấy món của Lan Coffee
5. ✅ Verify: KHÔNG thấy "Cà phê sữa đá" của Minh Cafe

**Expected Result:**
- Tenant A menu ≠ Tenant B menu
- Không có data leakage giữa tenants

---

## Test Case 4: Edit Menu Item (Authorization Check)

### Tenant A - Minh Cafe
1. ✅ Login as `minh@minhcafe.vn`
2. ✅ Click "Sửa" trên món "Cà phê sữa đá"
3. ✅ Thay đổi giá: 35000 → 40000
4. ✅ Click "Cập Nhật"
5. ✅ Verify: Giá thay đổi trong table
6. ✅ Check Network:
   - `PUT /api/menu/items/{id}` → Status 200

### Tenant B - Cannot Edit Tenant A's Items (Security Test)
**Manual API Test với Postman/Thunder Client:**
1. ✅ Login as Lan Coffee → Copy JWT token
2. ✅ Try to edit Minh Cafe's item:
   ```
   PUT /api/menu/items/{minhCafeMenuItemId}
   Authorization: Bearer <lanCoffeeToken>
   Body: { name: "Hacked", basePrice: 1, categoryId: 1, ... }
   ```
3. ✅ **Expected Response: 403 Forbidden hoặc 404 Not Found**
4. ✅ Verify: Món của Minh không bị thay đổi

**Expected Result:**
- Tenant không thể sửa/xóa items của tenant khác
- API trả về lỗi authorization

---

## Test Case 5: Delete Menu Item

### Tenant A - Minh Cafe
1. ✅ Login as `minh@minhcafe.vn`
2. ✅ Click "Xóa" trên một món
3. ✅ Confirm dialog
4. ✅ Verify: Món biến mất khỏi danh sách
5. ✅ Check Network:
   - `DELETE /api/menu/items/{id}` → Status 200

### Tenant B - Cannot Delete Tenant A's Items
**Manual API Test:**
1. ✅ Login as Lan Coffee
2. ✅ Try to delete Minh Cafe's item:
   ```
   DELETE /api/menu/items/{minhCafeMenuItemId}
   Authorization: Bearer <lanCoffeeToken>
   ```
3. ✅ **Expected Response: 403 Forbidden**

---

## Test Case 6: Category Filter

### Tenant A
1. ✅ Login as `minh@minhcafe.vn`
2. ✅ Click category chip "Cà phê"
3. ✅ Verify: Chỉ hiện món thuộc category "Cà phê"
4. ✅ Click "Tất Cả"
5. ✅ Verify: Hiện tất cả món của Minh Cafe

### Tenant B
1. ✅ Login as `lan@lancoffee.vn`
2. ✅ Click category chip "Đồ uống lạnh"
3. ✅ Verify: Chỉ hiện món thuộc "Đồ uống lạnh"
4. ✅ Verify: KHÔNG thấy category "Cà phê" của Minh

---

## Test Case 7: Pagination

### Tenant A (if có > 8 items)
1. ✅ Thêm 10+ menu items
2. ✅ Verify: Pagination controls xuất hiện
3. ✅ Click page 2
4. ✅ Verify: Load items tiếp theo
5. ✅ Verify: Tất cả items đều thuộc Tenant A

---

## Test Case 8: Backend Authorization Logs

### Check Backend Console
1. ✅ Khi Tenant A gọi `GET /api/menu/items`:
   ```
   [INFO] MenuController.GetMenuItems - TenantId from JWT: 1
   ```

2. ✅ Khi Tenant B gọi `GET /api/menu/items`:
   ```
   [INFO] MenuController.GetMenuItems - TenantId from JWT: 2
   ```

3. ✅ Verify: Mỗi tenant có TenantId khác nhau trong JWT

---

## Test Case 9: Database Verification

### SQL Query để verify isolation
```sql
-- Check Menu Items per Tenant
SELECT 
    TenantId,
    COUNT(*) AS TotalItems,
    STRING_AGG(Name, ', ') AS MenuItems
FROM MenuItems
GROUP BY TenantId;

-- Check Categories per Tenant
SELECT 
    TenantId,
    COUNT(*) AS TotalCategories,
    STRING_AGG(Name, ', ') AS Categories
FROM Categories
GROUP BY TenantId;

-- Verify no shared data
SELECT 
    m.MenuItemId,
    m.Name AS ItemName,
    m.TenantId AS ItemTenant,
    c.Name AS CategoryName,
    c.TenantId AS CategoryTenant
FROM MenuItems m
JOIN Categories c ON m.CategoryId = c.CategoryId
WHERE m.TenantId != c.TenantId; -- Should return 0 rows
```

**Expected Result:**
- Each tenant has separate menu items
- No menu item references category from different tenant
- Last query returns 0 rows

---

## Test Case 10: JWT Token Inspection

### Verify Token Claims
1. ✅ Login as Tenant A
2. ✅ Open browser DevTools → Application → Local Storage
3. ✅ Copy `token` value
4. ✅ Decode JWT at https://jwt.io/
5. ✅ Verify payload contains:
   ```json
   {
     "TenantId": "1",
     "Role": "Owner",
     "Email": "minh@minhcafe.vn",
     ...
   }
   ```

6. ✅ Repeat for Tenant B → Verify `TenantId: "2"`

---

## 🎯 Success Criteria

✅ **Tenant Isolation:**
- Tenant A không thấy data của Tenant B
- Tenant B không thấy data của Tenant A

✅ **Authorization:**
- Tenant không thể CRUD data của tenant khác qua API
- API trả về 403/404 khi unauthorized

✅ **JWT Integration:**
- TenantId được extract từ JWT token
- Không cần truyền tenantId qua URL parameters

✅ **UI/UX:**
- No errors trong browser console
- Smooth loading states và error handling
- Modals hoạt động đúng

✅ **Database Integrity:**
- Mỗi menu item có đúng TenantId
- Không có cross-tenant foreign keys

---

## 🐛 Common Issues & Solutions

### Issue 1: "Không tìm thấy thông tin Tenant"
**Cause:** JWT token không có TenantId claim  
**Solution:** 
- Check AuthService.cs → Verify JWT generation includes TenantId
- Re-login để lấy token mới

### Issue 2: 401 Unauthorized
**Cause:** Token expired hoặc không valid  
**Solution:**
- Logout và login lại
- Check token trong localStorage

### Issue 3: Tenant A thấy data của Tenant B
**Cause:** Services không filter theo TenantId  
**Solution:**
- Check MenuItemService.GetMenuItemsByTenantAsync()
- Verify WHERE clause có `TenantId = @tenantId`

### Issue 4: Category không hiện trong dropdown
**Cause:** Categories API chưa được gọi  
**Solution:**
- Check Network tab → Verify `/api/menu/categories` được call
- Check response data format

---

## 📊 Test Report Template

```markdown
# Menu Management Test Report

**Tested by:** [Your Name]  
**Date:** [Date]  
**Backend Status:** ✅ Running / ❌ Down  
**Frontend Status:** ✅ Running / ❌ Down

## Test Results

| Test Case | Tenant A | Tenant B | Status | Notes |
|-----------|----------|----------|--------|-------|
| TC1: Login & Access | ✅ | ✅ | PASS | - |
| TC2: Create Category | ✅ | ✅ | PASS | - |
| TC3: Create Menu Items | ✅ | ✅ | PASS | - |
| TC4: Edit Menu Item | ✅ | ✅ | PASS | - |
| TC5: Delete Menu Item | ✅ | ✅ | PASS | - |
| TC6: Category Filter | ✅ | ✅ | PASS | - |
| TC7: Pagination | ✅ | N/A | PASS | - |
| TC8: Backend Logs | ✅ | ✅ | PASS | - |
| TC9: Database Verify | - | - | PASS | - |
| TC10: JWT Inspection | ✅ | ✅ | PASS | - |

## Issues Found
- [List any bugs or issues]

## Overall Status
✅ ALL TESTS PASSED / ❌ FAILED

## Recommendations
- [Any improvements or suggestions]
```

---

## 🚀 Quick Start Testing

**5-Minute Smoke Test:**
1. Login Tenant A → Thêm 1 category + 1 menu item
2. Login Tenant B → Verify không thấy data của A
3. Tenant B thêm 1 category + 1 menu item
4. Login lại Tenant A → Verify không thấy data của B
5. ✅ If all pass → Tenant isolation working!

---

**Happy Testing! 🎉**
