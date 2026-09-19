using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Inventory
{
    public class IngredientDto
    {
        public int IngredientId { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = "kg";
        public decimal MinimumStock { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public decimal CurrentStock { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateIngredientDto
    {
        public int TenantId { get; set; }
        public int StoreId { get; set; } = 1;

        [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Đơn vị tính không được để trống")]
        [MaxLength(50)]
        public string Unit { get; set; } = "kg";

        public decimal MinimumStock { get; set; } = 0;
        public decimal InitialStock { get; set; } = 0;

        [MaxLength(300)]
        public string? Description { get; set; }
    }

    public class UpdateIngredientDto
    {
        [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Đơn vị tính không được để trống")]
        [MaxLength(50)]
        public string Unit { get; set; } = "kg";

        public decimal MinimumStock { get; set; } = 0;

        [MaxLength(300)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class MenuItemRecipeDto
    {
        public int RecipeId { get; set; }
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public decimal QuantityRequired { get; set; }
    }

    public class UpsertRecipeDto
    {
        public int MenuItemId { get; set; }
        public int IngredientId { get; set; }
        public int? SizeId { get; set; }

        [Range(0.001, 10000, ErrorMessage = "Số lượng định lượng phải lớn hơn 0")]
        public decimal QuantityRequired { get; set; }
    }

    public class LowStockAlertDto
    {
        public int StockId { get; set; }
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public decimal MinimumStock { get; set; }
        public decimal Deficit => MinimumStock - CurrentQuantity;
        public DateTime? LastUpdated { get; set; }
    }
}
