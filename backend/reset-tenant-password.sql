-- Reset password for tenant minh@minhcafe.vn to '123123'
USE WebCafeDb;
GO

-- BCrypt hash of '123123' (same as before)
DECLARE @newHash NVARCHAR(256) = '$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6';

UPDATE Tenants
SET OwnerPasswordHash = @newHash
WHERE OwnerEmail = 'minh@minhcafe.vn';

PRINT 'Password reset for minh@minhcafe.vn to: 123123';

-- Verify
SELECT 
    TenantId, 
    Name, 
    OwnerEmail, 
    LEFT(OwnerPasswordHash, 20) + '...' AS PasswordHash,
    IsActive
FROM Tenants
WHERE OwnerEmail = 'minh@minhcafe.vn';
