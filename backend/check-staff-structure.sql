-- Check Staff table structure
USE WebCafeDb;
GO

-- Check all columns in Staff table
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Staff'
ORDER BY ORDINAL_POSITION;

-- Check if any staff exists
SELECT COUNT(*) AS TotalStaff FROM Staff;

-- Show sample data
SELECT TOP 5 * FROM Staff;
