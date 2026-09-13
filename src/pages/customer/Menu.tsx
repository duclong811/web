import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileBottomNav from '../../components/MobileBottomNav';

const DEFAULT_CATEGORIES = [
  { id: 'Cà Phê Pha Máy', name: 'Cà Phê Pha Máy', icon: 'coffee' },
  { id: 'Sinh Tố & Trà Sữa', name: 'Sinh Tố & Trà Sữa', icon: 'bubble_chart' },
  { id: 'Trà & Trái Cây', name: 'Trà & Trái Cây', icon: 'energy_savings_leaf' },
  { id: 'Bánh Ngọt', name: 'Bánh Ngọt', icon: 'bakery_dining' }
];

export default function Menu() {
  const [searchParams] = useSearchParams();
  const storeIdParam = searchParams.get('storeId') ? parseInt(searchParams.get('storeId')!) : 1;
  const tableParam = searchParams.get('table') || null;

  const { 
    menuItems, 
    categories, 
    fetchMenu, 
    setStoreId, 
    setTable, 
    cart, 
    addToCart, 
    activeOrder 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('Cà Phê Pha Máy');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setStoreId(storeIdParam);
    if (tableParam) setTable(tableParam);
    fetchMenu(storeIdParam);
  }, [storeIdParam, tableParam]);

  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Filter out Quà Lưu Niệm
  const displayCategories = (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES)
    .filter(c => !c.name.toLowerCase().includes('quà') && !c.name.toLowerCase().includes('lưu niệm'));

  useEffect(() => {
    if (displayCategories.length > 0 && (!activeCategory || activeCategory === 'Cà Phê Pha Máy')) {
      setActiveCategory(displayCategories[0].name || displayCategories[0].id);
    }
  }, [categories]);

  // Filter items matching activeCategory or search
  const activeItems = menuItems
    .filter(m => !m.categoryName?.toLowerCase().includes('quà') && !m.categoryName?.toLowerCase().includes('lưu niệm'))
    .filter(item => {
      const itemCat = (item.categoryId || item.categoryName || '').toLowerCase();
      const activeCat = activeCategory.toLowerCase();
      const matchCat = activeCategory === 'Tất Cả' || itemCat.includes(activeCat) || activeCat.includes(itemCat);
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

  const handleAddToCart = (id: string, name: string, price: number, image: string) => {
    const fullItem = menuItems.find(i => i.id === id) || {
      id,
      name,
      price,
      image,
      categoryId: activeCategory,
      description: '',
    };
    addToCart(fullItem, { quantity: 1 });
  };

  return (
    <div className="font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen bg-background animate-in fade-in duration-500">
      {/* TopNavBar */}
      <nav className="w-full sticky top-0 z-40 bg-surface/95 dark:bg-surface-dim backdrop-blur-md border-b border-outline-variant/10 shadow-sm dark:shadow-none glass-header">
        <div className="flex justify-between items-center px-4 sm:px-container-margin py-3.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-stack-lg">
            <button 
              className="lg:hidden p-2 -ml-1 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <Link to="/" className="text-lg sm:text-2xl font-black text-primary dark:text-primary-fixed-dim whitespace-nowrap tracking-tight">
              AI-SMARTSERVE
            </Link>
            <div className="hidden md:flex gap-gutter items-center">
              <Link to="/" className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1">Thực Đơn</Link>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Ưu Đãi</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Câu Chuyện</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors cursor-pointer">Cửa Hàng</a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-stack-md">
            {tableParam && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] sm:text-xs font-bold rounded-full border border-primary/20 whitespace-nowrap">
                Bàn: {tableParam}
              </span>
            )}
            <Link to="/cart" className="relative p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <ShoppingCart className="text-primary" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95" title="Staff Login">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (Trượt mượt mà từ trái sang) */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-surface z-50 shadow-2xl flex flex-col p-5 lg:hidden transform transition-transform duration-300 ease-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
            <span className="font-headline-md text-base font-bold text-primary">Danh Mục Món</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 overflow-y-auto flex-1 py-2">
          <button 
            onClick={() => { setActiveCategory('Tất Cả'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left ${
              activeCategory === 'Tất Cả' 
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-xs' 
              : 'text-on-surface-variant hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-xl" style={activeCategory === 'Tất Cả' ? { fontVariationSettings: "'FILL' 1" } : {}}>
              auto_awesome
            </span>
            <span className="font-label-md text-sm">Tất Cả Món</span>
          </button>

          {displayCategories.map(category => {
            const catId = category.name || category.id;
            const isCurrent = activeCategory === catId;
            return (
              <button 
                key={catId}
                onClick={() => { setActiveCategory(catId); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left ${
                  isCurrent 
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-xs' 
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={isCurrent ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {category.icon || 'coffee'}
                </span>
                <span className="font-label-md text-sm">{catId}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-outline-variant/10 mt-auto">
          <Link 
            to="/ai-suggest" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all text-center block shadow-xs"
          >
            Gợi Ý Món Với AI ✨
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex min-h-screen">
        {/* Desktop SideNavBar */}
        <aside className="hidden lg:flex sticky top-[65px] h-[calc(100vh-65px)] w-64 flex-col gap-stack-md px-4 py-8 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant/10 z-30 overflow-y-auto shrink-0">
          <div className="mb-2 px-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 uppercase tracking-widest font-bold">Danh Mục</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveCategory('Tất Cả')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-transform active:translate-x-1 ${
                activeCategory === 'Tất Cả' 
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-bold shadow-sm' 
                : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={activeCategory === 'Tất Cả' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                auto_awesome
              </span>
              <span className="font-label-md text-label-md text-left">Tất Cả Món</span>
            </button>

            {displayCategories.map(category => {
              const catId = category.name || category.id;
              const isCurrent = activeCategory === catId;
              return (
                <button 
                  key={catId}
                  onClick={() => setActiveCategory(catId)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-transform active:translate-x-1 ${
                    isCurrent 
                    ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-bold shadow-sm' 
                    : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl" style={isCurrent ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {category.icon || 'coffee'}
                  </span>
                  <span className="font-label-md text-label-md text-left">{catId}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-label-sm text-label-sm text-primary mb-1 font-bold">Chào mừng trở lại</p>
            <p className="font-body-md text-on-surface mb-stack-md text-sm">Sẵn sàng nạp năng lượng chưa?</p>
            <Link to="/ai-suggest" className="w-full py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all text-center block">
                Order Favorite
            </Link>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-container-margin py-4 sm:py-stack-lg w-full max-w-full overflow-hidden">
          
          {/* Hero Banner */}
          <section className="relative min-h-[260px] sm:h-[400px] rounded-3xl overflow-hidden mb-6 sm:mb-stack-lg group shadow-md">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH')" }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-6 sm:px-12 py-6">
              <span className="inline-block px-3.5 py-1 bg-tertiary text-on-tertiary rounded-full font-label-sm text-xs mb-3 self-start font-bold">
                  Ưu Đãi Giới Hạn
              </span>
              <h1 className="text-xl sm:text-4xl font-extrabold text-white max-w-lg mb-2 sm:mb-4 leading-tight">
                  Đánh thức giác quan với <span className="text-primary-fixed">Honey-Oak Latte</span>
              </h1>
              <p className="text-white/85 text-xs sm:text-base max-w-md mb-5 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                  Trải nghiệm sự cân bằng tinh tế của mật ong hoa cỏ dại và espresso ủ gỗ sồi.
              </p>
              <Link to="/ai-suggest" className="w-fit px-6 sm:px-8 py-2.5 sm:py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-md text-xs sm:text-sm font-bold hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-sm">
                  Khám Phá Menu Theo Mùa
              </Link>
            </div>
          </section>

          {/* AI Combo Banner */}
          <section className="mb-6 sm:mb-stack-lg p-5 sm:p-8 rounded-3xl bg-primary-container text-on-primary-container flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-md border border-primary/10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary-fixed rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold mb-0.5">Khám phá Combo dành riêng cho bạn</h2>
                <p className="text-xs sm:text-sm opacity-90">Sử dụng AI để tìm ra hương vị hoàn hảo cho ngày hôm nay của bạn.</p>
              </div>
            </div>
            <Link to="/ai-suggest" className="w-full md:w-auto text-center px-6 py-2.5 sm:py-3 bg-primary-fixed text-on-primary-fixed rounded-full text-xs sm:text-sm font-bold hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-sm inline-flex items-center justify-center shrink-0">
                Thử ngay với AI
            </Link>
          </section>

          {/* Search and Filter Bar */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-gutter mb-6 sm:mb-stack-lg">
            <div className="relative w-full max-w-md group focus-within:scale-[1.01] transition-transform">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input 
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-primary/10 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-xs sm:text-sm text-on-surface shadow-xs" 
                placeholder="Tìm món đồ uống yêu thích..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar w-full md:w-auto">
              <button 
                onClick={() => setActiveCategory('Tất Cả')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === 'Tất Cả' ? 'bg-primary text-on-primary shadow-xs' : 'bg-white border border-primary/10 text-on-surface-variant hover:bg-primary/5'
                }`}
              >
                Tất Cả
              </button>
              {displayCategories.map(c => {
                const catName = c.name || c.id;
                return (
                  <button 
                    key={catName}
                    onClick={() => setActiveCategory(catName)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeCategory === catName ? 'bg-primary text-on-primary shadow-xs' : 'bg-white border border-primary/10 text-on-surface-variant hover:bg-primary/5'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Dynamic Menu Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-stack-lg">
            {activeItems.length === 0 ? (
              <div className="col-span-full py-16 text-center text-on-surface-variant font-medium bg-white rounded-2xl border border-outline-variant/10 p-6">
                Không tìm thấy món nào trong danh mục này.
              </div>
            ) : (
              activeItems.map((item) => (
                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
                  <Link to={`/product/${item.id}`} className="relative h-52 sm:h-64 overflow-hidden block bg-surface-container-low">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                         style={{ backgroundImage: `url('${item.image}')` }}>
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-xs sm:text-label-md shadow-md">
                        {item.price.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/95 backdrop-blur-md shadow-xs rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-500 text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[11px] sm:text-xs font-bold text-on-surface">{item.rating || 4.8}</span>
                    </div>
                  </Link>
                  <div className="p-4 sm:p-stack-md flex-1 flex flex-col">
                    <Link to={`/product/${item.id}`} className="block group-hover:opacity-80 transition-opacity">
                      <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1 line-clamp-1">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                          {item.description || 'Hương vị hảo hạng được pha chế tươi ngon mỗi ngày.'}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-variant/40">
                      <Link to={`/product/${item.id}`} className="px-3.5 py-1.5 border-[1.5px] border-primary text-primary rounded-full text-xs font-bold hover:bg-primary/5 transition-colors">Tùy Chỉnh</Link>
                      <button 
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all active:scale-90 shadow-sm"
                        onClick={() => handleAddToCart(item.id, item.name, item.price, item.image)}
                        title="Thêm nhanh vào giỏ"
                      >
                        <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Active Order Status Card */}
          {activeOrder && (
            <section className="mt-6 p-4 sm:p-stack-md bg-secondary-container/30 border border-primary/20 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-lg sm:text-xl animate-pulse">coffee</span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-label-sm text-primary uppercase tracking-wider font-bold">
                    {activeOrder.status === 'pending' ? 'Chờ Xác Nhận' : activeOrder.status === 'preparing' ? 'Đang Chuẩn Bị' : 'Món Đã Sẵn Sàng'}
                  </p>
                  <h4 className="text-xs sm:text-label-md font-bold text-on-surface line-clamp-1">
                    Đơn #{activeOrder.orderCode} ({activeOrder.items?.length || 1} món)
                  </h4>
                </div>
              </div>
              <Link to={`/tracking?code=${activeOrder.orderCode}`} className="text-primary text-xs sm:text-label-md hover:underline font-bold whitespace-nowrap ml-2">
                Chi Tiết ➔
              </Link>
            </section>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-6 sm:py-stack-lg max-w-7xl mx-auto gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="font-headline-md text-base sm:text-xl text-primary font-bold">AI-SMARTSERVE</span>
            <p className="font-label-sm text-xs text-on-surface-variant">© 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-on-surface-variant">
            <a className="hover:text-primary transition-colors cursor-pointer">Chính Sách</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Điều Khoản</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Liên Hệ</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link to="/ai-suggest" className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 flex items-center gap-2 px-5 py-3.5 bg-primary text-on-primary rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group text-xs sm:text-sm font-bold">
        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">auto_awesome</span>
        <span>AI Gợi Ý</span>
      </Link>
      
      <MobileBottomNav />
    </div>
  );
}
