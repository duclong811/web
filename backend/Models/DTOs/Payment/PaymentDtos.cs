namespace WebCafe.Backend.Models.DTOs.Payment
{
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        public string Method { get; set; } = "cash";
        public decimal Amount { get; set; }
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
