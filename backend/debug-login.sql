-- Debug login issue
-- Kiem tra thong tin day du cua superadmin

SELECT 
    SystemAdminId,
    Username,
    Email,
    FullName,
    PasswordHash,
    IsActive,
    LEN(PasswordHash) AS HashLength,
    LEFT(PasswordHash, 10) AS HashPrefix
FROM SystemAdmins 
WHERE Username = 'superadmin';

-- Kiem tra column names trong bang SystemAdmins
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SystemAdmins'
ORDER BY ORDINAL_POSITION;
