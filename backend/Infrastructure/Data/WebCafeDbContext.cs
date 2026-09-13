using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Models.Entities;

namespace WebCafe.Backend.Infrastructure.Data
{
    public class WebCafeDbContext : DbContext
    {
        public WebCafeDbContext(DbContextOptions<WebCafeDbContext> options) : base(options)
        {
        }

        public DbSet<SystemAdmin> SystemAdmins => Set<SystemAdmin>();
        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<Store> Stores => Set<Store>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<MenuItem> MenuItems => Set<MenuItem>();
        public DbSet<Size> Sizes => Set<Size>();
        public DbSet<MenuItemSize> MenuItemSizes => Set<MenuItemSize>();
        public DbSet<Topping> Toppings => Set<Topping>();
        public DbSet<MenuItemTopping> MenuItemToppings => Set<MenuItemTopping>();
        public DbSet<Table> Tables => Set<Table>();
        public DbSet<Staff> Staff => Set<Staff>();
        public DbSet<Shift> Shifts => Set<Shift>();
        public DbSet<StaffShift> StaffShifts => Set<StaffShift>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();
        public DbSet<VoucherUsage> VoucherUsages => Set<VoucherUsage>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<OrderItemTopping> OrderItemToppings => Set<OrderItemTopping>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<LoyaltyPoint> LoyaltyPoints => Set<LoyaltyPoint>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraints
            modelBuilder.Entity<Tenant>().HasIndex(t => t.Slug).IsUnique();
            modelBuilder.Entity<Tenant>().HasIndex(t => t.OwnerEmail).IsUnique();
            modelBuilder.Entity<SystemAdmin>().HasIndex(a => a.Username).IsUnique();
            modelBuilder.Entity<Permission>().HasIndex(p => p.Code).IsUnique();
            modelBuilder.Entity<Role>().HasIndex(r => new { r.TenantId, r.Name }).IsUnique();
            modelBuilder.Entity<RolePermission>().HasIndex(rp => new { rp.RoleId, rp.PermissionId }).IsUnique();
            modelBuilder.Entity<Category>().HasIndex(c => new { c.TenantId, c.Name }).IsUnique();
            modelBuilder.Entity<Size>().HasIndex(s => new { s.TenantId, s.Name }).IsUnique();
            modelBuilder.Entity<MenuItemSize>().HasIndex(ms => new { ms.MenuItemId, ms.SizeId }).IsUnique();
            modelBuilder.Entity<MenuItemTopping>().HasIndex(mt => new { mt.MenuItemId, mt.ToppingId }).IsUnique();
            modelBuilder.Entity<Table>().HasIndex(t => new { t.StoreId, t.TableNumber }).IsUnique();
            modelBuilder.Entity<Customer>().HasIndex(c => new { c.TenantId, c.Phone }).IsUnique();
            modelBuilder.Entity<Voucher>().HasIndex(v => new { v.TenantId, v.Code }).IsUnique();
            modelBuilder.Entity<Order>().HasIndex(o => new { o.TenantId, o.OrderCode }).IsUnique();

            // Disable cascade delete globally or specifically to eliminate SQL Server cycle errors (1785)
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // Specific relationships configuration
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Table)
                .WithMany(t => t.Orders)
                .HasForeignKey(o => o.TableId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Staff)
                .WithMany(s => s.HandledOrders)
                .HasForeignKey(o => o.StaffId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
