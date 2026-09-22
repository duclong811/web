using System;
using System.Collections.Generic;

namespace WebCafe.Backend.Models.DTOs.Analytics
{
    // ==========================================
    // 1. DASHBOARD & SHIFT OPERATIONS DTOs (/admin)
    // ==========================================

    public class ShiftOperationsDto
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public DateTime ShiftDate { get; set; } = DateTime.UtcNow;

        // Financials in shift
        public decimal TodayRevenue { get; set; }
        public decimal YesterdayRevenueSameTime { get; set; }
        public double RevenueGrowthPercent { get; set; }
        public decimal CashRevenue { get; set; }
        public decimal BankTransferRevenue { get; set; }

        // Orders & Kitchen Bar queue
        public int TodayOrdersCount { get; set; }
        public int PendingOrdersCount { get; set; }
        public int PreparingOrdersCount { get; set; }
        public int ReadyOrdersCount { get; set; }
        public int ServedOrdersCount { get; set; }
        public double AvgFulfillmentMinutes { get; set; }

        // Tables
        public int TotalTables { get; set; }
        public int OccupiedTables { get; set; }
        public int AvailableTables { get; set; }
        public double TableOccupancyPercent { get; set; }
        public List<ActiveTableStatusDto> ActiveTablesList { get; set; } = new();

        // Operational alerts
        public List<ShiftStockAlertDto> LowStockAlerts { get; set; } = new();
        public List<string> OutOfStockItemNames { get; set; } = new();

        // Hourly load
        public List<HourlyTrafficDto> HourlyTraffic { get; set; } = new();
        public List<TopProductDto> TopProductsToday { get; set; } = new();
    }

    public class ActiveTableStatusDto
    {
        public int TableId { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Status { get; set; } = "Available"; // Available, Occupied, Reserved
        public int? ActiveOrderId { get; set; }
        public string? ActiveOrderCode { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public int OccupiedMinutes { get; set; }
        public bool IsLongStaying { get; set; } // > 90 mins
    }

    public class ShiftStockAlertDto
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public decimal MinThreshold { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Severity { get; set; } = "Warning"; // Critical, Warning
    }

    public class HourlyTrafficDto
    {
        public int Hour { get; set; } // 7..22
        public string TimeLabel { get; set; } = string.Empty; // "07:00", "08:00"
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public bool IsPeakHour { get; set; }
    }

    // ==========================================
    // 2. BUSINESS REPORT & STRATEGIC ANALYTICS (/admin/analytics)
    // ==========================================

    public class BusinessAnalyticsReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int StoreId { get; set; }

        // Financial Scorecard
        public decimal GrossRevenue { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal NetRevenue { get; set; }
        public decimal EstimatedCOGS { get; set; } // Chi phí giá vốn
        public decimal GrossProfit { get; set; }   // Lợi nhuận gộp
        public double GrossMarginPercent { get; set; } // % Biên lợi nhuận gộp
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal AverageSpendPerCustomer { get; set; }

        // Trends & Breakdowns
        public List<DailyRevenueDto> DailyTrend { get; set; } = new();
        public List<CategoryPerformanceDto> CategoryBreakdown { get; set; } = new();
        public List<PaymentMethodStatsDto> PaymentMethodBreakdown { get; set; } = new();
        public List<ChannelSalesDto> ChannelBreakdown { get; set; } = new(); // Dine-in vs Takeaway

        // Menu Engineering Matrix
        public MenuEngineeringSummaryDto MenuEngineering { get; set; } = new();

        // Customer Metrics
        public CustomerAnalyticsDto CustomerAnalytics { get; set; } = new();
    }

    public class ChannelSalesDto
    {
        public string Channel { get; set; } = "Dine-in"; // Tại quán, Mang về
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
        public double Percentage { get; set; }
    }

    // ==========================================
    // 3. MENU ENGINEERING MATRIX (Boston Box FnB)
    // ==========================================

    public class MenuEngineeringSummaryDto
    {
        public List<MenuEngineeringItemDto> Stars { get; set; } = new();       // Lợi nhuận cao + Bán chạy
        public List<MenuEngineeringItemDto> Plowhorses { get; set; } = new();  // Lợi nhuận thấp + Bán chạy
        public List<MenuEngineeringItemDto> Puzzles { get; set; } = new();     // Lợi nhuận cao + Bán chậm
        public List<MenuEngineeringItemDto> Dogs { get; set; } = new();        // Lợi nhuận thấp + Bán chậm
    }

    public class MenuEngineeringItemDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal BasePrice { get; set; }
        public decimal EstimatedCost { get; set; }
        public decimal MarginPerUnit { get; set; }
        public double MarginPercent { get; set; }
        public int SoldCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalProfit { get; set; }
        public string Classification { get; set; } = "Star"; // Star, Plowhorse, Puzzle, Dog
        public string StrategicRecommendation { get; set; } = string.Empty;
    }

    // ==========================================
    // 4. LEGACY & REUSABLE DTOs
    // ==========================================

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
        public string? ImageUrl { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int SoldCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
        public decimal EstimatedProfit { get; set; }
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
        public double Percentage { get; set; }
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
        public double Percentage { get; set; }
    }
}
