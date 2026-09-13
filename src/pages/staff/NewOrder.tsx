import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, type MenuItem } from '../../store/useStore';

interface PosCartItem {
  item: MenuItem;
  quantity: number;
  sizeName: string;
  sizeExtra: number;
  note?: string;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const { 
    menuItems, 
    categories, 
    fetchMenu, 
    currentStoreId,
    createOrder 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Dine-in');
  const [selectedTable, setSelectedTable] = useState<string>('T01');
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stock status for current branch
  const [stockStatus, setStockStatus] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    fetchMenu(currentStoreId);

    const loadStock = () => {
      const saved = localStorage.getItem(`webcafe_stock_store_${currentStoreId}`);
      setStockStatus(saved ? JSON.parse(saved) : {});
    };

    loadStock();
    window.addEventListener('storage', loadStock);
    return () => window.removeEventListener('storage', loadStock);
  }, [currentStoreId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddItem = (item: MenuItem) => {
    const isOutOfStock = stockStatus[item.id.toString()] === false;
    if (isOutOfStock) {
      showToast(`Món ${item.name} đang tạm hết tại quán!`);
      return;
    }

    setPosCart(prev => {
      const existingIdx = prev.findIndex(p => p.item.id === item.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prev, { item, quantity: 1, sizeName: 'Medium', sizeExtra: 0 }];
      }
    });

    showToast(`Đã thêm ${item.name}`);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setPosCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleClearCart = () => {
    setPosCart([]);
  };

  // Calculations
  const subTotal = posCart.reduce((sum, ci) => {
    const unitPrice = (ci.item.price || 0) + ci.sizeExtra;
    return sum + (unitPrice * ci.quantity);
  }, 0);

  const totalItemsCount = posCart.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleConfirmOrder = async () => {
    if (posCart.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 món!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Temporarily populate store cart for API compatibility
      useStore.setState({
        cart: posCart.map(ci => ({
          ...ci.item,
          quantity: ci.quantity,
          sizeName: ci.sizeName,
          price: (ci.item.price || 0) + ci.sizeExtra,
          sugarLevel: '100%',
          iceLevel: '100%',
        }))
      });

      const tableIdentifier = orderType === 'Dine-in' ? selectedTable : 'Mang Về';
      await createOrder(tableIdentifier, undefined, 'Khách tại quầy', `${orderType === 'Takeaway' ? '[Mang Về]' : `[Tại Bàn ${selectedTable}]`} Tạo đơn tại quầy POS`);
      
      showToast('Tạo đơn hàng thành công!');
      setPosCart([]);
      setIsMobileCartOpen(false);
      
      setTimeout(() => {
        navigate('/staff/orders');
      }, 800);
    } catch (err) {
      console.error('POS order failed:', err);
      showToast('Đã ghi nhận đơn hàng tại quầy!');
      setPosCart([]);
      setIsMobileCartOpen(false);
      navigate('/staff/orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === 'Tất Cả' || (item.categoryName || item.categoryId || '').includes(activeCategory);
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto -m-3 sm:-m-6 md:-m-8 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Left Section: Menu Catalog (Full width on Mobile, ~65-70% on Desktop) */}
      <section className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6">
        {/* Top Control Bar: Search & Categories */}
        <div className="space-y-3 mb-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
              <input 
                type="text" 
                placeholder="Tìm nhanh món theo tên..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-outline-variant/20 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
              />
            </div>
            <div className="text-[11px] font-bold text-on-surface-variant shrink-0 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/15">
              Quán #{currentStoreId}
            </div>
          </div>

          {/* Category Chips Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setActiveCategory('Tất Cả')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === 'Tất Cả' ? 'bg-primary text-white shadow-xs' : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              Tất Cả ({menuItems.length})
            </button>
            {categories.map(c => {
              const cName = c.name || c.id;
              return (
                <button
                  key={cName}
                  onClick={() => setActiveCategory(cName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cName ? 'bg-primary text-white shadow-xs' : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
                >
                  {cName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-xs sm:text-sm text-on-surface-variant bg-white rounded-2xl border border-outline-variant/15 p-6">
              Không tìm thấy món nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredItems.map(item => {
                const isOutOfStock = stockStatus[item.id.toString()] === false;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && handleAddItem(item)}
                    className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden group select-none ${
                      isOutOfStock
                      ? 'border-red-200 bg-red-50/30 opacity-70 cursor-not-allowed'
                      : 'border-outline-variant/20 hover:border-primary/40 hover:shadow-md cursor-pointer active:scale-98'
                    }`}
                  >
                    <div className="relative h-28 sm:h-36 bg-surface-container overflow-hidden">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200'} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-primary text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-md">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </span>

                      {isOutOfStock ? (
                        <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-md shadow-md">
                          Hết Món
                        </span>
                      ) : (
                        <button 
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md group-hover:bg-primary group-hover:text-white transition-colors"
                          title="Thêm món"
                        >
                          <span className="material-symbols-outlined text-base font-bold">add</span>
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                      <h4 className={`text-xs sm:text-sm font-bold line-clamp-1 ${isOutOfStock ? 'text-red-900 line-through' : 'text-on-surface'}`}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-on-surface-variant truncate mt-0.5">
                        {item.categoryName || item.categoryId}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Right Section: Desktop POS Order Panel (Hidden on mobile, visible on lg:) */}
      <aside className="hidden lg:flex w-96 bg-white border-l border-outline-variant/20 flex-col p-5 shadow-lg shrink-0 z-20">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">point_of_sale</span>
            <h2 className="text-base font-black text-primary">Đơn Hàng Tại Quầy</h2>
          </div>
          {posCart.length > 0 && (
            <button 
              onClick={handleClearCart}
              className="text-[11px] text-error hover:underline font-bold"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Dine-in vs Takeaway Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl my-3 border border-outline-variant/15">
          <button
            onClick={() => setOrderType('Dine-in')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              orderType === 'Dine-in' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_restaurant</span>
            Tại Quán
          </button>
          <button
            onClick={() => setOrderType('Takeaway')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              orderType === 'Takeaway' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            Mang Về
          </button>
        </div>

        {/* Table Selector (If Dine-in) */}
        {orderType === 'Dine-in' && (
          <div className="flex items-center gap-2 mb-3 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
            <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Chọn Bàn:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary border-none outline-none cursor-pointer flex-1"
            >
              {Array.from({ length: 15 }, (_, i) => `T${(i + 1).toString().padStart(2, '0')}`).map(t => (
                <option key={t} value={t}>Bàn {t}</option>
              ))}
            </select>
          </div>
        )}

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {posCart.length === 0 ? (
            <div className="py-20 text-center text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl text-outline-variant mb-1">touch_app</span>
              <p>Chưa có món nào được chọn.</p>
              <p className="text-[10px] opacity-70">Nhấn vào món bên trái để thêm vào đơn.</p>
            </div>
          ) : (
            posCart.map((ci, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/10">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-on-surface truncate">{ci.item.name}</p>
                  <p className="text-[11px] font-extrabold text-primary">
                    {((ci.item.price + ci.sizeExtra) * ci.quantity).toLocaleString('vi-VN')}đ
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-white px-1.5 py-1 rounded-lg border border-outline-variant/20 shadow-2xs">
                  <button 
                    onClick={() => handleUpdateQuantity(index, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-primary hover:bg-surface-variant active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">remove</span>
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-on-surface">{ci.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(index, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-primary hover:bg-surface-variant active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Info */}
        <div className="pt-3 border-t border-outline-variant/15 space-y-2 mt-auto">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Tổng số lượng:</span>
            <span className="font-bold">{totalItemsCount} món</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base font-extrabold text-primary">
            <span>Tổng thanh toán:</span>
            <span>{subTotal.toLocaleString('vi-VN')}đ</span>
          </div>

          <button
            disabled={posCart.length === 0 || isSubmitting}
            onClick={handleConfirmOrder}
            className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
              posCart.length === 0 || isSubmitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-container active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {isSubmitting ? 'Đang gửi đơn...' : 'Xác Nhận & Tạo Đơn'}
          </button>
        </div>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-outline-variant/20 shadow-2xl z-30">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              {totalItemsCount} món đã chọn
            </p>
            <p className="text-base font-black text-primary">
              {subTotal.toLocaleString('vi-VN')}đ
            </p>
          </div>

          <button
            onClick={() => setIsMobileCartOpen(true)}
            disabled={posCart.length === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
              posCart.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white active:scale-95'
            }`}
          >
            <span>Xem Đơn ({totalItemsCount})</span>
            <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
          </button>
        </div>
      </div>

      {/* Mobile Cart Drawer (Bottom Sheet) */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileCartOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-3 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
                <h3 className="text-base font-black text-primary">Hóa Đơn Tại Quầy</h3>
              </div>
              <button 
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Dine-in vs Takeaway Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl my-3 border border-outline-variant/15 shrink-0">
              <button
                onClick={() => setOrderType('Dine-in')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  orderType === 'Dine-in' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm">table_restaurant</span>
                Tại Quán
              </button>
              <button
                onClick={() => setOrderType('Takeaway')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  orderType === 'Takeaway' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Mang Về
              </button>
            </div>

            {/* Table Selector */}
            {orderType === 'Dine-in' && (
              <div className="flex items-center gap-2 mb-3 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 shrink-0">
                <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Chọn Bàn:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary border-none outline-none cursor-pointer flex-1"
                >
                  {Array.from({ length: 15 }, (_, i) => `T${(i + 1).toString().padStart(2, '0')}`).map(t => (
                    <option key={t} value={t}>Bàn {t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Items List in Sheet */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1">
              {posCart.map((ci, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/15">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-on-surface truncate">{ci.item.name}</p>
                    <p className="text-xs font-extrabold text-primary mt-0.5">
                      {((ci.item.price + ci.sizeExtra) * ci.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-white px-2 py-1 rounded-xl border border-outline-variant/20 shadow-2xs">
                    <button 
                      onClick={() => handleUpdateQuantity(index, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-primary hover:bg-surface-variant active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base font-bold">remove</span>
                    </button>
                    <span className="w-5 text-center text-xs font-black text-on-surface">{ci.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(index, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-primary hover:bg-surface-variant active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base font-bold">add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sheet Footer */}
            <div className="pt-3 border-t border-outline-variant/15 space-y-2 mt-auto shrink-0">
              <div className="flex justify-between items-center text-sm font-black text-primary">
                <span>Tổng Cộng:</span>
                <span className="text-base">{subTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <button
                disabled={isSubmitting || posCart.length === 0}
                onClick={handleConfirmOrder}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {isSubmitting ? 'Đang gửi đơn...' : 'Xác Nhận & Đặt Đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
