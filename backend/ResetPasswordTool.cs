using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Helper;
using WebCafe.Backend.Infrastructure.Data;

namespace WebCafe.Backend
{
    /// <summary>
    /// Tool để reset password cho user khi quên mật khẩu
    /// Usage: Uncomment code trong Program.cs để chạy
    /// </summary>
    public static class ResetPasswordTool
    {
        public static async Task ResetPassword(WebCafeDbContext db, string usernameOrEmail, string newPassword)
        {
            Console.WriteLine($"🔍 Đang tìm user: {usernameOrEmail}...");

            // 1. Check Staff
            var staff = await db.Staff.FirstOrDefaultAsync(s => 
                s.Username == usernameOrEmail || s.Email == usernameOrEmail);
            
            if (staff != null)
            {
                staff.PasswordHash = SecurityHelper.HashPassword(newPassword);
                await db.SaveChangesAsync();
                Console.WriteLine($"✅ Reset password cho Staff '{staff.Username}' ({staff.FullName}) thành công!");
                Console.WriteLine($"   Username: {staff.Username}");
                Console.WriteLine($"   Password mới: {newPassword}");
                return;
            }

            // 2. Check Owner (Tenant)
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => 
                t.OwnerEmail == usernameOrEmail);
            
            if (tenant != null)
            {
                tenant.OwnerPasswordHash = SecurityHelper.HashPassword(newPassword);
                await db.SaveChangesAsync();
                Console.WriteLine($"✅ Reset password cho Owner '{tenant.OwnerName}' thành công!");
                Console.WriteLine($"   Email: {tenant.OwnerEmail}");
                Console.WriteLine($"   Password mới: {newPassword}");
                return;
            }

            // 3. Check SystemAdmin
            var admin = await db.SystemAdmins.FirstOrDefaultAsync(a => 
                a.Username == usernameOrEmail || a.Email == usernameOrEmail);
            
            if (admin != null)
            {
                admin.PasswordHash = SecurityHelper.HashPassword(newPassword);
                await db.SaveChangesAsync();
                Console.WriteLine($"✅ Reset password cho SystemAdmin '{admin.Username}' ({admin.FullName}) thành công!");
                Console.WriteLine($"   Username: {admin.Username}");
                Console.WriteLine($"   Password mới: {newPassword}");
                return;
            }

            Console.WriteLine($"❌ Không tìm thấy user với username/email: {usernameOrEmail}");
        }

        public static async Task ListAllUsers(WebCafeDbContext db)
        {
            Console.WriteLine("\n📋 DANH SÁCH TẤT CẢ USER:");
            Console.WriteLine("".PadRight(80, '='));

            // SystemAdmins
            var admins = await db.SystemAdmins.ToListAsync();
            if (admins.Any())
            {
                Console.WriteLine("\n🔑 SYSTEM ADMINS:");
                foreach (var admin in admins)
                {
                    Console.WriteLine($"  • Username: {admin.Username} | Email: {admin.Email} | Name: {admin.FullName}");
                }
            }

            // Owners
            var owners = await db.Tenants.ToListAsync();
            if (owners.Any())
            {
                Console.WriteLine("\n👑 OWNERS (Tenant):");
                foreach (var owner in owners)
                {
                    Console.WriteLine($"  • Email: {owner.OwnerEmail} | Name: {owner.OwnerName} | Brand: {owner.Name}");
                }
            }

            // Staff
            var staff = await db.Staff.Include(s => s.Store).ToListAsync();
            if (staff.Any())
            {
                Console.WriteLine("\n👤 STAFF:");
                foreach (var s in staff)
                {
                    Console.WriteLine($"  • Username: {s.Username} | Email: {s.Email} | Name: {s.FullName} | Store: {s.Store?.Name}");
                }
            }

            Console.WriteLine("".PadRight(80, '='));
        }

        /// <summary>
        /// Interactive mode - hỏi user nhập thông tin
        /// </summary>
        public static async Task InteractiveReset(WebCafeDbContext db)
        {
            Console.WriteLine("\n" + "".PadRight(80, '='));
            Console.WriteLine("🔐 WEBCAFE PASSWORD RESET TOOL");
            Console.WriteLine("".PadRight(80, '='));

            // List users first
            await ListAllUsers(db);

            Console.WriteLine("\n");
            Console.Write("📝 Nhập username hoặc email cần reset: ");
            var usernameOrEmail = Console.ReadLine()?.Trim();

            if (string.IsNullOrEmpty(usernameOrEmail))
            {
                Console.WriteLine("❌ Vui lòng nhập username hoặc email!");
                return;
            }

            Console.Write("🔒 Nhập password mới (hoặc Enter để dùng mặc định 'Password@123'): ");
            var newPassword = Console.ReadLine()?.Trim();
            
            if (string.IsNullOrEmpty(newPassword))
            {
                newPassword = "Password@123";
            }

            Console.WriteLine();
            await ResetPassword(db, usernameOrEmail, newPassword);
            Console.WriteLine("\n✨ Hoàn tất!\n");
        }
    }
}
