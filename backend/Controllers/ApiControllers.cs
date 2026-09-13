using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebCafe.Backend.Common.Models;
using WebCafe.Backend.Models.DTOs.Analytics;
using WebCafe.Backend.Models.DTOs.Auth;
using WebCafe.Backend.Models.DTOs.Menu;
using WebCafe.Backend.Models.DTOs.Order;
using WebCafe.Backend.Models.DTOs.Payment;
using WebCafe.Backend.Models.DTOs.Table;
using WebCafe.Backend.Models.DTOs.Voucher;
using WebCafe.Backend.Services.Abstraction;

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
            var res = await _authService.LoginStaffAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập nhân viên thành công."));
        }

        [HttpPost("owner-login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> OwnerLogin([FromBody] LoginRequest request)
        {
            var res = await _authService.LoginTenantOwnerAsync(request);
            return Ok(ApiResponse<LoginResponse>.Ok(res, "Đăng nhập chủ quán thành công."));
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
        [Authorize]
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
        [Authorize]
        public async Task<ActionResult<ApiResponse<MenuItemDto>>> CreateMenuItem(int tenantId, [FromBody] CreateMenuItemDto dto)
        {
            var item = await _menuService.CreateAsync(tenantId, dto);
            return Ok(ApiResponse<MenuItemDto>.Ok(item, "Tạo món thành công."));
        }

        [HttpPut("items/{id}/tenant/{tenantId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<MenuItemDto>>> UpdateMenuItem(int id, int tenantId, [FromBody] CreateMenuItemDto dto)
        {
            var item = await _menuService.UpdateAsync(tenantId, id, dto);
            return Ok(ApiResponse<MenuItemDto>.Ok(item, "Cập nhật món thành công."));
        }

        [HttpDelete("items/{id}/tenant/{tenantId}")]
        [Authorize]
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
        [Authorize]
        public async Task<ActionResult<ApiResponse<TableDto>>> CreateTable([FromBody] CreateTableDto dto)
        {
            var table = await _tableService.CreateTableAsync(dto);
            return Ok(ApiResponse<TableDto>.Ok(table, "Thêm bàn mới thành công."));
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<TableDto>>> UpdateStatus(int id, [FromBody] UpdateTableStatusDto dto)
        {
            var table = await _tableService.UpdateStatusAsync(id, dto.Status);
            return Ok(ApiResponse<TableDto>.Ok(table, "Cập nhật trạng thái bàn thành công."));
        }

        [HttpDelete("{id}")]
        [Authorize]
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
        [Authorize]
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

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
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
        [Authorize]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboard(int storeId)
        {
            var stats = await _analyticsService.GetDashboardStatsAsync(storeId);
            return Ok(ApiResponse<DashboardStatsDto>.Ok(stats));
        }
    }
}


