-- FINAL PASSWORD FIX - Set to plaintext "123123" for testing
USE WebCafeDb;
GO

-- Update all tenant passwords to "123123" (plaintext)
UPDATE Tenants 
SET OwnerPasswordHash = '123123'
WHERE TenantId IN (1, 2);

-- Verify
SELECT 
    TenantId,
    Name,
    OwnerEmail,
    OwnerPasswordHash,
    IsActive
FROM Tenants
WHERE TenantId IN (1, 2);

GO

PRINT 'Password updated to: 123123 (plaintext)';
PRINT 'Login with:';
PRINT '  minh@minhcafe.vn / 123123';
PRINT '  lan@lancoffee.vn / 123123';
