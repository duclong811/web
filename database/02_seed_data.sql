-- ============================================================================
-- WebCafe SaaS QR Ordering Platform — Seed Data Mẫu
-- DBMS: Microsoft SQL Server (2019 / 2022 / Azure SQL)
-- ============================================================================

USE WebCafeDB;
GO

SET NOCOUNT ON;

-- ============================================================================
-- 1. PERMISSIONS (Danh mục quyền hệ thống cố định)
-- ============================================================================
INSERT INTO Permissions (Code, Name, Module) VALUES
-- Module Menu
('menu.view', N'Xem thực đơn món', 'menu'),
('menu.create', N'Thêm món ăn / danh mục mới', 'menu'),
('menu.edit', N'Chỉnh sửa món ăn & giá', 'menu'),
('menu.delete', N'Xóa / Ẩn món ăn', 'menu'),

-- Module Table & QR
('table.view', N'Xem sơ đồ bàn', 'table'),
('table.manage', N'Thêm / Sửa / Xóa bàn & QR code', 'table'),

-- Module Order
('order.view', N'Xem danh sách đơn đặt món', 'order'),
('order.manage', N'Tiếp nhận & cập nhật trạng thái đơn (Pha chế/Giao)', 'order'),
('order.edit', N'Sửa món / thêm ghi chú đơn', 'order'),

-- Module Payment
('payment.process', N'Xác nhận thanh toán (Tiền mặt / QR)', 'payment'),

-- Module Staff
('staff.view', N'Xem danh sách nhân viên', 'staff'),
('staff.manage', N'Thêm / Sửa / Phân ca nhân viên', 'staff'),

-- Module Voucher & Promotion
('voucher.view', N'Xem danh sách mã khuyến mãi', 'voucher'),
('voucher.manage', N'Tạo và quản lý voucher', 'voucher'),

-- Module Analytics & Reports
('analytics.view', N'Xem biểu đồ & báo cáo doanh thu', 'analytics'),
('analytics.export', N'Xuất báo cáo Excel/PDF', 'analytics'),

-- Module Store
('store.manage', N'Quản lý thông tin chi nhánh & ngân hàng VietQR', 'store');

PRINT N'✅ Đã thêm 17 Permissions hệ thống';
GO

-- ============================================================================
-- 2. SYSTEM ADMIN (Chủ nền tảng WebCafe SaaS — Quản lý tài khoản quán)
-- ============================================================================
-- Mật khẩu mặc định: Admin@123 (demo hash)
INSERT INTO SystemAdmins (Username, Email, PasswordHash, FullName, IsActive) VALUES
('superadmin', 'admin@webcafe.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', N'Nguyễn Quản Trị Hệ Thống', 1);

PRINT N'✅ Đã tạo tài khoản Super Admin';
GO

-- ============================================================================
-- 3. TENANTS (Các thương hiệu / Chủ chuỗi quán Cafe)
-- ============================================================================
-- Tenant 1: Ông Nguyễn Văn Minh (Chuỗi Minh Cafe - 2 chi nhánh)
-- Tenant 2: Bà Lê Thu Lan (Quán Lan Coffee - 1 chi nhánh - chứng minh multi-tenant độc lập)
INSERT INTO Tenants (Name, Slug, OwnerName, OwnerPhone, OwnerEmail, OwnerPasswordHash, LogoUrl, Plan, MaxStores, PointsPerAmount, PointsToMoney, IsActive) VALUES
(N'Minh Cafe', 'minh-cafe', N'Nguyễn Văn Minh', '0987654321', 'minh@minhcafe.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200', 'basic', 5, 10000, 200, 1),
(N'Lan Coffee', 'lan-coffee', N'Lê Thu Lan', '0912345678', 'lan@lancoffee.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', 'free', 1, 10000, 200, 1);

PRINT N'✅ Đã tạo 2 Tenants mẫu (Minh Cafe & Lan Coffee)';
GO

