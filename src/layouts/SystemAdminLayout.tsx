import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Coffee, 
  Store, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function SystemAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Role guard: Nếu không phải SuperAdmin (ví dụ là Chủ quán hoặc Staff), chuyển về đúng nơi
    if (user && user.role !== 'SystemAdmin') {
      if (user.role === 'Owner' || user.role === 'TenantOwner' || user.role === 'Manager') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/staff/orders', { replace: true });
      }
    }
  }, [location.pathname, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/system-admin', label: 'Tổng Quan Nền Tảng', icon: LayoutDashboard },
    { path: '/system-admin/tenants', label: 'Quán Cafe Đối Tác', icon: Store },
  ];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navigation Bar - Đồng bộ theme ấm áp với Customer & Admin */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/15 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-variant transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
              <Coffee className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-primary tracking-tight">
                  AI-SMARTSERVE
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-secondary-container text-on-secondary-container rounded-full border border-primary/10">
                  SaaS Master
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant hidden sm:block">
                Quản Trị Hệ Thống Đối Tác FnB
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary text-xs font-semibold border border-outline-variant/20 transition"
          >
            <span>Menu Khách</span>
            <ExternalLink size={13} />
          </Link>

          {/* User Chip */}
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-full py-1.5 px-3">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-white">
              SA
            </div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">
              {user?.fullName || 'Super Admin'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-error hover:bg-error/10 rounded-full transition"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed md:sticky top-0 md:top-16 bottom-0 left-0 w-64 bg-surface md:bg-surface-container-low border-r border-outline-variant/15 p-4 flex flex-col z-40 md:z-20 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="mb-stack-md px-2 pt-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 uppercase tracking-wider">
              Trung Tâm Điều Hành
            </p>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/system-admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-primary bg-secondary-container/40 border-r-4 border-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* System Info Card */}
          <div className="mt-auto p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-2 text-primary font-bold mb-1">
              <ShieldCheck size={16} className="text-primary" />
              <span>Nền Tảng Đang Chạy</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Giải pháp QR Gọi món đa thương hiệu dành cho các chuỗi quán FnB.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
