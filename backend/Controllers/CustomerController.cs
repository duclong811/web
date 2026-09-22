using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Order;

namespace WebCafe.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly WebCafeDbContext _db;

        public CustomerController(WebCafeDbContext db)
        {
            _db = db;
        }

        // GET api/customer/profile?phone=0901234567
        [HttpGet("profile")]
        public async Task<ActionResult<ApiResponse<CustomerProfileDto>>> GetProfile([FromQuery] string? phone)
        {
            var targetPhone = phone?.Trim();
            if (string.IsNullOrEmpty(targetPhone))
            {
                targetPhone = User.FindFirstValue(ClaimTypes.Name);
            }

            if (string.IsNullOrEmpty(targetPhone))
            {
                return BadRequest(ApiResponse<CustomerProfileDto>.Fail("Vui lòng cung cấp số điện thoại hoặc đăng nhập."));
            }

            var customer = await _db.Customers
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Phone == targetPhone);

            if (customer == null)
            {
                return NotFound(ApiResponse<CustomerProfileDto>.Fail("Không tìm thấy thông tin khách hàng."));
            }

            var pointsToMoney = customer.Tenant?.PointsToMoney ?? 200;
            var pointsPerAmount = customer.Tenant?.PointsPerAmount ?? 10000;

            var dto = new CustomerProfileDto
            {
                CustomerId = customer.CustomerId,
                TenantId = customer.TenantId,
                Phone = customer.Phone,
                Name = customer.Name ?? "Khách hàng",
                TotalPoints = customer.TotalPoints,
                TotalSpent = customer.TotalSpent,
                VisitCount = customer.VisitCount,
                PointsToMoney = pointsToMoney,
                PointsPerAmount = pointsPerAmount,
                CreatedAt = customer.CreatedAt,
                LastVisitAt = customer.LastVisitAt
            };

            return Ok(ApiResponse<CustomerProfileDto>.Ok(dto));
        }

        // PUT api/customer/profile
        [HttpPut("profile")]
        public async Task<ActionResult<ApiResponse<CustomerProfileDto>>> UpdateProfile([FromBody] UpdateCustomerProfileDto dto)
        {
            var targetPhone = dto.Phone?.Trim();
            if (string.IsNullOrEmpty(targetPhone))
            {
                targetPhone = User.FindFirstValue(ClaimTypes.Name);
            }

            if (string.IsNullOrEmpty(targetPhone))
            {
                return BadRequest(ApiResponse<CustomerProfileDto>.Fail("Vui lòng cung cấp số điện thoại hợp lệ."));
            }

            var customer = await _db.Customers
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Phone == targetPhone);

            if (customer == null)
            {
                return NotFound(ApiResponse<CustomerProfileDto>.Fail("Không tìm thấy khách hàng để cập nhật."));
            }

            // Chặn không cho đổi số điện thoại
            if (!string.IsNullOrWhiteSpace(dto.NewPhone) && dto.NewPhone != customer.Phone)
            {
                return BadRequest(ApiResponse<CustomerProfileDto>.Fail("Không được phép thay đổi số điện thoại tích điểm để bảo toàn quyền lợi của bạn."));
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                customer.Name = dto.Name.Trim();
            }

            await _db.SaveChangesAsync();

            var pointsToMoney = customer.Tenant?.PointsToMoney ?? 200;
            var pointsPerAmount = customer.Tenant?.PointsPerAmount ?? 10000;

            var res = new CustomerProfileDto
            {
                CustomerId = customer.CustomerId,
                TenantId = customer.TenantId,
                Phone = customer.Phone,
                Name = customer.Name ?? "Khách hàng",
                TotalPoints = customer.TotalPoints,
                TotalSpent = customer.TotalSpent,
                VisitCount = customer.VisitCount,
                PointsToMoney = pointsToMoney,
                PointsPerAmount = pointsPerAmount,
                CreatedAt = customer.CreatedAt,
                LastVisitAt = customer.LastVisitAt
            };

            return Ok(ApiResponse<CustomerProfileDto>.Ok(res, "Cập nhật thông tin thành công!"));
        }

        // GET api/customer/orders?phone=0901234567&pageNumber=1&pageSize=10&status=all
        [HttpGet("orders")]
        public async Task<ActionResult<ApiResponse<PaginationRes<OrderDto>>>> GetOrders(
            [FromQuery] string? phone,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null)
        {
            var targetPhone = phone?.Trim();
            if (string.IsNullOrEmpty(targetPhone))
            {
                targetPhone = User.FindFirstValue(ClaimTypes.Name);
            }

            if (string.IsNullOrEmpty(targetPhone))
            {
                return BadRequest(ApiResponse<PaginationRes<OrderDto>>.Fail("Vui lòng cung cấp số điện thoại hoặc đăng nhập."));
            }

            var query = _db.Orders
                .Include(o => o.Store)
                .Include(o => o.Table)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Size)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.OrderItemToppings)
                        .ThenInclude(oit => oit.Topping)
                .Where(o => (o.Customer != null && o.Customer.Phone == targetPhone) || o.GuestPhone == targetPhone)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                query = query.Where(o => o.Status.ToLower() == status.ToLower());
            }

            var totalRecords = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    TenantId = o.TenantId,
                    StoreId = o.StoreId,
                    StoreName = o.Store != null ? o.Store.Name : string.Empty,
                    OrderCode = o.OrderCode,
                    TableId = o.TableId,
                    TableNumber = o.Table != null ? o.Table.TableNumber : null,
                    CustomerId = o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.Name : o.GuestName,
                    CustomerPhone = o.Customer != null ? o.Customer.Phone : o.GuestPhone,
                    GuestId = o.GuestId,
                    GuestName = o.GuestName,
                    GuestPhone = o.GuestPhone,
                    Status = o.Status,
                    SubTotal = o.SubTotal,
                    DiscountAmount = o.DiscountAmount,
                    PointsUsed = o.PointsUsed,
                    PointsEarned = o.PointsEarned,
                    TotalAmount = o.TotalAmount,
                    Note = o.Note,
                    CreatedAt = o.CreatedAt,
                    Items = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        MenuItemId = oi.MenuItemId,
                        MenuItemName = oi.MenuItem != null ? oi.MenuItem.Name : "Món",
                        ImageUrl = oi.MenuItem != null ? oi.MenuItem.ImageUrl : null,
                        SizeId = oi.SizeId,
                        SizeName = oi.Size != null ? oi.Size.Name : null,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        ToppingTotal = oi.ToppingTotal,
                        SubTotal = oi.SubTotal,
                        SugarLevel = oi.SugarLevel,
                        IceLevel = oi.IceLevel,
                        Note = oi.Note,
                        Toppings = oi.OrderItemToppings.Select(oit => new OrderItemToppingDto
                        {
                            OrderItemToppingId = oit.OrderItemToppingId,
                            ToppingId = oit.ToppingId,
                            ToppingName = oit.Topping != null ? oit.Topping.Name : "Topping",
                            Price = oit.Price
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            var result = new PaginationRes<OrderDto>(orders, pageNumber, pageSize, totalRecords);
            return Ok(ApiResponse<PaginationRes<OrderDto>>.Ok(result));
        }

        // GET api/customer/loyalty-history
        [HttpGet("loyalty-history")]
        public async Task<ActionResult<ApiResponse<PaginationRes<CustomerLoyaltyHistoryDto>>>> GetLoyaltyHistory(
            [FromQuery] string? phone,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var targetPhone = phone?.Trim();
            if (string.IsNullOrEmpty(targetPhone))
            {
                targetPhone = User.FindFirstValue(ClaimTypes.Name);
            }

            if (string.IsNullOrEmpty(targetPhone))
            {
                return BadRequest(ApiResponse<PaginationRes<CustomerLoyaltyHistoryDto>>.Fail("Vui lòng cung cấp số điện thoại."));
            }

            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Phone == targetPhone);
            if (customer == null)
            {
                return NotFound(ApiResponse<PaginationRes<CustomerLoyaltyHistoryDto>>.Fail("Không tìm thấy khách hàng."));
            }

            var query = _db.LoyaltyPoints
                .Where(lp => lp.CustomerId == customer.CustomerId)
                .OrderByDescending(lp => lp.CreatedAt);

            var totalRecords = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(lp => new CustomerLoyaltyHistoryDto
                {
                    PointId = lp.PointId,
                    CustomerId = lp.CustomerId,
                    OrderId = lp.OrderId,
                    Points = lp.Points,
                    Type = lp.Type,
                    Description = lp.Description,
                    CreatedAt = lp.CreatedAt
                })
                .ToListAsync();

            var result = new PaginationRes<CustomerLoyaltyHistoryDto>(items, pageNumber, pageSize, totalRecords);
            return Ok(ApiResponse<PaginationRes<CustomerLoyaltyHistoryDto>>.Ok(result));
        }
    }

    public class CustomerProfileDto
    {
        public int CustomerId { get; set; }
        public int TenantId { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int TotalPoints { get; set; }
        public decimal TotalSpent { get; set; }
        public int VisitCount { get; set; }
        public decimal PointsToMoney { get; set; } = 200;
        public int PointsPerAmount { get; set; } = 10000;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastVisitAt { get; set; }
    }

    public class UpdateCustomerProfileDto
    {
        public string? Phone { get; set; }
        public string? NewPhone { get; set; }
        public string? Name { get; set; }
    }

    public class CustomerLoyaltyHistoryDto
    {
        public int PointId { get; set; }
        public int CustomerId { get; set; }
        public int? OrderId { get; set; }
        public int Points { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
