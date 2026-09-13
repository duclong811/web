using WebCafe.Backend.Common.Middleware;
using WebCafe.Backend.Hubs;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Infrastructure.DependencyInjection;
using WebCafe.Backend.Infrastructure.Seeder;

var builder = WebApplication.CreateBuilder(args);

// Register Controllers & Custom Services through Extension
builder.Services.AddControllers();
builder.Services.RegisterApplicationServices(builder.Configuration);

var app = builder.Build();

// Ensure Database Created & Seed Initial Data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WebCafeDbContext>();
    try
    {
        await DatabaseSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Lỗi khi seed data.");
    }
}

// HTTP Pipeline Middleware
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Cấu hình Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebCafe API v1");
    c.RoutePrefix = "swagger";
});

// Chuyển hướng trang chủ "/" sang "/swagger"
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseStaticFiles();

// CORS phải đặt trước Authentication & Authorization
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders");

app.Run();
