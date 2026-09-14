import { Outlet, Link } from 'react-router-dom';
import { Coffee, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';

export default function CustomerLayout() {
  const cart = useStore(state => state.cart);
  const guestSession = useStore(state => state.guestSession);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const { isAuthenticated, user } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-surface">
      {/* Header/TopAppBar - Responsive */}
      <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant/10 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 max-w-7xl mx-auto">
          {/* Left: Logo + Brand */}
          <Link 
            to="/menu" 
            className="flex items-center gap-2 sm:gap-3 text-primary hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-md">
              <Coffee size={24} className="text-white" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight whitespace-nowrap">
              AI-SMARTSERVE
            </h1>
          </Link>

          {/* Right: Table Badge + Login/User + Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Badge */}
            {guestSession?.tableId && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full">
                <span className="material-symbols-outlined text-sm">table_restaurant</span>
                <span className="text-xs font-bold">Bàn {guestSession.tableId}</span>
              </div>
            )}

            {/* Login/User Button Container */}
            <div className="relative">
              <button
                onClick={handleUserIconClick}
                className="p-2 sm:p-2.5 rounded-full hover:bg-surface-container-high transition-all text-primary flex items-center justify-center"
                aria-label={isAuthenticated ? 'Menu người dùng' : 'Đăng nhập'}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* User Menu Dropdown */}
              {isAuthenticated && (
                <UserMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
              )}
            </div>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-surface-container-high transition-all text-primary flex items-center justify-center"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Full width responsive */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest border-t border-outline-variant/20 py-6 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="text-base sm:text-xl text-primary font-bold">AI-SMARTSERVE</span>
            <p className="text-xs text-on-surface-variant">© 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-on-surface-variant">
            <a className="hover:text-primary transition-colors cursor-pointer">Chính Sách</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Điều Khoản</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Liên Hệ</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
