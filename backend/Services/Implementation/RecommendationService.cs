using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public interface IRecommendationService
    {
        Task<List<RecommendedComboDto>> GetRecommendedCombosAsync(int tenantId, int topN = 5);
        Task<List<MenuItemRecommendationDto>> GetPopularItemsAsync(int storeId, int topN = 10);
        Task<List<MenuItemRecommendationDto>> GetPersonalizedRecommendationsAsync(int customerId, int storeId, int topN = 5);
        Task<List<FrequentPairDto>> GetFrequentlyBoughtTogetherAsync(int tenantId, int menuItemId, int topN = 3);
    }

    public class RecommendationService : IRecommendationService
    {
        private readonly WebCafeDbContext _db;
        private readonly ILogger<RecommendationService> _logger;

        public RecommendationService(WebCafeDbContext db, ILogger<RecommendationService> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Gợi ý combo dựa trên các món thường được mua cùng nhau (Market Basket Analysis)
        /// </summary>
        public async Task<List<RecommendedComboDto>> GetRecommendedCombosAsync(int tenantId, int topN = 5)
        {
            // Lấy dữ liệu đơn hàng đã thanh toán trong 30 ngày gần đây
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            var orderItems = await _db.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.MenuItem)
                .Where(oi => oi.Order!.TenantId == tenantId && 
                            oi.Order.Status == "paid" &&
                            oi.Order.CreatedAt >= thirtyDaysAgo)
                .Select(oi => new
                {
                    OrderId = oi.OrderId,
                    MenuItemId = oi.MenuItemId,
                    MenuItemName = oi.MenuItem!.Name,
                    Price = oi.UnitPrice
                })
                .ToListAsync();

            // Nhóm theo OrderId để tìm các món được mua cùng nhau
            var orderGroups = orderItems
                .GroupBy(oi => oi.OrderId)
                .Where(g => g.Count() >= 2) // Chỉ lấy đơn có từ 2 món trở lên
                .ToList();

            // Tính tần suất xuất hiện của các cặp món
            var pairFrequency = new Dictionary<string, ComboInfo>();

            foreach (var order in orderGroups)
            {
                var items = order.ToList();
                
                // Tạo tất cả các cặp (combinations)
                for (int i = 0; i < items.Count; i++)
                {
                    for (int j = i + 1; j < items.Count; j++)
                    {
                        var item1 = items[i];
                        var item2 = items[j];
                        
                        // Tạo key duy nhất cho cặp (sắp xếp để tránh duplicate)
                        var ids = new[] { item1.MenuItemId, item2.MenuItemId }.OrderBy(x => x).ToArray();
                        var key = $"{ids[0]}-{ids[1]}";

                        if (!pairFrequency.ContainsKey(key))
                        {
                            pairFrequency[key] = new ComboInfo
                            {
                                Item1Id = ids[0],
                                Item1Name = ids[0] == item1.MenuItemId ? item1.MenuItemName : item2.MenuItemName,
                                Item1Price = ids[0] == item1.MenuItemId ? item1.Price : item2.Price,
                                Item2Id = ids[1],
                                Item2Name = ids[1] == item2.MenuItemId ? item2.MenuItemName : item1.MenuItemName,
                                Item2Price = ids[1] == item2.MenuItemId ? item2.Price : item1.Price,
                                Frequency = 0
                            };
                        }
                        
                        pairFrequency[key].Frequency++;
                    }
                }
            }

            // Sắp xếp theo tần suất và lấy top N
            var topCombos = pairFrequency.Values
                .OrderByDescending(c => c.Frequency)
                .Take(topN)
                .Select(c => new RecommendedComboDto
                {
                    Item1Id = c.Item1Id,
                    Item1Name = c.Item1Name,
                    Item1Price = c.Item1Price,
                    Item2Id = c.Item2Id,
                    Item2Name = c.Item2Name,
                    Item2Price = c.Item2Price,
                    TotalPrice = c.Item1Price + c.Item2Price,
                    SuggestedDiscountPrice = (c.Item1Price + c.Item2Price) * 0.9m, // Giảm 10%
                    Frequency = c.Frequency,
                    ConfidenceScore = CalculateConfidence(c.Frequency, orderGroups.Count)
                })
                .ToList();

            return topCombos;
        }

        /// <summary>
        /// Lấy các món bán chạy nhất theo cửa hàng
        /// </summary>
        public async Task<List<MenuItemRecommendationDto>> GetPopularItemsAsync(int storeId, int topN = 10)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var popularItems = await _db.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.MenuItem)
                .Where(oi => oi.Order!.StoreId == storeId && 
                            oi.Order.Status == "paid" &&
                            oi.Order.CreatedAt >= thirtyDaysAgo)
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem!.Name, oi.MenuItem.ImageUrl, oi.MenuItem.BasePrice })
                .Select(g => new MenuItemRecommendationDto
                {
                    MenuItemId = g.Key.MenuItemId,
                    Name = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    Price = g.Key.BasePrice,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal),
                    OrderCount = g.Select(x => x.OrderId).Distinct().Count(),
                    RecommendationReason = "Món bán chạy"
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(topN)
                .ToListAsync();

            return popularItems;
        }

        /// <summary>
        /// Gợi ý cá nhân hóa dựa trên lịch sử mua hàng của khách
        /// </summary>
        public async Task<List<MenuItemRecommendationDto>> GetPersonalizedRecommendationsAsync(int customerId, int storeId, int topN = 5)
        {
            // Lấy lịch sử mua hàng của khách
            var customerHistory = await _db.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order!.CustomerId == customerId && 
                            oi.Order.StoreId == storeId &&
                            oi.Order.Status == "paid")
                .Select(oi => oi.MenuItemId)
                .Distinct()
                .ToListAsync();

            if (!customerHistory.Any())
            {
                // Nếu khách chưa có lịch sử, trả về món phổ biến
                return await GetPopularItemsAsync(storeId, topN);
            }

            // Tìm các món khác thường được mua cùng với món khách đã mua
            var recommendations = await _db.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.MenuItem)
                .Where(oi => oi.Order!.StoreId == storeId &&
                            oi.Order.Status == "paid" &&
                            oi.Order.OrderItems.Any(x => customerHistory.Contains(x.MenuItemId)) &&
                            !customerHistory.Contains(oi.MenuItemId)) // Loại món đã mua
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem!.Name, oi.MenuItem.ImageUrl, oi.MenuItem.BasePrice })
                .Select(g => new MenuItemRecommendationDto
                {
                    MenuItemId = g.Key.MenuItemId,
                    Name = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    Price = g.Key.BasePrice,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal),
                    OrderCount = g.Select(x => x.OrderId).Distinct().Count(),
                    RecommendationReason = "Gợi ý dành cho bạn"
                })
                .OrderByDescending(x => x.OrderCount)
                .Take(topN)
                .ToListAsync();

            return recommendations;
        }

        /// <summary>
        /// Tìm các món thường được mua cùng với món được chọn
        /// </summary>
        public async Task<List<FrequentPairDto>> GetFrequentlyBoughtTogetherAsync(int tenantId, int menuItemId, int topN = 3)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // Tìm các OrderId có chứa menuItemId
            var ordersWithItem = await _db.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.MenuItemId == menuItemId &&
                            oi.Order!.TenantId == tenantId &&
                            oi.Order.Status == "paid" &&
                            oi.Order.CreatedAt >= thirtyDaysAgo)
                .Select(oi => oi.OrderId)
                .Distinct()
                .ToListAsync();

            if (!ordersWithItem.Any())
            {
                return new List<FrequentPairDto>();
            }

            // Tìm các món khác trong những đơn đó
            var frequentPairs = await _db.OrderItems
                .Include(oi => oi.MenuItem)
                .Where(oi => ordersWithItem.Contains(oi.OrderId) &&
                            oi.MenuItemId != menuItemId)
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem!.Name, oi.MenuItem.ImageUrl, oi.MenuItem.BasePrice })
                .Select(g => new FrequentPairDto
                {
                    MenuItemId = g.Key.MenuItemId,
                    Name = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    Price = g.Key.BasePrice,
                    CoOccurrenceCount = g.Select(x => x.OrderId).Distinct().Count(),
                    Confidence = (double)g.Select(x => x.OrderId).Distinct().Count() / ordersWithItem.Count
                })
                .OrderByDescending(x => x.CoOccurrenceCount)
                .Take(topN)
                .ToListAsync();

            return frequentPairs;
        }

        private static double CalculateConfidence(int frequency, int totalOrders)
        {
            return totalOrders > 0 ? Math.Round((double)frequency / totalOrders * 100, 2) : 0;
        }

        private class ComboInfo
        {
            public int Item1Id { get; set; }
            public string Item1Name { get; set; } = string.Empty;
            public decimal Item1Price { get; set; }
            public int Item2Id { get; set; }
            public string Item2Name { get; set; } = string.Empty;
            public decimal Item2Price { get; set; }
            public int Frequency { get; set; }
        }
    }

    // DTOs
    public class RecommendedComboDto
    {
        public int Item1Id { get; set; }
        public string Item1Name { get; set; } = string.Empty;
        public decimal Item1Price { get; set; }
        public int Item2Id { get; set; }
        public string Item2Name { get; set; } = string.Empty;
        public decimal Item2Price { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal SuggestedDiscountPrice { get; set; }
        public int Frequency { get; set; }
        public double ConfidenceScore { get; set; }
    }

    public class MenuItemRecommendationDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
        public string RecommendationReason { get; set; } = string.Empty;
    }

    public class FrequentPairDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int CoOccurrenceCount { get; set; }
        public double Confidence { get; set; }
    }
}
