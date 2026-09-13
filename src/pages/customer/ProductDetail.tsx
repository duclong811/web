import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import MobileBottomNav from '../../components/MobileBottomNav';
import { ShoppingCart } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { menuItems, cart, addToCart } = useStore();
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  
  // Find item dynamically from store
  const item = menuItems.find(i => i.id === id || i.id === `hc-${id}`) || menuItems[0] || {
    id: '5',
    name: 'Caramel Cloud Macchiato',
    description: 'Lớp bọt sữa lạnh mềm mịn phủ trên lớp espresso cùng hương vani và xốt caramel.',
    price: 57500,
    categoryId: 'Cà Phê Pha Máy',
    categoryName: 'Cà Phê Pha Máy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf'
  };

  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState(100);
  const [ice, setIce] = useState(100);
  const [size, setSize] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const sizeExtra = (size === 'Large' || size === 'Lớn') ? 15000 : 0;
  const currentPrice = item.price + sizeExtra;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    addToCart(item, {
      quantity,
      sizeName: size,
      sizeExtra,
      sugarLevel: `${sugar}%`,
      iceLevel: `${ice}%`,
      note: notes,
    });
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      navigate('/cart');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body-md text-on-surface">
      {/* Top Navigation Bar */}
      <header className="w-full sticky top-0 z-40 bg-surface/95 dark:bg-surface-dim backdrop-blur-md shadow-xs border-b border-outline-variant/10">
        <nav className="flex justify-between items-center px-4 sm:px-container-margin py-3.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 -ml-1 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center text-primary"
              aria-label="Quay lại"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <Link to="/" className="text-lg sm:text-2xl font-black text-primary dark:text-primary-fixed-dim tracking-tight">
              AI-SMARTSERVE
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-stack-lg">
            <Link to="/" className="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-label-md text-label-md transition-colors">Thực Đơn</Link>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Ưu Đãi</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Câu Chuyện</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Cửa Hàng</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <ShoppingCart className="text-primary" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-container-margin py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start flex-grow pb-28 lg:pb-12">
        
        {/* Left Column: Product Visuals (RELATIVE on mobile, STICKY only on Desktop) */}
        <section className="relative lg:sticky lg:top-20 w-full space-y-3">
          <div className="relative h-60 sm:h-80 lg:h-auto lg:aspect-square w-full rounded-3xl overflow-hidden shadow-md bg-surface-container-lowest">
            <img 
              alt={item.name} 
              className="w-full h-full object-cover" 
              src={item.image} 
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-primary/85 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-xs">Bán Chạy</span>
              <span className="bg-secondary-container/90 backdrop-blur-md text-on-secondary-container text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-xs">Cao Cấp</span>
            </div>
          </div>
        </section>

        {/* Right Column: Customization Details */}
        <section className="space-y-5 w-full">
          {/* Header Info */}
          <div className="space-y-2">
            <nav className="flex text-on-surface-variant font-label-sm text-xs gap-1.5 items-center flex-wrap">
              <Link to="/" className="hover:text-primary font-semibold">Thực Đơn</Link>
              <span>/</span>
              <span className="hover:text-primary font-semibold">{item.categoryName || item.categoryId || 'Đồ Uống'}</span>
              <span>/</span>
              <span className="text-primary font-bold">{item.name}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-background">{item.name}</h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {item.description}
            </p>
            <div className="pt-1">
              <span className="text-xl sm:text-2xl text-primary font-extrabold">{item.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-5 bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-outline-variant/15">
            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-on-background block">Chọn Kích Cỡ</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setSize('Medium')}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${size === 'Medium' ? 'border-primary bg-secondary-container/20 text-primary font-bold shadow-xs' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'}`}>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-lg">coffee</span> Medium
                  </span>
                  <span className="text-xs font-semibold">+0đ</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSize('Large')}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${size === 'Large' ? 'border-primary bg-secondary-container/20 text-primary font-bold shadow-xs' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'}`}>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-lg">coffee</span> Large
                  </span>
                  <span className="text-xs font-semibold">+15.000đ</span>
                </button>
              </div>
            </div>

            {/* Sliders for Sugar and Ice */}
            <div className="space-y-4 pt-1">
              {/* Sugar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-on-background">Lượng Đường</label>
                  <span className="text-primary font-bold text-xs sm:text-sm">{sugar}%</span>
                </div>
                <input 
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="100" min="0" step="25" type="range" value={sugar} onChange={(e) => setSugar(Number(e.target.value))} 
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1 uppercase tracking-wider">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
              
              {/* Ice */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-on-background">Lượng Đá</label>
                  <span className="text-primary font-bold text-xs sm:text-sm">{ice}%</span>
                </div>
                <input 
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="100" min="0" step="25" type="range" value={ice} onChange={(e) => setIce(Number(e.target.value))} 
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1 uppercase tracking-wider">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs sm:text-sm font-bold text-on-background">Ghi Chú Đặc Biệt</label>
              <textarea 
                className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none min-h-[80px] sm:min-h-[100px] resize-none transition-all" 
                placeholder="VD: Ít đá, thêm trân châu, không quá ngọt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center pt-3 border-t border-outline-variant/15">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between w-full sm:w-auto bg-surface-variant/40 p-1 rounded-2xl border border-outline-variant/20">
              <button 
                onClick={handleDecrement} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-xs hover:bg-primary hover:text-white transition-colors text-primary"
              >
                <span className="material-symbols-outlined text-base font-bold">remove</span>
              </button>
              <span className="w-14 text-center font-bold text-lg text-primary">{quantity}</span>
              <button 
                onClick={handleIncrement} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-xs hover:bg-primary hover:text-white transition-colors text-primary"
              >
                <span className="material-symbols-outlined text-base font-bold">add</span>
              </button>
            </div>

            {/* Add to Cart */}
            <button 
              onClick={handleAddToCart} 
              className={`w-full sm:flex-grow text-white py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isAdded ? 'bg-green-600 shadow-green-600/20' : 'bg-primary hover:bg-primary-container shadow-primary/20'}`}
            >
              <span className="material-symbols-outlined text-lg">{isAdded ? 'check_circle' : 'shopping_bag'}</span>
              {isAdded ? 'Đã Thêm Vào Giỏ!' : `Thêm vào Giỏ • ${totalPrice.toLocaleString('vi-VN')}đ`}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20 py-6 px-4 text-center text-xs text-on-surface-variant hidden md:block">
        © 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.
      </footer>
      
      <MobileBottomNav />
    </div>
  );
}
