using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required(ErrorMessage = "Đơn hàng là bắt buộc.")]
        public int OrderId { get; set; }
        
        [Required(ErrorMessage = "Phương thức thanh toán là bắt buộc.")]
        [RegularExpression(@"^(cash|bank_transfer|momo|vnpay)$", 
            ErrorMessage = "Phương thức thanh toán phải là: cash, bank_transfer, momo hoặc vnpay.")]
        public string Method { get; set; } = "cash";
        
        [Required(ErrorMessage = "Số tiền là bắt buộc.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0.")]
        public decimal Amount { get; set; }
        
        [MaxLength(200, ErrorMessage = "Mã giao dịch không được vượt quá 200 ký tự.")]
        public string? TransactionRef { get; set; }
    }

    public class PaymentResultDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? QrCodeUrl { get; set; }
        public string? Message { get; set; }
    }
}
