using System.Net;
using System.Text.Json;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Common.Models;

namespace WebCafe.Backend.Common.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xử lý được xảy ra: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ApiResponse<object>
            {
                Success = false,
                Message = exception.Message
            };

            switch (exception)
            {
                case ModelValidationException validationEx:
                    context.Response.StatusCode = (int)validationEx.StatusCode;
                    response.Message = validationEx.Message;
                    response.Errors = validationEx.Errors;
                    break;

                case AppException appEx:
                    context.Response.StatusCode = (int)appEx.StatusCode;
                    response.Message = appEx.Message;
                    break;

                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = "Không tìm thấy dữ liệu yêu cầu.";
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = "Không có quyền truy cập.";
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Message = "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
                    break;
            }

            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
        }
    }
}
