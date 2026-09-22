USE WebCafeDb;
GO

-- Hash moi cho password "123123": $2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6

-- Update SystemAdmin
UPDATE SystemAdmins 
SET PasswordHash = '$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6'
WHERE Username = 'superadmin';

-- Update Tenants
UPDATE Tenants 
SET OwnerPasswordHash = '$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6'
WHERE OwnerEmail IN ('minh@minhcafe.vn', 'lan@lancoffee.vn');

-- Verify update
SELECT 
    'SystemAdmin' AS [Type],
    Username AS [Account],
    PasswordHash,
    LEN(PasswordHash) AS HashLength,
    CASE 
        WHEN PasswordHash = '$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6' 
        THEN '✅ CORRECT' 
        ELSE '❌ WRONG' 
    END AS Status
FROM SystemAdmins
WHERE Username = 'superadmin'

UNION ALL

SELECT 
    'Tenant' AS [Type],
    OwnerEmail AS [Account],
    OwnerPasswordHash AS PasswordHash,
    LEN(OwnerPasswordHash) AS HashLength,
    CASE 
        WHEN OwnerPasswordHash = '$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6' 
        THEN '✅ CORRECT' 
        ELSE '❌ WRONG' 
    END AS Status
FROM Tenants
WHERE OwnerEmail IN ('minh@minhcafe.vn', 'lan@lancoffee.vn');
GO
