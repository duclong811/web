-- ============================================================================
-- WebCafe SaaS QR Ordering Platform — Database Schema
-- DBMS: Microsoft SQL Server (2019 / 2022 / Azure SQL)
-- Multi-tenancy: Shared Database, Shared Schema (TenantId / StoreId isolation)
-- ============================================================================

-- 1. Tạo Database nếu chưa có
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'WebCafeDB')
BEGIN
    CREATE DATABASE WebCafeDB COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE WebCafeDB;
GO

-- Xóa bảng theo thứ tự ràng buộc FK nếu muốn reset (bỏ comment nếu cần reset sạch)
/*
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS OrderItemToppings;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS VoucherUsages;
DROP TABLE IF EXISTS LoyaltyPoints;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Vouchers;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Tables;
DROP TABLE IF EXISTS MenuItemToppings;
DROP TABLE IF EXISTS Toppings;
DROP TABLE IF EXISTS MenuItemSizes;
DROP TABLE IF EXISTS Sizes;
DROP TABLE IF EXISTS MenuItems;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS RolePermissions;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Permissions;
DROP TABLE IF EXISTS Stores;
DROP TABLE IF EXISTS Tenants;
DROP TABLE IF EXISTS SystemAdmins;
*/

-- ============================================================================
-- MODULE 0: NỀN TẢNG SAAS & PHÂN QUYỀN
-- ============================================================================

-- 0.1 Bảng SystemAdmins: Super Admin nền tảng WebCafe (Tách biệt khỏi quán)
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

-- 0.2 Bảng Tenants: Thương hiệu / Chủ sở hữu (SaaS Tenant)
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
        Plan VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'basic', 'premium'
        MaxStores INT NOT NULL DEFAULT 1,
        PointsPerAmount INT NOT NULL DEFAULT 10000, -- 10.000đ = 1 điểm
        PointsToMoney DECIMAL(12,0) NOT NULL DEFAULT 200, -- 1 điểm = 200đ
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 0.3 Bảng Stores: Chi nhánh của từng Tenant
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

-- 0.4 Bảng Permissions: Danh mục quyền hệ thống
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Permissions') AND type in (N'U'))
BEGIN
    CREATE TABLE Permissions (
        PermissionId INT IDENTITY(1,1) PRIMARY KEY,
        Code VARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Module VARCHAR(30) NOT NULL -- 'menu', 'order', 'table', 'staff', 'voucher', 'analytics', 'store'
    );
END
GO

-- 0.5 Bảng Roles: Vai trò của nhân viên trong từng Tenant
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

-- 0.6 Bảng RolePermissions: Phân quyền cho từng Role
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

-- ============================================================================
-- MODULE 1: MENU & SẢN PHẨM (THUỘC TENANT)
-- ============================================================================

-- 1.1 Bảng Categories: Danh mục món
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

-- 1.2 Bảng MenuItems: Món ăn / Đồ uống
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

-- 1.3 Bảng Sizes: Các kích cỡ (S, M, L, ...)
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

-- 1.4 Bảng MenuItemSizes: Giá cộng thêm theo Size của từng món
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

-- 1.5 Bảng Toppings: Danh sách topping
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

-- 1.6 Bảng MenuItemToppings: Topping nào dùng cho món nào
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

-- ============================================================================
-- MODULE 2: QUẢN LÝ BÀN & QR (THUỘC STORE)
-- ============================================================================

-- 2.1 Bảng Tables: Danh sách bàn
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Tables') AND type in (N'U'))
BEGIN
    CREATE TABLE Tables (
        TableId INT IDENTITY(1,1) PRIMARY KEY,
        StoreId INT NOT NULL,
        TableNumber NVARCHAR(10) NOT NULL,
        Capacity INT NOT NULL DEFAULT 4,
        Location NVARCHAR(50) NULL,
        QRCodeUrl NVARCHAR(500) NULL,
        Status VARCHAR(20) NOT NULL DEFAULT 'Available', -- 'Available', 'Occupied', 'Reserved'
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Tables_Stores FOREIGN KEY (StoreId) REFERENCES Stores(StoreId) ON DELETE CASCADE,
        CONSTRAINT UQ_Tables_Store_TableNumber UNIQUE (StoreId, TableNumber)
    );
END
GO

-- ============================================================================
-- MODULE 3: NHÂN VIÊN & CA LÀM VIỆC (THUỘC STORE)
-- ============================================================================

-- 3.1 Bảng Staff: Tài khoản nhân viên chi nhánh
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

-- ============================================================================
-- MODULE 4: KHÁCH HÀNG & LOYALTY (THUỘC TENANT — DÙNG XUYÊN CHI NHÁNH)
-- ============================================================================

-- 4.1 Bảng Customers: Khách hàng tích điểm
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

