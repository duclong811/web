-- Check if Tables table exists and view its data
USE WebCafeDb;
GO

-- Check table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Tables'
ORDER BY ORDINAL_POSITION;

-- Check if any tables exist
SELECT COUNT(*) AS TotalTables FROM Tables;

-- View all tables
SELECT 
    TableId,
    StoreId,
    TableNumber,
    Capacity,
    Location,
    Status,
    IsActive,
    CreatedAt
FROM Tables
WHERE IsActive = 1;
