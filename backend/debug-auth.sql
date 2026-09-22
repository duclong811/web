USE WebCafeDb;
GO

-- Kiem tra chi tiet hash trong database
SELECT 
    'SystemAdmin' AS [Type],
    Username AS [Identifier],
    PasswordHash,
    LEN(PasswordHash) AS HashLength,
    LEFT(PasswordHash, 7) AS HashPrefix,
    IsActive
FROM SystemAdmins
WHERE Username = 'superadmin'

UNION ALL

SELECT 
    'Tenant' AS [Type],
    OwnerEmail AS [Identifier],
    OwnerPasswordHash AS PasswordHash,
    LEN(OwnerPasswordHash) AS HashLength,
    LEFT(OwnerPasswordHash, 7) AS HashPrefix,
    CAST(IsActive AS BIT) AS IsActive
FROM Tenants
WHERE OwnerEmail IN ('minh@minhcafe.vn', 'lan@lancoffee.vn');

-- Kiem tra xem co SPACE hoac ky tu an khong
SELECT 
    Username,
    DATALENGTH(Username) AS UsernameBytes,
    LEN(Username) AS UsernameLength,
    DATALENGTH(PasswordHash) AS HashBytes,
    LEN(PasswordHash) AS HashLength
FROM SystemAdmins
WHERE Username = 'superadmin';