-- 4.2 Bảng Vouchers: Mã khuyến mãi (Tenant-wide hoặc Store-specific)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Vouchers') AND type in (N'U'))
BEGIN
    CREATE TABLE Vouchers (
        VoucherId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        StoreId INT NULL, -- NULL = toàn chuỗi, Có giá trị = chỉ chi nhánh đó
        Code VARCHAR(30) NOT NULL,
        Title NVARCHAR(150) NOT NULL,
        Description NVARCHAR(300) NULL,
        DiscountType VARCHAR(10) NOT NULL, -- 'percent', 'fixed'
        DiscountValue DECIMAL(12,0) NOT NULL,
        MaxDiscount DECIMAL(12,0) NULL, -- Giảm tối đa (khi type = 'percent')
        MinOrderAmount DECIMAL(12,0) NOT NULL DEFAULT 0,
        Scope VARCHAR(20) NOT NULL DEFAULT 'public', -- 'public', 'personal'
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

-- ============================================================================
-- MODULE 5: ĐƠN HÀNG & THANH TOÁN
-- ============================================================================

-- 5.1 Bảng Orders: Đơn đặt món
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
        -- Status flow: pending -> confirmed -> preparing -> ready -> served -> paid | cancelled
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

-- 4.3 Bảng LoyaltyPoints: Lịch sử tích/trừ điểm (Tạo sau Orders để FK hợp lệ)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'LoyaltyPoints') AND type in (N'U'))
BEGIN
    CREATE TABLE LoyaltyPoints (
        PointId INT IDENTITY(1,1) PRIMARY KEY,
        CustomerId INT NOT NULL,
        OrderId INT NULL,
        Points INT NOT NULL, -- Số nguyên: +50 hoặc -100
        Type VARCHAR(20) NOT NULL, -- 'earn', 'redeem', 'bonus', 'expire'
        Description NVARCHAR(200) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_LoyaltyPoints_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE,
        CONSTRAINT FK_LoyaltyPoints_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId)
    );
END
GO

-- 4.4 Bảng VoucherUsages: Lịch sử áp dụng Voucher
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

-- 5.2 Bảng OrderItems: Chi tiết món trong từng đơn
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
        SubTotal DECIMAL(12,0) NOT NULL, -- (UnitPrice + ToppingTotal) * Quantity
        SugarLevel VARCHAR(10) NOT NULL DEFAULT '100%',
        IceLevel VARCHAR(10) NOT NULL DEFAULT '100%',
        Note NVARCHAR(200) NULL,
        CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_MenuItems FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId),
        CONSTRAINT FK_OrderItems_Sizes FOREIGN KEY (SizeId) REFERENCES Sizes(SizeId)
    );
END
GO

-- 5.3 Bảng OrderItemToppings: Topping kèm theo của từng OrderItem
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

-- 5.4 Bảng Payments: Giao dịch thanh toán
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Payments') AND type in (N'U'))
BEGIN
    CREATE TABLE Payments (
        PaymentId INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        Method VARCHAR(20) NOT NULL, -- 'cash', 'vietqr', 'momo', 'bank_transfer'
        Amount DECIMAL(15,0) NOT NULL,
        TransactionRef VARCHAR(100) NULL,
        Status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
        PaidAt DATETIME2 NULL,
        ProcessedByStaffId INT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        CONSTRAINT FK_Payments_Staff FOREIGN KEY (ProcessedByStaffId) REFERENCES Staff(StaffId)
    );
END
GO

-- ============================================================================
-- INDEXES TỐI ƯU HIỆU NĂNG CHO TOÀN BỘ HỆ THỐNG
-- ============================================================================

-- Multi-tenancy Index
CREATE NONCLUSTERED INDEX IX_Stores_TenantId ON Stores (TenantId);
CREATE NONCLUSTERED INDEX IX_Categories_TenantId ON Categories (TenantId, IsActive);
CREATE NONCLUSTERED INDEX IX_MenuItems_TenantId ON MenuItems (TenantId, CategoryId, IsAvailable);
CREATE NONCLUSTERED INDEX IX_Roles_TenantId ON Roles (TenantId);
CREATE NONCLUSTERED INDEX IX_Vouchers_TenantId ON Vouchers (TenantId, Code, IsActive);
CREATE NONCLUSTERED INDEX IX_Customers_TenantId_Phone ON Customers (TenantId, Phone);

-- Store-level Index
CREATE NONCLUSTERED INDEX IX_Tables_StoreId ON Tables (StoreId, Status, IsActive);
CREATE NONCLUSTERED INDEX IX_Staff_StoreId ON Staff (StoreId, IsActive);
CREATE NONCLUSTERED INDEX IX_Orders_StoreId_Status ON Orders (StoreId, Status, CreatedAt DESC);

-- Business & Reporting Index
CREATE NONCLUSTERED INDEX IX_Orders_TenantId_CreatedAt ON Orders (TenantId, CreatedAt DESC);
CREATE NONCLUSTERED INDEX IX_Orders_CustomerId ON Orders (CustomerId);
CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON OrderItems (OrderId);
CREATE NONCLUSTERED INDEX IX_Payments_OrderId ON Payments (OrderId);
CREATE NONCLUSTERED INDEX IX_LoyaltyPoints_CustomerId ON LoyaltyPoints (CustomerId, CreatedAt DESC);
CREATE NONCLUSTERED INDEX IX_VoucherUsages_VoucherId ON VoucherUsages (VoucherId);

PRINT N'✅ Đã khởi tạo thành công 22 bảng và Indexes cho Database WebCafeDB!';
GO
