namespace WebCafe.Backend.Common.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public IDictionary<string, string[]>? Errors { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Thành công")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> Fail(string message, IDictionary<string, string[]>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }
    }

    public class PaginationRes<T>
    {
        public List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalRecords / (PageSize > 0 ? PageSize : 10));
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        public PaginationRes() { }

        public PaginationRes(List<T> items, int pageNumber, int pageSize, int totalRecords)
        {
            Items = items;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalRecords = totalRecords;
        }
    }

    public class PagedReq
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;
    }

    public class QueryOptions<T>
    {
        public Func<IQueryable<T>, IQueryable<T>>? Include { get; set; }
        public bool AsNoTracking { get; set; } = true;
    }
}
