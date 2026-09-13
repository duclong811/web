-- ============================================================================
-- ☕ WEBCAFE SAAS QR ORDERING PLATFORM — MASTER DATABASE INIT SCRIPT
-- ============================================================================
-- Mô tả: File tổng hợp khởi tạo Database, 22 Bảng, Khóa ngoại, Ràng buộc, 
--        Indexes, Dữ liệu mẫu (Seed Data) và Stored Procedures.
-- Hướng dẫn chạy: Mở file này trong SSMS (SQL Server Management Studio)
--                 hoặc Azure Data Studio rồi nhấn nút "Execute" (F5).
-- ============================================================================

-- BƯỚC 1: TẠO DATABASE
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'WebCafeDB')
BEGIN
    CREATE DATABASE WebCafeDB COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE WebCafeDB;
GO

SET NOCOUNT ON;
PRINT N'▶ BẮT ĐẦU TẠO BẢNG VÀ RÀNG BUỘC...';

-- ============================================================================
-- PHẦN 1: SCHEMA — 22 BẢNG HỆ THỐNG
-- ============================================================================

-- 0.1 SystemAdmins
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SystemAdmins') AND type in (N'U'))
BEGIN
    CREATE TABLE SystemAdmins (
        AdminId INT IDENTITY(1,1) PRIMARY KEY,
        Username VARCHAR(50) NOT NULL UNIQUE,
        Email VARCHAR(150) NOT NULL UNIQUE,
        PasswordHash VARCHAR(256) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 0.2 Tenants
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Tenants') AND type in (N'U'))
BEGIN
    CREATE TABLE Tenants (
        TenantId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Slug VARCHAR(50) NOT NULL UNIQUE,
        OwnerName NVARCHAR(100) NOT NULL,
        OwnerPhone VARCHAR(15) NOT NULL,
        OwnerEmail VARCHAR(150) NOT NULL UNIQUE,
        OwnerPasswordHash VARCHAR(256) NOT NULL,
        LogoUrl NVARCHAR(500) NULL,
        Plan VARCHAR(20) NOT NULL DEFAULT 'free',
        MaxStores INT NOT NULL DEFAULT 1,
        PointsPerAmount INT NOT NULL DEFAULT 10000,
        PointsToMoney DECIMAL(12,0) NOT NULL DEFAULT 200,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 0.3 Stores
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Stores') AND type in (N'U'))
BEGIN
    CREATE TABLE Stores (
        StoreId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(150) NOT NULL,
        Address NVARCHAR(300) NULL,
        Phone VARCHAR(15) NULL,
        BankAccount VARCHAR(30) NULL,
        BankName VARCHAR(50) NULL,
        BankAccountName NVARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Stores_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE
    );
END
GO

-- 0.4 Permissions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Permissions') AND type in (N'U'))
BEGIN
    CREATE TABLE Permissions (
        PermissionId INT IDENTITY(1,1) PRIMARY KEY,
        Code VARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Module VARCHAR(30) NOT NULL
    );
END
GO

-- 0.5 Roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Roles') AND type in (N'U'))
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200) NULL,
        CONSTRAINT FK_Roles_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE,
        CONSTRAINT UQ_Roles_Tenant_Name UNIQUE (TenantId, Name)
    );
END
GO

-- 0.6 RolePermissions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RolePermissions') AND type in (N'U'))
BEGIN
    CREATE TABLE RolePermissions (
        RolePermissionId INT IDENTITY(1,1) PRIMARY KEY,
        RoleId INT NOT NULL,
        PermissionId INT NOT NULL,
        CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE,
        CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId) ON DELETE CASCADE,
        CONSTRAINT UQ_RolePermissions UNIQUE (RoleId, PermissionId)
    );
END
GO

-- 1.1 Categories
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Categories') AND type in (N'U'))
BEGIN
    CREATE TABLE Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Icon VARCHAR(50) NULL,
        SortOrder INT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Categories_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE,
        CONSTRAINT UQ_Categories_Tenant_Name UNIQUE (TenantId, Name)
    );
END
GO

-- 1.2 MenuItems
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MenuItems') AND type in (N'U'))
BEGIN
    CREATE TABLE MenuItems (
        MenuItemId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        CategoryId INT NOT NULL,
        Name NVARCHAR(150) NOT NULL,
        Description NVARCHAR(500) NULL,
        BasePrice DECIMAL(12,0) NOT NULL,
        ImageUrl NVARCHAR(500) NULL,
        Rating DECIMAL(2,1) NOT NULL DEFAULT 0,
        IsFeatured BIT NOT NULL DEFAULT 0,
        IsAvailable BIT NOT NULL DEFAULT 1,
        SortOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_MenuItems_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId),
        CONSTRAINT FK_MenuItems_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
    );
