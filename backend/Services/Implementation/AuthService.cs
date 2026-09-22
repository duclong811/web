using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Constants;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Common.Helper;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Auth;
using WebCafe.Backend.Models.Entities;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public class AuthService : IAuthService
    {
        private readonly WebCafeDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(WebCafeDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<LoginResponse> LoginStaffAsync(LoginRequest request)
        {
            var staff = await _db.Staff
                .Include(s => s.Store)
                    .ThenInclude(st => st!.Tenant)
                .Include(s => s.Role)
                .FirstOrDefaultAsync(s => s.Username == request.Username && s.IsActive);

            if (staff == null || !SecurityHelper.VerifyPassword(request.Password, staff.PasswordHash))
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            var roleName = staff.Role?.Name ?? AppRoles.Staff;
            var tenantId = staff.Store?.TenantId ?? 0;
            var storeId = staff.StoreId;

            var jwtKey = _config["Jwt:SecretKey"] ?? "WebCafeSuperSecretKeyForJwtAuthentication2026!@#$%^";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "WebCafeBackend";
            var jwtAudience = _config["Jwt:Audience"] ?? "WebCafeClients";

            var token = JwtHelper.GenerateToken(
                staff.StaffId.ToString(),
                staff.Username,
                roleName,
                tenantId,
                storeId,
                jwtKey,
                jwtIssuer,
                jwtAudience
            );

            return new LoginResponse
            {
                Token = token,
                Username = staff.Username,
                FullName = staff.FullName,
                Role = roleName,
                TenantId = tenantId,
                StoreId = storeId,
                StoreName = staff.Store?.Name,
                BrandName = staff.Store?.Tenant?.Name
            };
        }

        public async Task<LoginResponse> LoginTenantOwnerAsync(LoginRequest request)
        {
            var tenant = await _db.Tenants
                .Include(t => t.Stores)
                .FirstOrDefaultAsync(t => (t.OwnerEmail == request.Username || t.OwnerPhone == request.Username) && t.IsActive);

            if (tenant == null || !SecurityHelper.VerifyPassword(request.Password, tenant.OwnerPasswordHash))
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu chủ quán không chính xác.");
            }

            var jwtKey = _config["Jwt:SecretKey"] ?? "WebCafeSuperSecretKeyForJwtAuthentication2026!@#$%^";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "WebCafeBackend";
            var jwtAudience = _config["Jwt:Audience"] ?? "WebCafeClients";

            var defaultStore = tenant.Stores.FirstOrDefault(s => s.IsActive);

            var token = JwtHelper.GenerateToken(
                tenant.TenantId.ToString(),
                tenant.OwnerEmail,
                AppRoles.TenantOwner,
                tenant.TenantId,
                defaultStore?.StoreId,
                jwtKey,
                jwtIssuer,
                jwtAudience
            );

            return new LoginResponse
            {
                Token = token,
                Username = tenant.OwnerEmail,
                FullName = tenant.OwnerName,
                Role = AppRoles.TenantOwner,
                TenantId = tenant.TenantId,
                StoreId = defaultStore?.StoreId,
                StoreName = defaultStore?.Name,
                BrandName = tenant.Name
            };
        }

        public async Task<LoginResponse> LoginSystemAdminAsync(LoginRequest request)
        {
            var admin = await _db.SystemAdmins
                .FirstOrDefaultAsync(a => a.Username == request.Username && a.IsActive);

            if (admin == null || !SecurityHelper.VerifyPassword(request.Password, admin.PasswordHash))
            {
                throw new AppException("Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác.");
            }

            var jwtKey = _config["Jwt:SecretKey"] ?? "WebCafeSuperSecretKeyForJwtAuthentication2026!@#$%^";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "WebCafeBackend";
            var jwtAudience = _config["Jwt:Audience"] ?? "WebCafeClients";

            var token = JwtHelper.GenerateToken(
                admin.AdminId.ToString(),
                admin.Username,
                AppRoles.SystemAdmin,
                0, // SystemAdmin không thuộc tenant nào
                null,
                jwtKey,
                jwtIssuer,
                jwtAudience,
                48 // SystemAdmin có token tồn tại lâu hơn
            );

            return new LoginResponse
            {
                Token = token,
                Username = admin.Username,
                FullName = admin.FullName,
                Role = AppRoles.SystemAdmin,
                TenantId = 0,
                StoreId = null,
                StoreName = null,
                BrandName = "WebCafe System"
            };
        }

        public async Task<LoginResponse> LoginCustomerAsync(LoginRequest request)
        {
            var phone = request.Username.Trim().Replace(" ", "");
            var customer = await _db.Customers
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Phone == phone);

            if (customer == null)
            {
                customer = new Customer
                {
                    TenantId = 1,
                    Phone = phone,
                    Name = !string.IsNullOrWhiteSpace(request.Password) && request.Password != "123456" ? null : "Khách hàng",
                    TotalPoints = 0,
                    TotalSpent = 0,
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
                await _db.SaveChangesAsync();
            }

            var jwtKey = _config["Jwt:SecretKey"] ?? "WebCafeSuperSecretKeyForJwtAuthentication2026!@#$%^";
            var jwtIssuer = _config["Jwt:Issuer"] ?? "WebCafeBackend";
            var jwtAudience = _config["Jwt:Audience"] ?? "WebCafeClients";

            var token = JwtHelper.GenerateToken(
                customer.CustomerId.ToString(),
                customer.Phone,
                AppRoles.Customer,
                customer.TenantId,
                null,
                jwtKey,
                jwtIssuer,
                jwtAudience
            );

            return new LoginResponse
            {
                Token = token,
                Username = customer.Phone,
                FullName = customer.Name ?? "Khách hàng",
                Role = AppRoles.Customer,
                TenantId = customer.TenantId,
                StoreId = null,
                StoreName = null,
                BrandName = customer.Tenant?.Name ?? "WebCafe"
            };
        }

        public async Task<RegisterResponse> RegisterCustomerAsync(RegisterRequest request)
        {
            // Kiểm tra email đã tồn tại chưa
            var existingByEmail = await _db.Customers
                .FirstOrDefaultAsync(c => c.Phone == request.Email);

            if (existingByEmail != null)
            {
                throw new AppException("Email này đã được đăng ký.");
            }

            // Kiểm tra phone đã tồn tại chưa
            var existingByPhone = await _db.Customers
                .FirstOrDefaultAsync(c => c.Phone == request.Phone);

            if (existingByPhone != null)
            {
                throw new AppException("Số điện thoại này đã được đăng ký.");
            }

            // Tạo customer mới với TenantId mặc định = 1 (The Coffee House)
            var customer = new Customer
            {
                TenantId = 1,
                Phone = request.Phone,
                Name = request.FullName,
                TotalPoints = 0,
                TotalSpent = 0,
                VisitCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            return new RegisterResponse
            {
                CustomerId = customer.CustomerId,
                Email = request.Email,
                Phone = request.Phone,
                FullName = customer.Name ?? string.Empty,
                Message = "Đăng ký thành công! Bạn có thể đặt món ngay bây giờ."
            };
        }
    }
}
