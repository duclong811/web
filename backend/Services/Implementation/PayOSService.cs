using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Hubs;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Order;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.Entities;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public class PayOSService : IPayOSService
    {
        private static readonly ConcurrentDictionary<int, PayOSPaymentDto> _paymentLinkCache = new();
        private readonly WebCafeDbContext _db;
        private readonly PayOSClient _defaultPayOS;
        private readonly IOrderNotificationService _notificationService;
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<PayOSService> _logger;

        public PayOSService(
            WebCafeDbContext db,
            PayOSClient defaultPayOS,
            IOrderNotificationService notificationService,
            IInventoryService inventoryService,
            ILogger<PayOSService> logger)
        {
            _db = db;
            _defaultPayOS = defaultPayOS;
            _notificationService = notificationService;
            _inventoryService = inventoryService;
            _logger = logger;
        }

        public async Task<PayOSPaymentDto> CreatePaymentLinkAsync(int orderId, string? orderCode = null, string? returnUrl = null, string? cancelUrl = null)
        {
            var order = await _db.Orders
                .Include(o => o.Store)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .FirstOrDefaultAsync(o => (orderId > 0 && o.OrderId == orderId) || (!string.IsNullOrEmpty(orderCode) && o.OrderCode == orderCode));

            if (order == null)
            {
                throw new NotFoundException("Không tìm thấy đơn hàng.");
            }

            orderId = order.OrderId;

            if (order.Status == OrderStatus.Paid || order.Status == OrderStatus.Confirmed || order.Status == OrderStatus.Completed)
            {
                _logger.LogInformation("Order {OrderId} is already paid ({Status}), returning PAID status DTO.", orderId, order.Status);
                if (_paymentLinkCache.TryGetValue(orderId, out var cachedPaidDto))
                {
                    cachedPaidDto.Status = "PAID";
                    return cachedPaidDto;
                }

                return new PayOSPaymentDto
                {
                    PaymentId = 0,
                    OrderId = order.OrderId,
                    OrderCode = order.OrderCode,
                    PayOSOrderCode = GeneratePayOSOrderCode(order.OrderId),
                    Amount = order.TotalAmount,
                    Status = "PAID",
                    AccountNumber = order.Store?.BankAccount,
                    AccountName = order.Store?.BankAccountName ?? "WebCafe",
                    Description = $"WC {order.OrderCode.Replace("-", "")}",
                    CreatedAt = order.CreatedAt
                };
            }

            // 0. Nếu đã tạo payment link và còn trong cache, tái sử dụng ngay để tránh gọi PayOS trùng lặp
            if (_paymentLinkCache.TryGetValue(orderId, out var cachedDto))
            {
                _logger.LogInformation("Returning cached PayOS payment link for OrderId {OrderId}, PayOSOrderCode {PayOSCode}", 
                    orderId, cachedDto.PayOSOrderCode);
                return cachedDto;
            }

            // Chọn client PayOS: Ưu tiên tài khoản riêng của Quán, fallback về mặc định hệ thống
            PayOSClient payOsClient = GetPayOSClientForStore(order.Store);

            // Tạo orderCode dạng số duy nhất cho PayOS
            long payOsOrderCode = GeneratePayOSOrderCode(order.OrderId);

            // Ràng buộc PayOS: Description tối đa 20 ký tự
            string cleanCode = order.OrderCode.Replace("-", "");
            string description = $"WC {cleanCode}";
            if (description.Length > 20)
            {
                description = description.Substring(0, 20);
            }

            var items = order.OrderItems.Select(oi => new PaymentLinkItem
            {
                Name = oi.MenuItem?.Name ?? "Món",
                Quantity = oi.Quantity,
                Price = (int)oi.UnitPrice
            }).ToList();

            if (!items.Any())
            {
                items.Add(new PaymentLinkItem { Name = "WebCafe Order", Quantity = 1, Price = (int)order.TotalAmount });
            }

            // Default URLs
            string effectiveReturnUrl = !string.IsNullOrWhiteSpace(returnUrl) 
                ? returnUrl 
                : $"http://localhost:5173/order-success?orderId={order.OrderId}&orderCode={order.OrderCode}&status=PAID";
            string effectiveCancelUrl = !string.IsNullOrWhiteSpace(cancelUrl) 
                ? cancelUrl 
                : $"http://localhost:5173/cart?orderId={order.OrderId}&status=CANCELLED";

            var paymentData = new CreatePaymentLinkRequest
            {
                OrderCode = payOsOrderCode,
                Amount = (int)order.TotalAmount,
                Description = description,
                Items = items,
                CancelUrl = effectiveCancelUrl,
                ReturnUrl = effectiveReturnUrl
            };

            _logger.LogInformation("Creating PayOS payment link for OrderId {OrderId}, PayOSOrderCode {PayOSCode}, Store {StoreId}, Amount {Amount}", 
                order.OrderId, payOsOrderCode, order.StoreId, order.TotalAmount);

            CreatePaymentLinkResponse result = null!;
            int maxRetries = 3;
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    result = await payOsClient.PaymentRequests.CreateAsync(paymentData);
                    break;
                }
                catch (PayOS.Exceptions.ApiException ex) when (attempt < maxRetries && (ex.Message.Contains("tồn tại") || ex.Message.Contains("exists") || ex.Message.Contains("already")))
                {
                    _logger.LogWarning("PayOS order code {Code} collision on attempt {Attempt}. Generating fresh code and retrying...", payOsOrderCode, attempt);
                    payOsOrderCode = GeneratePayOSOrderCode(order.OrderId);
                    paymentData.OrderCode = payOsOrderCode;
                }
            }

            // Lưu hoặc cập nhật Payment record trong cơ sở dữ liệu
            var existingPayment = await _db.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Method == PaymentMethods.PayOS);

            if (existingPayment != null)
            {
                existingPayment.TransactionRef = payOsOrderCode.ToString();
                existingPayment.Amount = order.TotalAmount;
                existingPayment.Status = PaymentStatuses.Pending;
                existingPayment.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                existingPayment = new Payment
                {
                    OrderId = order.OrderId,
                    Method = PaymentMethods.PayOS,
                    Amount = order.TotalAmount,
                    TransactionRef = payOsOrderCode.ToString(),
                    Status = PaymentStatuses.Pending,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Payments.Add(existingPayment);
            }

            await _db.SaveChangesAsync();

            var dto = new PayOSPaymentDto
            {
                PaymentId = existingPayment.PaymentId,
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                PayOSOrderCode = payOsOrderCode,
                Amount = order.TotalAmount,
                Status = PaymentStatuses.Pending,
                CheckoutUrl = result.CheckoutUrl,
                QrCode = result.QrCode,
                PaymentLinkId = result.PaymentLinkId,
                AccountNumber = result.AccountNumber,
                AccountName = result.AccountName,
                Bin = result.Bin,
                Description = description,
                StoreBankAccount = order.Store?.BankAccount,
                StoreBankName = order.Store?.BankName,
                CreatedAt = existingPayment.CreatedAt
            };

            // Lưu vào memory cache để các lần gọi sau từ cùng đơn hàng được trả về ngay lập tức
            _paymentLinkCache[order.OrderId] = dto;

            return dto;
        }

        public async Task<PayOSStatusCheckDto> GetPaymentStatusAsync(long orderCode)
        {
            try
            {
                var payment = await _db.Payments
                    .Include(p => p.Order)
                        .ThenInclude(o => o!.Store)
                    .FirstOrDefaultAsync(p => p.TransactionRef == orderCode.ToString());

                // Sử dụng client của quán hoặc fallback
                PayOSClient payOsClient = GetPayOSClientForStore(payment?.Order?.Store);

                PaymentLink info = await payOsClient.PaymentRequests.GetAsync(orderCode);

                bool isPaid = info.Status == PaymentLinkStatus.Paid || info.Status.ToString().Equals("PAID", StringComparison.OrdinalIgnoreCase);

                if (isPaid && payment != null && payment.Status != PaymentStatuses.Completed)
                {
                    // Tự động sync trạng thái nếu PayOS đã thanh toán nhưng DB chưa update (xử lý khi Webhook không vào được localhost)
                    payment.Status = PaymentStatuses.Completed;
                    payment.PaidAt = DateTime.UtcNow;

                    if (payment.Order != null)
                    {
                        // Kích hoạt đơn hàng, trừ kho, báo chuông cho Bếp và chuyển bàn sang bận
                        await ActivateOrderAfterPaymentAsync(payment.Order);
                    }

                    await _db.SaveChangesAsync();
                    _logger.LogInformation("Synced PAID status -> CONFIRMED order status for PayOS OrderCode {OrderCode} via Polling", orderCode);
                }

                return new PayOSStatusCheckDto
                {
                    OrderCode = orderCode,
                    OrderId = payment?.OrderId ?? 0,
                    Status = info.Status.ToString(),
                    Amount = info.Amount,
                    AmountPaid = info.AmountPaid,
                    AmountRemaining = info.AmountRemaining,
                    IsSuccess = isPaid,
                    Message = isPaid ? "Thanh toán thành công" : $"Trạng thái giao dịch: {info.Status}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking PayOS status for code {OrderCode}", orderCode);
                return new PayOSStatusCheckDto
                {
                    OrderCode = orderCode,
                    Status = "ERROR",
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<PaymentResultDto> ProcessWebhookAsync(Webhook webhook)
        {
            _logger.LogInformation("Processing PayOS webhook...");

            WebhookData? data = null;

            // Thử xác thực với default client trước
            try
            {
                data = await _defaultPayOS.Webhooks.VerifyAsync(webhook);
            }
            catch
            {
                // Nếu default client verify không khớp, thử tìm payment theo orderCode để lấy Store client tương ứng
                if (webhook.Data != null && webhook.Data.OrderCode > 0)
                {
                    var p = await _db.Payments
                        .Include(x => x.Order)
                            .ThenInclude(o => o!.Store)
                        .FirstOrDefaultAsync(x => x.TransactionRef == webhook.Data.OrderCode.ToString());

                    if (p?.Order?.Store != null)
                    {
                        var storeClient = GetPayOSClientForStore(p.Order.Store);
                        data = await storeClient.Webhooks.VerifyAsync(webhook);
                    }
                }
            }

            if (data == null)
            {
                _logger.LogWarning("Invalid PayOS webhook signature");
                throw new AppException("Dữ liệu Webhook không hợp lệ hoặc chữ ký sai.");
            }

            _logger.LogInformation("Valid PayOS Webhook received for OrderCode {OrderCode}, Amount {Amount}, Ref {Ref}",
                data.OrderCode, data.Amount, data.Reference);

            var payment = await _db.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.TransactionRef == data.OrderCode.ToString());

            if (payment == null)
            {
                _logger.LogWarning("Payment record not found for PayOS orderCode {OrderCode}", data.OrderCode);
                return new PaymentResultDto
                {
                    Status = PaymentStatuses.Pending,
                    Message = "Không tìm thấy Payment tương ứng nhưng Webhook đã xác thực."
                };
            }

            if (payment.Status == PaymentStatuses.Completed)
            {
                _logger.LogInformation("Payment for OrderCode {OrderCode} already processed.", data.OrderCode);
                return new PaymentResultDto
                {
                    PaymentId = payment.PaymentId,
                    OrderId = payment.OrderId,
                    Method = PaymentMethods.PayOS,
                    Amount = payment.Amount,
                    Status = PaymentStatuses.Completed,
                    Message = "Giao dịch đã được xử lý trước đó."
                };
            }

            // Cập nhật trạng thái Payment và kích hoạt đơn hàng chính thức sang Bếp
            payment.Status = PaymentStatuses.Completed;
            payment.PaidAt = DateTime.UtcNow;

            if (payment.Order != null)
            {
                await ActivateOrderAfterPaymentAsync(payment.Order);
            }

            await _db.SaveChangesAsync();

            return new PaymentResultDto
            {
                PaymentId = payment.PaymentId,
                OrderId = payment.OrderId,
                Method = PaymentMethods.PayOS,
                Amount = payment.Amount,
                Status = PaymentStatuses.Completed,
                Message = "Thanh toán PayOS thành công."
            };
        }

        public async Task<PaymentLink> CancelPaymentLinkAsync(long orderCode, string? reason = null)
        {
            _logger.LogInformation("Cancelling PayOS payment link for {OrderCode}", orderCode);

            var payment = await _db.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o!.Store)
                .FirstOrDefaultAsync(p => p.TransactionRef == orderCode.ToString());

            PayOSClient client = GetPayOSClientForStore(payment?.Order?.Store);
            var result = await client.PaymentRequests.CancelAsync(orderCode, reason ?? "Khách hủy đơn hàng");

            if (payment != null && payment.Status == PaymentStatuses.Pending)
            {
                payment.Status = PaymentStatuses.Failed;
                await _db.SaveChangesAsync();
                _paymentLinkCache.TryRemove(payment.OrderId, out _);
            }

            return result;
        }

        public async Task<StorePaymentConfigDto> GetStorePaymentConfigAsync(int storeId)
        {
            var store = await _db.Stores.FirstOrDefaultAsync(s => s.StoreId == storeId);
            if (store == null)
            {
                throw new NotFoundException("Không tìm thấy cửa hàng.");
            }

            bool hasCustom = !string.IsNullOrWhiteSpace(store.PayOSClientId) &&
                             !string.IsNullOrWhiteSpace(store.PayOSApiKey) &&
                             !string.IsNullOrWhiteSpace(store.PayOSChecksumKey);

            return new StorePaymentConfigDto
            {
                StoreId = store.StoreId,
                StoreName = store.Name,
                HasCustomPayOS = hasCustom,
                PayOSClientId = store.PayOSClientId,
                MaskedApiKey = MaskSecretKey(store.PayOSApiKey),
                MaskedChecksumKey = MaskSecretKey(store.PayOSChecksumKey),
                BankAccount = store.BankAccount,
                BankName = store.BankName,
                BankAccountName = store.BankAccountName
            };
        }

        public async Task<StorePaymentConfigDto> UpdateStorePaymentConfigAsync(int storeId, UpdateStorePaymentConfigDto dto)
        {
            var store = await _db.Stores.FirstOrDefaultAsync(s => s.StoreId == storeId);
            if (store == null)
            {
                throw new NotFoundException("Không tìm thấy cửa hàng.");
            }

            // Nếu người dùng nhập ClientId mới
            if (!string.IsNullOrWhiteSpace(dto.PayOSClientId))
            {
                store.PayOSClientId = dto.PayOSClientId.Trim();
            }

            // Nếu người dùng nhập ApiKey mới (không phải chuỗi mask đã có)
            if (!string.IsNullOrWhiteSpace(dto.PayOSApiKey) && !dto.PayOSApiKey.StartsWith("***"))
            {
                store.PayOSApiKey = dto.PayOSApiKey.Trim();
            }

            // Nếu người dùng nhập ChecksumKey mới
            if (!string.IsNullOrWhiteSpace(dto.PayOSChecksumKey) && !dto.PayOSChecksumKey.StartsWith("***"))
            {
                store.PayOSChecksumKey = dto.PayOSChecksumKey.Trim();
            }

            if (dto.BankAccount != null) store.BankAccount = dto.BankAccount.Trim();
            if (dto.BankName != null) store.BankName = dto.BankName.Trim();
            if (dto.BankAccountName != null) store.BankAccountName = dto.BankAccountName.Trim();

            await _db.SaveChangesAsync();
            _logger.LogInformation("Updated payment config for Store {StoreId}", storeId);

            return await GetStorePaymentConfigAsync(storeId);
        }

        public async Task<TestPaymentConfigResultDto> TestStorePaymentConfigAsync(TestStorePaymentConfigRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ClientId) ||
                string.IsNullOrWhiteSpace(request.ApiKey) ||
                string.IsNullOrWhiteSpace(request.ChecksumKey))
            {
                return new TestPaymentConfigResultDto
                {
                    IsValid = false,
                    Message = "Vui lòng nhập đầy đủ Client ID, API Key và Checksum Key."
                };
            }

            try
            {
                var testClient = new PayOSClient(request.ClientId.Trim(), request.ApiKey.Trim(), request.ChecksumKey.Trim());

                // Thử tạo một link thanh toán test ngẫu nhiên hoặc kiểm tra tính hợp lệ
                long testCode = GeneratePayOSOrderCode(999);
                var testData = new CreatePaymentLinkRequest
                {
                    OrderCode = testCode,
                    Amount = 2000,
                    Description = "Test Connection",
                    Items = new List<PaymentLinkItem>
                    {
                        new PaymentLinkItem { Name = "Test Connection", Quantity = 1, Price = 2000 }
                    },
                    CancelUrl = "http://localhost:5173/cancel",
                    ReturnUrl = "http://localhost:5173/success"
                };

                CreatePaymentLinkResponse res = await testClient.PaymentRequests.CreateAsync(testData);

                // Sau khi tạo test thành công, hủy ngay link test để không tồn tại
                try
                {
                    await testClient.PaymentRequests.CancelAsync(testCode, "Hủy đơn test kết nối");
                }
                catch
                {
                    // Ignore cancel error for test
                }

                return new TestPaymentConfigResultDto
                {
                    IsValid = true,
                    Message = "Kết nối PayOS thành công! Cổng thanh toán hoạt động hoàn hảo.",
                    AccountName = res.AccountName,
                    AccountNumber = res.AccountNumber
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "PayOS Test Connection Failed");
                return new TestPaymentConfigResultDto
                {
                    IsValid = false,
                    Message = $"Kết nối PayOS thất bại: {ex.Message}"
                };
            }
        }

        private PayOSClient GetPayOSClientForStore(Store? store)
        {
            if (store != null &&
                !string.IsNullOrWhiteSpace(store.PayOSClientId) &&
                !string.IsNullOrWhiteSpace(store.PayOSApiKey) &&
                !string.IsNullOrWhiteSpace(store.PayOSChecksumKey))
            {
                _logger.LogInformation("Using Store-specific PayOS credentials for Store {StoreId}", store.StoreId);
                return new PayOSClient(store.PayOSClientId.Trim(), store.PayOSApiKey.Trim(), store.PayOSChecksumKey.Trim());
            }

            _logger.LogInformation("Using default system PayOS credentials");
            return _defaultPayOS;
        }

        private static string? MaskSecretKey(string? secret)
        {
            if (string.IsNullOrWhiteSpace(secret)) return null;
            if (secret.Length <= 8) return "********";
            return $"***{secret.Substring(secret.Length - 4)}";
        }

        private static long GeneratePayOSOrderCode(int orderId)
        {
            // Sử dụng mili-giây và random jitter để không bao giờ bị trùng orderCode trên PayOS
            long ms = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() % 1000000000;
            int rand = Random.Shared.Next(10, 99);
            return (ms * 100) + rand;
        }

        /// <summary>
        /// Mô hình 1 (Anti-Spam & Pay-First):
        /// Chỉ khi khách thanh toán PayOS thành công:
        /// 1. Chuyển trạng thái đơn sang 'confirmed'
        /// 2. Tự động trừ kho nguyên vật liệu
        /// 3. Bắn SignalR chính thức thông báo đơn mới tới Bếp kèm chuông reo
        /// 4. Đổi trạng thái bàn sang bận (Occupied)
        /// 5. Báo khách hàng biết đơn đã được tiếp nhận
        /// </summary>
        private async Task ActivateOrderAfterPaymentAsync(Order order)
        {
            order.Status = OrderStatus.Confirmed;
            order.UpdatedAt = DateTime.UtcNow;

            // Xóa cache payment link khi đã thanh toán thành công
            _paymentLinkCache.TryRemove(order.OrderId, out _);

            // 1. Tự động trừ kho nguyên liệu
            try
            {
                await _inventoryService.DeductInventoryForOrderAsync(order.OrderId, null);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to deduct inventory for order {OrderId}", order.OrderId);
            }

            // 2. Tải chi tiết đơn để kích hoạt gửi sang Bếp chính thức (Mô hình 1: Pay-first)
            var fullOrder = await _db.Orders
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.OrderItemToppings).ThenInclude(oit => oit.Topping)
                .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

            if (fullOrder != null)
            {
                var orderDto = new OrderDto
                {
                    OrderId = fullOrder.OrderId,
                    TenantId = fullOrder.TenantId,
                    StoreId = fullOrder.StoreId,
                    StoreName = fullOrder.Store?.Name ?? string.Empty,
                    OrderCode = fullOrder.OrderCode,
                    TableId = fullOrder.TableId,
                    TableNumber = fullOrder.Table?.TableNumber,
                    CustomerId = fullOrder.CustomerId,
                    CustomerName = fullOrder.Customer?.Name ?? fullOrder.GuestName,
                    CustomerPhone = fullOrder.Customer?.Phone ?? fullOrder.GuestPhone,
                    GuestId = fullOrder.GuestId,
                    GuestName = fullOrder.GuestName,
                    GuestPhone = fullOrder.GuestPhone,
                    Status = fullOrder.Status,
                    SubTotal = fullOrder.SubTotal,
                    DiscountAmount = fullOrder.DiscountAmount,
                    PointsUsed = fullOrder.PointsUsed,
                    PointsEarned = fullOrder.PointsEarned,
                    TotalAmount = fullOrder.TotalAmount,
                    Note = fullOrder.Note,
                    CreatedAt = DateTime.SpecifyKind(fullOrder.CreatedAt, DateTimeKind.Utc),
                    Items = fullOrder.OrderItems.Select(i => new OrderItemDto
                    {
                        OrderItemId = i.OrderItemId,
                        MenuItemId = i.MenuItemId,
                        MenuItemName = i.MenuItem?.Name ?? string.Empty,
                        ImageUrl = i.MenuItem?.ImageUrl,
                        SizeId = i.SizeId,
                        SizeName = i.Size?.Name,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        ToppingTotal = i.ToppingTotal,
                        SubTotal = i.SubTotal,
                        SugarLevel = i.SugarLevel,
                        IceLevel = i.IceLevel,
                        Note = i.Note,
                        Toppings = i.OrderItemToppings.Select(t => new OrderItemToppingDto
                        {
                            OrderItemToppingId = t.OrderItemToppingId,
                            ToppingId = t.ToppingId,
                            ToppingName = t.Topping?.Name ?? string.Empty,
                            Price = t.Price
                        }).ToList()
                    }).ToList()
                };

                // Gửi SignalR thông báo đơn mới tới Bếp kèm chuông
                await _notificationService.NotifyNewOrderAsync(fullOrder.StoreId, orderDto);

                // Chuyển trạng thái bàn sang Occupied
                if (fullOrder.Table != null)
                {
                    fullOrder.Table.Status = TableStatuses.Occupied;
                    await _notificationService.NotifyTableStatusChangedAsync(fullOrder.StoreId, fullOrder.Table.TableId, TableStatuses.Occupied);
                }
            }

            // 3. Bắn SignalR realtime cho khách cập nhật trạng thái đã thanh toán
            await _notificationService.NotifyOrderStatusChangedAsync(
                order.StoreId,
                order.TableId,
                order.OrderId,
                OrderStatus.Confirmed,
                order.OrderCode
            );
        }
    }
}
