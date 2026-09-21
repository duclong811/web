// Test BCrypt hash for password "123123"
using BCrypt.Net;

string password = "123123";
string hash = BCrypt.HashPassword(password);

Console.WriteLine($"Password: {password}");
Console.WriteLine($"Hash: {hash}");
Console.WriteLine($"Verify: {BCrypt.Verify(password, hash)}");

// Test with existing hash from database
string existingHash = "$2a$11$NxB8.jiGUJ.YXpKXmLgLe.J.OfyHHyI.aeOy1EtpqDJEFJIGz.qr6";
Console.WriteLine($"\nExisting hash from DB: {existingHash}");
Console.WriteLine($"Verify with 123123: {BCrypt.Verify(password, existingHash)}");
