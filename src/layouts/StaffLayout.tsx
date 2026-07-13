import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-background font-body-md text-on-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-16 bg-surface dark:bg-inverse-surface shadow-sm border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">AI-SMARTSERVE</h1>
        </div>
        <div className="flex items-center gap-stack-md">
          <div className="hidden md:flex items-center gap-stack-md px-4 py-2 rounded-full bg-surface-container-low dark:bg-surface-dim transition-all duration-200 focus-within:ring-2 ring-primary/20">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input className="bg-transparent border-none focus:ring-0 font-label-md text-label-md text-on-surface-variant w-48 outline-none" placeholder="Tìm kiếm đơn hàng..." type="text" />
          </div>
          <button className="material-symbols-outlined text-on-surface-variant p-2 rounded-full hover:bg-surface-variant transition-all duration-200 active:scale-95">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant p-2 rounded-full hover:bg-surface-variant transition-all duration-200 active:scale-95">settings</button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoIJV4b1TkjJNBv6lp6U10KgMWD0nrpBYjnQ6VckiyLjwh0QDzlQEjQYuEnI_uGgO2j58tuyjYPahvT4FMtUHAYvu6I0Zvp8CF5dOHzShckrD7RYBq9ram42N6UZGIqoAz_rnuci-PWHZGC9LzNFU0giX4JzIFOQH6bmsYlDvvyGN0v_DFWMPs_gS48r522GKqbnibANoRX8YgiBAH5t4KHAaJKgubHTX_YbbAvq_h7Kb7UnXUsaLp" alt="Staff" />
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col p-stack-md z-40 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant/10 transition-transform ${isMobileMenuOpen ? 'flex translate-x-0' : 'hidden md:flex'}`}>
        <div className="flex flex-col items-center py-6 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-on-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">AI-SMARTSERVE</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Cổng Nhân Viên</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {/* Active: Orders */}
          <Link to="/staff/orders" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-stack-md rounded-xl p-3 transition-transform duration-200 hover:translate-x-1 ${location.pathname.includes('orders') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">assignment</span>
            <span className="font-label-md text-label-md">Đơn Hàng</span>
          </Link>
          <a onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-stack-md text-on-surface-variant p-3 hover:bg-surface-variant rounded-xl transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md text-label-md">Kho Hàng</span>
          </a>
          <a onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-stack-md text-on-surface-variant p-3 hover:bg-surface-variant rounded-xl transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="material-symbols-outlined">badge</span>
            <span className="font-label-md text-label-md">Nhân Sự</span>
          </a>
          <a onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-stack-md text-on-surface-variant p-3 hover:bg-surface-variant rounded-xl transition-transform duration-200 hover:translate-x-1" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Báo Cáo</span>
          </a>
        </nav>
        
        <div className="pt-4 border-t border-outline-variant/30">
          <button onClick={() => navigate('/staff/new-order')} className="w-full mb-4 py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md flex items-center justify-center gap-2 transition-all hover:bg-primary-container active:scale-95 shadow-md">
            <span className="material-symbols-outlined">add</span>
            New Order
          </button>
          <button onClick={() => navigate('/staff/login')} className="w-full flex items-center gap-stack-md text-on-surface-variant p-3 hover:bg-surface-variant rounded-xl transition-transform duration-200 hover:translate-x-1 cursor-pointer text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 mt-16 overflow-hidden bg-background">
        <Outlet />
      </main>
    </div>
  );
}
