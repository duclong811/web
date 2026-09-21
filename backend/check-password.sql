-- Kiem tra password hash cua superadmin
SELECT 
    Username,
    PasswordHash,
    LEFT(PasswordHash, 7) AS HashPrefix,
    LEN(PasswordHash) AS HashLength
FROM SystemAdmins 
WHERE Username = 'superadmin';

-- Hash dung phai co:
-- HashPrefix: $2a$10$ hoac $2a$11$
-- HashLength: khoang 60 ky tu