END
GO

-- 1.3 Sizes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Sizes') AND type in (N'U'))
BEGIN
    CREATE TABLE Sizes (
        SizeId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(20) NOT NULL,
        SortOrder INT NOT NULL DEFAULT 0,
        CONSTRAINT FK_Sizes_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE,
        CONSTRAINT UQ_Sizes_Tenant_Name UNIQUE (TenantId, Name)
    );
END
GO

-- 1.4 MenuItemSizes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MenuItemSizes') AND type in (N'U'))
BEGIN
    CREATE TABLE MenuItemSizes (
        MenuItemSizeId INT IDENTITY(1,1) PRIMARY KEY,
        MenuItemId INT NOT NULL,
        SizeId INT NOT NULL,
        ExtraPrice DECIMAL(12,0) NOT NULL DEFAULT 0,
        CONSTRAINT FK_MenuItemSizes_MenuItems FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId) ON DELETE CASCADE,
        CONSTRAINT FK_MenuItemSizes_Sizes FOREIGN KEY (SizeId) REFERENCES Sizes(SizeId),
        CONSTRAINT UQ_MenuItemSizes UNIQUE (MenuItemId, SizeId)
    );
END
GO

-- 1.5 Toppings
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Toppings') AND type in (N'U'))
BEGIN
    CREATE TABLE Toppings (
        ToppingId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Price DECIMAL(12,0) NOT NULL,
        IsAvailable BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_Toppings_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE
    );
END
GO

-- 1.6 MenuItemToppings
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MenuItemToppings') AND type in (N'U'))
BEGIN
    CREATE TABLE MenuItemToppings (
        MenuItemToppingId INT IDENTITY(1,1) PRIMARY KEY,
        MenuItemId INT NOT NULL,
        ToppingId INT NOT NULL,
        CONSTRAINT FK_MenuItemToppings_MenuItems FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId) ON DELETE CASCADE,
        CONSTRAINT FK_MenuItemToppings_Toppings FOREIGN KEY (ToppingId) REFERENCES Toppings(ToppingId),
        CONSTRAINT UQ_MenuItemToppings UNIQUE (MenuItemId, ToppingId)
    );
END
GO

-- 2.1 Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Tables') AND type in (N'U'))
BEGIN
    CREATE TABLE Tables (
        TableId INT IDENTITY(1,1) PRIMARY KEY,
        StoreId INT NOT NULL,
        TableNumber NVARCHAR(10) NOT NULL,
        Capacity INT NOT NULL DEFAULT 4,
        Location NVARCHAR(50) NULL,
        QRCodeUrl NVARCHAR(500) NULL,
        Status VARCHAR(20) NOT NULL DEFAULT 'Available',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Tables_Stores FOREIGN KEY (StoreId) REFERENCES Stores(StoreId) ON DELETE CASCADE,
        CONSTRAINT UQ_Tables_Store_TableNumber UNIQUE (StoreId, TableNumber)
    );
END
GO

-- 3.1 Staff
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Staff') AND type in (N'U'))
BEGIN
    CREATE TABLE Staff (
        StaffId INT IDENTITY(1,1) PRIMARY KEY,
        StoreId INT NOT NULL,
        RoleId INT NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        Email VARCHAR(150) NULL,
        Phone VARCHAR(15) NULL,
        PasswordHash VARCHAR(256) NOT NULL,
        AvatarUrl NVARCHAR(500) NULL,
        ShiftStart TIME NULL,
        ShiftEnd TIME NULL,
        IsOnDuty BIT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Staff_Stores FOREIGN KEY (StoreId) REFERENCES Stores(StoreId) ON DELETE CASCADE,
        CONSTRAINT FK_Staff_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
        CONSTRAINT UQ_Staff_Email UNIQUE (Email)
    );
END
GO

-- 4.1 Customers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Customers') AND type in (N'U'))
BEGIN
    CREATE TABLE Customers (
        CustomerId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Phone VARCHAR(15) NOT NULL,
        Name NVARCHAR(100) NULL,
        TotalPoints INT NOT NULL DEFAULT 0,
        TotalSpent DECIMAL(15,0) NOT NULL DEFAULT 0,
        VisitCount INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        LastVisitAt DATETIME2 NULL,
        CONSTRAINT FK_Customers_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId) ON DELETE CASCADE,
        CONSTRAINT UQ_Customers_Tenant_Phone UNIQUE (TenantId, Phone)
    );
