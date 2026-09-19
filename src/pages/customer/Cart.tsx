import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import MobileBottomNav from '../../components/MobileBottomNav';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function Cart() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    createOrder, 
    currentTable,
    appliedVoucherCode,
    voucherDiscount,
    setVoucher,
    guestSession,
    updateGuestInfo
  } = useStore();

  const navigate = useNavigate();
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = voucherDiscount ? (subtotal * voucherDiscount / 100) : 0;
  const serviceFee = cart.length > 0 ? 0 : 0;
  const total = Math.max(0, subtotal - discountAmount + serviceFee);

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    if (voucherInput.toUpperCase() === 'WELCOME50' || voucherInput.toUpperCase() === 'GIAM10') {
      setVoucher(voucherInput.toUpperCase(), 10);
      setVoucherError('');
    } else {
      setVoucherError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Update guest info before checkout
      if (guestSession) {
        updateGuestInfo(customerName, customerPhone);
      }
      
      const tableToUse = guestSession?.tableId || currentTable || 'T01';
      const order = await createOrder(tableToUse, customerPhone, customerName, orderNote);
      navigate(`/order-success?code=${order.orderCode}&orderId=${order.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      navigate('/order-success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-on-surface custom-scrollbar min-h-screen flex flex-col bg-background">
      {/* TopNavBar */}
      <nav className="bg-surface sticky top-0 z-50 shadow-sm transition-all duration-200 border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-container-margin py-4 max-w-7xl mx-auto">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">AI-SMARTSERVE</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">Thực Đơn</Link>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Ưu Đãi</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Câu Chuyện</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Cửa Hàng</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <ShoppingCart className="text-primary" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined text-primary">person</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-container-margin py-stack-lg">
        <div className="flex flex-col lg:flex-row gap-stack-lg">
          {/* Left Side: Cart Items & Payment */}
          <div className="flex-grow space-y-stack-lg">
            {/* Section Header */}
            <div className="flex items-center gap-stack-sm mb-stack-md">
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-90" onClick={() => window.history.back()}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold">Thanh Toán & Đặt Món</h1>
            </div>

            {/* Cart Items List */}
            <section className="space-y-stack-md">
              <h2 className="font-headline-md text-headline-md text-on-surface-variant border-b border-outline-variant/20 pb-2 font-bold">Đơn Hàng Của Bạn</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-4 bg-white rounded-2xl border border-outline-variant/20 p-8">
                  <span className="material-symbols-outlined text-[64px] text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                  <h2 className="font-headline-md text-on-surface font-bold">Giỏ hàng của bạn đang trống.</h2>
                  <p className="text-on-surface-variant text-sm">Hãy khám phá các món đồ uống thơm ngon và thêm vào giỏ nhé!</p>
                  <Link to="/" className="px-8 py-3 bg-primary text-white rounded-full font-label-md shadow-md hover:bg-primary-container transition-all active:scale-95 font-bold mt-2">
                    Khám Phá Thực Đơn
                  </Link>
                </div>
              ) : (
                cart.map(item => {
                  const itemKey = item.cartItemId || `${item.id}-${item.sizeId}-${item.sugarLevel}-${item.iceLevel}`;
                  return (
                    <div key={itemKey} className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_20px_rgba(85,55,34,0.05)] border border-surface-variant flex items-center gap-4 group transition-all hover:shadow-[0_8px_30px_rgba(85,55,34,0.1)]">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-headline-md text-label-md font-bold text-on-surface">{item.name}</h3>
                            <div className="text-xs text-on-surface-variant mt-1 flex flex-wrap gap-2">
                              {item.sizeName && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold">Size: {item.sizeName}</span>}
                              {item.sugarLevel && <span>Đường: {item.sugarLevel}</span>}
                              {item.iceLevel && <span>Đá: {item.iceLevel}</span>}
                              {item.note && <span className="italic text-primary">"{item.note}"</span>}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId || item.id)} 
                            className="text-error hover:bg-error/10 p-1.5 rounded-full transition-colors"
                            title="Xóa món"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <span className="font-headline-md text-label-md text-primary font-bold">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-on-surface-variant ml-2">
                                ({item.price.toLocaleString('vi-VN')}đ / ly)
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 bg-surface-variant/40 rounded-full px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-xs hover:bg-primary hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">remove</span>
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-xs hover:bg-primary hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Customer Details Form */}
            {cart.length > 0 && (
              <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-label-md font-bold text-primary">Thông Tin Bàn & Ghi Chú</h3>
                  {(guestSession?.tableId || currentTable) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full">
                      <span className="material-symbols-outlined text-sm">table_restaurant</span>
                      <span className="text-xs font-bold">Bàn của bạn: {guestSession?.tableId || currentTable}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">Tên khách hàng (Tùy chọn)</label>
                    <input 
                      type="text" 
                      placeholder="VD: Anh Minh" 
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">Số điện thoại tích điểm (Tùy chọn)</label>
                    <input 
                      type="tel" 
                      placeholder="VD: 0901234567" 
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Ghi chú cho quầy thu ngân / Bếp</label>
                  <input 
                    type="text" 
                    placeholder="VD: Mang ra bàn sớm giúp mình nhé" 
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right Side: Order Summary */}
          {cart.length > 0 && (
            <div className="w-full lg:w-96 flex-shrink-0 space-y-stack-md">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-md border border-outline-variant/20 sticky top-24 space-y-4">
                <h3 className="font-headline-md text-headline-md font-bold text-primary border-b border-outline-variant/20 pb-3">
                  Tóm Tắt Đơn Hàng
                </h3>

                {/* Voucher Box */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">Mã Giảm Giá</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập WELCOME50" 
                      className="flex-grow px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 transition-colors"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {appliedVoucherCode && (
                    <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Đã áp dụng mã {appliedVoucherCode} (-{voucherDiscount}%)
                    </p>
                  )}
                  {voucherError && <p className="text-xs text-error font-semibold mt-1">{voucherError}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-outline-variant/20 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Tạm tính ({cartCount} món)</span>
                    <span className="font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Giảm giá</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface font-extrabold text-base pt-2 border-t border-outline-variant/20">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary text-xl font-bold">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-full font-headline-md text-label-md font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send</span>
                  {isSubmitting ? 'Đang Gửi Đơn...' : `Xác Nhận Đặt Món • ${total.toLocaleString('vi-VN')}đ`}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full mt-auto bg-surface-container-highest border-t border-outline-variant/20 py-6 px-container-margin text-center text-xs text-on-surface-variant">
        © 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.
      </footer>
      <MobileBottomNav />
    </div>
  );
}
