import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileBottomNav from '../../components/MobileBottomNav';
import Pagination from '../../components/Pagination';
import AuthModal from '../../components/AuthModal';
import UserMenu from '../../components/UserMenu';
import { useAuthStore } from '../../store/authStore';

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
    activeOrder,
    guestSession
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('Cà Phê Pha Máy');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Stock status per branch
  const [stockStatus, setStockStatus] = useState<{ [id: string]: boolean }>({});

  // Auth Modal & User Menu states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Load guest session from localStorage if exists
    const savedSession = localStorage.getItem('guestSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setStoreId(session.storeId);
      setTable(session.tableId);
      fetchMenu(session.storeId);
    } else {
      setStoreId(storeIdParam);
      if (tableParam) setTable(tableParam);
      fetchMenu(storeIdParam);
    }

    const loadStock = () => {
      const saved = localStorage.getItem(`webcafe_stock_store_${storeIdParam}`);
      setStockStatus(saved ? JSON.parse(saved) : {});
    };

    loadStock();
    window.addEventListener('storage', loadStock);
    return () => window.removeEventListener('storage', loadStock);
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

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Filter items matching activeCategory or search
  const activeItems = menuItems
    .filter(m => !m.categoryName?.toLowerCase().includes('quà') && !m.categoryName?.toLowerCase().includes('lưu niệm'))
    .filter(item => {
      const itemCat = (item.categoryName || item.categoryId || '').toLowerCase();
      const activeCat = activeCategory.toLowerCase();
      const matchCat = activeCategory === 'Tất Cả' || itemCat.includes(activeCat) || activeCat.includes(itemCat);
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

  const totalPages = Math.ceil(activeItems.length / PAGE_SIZE);
  const paginatedItems = activeItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddToCart = (id: string, name: string, price: number, image: string) => {
    const isOutOfStock = stockStatus[id] === false;
    if (isOutOfStock) return;

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

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsAuthModalOpen(true);
    }
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
              <Link to="/ai-suggest" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">AI Gợi Ý</Link>
              <Link to="/tracking" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Theo Dõi Đơn</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-stack-md">
            {/* Table Badge - prioritize guestSession, fallback to tableParam */}
            {(guestSession?.tableId || tableParam) && (
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold shadow-xs">
                Bàn {guestSession?.tableId || tableParam}
              </span>
            )}
            
            {/* User Icon Button */}
            <div className="relative">
              <button
                onClick={handleUserIconClick}
                className="p-2 sm:p-2.5 rounded-full hover:bg-surface-container-high transition-all text-primary dark:text-primary-fixed-dim flex items-center justify-center"
                aria-label={isAuthenticated ? 'Menu người dùng' : 'Đăng nhập'}
              >
                {isAuthenticated ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-2xl">account_circle</span>
                )}
              </button>
              
              {/* User Menu Dropdown */}
              {isAuthenticated && (
                <UserMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
              )}
            </div>

            <Link 
              to="/cart" 
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-surface-container-high transition-all text-primary dark:text-primary-fixed-dim flex items-center justify-center"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow-md animate-scale">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-surface dark:bg-surface-dim z-50 shadow-2xl p-6 flex flex-col gap-6 lg:hidden transition-transform duration-300 ease-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4">
          <span className="font-black text-xl text-primary">AI-SMARTSERVE</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">menu_book</span> Thực Đơn
          </Link>
          <Link to="/ai-suggest" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">auto_awesome</span> AI Gợi Ý
          </Link>
          <Link to="/tracking" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">receipt_long</span> Theo Dõi Đơn
          </Link>
          <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">shopping_cart</span> Giỏ Hàng ({cartCount})
          </Link>
          
          {/* User Auth Section */}
          {isAuthenticated ? (
            <>
              <hr className="my-2 border-outline-variant/20" />
              <div className="px-4 py-2 text-xs text-on-surface-variant font-bold uppercase">Tài khoản</div>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">person</span> Thông tin cá nhân
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  useAuthStore.getState().logout();
                  window.location.href = '/';
                }}
                className="px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-bold flex items-center gap-3 w-full text-left"
              >
                <span className="material-symbols-outlined">logout</span> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <hr className="my-2 border-outline-variant/20" />
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold flex items-center gap-3 w-full text-left"
              >
                <span className="material-symbols-outlined">login</span> Đăng nhập / Đăng ký
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-container-margin py-4 sm:py-stack-md gap-stack-lg">
        {/* Desktop Sidebar (Categories) */}
        <aside className="hidden lg:flex flex-col w-64 gap-stack-md shrink-0 sticky top-20 self-start">
          <div className="bg-surface-container-low dark:bg-surface-dim p-4 rounded-2xl border border-outline-variant/10">
            <h2 className="font-headline-md text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-3 px-2">Danh Mục Món</h2>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveCategory('Tất Cả')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeCategory === 'Tất Cả' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-highest/60'
                }`}
              >
                <span className="material-symbols-outlined text-lg">apps</span>
                <span>Tất Cả Món ({menuItems.length})</span>
              </button>
              {displayCategories.map(c => {
                const catName = c.name || c.id;
                return (
                  <button 
                    key={catName}
                    onClick={() => setActiveCategory(catName)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      activeCategory === catName ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-highest/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{c.icon || 'local_cafe'}</span>
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Menu Content Area */}
        <main className="flex-1 flex flex-col gap-4 sm:gap-stack-md min-w-0 pb-24 md:pb-12">
          {/* Header Search & Horizontal Category Scroller for Mobile */}
          <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                className="w-full bg-white dark:bg-surface-dim border border-outline-variant/20 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs" 
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
            {paginatedItems.length === 0 ? (
              <div className="col-span-full py-16 text-center text-on-surface-variant font-medium bg-white rounded-2xl border border-outline-variant/10 p-6">
                Không tìm thấy món nào trong danh mục này.
              </div>
            ) : (
              paginatedItems.map((item) => {
                const isOutOfStock = stockStatus[item.id.toString()] === false;

                return (
                  <div 
                    key={item.id} 
                    className={`group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-xs transition-all duration-300 flex flex-col relative ${
                      isOutOfStock ? 'opacity-70 grayscale-[0.25] hover:shadow-xs' : 'hover:shadow-lg'
                    }`}
                  >
                    {/* Out of stock badge */}
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase rounded-lg shadow-md flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-xs">block</span>
                        TẠM HẾT MÓN
                      </div>
                    )}

                    <Link to={`/product/${item.id}`} className="relative h-52 sm:h-64 overflow-hidden block bg-surface-container-low">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                           style={{ backgroundImage: `url('${item.image}')` }}>
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-xs sm:text-label-md shadow-md">
                          {item.price.toLocaleString('vi-VN')}đ
                      </div>
                      {!isOutOfStock && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/95 backdrop-blur-md shadow-xs rounded-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-amber-500 text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-[11px] sm:text-xs font-bold text-on-surface">{item.rating || 4.8}</span>
                        </div>
                      )}
                    </Link>
                    <div className="p-4 sm:p-stack-md flex-1 flex flex-col">
                      <Link to={`/product/${item.id}`} className="block group-hover:opacity-80 transition-opacity">
                        <h3 className={`text-base sm:text-lg font-bold mb-1 line-clamp-1 ${isOutOfStock ? 'text-on-surface/80 line-through' : 'text-on-surface'}`}>
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                            {item.description || 'Hương vị hảo hạng được pha chế tươi ngon mỗi ngày.'}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-variant/40">
                        {isOutOfStock ? (
                          <span className="px-3.5 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                            Tạm Hết Món
                          </span>
                        ) : (
                          <Link to={`/product/${item.id}`} className="px-3.5 py-1.5 border-[1.5px] border-primary text-primary rounded-full text-xs font-bold hover:bg-primary/5 transition-colors">
                            Tùy Chỉnh
                          </Link>
                        )}

                        <button 
                          disabled={isOutOfStock}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            isOutOfStock 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary text-on-primary hover:bg-primary-container active:scale-90 shadow-sm'
                          }`}
                          onClick={() => handleAddToCart(item.id, item.name, item.price, item.image)}
                          title={isOutOfStock ? 'Món này tạm hết tại chi nhánh' : 'Thêm nhanh vào giỏ'}
                        >
                          <span className="material-symbols-outlined text-lg sm:text-xl">
                            {isOutOfStock ? 'block' : 'add'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* Pagination Controls for Customer Menu */}
          <div className="bg-white rounded-2xl p-2 border border-outline-variant/15 shadow-2xs mt-2">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }} 
              totalItems={activeItems.length} 
              pageSize={PAGE_SIZE} 
              itemName="món đồ uống"
            />
          </div>

          {/* Active Order Status Card */}
          {activeOrder && (
            <section className="mt-4 p-4 sm:p-stack-md bg-secondary-container/30 border border-primary/20 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
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

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
