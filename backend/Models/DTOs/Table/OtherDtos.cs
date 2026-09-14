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
    // Moved to Models/DTOs/Payment/PaymentDtos.cs
}

namespace WebCafe.Backend.Models.DTOs.Analytics
{
    // Moved to Models/DTOs/Analytics/AnalyticsDtos.cs
}
