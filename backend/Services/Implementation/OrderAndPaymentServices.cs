using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Hubs;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Analytics;
using WebCafe.Backend.Models.DTOs.Order;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.DTOs.Voucher;
using WebCafe.Backend.Models.Entities;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public class VoucherService : IVoucherService
    {
        private readonly WebCafeDbContext _db;

        public VoucherService(WebCafeDbContext db)
        {
            _db = db;
        }

        public async Task<VoucherValidationResult> ValidateVoucherAsync(CheckVoucherRequest request)
        {
            var code = request.Code.Trim().ToUpper();
            var store = await _db.Stores.FindAsync(request.StoreId);
            if (store == null) return new VoucherValidationResult { IsValid = false, Message = "Chi nhánh không hợp lệ." };

            var voucher = await _db.Vouchers
                .FirstOrDefaultAsync(v => v.TenantId == store.TenantId && v.Code == code && v.IsActive);

            if (voucher == null)
            {
                return new VoucherValidationResult { IsValid = false, Message = "Mã voucher không tồn tại." };
            }

            var now = DateTime.UtcNow;
            if (now < voucher.StartDate || now > voucher.EndDate)
            {
                return new VoucherValidationResult { IsValid = false, Message = "Mã voucher đã hết hạn hoặc chưa đến ngày áp dụng." };
            }

            if (voucher.StoreId.HasValue && voucher.StoreId.Value != request.StoreId)
            {
                return new VoucherValidationResult { IsValid = false, Message = "Voucher không áp dụng cho chi nhánh này." };
            }

            if (voucher.MaxUsageTotal.HasValue && voucher.UsedCount >= voucher.MaxUsageTotal.Value)
            {
                return new VoucherValidationResult { IsValid = false, Message = "Mã voucher đã hết lượt sử dụng." };
            }

            if (request.OrderAmount < voucher.MinOrderAmount)
            {
                return new VoucherValidationResult
                {
                    IsValid = false,
                    Message = $"Đơn hàng tối thiểu phải từ {voucher.MinOrderAmount:N0}đ để áp dụng voucher này."
                };
            }

            decimal discount = 0;
            if (voucher.DiscountType == DiscountTypes.Percent)
            {
                discount = (request.OrderAmount * voucher.DiscountValue) / 100m;
                if (voucher.MaxDiscount.HasValue && discount > voucher.MaxDiscount.Value)
                {
                    discount = voucher.MaxDiscount.Value;
                }
            }
            else
            {
                discount = voucher.DiscountValue;
            }

            if (discount > request.OrderAmount) discount = request.OrderAmount;

            return new VoucherValidationResult
            {
                IsValid = true,
                Message = "Áp dụng voucher thành công!",
                VoucherId = voucher.VoucherId,
                Code = voucher.Code,
                Title = voucher.Title,
                DiscountType = voucher.DiscountType,
                DiscountAmount = discount,
                FinalAmount = request.OrderAmount - discount
            };
        }

        public async Task<List<VoucherDto>> GetActiveVouchersAsync(int tenantId, int? storeId)
        {
            var now = DateTime.UtcNow;
            return await _db.Vouchers
                .Where(v => v.TenantId == tenantId && v.IsActive && v.StartDate <= now && v.EndDate >= now
                            && (!v.StoreId.HasValue || (storeId.HasValue && v.StoreId == storeId.Value)))
                .Select(v => new VoucherDto
                {
                    VoucherId = v.VoucherId,
                    Code = v.Code,
                    Title = v.Title,
                    Description = v.Description,
                    DiscountType = v.DiscountType,
                    DiscountValue = v.DiscountValue,
                    MaxDiscount = v.MaxDiscount,
                    MinOrderAmount = v.MinOrderAmount,
                    EndDate = v.EndDate
                })
                .ToListAsync();
        }
    }

    public class OrderService : IOrderService
    {
        private readonly WebCafeDbContext _db;
        private readonly IVoucherService _voucherService;
        private readonly IOrderNotificationService _notificationService;

        public OrderService(WebCafeDbContext db, IVoucherService voucherService, IOrderNotificationService notificationService)
        {
            _db = db;
            _voucherService = voucherService;
            _notificationService = notificationService;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                throw new ModelValidationException("Items", "Đơn hàng phải có ít nhất 1 món.");
            }

            var store = await _db.Stores
                .Include(s => s.Tenant)
                .FirstOrDefaultAsync(s => s.StoreId == dto.StoreId && s.IsActive);

            if (store == null || store.Tenant == null)
            {
                throw new NotFoundException("Chi nhánh không tồn tại.");
            }

            // 1. Kiểm tra Bàn
            Table? table = null;
            if (dto.TableId.HasValue)
            {
                table = await _db.Tables.FirstOrDefaultAsync(t => t.TableId == dto.TableId.Value && t.StoreId == dto.StoreId);
                if (table != null)
                {
                    table.Status = TableStatuses.Occupied;
                }
            }

            // 2. Xử lý Khách hàng & Điểm thưởng
            Customer? customer = null;
            if (!string.IsNullOrWhiteSpace(dto.CustomerPhone))
            {
                var phone = dto.CustomerPhone.Trim();
                customer = await _db.Customers.FirstOrDefaultAsync(c => c.TenantId == store.TenantId && c.Phone == phone);
                if (customer == null)
                {
                    customer = new Customer
                    {
                        TenantId = store.TenantId,
                        Phone = phone,
                        Name = dto.CustomerName?.Trim() ?? "Khách hàng",
                        TotalPoints = 0,
                        VisitCount = 1,
                        CreatedAt = DateTime.UtcNow,
                        LastVisitAt = DateTime.UtcNow
                    };
                    _db.Customers.Add(customer);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    customer.VisitCount += 1;
                    customer.LastVisitAt = DateTime.UtcNow;
                    if (!string.IsNullOrWhiteSpace(dto.CustomerName))
                    {
                        customer.Name = dto.CustomerName.Trim();
                    }
                }
            }

            // 3. Tính toán tiền các Items
            decimal subTotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in dto.Items)
            {
                var menuItem = await _db.MenuItems
                    .Include(m => m.MenuItemSizes)
                    .Include(m => m.MenuItemToppings).ThenInclude(mt => mt.Topping)
                    .FirstOrDefaultAsync(m => m.MenuItemId == itemDto.MenuItemId && m.TenantId == store.TenantId);

                if (menuItem == null) throw new NotFoundException($"Không tìm thấy món với ID {itemDto.MenuItemId}.");

                decimal unitPrice = menuItem.BasePrice;
                if (itemDto.SizeId.HasValue)
                {
                    var sizeOption = menuItem.MenuItemSizes.FirstOrDefault(s => s.SizeId == itemDto.SizeId.Value);
                    if (sizeOption != null)
                    {
                        unitPrice += sizeOption.ExtraPrice;
                    }
                }

                decimal toppingTotal = 0;
                var itemToppings = new List<OrderItemTopping>();
                if (itemDto.Toppings != null && itemDto.Toppings.Any())
                {
                    foreach (var t in itemDto.Toppings)
                    {
                        var topping = await _db.Toppings.FirstOrDefaultAsync(x => x.ToppingId == t.ToppingId && x.TenantId == store.TenantId);
                        if (topping != null && topping.IsAvailable)
                        {
                            toppingTotal += topping.Price;
                            itemToppings.Add(new OrderItemTopping
                            {
                                ToppingId = topping.ToppingId,
                                Price = topping.Price
                            });
                        }
                    }
                }

                decimal itemSubTotal = (unitPrice + toppingTotal) * itemDto.Quantity;
                subTotal += itemSubTotal;

                orderItems.Add(new OrderItem
                {
                    MenuItemId = menuItem.MenuItemId,
                    SizeId = itemDto.SizeId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = unitPrice,
                    ToppingTotal = toppingTotal,
                    SubTotal = itemSubTotal,
                    SugarLevel = itemDto.SugarLevel,
                    IceLevel = itemDto.IceLevel,
                    Note = itemDto.Note,
                    OrderItemToppings = itemToppings
                });
            }

            // 4. Áp dụng Voucher
            decimal discountAmount = 0;
            Voucher? appliedVoucher = null;
            if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
            {
                var vResult = await _voucherService.ValidateVoucherAsync(new CheckVoucherRequest
                {
                    Code = dto.VoucherCode,
                    StoreId = dto.StoreId,
                    OrderAmount = subTotal,
                    CustomerPhone = dto.CustomerPhone
                });

                if (vResult.IsValid && vResult.VoucherId.HasValue)
                {
                    discountAmount = vResult.DiscountAmount;
                    appliedVoucher = await _db.Vouchers.FindAsync(vResult.VoucherId.Value);
                    if (appliedVoucher != null)
                    {
                        appliedVoucher.UsedCount += 1;
                    }
                }
            }

            // 5. Tính giảm giá theo điểm tích lũy
            int pointsUsed = 0;
            decimal pointsDiscount = 0;
            if (customer != null && dto.PointsToUse > 0 && customer.TotalPoints >= dto.PointsToUse)
            {
                pointsUsed = dto.PointsToUse;
                pointsDiscount = pointsUsed * store.Tenant.PointsToMoney;
                customer.TotalPoints -= pointsUsed;

                _db.LoyaltyPoints.Add(new LoyaltyPoint
                {
                    CustomerId = customer.CustomerId,
                    Points = -pointsUsed,
                    Type = "redeem",
                    Description = "Sử dụng điểm giảm giá đơn hàng"
                });
            }

            decimal totalDiscount = discountAmount + pointsDiscount;
            if (totalDiscount > subTotal) totalDiscount = subTotal;
            decimal totalAmount = subTotal - totalDiscount;

            // 6. Tính điểm tích lũy sau đơn
            int pointsEarned = 0;
            if (store.Tenant.PointsPerAmount > 0)
            {
                pointsEarned = (int)(totalAmount / store.Tenant.PointsPerAmount);
            }

            var orderCode = $"OD-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";

            var order = new Order
            {
                TenantId = store.TenantId,
                StoreId = store.StoreId,
                OrderCode = orderCode,
                TableId = dto.TableId,
                CustomerId = customer?.CustomerId,
                Status = OrderStatus.Pending,
                SubTotal = subTotal,
                DiscountAmount = totalDiscount,
                PointsUsed = pointsUsed,
                PointsEarned = pointsEarned,
                TotalAmount = totalAmount,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Ghi nhận VoucherUsage
            if (appliedVoucher != null)
            {
                _db.VoucherUsages.Add(new VoucherUsage
                {
                    VoucherId = appliedVoucher.VoucherId,
                    CustomerId = customer?.CustomerId,
                    OrderId = order.OrderId,
                    DiscountAmount = discountAmount,
                    UsedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }

            var resultDto = (await GetByIdAsync(order.OrderId))!;

            // Gửi SignalR Realtime đến Bếp / Thu ngân của Store
            await _notificationService.NotifyNewOrderAsync(store.StoreId, resultDto);
            if (table != null)
            {
                await _notificationService.NotifyTableStatusChangedAsync(store.StoreId, table.TableId, TableStatuses.Occupied);
            }

            return resultDto;
        }

        public async Task<OrderDto?> GetByIdAsync(int orderId)
        {
            var o = await _db.Orders
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.OrderItemToppings).ThenInclude(oit => oit.Topping)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (o == null) return null;
            return MapToDto(o);
        }

        public async Task<OrderDto?> GetByCodeAsync(string orderCode)
        {
            var o = await _db.Orders
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.OrderItemToppings).ThenInclude(oit => oit.Topping)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode);

            if (o == null) return null;
            return MapToDto(o);
        }

        public async Task<List<OrderDto>> GetActiveOrdersByStoreAsync(int storeId)
        {
            var today = DateTime.UtcNow.Date;
            var activeStatuses = new[] { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Preparing, OrderStatus.Ready, OrderStatus.Served };
            var orders = await _db.Orders
                .Where(o => o.StoreId == storeId && (activeStatuses.Contains(o.Status) || (o.Status == OrderStatus.Paid && o.CreatedAt >= today)))
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.OrderItemToppings).ThenInclude(oit => oit.Topping)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<PaginationRes<OrderDto>> SearchOrdersAsync(int storeId, PagedReq req, string? status = null)
        {
            var query = _db.Orders
                .Where(o => o.StoreId == storeId)
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.OrderItemToppings).ThenInclude(oit => oit.Topping)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                var s = req.Search.Trim();
                query = query.Where(o => o.OrderCode.Contains(s) || (o.Customer != null && o.Customer.Phone.Contains(s)));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((req.PageNumber - 1) * req.PageSize)
                .Take(req.PageSize)
                .ToListAsync();

            return new PaginationRes<OrderDto>(items.Select(MapToDto).ToList(), req.PageNumber, req.PageSize, total);
        }

        public async Task<OrderDto> UpdateStatusAsync(int orderId, string newStatus, int? staffId = null)
        {
            var order = await _db.Orders.Include(o => o.Table).FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null) throw new NotFoundException("Không tìm thấy đơn hàng.");

            order.Status = newStatus;
            order.UpdatedAt = DateTime.UtcNow;
            if (staffId.HasValue) order.StaffId = staffId.Value;

            // Nếu đơn đã thanh toán hoặc hủy, giải phóng bàn
            if (newStatus == OrderStatus.Paid || newStatus == OrderStatus.Cancelled)
            {
                if (order.Table != null)
                {
                    order.Table.Status = TableStatuses.Available;
                    await _notificationService.NotifyTableStatusChangedAsync(order.StoreId, order.Table.TableId, TableStatuses.Available);
                }

                // Tích điểm cho khách khi đơn hoàn tất
                if (newStatus == OrderStatus.Paid && order.CustomerId.HasValue && order.PointsEarned > 0)
                {
                    var customer = await _db.Customers.FindAsync(order.CustomerId.Value);
                    if (customer != null)
                    {
                        customer.TotalPoints += order.PointsEarned;
                        customer.TotalSpent += order.TotalAmount;
                        _db.LoyaltyPoints.Add(new LoyaltyPoint
                        {
                            CustomerId = customer.CustomerId,
                            OrderId = order.OrderId,
                            Points = order.PointsEarned,
                            Type = "earn",
                            Description = $"Tích điểm đơn hàng {order.OrderCode}"
                        });
                    }
                }
            }

            await _db.SaveChangesAsync();

            await _notificationService.NotifyOrderStatusChangedAsync(order.StoreId, order.TableId, order.OrderId, newStatus, order.OrderCode);

            return (await GetByIdAsync(order.OrderId))!;
        }

        private static OrderDto MapToDto(Order o)
        {
            return new OrderDto
            {
                OrderId = o.OrderId,
                TenantId = o.TenantId,
                StoreId = o.StoreId,
                StoreName = o.Store?.Name ?? string.Empty,
                OrderCode = o.OrderCode,
                TableId = o.TableId,
                TableNumber = o.Table?.TableNumber,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.Name,
                CustomerPhone = o.Customer?.Phone,
                Status = o.Status,
                SubTotal = o.SubTotal,
                DiscountAmount = o.DiscountAmount,
                PointsUsed = o.PointsUsed,
                PointsEarned = o.PointsEarned,
                TotalAmount = o.TotalAmount,
                Note = o.Note,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(i => new OrderItemDto
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
        }
    }

    public class PaymentService : IPaymentService
    {
        private readonly WebCafeDbContext _db;
        private readonly IOrderService _orderService;
        private readonly IInventoryService _inventoryService;

        public PaymentService(WebCafeDbContext db, IOrderService orderService, IInventoryService inventoryService)
        {
            _db = db;
            _orderService = orderService;
            _inventoryService = inventoryService;
        }

        public async Task<PaymentResultDto> ProcessPaymentAsync(CreatePaymentDto dto, int? staffId = null)
        {
            var order = await _db.Orders
                .Include(o => o.Store)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);

            if (order == null) throw new NotFoundException("Không tìm thấy đơn hàng.");

            var payment = new Payment
            {
                OrderId = order.OrderId,
                Method = dto.Method,
                Amount = dto.Amount > 0 ? dto.Amount : order.TotalAmount,
                TransactionRef = dto.TransactionRef ?? $"TXN-{DateTime.UtcNow:yyMMddHHmmss}",
                Status = PaymentStatuses.Completed,
                PaidAt = DateTime.UtcNow,
                ProcessedByStaffId = staffId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            // Cập nhật trạng thái đơn sang Paid
            await _orderService.UpdateStatusAsync(order.OrderId, OrderStatus.Paid, staffId);

            // TỰ ĐỘNG TRỪ KHO KHI THANH TOÁN THÀNH CÔNG
            try
            {
                await _inventoryService.DeductInventoryForOrderAsync(order.OrderId, staffId);
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng không block thanh toán
                // Có thể gửi notification để staff xử lý thủ công
                Console.WriteLine($"Warning: Failed to deduct inventory for order {order.OrderCode}: {ex.Message}");
            }

            string? qrUrl = null;
            if (dto.Method == PaymentMethods.VietQR && order.Store != null)
            {
                qrUrl = $"https://img.vietqr.io/image/{order.Store.BankName}-{order.Store.BankAccount}-compact2.png?amount={order.TotalAmount}&addInfo={order.OrderCode}&accountName={Uri.EscapeDataString(order.Store.BankAccountName ?? "WebCafe")}";
            }

            return new PaymentResultDto
            {
                PaymentId = payment.PaymentId,
                OrderId = order.OrderId,
                Method = payment.Method,
                Amount = payment.Amount,
                Status = payment.Status,
                QrCodeUrl = qrUrl
            };
        }
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly WebCafeDbContext _db;

        public AnalyticsService(WebCafeDbContext db)
        {
            _db = db;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int storeId)
        {
            var today = DateTime.UtcNow.Date;
            var todayOrders = await _db.Orders
                .Where(o => o.StoreId == storeId && o.CreatedAt >= today && o.Status == OrderStatus.Paid)
                .ToListAsync();

            var todayRevenue = todayOrders.Sum(o => o.TotalAmount);
            var todayOrderCount = todayOrders.Count;

            var tables = await _db.Tables.Where(t => t.StoreId == storeId && t.IsActive).ToListAsync();
            var totalTables = tables.Count;
            var occupiedTables = tables.Count(t => t.Status == TableStatuses.Occupied);
            var availableTables = totalTables - occupiedTables;

            var totalCustomers = await _db.Customers.CountAsync();

            // Top Products
            var topProducts = await _db.OrderItems
                .Where(oi => oi.Order != null && oi.Order.StoreId == storeId && oi.Order.Status == OrderStatus.Paid)
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem!.Name })
                .Select(g => new TopProductDto
                {
                    MenuItemId = g.Key.MenuItemId,
                    Name = g.Key.Name,
                    SoldCount = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal)
                })
                .OrderByDescending(x => x.SoldCount)
                .Take(5)
                .ToListAsync();

            // 7 Days Revenue
            var last7Days = DateTime.UtcNow.Date.AddDays(-6);
            var last7DaysOrders = await _db.Orders
                .Where(o => o.StoreId == storeId && o.CreatedAt >= last7Days && o.Status == OrderStatus.Paid)
                .ToListAsync();

            var revenueChart = new List<DailyRevenueDto>();
            for (int i = 0; i < 7; i++)
            {
                var date = last7Days.AddDays(i);
                var dateStr = date.ToString("dd/MM");
                var dayOrders = last7DaysOrders.Where(o => o.CreatedAt.Date == date).ToList();
                revenueChart.Add(new DailyRevenueDto
                {
                    Date = dateStr,
                    Revenue = dayOrders.Sum(o => o.TotalAmount),
                    OrdersCount = dayOrders.Count
                });
            }

            return new DashboardStatsDto
            {
                TodayRevenue = todayRevenue,
                TodayOrders = todayOrderCount,
                TotalCustomers = totalCustomers,
                AvailableTables = availableTables,
                OccupiedTables = occupiedTables,
                TopProducts = topProducts,
                RevenueChart = revenueChart
            };
        }

        public async Task<RevenueReportDto> GetRevenueReportAsync(int storeId, DateTime fromDate, DateTime toDate)
        {
            var orders = await _db.Orders
                .Where(o => o.StoreId == storeId && 
                           o.Status == OrderStatus.Paid &&
                           o.CreatedAt >= fromDate && 
                           o.CreatedAt <= toDate)
                .ToListAsync();

            var totalRevenue = orders.Sum(o => o.TotalAmount);
            var totalOrders = orders.Count;
            var totalDiscount = orders.Sum(o => o.DiscountAmount);
            var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Revenue by day
            var dailyRevenue = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key.ToString("dd/MM/yyyy"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrdersCount = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToList();

            // Revenue by payment method
            var paymentMethods = await _db.Payments
                .Where(p => orders.Select(o => o.OrderId).Contains(p.OrderId) && 
                           p.Status == PaymentStatuses.Completed)
                .GroupBy(p => p.Method)
                .Select(g => new PaymentMethodStatsDto
                {
                    Method = g.Key,
                    Count = g.Count(),
                    TotalAmount = g.Sum(p => p.Amount)
                })
                .ToListAsync();

            return new RevenueReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                TotalDiscount = totalDiscount,
                AverageOrderValue = avgOrderValue,
                DailyRevenue = dailyRevenue,
                PaymentMethodStats = paymentMethods
            };
        }

        public async Task<CustomerAnalyticsDto> GetCustomerAnalyticsAsync(int tenantId, DateTime fromDate, DateTime toDate)
        {
            var customers = await _db.Customers
                .Where(c => c.TenantId == tenantId)
                .ToListAsync();

            var newCustomers = customers.Count(c => c.CreatedAt >= fromDate && c.CreatedAt <= toDate);
            var activeCustomers = customers.Count(c => c.LastVisitAt >= fromDate && c.LastVisitAt <= toDate);

            // Top customers by spending
            var topCustomers = customers
                .Where(c => c.TotalSpent > 0)
                .OrderByDescending(c => c.TotalSpent)
                .Take(10)
                .Select(c => new TopCustomerDto
                {
                    CustomerId = c.CustomerId,
                    Name = c.Name ?? "Khách hàng",
                    Phone = c.Phone,
                    TotalSpent = c.TotalSpent,
                    VisitCount = c.VisitCount,
                    TotalPoints = c.TotalPoints
                })
                .ToList();

            // Customer retention rate
            var totalCustomers = customers.Count;
            var retentionRate = totalCustomers > 0 ? (double)activeCustomers / totalCustomers * 100 : 0;

            return new CustomerAnalyticsDto
            {
                TotalCustomers = totalCustomers,
                NewCustomers = newCustomers,
                ActiveCustomers = activeCustomers,
                RetentionRate = Math.Round(retentionRate, 2),
                TopCustomers = topCustomers
            };
        }

        public async Task<List<CategoryPerformanceDto>> GetCategoryPerformanceAsync(int tenantId, DateTime fromDate, DateTime toDate)
        {
            var categoryPerformance = await _db.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.MenuItem)
                    .ThenInclude(mi => mi!.Category)
                .Where(oi => oi.Order!.TenantId == tenantId &&
                            oi.Order.Status == OrderStatus.Paid &&
                            oi.Order.CreatedAt >= fromDate &&
                            oi.Order.CreatedAt <= toDate)
                .GroupBy(oi => new 
                { 
                    CategoryId = oi.MenuItem!.CategoryId, 
                    CategoryName = oi.MenuItem.Category!.Name 
                })
                .Select(g => new CategoryPerformanceDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal),
                    OrderCount = g.Select(x => x.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            return categoryPerformance;
        }
    }
}

