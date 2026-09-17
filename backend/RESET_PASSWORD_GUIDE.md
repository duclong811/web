# 🔐 Hướng Dẫn Reset Password Khi Quên

## 🎯 **Tình Huống:**
User quên mật khẩu và không thể đăng nhập.

---

## ⚡ **CÁCH 1: Reset Password Trực Tiếp Trong SQL (Development)**

### **Bước 1: Tạo Password Hash Mới**

Chạy code C# này để generate hash của password mới:

```csharp
// Console app hoặc trong Program.cs test
using BCrypt.Net;

string newPassword = "NewPassword@123";
string hashedPassword = BCrypt.HashPassword(newPassword);
Console.WriteLine($"Hashed: {hashedPassword}");

// Output example:
// $2a$11$AbCd1234EfGh5678IjKl9.MnOpQrStUvWxYz0123456789AbCdEfGh
```

### **Bước 2: Update Trực Tiếp SQL**

#### **Reset SuperAdmin:**
```sql
UPDATE SystemAdmins
SET PasswordHash = '$2a$11$YOUR_GENERATED_HASH_HERE'
WHERE Username = 'superadmin';
```

#### **Reset Owner:**
```sql
UPDATE Tenants
SET OwnerPasswordHash = '$2a$11$YOUR_GENERATED_HASH_HERE'
WHERE OwnerEmail = 'owner@thecoffeehouse.vn';
```

#### **Reset Staff:**
```sql
UPDATE Staff
SET PasswordHash = '$2a$11$YOUR_GENERATED_HASH_HERE'
WHERE Username = 'staff_q1';
```

---

## 🔧 **CÁCH 2: Tạo API Reset Password (Recommended cho Production)**

### **API Flow:**

```
1. User click "Quên mật khẩu?"
2. Nhập email → Backend gửi email chứa reset token
3. User click link trong email → Mở form đổi mật khẩu
4. Nhập password mới → Backend verify token và update password
```

### **Bước 1: Tạo ResetPasswordController**

```csharp
[ApiController]
[Route("api/[controller]")]
public class PasswordResetController : ControllerBase
{
    private readonly WebCafeDbContext _db;
    private readonly IConfiguration _config;

    [HttpPost("request-reset")]
    public async Task<ActionResult<ApiResponse<string>>> RequestReset([FromBody] ResetPasswordRequest request)
    {
        // 1. Tìm user theo email
        var user = await _db.Staff.FirstOrDefaultAsync(s => s.Email == request.Email)
                ?? await _db.Tenants.Where(t => t.OwnerEmail == request.Email).Select(t => new { t.OwnerEmail, t.TenantId }).FirstOrDefaultAsync();

        if (user == null)
            return NotFound(ApiResponse<string>.Fail("Email không tồn tại trong hệ thống."));

        // 2. Tạo reset token (6 chữ số random)
        var resetToken = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(15); // Token hết hạn sau 15 phút

        // 3. Lưu token vào DB (cần tạo bảng PasswordResetTokens)
        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Email = request.Email,
            Token = resetToken,
            ExpiresAt = expiry,
            IsUsed = false
        });
        await _db.SaveChangesAsync();

        // 4. Gửi email chứa token (implement EmailService)
        // await _emailService.SendResetPasswordEmail(request.Email, resetToken);

        return Ok(ApiResponse<string>.Ok(
            $"Mã xác thực đã được gửi đến {request.Email}. Vui lòng kiểm tra email.",
            "Yêu cầu reset password thành công."
        ));
    }

    [HttpPost("verify-token")]
    public async Task<ActionResult<ApiResponse<string>>> VerifyToken([FromBody] VerifyTokenRequest request)
    {
        var tokenRecord = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => 
                t.Email == request.Email && 
                t.Token == request.Token && 
                !t.IsUsed && 
                t.ExpiresAt > DateTime.UtcNow
            );

        if (tokenRecord == null)
            return BadRequest(ApiResponse<string>.Fail("Mã xác thực không hợp lệ hoặc đã hết hạn."));

        return Ok(ApiResponse<string>.Ok("valid", "Mã xác thực hợp lệ."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<string>>> ResetPassword([FromBody] ResetPasswordConfirm request)
    {
        // 1. Verify token
        var tokenRecord = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => 
                t.Email == request.Email && 
                t.Token == request.Token && 
                !t.IsUsed && 
                t.ExpiresAt > DateTime.UtcNow
            );

        if (tokenRecord == null)
            return BadRequest(ApiResponse<string>.Fail("Mã xác thực không hợp lệ."));

        // 2. Hash password mới
        var newPasswordHash = SecurityHelper.HashPassword(request.NewPassword);

        // 3. Update password
        var staff = await _db.Staff.FirstOrDefaultAsync(s => s.Email == request.Email);
        if (staff != null)
        {
            staff.PasswordHash = newPasswordHash;
        }
        else
        {
            var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.OwnerEmail == request.Email);
            if (tenant != null)
            {
                tenant.OwnerPasswordHash = newPasswordHash;
            }
        }

        // 4. Mark token as used
        tokenRecord.IsUsed = true;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("success", "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."));
    }
}
```

