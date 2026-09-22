-- ============================================
-- Seed Test Data for Menu Management Testing
-- ============================================
USE WebCafeDb;
GO

-- Get Tenant IDs (Minh Cafe và Lan Coffee)
DECLARE @MinhTenantId INT = (SELECT TenantId FROM Tenants WHERE OwnerEmail = 'minh@minhcafe.vn');
DECLARE @LanTenantId INT = (SELECT TenantId FROM Tenants WHERE OwnerEmail = 'lan@lancoffee.vn');

PRINT 'Minh Cafe TenantId: ' + CAST(@MinhTenantId AS VARCHAR);
PRINT 'Lan Coffee TenantId: ' + CAST(@LanTenantId AS VARCHAR);

-- ============================================
-- MINH CAFE - Categories
-- ============================================
IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Cà phê')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@MinhTenantId, N'Cà phê', N'☕', 1, 1, GETUTCDATE());
    PRINT 'Created category: Cà phê for Minh Cafe';
END

IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Trà sữa')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@MinhTenantId, N'Trà sữa', N'🧋', 2, 1, GETUTCDATE());
    PRINT 'Created category: Trà sữa for Minh Cafe';
END

IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Bánh ngọt')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@MinhTenantId, N'Bánh ngọt', N'🍰', 3, 1, GETUTCDATE());
    PRINT 'Created category: Bánh ngọt for Minh Cafe';
END

-- ============================================
-- LAN COFFEE - Categories
-- ============================================
IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Đồ uống lạnh')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@LanTenantId, N'Đồ uống lạnh', N'🧊', 1, 1, GETUTCDATE());
    PRINT 'Created category: Đồ uống lạnh for Lan Coffee';
END

IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Đồ uống nóng')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@LanTenantId, N'Đồ uống nóng', N'☕', 2, 1, GETUTCDATE());
    PRINT 'Created category: Đồ uống nóng for Lan Coffee';
END

IF NOT EXISTS (SELECT 1 FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Smoothie')
BEGIN
    INSERT INTO Categories (TenantId, Name, Icon, SortOrder, IsActive, CreatedAt)
    VALUES (@LanTenantId, N'Smoothie', N'🥤', 3, 1, GETUTCDATE());
    PRINT 'Created category: Smoothie for Lan Coffee';
END

-- ============================================
-- Get Category IDs
-- ============================================
DECLARE @MinhCoffeeCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Cà phê');
DECLARE @MinhMilkTeaCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Trà sữa');
DECLARE @MinhDessertCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @MinhTenantId AND Name = N'Bánh ngọt');

DECLARE @LanColdCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Đồ uống lạnh');
DECLARE @LanHotCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Đồ uống nóng');
DECLARE @LanSmoothieCategory INT = (SELECT CategoryId FROM Categories WHERE TenantId = @LanTenantId AND Name = N'Smoothie');

-- ============================================
-- MINH CAFE - Menu Items
-- ============================================
IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Cà phê sữa đá')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhCoffeeCategory, N'Cà phê sữa đá', N'Cà phê phin truyền thống pha với sữa đặc', 35000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', 4.5, 1, 1, 1, GETUTCDATE());
    PRINT 'Created item: Cà phê sữa đá';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Cà phê đen')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhCoffeeCategory, N'Cà phê đen', N'Cà phê phin nguyên chất không đường', 30000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', 4.3, 0, 1, 2, GETUTCDATE());
    PRINT 'Created item: Cà phê đen';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Bạc xỉu')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhCoffeeCategory, N'Bạc xỉu', N'Cà phê sữa nhiều sữa ít cà phê', 38000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 4.7, 1, 1, 3, GETUTCDATE());
    PRINT 'Created item: Bạc xỉu';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Trà sữa trân châu đường đen')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhMilkTeaCategory, N'Trà sữa trân châu đường đen', N'Trà sữa với topping trân châu đường đen thơm ngon', 45000, 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 4.8, 1, 1, 1, GETUTCDATE());
    PRINT 'Created item: Trà sữa trân châu đường đen';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Trà sữa socola')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhMilkTeaCategory, N'Trà sữa socola', N'Trà sữa vị socola béo ngậy', 42000, 'https://images.unsplash.com/photo-1578374173705-0032c1b68c78?w=400', 4.4, 0, 1, 2, GETUTCDATE());
    PRINT 'Created item: Trà sữa socola';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Bánh tiramisu')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhDessertCategory, N'Bánh tiramisu', N'Bánh tiramisu Ý nguyên bản', 55000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 4.9, 1, 1, 1, GETUTCDATE());
    PRINT 'Created item: Bánh tiramisu';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @MinhTenantId AND Name = N'Bánh croissant')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@MinhTenantId, @MinhDessertCategory, N'Bánh croissant', N'Bánh sừng bò thơm bơ', 35000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 4.5, 0, 1, 2, GETUTCDATE());
    PRINT 'Created item: Bánh croissant';
