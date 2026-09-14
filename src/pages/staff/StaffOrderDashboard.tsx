import { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import OrderCard from '../../components/staff/OrderCard';
import StatusFilter from '../../components/staff/StatusFilter';
import { signalRService } from '../../api/signalr';
import { notificationService } from '../../services/notificationService';

interface Order {
  orderId: number;
  orderCode: string;
  tableNumber?: string;
  customerName?: string;
  status: string;
  subTotal: number;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  note?: string;
}

interface OrderItem {
  menuItemName: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  sugarLevel: string;
  iceLevel: string;
  toppings?: string[];
  note?: string;
}

type OrderStatus = 'all' | 'pending' | 'preparing' | 'ready' | 'paid';

export default function StaffOrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const storeId = 1; // TODO: Get from auth store or context
      const response = await apiClient.get(`/orders/active/store/${storeId}`);
      console.log('📥 Raw API response:', response.data);
      
      const ordersData = response.data.data || [];
      console.log('📦 Mapped orders data:', ordersData);
      
      // Map backend DTO to frontend Order interface
      const mappedOrders: Order[] = ordersData.map((dto: any) => ({
        orderId: dto.orderId,
        orderCode: dto.orderCode,
        tableNumber: dto.tableNumber || 'Mang về',
        customerName: dto.customerName || dto.guestName || 'Khách',
        status: dto.status,
        subTotal: dto.subTotal,
        totalAmount: dto.totalAmount,
        items: dto.items || [],
        createdAt: dto.createdAt,
        note: dto.note,
      }));
      
      setOrders(mappedOrders);
      filterOrders(mappedOrders, activeFilter);
      console.log(`✅ Loaded ${mappedOrders.length} orders`);
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể tải danh sách đơn hàng';
      setError(errorMsg);
      console.error('❌ Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Connect to SignalR hub
    const setupSignalR = async () => {
      try {
        // Start connection with storeId
        const storeId = 1; // TODO: Get from auth or context
        
        // Register event listeners BEFORE starting connection
        signalRService.onNewOrder((order: any) => {
          console.log('📦 New order received:', order);
          const mappedOrder: Order = {
            orderId: order.orderId,
            orderCode: order.orderCode,
            tableNumber: order.tableNumber || 'Mang về',
            customerName: order.customerName || order.guestName || 'Khách',
            status: order.status,
            subTotal: order.subTotal,
            totalAmount: order.totalAmount,
            items: order.items || [],
            createdAt: order.createdAt,
            note: order.note,
          };
          setOrders(prevOrders => [mappedOrder, ...prevOrders]);
          
          // Play notification sound
          if (soundEnabled) {
            notificationService.playNewOrderSound();
          }

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Đơn hàng mới!', {
              body: `Đơn #${order.orderCode} - ${order.items?.length || 0} món`,
              icon: '/favicon.ico',
              tag: order.orderCode,
            });
          }
        });

        // Listen to order status changes
        signalRService.onOrderStatusChanged((orderId: number, status: string, orderCode: string) => {
          console.log('🔄 Order status changed:', { orderId, status, orderCode });
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.orderId === orderId
                ? { ...order, status }
                : order
            )
          );
          
          if (soundEnabled) {
            notificationService.playStatusChangeSound();
          }
        });

        // NOW start the connection
        await signalRService.startConnection(storeId);
        setIsConnected(true);
        console.log('✅ SignalR setup complete');

      } catch (err) {
        console.error('❌ SignalR connection error:', err);
        setIsConnected(false);
      }
    };

    setupSignalR();

    // Refresh every 60 seconds as backup
    const interval = setInterval(fetchOrders, 60000);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(interval);
      signalRService.stopConnection();
    };
  }, [soundEnabled]);

  // Auto-filter orders when orders or activeFilter changes
  useEffect(() => {
    filterOrders(orders, activeFilter);
  }, [orders, activeFilter]);

  // Filter orders by status
  const filterOrders = (ordersList: Order[], status: OrderStatus) => {
    if (status === 'all') {
      setFilteredOrders(ordersList);
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === status));
    }
  };

  const handleFilterChange = (status: OrderStatus) => {
    setActiveFilter(status);
    filterOrders(orders, status);
  };

  // Count orders by status
  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      paid: orders.filter(o => o.status === 'paid').length,
    };
  };

  const statusCounts = getStatusCounts();

  // Handle order status update
  const handleOrderUpdate = (orderId: number, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
    // No need to call filterOrders - useEffect will handle it
  };

  const toggleSound = () => {
    const newState = notificationService.toggle();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
              <p className="text-sm text-gray-600 mt-1">
                Tổng đơn: <span className="font-semibold text-orange-600">{orders.length}</span> đơn
                {isConnected && (
                  <span className="ml-3 inline-flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    <span className="font-medium">Kết nối</span>
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`p-2.5 rounded-lg border-2 transition-colors ${
                  soundEnabled
                    ? 'bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-gray-50 border-gray-300 text-gray-400'
                }`}
                title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                <span className="material-symbols-outlined text-xl">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Filter */}
        <StatusFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={statusCounts}
        />

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="material-symbols-outlined">error</span>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-600"></div>
              <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có đơn hàng
            </h3>
            <p className="text-gray-600">
              {activeFilter === 'all' 
                ? 'Chưa có đơn hàng nào trong hệ thống'
                : `Không có đơn hàng ở trạng thái "${activeFilter}"`}
            </p>
          </div>
        ) : (
          /* Orders Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onStatusUpdate={handleOrderUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