END
GO

-- 4.2 Vouchers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Vouchers') AND type in (N'U'))
BEGIN
    CREATE TABLE Vouchers (
        VoucherId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        StoreId INT NULL,
        Code VARCHAR(30) NOT NULL,
        Title NVARCHAR(150) NOT NULL,
        Description NVARCHAR(300) NULL,
        DiscountType VARCHAR(10) NOT NULL,
        DiscountValue DECIMAL(12,0) NOT NULL,
        MaxDiscount DECIMAL(12,0) NULL,
        MinOrderAmount DECIMAL(12,0) NOT NULL DEFAULT 0,
        Scope VARCHAR(20) NOT NULL DEFAULT 'public',
        AssignedCustomerId INT NULL,
        MaxUsageTotal INT NULL,
        MaxUsagePerCustomer INT NOT NULL DEFAULT 1,
        UsedCount INT NOT NULL DEFAULT 0,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Vouchers_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId),
        CONSTRAINT FK_Vouchers_Stores FOREIGN KEY (StoreId) REFERENCES Stores(StoreId),
        CONSTRAINT FK_Vouchers_Customers FOREIGN KEY (AssignedCustomerId) REFERENCES Customers(CustomerId),
        CONSTRAINT UQ_Vouchers_Tenant_Code UNIQUE (TenantId, Code)
    );
END
GO

-- 5.1 Orders
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Orders') AND type in (N'U'))
BEGIN
    CREATE TABLE Orders (
        OrderId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        StoreId INT NOT NULL,
        OrderCode VARCHAR(20) NOT NULL,
        TableId INT NULL,
        CustomerId INT NULL,
        StaffId INT NULL,
        Status VARCHAR(20) NOT NULL DEFAULT 'pending',
        SubTotal DECIMAL(15,0) NOT NULL,
        DiscountAmount DECIMAL(15,0) NOT NULL DEFAULT 0,
        PointsUsed INT NOT NULL DEFAULT 0,
        PointsEarned INT NOT NULL DEFAULT 0,
        ServiceFee DECIMAL(12,0) NOT NULL DEFAULT 0,
        TotalAmount DECIMAL(15,0) NOT NULL,
        Note NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Orders_Tenants FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId),
        CONSTRAINT FK_Orders_Stores FOREIGN KEY (StoreId) REFERENCES Stores(StoreId),
        CONSTRAINT FK_Orders_Tables FOREIGN KEY (TableId) REFERENCES Tables(TableId),
        CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
        CONSTRAINT FK_Orders_Staff FOREIGN KEY (StaffId) REFERENCES Staff(StaffId),
        CONSTRAINT UQ_Orders_Tenant_OrderCode UNIQUE (TenantId, OrderCode)
    );
END
GO

-- 4.3 LoyaltyPoints
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'LoyaltyPoints') AND type in (N'U'))
BEGIN
    CREATE TABLE LoyaltyPoints (
        PointId INT IDENTITY(1,1) PRIMARY KEY,
        CustomerId INT NOT NULL,
        OrderId INT NULL,
        Points INT NOT NULL,
        Type VARCHAR(20) NOT NULL,
        Description NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_LoyaltyPoints_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE,
        CONSTRAINT FK_LoyaltyPoints_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId)
    );
END
GO

-- 4.4 VoucherUsages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'VoucherUsages') AND type in (N'U'))
BEGIN
    CREATE TABLE VoucherUsages (
        UsageId INT IDENTITY(1,1) PRIMARY KEY,
        VoucherId INT NOT NULL,
        CustomerId INT NULL,
        OrderId INT NOT NULL,
        DiscountAmount DECIMAL(12,0) NOT NULL,
        UsedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_VoucherUsages_Vouchers FOREIGN KEY (VoucherId) REFERENCES Vouchers(VoucherId),
        CONSTRAINT FK_VoucherUsages_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
        CONSTRAINT FK_VoucherUsages_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE
    );
END
GO

-- 5.2 OrderItems
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'OrderItems') AND type in (N'U'))
BEGIN
    CREATE TABLE OrderItems (
        OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        MenuItemId INT NOT NULL,
        SizeId INT NULL,
        Quantity INT NOT NULL CHECK (Quantity > 0),
        UnitPrice DECIMAL(12,0) NOT NULL,
        ToppingTotal DECIMAL(12,0) NOT NULL DEFAULT 0,
        SubTotal DECIMAL(12,0) NOT NULL,
        SugarLevel VARCHAR(10) NOT NULL DEFAULT '100%',
        IceLevel VARCHAR(10) NOT NULL DEFAULT '100%',
        Note NVARCHAR(200) NULL,
        CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_MenuItems FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId),
        CONSTRAINT FK_OrderItems_Sizes FOREIGN KEY (SizeId) REFERENCES Sizes(SizeId)
    );