-- ============================================================================
-- 4. STORES (Chi nhánh quán)
-- ============================================================================
-- TenantId 1 (Minh Cafe) có 2 chi nhánh: Quận 1 & Quận 7
-- TenantId 2 (Lan Coffee) có 1 chi nhánh: Quận 3
INSERT INTO Stores (TenantId, Name, Address, Phone, BankAccount, BankName, BankAccountName, IsActive) VALUES
(1, N'Minh Cafe - Chi nhánh Quận 1', N'123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', '0281234567', '999988887777', N'MB Bank', N'NGUYEN VAN MINH', 1),
(1, N'Minh Cafe - Chi nhánh Quận 7', N'456 Nguyễn Thị Thập, Phường Tân Quy, Quận 7, TP.HCM', '0287654321', '888877776666', N'Techcombank', N'NGUYEN VAN MINH', 1),
(2, N'Lan Coffee - Chi nhánh Quận 3', N'78 Võ Văn Tần, Phường 6, Quận 3, TP.HCM', '02833334444', '111122223333', N'Vietcombank', N'LE THU LAN', 1);

PRINT N'✅ Đã tạo 3 Stores chi nhánh';
GO

-- ============================================================================
-- 5. ROLES & ROLE PERMISSIONS (Phân quyền nhân viên cho Tenant 1)
-- ============================================================================
INSERT INTO Roles (TenantId, Name, Description) VALUES
(1, N'Manager', N'Quản lý cửa hàng (Xem doanh thu, quản lý bàn, nhân viên, món)'),
(1, N'Barista', N'Pha chế đồ uống (Xem đơn, cập nhật trạng thái làm xong)'),
(1, N'Server', N'Nhân viên phục vụ (Kiểm tra bàn, hỗ trợ khách, xác nhận thanh toán)');

-- Gán quyền cho Manager (RoleId = 1)
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 1, PermissionId FROM Permissions
WHERE Code IN (
    'menu.view', 'menu.create', 'menu.edit', 'menu.delete',
    'table.view', 'table.manage',
    'order.view', 'order.manage', 'order.edit',
    'payment.process',
    'staff.view', 'staff.manage',
    'voucher.view', 'voucher.manage',
    'analytics.view', 'analytics.export'
);

-- Gán quyền cho Barista (RoleId = 2)
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 2, PermissionId FROM Permissions
WHERE Code IN ('menu.view', 'order.view', 'order.manage');

-- Gán quyền cho Server (RoleId = 3)
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 3, PermissionId FROM Permissions
WHERE Code IN ('menu.view', 'table.view', 'order.view', 'order.manage', 'order.edit', 'payment.process');

PRINT N'✅ Đã tạo Roles và ma trận RolePermissions';
GO

-- ============================================================================
-- 6. MENU: CATEGORIES, SIZES, TOPPINGS (Cho Tenant 1 - Minh Cafe)
-- ============================================================================
-- Categories
INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive) VALUES
(1, N'Cà Phê Pha Máy', 'coffee', 1, 1),
(1, N'Trà & Trái Cây', 'energy_savings_leaf', 2, 1),
(1, N'Sinh Tố & Trà Sữa', 'bubble_chart', 3, 1),
(1, N'Bánh Ngọt & Tráng Miệng', 'bakery_dining', 4, 1),
(1, N'Đồ Uống Đá Xay', 'local_drink', 5, 1);

-- Sizes
INSERT INTO Sizes (TenantId, Name, SortOrder) VALUES
(1, N'Nhỏ (S)', 1),
(1, N'Vừa (M)', 2),
(1, N'Lớn (L)', 3);

-- Toppings
INSERT INTO Toppings (TenantId, Name, Price, IsAvailable) VALUES
(1, N'Trân châu đen', 10000, 1),
(1, N'Trân châu trắng 3Q', 10000, 1),
(1, N'Thạch cà phê giòn', 10000, 1),
(1, N'Kem Cheese mặn', 15000, 1),
(1, N'Shot Espresso đậm đà', 12000, 1),
(1, N'Sữa tươi kem béo', 8000, 1),
(1, N'Whipped Cream', 10000, 1);

PRINT N'✅ Đã tạo Categories, Sizes, Toppings';
GO

