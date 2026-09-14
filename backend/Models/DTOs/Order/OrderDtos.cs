using System.ComponentModel.DataAnnotations;

namespace WebCafe.Backend.Models.DTOs.Order
{
    public class CreateOrderItemToppingDto
    {
        public int ToppingId { get; set; }
    }

    public class CreateOrderItemDto
    {
        public int MenuItemId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; } = 1;
        public string SugarLevel { get; set; } = "100%";
        public string IceLevel { get; set; } = "100%";
        public string? Note { get; set; }
        public List<CreateOrderItemToppingDto>? Toppings { get; set; }
    }

    public class CreateOrderDto
    {
        public int StoreId { get; set; }
        public int? TableId { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerName { get; set; }
        
        // Guest Order Support
        public string? GuestId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        
        public string? VoucherCode { get; set; }
        public int PointsToUse { get; set; } = 0;
        public string? Note { get; set; }
        [Required]
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemToppingDto
    {
        public int OrderItemToppingId { get; set; }
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal ToppingTotal { get; set; }
        public decimal SubTotal { get; set; }
        public string SugarLevel { get; set; } = "100%";
        public string IceLevel { get; set; } = "100%";
        public string? Note { get; set; }
        public List<OrderItemToppingDto> Toppings { get; set; } = new();
    }

    public class OrderDto
    {
        public int OrderId { get; set; }
        public int TenantId { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public int? TableId { get; set; }
        public string? TableNumber { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        
        // Guest Order Fields
        public string? GuestId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        
        public string Status { get; set; } = "pending";
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public int PointsUsed { get; set; }
        public int PointsEarned { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = "confirmed";
    }
}