END
GO

-- 5.3 OrderItemToppings
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'OrderItemToppings') AND type in (N'U'))
BEGIN
    CREATE TABLE OrderItemToppings (
        OrderItemToppingId INT IDENTITY(1,1) PRIMARY KEY,
        OrderItemId INT NOT NULL,
        ToppingId INT NOT NULL,
        Price DECIMAL(12,0) NOT NULL,
        CONSTRAINT FK_OrderItemToppings_OrderItems FOREIGN KEY (OrderItemId) REFERENCES OrderItems(OrderItemId) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItemToppings_Toppings FOREIGN KEY (ToppingId) REFERENCES Toppings(ToppingId)
    );
END
GO

-- 5.4 Payments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Payments') AND type in (N'U'))
BEGIN
    CREATE TABLE Payments (
        PaymentId INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        Method VARCHAR(20) NOT NULL,
        Amount DECIMAL(15,0) NOT NULL,
        TransactionRef VARCHAR(100) NULL,
        Status VARCHAR(20) NOT NULL DEFAULT 'pending',
        PaidAt DATETIME2 NULL,
        ProcessedByStaffId INT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        CONSTRAINT FK_Payments_Staff FOREIGN KEY (ProcessedByStaffId) REFERENCES Staff(StaffId)
    );
END
GO

