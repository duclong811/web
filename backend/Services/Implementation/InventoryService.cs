using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.DTOs.Inventory;
using WebCafe.Backend.Models.Entities;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation
{
    public class InventoryService : IInventoryService
    {
        private readonly WebCafeDbContext _db;
        private readonly ILogger<InventoryService> _logger;

        public InventoryService(WebCafeDbContext db, ILogger<InventoryService> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Trừ nguyên liệu tự động khi đơn hàng được thanh toán
        /// </summary>
        public async Task DeductInventoryForOrderAsync(int orderId, int? staffId = null)
        {
            var order = await _db.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.OrderItemToppings)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new NotFoundException("Không tìm thấy đơn hàng.");
            }

            // Kiểm tra xem đơn hàng đã từng được trừ kho trước đó chưa (Idempotent)
            var alreadyDeducted = await _db.InventoryTransactions
                .AnyAsync(t => t.OrderId == orderId && t.Type == "deduction");
            if (alreadyDeducted)
            {
                _logger.LogInformation($"Inventory for order {order.OrderCode} has already been deducted. Skipping.");
                return;
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                foreach (var orderItem in order.OrderItems)
                {
                    // 1. Trừ nguyên liệu cho món chính (Logic đa tầng linh hoạt tránh trượt size)
                    var allRecipes = await _db.MenuItemRecipes
                        .Include(r => r.Ingredient)
                        .Where(r => r.MenuItemId == orderItem.MenuItemId)
                        .ToListAsync();

                    var recipesToApply = new List<MenuItemRecipe>();

                    if (allRecipes.Any())
                    {
                        // 1.1 Lấy công thức dùng chung cho mọi size (SizeId == null)
                        var universalRecipes = allRecipes.Where(r => r.SizeId == null).ToList();
                        recipesToApply.AddRange(universalRecipes);

                        // 1.2 Nếu đơn có SizeId cụ thể
                        if (orderItem.SizeId.HasValue)
                        {
                            var exactSizeRecipes = allRecipes.Where(r => r.SizeId == orderItem.SizeId.Value).ToList();
                            if (exactSizeRecipes.Any())
                            {
                                recipesToApply.AddRange(exactSizeRecipes);
                            }
                            else if (!universalRecipes.Any())
                            {
                                // Fallback: Nếu không có công thức cho size này và cũng không có universal,
                                // lấy công thức của size đầu tiên có sẵn của món đó
                                var firstAvailableSizeId = allRecipes.FirstOrDefault(r => r.SizeId.HasValue)?.SizeId;
                                if (firstAvailableSizeId.HasValue)
                                {
                                    recipesToApply.AddRange(allRecipes.Where(r => r.SizeId == firstAvailableSizeId.Value));
                                }
                            }
                        }
                        else
                        {
                            // 1.3 Nếu đơn KHÔNG có SizeId (orderItem.SizeId == null)
                            // Nếu chưa có công thức chung, fallback lấy công thức của size đầu tiên có sẵn
                            if (!universalRecipes.Any())
                            {
                                var firstAvailableSizeId = allRecipes.FirstOrDefault(r => r.SizeId.HasValue)?.SizeId;
                                if (firstAvailableSizeId.HasValue)
                                {
                                    recipesToApply.AddRange(allRecipes.Where(r => r.SizeId == firstAvailableSizeId.Value));
                                }
                            }
                        }
                    }

                    // Loại bỏ trùng lặp nguyên liệu nếu có
                    var distinctRecipes = recipesToApply
                        .GroupBy(r => r.IngredientId)
                        .Select(g => g.First())
                        .ToList();

                    foreach (var recipe in distinctRecipes)
                    {
                        var quantityNeeded = recipe.QuantityRequired * orderItem.Quantity;
                        await DeductIngredientAsync(order.StoreId, recipe.IngredientId, quantityNeeded, orderId, staffId, 
                            $"Trừ kho cho món {orderItem.MenuItem?.Name ?? "Unknown"}");
                    }

                    // 2. Trừ nguyên liệu cho toppings
                    foreach (var orderTopping in orderItem.OrderItemToppings)
                    {
                        var toppingRecipes = await _db.ToppingRecipes
                            .Include(tr => tr.Ingredient)
                            .Where(tr => tr.ToppingId == orderTopping.ToppingId)
                            .ToListAsync();

                        foreach (var toppingRecipe in toppingRecipes)
                        {
                            var quantityNeeded = toppingRecipe.QuantityRequired * orderItem.Quantity;
                            await DeductIngredientAsync(order.StoreId, toppingRecipe.IngredientId, quantityNeeded, orderId, staffId,
                                $"Trừ kho cho topping {orderTopping.Topping?.Name ?? "Unknown"}");
                        }
                    }
                }

                await transaction.CommitAsync();
                _logger.LogInformation($"Successfully deducted inventory for order {order.OrderCode}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Failed to deduct inventory for order {order.OrderCode}");
                throw new AppException($"Lỗi khi trừ kho cho đơn hàng: {ex.Message}");
            }
        }

        /// <summary>
        /// Trừ một nguyên liệu cụ thể trong kho
        /// </summary>
        private async Task DeductIngredientAsync(int storeId, int ingredientId, decimal quantity, int? orderId, int? staffId, string note)
        {
            var stock = await _db.InventoryStocks
                .Include(s => s.Ingredient)
                .FirstOrDefaultAsync(s => s.StoreId == storeId && s.IngredientId == ingredientId);

            if (stock == null)
            {
                // Tự động tạo stock record nếu chưa có (với quantity = 0)
                stock = new InventoryStock
                {
                    StoreId = storeId,
                    IngredientId = ingredientId,
                    CurrentQuantity = 0,
                    LastUpdated = DateTime.UtcNow
                };
                _db.InventoryStocks.Add(stock);
                await _db.SaveChangesAsync();
            }

            // Kiểm tra đủ hàng không
            if (stock.CurrentQuantity < quantity)
            {
                var ingredientName = stock.Ingredient?.Name ?? "Unknown";
                _logger.LogWarning($"Insufficient stock for {ingredientName}. Required: {quantity}, Available: {stock.CurrentQuantity}");
                
                // Vẫn cho phép bán nhưng ghi log cảnh báo (tùy business logic có thể throw exception)
                // throw new AppException($"Không đủ nguyên liệu {ingredientName}. Cần: {quantity}, Còn: {stock.CurrentQuantity}");
            }

            var quantityBefore = stock.CurrentQuantity;
            stock.CurrentQuantity -= quantity;
            stock.LastUpdated = DateTime.UtcNow;

            // Ghi lại transaction
            var inventoryTransaction = new InventoryTransaction
            {
                StockId = stock.StockId,
                Type = "deduction",
                Quantity = quantity,
                QuantityBefore = quantityBefore,
                QuantityAfter = stock.CurrentQuantity,
                OrderId = orderId,
                StaffId = staffId,
                Note = note,
                CreatedAt = DateTime.UtcNow
            };

            _db.InventoryTransactions.Add(inventoryTransaction);
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Nhập kho (import inventory)
        /// </summary>
        public async Task ImportInventoryAsync(int storeId, int ingredientId, decimal quantity, int? staffId, string? note)
        {
            var stock = await _db.InventoryStocks
                .FirstOrDefaultAsync(s => s.StoreId == storeId && s.IngredientId == ingredientId);

            if (stock == null)
            {
                stock = new InventoryStock
                {
                    StoreId = storeId,
                    IngredientId = ingredientId,
                    CurrentQuantity = 0,
                    LastUpdated = DateTime.UtcNow
                };
                _db.InventoryStocks.Add(stock);
                await _db.SaveChangesAsync();
            }

            var quantityBefore = stock.CurrentQuantity;
            stock.CurrentQuantity += quantity;
            stock.LastUpdated = DateTime.UtcNow;

            var transaction = new InventoryTransaction
            {
                StockId = stock.StockId,
                Type = "import",
                Quantity = quantity,
                QuantityBefore = quantityBefore,
                QuantityAfter = stock.CurrentQuantity,
                StaffId = staffId,
                Note = note ?? "Nhập kho",
                CreatedAt = DateTime.UtcNow
            };

            _db.InventoryTransactions.Add(transaction);
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Điều chỉnh tồn kho (adjustment)
        /// </summary>
        public async Task AdjustInventoryAsync(int storeId, int ingredientId, decimal newQuantity, int? staffId, string? note)
        {
            var stock = await _db.InventoryStocks
                .FirstOrDefaultAsync(s => s.StoreId == storeId && s.IngredientId == ingredientId);

            if (stock == null)
            {
                throw new NotFoundException("Không tìm thấy nguyên liệu trong kho.");
            }

            var quantityBefore = stock.CurrentQuantity;
            var diff = newQuantity - quantityBefore;

            stock.CurrentQuantity = newQuantity;
            stock.LastUpdated = DateTime.UtcNow;

            var transaction = new InventoryTransaction
            {
                StockId = stock.StockId,
                Type = "adjustment",
                Quantity = Math.Abs(diff),
                QuantityBefore = quantityBefore,
                QuantityAfter = newQuantity,
                StaffId = staffId,
                Note = note ?? $"Điều chỉnh kho {(diff > 0 ? "tăng" : "giảm")}",
                CreatedAt = DateTime.UtcNow
            };

            _db.InventoryTransactions.Add(transaction);
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Lấy danh sách tồn kho theo cửa hàng
        /// </summary>
        public async Task<List<InventoryStockDto>> GetInventoryByStoreAsync(int storeId)
        {
            var stocks = await _db.InventoryStocks
                .Include(s => s.Ingredient)
                .Where(s => s.StoreId == storeId && s.Ingredient!.IsActive)
                .OrderBy(s => s.Ingredient!.Name)
                .ToListAsync();

            return stocks.Select(s => new InventoryStockDto
            {
                StockId = s.StockId,
                IngredientId = s.IngredientId,
                IngredientName = s.Ingredient?.Name ?? string.Empty,
                Unit = s.Ingredient?.Unit ?? string.Empty,
                CurrentQuantity = s.CurrentQuantity,
                MinimumStock = s.Ingredient?.MinimumStock ?? 0,
                IsLowStock = s.CurrentQuantity <= (s.Ingredient?.MinimumStock ?? 0),
                LastUpdated = s.LastUpdated
            }).ToList();
        }

        /// <summary>
        /// Lấy lịch sử giao dịch kho
        /// </summary>
        public async Task<List<InventoryTransactionDto>> GetTransactionHistoryAsync(int storeId, int? ingredientId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _db.InventoryTransactions
                .Where(t => t.Stock!.StoreId == storeId);

            if (ingredientId.HasValue)
            {
                query = query.Where(t => t.Stock!.IngredientId == ingredientId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= toDate.Value);
            }

            return await query
                .OrderByDescending(t => t.CreatedAt)
                .Take(100)
                .Select(t => new InventoryTransactionDto
                {
                    TransactionId = t.TransactionId,
                    IngredientName = t.Stock != null && t.Stock.Ingredient != null ? t.Stock.Ingredient.Name : string.Empty,
                    Type = t.Type,
                    Quantity = t.Quantity,
                    QuantityBefore = t.QuantityBefore,
                    QuantityAfter = t.QuantityAfter,
                    OrderCode = t.OrderId != null ? _db.Orders.Where(o => o.OrderId == t.OrderId).Select(o => o.OrderCode).FirstOrDefault() : null,
                    StaffName = t.Staff != null ? t.Staff.FullName : null,
                    Note = t.Note,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh mục nguyên liệu theo tenant (và số tồn tại store nếu có)
        /// </summary>
        public async Task<List<IngredientDto>> GetIngredientsAsync(int tenantId, int? storeId = null)
        {
            var ingredients = await _db.Ingredients
                .Where(i => i.TenantId == tenantId && i.IsActive)
                .OrderBy(i => i.Name)
                .ToListAsync();

            Dictionary<int, decimal> stockMap = new();
            if (storeId.HasValue && storeId.Value > 0)
            {
                stockMap = await _db.InventoryStocks
                    .Where(s => s.StoreId == storeId.Value)
                    .ToDictionaryAsync(s => s.IngredientId, s => s.CurrentQuantity);
            }

            return ingredients.Select(i => new IngredientDto
            {
                IngredientId = i.IngredientId,
                TenantId = i.TenantId,
                Name = i.Name,
                Unit = i.Unit,
                MinimumStock = i.MinimumStock,
                Description = i.Description,
                IsActive = i.IsActive,
                CurrentStock = stockMap.TryGetValue(i.IngredientId, out var qty) ? qty : 0,
                CreatedAt = i.CreatedAt
            }).ToList();
        }

        /// <summary>
        /// Tạo nguyên liệu mới
        /// </summary>
        public async Task<IngredientDto> CreateIngredientAsync(CreateIngredientDto dto)
        {
            var exists = await _db.Ingredients
                .AnyAsync(i => i.TenantId == dto.TenantId && i.Name.ToLower() == dto.Name.Trim().ToLower() && i.IsActive);

            if (exists)
            {
                throw new AppException($"Nguyên liệu '{dto.Name}' đã tồn tại trong hệ thống.");
            }

            var ingredient = new Ingredient
            {
                TenantId = dto.TenantId,
                Name = dto.Name.Trim(),
                Unit = dto.Unit.Trim(),
                MinimumStock = dto.MinimumStock,
                Description = dto.Description?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Ingredients.Add(ingredient);
            await _db.SaveChangesAsync();

            // Khởi tạo tồn kho ban đầu cho cửa hàng
            if (dto.StoreId > 0)
            {
                var stock = new InventoryStock
                {
                    StoreId = dto.StoreId,
                    IngredientId = ingredient.IngredientId,
                    CurrentQuantity = dto.InitialStock,
                    LastUpdated = DateTime.UtcNow
                };
                _db.InventoryStocks.Add(stock);

                if (dto.InitialStock > 0)
                {
                    _db.InventoryTransactions.Add(new InventoryTransaction
                    {
                        Stock = stock,
                        Type = "import",
                        Quantity = dto.InitialStock,
                        QuantityBefore = 0,
                        QuantityAfter = dto.InitialStock,
                        Note = "Khởi tạo tồn kho ban đầu",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _db.SaveChangesAsync();
            }

            return new IngredientDto
            {
                IngredientId = ingredient.IngredientId,
                TenantId = ingredient.TenantId,
                Name = ingredient.Name,
                Unit = ingredient.Unit,
                MinimumStock = ingredient.MinimumStock,
                Description = ingredient.Description,
                IsActive = ingredient.IsActive,
                CurrentStock = dto.InitialStock,
                CreatedAt = ingredient.CreatedAt
            };
        }

        /// <summary>
        /// Cập nhật thông tin nguyên liệu
        /// </summary>
        public async Task<IngredientDto> UpdateIngredientAsync(int ingredientId, UpdateIngredientDto dto)
        {
            var ingredient = await _db.Ingredients.FirstOrDefaultAsync(i => i.IngredientId == ingredientId);
            if (ingredient == null)
            {
                throw new NotFoundException("Không tìm thấy nguyên liệu.");
            }

            ingredient.Name = dto.Name.Trim();
            ingredient.Unit = dto.Unit.Trim();
            ingredient.MinimumStock = dto.MinimumStock;
            ingredient.Description = dto.Description?.Trim();
            ingredient.IsActive = dto.IsActive;

            await _db.SaveChangesAsync();

            return new IngredientDto
            {
                IngredientId = ingredient.IngredientId,
                TenantId = ingredient.TenantId,
                Name = ingredient.Name,
                Unit = ingredient.Unit,
                MinimumStock = ingredient.MinimumStock,
                Description = ingredient.Description,
                IsActive = ingredient.IsActive,
                CreatedAt = ingredient.CreatedAt
            };
        }

        /// <summary>
        /// Xóa nguyên liệu (Soft delete)
        /// </summary>
        public async Task DeleteIngredientAsync(int ingredientId)
        {
            var ingredient = await _db.Ingredients.FirstOrDefaultAsync(i => i.IngredientId == ingredientId);
            if (ingredient == null)
            {
                throw new NotFoundException("Không tìm thấy nguyên liệu.");
            }

            ingredient.IsActive = false;
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Lấy công thức pha chế của món ăn
        /// </summary>
        public async Task<List<MenuItemRecipeDto>> GetMenuItemRecipesAsync(int menuItemId)
        {
            var recipes = await _db.MenuItemRecipes
                .Include(r => r.MenuItem)
                .Include(r => r.Ingredient)
                .Include(r => r.Size)
                .Where(r => r.MenuItemId == menuItemId)
                .ToListAsync();

            return recipes.Select(r => new MenuItemRecipeDto
            {
                RecipeId = r.RecipeId,
                MenuItemId = r.MenuItemId,
                MenuItemName = r.MenuItem?.Name ?? string.Empty,
                IngredientId = r.IngredientId,
                IngredientName = r.Ingredient?.Name ?? string.Empty,
                Unit = r.Ingredient?.Unit ?? string.Empty,
                SizeId = r.SizeId,
                SizeName = r.Size?.Name,
                QuantityRequired = r.QuantityRequired
            }).ToList();
        }

        /// <summary>
        /// Thêm hoặc cập nhật công thức nguyên liệu cho món
        /// </summary>
        public async Task UpsertMenuItemRecipeAsync(UpsertRecipeDto dto)
        {
            var existing = await _db.MenuItemRecipes
                .FirstOrDefaultAsync(r => r.MenuItemId == dto.MenuItemId &&
                                         r.IngredientId == dto.IngredientId &&
                                         r.SizeId == dto.SizeId);

            if (existing != null)
            {
                existing.QuantityRequired = dto.QuantityRequired;
            }
            else
            {
                var recipe = new MenuItemRecipe
                {
                    MenuItemId = dto.MenuItemId,
                    IngredientId = dto.IngredientId,
                    SizeId = dto.SizeId,
                    QuantityRequired = dto.QuantityRequired
                };
                _db.MenuItemRecipes.Add(recipe);
            }

            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Xóa công thức nguyên liệu khỏi món
        /// </summary>
        public async Task DeleteMenuItemRecipeAsync(int recipeId)
        {
            var recipe = await _db.MenuItemRecipes.FirstOrDefaultAsync(r => r.RecipeId == recipeId);
            if (recipe != null)
            {
                _db.MenuItemRecipes.Remove(recipe);
                await _db.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Lấy danh sách nguyên liệu sắp hết / dưới ngưỡng tối thiểu
        /// </summary>
        public async Task<List<LowStockAlertDto>> GetLowStockAlertsAsync(int storeId)
        {
            var alerts = await _db.InventoryStocks
                .Include(s => s.Ingredient)
                .Where(s => s.StoreId == storeId && 
                            s.Ingredient != null &&
                            s.Ingredient.IsActive && 
                            s.CurrentQuantity <= s.Ingredient.MinimumStock)
                .OrderBy(s => s.CurrentQuantity)
                .ToListAsync();

            return alerts.Select(s => new LowStockAlertDto
            {
                StockId = s.StockId,
                IngredientId = s.IngredientId,
                IngredientName = s.Ingredient?.Name ?? string.Empty,
                Unit = s.Ingredient?.Unit ?? string.Empty,
                CurrentQuantity = s.CurrentQuantity,
                MinimumStock = s.Ingredient?.MinimumStock ?? 0,
                LastUpdated = s.LastUpdated
            }).ToList();
        }
    }

    // DTOs for Inventory
    public class InventoryStockDto
    {
        public int StockId { get; set; }
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public decimal MinimumStock { get; set; }
        public bool IsLowStock { get; set; }
        public DateTime? LastUpdated { get; set; }
    }

    public class InventoryTransactionDto
    {
        public int TransactionId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal QuantityBefore { get; set; }
        public decimal QuantityAfter { get; set; }
        public string? OrderCode { get; set; }
        public string? StaffName { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
