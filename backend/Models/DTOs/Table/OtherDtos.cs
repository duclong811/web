using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Table
{
    public class TableDto
    {
        public int TableId { get; set; }
        public int StoreId { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string? Location { get; set; }
        public string? QRCodeUrl { get; set; }
        public string Status { get; set; } = "Available";
        public bool IsActive { get; set; }
        public int? ActiveOrderId { get; set; }
        public string? ActiveOrderCode { get; set; }
    }

    public class CreateTableDto
    {
        public int StoreId { get; set; }
        [Required, MaxLength(10)]
        public string TableNumber { get; set; } = string.Empty;
        public int Capacity { get; set; } = 4;
        public string? Location { get; set; }
    }

    public class UpdateTableStatusDto
    {
        [Required]
        public string Status { get; set; } = "Available"; // Available, Occupied, Reserved
    }
}

namespace WebCafe.Backend.Models.DTOs.Voucher
{
    public class CheckVoucherRequest
    {
        [Required]
        public string Code { get; set; } = string.Empty;
        public int StoreId { get; set; }
        public decimal OrderAmount { get; set; }
        public string? CustomerPhone { get; set; }
    }

    public class VoucherValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string DiscountType { get; set; } = "percent";
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
    }
}

namespace WebCafe.Backend.Models.DTOs.Payment
{
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        [Required]
        public string Method { get; set; } = "cash"; // cash, vietqr, momo, bank_transfer
        public decimal Amount { get; set; }
        public string? TransactionRef { get; set; }
    }

    public class PaymentResultDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "completed";
        public string? QrCodeUrl { get; set; }
    }
}

namespace WebCafe.Backend.Models.DTOs.Analytics
{
    public class DashboardStatsDto
    {
        public decimal TodayRevenue { get; set; }
        public int TodayOrders { get; set; }
        public int TotalCustomers { get; set; }
        public int AvailableTables { get; set; }
        public int OccupiedTables { get; set; }
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<DailyRevenueDto> RevenueChart { get; set; } = new();
    }

    public class TopProductDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int SoldCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
    }
}
