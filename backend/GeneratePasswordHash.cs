using System;
using WebCafe.Backend.Common.Helper;

// Chạy: dotnet script GeneratePasswordHash.cs
// Hoặc thêm vào Program.cs tạm thời

public class GeneratePasswordHash
{
    public static void Main()
    {
        Console.WriteLine("========================================");
        Console.WriteLine("GENERATE BCRYPT HASH FOR PASSWORD");
        Console.WriteLine("========================================\n");

        // Password mặc định
        string password = "Admin@123";
        
        Console.WriteLine($"Password: {password}");
        
        string hash = SecurityHelper.HashPassword(password);
        
        Console.WriteLine($"\nBCrypt Hash:\n{hash}\n");
        
        Console.WriteLine("========================================");
        Console.WriteLine("SQL COMMANDS:");
        Console.WriteLine("========================================\n");
        
        Console.WriteLine("-- Reset password cho System Admin (superadmin)");
        Console.WriteLine($"UPDATE SystemAdmins SET PasswordHash = '{hash}' WHERE Username = 'superadmin';\n");
        
        Console.WriteLine("-- Reset password cho Owner");
        Console.WriteLine($"UPDATE Tenants SET OwnerPasswordHash = '{hash}' WHERE OwnerEmail = 'owner@thecoffeehouse.vn';\n");
        
        Console.WriteLine("-- Reset password cho Staff");
        Console.WriteLine($"UPDATE Staff SET PasswordHash = '{hash}' WHERE Username = 'staff_q1';\n");
    }
}
