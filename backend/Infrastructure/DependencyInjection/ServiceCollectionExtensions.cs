using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using WebCafe.Backend.Hubs;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Infrastructure.Storage;
using WebCafe.Backend.Services.Abstraction;
using WebCafe.Backend.Services.Implementation;

namespace WebCafe.Backend.Infrastructure.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // 1. DbContext
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? "Server=(localdb)\\mssqllocaldb;Database=WebCafeDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

            services.AddDbContext<WebCafeDbContext>(options =>
                options.UseSqlServer(connectionString));

            // 2. CORS - Cho phép tất cả origin kết nối linh hoạt
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.SetIsOriginAllowed(origin => true)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // 3. JWT Authentication
            var jwtKey = configuration["Jwt:SecretKey"] ?? "WebCafeSuperSecretKeyForJwtAuthentication2026!@#$%^";
            var jwtIssuer = configuration["Jwt:Issuer"] ?? "WebCafeBackend";
            var jwtAudience = configuration["Jwt:Audience"] ?? "WebCafeClients";

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ClockSkew = TimeSpan.Zero
                };

                // SignalR Token Support from Query String
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddAuthorization(options =>
            {
                // Policy cho SystemAdmin - có quyền truy cập toàn bộ hệ thống
                options.AddPolicy("SystemAdminOnly", policy => 
                    policy.RequireRole("SystemAdmin"));

                // Policy cho TenantOwner - quản lý toàn bộ tenant của mình
                options.AddPolicy("TenantOwnerOnly", policy => 
                    policy.RequireRole("Owner", "SystemAdmin"));

                // Policy cho Manager - quản lý cửa hàng
                options.AddPolicy("ManagerAccess", policy => 
                    policy.RequireRole("Manager", "Owner", "SystemAdmin"));

                // Policy cho Staff - nhân viên thông thường
                options.AddPolicy("StaffAccess", policy => 
                    policy.RequireRole("Staff", "Manager", "Owner", "SystemAdmin"));

                // Policy cho Kitchen - bếp
                options.AddPolicy("KitchenAccess", policy => 
                    policy.RequireRole("Kitchen", "Manager", "Owner", "SystemAdmin"));

                // Policy cho Cashier - thu ngân
                options.AddPolicy("CashierAccess", policy => 
                    policy.RequireRole("Cashier", "Manager", "Owner", "SystemAdmin"));

                // Policy cho tất cả authenticated users
                options.AddPolicy("RequireAuthenticated", policy => 
                    policy.RequireAuthenticatedUser());
            });

            // 4. SignalR
            services.AddSignalR();
            services.AddScoped<IOrderNotificationService, OrderNotificationService>();

            // 5. Storage & Business Services
            services.AddMemoryCache();
            services.AddHttpClient();
            services.AddScoped<IFileStorageService, LocalFileSystemStorage>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IMenuItemService, MenuItemService>();
            services.AddScoped<ITableService, TableService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IVoucherService, VoucherService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            services.AddScoped<IInventoryService, InventoryService>();
            services.AddScoped<IVietQRPaymentService, VietQRPaymentService>();
            services.AddScoped<IRecommendationService, RecommendationService>();
            services.AddScoped<IGeminiService, GeminiService>();

            // 6. Swagger with Bearer Support
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebCafe SaaS QR Ordering API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "Nhập token theo định dạng: Bearer {token}",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            return services;
        }
    }
}
