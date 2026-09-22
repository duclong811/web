-- Add Guest columns to Orders table
USE WebCafeDb;
GO

-- Check if columns exist before adding
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'GuestId')
BEGIN
    ALTER TABLE Orders
    ADD GuestId NVARCHAR(100) NULL;
    PRINT 'Added GuestId column';
END
ELSE
    PRINT 'GuestId column already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'GuestName')
BEGIN
    ALTER TABLE Orders
    ADD GuestName NVARCHAR(100) NULL;
    PRINT 'Added GuestName column';
END
ELSE
    PRINT 'GuestName column already exists';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'GuestPhone')
BEGIN
    ALTER TABLE Orders
    ADD GuestPhone NVARCHAR(15) NULL;
    PRINT 'Added GuestPhone column';
END
ELSE
    PRINT 'GuestPhone column already exists';

GO

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Orders' 
  AND COLUMN_NAME IN ('GuestId', 'GuestName', 'GuestPhone')
ORDER BY COLUMN_NAME;
