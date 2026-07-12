import { useState } from 'react';
import { useStore, type OrderStatus } from '../../store/useStore';

export default function OrderDashboard() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState('All');

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = orders.filter(o => filter === 'All' || o.status === filter.toLowerCase());

  const getStatusStyles = (status: OrderStatus) => {
    switch(status) {
      case 'pending':
        return {
          card: "glass-card rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md",
          badge: "bg-tertiary-fixed text-on-tertiary-fixed",
          badgeText: "Chờ xác nhận",
          btn: "bg-primary text-on-primary shadow-primary/20",
          btnText: "Bắt đầu pha chế",
          nextStatus: "preparing" as OrderStatus
        };
      case 'preparing':
        return {
          card: "glass-card rounded-2xl p-6 shadow-sm border-2 border-primary/10 flex flex-col transition-all hover:shadow-md relative overflow-hidden",
          badge: "bg-primary-container text-on-primary-container",
          badgeText: "Đang pha chế",
          btn: "bg-secondary text-on-secondary shadow-md",
          btnText: "Hoàn tất",
          nextStatus: "done" as OrderStatus
        };
      case 'done':
        return {
          card: "glass-card rounded-2xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md opacity-90",
          badge: "bg-secondary-fixed text-on-secondary-fixed-variant flex items-center gap-1",
          badgeText: "Hoàn thành",
          btn: "bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant",
          btnText: "Đã giao / Thanh toán",
          nextStatus: "paid" as OrderStatus
        };
      case 'paid':
        return {
          card: "glass-card rounded-2xl p-6 shadow-sm flex flex-col transition-all opacity-60 grayscale-[0.2]",
          badge: "bg-outline-variant text-on-surface-variant",
          badgeText: "Đã thanh toán",
          btn: "hidden",
          btnText: "",
          nextStatus: "paid" as OrderStatus
        };
      default:
        return { card: "", badge: "", badgeText: "", btn: "", btnText: "", nextStatus: "pending" as OrderStatus };
    }
  };

  return (
    <>
      <header className="flex justify-between items-end mb-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Live Orders</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and track your customer orders in real-time.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border border-outline-variant px-3 py-1.5 rounded-lg shadow-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-2">Trạng thái:</span>
            <select 
              className="bg-transparent border-none focus:ring-0 font-label-md text-label-md text-primary py-0 cursor-pointer outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Tất cả</option>
              <option value="Pending">Chờ xác nhận</option>
              <option value="Preparing">Đang pha chế</option>
              <option value="Done">Hoàn thành</option>
            </select>
          </div>
        </div>
      </header>

      {/* Bento-inspired Grid for Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-gutter">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant">No orders found.</div>
        ) : (
          filteredOrders.map(order => {
            const styles = getStatusStyles(order.status);
            
            return (
              <div key={order.id} className={styles.card}>
                {order.status === 'preparing' && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Order ID</span>
                    <h3 className="font-headline-md text-headline-md text-primary">#{order.id.slice(-5)}</h3>
                  </div>
                  <span className={`px-3 py-1 text-label-sm font-label-sm rounded-full ${styles.badge}`}>
                    {order.status === 'done' && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                    {styles.badgeText}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                    T{order.tableNumber.replace('table-', '')}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Table {order.tableNumber.replace('table-', '')}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Just now</p>
                  </div>
                </div>
                
                <div className="flex-1 mb-6 py-4 border-t border-b border-outline-variant/20">
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between font-body-md text-body-md">
                        <span className={order.status === 'paid' ? 'opacity-80' : ''}>{item.quantity}x {item.name}</span>
                        {order.status !== 'paid' && <span className="font-label-md">{(item.price * item.quantity).toLocaleString()}đ</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-md text-label-md text-on-surface-variant">Tổng cộng</span>
                  <span className="font-headline-md text-headline-md text-primary">{order.total.toLocaleString()}đ</span>
                </div>
                
                {order.status !== 'paid' && (
                  <button 
                    onClick={() => handleStatusChange(order.id, styles.nextStatus)}
                    className={`w-full py-3 rounded-xl font-label-md text-label-md transition-all active:scale-95 shadow-lg ${styles.btn}`}
                  >
                    {styles.btnText}
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Placeholder for Empty State/Add */}
        <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center text-on-surface-variant/40 hover:text-on-surface-variant/60 hover:border-outline-variant/60 transition-all cursor-pointer min-h-[300px]">
          <span className="material-symbols-outlined text-4xl mb-2">post_add</span>
          <p className="font-label-md text-label-md">Tạo đơn mới tại quầy</p>
        </div>
      </div>

      {/* Task FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary-container text-on-primary-container rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </>
  );
}
