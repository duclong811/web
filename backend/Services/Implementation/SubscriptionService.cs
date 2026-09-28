using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Exceptions;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation;

public sealed class SubscriptionService : ISubscriptionService
{
    private readonly WebCafeDbContext _db;
    public SubscriptionService(WebCafeDbContext db) => _db = db;

    public async Task RefreshLifecycleAsync(int tenantId)
    {
        var subscription = await _db.TenantSubscriptions.Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId && s.Status != "cancelled" && s.Status != "suspended")
            .OrderByDescending(s => s.CreatedAt).FirstOrDefaultAsync();
        if (subscription == null) return;
        var now = DateTime.UtcNow;
        if (subscription.Status == "trialing" && subscription.TrialEndsAt.HasValue && subscription.TrialEndsAt <= now)
        {
            subscription.Status = "grace";
            subscription.GraceEndsAt = now.AddDays(7);
        }
        else if (subscription.Status == "active" && subscription.CurrentPeriodEnd.HasValue && subscription.CurrentPeriodEnd <= now)
        {
            subscription.Status = "grace";
            subscription.GraceEndsAt = now.AddDays(7);
        }
        else if (subscription.Status == "grace" && subscription.GraceEndsAt.HasValue && subscription.GraceEndsAt <= now)
        {
            subscription.Status = "suspended";
        }
        await _db.SaveChangesAsync();
    }

    public async Task EnsureCanCreateStoreAsync(int tenantId)
    {
        var plan = await GetPlanAsync(tenantId);
        var count = await _db.Stores.CountAsync(s => s.TenantId == tenantId && s.IsActive);
        EnsureActive(plan, count < plan.MaxStores, "Đã đạt giới hạn số cửa hàng của gói dịch vụ.");
    }

    public async Task EnsureCanCreateStaffAsync(int tenantId)
    {
        var plan = await GetPlanAsync(tenantId);
        var count = await _db.Staff.CountAsync(s => s.Store != null && s.Store.TenantId == tenantId && s.IsActive);
        EnsureActive(plan, count < plan.MaxStaff, "Đã đạt giới hạn số nhân viên của gói dịch vụ.");
    }

    public async Task EnsureCanCreateTableAsync(int tenantId, int storeId)
    {
        var plan = await GetPlanAsync(tenantId);
        var count = await _db.Tables.CountAsync(t => t.StoreId == storeId && t.IsActive);
        EnsureActive(plan, count < plan.MaxTablesPerStore, "Đã đạt giới hạn số bàn của gói dịch vụ.");
    }

    private async Task<Models.Entities.SubscriptionPlan> GetPlanAsync(int tenantId)
    {
        await RefreshLifecycleAsync(tenantId);
        var subscription = await _db.TenantSubscriptions.Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId && (s.Status == "active" || s.Status == "trialing" || s.Status == "grace"))
            .OrderByDescending(s => s.CreatedAt).FirstOrDefaultAsync();
        if (subscription?.Plan == null) throw new ForbiddenException("Tenant chưa có gói dịch vụ hợp lệ.");
        return subscription.Plan;
    }

    private static void EnsureActive(Models.Entities.SubscriptionPlan plan, bool withinLimit, string message)
    {
        if (!plan.IsActive || !withinLimit) throw new ForbiddenException(message);
    }
}
