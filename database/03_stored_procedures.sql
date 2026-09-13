-- ============================================================================
-- WebCafe SaaS QR Ordering Platform — Stored Procedures & Views
-- DBMS: Microsoft SQL Server (2019 / 2022 / Azure SQL)
-- ============================================================================

USE WebCafeDB;
GO

-- ============================================================================
-- SP 1: sp_GetMenuByStore — Lấy toàn bộ Menu đang hoạt động theo Chi Nhánh
-- ============================================================================
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

    -- 1. Trả về thông tin Quán / Chi nhánh
    SELECT 
        s.StoreId, s.TenantId, s.Name AS StoreName, s.Address, s.Phone,
        s.BankAccount, s.BankName, s.BankAccountName,
        t.Name AS BrandName, t.LogoUrl
    FROM Stores s
    INNER JOIN Tenants t ON s.TenantId = t.TenantId
    WHERE s.StoreId = @StoreId;

    -- 2. Danh mục món
    SELECT CategoryId, Name, Icon, SortOrder
    FROM Categories
    WHERE TenantId = @TenantId AND IsActive = 1
    ORDER BY SortOrder ASC;

    -- 3. Món ăn & Đồ uống
    SELECT 
        m.MenuItemId, m.CategoryId, m.Name, m.Description,
        m.BasePrice, m.ImageUrl, m.Rating, m.IsFeatured, m.IsAvailable, m.SortOrder
    FROM MenuItems m
    WHERE m.TenantId = @TenantId AND m.IsAvailable = 1
    ORDER BY m.SortOrder ASC, m.Name ASC;

    -- 4. Kích cỡ & Giá cộng thêm của từng món
    SELECT 
        ms.MenuItemId, s.SizeId, s.Name AS SizeName, ms.ExtraPrice
    FROM MenuItemSizes ms
    INNER JOIN Sizes s ON ms.SizeId = s.SizeId
    WHERE s.TenantId = @TenantId
    ORDER BY s.SortOrder ASC;

    -- 5. Toppings hợp lệ của từng món
    SELECT 
        mt.MenuItemId, t.ToppingId, t.Name AS ToppingName, t.Price
    FROM MenuItemToppings mt
    INNER JOIN Toppings t ON mt.ToppingId = t.ToppingId
    WHERE t.TenantId = @TenantId AND t.IsAvailable = 1
    ORDER BY t.Name ASC;
END
GO

-- ============================================================================
-- SP 2: sp_UpdateOrderStatus — Cập nhật trạng thái đơn & tự động xử lý tích điểm
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_UpdateOrderStatus
    @OrderId INT,
    @NewStatus VARCHAR(20), -- 'pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'
    @StaffId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @OldStatus VARCHAR(20);
        DECLARE @TenantId INT;
        DECLARE @CustomerId INT;
        DECLARE @TableId INT;
        DECLARE @TotalAmount DECIMAL(15,0);
        DECLARE @PointsEarned INT;

        SELECT 
            @OldStatus = Status,
            @TenantId = TenantId,
            @CustomerId = CustomerId,
            @TableId = TableId,
            @TotalAmount = TotalAmount,
            @PointsEarned = PointsEarned
        FROM Orders
        WHERE OrderId = @OrderId;

        IF @OldStatus IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy đơn hàng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Cập nhật trạng thái đơn
        UPDATE Orders
        SET Status = @NewStatus,
            StaffId = COALESCE(@StaffId, StaffId),
            UpdatedAt = GETDATE()
        WHERE OrderId = @OrderId;

        -- Khi đơn chuyển sang PAID (Thanh toán xong)
        IF @NewStatus = 'paid' AND @OldStatus <> 'paid'
        BEGIN
            -- 1. Giải phóng bàn về Available nếu khách thanh toán xong
            IF @TableId IS NOT NULL
            BEGIN
                UPDATE Tables SET Status = 'Available' WHERE TableId = @TableId;
            END

            -- 2. Tích điểm cho khách hàng nếu có SĐT thành viên
            IF @CustomerId IS NOT NULL AND @PointsEarned > 0
            BEGIN
                -- Cộng điểm và tích lũy chi tiêu
                UPDATE Customers
                SET TotalPoints = TotalPoints + @PointsEarned,
                    TotalSpent = TotalSpent + @TotalAmount,
                    VisitCount = VisitCount + 1,
                    LastVisitAt = GETDATE()
                WHERE CustomerId = @CustomerId;

                -- Ghi log lịch sử điểm
                INSERT INTO LoyaltyPoints (CustomerId, OrderId, Points, Type, Description)
                VALUES (@CustomerId, @OrderId, @PointsEarned, 'earn', N'Tích điểm từ đơn hàng ' + CAST(@OrderId AS NVARCHAR));
            END
        END

        -- Khi đơn bị CANCELLED: Giải phóng bàn nếu cần
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

