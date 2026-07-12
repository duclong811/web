import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/menu', icon: 'restaurant_menu', label: 'Menu' },
    { path: '/admin/tables', icon: 'table_restaurant', label: 'Tables' },
    { path: '/admin/staff', icon: 'groups', label: 'Staff' },
  ];

  return (
    <div className="bg-background text-on-background antialiased overflow-x-hidden min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col h-screen py-gutter px-4 bg-surface-container-low fixed left-0 top-0 w-64 shadow-sm z-20 border-r border-outline-variant/10">
        <div className="mb-stack-lg px-2">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">AI-SMARTSERVE</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Management Hub</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${isActive ? 'text-primary bg-secondary-container/30 border-r-4 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto p-4 bg-surface-container-high rounded-2xl flex items-center gap-3 mb-4 relative group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-full bg-primary overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaRQ5pUyOWkiPpjAhXgXqQVopq0ab0F8dEnB76NznlzLrZMUy55Tal-oEZ-3QXfzuWNkWjp_1SyF-a55_Rf29uNvmrgEKhcv_yiUvedsafZXo4vj_RfYaBD0cauQMU79BerhnwuDVBdNI2LCyN-iw683kSRB9f7gGFvCIkql5WXm_mmq-dDORwCfD4tItQjgSknpmWDt7v2yBG2SfEPu_l-DphEqCOSpSMAjL4k_aGl14GRQ_3UMFv" alt="Admin" />
          </div>
          <div className="flex-1">
            <p className="font-label-md text-label-md text-on-surface">Alex Chen</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Store Manager</p>
          </div>
          <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-error">logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-10 bg-surface/90 backdrop-blur-md h-16 flex justify-between items-center px-gutter shadow-sm border-b border-surface-container">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <span className="material-symbols-outlined text-primary text-2xl">menu</span>
            </div>
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input className="bg-surface-container-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50" placeholder="Search orders, staff..." type="text" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/50 transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/50 transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-fixed-dim overflow-hidden md:hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWXJoU7x7yuLjMM9_PDBOVcIoZZlz464R7SZDJOsWvMUu_M5czmWODSsjWXNCSUipj4fLa7XLoiP2XsN43l5OKxuY5J9j1V0nJSp2J8ZGSqeJXwF-oX1Nz0LOUTzQw7LyQUd7GljIuoI_vyWWs5aa3Jpj5PJI3qtIWz3JA7emAUbvXJqBwU1asOI-xpeRU-pmsvdAkEX6a1st6PFb9BbelCbUGKo3TN3WKCFCQVvSRwLGZ1gm61f8C" alt="Mobile User" />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <Outlet />
      </main>

      {/* Floating Action Button (FAB) for quick order */}
      <button className="fixed bottom-24 md:bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-30 group">
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-4 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">New Quick Order</span>
      </button>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest h-20 flex justify-around items-center px-4 border-t border-surface-container z-40">
        {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            )
        })}
      </nav>
    </div>
  );
}