### **Bước 2: Tạo Entity PasswordResetToken**

```csharp
public class PasswordResetToken
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

### **Bước 3: Tạo Migration**

```bash
cd backend
dotnet ef migrations add AddPasswordResetToken
dotnet ef database update
```

---

## 🛠️ **CÁCH 3: Quick Reset Script (For Testing)**

Tạo file `ResetPasswordTool.cs`:

```csharp
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Infrastructure.Data;

public class ResetPasswordTool
{
    public static async Task ResetStaffPassword(string username, string newPassword)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WebCafeDbContext>();
        optionsBuilder.UseSqlServer("YOUR_CONNECTION_STRING");

        using var db = new WebCafeDbContext(optionsBuilder.Options);
        
        var staff = await db.Staff.FirstOrDefaultAsync(s => s.Username == username);
        if (staff != null)
        {
            staff.PasswordHash = BCrypt.HashPassword(newPassword);
            await db.SaveChangesAsync();
            Console.WriteLine($"✅ Reset password cho {username} thành công!");
        }
        else
        {
            Console.WriteLine($"❌ Không tìm thấy user: {username}");
        }
    }
}

// Usage:
await ResetPasswordTool.ResetStaffPassword("staff_q1", "NewPassword@123");
```

---

## 📋 **CÁCH 4: Tạo Console App Reset Tool**

```bash
cd backend
dotnet new console -n PasswordResetTool
cd PasswordResetTool
dotnet add reference ../WebCafe.Backend.csproj
```

**Program.cs:**
```csharp
using WebCafe.Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

Console.WriteLine("=== WebCafe Password Reset Tool ===");
Console.Write("Nhập username cần reset: ");
var username = Console.ReadLine();

Console.Write("Nhập password mới: ");
var newPassword = Console.ReadLine();

var optionsBuilder = new DbContextOptionsBuilder<WebCafeDbContext>();
optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=WebCafeDB;Trusted_Connection=True;");

using var db = new WebCafeDbContext(optionsBuilder.Options);

// Check Staff
var staff = await db.Staff.FirstOrDefaultAsync(s => s.Username == username);
if (staff != null)
{
    staff.PasswordHash = BCrypt.HashPassword(newPassword);
    await db.SaveChangesAsync();
    Console.WriteLine($"✅ Reset password cho Staff '{username}' thành công!");
    return;
}

// Check Owner
var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.OwnerEmail == username);
if (tenant != null)
{
    tenant.OwnerPasswordHash = BCrypt.HashPassword(newPassword);
    await db.SaveChangesAsync();
    Console.WriteLine($"✅ Reset password cho Owner '{username}' thành công!");
    return;
}

// Check SystemAdmin
var admin = await db.SystemAdmins.FirstOrDefaultAsync(a => a.Username == username);
if (admin != null)
{
    admin.PasswordHash = BCrypt.HashPassword(newPassword);
    await db.SaveChangesAsync();
    Console.WriteLine($"✅ Reset password cho SystemAdmin '{username}' thành công!");
    return;
}

Console.WriteLine($"❌ Không tìm thấy user: {username}");
```

**Chạy:**
```bash
dotnet run
# Nhập: staff_q1
# Password: NewPassword@123
```

---

## 🎯 **KHUYẾN NGHỊ:**

### **Development/Testing:**
- ✅ Dùng Cách 1 (SQL Update) hoặc Cách 4 (Console App)
- ✅ Nhanh, đơn giản, không cần code thêm

### **Production:**
- ✅ **PHẢI implement Cách 2** (Reset Password API + Email)
- ✅ Security tốt hơn
- ✅ User experience tốt
- ✅ Có audit trail

---

## 📧 **Email Service (Optional cho Production):**

Cài package:
```bash
dotnet add package MailKit
```

**EmailService.cs:**
```csharp
public interface IEmailService
{
    Task SendResetPasswordEmail(string toEmail, string resetToken);
}

public class EmailService : IEmailService
{
    public async Task SendResetPasswordEmail(string toEmail, string resetToken)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("WebCafe", "noreply@webcafe.vn"));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = "Mã xác thực đổi mật khẩu WebCafe";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Yêu cầu đổi mật khẩu</h2>
                <p>Mã xác thực của bạn là: <strong>{resetToken}</strong></p>
                <p>Mã này có hiệu lực trong 15 phút.</p>
                <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            "
        };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync("your-email@gmail.com", "your-app-password");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
```

---

## ✅ **KẾT LUẬN:**

1. **Development:** Dùng SQL hoặc Console App để reset nhanh
2. **Production:** PHẢI có API Reset Password + Email verification
3. **Bảo mật:** Token hết hạn sau 15 phút, chỉ dùng 1 lần
4. **UX:** User không cần liên hệ admin, tự reset được

---

**Bạn muốn tôi implement cái nào?** 😊
