using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.SystemAdmin
{
    /// <summary>
    /// Thống kê doanh thu theo ngày
    /// </summary>
    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty; // yyyy-MM-dd
        public string DayLabel { get; set; } = string.Empty; // T2, T3... Hôm nay
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    /// <summary>
    /// Thống kê tổng quan toàn sàn SaaS dành cho Super Admin
    /// </summary>
    public class PlatformStatsDto
    {
        public int TotalTenants { get; set; }
        public int ActiveTenants { get; set; }
        public int TotalStores { get; set; }
        public int TotalTables { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalGmv { get; set; }
        public decimal MonthlySubscriptionRevenue { get; set; }
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
    }

    /// <summary>
    /// Thông tin chi tiết của một quán cafe đối tác
    /// </summary>
    public class TenantDetailDto
    {
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string Plan { get; set; } = "basic";
        public int MaxStores { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int StoreCount { get; set; }
        public int TableCount { get; set; }
        public int OrderCount { get; set; }
        public decimal TotalGmv { get; set; }
    }

    /// <summary>
    /// DTO tạo một quán cafe / đối tác mới
    /// </summary>
    public class CreateTenantRequest
    {
        [Required(ErrorMessage = "Tên quán / thương hiệu là bắt buộc.")]
        public string Name { get; set; } = string.Empty;

        public string? Slug { get; set; }

        [Required(ErrorMessage = "Họ tên chủ quán là bắt buộc.")]
        public string OwnerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email chủ quán là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
        public string OwnerEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại chủ quán là bắt buộc.")]
        public string OwnerPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu khởi tạo là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự.")]
        public string OwnerPassword { get; set; } = string.Empty;

        public string? LogoUrl { get; set; }
        public string Plan { get; set; } = "basic";
        public int MaxStores { get; set; } = 1;

        // Thông tin chi nhánh đầu tiên
        public string? InitialStoreName { get; set; }
        public string? InitialStoreAddress { get; set; }
        public string? InitialStorePhone { get; set; }
    }

    /// <summary>
    /// DTO cập nhật gói dịch vụ của quán
    /// </summary>
    public class UpdateTenantPlanRequest
    {
        [Required(ErrorMessage = "Gói dịch vụ là bắt buộc.")]
        public string Plan { get; set; } = "basic";

        [Range(1, 100, ErrorMessage = "Số chi nhánh tối đa phải từ 1 đến 100.")]
        public int MaxStores { get; set; } = 1;
    }
}
