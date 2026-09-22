-- Check Menu Data for QR Code Demo
USE WebCafeDb;
GO

PRINT '============================================';
PRINT 'CHECKING MENU DATA FOR QR CODE DEMO';
PRINT '============================================';
PRINT '';

-- 1. Check Stores
PRINT '--- STORES ---';
SELECT 
    StoreId,
    TenantId,
    Name,
    Address,
    IsActive
FROM Stores
WHERE IsActive = 1;

PRINT '';

-- 2. Check Categories (not deleted)
PRINT '--- CATEGORIES (Active, Not Deleted) ---';
SELECT 
    CategoryId,
    TenantId,
    Name,
    Icon,
    SortOrder,
    IsActive,
    IsDeleted
FROM Categories
WHERE IsActive = 1 
  AND (IsDeleted = 0 OR IsDeleted IS NULL)
ORDER BY TenantId, SortOrder;

PRINT '';

-- 3. Check MenuItems (available, not deleted)
PRINT '--- MENU ITEMS (Available, Not Deleted) ---';
SELECT 
    m.MenuItemId,
    m.TenantId,
    m.CategoryId,
    c.Name AS CategoryName,
    m.Name AS ItemName,
    m.BasePrice,
    m.IsAvailable,
    m.IsDeleted
FROM MenuItems m
LEFT JOIN Categories c ON m.CategoryId = c.CategoryId
WHERE m.IsAvailable = 1
  AND (m.IsDeleted = 0 OR m.IsDeleted IS NULL)
ORDER BY m.TenantId, c.SortOrder, m.SortOrder;

PRINT '';

-- 4. Check if specific store has menu items
PRINT '--- MENU FOR STORE 1 (via Tenant) ---';
DECLARE @Store1TenantId INT = (SELECT TenantId FROM Stores WHERE StoreId = 1);

SELECT 
    c.Name AS Category,
    COUNT(m.MenuItemId) AS ItemCount
FROM Categories c
LEFT JOIN MenuItems m ON c.CategoryId = m.CategoryId 
    AND m.IsAvailable = 1 
    AND (m.IsDeleted = 0 OR m.IsDeleted IS NULL)
WHERE c.TenantId = @Store1TenantId
  AND c.IsActive = 1
  AND (c.IsDeleted = 0 OR c.IsDeleted IS NULL)
GROUP BY c.Name
ORDER BY c.SortOrder;

PRINT '';
PRINT '============================================';
PRINT 'If counts are 0, run seed-menu-test-data.sql!';
PRINT '============================================';
GO
