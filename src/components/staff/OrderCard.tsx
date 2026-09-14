import { useState } from 'react';
import { apiClient } from '../../api/apiClient';

interface OrderCardProps {
  order: {
    orderId: number;
    orderCode: string;
    tableNumber?: string;
    customerName?: string;
    status: string;
    subTotal: number;
    totalAmount: number;
    items: Array<{
      menuItemName: string;
      sizeName?: string;
      quantity: number;
      unitPrice: number;
      sugarLevel: string;
      iceLevel: string;
      toppings?: string[];
      note?: string;
    }>;
    createdAt: string;
    note?: string;
  };
  onStatusUpdate: (orderId: number, newStatus: string) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'schedule',
    nextAction: { status: 'preparing', label: 'Chấp nhận', color: 'bg-blue-600 hover:bg-blue-700' }
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'restaurant',
    nextAction: { status: 'ready', label: 'Hoàn thành', color: 'bg-green-600 hover:bg-green-700' }
  },
  ready: {
    label: 'Sẵn sàng',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: 'check_circle',
    nextAction: { status: 'paid', label: 'Đã phục vụ', color: 'bg-gray-600 hover:bg-gray-700' }
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'paid',
    nextAction: null
  },
};

export default function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setLoading(true);
      await apiClient.put(`/orders/${order.orderId}/status`, { status: newStatus });
      onStatusUpdate(order.orderId, newStatus);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
      setLoading(true);
      await apiClient.put(`/orders/${order.orderId}/status`, { status: 'cancelled' });
      onStatusUpdate(order.orderId, 'cancelled');
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getElapsedTime = () => {
    const created = new Date(order.createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - created.getTime()) / 60000); // minutes
    
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    return `${hours} giờ trước`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">#{order.orderCode}</h3>
          <span className="text-sm opacity-90">{getElapsedTime()}</span>
        </div>
        <div className="flex items-center justify-between">
          {order.tableNumber && (
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-base">table_restaurant</span>
              <span>Bàn {order.tableNumber}</span>
            </div>
          )}
          {order.customerName && (
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-base">person</span>
              <span>{order.customerName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color} text-sm font-semibold`}>
          <span className="material-symbols-outlined text-base">{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-left mb-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <span className="font-semibold text-gray-900">
            {order.items.length} món ({order.items.reduce((sum, item) => sum + item.quantity, 0)} phần)
          </span>
          <span className={`material-symbols-outlined text-gray-600 transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {showDetails && (
          <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900">
                    {item.quantity}x {item.menuItemName}
                  </span>
                  <span className="text-gray-600">{item.unitPrice.toLocaleString()}đ</span>
                </div>
                {item.sizeName && (
                  <p className="text-gray-600 text-xs">Size: {item.sizeName}</p>
                )}
                <div className="flex gap-3 text-xs text-gray-600 mt-1">
                  <span>🧊 {item.iceLevel}</span>
                  <span>🍯 {item.sugarLevel}</span>
                </div>
                {item.toppings && item.toppings.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">+ {item.toppings.join(', ')}</p>
                )}
                {item.note && (
                  <p className="text-xs text-gray-500 italic mt-1">💬 {item.note}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Order Note */}
        {order.note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-base">info</span>
              <p className="text-sm text-yellow-800">{order.note}</p>
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="border-t border-gray-200 pt-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Tổng tiền:</span>
            <span className="text-xl font-bold text-orange-600">
              {order.totalAmount.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {statusConfig.nextAction && (
            <button
              onClick={() => handleStatusUpdate(statusConfig.nextAction!.status)}
              disabled={loading}
              className={`flex-1 ${statusConfig.nextAction.color} text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  <span>{statusConfig.nextAction.label}</span>
                </>
              )}
            </button>
          )}
          
          {order.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              disabled={loading}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