-- Tạo Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Stores_TenantId')
    CREATE NONCLUSTERED INDEX IX_Stores_TenantId ON Stores (TenantId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_TenantId')
    CREATE NONCLUSTERED INDEX IX_Categories_TenantId ON Categories (TenantId, IsActive);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MenuItems_TenantId')
    CREATE NONCLUSTERED INDEX IX_MenuItems_TenantId ON MenuItems (TenantId, CategoryId, IsAvailable);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Roles_TenantId')
    CREATE NONCLUSTERED INDEX IX_Roles_TenantId ON Roles (TenantId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Vouchers_TenantId')
    CREATE NONCLUSTERED INDEX IX_Vouchers_TenantId ON Vouchers (TenantId, Code, IsActive);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Customers_TenantId_Phone')
    CREATE NONCLUSTERED INDEX IX_Customers_TenantId_Phone ON Customers (TenantId, Phone);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tables_StoreId')
    CREATE NONCLUSTERED INDEX IX_Tables_StoreId ON Tables (StoreId, Status, IsActive);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Staff_StoreId')
    CREATE NONCLUSTERED INDEX IX_Staff_StoreId ON Staff (StoreId, IsActive);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Orders_StoreId_Status')
    CREATE NONCLUSTERED INDEX IX_Orders_StoreId_Status ON Orders (StoreId, Status, CreatedAt DESC);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Orders_TenantId_CreatedAt')
    CREATE NONCLUSTERED INDEX IX_Orders_TenantId_CreatedAt ON Orders (TenantId, CreatedAt DESC);

PRINT N'✅ ĐÃ HOÀN TẤT TẠO 22 BẢNG & INDEXES!';
GO

-- ============================================================================
-- PHẦN 2: SEED DATA MẪU
-- ============================================================================
PRINT N'▶ BẮT ĐẦU NẠP DỮ LIỆU SEED MẪU...';

-- Permissions
IF NOT EXISTS (SELECT 1 FROM Permissions)
BEGIN
    INSERT INTO Permissions (Code, Name, Module) VALUES
    ('menu.view', N'Xem thực đơn món', 'menu'),
    ('menu.create', N'Thêm món ăn / danh mục mới', 'menu'),
    ('menu.edit', N'Chỉnh sửa món ăn & giá', 'menu'),
    ('menu.delete', N'Xóa / Ẩn món ăn', 'menu'),
    ('table.view', N'Xem sơ đồ bàn', 'table'),
    ('table.manage', N'Thêm / Sửa / Xóa bàn & QR code', 'table'),
    ('order.view', N'Xem danh sách đơn đặt món', 'order'),
    ('order.manage', N'Tiếp nhận & cập nhật trạng thái đơn', 'order'),
    ('order.edit', N'Sửa món / thêm ghi chú đơn', 'order'),
    ('payment.process', N'Xác nhận thanh toán', 'payment'),
    ('staff.view', N'Xem danh sách nhân viên', 'staff'),
    ('staff.manage', N'Thêm / Sửa / Phân ca nhân viên', 'staff'),
    ('voucher.view', N'Xem danh sách mã khuyến mãi', 'voucher'),
    ('voucher.manage', N'Tạo và quản lý voucher', 'voucher'),
    ('analytics.view', N'Xem biểu đồ & báo cáo doanh thu', 'analytics'),
    ('analytics.export', N'Xuất báo cáo', 'analytics'),
    ('store.manage', N'Quản lý chi nhánh & ngân hàng', 'store');
END
GO

-- Super Admin
IF NOT EXISTS (SELECT 1 FROM SystemAdmins)
BEGIN
    INSERT INTO SystemAdmins (Username, Email, PasswordHash, FullName, IsActive) VALUES
    ('superadmin', 'admin@webcafe.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', N'Super Admin Nền Tảng', 1);
END
GO

-- Tenants
IF NOT EXISTS (SELECT 1 FROM Tenants)
BEGIN
    INSERT INTO Tenants (Name, Slug, OwnerName, OwnerPhone, OwnerEmail, OwnerPasswordHash, LogoUrl, Plan, MaxStores, PointsPerAmount, PointsToMoney, IsActive) VALUES
    (N'Minh Cafe', 'minh-cafe', N'Nguyễn Văn Minh', '0987654321', 'minh@minhcafe.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200', 'basic', 5, 10000, 200, 1),
    (N'Lan Coffee', 'lan-coffee', N'Lê Thu Lan', '0912345678', 'lan@lancoffee.vn', 'A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', 'free', 1, 10000, 200, 1);
END
GO

-- Stores
IF NOT EXISTS (SELECT 1 FROM Stores)
BEGIN
    INSERT INTO Stores (TenantId, Name, Address, Phone, BankAccount, BankName, BankAccountName, IsActive) VALUES
    (1, N'Minh Cafe - Chi nhánh Quận 1', N'123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', '0281234567', '999988887777', N'MB Bank', N'NGUYEN VAN MINH', 1),
    (1, N'Minh Cafe - Chi nhánh Quận 7', N'456 Nguyễn Thị Thập, Phường Tân Quy, Quận 7, TP.HCM', '0287654321', '888877776666', N'Techcombank', N'NGUYEN VAN MINH', 1),
    (2, N'Lan Coffee - Chi nhánh Quận 3', N'78 Võ Văn Tần, Phường 6, Quận 3, TP.HCM', '02833334444', '111122223333', N'Vietcombank', N'LE THU LAN', 1);
END
GO

-- Roles & RolePermissions (Tenant 1)
IF NOT EXISTS (SELECT 1 FROM Roles WHERE TenantId = 1)
BEGIN
    INSERT INTO Roles (TenantId, Name, Description) VALUES
    (1, N'Manager', N'Quản lý cửa hàng'),
    (1, N'Barista', N'Pha chế đồ uống'),
    (1, N'Server', N'Nhân viên phục vụ');

    -- Manager (RoleId = 1)
    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 1, PermissionId FROM Permissions
    WHERE Code IN ('menu.view','menu.create','menu.edit','menu.delete','table.view','table.manage','order.view','order.manage','order.edit','payment.process','staff.view','staff.manage','voucher.view','voucher.manage','analytics.view','analytics.export');

    -- Barista (RoleId = 2)
    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 2, PermissionId FROM Permissions WHERE Code IN ('menu.view','order.view','order.manage');

    -- Server (RoleId = 3)
    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 3, PermissionId FROM Permissions WHERE Code IN ('menu.view','table.view','order.view','order.manage','order.edit','payment.process');
END
GO

-- Categories, Sizes, Toppings
IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = 1)
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive) VALUES
    (1, N'Cà Phê Pha Máy', 'coffee', 1, 1),
    (1, N'Trà & Trái Cây', 'energy_savings_leaf', 2, 1),
    (1, N'Sinh Tố & Trà Sữa', 'bubble_chart', 3, 1),
    (1, N'Bánh Ngọt & Tráng Miệng', 'bakery_dining', 4, 1);

    INSERT INTO Sizes (TenantId, Name, SortOrder) VALUES
    (1, N'Nhỏ (S)', 1), (1, N'Vừa (M)', 2), (1, N'Lớn (L)', 3);

    INSERT INTO Toppings (TenantId, Name, Price, IsAvailable) VALUES
    (1, N'Trân châu đen', 10000, 1),
    (1, N'Trân châu trắng 3Q', 10000, 1),
    (1, N'Thạch cà phê giòn', 10000, 1),
    (1, N'Kem Cheese mặn', 15000, 1),
    (1, N'Shot Espresso đậm đà', 12000, 1),
    (1, N'Sữa tươi kem béo', 8000, 1),
    (1, N'Whipped Cream', 10000, 1);

    -- Menu Items
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder) VALUES
    (1, 1, N'Espresso Đậm Vị', N'Cà phê nguyên chất chiết xuất áp suất cao.', 35000, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', 4.8, 1, 1, 1),
    (1, 1, N'Cappuccino Ý', N'Espresso kết hợp sữa nóng và lớp bọt sữa bồng bềnh.', 45000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80', 4.9, 1, 1, 2),
    (1, 1, N'Bạc Xỉu Sài Gòn', N'Sữa đặc ngọt ngào hòa quyện cùng cà phê thơm nồng.', 39000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', 4.9, 1, 1, 3),
    (1, 2, N'Matcha Latte Nhật Bản', N'Bột trà xanh Uji cao cấp hòa quyện cùng sữa tươi.', 50000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80', 4.8, 1, 1, 4),
    (1, 2, N'Trà Đào Cam Sả', N'Trà ô long thanh mát kết hợp đào giòn ngọt.', 45000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', 4.9, 1, 1, 5),
    (1, 3, N'Trà Sữa Trân Châu Đường Đen', N'Trà sữa béo ngậy kèm trân châu đường đen dẻo dai.', 45000, 'https://images.unsplash.com/photo-1626082895617-2c6ad361a86a?w=500&q=80', 4.9, 1, 1, 6),
    (1, 4, N'New York Cheesecake', N'Bánh phô mai nướng chua nhẹ béo ngậy chuẩn vị NY.', 60000, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&q=80', 4.9, 1, 1, 7);

    -- Size mapping
    INSERT INTO MenuItemSizes (MenuItemId, SizeId, ExtraPrice) VALUES
    (1, 1, 0), (1, 2, 6000), (1, 3, 12000),
    (2, 1, 0), (2, 2, 6000), (2, 3, 12000),
    (3, 1, 0), (3, 2, 6000), (3, 3, 12000),
    (4, 1, 0), (4, 2, 6000), (4, 3, 12000),
    (5, 1, 0), (5, 2, 6000), (5, 3, 12000),
    (6, 1, 0), (6, 2, 6000), (6, 3, 12000);

    -- Topping mapping
    INSERT INTO MenuItemToppings (MenuItemId, ToppingId) VALUES
    (1, 5), (2, 5), (3, 3), (4, 1), (4, 2), (5, 1), (5, 2), (6, 1), (6, 2), (6, 3), (6, 4);
END
GO

-- Tables & Staff & Vouchers
IF NOT EXISTS (SELECT 1 FROM Tables)
BEGIN
    -- Tables
    INSERT INTO Tables (StoreId, TableNumber, Capacity, Location, QRCodeUrl, Status, IsActive) VALUES
    (1, '01', 4, N'Tầng 1 - Trong nhà', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/01', 'Occupied', 1),
    (1, '02', 2, N'Tầng 1 - Trong nhà', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/02', 'Available', 1),
    (1, '03', 4, N'Tầng 1 - Cửa sổ', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/03', 'Available', 1),
    (1, '04', 6, N'Tầng 1 - Sofa lớn', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/04', 'Occupied', 1),
    (1, '05', 2, N'Tầng 1 - Quầy bar', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/table/05', 'Available', 1),
    (2, '01', 4, N'Sân vườn', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://minhcafe.webcafe.vn/q7/table/01', 'Available', 1);

    -- Staff
    INSERT INTO Staff (StoreId, RoleId, FullName, Email, Phone, PasswordHash, AvatarUrl, ShiftStart, ShiftEnd, IsOnDuty, IsActive) VALUES
    (1, 1, N'Trần Văn Long (Quản lý Q1)', 'manager.q1@minhcafe.vn', '0901112223', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '07:00:00', '16:00:00', 1, 1),
    (1, 2, N'Hoàng Thị Mai (Barista)', 'barista1.q1@minhcafe.vn', '0902223334', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '07:00:00', '15:00:00', 1, 1),
    (1, 3, N'Lê Quốc Bảo (Server)', 'server1.q1@minhcafe.vn', '0903334445', 'E10ADC3949BA59ABBE56E057F20F883E', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '07:00:00', '15:00:00', 1, 1);

    -- Customers
    INSERT INTO Customers (TenantId, Phone, Name, TotalPoints, TotalSpent, VisitCount, LastVisitAt) VALUES
    (1, '0981112233', N'Đỗ Thanh Tú', 150, 1500000, 8, GETDATE()),
    (1, '0972223344', N'Vũ Ngọc Ánh', 45, 450000, 3, DATEADD(DAY, -2, GETDATE()));

    -- Vouchers
    INSERT INTO Vouchers (TenantId, StoreId, Code, Title, Description, DiscountType, DiscountValue, MaxDiscount, MinOrderAmount, Scope, StartDate, EndDate, IsActive) VALUES
    (1, NULL, 'WELCOME20', N'Giảm 20% đơn đầu tiên', N'Áp dụng cho mọi khách hàng mới', 'percent', 20, 50000, 50000, 'public', '2026-01-01', '2026-12-31', 1),
    (1, NULL, 'MINHCAFE15K', N'Giảm 15.000đ', N'Đơn từ 100.000đ', 'fixed', 15000, NULL, 100000, 'public', '2026-01-01', '2026-12-31', 1);

    -- Sample Orders
    INSERT INTO Orders (TenantId, StoreId, OrderCode, TableId, CustomerId, StaffId, Status, SubTotal, DiscountAmount, PointsUsed, PointsEarned, ServiceFee, TotalAmount, Note, CreatedAt)
    VALUES 
    (1, 1, 'WB-8891', 1, 1, 2, 'preparing', 105000, 21000, 0, 8, 0, 84000, N'Ít ngọt', DATEADD(MINUTE, -15, GETDATE())),
    (1, 1, 'WB-8892', 4, 3, 3, 'paid', 185000, 15000, 0, 17, 0, 170000, N'Giao cùng lúc', DATEADD(HOUR, -2, GETDATE()));

    -- Order Items
    INSERT INTO OrderItems (OrderId, MenuItemId, SizeId, Quantity, UnitPrice, ToppingTotal, SubTotal, SugarLevel, IceLevel, Note) VALUES
    (1, 2, 2, 1, 51000, 0, 51000, '50%', '100%', N'Ít ngọt'),
    (1, 6, 2, 1, 51000, 10000, 61000, '70%', '50%', N'Ít đá'),
    (2, 5, 2, 2, 51000, 10000, 112000, '100%', '100%', NULL),
    (2, 7, NULL, 1, 60000, 0, 60000, '100%', '100%', NULL);

    INSERT INTO OrderItemToppings (OrderItemId, ToppingId, Price) VALUES
    (2, 1, 10000), (3, 2, 10000);

    INSERT INTO Payments (OrderId, Method, Amount, TransactionRef, Status, PaidAt, ProcessedByStaffId) VALUES
    (2, 'vietqr', 170000, 'VQR2026090812345678', 'completed', DATEADD(HOUR, -2, GETDATE()), 3);
END
GO

PRINT N'✅ ĐÃ NẠP SEED DATA MẪU THÀNH CÔNG!';
GO

-- ============================================================================
-- PHẦN 3: STORED PROCEDURES
-- ============================================================================
PRINT N'▶ BẮT ĐẦU TẠO CÁC STORED PROCEDURES...';
GO

CREATE OR ALTER PROCEDURE sp_GetMenuByStore
    @StoreId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TenantId INT;
    SELECT @TenantId = TenantId FROM Stores WHERE StoreId = @StoreId AND IsActive = 1;

    IF @TenantId IS NULL
    BEGIN
        RAISERROR(N'Chi nhánh không tồn tại hoặc đã ngừng hoạt động!', 16, 1);
        RETURN;
    END

    SELECT s.StoreId, s.TenantId, s.Name AS StoreName, s.Address, s.Phone, s.BankAccount, s.BankName, s.BankAccountName, t.Name AS BrandName, t.LogoUrl
    FROM Stores s INNER JOIN Tenants t ON s.TenantId = t.TenantId WHERE s.StoreId = @StoreId;

    SELECT CategoryId, Name, Icon, SortOrder FROM Categories WHERE TenantId = @TenantId AND IsActive = 1 ORDER BY SortOrder ASC;

    SELECT m.MenuItemId, m.CategoryId, m.Name, m.Description, m.BasePrice, m.ImageUrl, m.Rating, m.IsFeatured, m.IsAvailable, m.SortOrder
    FROM MenuItems m WHERE m.TenantId = @TenantId AND m.IsAvailable = 1 ORDER BY m.SortOrder ASC, m.Name ASC;

    SELECT ms.MenuItemId, s.SizeId, s.Name AS SizeName, ms.ExtraPrice FROM MenuItemSizes ms INNER JOIN Sizes s ON ms.SizeId = s.SizeId WHERE s.TenantId = @TenantId ORDER BY s.SortOrder ASC;

    SELECT mt.MenuItemId, t.ToppingId, t.Name AS ToppingName, t.Price FROM MenuItemToppings mt INNER JOIN Toppings t ON mt.ToppingId = t.ToppingId WHERE t.TenantId = @TenantId AND t.IsAvailable = 1 ORDER BY t.Name ASC;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateOrderStatus
    @OrderId INT,
    @NewStatus VARCHAR(20),
    @StaffId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @OldStatus VARCHAR(20), @CustomerId INT, @TableId INT, @TotalAmount DECIMAL(15,0), @PointsEarned INT;

        SELECT @OldStatus = Status, @CustomerId = CustomerId, @TableId = TableId, @TotalAmount = TotalAmount, @PointsEarned = PointsEarned
        FROM Orders WHERE OrderId = @OrderId;

        IF @OldStatus IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy đơn hàng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE Orders SET Status = @NewStatus, StaffId = COALESCE(@StaffId, StaffId), UpdatedAt = GETDATE() WHERE OrderId = @OrderId;

        IF @NewStatus = 'paid' AND @OldStatus <> 'paid'
        BEGIN
            IF @TableId IS NOT NULL UPDATE Tables SET Status = 'Available' WHERE TableId = @TableId;
            IF @CustomerId IS NOT NULL AND @PointsEarned > 0
            BEGIN
                UPDATE Customers SET TotalPoints = TotalPoints + @PointsEarned, TotalSpent = TotalSpent + @TotalAmount, VisitCount = VisitCount + 1, LastVisitAt = GETDATE() WHERE CustomerId = @CustomerId;
                INSERT INTO LoyaltyPoints (CustomerId, OrderId, Points, Type, Description) VALUES (@CustomerId, @OrderId, @PointsEarned, 'earn', N'Tích điểm từ đơn hàng ' + CAST(@OrderId AS NVARCHAR));
            END
        END

        IF @NewStatus = 'cancelled' AND @TableId IS NOT NULL
        BEGIN
            UPDATE Tables SET Status = 'Available' WHERE TableId = @TableId;
        END

        COMMIT TRANSACTION;
        SELECT 1 AS Success, N'Cập nhật trạng thái thành công' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_GetDailyRevenue
    @TenantId INT,
    @StoreId INT = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @FromDate IS NULL SET @FromDate = CAST(DATEADD(DAY, -7, GETDATE()) AS DATE);
    IF @ToDate IS NULL SET @ToDate = CAST(GETDATE() AS DATE);

    SELECT 
        COUNT(OrderId) AS TotalOrders,
        SUM(CASE WHEN Status = 'paid' THEN TotalAmount ELSE 0 END) AS TotalRevenue,
        SUM(DiscountAmount) AS TotalDiscountGiven,
        SUM(PointsUsed) AS TotalPointsRedeemed
    FROM Orders
    WHERE TenantId = @TenantId AND (@StoreId IS NULL OR StoreId = @StoreId) AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate;

    SELECT 
        CAST(CreatedAt AS DATE) AS OrderDate,
        COUNT(OrderId) AS OrderCount,
        SUM(CASE WHEN Status = 'paid' THEN TotalAmount ELSE 0 END) AS Revenue
    FROM Orders
    WHERE TenantId = @TenantId AND (@StoreId IS NULL OR StoreId = @StoreId) AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY CAST(CreatedAt AS DATE)
    ORDER BY OrderDate DESC;

    SELECT TOP 5
        m.Name AS ItemName,
        c.Name AS CategoryName,
        SUM(oi.Quantity) AS TotalSold,
        SUM(oi.SubTotal) AS TotalAmount
    FROM OrderItems oi
    INNER JOIN Orders o ON oi.OrderId = o.OrderId
    INNER JOIN MenuItems m ON oi.MenuItemId = m.MenuItemId
    INNER JOIN Categories c ON m.CategoryId = c.CategoryId
    WHERE o.TenantId = @TenantId AND (@StoreId IS NULL OR o.StoreId = @StoreId) AND o.Status = 'paid' AND CAST(o.CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY m.Name, c.Name
    ORDER BY TotalSold DESC;
END
GO

PRINT N'Done';
GO
