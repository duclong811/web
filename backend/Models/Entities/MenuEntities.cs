using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebCafe.Backend.Models.Entities
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        public int TenantId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Icon { get; set; }

        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false; // Soft delete
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }

    public class MenuItem
    {
        [Key]
        public int MenuItemId { get; set; }

        public int TenantId { get; set; }
        public int CategoryId { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(12,0)")]
        public decimal BasePrice { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Column(TypeName = "decimal(2,1)")]
        public decimal Rating { get; set; } = 0;

        public bool IsFeatured { get; set; } = false;
        public bool IsAvailable { get; set; } = true;
        public bool IsDeleted { get; set; } = false; // Soft delete
        public int SortOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }

        public ICollection<MenuItemSize> MenuItemSizes { get; set; } = new List<MenuItemSize>();
        public ICollection<MenuItemTopping> MenuItemToppings { get; set; } = new List<MenuItemTopping>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class Size
    {
        [Key]
        public int SizeId { get; set; }

        public int TenantId { get; set; }

        [Required, MaxLength(20)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        public ICollection<MenuItemSize> MenuItemSizes { get; set; } = new List<MenuItemSize>();
    }

    public class MenuItemSize
    {
        [Key]
        public int MenuItemSizeId { get; set; }

        public int MenuItemId { get; set; }
        public int SizeId { get; set; }

        [Column(TypeName = "decimal(12,0)")]
        public decimal ExtraPrice { get; set; } = 0;

        [ForeignKey(nameof(MenuItemId))]
        public MenuItem? MenuItem { get; set; }

        [ForeignKey(nameof(SizeId))]
        public Size? Size { get; set; }
    }

    public class Topping
    {
        [Key]
        public int ToppingId { get; set; }

        public int TenantId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(12,0)")]
        public decimal Price { get; set; }

        public bool IsAvailable { get; set; } = true;

        [ForeignKey(nameof(TenantId))]
        public Tenant? Tenant { get; set; }

        public ICollection<MenuItemTopping> MenuItemToppings { get; set; } = new List<MenuItemTopping>();
    }

    public class MenuItemTopping
    {
        [Key]
        public int MenuItemToppingId { get; set; }

        public int MenuItemId { get; set; }
        public int ToppingId { get; set; }

        [ForeignKey(nameof(MenuItemId))]
        public MenuItem? MenuItem { get; set; }

        [ForeignKey(nameof(ToppingId))]
        public Topping? Topping { get; set; }
    }
}
