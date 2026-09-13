using System.Net;

namespace WebCafe.Backend.Common.Exceptions
{
    public class AppException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class NotFoundException : AppException
    {
        public NotFoundException(string message) : base(message, HttpStatusCode.NotFound)
        {
        }
    }

    public class ModelValidationException : AppException
    {
        public IDictionary<string, string[]> Errors { get; }

        public ModelValidationException(IDictionary<string, string[]> errors) 
            : base("Một hoặc nhiều lỗi kiểm tra dữ liệu đã xảy ra.", HttpStatusCode.BadRequest)
        {
            Errors = errors;
        }

        public ModelValidationException(string field, string message) 
            : base(message, HttpStatusCode.BadRequest)
        {
            Errors = new Dictionary<string, string[]>
            {
                { field, new[] { message } }
            };
        }
    }

    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message = "Bạn không có quyền thực hiện hành động này.") 
            : base(message, HttpStatusCode.Forbidden)
        {
        }
    }
}