END

-- ============================================
-- LAN COFFEE - Menu Items
-- ============================================
IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Trà đào cam sả')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanColdCategory, N'Trà đào cam sả', N'Trà trái cây tươi mát lạnh', 45000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 4.7, 1, 1, 1, GETUTCDATE());
    PRINT 'Created item: Trà đào cam sả';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Trà vải')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanColdCategory, N'Trà vải', N'Trà vải ngọt thanh mát', 40000, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 4.6, 0, 1, 2, GETUTCDATE());
    PRINT 'Created item: Trà vải';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Matcha latte')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanColdCategory, N'Matcha latte', N'Trà xanh matcha Nhật Bản với sữa', 50000, 'https://images.unsplash.com/photo-1536013772984-c70dd58a6dac?w=400', 4.8, 1, 1, 3, GETUTCDATE());
    PRINT 'Created item: Matcha latte';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Trà gừng mật ong')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanHotCategory, N'Trà gừng mật ong', N'Trà gừng nóng với mật ong nguyên chất', 35000, 'https://images.unsplash.com/photo-1597318181274-31e5b2c0c8ce?w=400', 4.4, 0, 1, 1, GETUTCDATE());
    PRINT 'Created item: Trà gừng mật ong';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Chocolate nóng')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanHotCategory, N'Chocolate nóng', N'Socola nóng đậm đà với marshmallow', 42000, 'https://images.unsplash.com/photo-1542990253-a781e04c0082?w=400', 4.7, 1, 1, 2, GETUTCDATE());
    PRINT 'Created item: Chocolate nóng';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Smoothie dâu')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanSmoothieCategory, N'Smoothie dâu', N'Smoothie dâu tây tươi mát lạnh', 48000, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', 4.9, 1, 1, 1, GETUTCDATE());
    PRINT 'Created item: Smoothie dâu';
END

IF NOT EXISTS (SELECT 1 FROM MenuItems WHERE TenantId = @LanTenantId AND Name = N'Smoothie xoài')
BEGIN
    INSERT INTO MenuItems (TenantId, CategoryId, Name, Description, BasePrice, ImageUrl, Rating, IsFeatured, IsAvailable, SortOrder, CreatedAt)
    VALUES (@LanTenantId, @LanSmoothieCategory, N'Smoothie xoài', N'Smoothie xoài ngọt thơm', 48000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', 4.8, 0, 1, 2, GETUTCDATE());
    PRINT 'Created item: Smoothie xoài';
END

-- ============================================
-- Verification Queries
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'VERIFICATION RESULTS';
PRINT '============================================';

PRINT '';
PRINT '--- MINH CAFE SUMMARY ---';
SELECT 
    'Categories' AS Type,
    COUNT(*) AS Total,
    STRING_AGG(Name, ', ') AS Items
FROM Categories
WHERE TenantId = @MinhTenantId;

SELECT 
    'Menu Items' AS Type,
    COUNT(*) AS Total,
    STRING_AGG(Name, ', ') AS Items
FROM MenuItems
WHERE TenantId = @MinhTenantId;

PRINT '';
PRINT '--- LAN COFFEE SUMMARY ---';
SELECT 
    'Categories' AS Type,
    COUNT(*) AS Total,
    STRING_AGG(Name, ', ') AS Items
FROM Categories
WHERE TenantId = @LanTenantId;

SELECT 
    'Menu Items' AS Type,
    COUNT(*) AS Total,
    STRING_AGG(Name, ', ') AS Items
FROM MenuItems
WHERE TenantId = @LanTenantId;

PRINT '';
PRINT '--- TENANT ISOLATION CHECK ---';
SELECT 
    m.MenuItemId,
    m.Name AS ItemName,
    m.TenantId AS ItemTenantId,
    c.Name AS CategoryName,
    c.TenantId AS CategoryTenantId
FROM MenuItems m
JOIN Categories c ON m.CategoryId = c.CategoryId
WHERE m.TenantId != c.TenantId;

IF @@ROWCOUNT = 0
    PRINT '✅ Tenant isolation verified: No cross-tenant references found!';
ELSE
    PRINT '❌ WARNING: Cross-tenant references detected!';

PRINT '';
PRINT '============================================';
PRINT 'SEED COMPLETED SUCCESSFULLY';
PRINT '============================================';
GO
