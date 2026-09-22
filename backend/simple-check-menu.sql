-- Simple Check Menu Data
USE WebCafeDb;
GO

PRINT '--- CATEGORIES ---';
SELECT CategoryId, TenantId, Name, Icon, IsDeleted
FROM Categories
WHERE (IsDeleted = 0 OR IsDeleted IS NULL);

PRINT '';
PRINT '--- MENU ITEMS ---';
SELECT MenuItemId, TenantId, CategoryId, Name, BasePrice, IsDeleted
FROM MenuItems  
WHERE (IsDeleted = 0 OR IsDeleted IS NULL);

PRINT '';
PRINT '--- COUNT ---';
SELECT 
    (SELECT COUNT(*) FROM Categories WHERE IsDeleted = 0 OR IsDeleted IS NULL) AS TotalCategories,
    (SELECT COUNT(*) FROM MenuItems WHERE IsDeleted = 0 OR IsDeleted IS NULL) AS TotalMenuItems;
GO
