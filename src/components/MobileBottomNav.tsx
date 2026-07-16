import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === '/' || path === '/menu';
  const isTracking = path.startsWith('/tracking');
  const isOrderSuccess = path.startsWith('/order-success');
  const isOrderActive = isTracking || isOrderSuccess;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-container-margin py-3 flex justify-around items-center z-[100] border-t border-outline-variant/10">
      <Link to="/" className={`flex flex-col items-center transition-colors ${(isHome || !isOrderActive) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
        <span className="material-symbols-outlined" style={(isHome || !isOrderActive) ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
        <span className="text-[10px] font-bold mt-1">Trang chủ</span>
      </Link>
      <Link to="/" className={`flex flex-col items-center transition-colors ${(isHome || !isOrderActive) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
        <span className="material-symbols-outlined" style={(isHome || !isOrderActive) ? { fontVariationSettings: "'FILL' 1" } : {}}>menu_book</span>
        <span className="text-[10px] font-bold mt-1">Thực đơn</span>
      </Link>
      <Link to="/tracking" className={`flex flex-col items-center transition-colors ${isOrderActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
        <div className="relative">
          <span className="material-symbols-outlined" style={isOrderActive ? { fontVariationSettings: "'FILL' 1" } : {}}>receipt_long</span>
          {isOrderActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>}
        </div>
        <span className="text-[10px] font-bold mt-1">Đơn hàng</span>
      </Link>
      <Link to="/" className={`flex flex-col items-center transition-colors text-on-surface-variant hover:text-primary`}>
        <span className="material-symbols-outlined">loyalty</span>
        <span className="text-[10px] font-bold mt-1">Ưu đãi</span>
      </Link>
    </div>
  );
}
