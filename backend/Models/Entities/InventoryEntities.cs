using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebCafe.Backend.Models.Entities
{
    // Nguyên liệu thô
    public class Ingredient
    {
        [Key]
        public int IngredientId { get; set; }

        public int TenantId { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Unit { get; set; } = "kg"; // kg, lít, gói, hộp, ...

        [Column(TypeName = "decimal(12,2)")]
        public decimal MinimumStock { get; set; } = 0; // Ngưỡng cảnh báo hết hàng

        [MaxLength(300)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        public ICollection<InventoryStock> InventoryStocks { get; set; } = new List<InventoryStock>();
        public ICollection<MenuItemRecipe> MenuItemRecipes { get; set; } = new List<MenuItemRecipe>();
        public ICollection<ToppingRecipe> ToppingRecipes { get; set; } = new List<ToppingRecipe>();
    }

    // Tồn kho theo từng cửa hàng
    public class InventoryStock
    {
        [Key]
        public int StockId { get; set; }

        public int StoreId { get; set; }
        public int IngredientId { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal CurrentQuantity { get; set; } = 0;

        public DateTime? LastUpdated { get; set; }

        [ForeignKey(nameof(StoreId))]
        public Store? Store { get; set; }

        [ForeignKey(nameof(IngredientId))]
        public Ingredient? Ingredient { get; set; }

        public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
    }

    // Lịch sử giao dịch kho
    public class InventoryTransaction
    {
        [Key]
        public int TransactionId { get; set; }

        public int StockId { get; set; }

        [Required, MaxLength(20)]
        public string Type { get; set; } = "import"; // import, export, adjustment, deduction

        [Column(TypeName = "decimal(12,2)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal QuantityBefore { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal QuantityAfter { get; set; }

        public int? OrderId { get; set; }
        public int? StaffId { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(StockId))]
        public InventoryStock? Stock { get; set; }

        [ForeignKey(nameof(OrderId))]
        public Order? Order { get; set; }

        [ForeignKey(nameof(StaffId))]
        public Staff? Staff { get; set; }
    }

    // Công thức món ăn (định nghĩa nguyên liệu cần cho mỗi món)
    public class MenuItemRecipe
    {
        [Key]
        public int RecipeId { get; set; }

        public int MenuItemId { get; set; }
        public int IngredientId { get; set; }
        public int? SizeId { get; set; } // Null = áp dụng cho tất cả size

        [Column(TypeName = "decimal(12,2)")]
        public decimal QuantityRequired { get; set; } // Số lượng nguyên liệu cần cho 1 phần

        [ForeignKey(nameof(MenuItemId))]
        public MenuItem? MenuItem { get; set; }

        [ForeignKey(nameof(IngredientId))]
        public Ingredient? Ingredient { get; set; }

        [ForeignKey(nameof(SizeId))]
        public Size? Size { get; set; }
    }

    // Công thức topping (định nghĩa nguyên liệu cần cho mỗi topping)
    public class ToppingRecipe
    {
        [Key]
        public int ToppingRecipeId { get; set; }

        public int ToppingId { get; set; }
        public int IngredientId { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal QuantityRequired { get; set; }

        [ForeignKey(nameof(ToppingId))]
        public Topping? Topping { get; set; }

        [ForeignKey(nameof(IngredientId))]
        public Ingredient? Ingredient { get; set; }
    }
}
