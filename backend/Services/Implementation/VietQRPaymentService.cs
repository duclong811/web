using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.Entities;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public interface IVietQRPaymentService
    {
        Task<VietQRPaymentDto> CreateVietQRPaymentAsync(int orderId);
        Task<PaymentResultDto> ProcessWebhookAsync(VietQRWebhookDto webhook);
        Task<VietQRPaymentDto?> GetPendingPaymentByOrderIdAsync(int orderId);
        Task<bool> VerifyWebhookSignatureAsync(VietQRWebhookDto webhook, string signature);
    }

    public class VietQRPaymentService : IVietQRPaymentService
    {
        private readonly WebCafeDbContext _db;
        private readonly IOrderService _orderService;
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<VietQRPaymentService> _logger;

        public VietQRPaymentService(
            WebCafeDbContext db, 
            IOrderService orderService,
            IInventoryService inventoryService,
            ILogger<VietQRPaymentService> logger)
        {
            _db = db;
            _orderService = orderService;
            _inventoryService = inventoryService;
            _logger = logger;
        }

        /// <summary>
        /// Tạo VietQR payment request cho đơn hàng
        /// </summary>
        public async Task<VietQRPaymentDto> CreateVietQRPaymentAsync(int orderId)
        {
            var order = await _db.Orders
                .Include(o => o.Store)
                    .ThenInclude(s => s!.Tenant)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new NotFoundException("Không tìm thấy đơn hàng.");
            }

            if (order.Status == OrderStatus.Paid)
            {
                throw new AppException("Đơn hàng đã được thanh toán.");
            }

            if (order.Store == null || string.IsNullOrEmpty(order.Store.BankAccount))
            {
                throw new AppException("Cửa hàng chưa cấu hình thông tin ngân hàng.");
            }

            // Kiểm tra xem đã có payment pending chưa
            var existingPayment = await _db.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Status == PaymentStatuses.Pending);

            if (existingPayment != null)
            {
                // Trả về payment hiện tại
                return MapToVietQRDto(existingPayment, order);
            }

            // Tạo payment record mới với status pending
            var payment = new Payment
            {
                OrderId = order.OrderId,
                Method = PaymentMethods.VietQR,
                Amount = order.TotalAmount,
                TransactionRef = $"VIETQR-{order.OrderCode}-{DateTime.UtcNow:yyMMddHHmmss}",
                Status = PaymentStatuses.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            return MapToVietQRDto(payment, order);
        }

        /// <summary>
        /// Xử lý webhook từ ngân hàng khi khách hàng chuyển khoản thành công
        /// </summary>
        public async Task<PaymentResultDto> ProcessWebhookAsync(VietQRWebhookDto webhook)
        {
            _logger.LogInformation($"Received VietQR webhook: {webhook.TransactionId}");

            // Parse order code từ description/addInfo
            var orderCode = ExtractOrderCodeFromDescription(webhook.Description);
            if (string.IsNullOrEmpty(orderCode))
            {
                throw new AppException("Không tìm thấy mã đơn hàng trong giao dịch.");
            }

            var order = await _db.Orders
                .Include(o => o.Store)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode);

            if (order == null)
            {
                throw new NotFoundException($"Không tìm thấy đơn hàng {orderCode}.");
            }

            // Kiểm tra đơn đã thanh toán chưa (tránh duplicate)
            if (order.Status == OrderStatus.Paid)
            {
                _logger.LogWarning($"Order {orderCode} already paid. Ignoring webhook.");
                var existingPayment = await _db.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == order.OrderId && p.Status == PaymentStatuses.Completed);

                return new PaymentResultDto
                {
                    PaymentId = existingPayment?.PaymentId ?? 0,
                    OrderId = order.OrderId,
                    Method = PaymentMethods.VietQR,
                    Amount = order.TotalAmount,
                    Status = PaymentStatuses.Completed,
                    Message = "Đơn hàng đã được thanh toán trước đó."
                };
            }

            // Kiểm tra số tiền khớp
            if (webhook.Amount < order.TotalAmount)
            {
                throw new AppException($"Số tiền chuyển khoản ({webhook.Amount:N0}đ) không đủ. Cần thanh toán: {order.TotalAmount:N0}đ");
            }

            // Tìm và cập nhật payment record
            var payment = await _db.Payments
                .FirstOrDefaultAsync(p => p.OrderId == order.OrderId && p.Status == PaymentStatuses.Pending);

            if (payment == null)
            {
                // Tạo mới nếu chưa có
                payment = new Payment
                {
                    OrderId = order.OrderId,
                    Method = PaymentMethods.VietQR,
                    Amount = webhook.Amount,
                    TransactionRef = webhook.TransactionId,
                    Status = PaymentStatuses.Completed,
                    PaidAt = webhook.TransactionTime,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Payments.Add(payment);
            }
            else
            {
                payment.Amount = webhook.Amount;
                payment.TransactionRef = webhook.TransactionId;
                payment.Status = PaymentStatuses.Completed;
                payment.PaidAt = webhook.TransactionTime;
            }

            await _db.SaveChangesAsync();

            // Cập nhật trạng thái đơn hàng
            await _orderService.UpdateStatusAsync(order.OrderId, OrderStatus.Paid, null);

            // Tự động trừ kho
            try
            {
                await _inventoryService.DeductInventoryForOrderAsync(order.OrderId, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to deduct inventory for order {orderCode}");
            }

            _logger.LogInformation($"Successfully processed VietQR payment for order {orderCode}");

            return new PaymentResultDto
            {
                PaymentId = payment.PaymentId,
                OrderId = order.OrderId,
                Method = payment.Method,
                Amount = payment.Amount,
                Status = payment.Status,
                Message = "Thanh toán thành công qua VietQR."
            };
        }

        /// <summary>
        /// Lấy thông tin payment đang chờ cho order
        /// </summary>
        public async Task<VietQRPaymentDto?> GetPendingPaymentByOrderIdAsync(int orderId)
        {
            var payment = await _db.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o!.Store)
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Status == PaymentStatuses.Pending);

            if (payment?.Order == null) return null;

            return MapToVietQRDto(payment, payment.Order);
        }

        /// <summary>
        /// Verify webhook signature (nếu ngân hàng cung cấp)
        /// </summary>
        public Task<bool> VerifyWebhookSignatureAsync(VietQRWebhookDto webhook, string signature)
        {
            // Implement signature verification based on bank's documentation
            // For now, return true (trong production cần implement đúng)
            // Example: HMAC SHA256 với secret key
            
            // var secretKey = _configuration["VietQR:WebhookSecret"];
            // var computedSignature = ComputeHMACSHA256(webhook, secretKey);
            // return computedSignature == signature;

            return Task.FromResult(true);
        }

        private static VietQRPaymentDto MapToVietQRDto(Payment payment, Order order)
        {
            var store = order.Store;
            
            // Generate VietQR URL
            // Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={INFO}&accountName={NAME}
            var qrUrl = $"https://img.vietqr.io/image/{store?.BankName ?? "970415"}-{store?.BankAccount}-compact2.png" +
                       $"?amount={order.TotalAmount}" +
                       $"&addInfo={Uri.EscapeDataString(order.OrderCode)}" +
                       $"&accountName={Uri.EscapeDataString(store?.BankAccountName ?? "WebCafe")}";

            return new VietQRPaymentDto
            {
                PaymentId = payment.PaymentId,
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                Amount = order.TotalAmount,
                BankAccount = store?.BankAccount ?? string.Empty,
                BankName = store?.BankName ?? string.Empty,
                AccountName = store?.BankAccountName ?? string.Empty,
                TransferContent = order.OrderCode,
                QrCodeUrl = qrUrl,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                ExpiresAt = payment.CreatedAt.AddMinutes(15) // QR hết hạn sau 15 phút
            };
        }

        private static string ExtractOrderCodeFromDescription(string description)
        {
            // VietQR thường gửi description dạng: "OD-260913-1234" hoặc "Thanh toan OD-260913-1234"
            // Extract order code pattern: OD-YYMMDD-XXXX
            var match = System.Text.RegularExpressions.Regex.Match(description, @"OD-\d{6}-\d{4}");
            return match.Success ? match.Value : string.Empty;
        }
    }

    // DTOs
    public class VietQRPaymentDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string BankAccount { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string TransferContent { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class VietQRWebhookDto
    {
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionTime { get; set; }
        public string BankAccount { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
    }
}
