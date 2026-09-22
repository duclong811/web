using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Models.DTOs.Analytics;
using WebCafe.Backend.Models.DTOs.Auth;
using WebCafe.Backend.Models.DTOs.Menu;
using WebCafe.Backend.Models.DTOs.Order;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.DTOs.Table;
using WebCafe.Backend.Models.DTOs.Voucher;
using WebCafe.Backend.Models.DTOs.AI;
using WebCafe.Backend.Models.DTOs.Inventory;
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

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var res = await _authService.LoginStaffAsync(request);
                return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập nhân viên thành công."));
            }
            catch (Exception)
            {
                // Nếu không phải nhân viên, thử đăng nhập dưới dạng khách hàng
                try
                {
                    var customerRes = await _authService.LoginCustomerAsync(request);
                    return Ok(ApiResponse<LoginResponse>.Ok(customerRes, "Đăng nhập khách hàng thành công."));
                }
                catch (AppException appEx)
                {
                    return BadRequest(ApiResponse<LoginResponse>.Fail(appEx.Message));
                }
            }
        }

        [HttpPost("customer-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> CustomerLogin([FromBody] LoginRequest request)
        {
            try
            {
                var res = await _authService.LoginCustomerAsync(request);
                return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập khách hàng thành công."));
            }
            catch (AppException ex)
            {
                return BadRequest(ApiResponse<LoginResponse>.Fail(ex.Message));
            }
        }

        [HttpPost("owner-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> OwnerLogin([FromBody] LoginRequest request)
        {
            try
            {
                var res = await _authService.LoginTenantOwnerAsync(request);
                return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập chủ quán thành công."));
            }
            catch (AppException ex)
            {
                return BadRequest(ApiResponse<LoginResponse>.Fail(ex.Message));
            }
        }

        [HttpPost("admin-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> AdminLogin([FromBody] LoginRequest request)
        {
            try
            {
                var res = await _authService.LoginSystemAdminAsync(request);
                return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập quản trị viên thành công."));
            }
            catch (AppException ex)
            {
                return BadRequest(ApiResponse<LoginResponse>.Fail(ex.Message));
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var res = await _authService.RegisterCustomerAsync(request);
                return Ok(ApiResponse<RegisterResponse>.Ok(res, "Đăng ký tài khoản thành công."));
            }
            catch (AppException ex)
            {
                return BadRequest(ApiResponse<RegisterResponse>.Fail(ex.Message));
            }
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

        [HttpGet("ingredients")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<List<IngredientDto>>>> GetIngredients(
            [FromQuery] int tenantId = 1, 
            [FromQuery] int? storeId = null)
        {
            var list = await _inventoryService.GetIngredientsAsync(tenantId, storeId);
            return Ok(ApiResponse<List<IngredientDto>>.Ok(list));
        }

        [HttpPost("ingredients")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<IngredientDto>>> CreateIngredient([FromBody] CreateIngredientDto dto)
        {
            var result = await _inventoryService.CreateIngredientAsync(dto);
            return Ok(ApiResponse<IngredientDto>.Ok(result, "Tạo nguyên liệu thành công."));
        }

        [HttpPut("ingredients/{id}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<IngredientDto>>> UpdateIngredient(int id, [FromBody] UpdateIngredientDto dto)
        {
            var result = await _inventoryService.UpdateIngredientAsync(id, dto);
            return Ok(ApiResponse<IngredientDto>.Ok(result, "Cập nhật nguyên liệu thành công."));
        }

        [HttpDelete("ingredients/{id}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteIngredient(int id)
        {
            await _inventoryService.DeleteIngredientAsync(id);
            return Ok(ApiResponse<object>.Ok(new { }, "Xóa nguyên liệu thành công."));
        }

        [HttpGet("recipes/menu-item/{menuItemId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<List<MenuItemRecipeDto>>>> GetMenuItemRecipes(int menuItemId)
        {
            var recipes = await _inventoryService.GetMenuItemRecipesAsync(menuItemId);
            return Ok(ApiResponse<List<MenuItemRecipeDto>>.Ok(recipes));
        }

        [HttpPost("recipes/menu-item")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> UpsertRecipe([FromBody] UpsertRecipeDto dto)
        {
            await _inventoryService.UpsertMenuItemRecipeAsync(dto);
            return Ok(ApiResponse<object>.Ok(new { }, "Lưu định lượng công thức thành công."));
        }

        [HttpDelete("recipes/{recipeId}")]
        [Authorize(Policy = "ManagerAccess")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteRecipe(int recipeId)
        {
            await _inventoryService.DeleteMenuItemRecipeAsync(recipeId);
            return Ok(ApiResponse<object>.Ok(new { }, "Xóa nguyên liệu khỏi công thức thành công."));
        }

        [HttpGet("alerts/store/{storeId}")]
        [Authorize(Policy = "StaffAccess")]
        public async Task<ActionResult<ApiResponse<List<LowStockAlertDto>>>> GetLowStockAlerts(int storeId)
        {
            var alerts = await _inventoryService.GetLowStockAlertsAsync(storeId);
            return Ok(ApiResponse<List<LowStockAlertDto>>.Ok(alerts));
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

    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly ILogger<AIController> _logger;

        public AIController(IGeminiService geminiService, ILogger<AIController> logger)
        {
            _geminiService = geminiService;
            _logger = logger;
        }

        /// <summary>
        /// Gợi ý món ăn thông minh & cá nhân hóa sử dụng Google Gemini AI (với caching và statistical fallback)
        /// </summary>
        [HttpPost("recommend")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AiRecommendationResponseDto>>> GetSmartRecommendations([FromBody] AiRecommendationRequestDto request)
        {
            if (request.StoreId <= 0 && request.TenantId <= 0)
            {
                return BadRequest(ApiResponse<AiRecommendationResponseDto>.Fail("StoreId hoặc TenantId không hợp lệ."));
            }

            try
            {
                var recommendations = await _geminiService.GetSmartRecommendationsAsync(request);
                return Ok(ApiResponse<AiRecommendationResponseDto>.Ok(recommendations, "Lấy gợi ý món ăn thành công."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy AI recommendations");
                return StatusCode(500, ApiResponse<AiRecommendationResponseDto>.Fail($"Lỗi hệ thống khi xử lý gợi ý AI: {ex.Message}"));
            }
        }

        /// <summary>
        /// Trò chuyện tự do cùng AI Sommelier để tư vấn món ăn & đồ uống chuẩn vị
        /// </summary>
        [HttpPost("chat")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AiChatResponseDto>>> ChatWithSommelier([FromBody] AiChatRequestDto request)
        {
            if (request.StoreId <= 0 && request.TenantId <= 0)
            {
                return BadRequest(ApiResponse<AiChatResponseDto>.Fail("StoreId hoặc TenantId không hợp lệ."));
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(ApiResponse<AiChatResponseDto>.Fail("Vui lòng nhập câu hỏi hoặc yêu cầu cho AI Sommelier."));
            }

            try
            {
                var chatResponse = await _geminiService.ChatWithSommelierAsync(request);
                return Ok(ApiResponse<AiChatResponseDto>.Ok(chatResponse, "AI Sommelier phản hồi thành công."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý cuộc trò chuyện với AI Sommelier");
                return StatusCode(500, ApiResponse<AiChatResponseDto>.Fail($"Lỗi hệ thống khi trò chuyện cùng AI: {ex.Message}"));
            }
        }
    }
}


