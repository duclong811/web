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

            services.AddAuthorization();

            // 4. SignalR
            services.AddSignalR();
            services.AddScoped<IOrderNotificationService, OrderNotificationService>();

            // 5. Storage & Business Services
            services.AddScoped<IFileStorageService, LocalFileSystemStorage>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IMenuItemService, MenuItemService>();
            services.AddScoped<ITableService, TableService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IVoucherService, VoucherService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();

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
