-- EMERGENCY: Reset to plaintext password (NOT SECURE - for dev only)
USE WebCafeDb;
GO

-- MD5 hash of "123123" 
UPDATE Tenants SET OwnerPasswordHash = '4297f44b13955235245b2497399d7a93' WHERE OwnerEmail = 'minh@minhcafe.vn';
UPDATE Tenants SET OwnerPasswordHash = '4297f44b13955235245b2497399d7a93' WHERE OwnerEmail = 'lan@lancoffee.vn';
UPDATE SystemAdmins SET PasswordHash = '4297f44b13955235245b2497399d7a93' WHERE Username = 'superadmin';

SELECT 'UPDATED' AS Status;
GO
