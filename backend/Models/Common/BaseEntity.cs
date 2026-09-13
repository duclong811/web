namespace WebCafe.Backend.Models.Common
{
    public abstract class BaseEntity
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public abstract class AuditableEntity : BaseEntity
    {
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
