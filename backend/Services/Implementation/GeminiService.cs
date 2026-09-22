using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.AI;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public class GeminiService : IGeminiService
    {
        private readonly WebCafeDbContext _db;
        private readonly IRecommendationService _fallbackRecommendationService;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger<GeminiService> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public GeminiService(
            WebCafeDbContext db,
            IRecommendationService fallbackRecommendationService,
            IMemoryCache cache,
            IConfiguration config,
            HttpClient httpClient,
            ILogger<GeminiService> logger)
        {
            _db = db;
            _fallbackRecommendationService = fallbackRecommendationService;
            _cache = cache;
            _config = config;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<AiRecommendationResponseDto> GetSmartRecommendationsAsync(AiRecommendationRequestDto request)
        {
            var cartKey = request.CurrentCartItemIds != null && request.CurrentCartItemIds.Any()
                ? string.Join("_", request.CurrentCartItemIds.OrderBy(x => x))
                : "empty_cart";
            var cacheKey = $"gemini_rec_s{request.StoreId}_t{request.TenantId}_c{request.CustomerId ?? 0}_{cartKey}_{request.Occasion}_{request.MoodOrPreference}";

            // 1. Kiểm tra In-Memory Cache để tiết kiệm Quota Gemini Free Tier
            if (_cache.TryGetValue(cacheKey, out AiRecommendationResponseDto? cachedResult) && cachedResult != null)
            {
                _logger.LogInformation("Trả về AI Recommendations từ Memory Cache cho Store {StoreId}", request.StoreId);
                return cachedResult;
            }

            // 2. Lấy TenantId từ StoreId nếu TenantId chưa truyền
            var tenantId = request.TenantId;
            if (tenantId <= 0 && request.StoreId > 0)
            {
                tenantId = await _db.Stores
                    .Where(s => s.StoreId == request.StoreId)
                    .Select(s => s.TenantId)
                    .FirstOrDefaultAsync();
            }

            // Lấy dữ liệu Menu hiện có từ Database theo TenantId
            var availableMenuItems = await _db.MenuItems
                .Include(m => m.Category)
                .Where(m => (tenantId <= 0 || m.TenantId == tenantId) && m.IsAvailable)
                .Select(m => new
                {
                    m.MenuItemId,
                    m.Name,
                    m.BasePrice,
                    m.Description,
                    CategoryName = m.Category != null ? m.Category.Name : "Khác",
                    m.ImageUrl
                })
                .ToListAsync();

            if (!availableMenuItems.Any())
            {
                return new AiRecommendationResponseDto
                {
                    IsAiGenerated = false,
                    Headline = "Chưa có món ăn trong thực đơn",
                    ChefNote = "Vui lòng cập nhật thực đơn để AI có thể gợi ý món cho bạn."
                };
            }

            // Lấy thông tin các món trong giỏ hàng
            var cartItems = availableMenuItems
                .Where(m => request.CurrentCartItemIds.Contains(m.MenuItemId))
                .ToList();

            var apiKey = _config["GeminiAI:ApiKey"] ?? string.Empty;
            var primaryModel = _config["GeminiAI:Model"] ?? "gemini-3.5-flash-lite";
            var backupModel = primaryModel == "gemini-3.5-flash-lite" ? "gemini-3.6-flash" : "gemini-3.5-flash-lite";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("YOUR_GEMINI_API_KEY"))
            {
                _logger.LogWarning("Gemini API Key chưa được cấu hình. Sử dụng Statistical Fallback.");
                return await GenerateFallbackRecommendationsAsync(request, availableMenuItems, "Chưa cấu hình Gemini API Key");
            }

            // 3. Gọi Gemini API (thử Primary Model trước, nếu bận thử tiếp Backup Model)
            try
            {
                var geminiResult = await CallGeminiForRecommendationsAsync(apiKey, primaryModel, availableMenuItems, cartItems, request);
                if (geminiResult == null)
                {
                    _logger.LogInformation("Thử lại với Backup Model {BackupModel}", backupModel);
                    geminiResult = await CallGeminiForRecommendationsAsync(apiKey, backupModel, availableMenuItems, cartItems, request);
                }

                if (geminiResult != null && (geminiResult.Recommendations.Any() || geminiResult.Combos.Any()))
                {
                    // Cache kết quả 10 phút
                    _cache.Set(cacheKey, geminiResult, TimeSpan.FromMinutes(10));
                    return geminiResult;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi Gemini API. Chuyển sang Fallback thuật toán thống kê.");
            }

            // 4. Fallback khi Gemini lỗi / rate limit / 429
            var fallback = await GenerateFallbackRecommendationsAsync(request, availableMenuItems, "Dựa trên dữ liệu bán chạy & món yêu thích");
            // Cache fallback ngắn hơn (2 phút) để thử lại Gemini sau
            _cache.Set(cacheKey, fallback, TimeSpan.FromMinutes(2));
            return fallback;
        }

        private async Task<AiRecommendationResponseDto?> CallGeminiForRecommendationsAsync(
            string apiKey,
            string modelName,
            dynamic availableMenuItems,
            dynamic cartItems,
            AiRecommendationRequestDto request)
        {
            var menuJson = JsonSerializer.Serialize(availableMenuItems);
            var cartJson = JsonSerializer.Serialize(cartItems);

            var systemInstruction = @"Bạn là Chuyên gia Sommelier và Trợ lý AI ẩm thực cao cấp của hệ thống nhà hàng/quán cafe AI-SmartServe.
Nhiệm vụ của bạn là phân tích thực đơn thực tế và giỏ hàng hiện tại của khách để đưa ra:
1. Gợi ý 4-6 món đơn lẻ phù hợp nhất kèm lý do hấp dẫn, tinh tế bằng tiếng Việt (kèm mẹo kết hợp hương vị).
2. Gợi ý 2 combo đặc biệt (kết hợp 2-3 món) với mức giá ưu đãi hợp lý.
3. Một câu chào/tiêu đề ấn tượng (Headline) và Lời khuyên của Sommelier/Chef (ChefNote).

QUY TẮC BẮT BUỘC:
- CHỈ chọn MenuItemId có trong danh sách MenuItems được cung cấp. Tuyệt đối không bịa đặt MenuItemId.
- Ngôn từ gợi cảm giác ngon miệng, hiện đại, hiếu khách.
- Định dạng trả về PHẢI LÀ JSON thuần túy theo schema bên dưới, không kèm text ngoài JSON.";

            var userPrompt = $@"
Dưới đây là Menu của quán:
{menuJson}

Giỏ hàng hiện tại của khách:
{cartJson}

Yêu cầu thêm từ khách:
- Thời điểm/Dịp: {request.Occasion ?? "Tất cả các thời điểm trong ngày"}
- Sở thích/Tâm trạng: {request.MoodOrPreference ?? "Gợi ý những món ngon nhất & kết hợp hoàn hảo"}

Hãy trả về JSON theo cấu trúc chính xác sau:
{{
  ""headline"": ""Tiêu đề gợi ý cuốn hút"",
  ""chefNote"": ""Lời khuyên hoặc cảm hứng ẩm thực từ AI Sommelier dành cho khách"",
  ""recommendations"": [
    {{
      ""menuItemId"": 1,
      ""name"": ""Tên món"",
      ""reason"": ""Lý do tại sao món này rất hợp với bạn hoặc giỏ hàng của bạn"",
      ""pairingTip"": ""Mẹo thưởng thức hoặc dùng kèm với món nào ngon nhất"",
      ""badge"": ""AI Gợi ý"" // Có thể là: ""Best Match"", ""Trending"", ""Chef's Pick"", ""Cặp Đôi Hoàn Hảo"", ""Sảng Khoái""
    }}
  ],
  ""combos"": [
    {{
      ""title"": ""Tên Combo (ví dụ: Combo Năng Lượng Buổi Sáng)"",
      ""description"": ""Mô tả ngắn về sự kết hợp hương vị của combo"",
      ""itemIds"": [1, 2],
      ""tag"": ""Best Seller Combo"",
      ""discountPercent"": 10
    }}
  ]
}}";

            // Gemini GenerateContent REST API v1beta
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemInstruction } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userPrompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 2048,
                    responseMimeType = "application/json"
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            
            // Timeout 20 giây cho Gemini
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
            var response = await _httpClient.PostAsync(url, jsonContent, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini API ({Model}) trả về mã lỗi {StatusCode}: {ErrorBody}", modelName, response.StatusCode, errorBody);
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);
            
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text)) return null;

            // Làm sạch text nếu có bọc ```json ... ```
            var cleanJson = text.Trim();
            if (cleanJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                cleanJson = cleanJson.Substring(7);
            }
            else if (cleanJson.StartsWith("```"))
            {
                cleanJson = cleanJson.Substring(3);
            }
            if (cleanJson.EndsWith("```"))
            {
                cleanJson = cleanJson.Substring(0, cleanJson.Length - 3);
            }
            cleanJson = cleanJson.Trim();

            var parsed = JsonSerializer.Deserialize<GeminiParsedResponse>(cleanJson, JsonOptions);
            if (parsed == null) return null;

            // Map lại dữ liệu thực tế từ DB để đảm bảo độ chính xác
            var menuDict = ((IEnumerable<dynamic>)availableMenuItems).ToDictionary(x => (int)x.MenuItemId, x => x);

            var result = new AiRecommendationResponseDto
            {
                IsAiGenerated = true,
                ModelUsed = modelName,
                Headline = string.IsNullOrWhiteSpace(parsed.Headline) ? "AI Gợi ý Món Ngon Cho Bạn" : parsed.Headline,
                ChefNote = string.IsNullOrWhiteSpace(parsed.ChefNote) ? "Các món ăn được lựa chọn theo sở thích và xu hướng hôm nay." : parsed.ChefNote
            };

            // Process Recommendations
            if (parsed.Recommendations != null)
            {
                foreach (var rec in parsed.Recommendations)
                {
                    if (menuDict.TryGetValue(rec.MenuItemId, out var item))
                    {
                        result.Recommendations.Add(new AiRecommendedItemDto
                        {
                            MenuItemId = item.MenuItemId,
                            Name = item.Name,
                            ImageUrl = item.ImageUrl,
                            Price = item.BasePrice,
                            CategoryName = item.CategoryName,
                            Reason = string.IsNullOrWhiteSpace(rec.Reason) ? "Món được AI gợi ý dựa trên khẩu vị của bạn" : rec.Reason,
                            PairingTip = rec.PairingTip,
                            Badge = string.IsNullOrWhiteSpace(rec.Badge) ? "AI Gợi ý" : rec.Badge,
                            ConfidenceScore = 0.96
                        });
                    }
                }
            }

            // Process Combos
            if (parsed.Combos != null)
            {
                foreach (var combo in parsed.Combos)
                {
                    var comboItems = new List<AiRecommendedItemDto>();
                    decimal originalPrice = 0;

                    if (combo.ItemIds != null)
                    {
                        foreach (var itemId in combo.ItemIds)
                        {
                            if (menuDict.TryGetValue(itemId, out var item))
                            {
                                comboItems.Add(new AiRecommendedItemDto
                                {
                                    MenuItemId = item.MenuItemId,
                                    Name = item.Name,
                                    ImageUrl = item.ImageUrl,
                                    Price = item.BasePrice,
                                    CategoryName = item.CategoryName
                                });
                                originalPrice += item.BasePrice;
                            }
                        }
                    }

                    if (comboItems.Count >= 2)
                    {
                        var discountPercent = combo.DiscountPercent > 0 ? combo.DiscountPercent : 10;
                        var discountedPrice = originalPrice * (100 - discountPercent) / 100m;

                        result.Combos.Add(new AiRecommendedComboDto
                        {
                            Title = combo.Title,
                            Description = combo.Description,
                            ItemIds = comboItems.Select(x => x.MenuItemId).ToList(),
                            Items = comboItems,
                            OriginalPrice = originalPrice,
                            DiscountedPrice = discountedPrice,
                            DiscountPercent = discountPercent,
                            Tag = string.IsNullOrWhiteSpace(combo.Tag) ? "Combo AI Gợi Ý" : combo.Tag
                        });
                    }
                }
            }

            return result;
        }

        private async Task<AiRecommendationResponseDto> GenerateFallbackRecommendationsAsync(
            AiRecommendationRequestDto request,
            dynamic availableMenuItems,
            string fallbackReason)
        {
            var result = new AiRecommendationResponseDto
            {
                IsAiGenerated = false,
                ModelUsed = "Statistical Market Basket Analysis",
                Headline = "Gợi Ý Món Bán Chạy & Được Yêu Thích Nhất",
                ChefNote = $"Hệ thống tự động đề xuất dựa trên tần suất đơn hàng và độ ưa chuộng của khách hàng ({fallbackReason})."
            };

            var menuDict = ((IEnumerable<dynamic>)availableMenuItems).ToDictionary(x => (int)x.MenuItemId, x => x);

            // 1. Lấy Popular items từ RecommendationService
            try
            {
                var popular = await _fallbackRecommendationService.GetPopularItemsAsync(request.StoreId, 6);
                if (popular.Any())
                {
                    foreach (var pop in popular)
                    {
                        if (menuDict.TryGetValue(pop.MenuItemId, out var item))
                        {
                            result.Recommendations.Add(new AiRecommendedItemDto
                            {
                                MenuItemId = item.MenuItemId,
                                Name = item.Name,
                                ImageUrl = item.ImageUrl,
                                Price = item.BasePrice,
                                CategoryName = item.CategoryName,
                                Reason = $"Đã bán {pop.TotalSold} lượt gần đây, được thực khách đánh giá cao.",
                                PairingTip = "Dùng kèm đồ uống tươi mát để tăng trọn vẹn hương vị.",
                                Badge = "Bán Chạy Nhất",
                                ConfidenceScore = 0.88
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể lấy Popular items từ fallback");
            }

            // Nếu vẫn chưa có đủ recommendations, lấy từ availableMenuItems
            if (result.Recommendations.Count < 4)
            {
                var remaining = ((IEnumerable<dynamic>)availableMenuItems)
                    .Where(m => !result.Recommendations.Any(r => r.MenuItemId == m.MenuItemId))
                    .Take(4 - result.Recommendations.Count);

                foreach (var item in remaining)
                {
                    result.Recommendations.Add(new AiRecommendedItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Name = item.Name,
                        ImageUrl = item.ImageUrl,
                        Price = item.BasePrice,
                        CategoryName = item.CategoryName,
                        Reason = "Món đặc trưng của quán được nhiều thực khách lựa chọn.",
                        PairingTip = "Hương vị thơm ngon, thích hợp mọi thời điểm trong ngày.",
                        Badge = "Đặc Trưng",
                        ConfidenceScore = 0.85
                    });
                }
            }

            // 2. Lấy Recommended combos từ RecommendationService
            try
            {
                var combos = await _fallbackRecommendationService.GetRecommendedCombosAsync(request.TenantId, 2);
                foreach (var c in combos)
                {
                    var comboItems = new List<AiRecommendedItemDto>();
                    if (menuDict.TryGetValue(c.Item1Id, out var item1))
                    {
                        comboItems.Add(new AiRecommendedItemDto
                        {
                            MenuItemId = item1.MenuItemId,
                            Name = item1.Name,
                            ImageUrl = item1.ImageUrl,
                            Price = item1.BasePrice,
                            CategoryName = item1.CategoryName
                        });
                    }
                    if (menuDict.TryGetValue(c.Item2Id, out var item2))
                    {
                        comboItems.Add(new AiRecommendedItemDto
                        {
                            MenuItemId = item2.MenuItemId,
                            Name = item2.Name,
                            ImageUrl = item2.ImageUrl,
                            Price = item2.BasePrice,
                            CategoryName = item2.CategoryName
                        });
                    }

                    if (comboItems.Count == 2)
                    {
                        result.Combos.Add(new AiRecommendedComboDto
                        {
                            Title = $"Combo {comboItems[0].Name} + {comboItems[1].Name}",
                            Description = "Cặp đôi được khách hàng đặt cùng nhau nhiều nhất trong tháng qua.",
                            ItemIds = new List<int> { c.Item1Id, c.Item2Id },
                            Items = comboItems,
                            OriginalPrice = c.TotalPrice,
                            DiscountedPrice = c.SuggestedDiscountPrice,
                            DiscountPercent = 10,
                            Tag = "Cặp Đôi Bán Chạy"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể lấy Combos từ fallback");
            }

            // Nếu không có combo từ lịch sử, tự tạo 1 combo từ 2 món đầu tiên
            if (!result.Combos.Any() && result.Recommendations.Count >= 2)
            {
                var item1 = result.Recommendations[0];
                var item2 = result.Recommendations[1];
                var orig = item1.Price + item2.Price;
                result.Combos.Add(new AiRecommendedComboDto
                {
                    Title = $"Combo {item1.Name} & {item2.Name}",
                    Description = "Sự kết hợp hoàn hảo giữa đồ uống thơm ngon và bánh ngọt tươi mới.",
                    ItemIds = new List<int> { item1.MenuItemId, item2.MenuItemId },
                    Items = new List<AiRecommendedItemDto> { item1, item2 },
                    OriginalPrice = orig,
                    DiscountedPrice = orig * 0.9m,
                    DiscountPercent = 10,
                    Tag = "Gợi Ý Nhanh"
                });
            }

            return result;
        }

        public async Task<AiChatResponseDto> ChatWithSommelierAsync(AiChatRequestDto request)
        {
            var tenantId = request.TenantId;
            if (tenantId <= 0 && request.StoreId > 0)
            {
                tenantId = await _db.Stores
                    .Where(s => s.StoreId == request.StoreId)
                    .Select(s => s.TenantId)
                    .FirstOrDefaultAsync();
            }

            var availableMenuItems = await _db.MenuItems
                .Include(m => m.Category)
                .Where(m => (tenantId <= 0 || m.TenantId == tenantId) && m.IsAvailable)
                .Select(m => new
                {
                    m.MenuItemId,
                    m.Name,
                    m.BasePrice,
                    m.Description,
                    CategoryName = m.Category != null ? m.Category.Name : "Khác",
                    m.ImageUrl
                })
                .ToListAsync();

            if (!availableMenuItems.Any())
            {
                return new AiChatResponseDto
                {
                    IsAiGenerated = false,
                    Reply = "Xin lỗi quý khách, hiện tại thực đơn của quán đang được cập nhật nên tôi chưa thể tư vấn món cụ thể. Quý khách vui lòng quay lại sau ít phút nhé!"
                };
            }

            var cartItems = availableMenuItems
                .Where(m => request.CurrentCartItemIds != null && request.CurrentCartItemIds.Contains(m.MenuItemId))
                .ToList();

            var apiKey = _config["GeminiAI:ApiKey"] ?? string.Empty;
            var primaryModel = _config["GeminiAI:Model"] ?? "gemini-3.6-flash";
            if (primaryModel == "gemini-3.5-flash-lite") primaryModel = "gemini-3.6-flash";
            var backupModel = "gemini-3.5-flash-lite";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("YOUR_GEMINI_API_KEY"))
            {
                _logger.LogWarning("Gemini API Key chưa được cấu hình cho Chat. Sử dụng Fallback.");
                return GenerateFallbackChatResponse(request, availableMenuItems, "Chưa cấu hình Gemini API Key");
            }

            try
            {
                var chatResult = await CallGeminiForChatAsync(apiKey, primaryModel, availableMenuItems, cartItems, request);
                if (chatResult == null)
                {
                    _logger.LogInformation("Thử lại Chat với Backup Model {BackupModel}", backupModel);
                    chatResult = await CallGeminiForChatAsync(apiKey, backupModel, availableMenuItems, cartItems, request);
                }

                if (chatResult != null && !string.IsNullOrWhiteSpace(chatResult.Reply))
                {
                    return chatResult;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi Gemini Chat API. Sử dụng Fallback.");
            }

            return GenerateFallbackChatResponse(request, availableMenuItems, "Hệ thống AI đang bận");
        }

        private async Task<AiChatResponseDto?> CallGeminiForChatAsync(
            string apiKey,
            string modelName,
            dynamic availableMenuItems,
            dynamic cartItems,
            AiChatRequestDto request)
        {
            var menuJson = JsonSerializer.Serialize(availableMenuItems);
            var cartJson = JsonSerializer.Serialize(cartItems);

            var systemInstruction = @"Bạn là Chuyên gia Sommelier & Trợ lý ẩm thực cao cấp tại WebCafe (AI-SmartServe).
Phong cách của bạn: Lịch thiệp, ấm áp, tận tâm, am hiểu sâu sắc về nghệ thuật thưởng thức cafe, trà, đồ uống sáng tạo, bánh ngọt và các món ăn kết hợp (food & beverage pairing).
QUY TẮC QUAN TRỌNG:
1. BẮT BUỘC CHỈ GỢI Ý các MenuItemId có thật trong danh sách MenuItems được cung cấp. Tuyệt đối KHÔNG tự sáng tác món hoặc mã MenuItemId không có trong quán.
2. Nếu khách hàng đang có món trong giỏ hàng, hãy chú ý gợi ý món ăn/uống kết hợp tôn lên hương vị của nhau (pairing).
3. ĐỌC KỸ KHẨU VỊ CỦA KHÁCH để đề xuất mức đường và mức đá phù hợp:
   - Nếu khách hỏi món ấm/nóng, ngày lạnh, mưa: suggestedIceLevel là 'Nóng' hoặc '0%'.
   - Nếu khách hỏi món ít ngọt, thanh mát, ăn kiêng, healthy: suggestedSugarLevel là '30%' hoặc '50%' hoặc '0%'.
   - Nếu khách không nói rõ: đồ uống lạnh thông thường là 100% đường và 100% đá.
   - Nếu là món Bánh ngọt/Đồ ăn: không cần đá và đường.
4. Trả lời tự nhiên bằng tiếng Việt, truyền cảm hứng và gợi cảm giác ngon miệng.
5. ĐỊNH DẠNG TRẢ VỀ: BẮT BUỘC trả về JSON thuần túy theo schema sau, không kèm bất kỳ text nào ngoài JSON:
{
  ""reply"": ""Lời tư vấn chi tiết, ấm áp và chuyên nghiệp của Sommelier (có thể dùng markdown ngắn gọn)"",
  ""suggestedItems"": [
    {
      ""menuItemId"": 1,
      ""name"": ""Tên món"",
      ""reason"": ""Lý do vì sao món này phù hợp nhất với khẩu vị/yêu cầu của khách"",
      ""badge"": ""Sommelier Khuyên Dùng"",
      ""suggestedSugarLevel"": ""50%"", // '0%', '30%', '50%', '70%', '100%'
      ""suggestedIceLevel"": ""Nóng"",   // 'Nóng', '0%', '50%', '100%'
      ""suggestedSize"": ""Medium""     // 'Medium' hoặc 'Large'
    }
  ],
  ""quickFollowUps"": [
    ""Câu hỏi gợi ý tiếp theo 1"",
    ""Câu hỏi gợi ý tiếp theo 2"",
    ""Câu hỏi gợi ý tiếp theo 3""
  ]
}";

            var contentsList = new List<object>();

            // Lịch sử hội thoại trước đó để duy trì ngữ cảnh đa lượt
            if (request.History != null && request.History.Any())
            {
                foreach (var h in request.History.TakeLast(6))
                {
                    if (string.IsNullOrWhiteSpace(h.Content)) continue;
                    var role = h.Role?.ToLower() == "model" || h.Role?.ToLower() == "assistant" ? "model" : "user";
                    contentsList.Add(new
                    {
                        role = role,
                        parts = new[] { new { text = h.Content } }
                    });
                }
            }

            // Tin nhắn hiện tại của khách kèm Menu và Giỏ hàng
            var currentUserPrompt = $@"
[THỰC ĐƠN HIỆN TẠI CỦA QUÁN]:
{menuJson}

[GIỎ HÀNG HIỆN TẠI CỦA KHÁCH]:
{cartJson}

[CÂU HỎI MỚI NHẤT CỦA KHÁCH HÀNG]:
""{request.Message}""

Hãy phân tích và trả về câu trả lời JSON theo schema đã hướng dẫn.";

            contentsList.Add(new
            {
                role = "user",
                parts = new[] { new { text = currentUserPrompt } }
            });

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";
            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemInstruction } }
                },
                contents = contentsList,
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 2048,
                    responseMimeType = "application/json"
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
            var response = await _httpClient.PostAsync(url, jsonContent, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini Chat API ({Model}) trả về mã lỗi {StatusCode}: {ErrorBody}", modelName, response.StatusCode, errorBody);
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);

            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text)) return null;

            var cleanJson = text.Trim();
            if (cleanJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                cleanJson = cleanJson.Substring(7);
            }
            else if (cleanJson.StartsWith("```"))
            {
                cleanJson = cleanJson.Substring(3);
            }
            if (cleanJson.EndsWith("```"))
            {
                cleanJson = cleanJson.Substring(0, cleanJson.Length - 3);
            }
            cleanJson = cleanJson.Trim();

            var parsed = JsonSerializer.Deserialize<GeminiChatParsedResponse>(cleanJson, JsonOptions);
            if (parsed == null || string.IsNullOrWhiteSpace(parsed.Reply)) return null;

            var menuDict = ((IEnumerable<dynamic>)availableMenuItems).ToDictionary(x => (int)x.MenuItemId, x => x);

            var result = new AiChatResponseDto
            {
                IsAiGenerated = true,
                ModelUsed = modelName,
                Reply = parsed.Reply,
                QuickFollowUps = parsed.QuickFollowUps ?? new List<string>()
            };

            if (parsed.SuggestedItems != null)
            {
                foreach (var item in parsed.SuggestedItems)
                {
                    if (menuDict.TryGetValue(item.MenuItemId, out var dbItem))
                    {
                        var catName = (string)dbItem.CategoryName;
                        var itemName = (string)dbItem.Name;
                        bool isFood = catName.Contains("Bánh", StringComparison.OrdinalIgnoreCase) ||
                                      catName.Contains("Ăn", StringComparison.OrdinalIgnoreCase) ||
                                      catName.Contains("Snack", StringComparison.OrdinalIgnoreCase) ||
                                      itemName.Contains("Bánh", StringComparison.OrdinalIgnoreCase) ||
                                      itemName.Contains("Sandwich", StringComparison.OrdinalIgnoreCase) ||
                                      itemName.Contains("Croissant", StringComparison.OrdinalIgnoreCase);

                        result.SuggestedItems.Add(new AiRecommendedItemDto
                        {
                            MenuItemId = dbItem.MenuItemId,
                            Name = dbItem.Name,
                            ImageUrl = dbItem.ImageUrl,
                            Price = dbItem.BasePrice,
                            CategoryName = dbItem.CategoryName,
                            Reason = string.IsNullOrWhiteSpace(item.Reason) ? "Gợi ý chuẩn vị theo sở thích của bạn" : item.Reason,
                            Badge = string.IsNullOrWhiteSpace(item.Badge) ? "Sommelier Khuyên Dùng" : item.Badge,
                            ConfidenceScore = 0.96,
                            IsDrink = !isFood,
                            SuggestedSugarLevel = isFood ? null : (string.IsNullOrWhiteSpace(item.SuggestedSugarLevel) ? "100%" : item.SuggestedSugarLevel),
                            SuggestedIceLevel = isFood ? null : (string.IsNullOrWhiteSpace(item.SuggestedIceLevel) ? "100%" : item.SuggestedIceLevel),
                            SuggestedSize = string.IsNullOrWhiteSpace(item.SuggestedSize) ? "Medium" : item.SuggestedSize
                        });
                    }
                }
            }

            return result;
        }

        private AiChatResponseDto GenerateFallbackChatResponse(AiChatRequestDto request, dynamic availableMenuItems, string note)
        {
            var itemsList = ((IEnumerable<dynamic>)availableMenuItems).Take(2).ToList();
            var suggested = new List<AiRecommendedItemDto>();

            foreach (var dbItem in itemsList)
            {
                var catName = (string)dbItem.CategoryName;
                var itemName = (string)dbItem.Name;
                bool isFood = catName.Contains("Bánh", StringComparison.OrdinalIgnoreCase) ||
                              catName.Contains("Ăn", StringComparison.OrdinalIgnoreCase) ||
                              catName.Contains("Snack", StringComparison.OrdinalIgnoreCase) ||
                              itemName.Contains("Bánh", StringComparison.OrdinalIgnoreCase);

                suggested.Add(new AiRecommendedItemDto
                {
                    MenuItemId = dbItem.MenuItemId,
                    Name = dbItem.Name,
                    ImageUrl = dbItem.ImageUrl,
                    Price = dbItem.BasePrice,
                    CategoryName = dbItem.CategoryName,
                    Reason = "Món được khách hàng yêu thích và lựa chọn nhiều nhất tại quán",
                    Badge = "Bán Chạy Nhất",
                    ConfidenceScore = 0.90,
                    IsDrink = !isFood,
                    SuggestedSugarLevel = isFood ? null : "50%",
                    SuggestedIceLevel = isFood ? null : "100%",
                    SuggestedSize = "Medium"
                });
            }

            return new AiChatResponseDto
            {
                IsAiGenerated = false,
                ModelUsed = "statistical-fallback",
                Reply = $"Dạ chào bạn! AI Sommelier rất vui được tư vấn hương vị cho bạn. Với câu hỏi \"{request.Message}\", tôi xin gợi ý 2 món đặc sắc đang được rất nhiều thực khách yêu thích tại quán:",
                SuggestedItems = suggested,
                QuickFollowUps = new List<string>
                {
                    "Có món nào ngọt thanh, ít đường không?",
                    "Món nào giúp tỉnh táo buổi sáng?",
                    "Gợi ý thêm bánh ngọt dùng kèm"
                }
            };
        }

        // Cấu trúc Json deserialize từ Gemini
        private class GeminiParsedResponse
        {
            public string Headline { get; set; } = string.Empty;
            public string ChefNote { get; set; } = string.Empty;
            public List<GeminiItemDto>? Recommendations { get; set; }
            public List<GeminiComboDto>? Combos { get; set; }
        }

        private class GeminiChatParsedResponse
        {
            public string Reply { get; set; } = string.Empty;
            public List<GeminiItemDto>? SuggestedItems { get; set; }
            public List<string>? QuickFollowUps { get; set; }
        }

        private class GeminiItemDto
        {
            public int MenuItemId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Reason { get; set; } = string.Empty;
            public string? PairingTip { get; set; }
            public string? Badge { get; set; }
            public string? SuggestedSugarLevel { get; set; }
            public string? SuggestedIceLevel { get; set; }
            public string? SuggestedSize { get; set; }
        }

        private class GeminiComboDto
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public List<int>? ItemIds { get; set; }
            public string? Tag { get; set; }
            public int DiscountPercent { get; set; } = 10;
        }
    }
}
