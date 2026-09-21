using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Analytics;
using WebCafe.Backend.Models.DTOs.Auth;
using WebCafe.Backend.Models.DTOs.Menu;
using WebCafe.Backend.Models.DTOs.Order;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.DTOs.Table;
using WebCafe.Backend.Models.DTOs.Voucher;
using WebCafe.Backend.Services.Abstraction;
using WebCafe.Backend.Services.Implementation;
using Microsoft.Extensions.Logging;

namespace WebCafe.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly WebCafeDbContext _db;

        public AuthController(IAuthService authService, WebCafeDbContext db)
        {
            _authService = authService;
            _db = db;
        }

        // TEMPORARY: Generate BCrypt hash for password reset
        [HttpGet("generate-hash")]
        public IActionResult GenerateHash([FromQuery] string password = "Admin@123")
        {
            var hash = WebCafe.Backend.Common.Helper.SecurityHelper.HashPassword(password);
            return Ok(new {
                password = password,
                bcryptHash = hash,
                sqlCommands = new {
                    systemAdmin = $"UPDATE SystemAdmins SET PasswordHash = '{hash}' WHERE Username = 'superadmin';",
                    owner = $"UPDATE Tenants SET OwnerPasswordHash = '{hash}' WHERE OwnerEmail = 'minh@minhcafe.vn';",
                    staff = $"UPDATE Staff SET PasswordHash = '{hash}' WHERE Email = 'staff.q1@thecoffeehouse.vn';"
                }
            });
        }
        
        // TEMPORARY: Test password verification
        [HttpPost("test-verify")]
        public async Task<IActionResult> TestVerify([FromBody] TestVerifyRequest request)
        {
            var admin = await _db.SystemAdmins.FirstOrDefaultAsync(a => a.Username == request.Username);
            if (admin == null)
            {
                return Ok(new { 
                    found = false, 
                    message = "User not found" 
                });
            }
            
            var isValid = WebCafe.Backend.Common.Helper.SecurityHelper.VerifyPassword(request.Password, admin.PasswordHash);
            
            return Ok(new {
                found = true,
                username = admin.Username,
                isActive = admin.IsActive,
                passwordMatch = isValid,
                hashInDb = admin.PasswordHash,
                hashLength = admin.PasswordHash?.Length ?? 0,
                testPassword = request.Password
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            var res = await _authService.LoginStaffAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập nhân viên thành công."));
        }

        [HttpPost("owner-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> OwnerLogin([FromBody] LoginRequest request)
        {
            var res = await _authService.LoginTenantOwnerAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập chủ quán thành công."));
        }

        [HttpPost("admin-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> AdminLogin([FromBody] LoginRequest request)
        {
            var res = await _authService.LoginSystemAdminAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập quản trị viên thành công."));
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest request)
        {
            var res = await _authService.RegisterCustomerAsync(request);
            return Ok(ApiResponse<RegisterResponse>.Ok(res, "Đăng ký tài khoản thành công."));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuItemService _menuService;
        private readonly ICategoryService _categoryService;

        public MenuController(IMenuItemService menuService, ICategoryService categoryService)
        {
            _menuService = menuService;
            _categoryService = categoryService;
        }

        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<ApiResponse<StoreMenuResponse>>> GetMenuByStore(int storeId)
        {
            var menu = await _menuService.GetMenuByStoreAsync(storeId);
            return Ok(ApiResponse<StoreMenuResponse>.Ok(menu));
        }

        [HttpGet("categories/tenant/{tenantId}")]
        public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories(int tenantId)
        {
            var cats = await _categoryService.GetCategoriesByTenantAsync(tenantId);
            return Ok(ApiResponse<List<CategoryDto>>.Ok(cats));
        }

        [HttpPost("categories/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(int tenantId, [FromBody] CreateCategoryDto dto)
        {
            var cat = await _categoryService.CreateCategoryAsync(tenantId, dto);
            return Ok(ApiResponse<CategoryDto>.Ok(cat, "Thêm danh mục thành công."));
        }

        [HttpGet("items/tenant/{tenantId}")]
        public async Task<ActionResult<ApiResponse<List<MenuItemDto>>>> GetMenuItems(int tenantId, [FromQuery] int? categoryId)
        {
            var items = await _menuService.GetMenuItemsByTenantAsync(tenantId, categoryId);
            return Ok(ApiResponse<List<MenuItemDto>>.Ok(items));
        }

        [HttpGet("items/{id}")]
        public async Task<ActionResult<ApiResponse<MenuItemDto>>> GetMenuItemById(int id)
        {
            var item = await _menuService.GetByIdAsync(id);
            if (item == null) return NotFound(ApiResponse<MenuItemDto>.Fail("Không tìm thấy món."));
            return Ok(ApiResponse<MenuItemDto>.Ok(item));
        }

        [HttpPost("items/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<MenuItemDto>>> CreateMenuItem(int tenantId, [FromBody] CreateMenuItemDto dto)
        {
            var item = await _menuService.CreateAsync(tenantId, dto);
            return Ok(ApiResponse<MenuItemDto>.Ok(item, "Tạo món thành công."));
        }

        [HttpPut("items/{id}/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<MenuItemDto>>> UpdateMenuItem(int id, int tenantId, [FromBody] CreateMenuItemDto dto)
        {
            var item = await _menuService.UpdateAsync(tenantId, id, dto);
            return Ok(ApiResponse<MenuItemDto>.Ok(item, "Cập nhật món thành công."));
        }

        [HttpDelete("items/{id}/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteMenuItem(int id, int tenantId)
        {
            await _menuService.DeleteAsync(tenantId, id);
            return Ok(ApiResponse<object>.Ok(new { }, "Xóa món thành công."));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TablesController : ControllerBase
    {
        private readonly ITableService _tableService;

        public TablesController(ITableService tableService)
        {
            _tableService = tableService;
        }

        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<ApiResponse<List<TableDto>>>> GetTablesByStore(int storeId)
        {
            var tables = await _tableService.GetTablesByStoreAsync(storeId);
            return Ok(ApiResponse<List<TableDto>>.Ok(tables));
        }

        [HttpPost]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<TableDto>>> CreateTable([FromBody] CreateTableDto dto)
        {
            var table = await _tableService.CreateTableAsync(dto);
            return Ok(ApiResponse<TableDto>.Ok(table, "Thêm bàn mới thành công."));
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<TableDto>>> UpdateStatus(int id, [FromBody] UpdateTableStatusDto dto)
        {
            var table = await _tableService.UpdateStatusAsync(id, dto.Status);
            return Ok(ApiResponse<TableDto>.Ok(table, "Cập nhật trạng thái bàn thành công."));
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteTable(int id)
        {
            await _tableService.DeleteTableAsync(id);
            return Ok(ApiResponse<object>.Ok(new { }, "Xóa bàn thành công."));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var order = await _orderService.CreateOrderAsync(dto);
            return Ok(ApiResponse<OrderDto>.Ok(order, "Đặt món thành công!"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderById(int id)
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null) return NotFound(ApiResponse<OrderDto>.Fail("Không tìm thấy đơn hàng."));
            return Ok(ApiResponse<OrderDto>.Ok(order));
        }

        [HttpGet("code/{code}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderByCode(string code)
        {
            var order = await _orderService.GetByCodeAsync(code);
            if (order == null) return NotFound(ApiResponse<OrderDto>.Fail("Không tìm thấy đơn hàng."));
            return Ok(ApiResponse<OrderDto>.Ok(order));
        }

        [HttpGet("active/store/{storeId}")]
        public async Task<ActionResult<ApiResponse<List<OrderDto>>>> GetActiveOrders(int storeId)
        {
            var orders = await _orderService.GetActiveOrdersByStoreAsync(storeId);
            return Ok(ApiResponse<List<OrderDto>>.Ok(orders));
        }

        [HttpGet("store/{storeId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<PaginationRes<OrderDto>>>> SearchOrders(int storeId, [FromQuery] PagedReq req, [FromQuery] string? status)
        {
            var orders = await _orderService.SearchOrdersAsync(storeId, req, status);
            return Ok(ApiResponse<PaginationRes<OrderDto>>.Ok(orders));
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            int? staffId = null;
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdStr, out var sId)) staffId = sId;

            var order = await _orderService.UpdateStatusAsync(id, dto.Status, staffId);
            return Ok(ApiResponse<OrderDto>.Ok(order, "Cập nhật trạng thái đơn thành công."));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IVietQRPaymentService _vietQRPaymentService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            IPaymentService paymentService, 
            IVietQRPaymentService vietQRPaymentService,
            ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _vietQRPaymentService = vietQRPaymentService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<PaymentResultDto>>> ProcessPayment([FromBody] CreatePaymentDto dto)
        {
            int? staffId = null;
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdStr, out var sId)) staffId = sId;

            var result = await _paymentService.ProcessPaymentAsync(dto, staffId);
            return Ok(ApiResponse<PaymentResultDto>.Ok(result, "Thanh toán thành công."));
        }

        [HttpPost("vietqr/create")]
        public async Task<ActionResult<ApiResponse<VietQRPaymentDto>>> CreateVietQRPayment([FromBody] CreateVietQRPaymentRequest request)
        {
            var payment = await _vietQRPaymentService.CreateVietQRPaymentAsync(request.OrderId);
            return Ok(ApiResponse<VietQRPaymentDto>.Ok(payment, "Đã tạo mã QR thanh toán."));
        }

        [HttpGet("vietqr/status/{orderId}")]
        public async Task<ActionResult<ApiResponse<VietQRPaymentDto>>> GetVietQRPaymentStatus(int orderId)
        {
            var payment = await _vietQRPaymentService.GetPendingPaymentByOrderIdAsync(orderId);
            if (payment == null)
            {
                return NotFound(ApiResponse<VietQRPaymentDto>.Fail("Không tìm thấy giao dịch thanh toán."));
            }
            return Ok(ApiResponse<VietQRPaymentDto>.Ok(payment));
        }

        [HttpPost("vietqr/webhook")]
        [AllowAnonymous] // Webhook từ ngân hàng không có authentication
        public async Task<IActionResult> VietQRWebhook([FromBody] VietQRWebhookDto webhook, [FromHeader(Name = "X-Signature")] string? signature)
        {
            try
            {
                _logger.LogInformation($"VietQR Webhook received: {webhook.TransactionId}");

                // Verify signature nếu có
                if (!string.IsNullOrEmpty(signature))
                {
                    var isValid = await _vietQRPaymentService.VerifyWebhookSignatureAsync(webhook, signature);
                    if (!isValid)
                    {
                        _logger.LogWarning("Invalid webhook signature");
                        return Unauthorized(new { message = "Invalid signature" });
                    }
                }

                var result = await _vietQRPaymentService.ProcessWebhookAsync(webhook);
                
                return Ok(new 
                { 
                    success = true, 
                    message = "Webhook processed successfully",
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing VietQR webhook");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class CreateVietQRPaymentRequest
    {
        public int OrderId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpPost("check")]
        public async Task<ActionResult<ApiResponse<VoucherValidationResult>>> CheckVoucher([FromBody] CheckVoucherRequest request)
        {
            var result = await _voucherService.ValidateVoucherAsync(request);
            if (!result.IsValid)
            {
                return BadRequest(ApiResponse<VoucherValidationResult>.Fail(result.Message, null));
            }
            return Ok(ApiResponse<VoucherValidationResult>.Ok(result, result.Message));
        }

        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<ApiResponse<List<VoucherDto>>>> GetActiveVouchers(int storeId, [FromQuery] int tenantId)
        {
            var vouchers = await _voucherService.GetActiveVouchersAsync(tenantId, storeId);
            return Ok(ApiResponse<List<VoucherDto>>.Ok(vouchers));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("dashboard/store/{storeId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboard(int storeId)
        {
            var stats = await _analyticsService.GetDashboardStatsAsync(storeId);
            return Ok(ApiResponse<DashboardStatsDto>.Ok(stats));
        }

        [HttpGet("revenue/store/{storeId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<RevenueReportDto>>> GetRevenueReport(
            int storeId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var report = await _analyticsService.GetRevenueReportAsync(storeId, fromDate, toDate);
            return Ok(ApiResponse<RevenueReportDto>.Ok(report));
        }

        [HttpGet("customers/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<CustomerAnalyticsDto>>> GetCustomerAnalytics(
            int tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var analytics = await _analyticsService.GetCustomerAnalyticsAsync(tenantId, fromDate, toDate);
            return Ok(ApiResponse<CustomerAnalyticsDto>.Ok(analytics));
        }

        [HttpGet("categories/tenant/{tenantId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<List<CategoryPerformanceDto>>>> GetCategoryPerformance(
            int tenantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var performance = await _analyticsService.GetCategoryPerformanceAsync(tenantId, fromDate, toDate);
            return Ok(ApiResponse<List<CategoryPerformanceDto>>.Ok(performance));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpGet("combos/tenant/{tenantId}")]
        public async Task<ActionResult<ApiResponse<List<RecommendedComboDto>>>> GetRecommendedCombos(
            int tenantId,
            [FromQuery] int top = 5)
        {
            var combos = await _recommendationService.GetRecommendedCombosAsync(tenantId, top);
            return Ok(ApiResponse<List<RecommendedComboDto>>.Ok(combos, "Gợi ý combo dựa trên dữ liệu mua hàng."));
        }

        [HttpGet("popular/store/{storeId}")]
        public async Task<ActionResult<ApiResponse<List<MenuItemRecommendationDto>>>> GetPopularItems(
            int storeId,
            [FromQuery] int top = 10)
        {
            var items = await _recommendationService.GetPopularItemsAsync(storeId, top);
            return Ok(ApiResponse<List<MenuItemRecommendationDto>>.Ok(items, "Các món bán chạy nhất."));
        }

        [HttpGet("personalized/customer/{customerId}/store/{storeId}")]
        public async Task<ActionResult<ApiResponse<List<MenuItemRecommendationDto>>>> GetPersonalizedRecommendations(
            int customerId,
            int storeId,
            [FromQuery] int top = 5)
        {
            var recommendations = await _recommendationService.GetPersonalizedRecommendationsAsync(customerId, storeId, top);
            return Ok(ApiResponse<List<MenuItemRecommendationDto>>.Ok(recommendations, "Gợi ý dành riêng cho bạn."));
        }

        [HttpGet("frequently-bought-together/tenant/{tenantId}/item/{menuItemId}")]
        public async Task<ActionResult<ApiResponse<List<FrequentPairDto>>>> GetFrequentlyBoughtTogether(
            int tenantId,
            int menuItemId,
            [FromQuery] int top = 3)
        {
            var pairs = await _recommendationService.GetFrequentlyBoughtTogetherAsync(tenantId, menuItemId, top);
            return Ok(ApiResponse<List<FrequentPairDto>>.Ok(pairs, "Khách hàng thường mua kèm."));
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("store/{storeId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<List<InventoryStockDto>>>> GetInventory(int storeId)
        {
            var stocks = await _inventoryService.GetInventoryByStoreAsync(storeId);
            return Ok(ApiResponse<List<InventoryStockDto>>.Ok(stocks));
        }

        [HttpPost("import")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> ImportInventory([FromBody] ImportInventoryDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? staffId = int.TryParse(userIdStr, out var sId) ? sId : null;

            await _inventoryService.ImportInventoryAsync(dto.StoreId, dto.IngredientId, dto.Quantity, staffId, dto.Note);
            return Ok(ApiResponse<object>.Ok(new { }, "Nhập kho thành công."));
        }

        [HttpPost("adjust")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> AdjustInventory([FromBody] AdjustInventoryDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? staffId = int.TryParse(userIdStr, out var sId) ? sId : null;

            await _inventoryService.AdjustInventoryAsync(dto.StoreId, dto.IngredientId, dto.NewQuantity, staffId, dto.Note);
            return Ok(ApiResponse<object>.Ok(new { }, "Điều chỉnh kho thành công."));
        }

        [HttpGet("transactions/store/{storeId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<List<InventoryTransactionDto>>>> GetTransactions(
            int storeId, 
            [FromQuery] int? ingredientId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var transactions = await _inventoryService.GetTransactionHistoryAsync(storeId, ingredientId, fromDate, toDate);
            return Ok(ApiResponse<List<InventoryTransactionDto>>.Ok(transactions));
        }
    }

    public class ImportInventoryDto
    {
        public int StoreId { get; set; }
        public int IngredientId { get; set; }
        public decimal Quantity { get; set; }
        public string? Note { get; set; }
    }

    public class AdjustInventoryDto
    {
        public int StoreId { get; set; }
        public int IngredientId { get; set; }
        public decimal NewQuantity { get; set; }
        public string? Note { get; set; }
    }
}




// Temporary DTO for testing password verification
namespace WebCafe.Backend.Controllers
{
    public class TestVerifyRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
