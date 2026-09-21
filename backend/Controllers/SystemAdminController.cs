using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Helper;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.SystemAdmin;
using WebCafe.Backend.Models.Entities;

namespace WebCafe.Backend.Controllers
{
    [ApiController]
    [Route("api/system")]
    [Authorize(Policy = "SystemAdminOnly")]
    public class SystemAdminController : ControllerBase
    {
        private readonly WebCafeDbContext _db;
        private readonly ILogger<SystemAdminController> _logger;

        public SystemAdminController(WebCafeDbContext db, ILogger<SystemAdminController> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Lấy thống kê tổng quan toàn sàn SaaS
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<PlatformStatsDto>>> GetPlatformStats()
        {
            var totalTenants = await _db.Tenants.CountAsync();
            var activeTenants = await _db.Tenants.CountAsync(t => t.IsActive);
            var totalStores = await _db.Stores.CountAsync();
            var totalTables = await _db.Tables.CountAsync();
            var totalOrders = await _db.Orders.CountAsync();
            var totalGmv = await _db.Orders
                .Where(o => o.Status == "paid" || o.Status == "ready" || o.Status == "served")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

            // Tính ước tính doanh thu thuê bao phần mềm dựa trên gói
            var tenants = await _db.Tenants.ToListAsync();
            decimal subscriptionRevenue = 0;
            foreach (var t in tenants)
            {
                if (!t.IsActive) continue;
                subscriptionRevenue += (t.Plan?.ToLower()) switch
                {
                    "premium" or "enterprise" => 1500000m,
                    "pro" or "standard" => 790000m,
                    _ => 290000m
                };
            }

            var stats = new PlatformStatsDto
            {
                TotalTenants = totalTenants,
                ActiveTenants = activeTenants,
                TotalStores = totalStores,
                TotalTables = totalTables,
                TotalOrders = totalOrders,
                TotalGmv = totalGmv,
                MonthlySubscriptionRevenue = subscriptionRevenue
            };

            return Ok(ApiResponse<PlatformStatsDto>.Ok(stats, "Lấy thống kê nền tảng thành công."));
        }

        /// <summary>
        /// Lấy danh sách tất cả các quán cafe đối tác trên hệ thống
        /// </summary>
        [HttpGet("tenants")]
        public async Task<ActionResult<ApiResponse<List<TenantDetailDto>>>> GetTenants()
        {
            var tenants = await _db.Tenants
                .Include(t => t.Stores)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var tenantIds = tenants.Select(t => t.TenantId).ToList();

            // Đếm số bàn và số đơn hàng theo từng tenant
            var tablesPerTenant = await _db.Tables
                .Include(tb => tb.Store)
                .Where(tb => tb.Store != null && tenantIds.Contains(tb.Store.TenantId))
                .GroupBy(tb => tb.Store!.TenantId)
                .Select(g => new { TenantId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TenantId, x => x.Count);

            var ordersPerTenant = await _db.Orders
                .Where(o => tenantIds.Contains(o.TenantId))
                .GroupBy(o => o.TenantId)
                .Select(g => new 
                { 
                    TenantId = g.Key, 
                    Count = g.Count(), 
                    Gmv = g.Where(x => x.Status == "paid" || x.Status == "ready" || x.Status == "served").Sum(x => (decimal?)x.TotalAmount) ?? 0m 
                })
                .ToDictionaryAsync(x => x.TenantId, x => new { x.Count, x.Gmv });

            var result = tenants.Select(t =>
            {
                var tableCount = tablesPerTenant.ContainsKey(t.TenantId) ? tablesPerTenant[t.TenantId] : 0;
                var orderData = ordersPerTenant.ContainsKey(t.TenantId) ? ordersPerTenant[t.TenantId] : new { Count = 0, Gmv = 0m };

                return new TenantDetailDto
                {
                    TenantId = t.TenantId,
                    Name = t.Name,
                    Slug = t.Slug,
                    OwnerName = t.OwnerName,
                    OwnerEmail = t.OwnerEmail,
                    OwnerPhone = t.OwnerPhone,
                    LogoUrl = t.LogoUrl,
                    Plan = t.Plan,
                    MaxStores = t.MaxStores,
                    IsActive = t.IsActive,
                    CreatedAt = t.CreatedAt,
                    StoreCount = t.Stores?.Count ?? 0,
                    TableCount = tableCount,
                    OrderCount = orderData.Count,
                    TotalGmv = orderData.Gmv
                };
            }).ToList();

            return Ok(ApiResponse<List<TenantDetailDto>>.Ok(result, "Lấy danh sách quán đối tác thành công."));
        }

        /// <summary>
        /// Tạo một quán cafe đối tác mới kèm tài khoản Chủ quán (Owner)
        /// </summary>
        [HttpPost("tenants")]
        public async Task<ActionResult<ApiResponse<TenantDetailDto>>> CreateTenant([FromBody] CreateTenantRequest request)
        {
            // 1. Kiểm tra trùng email
            var existingTenant = await _db.Tenants
                .FirstOrDefaultAsync(t => t.OwnerEmail.ToLower() == request.OwnerEmail.Trim().ToLower());
            if (existingTenant != null)
            {
                return BadRequest(ApiResponse<TenantDetailDto>.Fail("Email chủ quán này đã tồn tại trong hệ thống."));
            }

            var slug = string.IsNullOrWhiteSpace(request.Slug)
                ? request.Name.ToLower().Replace(" ", "-").Replace("/", "-")
                : request.Slug.Trim().ToLower();

            // 2. Tạo Tenant mới
            var tenant = new Tenant
            {
                Name = request.Name.Trim(),
                Slug = slug,
                OwnerName = request.OwnerName.Trim(),
                OwnerEmail = request.OwnerEmail.Trim().ToLower(),
                OwnerPhone = request.OwnerPhone.Trim(),
                OwnerPasswordHash = SecurityHelper.HashPassword(request.OwnerPassword.Trim()),
                LogoUrl = request.LogoUrl ?? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&q=80",
                Plan = request.Plan ?? "basic",
                MaxStores = request.MaxStores > 0 ? request.MaxStores : 1,
                PointsPerAmount = 10000,
                PointsToMoney = 200,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync();

            // 3. Tạo chi nhánh đầu tiên mặc định cho quán
            var store = new Store
            {
                TenantId = tenant.TenantId,
                Name = request.InitialStoreName ?? $"{tenant.Name} - Chi Nhánh 1",
                Address = request.InitialStoreAddress ?? "Địa chỉ chính",
                Phone = request.InitialStorePhone ?? tenant.OwnerPhone,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Stores.Add(store);
            await _db.SaveChangesAsync();

            // 4. Tạo sẵn các bàn mẫu (T01 - T06) cho chi nhánh mới
            for (int i = 1; i <= 6; i++)
            {
                _db.Tables.Add(new Table
                {
                    StoreId = store.StoreId,
                    TableNumber = $"T0{i}",
                    Capacity = 4,
                    Status = "Available",
                    QRCodeUrl = $"/qr?store={store.StoreId}&table=T0{i}",
                    IsActive = true
                });
            }
            await _db.SaveChangesAsync();

            _logger.LogInformation("SuperAdmin đã tạo thành công quán đối tác mới: {Name} (ID: {Id})", tenant.Name, tenant.TenantId);

            var detailDto = new TenantDetailDto
            {
                TenantId = tenant.TenantId,
                Name = tenant.Name,
                Slug = tenant.Slug,
                OwnerName = tenant.OwnerName,
                OwnerEmail = tenant.OwnerEmail,
                OwnerPhone = tenant.OwnerPhone,
                LogoUrl = tenant.LogoUrl,
                Plan = tenant.Plan,
                MaxStores = tenant.MaxStores,
                IsActive = tenant.IsActive,
                CreatedAt = tenant.CreatedAt,
                StoreCount = 1,
                TableCount = 6,
                OrderCount = 0,
                TotalGmv = 0
            };

            return Ok(ApiResponse<TenantDetailDto>.Ok(detailDto, "Tạo quán cafe đối tác mới thành công."));
        }

        /// <summary>
        /// Bật hoặc Tắt trạng thái hoạt động (Khóa / Mở khóa) của quán đối tác
        /// </summary>
        [HttpPut("tenants/{id}/toggle-status")]
        public async Task<ActionResult<ApiResponse<object>>> ToggleTenantStatus(int id)
        {
            var tenant = await _db.Tenants.FindAsync(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy quán cafe với mã đã cung cấp."));
            }

            tenant.IsActive = !tenant.IsActive;
            await _db.SaveChangesAsync();

            var statusStr = tenant.IsActive ? "kích hoạt mở lại" : "tạm ngưng dịch vụ";
            _logger.LogInformation("SuperAdmin đã {Status} quán {Name} (ID: {Id})", statusStr, tenant.Name, tenant.TenantId);

            return Ok(ApiResponse<object>.Ok(new { tenant.TenantId, tenant.IsActive }, $"Đã {statusStr} quán '{tenant.Name}'."));
        }

        /// <summary>
        /// Cập nhật gói cước dịch vụ và số chi nhánh tối đa
        /// </summary>
        [HttpPut("tenants/{id}/plan")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateTenantPlan(int id, [FromBody] UpdateTenantPlanRequest request)
        {
            var tenant = await _db.Tenants.FindAsync(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy quán cafe với mã đã cung cấp."));
            }

            tenant.Plan = request.Plan.ToLower();
            tenant.MaxStores = request.MaxStores;
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { tenant.TenantId, tenant.Plan, tenant.MaxStores }, $"Cập nhật gói dịch vụ quán '{tenant.Name}' thành công."));
        }
    }
}
