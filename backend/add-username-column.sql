-- Add Username column to Staff table and populate from Email
USE WebCafeDb;
GO

-- Check if Username column exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Staff' AND COLUMN_NAME = 'Username')
BEGIN
    -- Add Username column
    ALTER TABLE Staff
    ADD Username NVARCHAR(50) NULL;
    PRINT 'Added Username column to Staff table';
END
GO

-- Populate Username from Email (use email prefix before @)
UPDATE Staff
SET Username = LEFT(Email, CHARINDEX('@', Email) - 1)
WHERE Email IS NOT NULL AND Username IS NULL;

-- For staff without email, use a default pattern
UPDATE Staff
SET Username = 'staff' + CAST(StaffId AS NVARCHAR(10))
WHERE Username IS NULL OR Username = '';

GO

-- Make Username NOT NULL
ALTER TABLE Staff
ALTER COLUMN Username NVARCHAR(50) NOT NULL;

GO

PRINT 'Username column setup complete';

-- Verify
SELECT StaffId, Username, Email, FullName 
FROM Staff
ORDER BY StaffId;
