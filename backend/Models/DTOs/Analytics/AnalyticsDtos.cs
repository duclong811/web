namespace WebCafe.Backend.Models.DTOs.Analytics
{
    public class DashboardStatsDto
    {
        public decimal TodayRevenue { get; set; }
        public int TodayOrders { get; set; }
        public int TotalCustomers { get; set; }
        public int AvailableTables { get; set; }
        public int OccupiedTables { get; set; }
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<DailyRevenueDto> RevenueChart { get; set; } = new();
    }

    public class TopProductDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int SoldCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
    }

    public class RevenueReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
        public List<PaymentMethodStatsDto> PaymentMethodStats { get; set; } = new();
    }

    public class PaymentMethodStatsDto
    {
        public string Method { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class CustomerAnalyticsDto
    {
        public int TotalCustomers { get; set; }
        public int NewCustomers { get; set; }
        public int ActiveCustomers { get; set; }
        public double RetentionRate { get; set; }
        public List<TopCustomerDto> TopCustomers { get; set; } = new();
    }

    public class TopCustomerDto
    {
        public int CustomerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
        public int VisitCount { get; set; }
        public int TotalPoints { get; set; }
    }

    public class CategoryPerformanceDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
    }
}
