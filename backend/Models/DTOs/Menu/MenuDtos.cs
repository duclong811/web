using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Menu
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public int SortOrder { get; set; } = 0;
    }

    public class SizeDto
    {
        public int SizeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal ExtraPrice { get; set; }
    }

    public class ToppingDto
    {
        public int ToppingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class MenuItemDto
    {
        public int MenuItemId { get; set; }
        public int TenantId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Rating { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsAvailable { get; set; }
        public int SortOrder { get; set; }
        public List<SizeDto> Sizes { get; set; } = new();
        public List<ToppingDto> Toppings { get; set; } = new();
    }

    public class CreateMenuItemDto
    {
        public int CategoryId { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsFeatured { get; set; } = false;
        public bool IsAvailable { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public List<int>? SizeIds { get; set; }
        public List<int>? ToppingIds { get; set; }
    }

    public class StoreMenuResponse
    {
        public int StoreId { get; set; }
        public int TenantId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? BankAccount { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountName { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public List<CategoryDto> Categories { get; set; } = new();
        public List<MenuItemDto> MenuItems { get; set; } = new();
    }
}
