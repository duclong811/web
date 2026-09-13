using Microsoft.AspNetCore.SignalR;
using WebCafe.Backend.Models.DTOs.Order;

namespace WebCafe.Backend.Hubs
{
    public interface IOrderHubClient
    {
        Task NewOrderReceived(OrderDto order);
        Task OrderStatusChanged(int orderId, string status, string orderCode);
        Task TableStatusChanged(int tableId, string status);
    }

    public class OrderHub : Hub<IOrderHubClient>
    {
        public async Task JoinStoreGroup(int storeId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"store_{storeId}");
        }

        public async Task LeaveStoreGroup(int storeId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"store_{storeId}");
        }

        public async Task JoinTableGroup(int tableId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"table_{tableId}");
        }
    }

    public interface IOrderNotificationService
    {
        Task NotifyNewOrderAsync(int storeId, OrderDto order);
        Task NotifyOrderStatusChangedAsync(int storeId, int? tableId, int orderId, string status, string orderCode);
        Task NotifyTableStatusChangedAsync(int storeId, int tableId, string status);
    }

    public class OrderNotificationService : IOrderNotificationService
    {
        private readonly IHubContext<OrderHub, IOrderHubClient> _hubContext;

        public OrderNotificationService(IHubContext<OrderHub, IOrderHubClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyNewOrderAsync(int storeId, OrderDto order)
        {
            await _hubContext.Clients.Group($"store_{storeId}").NewOrderReceived(order);
        }

        public async Task NotifyOrderStatusChangedAsync(int storeId, int? tableId, int orderId, string status, string orderCode)
        {
            await _hubContext.Clients.Group($"store_{storeId}").OrderStatusChanged(orderId, status, orderCode);
            if (tableId.HasValue)
            {
                await _hubContext.Clients.Group($"table_{tableId.Value}").OrderStatusChanged(orderId, status, orderCode);
            }
        }

        public async Task NotifyTableStatusChangedAsync(int storeId, int tableId, string status)
        {
            await _hubContext.Clients.Group($"store_{storeId}").TableStatusChanged(tableId, status);
        }
    }
}
