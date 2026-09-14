using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Infrastructure.Data;
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

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                foreach (var orderItem in order.OrderItems)
                {
                    // 1. Trừ nguyên liệu cho món chính
                    var menuItemRecipes = await _db.MenuItemRecipes
                        .Include(r => r.Ingredient)
                        .Where(r => r.MenuItemId == orderItem.MenuItemId &&
                                   (r.SizeId == null || r.SizeId == orderItem.SizeId))
                        .ToListAsync();

                    foreach (var recipe in menuItemRecipes)
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
                .Include(t => t.Stock)
                    .ThenInclude(s => s!.Ingredient)
                .Include(t => t.Staff)
                .Include(t => t.Order)
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

            var transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Take(100)
                .ToListAsync();

            return transactions.Select(t => new InventoryTransactionDto
            {
                TransactionId = t.TransactionId,
                IngredientName = t.Stock?.Ingredient?.Name ?? string.Empty,
                Type = t.Type,
                Quantity = t.Quantity,
                QuantityBefore = t.QuantityBefore,
                QuantityAfter = t.QuantityAfter,
                OrderCode = t.Order?.OrderCode,
                StaffName = t.Staff?.FullName,
                Note = t.Note,
                CreatedAt = t.CreatedAt
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