-- ============================================================================
-- SP 3: sp_GetDailyRevenue — Thống kê doanh thu theo ngày cho Quản lý / Chủ chuỗi
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_GetDailyRevenue
    @TenantId INT,
    @StoreId INT = NULL, -- NULL = xem toàn bộ các chi nhánh của Tenant
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @FromDate IS NULL SET @FromDate = CAST(DATEADD(DAY, -7, GETDATE()) AS DATE);
    IF @ToDate IS NULL SET @ToDate = CAST(GETDATE() AS DATE);

    -- 1. Tổng quan Doanh thu & Số đơn
    SELECT 
        COUNT(OrderId) AS TotalOrders,
        SUM(CASE WHEN Status = 'paid' THEN TotalAmount ELSE 0 END) AS TotalRevenue,
        SUM(DiscountAmount) AS TotalDiscountGiven,
        SUM(PointsUsed) AS TotalPointsRedeemed
    FROM Orders
    WHERE TenantId = @TenantId
      AND (@StoreId IS NULL OR StoreId = @StoreId)
      AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate;

    -- 2. Chi tiết doanh thu theo từng ngày
    SELECT 
        CAST(CreatedAt AS DATE) AS OrderDate,
        COUNT(OrderId) AS OrderCount,
        SUM(CASE WHEN Status = 'paid' THEN TotalAmount ELSE 0 END) AS Revenue
    FROM Orders
    WHERE TenantId = @TenantId
      AND (@StoreId IS NULL OR StoreId = @StoreId)
      AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY CAST(CreatedAt AS DATE)
    ORDER BY OrderDate DESC;

    -- 3. Top 5 món bán chạy nhất
    SELECT TOP 5
        m.Name AS ItemName,
        c.Name AS CategoryName,
        SUM(oi.Quantity) AS TotalSold,
        SUM(oi.SubTotal) AS TotalAmount
    FROM OrderItems oi
    INNER JOIN Orders o ON oi.OrderId = o.OrderId
    INNER JOIN MenuItems m ON oi.MenuItemId = m.MenuItemId
    INNER JOIN Categories c ON m.CategoryId = c.CategoryId
    WHERE o.TenantId = @TenantId
      AND (@StoreId IS NULL OR o.StoreId = @StoreId)
      AND o.Status = 'paid'
      AND CAST(o.CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate
    GROUP BY m.Name, c.Name
    ORDER BY TotalSold DESC;
END
GO

-- ============================================================================
-- SP 4: sp_GetCustomerLoyalty — Tra cứu điểm và voucher khả dụng theo SĐT
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_GetCustomerLoyalty
    @TenantId INT,
    @Phone VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CustomerId INT;
    SELECT @CustomerId = CustomerId FROM Customers WHERE TenantId = @TenantId AND Phone = @Phone;

    -- 1. Thông tin khách hàng & điểm
    SELECT 
        CustomerId, Phone, Name, TotalPoints, TotalSpent, VisitCount, CreatedAt, LastVisitAt
    FROM Customers
    WHERE TenantId = @TenantId AND Phone = @Phone;

    IF @CustomerId IS NOT NULL
    BEGIN
        -- 2. Lịch sử tích / trừ điểm gần nhất (10 dòng)
        SELECT TOP 10
            PointId, Points, Type, Description, CreatedAt
        FROM LoyaltyPoints
        WHERE CustomerId = @CustomerId
        ORDER BY CreatedAt DESC;

        -- 3. Danh sách voucher khả dụng
        SELECT 
            v.VoucherId, v.Code, v.Title, v.Description,
            v.DiscountType, v.DiscountValue, v.MaxDiscount, v.MinOrderAmount,
            v.StartDate, v.EndDate
        FROM Vouchers v
        WHERE v.TenantId = @TenantId
          AND v.IsActive = 1
          AND GETDATE() BETWEEN v.StartDate AND v.EndDate
          AND (v.Scope = 'public' OR (v.Scope = 'personal' AND v.AssignedCustomerId = @CustomerId))
          AND (v.MaxUsageTotal IS NULL OR v.UsedCount < v.MaxUsageTotal)
          AND (
              SELECT COUNT(1) FROM VoucherUsages vu 
              WHERE vu.VoucherId = v.VoucherId AND vu.CustomerId = @CustomerId
          ) < v.MaxUsagePerCustomer;
    END
END
GO

PRINT N'✅ Đã tạo thành công các Stored Procedures (sp_GetMenuByStore, sp_UpdateOrderStatus, sp_GetDailyRevenue, sp_GetCustomerLoyalty)!';
GO
