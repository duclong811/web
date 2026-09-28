namespace WebCafe.Backend.Services.Abstraction;

public interface ISubscriptionService
{
    Task EnsureCanCreateStoreAsync(int tenantId);
    Task EnsureCanCreateStaffAsync(int tenantId);
    Task EnsureCanCreateTableAsync(int tenantId, int storeId);
    Task RefreshLifecycleAsync(int tenantId);
}
