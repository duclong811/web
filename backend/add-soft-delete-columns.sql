-- Add Soft Delete columns to Categories and MenuItems
USE WebCafeDb;
GO

-- Add IsDeleted and DeletedAt to Categories
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND name = 'IsDeleted')
BEGIN
    ALTER TABLE Categories
    ADD IsDeleted BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added IsDeleted to Categories';
END
ELSE
    PRINT '⚠️ IsDeleted already exists in Categories';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND name = 'DeletedAt')
BEGIN
    ALTER TABLE Categories
    ADD DeletedAt DATETIME2 NULL;
    PRINT '✅ Added DeletedAt to Categories';
END
ELSE
    PRINT '⚠️ DeletedAt already exists in Categories';

-- Add IsDeleted and DeletedAt to MenuItems
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[MenuItems]') AND name = 'IsDeleted')
BEGIN
    ALTER TABLE MenuItems
    ADD IsDeleted BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added IsDeleted to MenuItems';
END
ELSE
    PRINT '⚠️ IsDeleted already exists in MenuItems';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[MenuItems]') AND name = 'DeletedAt')
BEGIN
    ALTER TABLE MenuItems
    ADD DeletedAt DATETIME2 NULL;
    PRINT '✅ Added DeletedAt to MenuItems';
END
ELSE
    PRINT '⚠️ DeletedAt already exists in MenuItems';

PRINT '';
PRINT '============================================';
PRINT 'Soft Delete Migration Completed!';
PRINT '============================================';
GO