-- ============================================================================
-- 7. MENU: ITEMS & MAPPING SIZES / TOPPINGS
-- ============================================================================
-- Menu Items (Khớp với dữ liệu hình ảnh và code frontend)
INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder) VALUES
-- Cà phê pha máy (CategoryId = 1)
(1, 1, N'Espresso Đậm Vị', N'Cà phê nguyên chất chiết xuất áp suất cao, hương vị đậm đà nguyên bản.', 35000, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', 4.8, 1, 1, 1),
(1, 1, N'Cappuccino Ý', N'Sự kết hợp hoàn hảo giữa Espresso, sữa nóng và lớp bọt sữa bồng bềnh phủ bột cacao.', 45000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80', 4.9, 1, 1, 2),
(1, 1, N'Caramel Macchiato', N'Espresso béo ngậy cùng sữa tươi và sốt caramel ngọt ngào quyến rũ.', 55000, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80', 4.7, 0, 1, 3),
(1, 1, N'Bạc Xỉu Sài Gòn', N'Hương vị quen thuộc với 3 tầng đẹp mắt: sữa đặc, sữa tươi và cốt cà phê đậm vị.', 39000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', 4.9, 1, 1, 4),

-- Trà & Trái cây (CategoryId = 2)
(1, 2, N'Matcha Latte Nhật Bản', N'Bột trà xanh Uji cao cấp hòa quyện cùng sữa tươi thanh trùng.', 50000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80', 4.8, 1, 1, 5),
(1, 2, N'Trà Đào Cam Sả', N'Vị thanh mát từ trà ô long, hương sả dịu nhẹ cùng miếng đào giòn ngọt.', 45000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', 4.9, 1, 1, 6),
(1, 2, N'Trà Vải Hoa Hồng', N'Thơm ngát hương hoa hồng quyến rũ, kèm những trái vải mọng nước.', 48000, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', 4.6, 0, 1, 7),

-- Sinh tố & Trà sữa (CategoryId = 3)
(1, 3, N'Trà Sữa Trân Châu Đường Đen', N'Trà sữa béo thơm kết hợp trân châu thủ công nấu cùng đường đen Hàn Quốc.', 45000, 'https://images.unsplash.com/photo-1626082895617-2c6ad361a86a?w=500&q=80', 4.9, 1, 1, 8),
(1, 3, N'Sinh Tố Bơ Sáp Dừa', N'Bơ Đắk Lắk dẻo mịn xay cùng nước cốt dừa béo thơm.', 55000, 'https://images.unsplash.com/photo-1638176066666-ffb2f5d21a22?w=500&q=80', 4.7, 0, 1, 9),

-- Bánh ngọt (CategoryId = 4)
(1, 4, N'New York Cheesecake', N'Bánh phô mai nướng phong cách New York truyền thống, vị chua nhẹ béo ngậy.', 60000, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&q=80', 4.9, 1, 1, 10),
(1, 4, N'Tiramisu Cacao', N'Bánh kem Ý mềm tan quyện hương vị cà phê và rượu nhẹ.', 55000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80', 4.8, 0, 1, 11);

-- Size price mapping (Size S = 0, Size M = +6.000, Size L = +12.000)
INSERT INTO MenuItemSizes (MenuItemId, SizeId, ExtraPrice) VALUES
(1, 1, 0), (1, 2, 6000), (1, 3, 12000),
(2, 1, 0), (2, 2, 6000), (2, 3, 12000),
(3, 1, 0), (3, 2, 6000), (3, 3, 12000),
(4, 1, 0), (4, 2, 6000), (4, 3, 12000),
(5, 1, 0), (5, 2, 6000), (5, 3, 12000),
(6, 1, 0), (6, 2, 6000), (6, 3, 12000),
(7, 1, 0), (7, 2, 6000), (7, 3, 12000),
(8, 1, 0), (8, 2, 6000), (8, 3, 12000),
(9, 1, 0), (9, 2, 8000), (9, 3, 15000);

-- Toppings mapping cho các món trà sữa & cà phê
INSERT INTO MenuItemToppings (MenuItemId, ToppingId) VALUES
(1, 5), (1, 6), -- Espresso: Shot thêm, sữa tươi
(2, 5), (2, 7), -- Cappuccino: Shot thêm, Whipped Cream
(4, 3), (4, 5), -- Bạc xỉu: Thạch cf, shot thêm
(5, 1), (5, 2), (5, 4), -- Matcha: Trân châu đen, 3Q, Kem Cheese
(6, 1), (6, 2), -- Trà đào: Trân châu trắng
(8, 1), (8, 2), (8, 3), (8, 4), (8, 7); -- Trà sữa đường đen: Đủ các loại topping

PRINT N'✅ Đã tạo MenuItems, Sizes mapping và Toppings mapping';
GO

-- ============================================================================
-- 8. TABLES (Danh sách bàn các chi nhánh)
-- ============================================================================
-- Bàn cho Store 1 (Minh Cafe - Quận 1)
INSERT INTO Tables (StoreId, TableNumber, Capacity, Location, QRCodeUrl, Status, IsActive) VALUES
(1, '01', 4, N'Tầng 1 - Trong nhà', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/01', 'Occupied', 1),
(1, '02', 2, N'Tầng 1 - Trong nhà', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/02', 'Available', 1),
(1, '03', 4, N'Tầng 1 - Cửa sổ kính', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/03', 'Available', 1),
(1, '04', 6, N'Tầng 1 - Góc sofa lớn', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/04', 'Occupied', 1),
(1, '05', 2, N'Tầng 1 - Quầy Bar', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/05', 'Available', 1),
(1, '06', 4, N'Tầng 2 - Ban công view phố', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/06', 'Reserved', 1),
(1, '07', 4, N'Tầng 2 - Ban công view phố', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/07', 'Available', 1),
(1, '08', 8, N'Tầng 2 - Phòng họp nhóm', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/08', 'Available', 1);

-- Bàn cho Store 2 (Minh Cafe - Quận 7)
INSERT INTO Tables (StoreId, TableNumber, Capacity, Location, QRCodeUrl, Status, IsActive) VALUES
(2, '01', 4, N'Sân vườn thoáng mát', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/q7/table/01', 'Available', 1),
(2, '02', 4, N'Sân vườn thoáng mát', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/q7/table/02', 'Available', 1),
(2, '03', 6, N'Phòng lạnh máy lạnh', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/q7/table/03', 'Available', 1);

PRINT N'✅ Đã tạo Tables cho các chi nhánh';
GO

-- ============================================================================
-- 9. STAFF (Nhân viên các chi nhánh)
-- ============================================================================
-- Mật khẩu mặc định: 123456 (hash demo)
INSERT INTO Staff (StoreId, RoleId, FullName, Email, Phone, PasswordHash, AvatarUrl, ShiftStart, ShiftEnd, IsOnDuty, IsActive) VALUES
-- Store 1: Minh Cafe Q.1
(1, 1, N'Trần Văn Long', 'manager.q1@minhcafe.vn', '0901112223', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '07:00:00', '16:00:00', 1, 1),
(1, 2, N'Hoàng Thị Mai', 'barista1.q1@minhcafe.vn', '0902223334', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '07:00:00', '15:00:00', 1, 1),
(1, 3, N'Lê Quốc Bảo', 'server1.q1@minhcafe.vn', '0903334445', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '07:00:00', '15:00:00', 1, 1),

-- Store 2: Minh Cafe Q.7
(2, 1, N'Phạm Thu Hà', 'manager.q7@minhcafe.vn', '0904445556', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '08:00:00', '17:00:00', 1, 1),
(2, 2, N'Ngô Đức Trọng', 'barista1.q7@minhcafe.vn', '0905556667', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', '08:00:00', '17:00:00', 1, 1);

PRINT N'✅ Đã tạo tài khoản Staff';
GO

-- ============================================================================
-- 10. CUSTOMERS & LOYALTY (Khách hàng tích điểm cho Minh Cafe)
-- ============================================================================
INSERT INTO Customers (TenantId, Phone, Name, TotalPoints, TotalSpent, VisitCount, LastVisitAt) VALUES
(1, '0981112233', N'Đỗ Thanh Tú', 150, 1500000, 8, GETDATE()),
(1, '0972223344', N'Vũ Ngọc Ánh', 45, 450000, 3, DATEADD(DAY, -2, GETDATE())),
(1, '0963334455', N'Bùi Minh Tuấn', 280, 2800000, 14, DATEADD(DAY, -1, GETDATE()));

-- Lịch sử điểm cho khách Đỗ Thanh Tú (CustomerId = 1)
INSERT INTO LoyaltyPoints (CustomerId, OrderId, Points, Type, Description) VALUES
(1, NULL, 50, 'bonus', N'Thưởng đăng ký thành viên mới'),
(1, NULL, 150, 'earn', N'Tích điểm từ đơn hàng thanh toán thành công'),
(1, NULL, -50, 'redeem', N'Đổi voucher giảm giá 10.000đ');

PRINT N'✅ Đã tạo Customers & LoyaltyPoints';
GO

-- ============================================================================
-- 11. VOUCHERS (Mã giảm giá)
-- ============================================================================
INSERT INTO Vouchers (TenantId, StoreId, Code, Title, Description, DiscountType, DiscountValue, MaxDiscount, MinOrderAmount, Scope, MaxUsageTotal, MaxUsagePerCustomer, UsedCount, StartDate, EndDate, IsActive) VALUES
(1, NULL, 'WELCOME20', N'Giảm 20% đơn đầu tiên', N'Áp dụng cho mọi khách hàng lần đầu đặt món qua QR', 'percent', 20, 50000, 50000, 'public', 1000, 1, 45, '2026-01-01', '2026-12-31', 1),
(1, NULL, 'MINHCAFE15K', N'Giảm trực tiếp 15.000đ', N'Áp dụng cho đơn hàng từ 100.000đ trở lên', 'fixed', 15000, NULL, 100000, 'public', 500, 2, 120, '2026-01-01', '2026-12-31', 1),
(1, 1, 'Q1SPECIAL', N'Đặc quyền Quận 1 - Giảm 30K', N'Chỉ áp dụng tại chi nhánh Quận 1', 'fixed', 30000, NULL, 150000, 'public', 200, 1, 30, '2026-01-01', '2026-12-31', 1);

PRINT N'✅ Đã tạo Vouchers';
GO

-- ============================================================================
-- 12. SAMPLE ORDERS, ORDER ITEMS, TOPPINGS & PAYMENTS
-- ============================================================================
-- Đơn hàng 1: Bàn 01 - Đang chuẩn bị (Preparing)
INSERT INTO Orders (TenantId, StoreId, OrderCode, TableId, CustomerId, StaffId, Status, SubTotal, DiscountAmount, PointsUsed, PointsEarned, ServiceFee, TotalAmount, Note, CreatedAt)
VALUES (1, 1, 'WB-8891', 1, 1, 2, 'preparing', 105000, 21000, 0, 8, 0, 84000, N'Bàn 01 gọi ít ngọt', DATEADD(MINUTE, -15, GETDATE()));

-- Chi tiết đơn 1
INSERT INTO OrderItems (OrderId, MenuItemId, SizeId, Quantity, UnitPrice, ToppingTotal, SubTotal, SugarLevel, IceLevel, Note) VALUES
(1, 2, 2, 1, 51000, 0, 51000, '50%', '100%', N'Ít ngọt'), -- Cappuccino size M
(1, 8, 2, 1, 51000, 10000, 61000, '70%', '50%', N'Ít đá'); -- Trà sữa đường đen size M + topping

INSERT INTO OrderItemToppings (OrderItemId, ToppingId, Price) VALUES
(2, 1, 10000); -- Trân châu đen cho món trà sữa

-- Áp voucher WELCOME20 (20% = 21.000đ)
INSERT INTO VoucherUsages (VoucherId, CustomerId, OrderId, DiscountAmount, UsedAt) VALUES
(1, 1, 1, 21000, DATEADD(MINUTE, -15, GETDATE()));


-- Đơn hàng 2: Bàn 04 - Đã thanh toán xong (Paid)
INSERT INTO Orders (TenantId, StoreId, OrderCode, TableId, CustomerId, StaffId, Status, SubTotal, DiscountAmount, PointsUsed, PointsEarned, ServiceFee, TotalAmount, Note, CreatedAt)
VALUES (1, 1, 'WB-8892', 4, 3, 3, 'paid', 185000, 15000, 0, 17, 0, 170000, N'Mang ra cùng lúc', DATEADD(HOUR, -2, GETDATE()));

INSERT INTO OrderItems (OrderId, MenuItemId, SizeId, Quantity, UnitPrice, ToppingTotal, SubTotal, SugarLevel, IceLevel, Note) VALUES
(2, 6, 2, 2, 51000, 10000, 112000, '100%', '100%', NULL), -- 2 Trà Đào Cam Sả size M
(2, 10, NULL, 1, 60000, 0, 60000, '100%', '100%', NULL); -- 1 New York Cheesecake

INSERT INTO OrderItemToppings (OrderItemId, ToppingId, Price) VALUES
(3, 2, 10000); -- Trân châu trắng 3Q

-- Thanh toán qua VietQR
INSERT INTO Payments (OrderId, Method, Amount, TransactionRef, Status, PaidAt, ProcessedByStaffId) VALUES
(2, 'vietqr', 170000, 'VQR2026090812345678', 'completed', DATEADD(HOUR, -2, GETDATE()), 3);

PRINT N'✅ Đã tạo Sample Orders, OrderItems, Toppings và Payments!';
PRINT N'===========================================================';
PRINT N'🎉 HOÀN TẤT SEED DỮ LIỆU MẪU CHO CSDL WEBHUB CAFE SAAS!';
GO
