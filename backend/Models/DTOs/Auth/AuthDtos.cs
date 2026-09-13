using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Auth
{
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int TenantId { get; set; }
        public int? StoreId { get; set; }
        public string? StoreName { get; set; }
        public string? BrandName { get; set; }
    }
}
