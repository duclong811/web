import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderTracking() {
  useEffect(() => {
    // Add small hover effects to list items
    const listItems = document.querySelectorAll('.flex.justify-between.items-center.p-2');
    listItems.forEach(item => {
      const htmlItem = item as HTMLElement;
      item.addEventListener('mouseenter', () => {
        htmlItem.style.transform = 'translateX(4px)';
      });
      item.addEventListener('mouseleave', () => {
        htmlItem.style.transform = 'translateX(0)';
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md bg-background text-on-surface">
      <style>{`
        .brewing-pulse {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.1); }
        }
        .stepper-line {
          background: repeating-linear-gradient(90deg, #d4c3ba, #d4c3ba 4px, transparent 4px, transparent 8px);
        }
        .stepper-line-active {
          background: #553722;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <nav className="bg-surface docked full-width top-0 sticky z-50 shadow-sm flex justify-between items-center w-full px-container-margin py-4 max-w-7xl mx-auto border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 hover:bg-surface-container-low rounded-full transition-colors" onClick={() => window.history.back()}>
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <Link to="/" className="font-headline-md text-headline-md text-primary tracking-tight font-bold">AI-SMARTSERVE</Link>
        </div>
        <div className="hidden md:flex items-center gap-stack-lg">
          <Link to="/" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Menu</Link>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Rewards</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Our Story</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Locations</a>
        </div>
        <div className="flex items-center gap-stack-md">
          <Link to="/cart"><span className="material-symbols-outlined text-primary p-2 cursor-pointer hover:bg-surface-container-low rounded-full transition-colors">shopping_cart</span></Link>
          <Link to="/staff/login"><span className="material-symbols-outlined text-primary p-2 cursor-pointer hover:bg-surface-container-low rounded-full transition-colors">person</span></Link>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-container-margin py-stack-lg">
        {/* Order Header & Status Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Tracking Card */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">Đang xử lý</span>
                  <h2 className="font-headline-lg text-headline-lg text-primary mt-1 font-bold">Đơn hàng #WB-8892</h2>
                </div>
                <div className="bg-primary-fixed px-4 py-2 rounded-full">
                  <span className="text-on-primary-fixed font-label-md text-label-md font-bold">Dự kiến: 12 phút nữa</span>
                </div>
              </div>
              
              {/* Order Timeline */}
              <div className="relative py-4">
                <div className="flex justify-between items-start">
                  {/* Step 1: Received */}
                  <div className="flex flex-col items-center z-10 w-1/4 group">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white mb-3 shadow-md">
                      <span className="material-symbols-outlined text-xl">check</span>
                    </div>
                    <span className="text-label-md font-label-md text-secondary text-center">Đã tiếp nhận</span>
                    <span className="text-xs text-on-surface-variant mt-1">14:20</span>
                  </div>
                  {/* Step 2: Preparing */}
                  <div className="flex flex-col items-center z-10 w-1/4 relative">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-3 shadow-lg brewing-pulse">
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>coffee_maker</span>
                    </div>
                    <span className="text-label-md font-label-md text-primary text-center">Đang pha chế</span>
                    <span className="text-xs text-primary font-semibold mt-1">Hiện tại</span>
                  </div>
                  {/* Step 3: Ready/Delivery */}
                  <div className="flex flex-col items-center z-10 w-1/4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3 border border-outline-variant">
                      <span className="material-symbols-outlined text-xl">delivery_dining</span>
                    </div>
                    <span className="text-label-md font-label-md text-on-surface-variant text-center">Giao hàng</span>
                    <span className="text-xs text-on-surface-variant/50 mt-1">Chờ...</span>
                  </div>
                  {/* Step 4: Completed */}
                  <div className="flex flex-col items-center z-10 w-1/4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3 border border-outline-variant">
                      <span className="material-symbols-outlined text-xl">done_all</span>
                    </div>
                    <span className="text-label-md font-label-md text-on-surface-variant text-center">Hoàn thành</span>
                    <span className="text-xs text-on-surface-variant/50 mt-1">Chờ...</span>
                  </div>
                  
                  {/* Background Lines */}
                  <div className="absolute top-9 left-[12.5%] right-[12.5%] h-0.5 flex">
                    <div className="w-1/3 h-full bg-secondary"></div>
                    <div className="w-1/3 h-full stepper-line"></div>
                    <div className="w-1/3 h-full stepper-line"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Content (Barista / Map) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="relative rounded-xl overflow-hidden h-64 shadow-md group">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="Barista" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3hxd-jfwMD3YIX3VLUFcyyfMYWhFst6mfCZ7nwKdFgezcOvV8zm9t-1iZ0sxEUi9CRpNqNCNA0JJdyZPdtpE9AnghfDgmkFdkHMlMtP7oom2uFfNK3bCGIfUWxWpqZetZ5hXY9B5SgMeOuFJsmVemHqL735iW2i-VXh1WaqtdSG8VrrZVuPjXx3gu7kT_JHNG56pA00xH1c-Lc29bP7lM0_a9Yx2RdvBBwxzcegpkCstdnIv5aPdS')" }}></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-label-md text-label-md">Barista Minh đang chuẩn bị đồ uống cho bạn</p>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden h-64 shadow-md border border-outline-variant">
                <img className="w-full h-full object-cover" data-alt="Map" data-location="Ho Chi Minh City" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkppObmCCRoEv-RTB9T3zvajam4FIld9WiBjhT3I5Tbu6yZtBFQw2fmBLBlB-IfBgu3efCtwy6eA8k5v2mhDCeKVWoYDoGdG3n5pggRsQRQAPAj7QFQqmQU6sJ5oSMwaDzg96nOSOiNabj97lm6UPYRpZOW0O-iT83vcvQsoWAvdVuF4dwpbgHrP2ouexDGp1p1ADuGoXr7ilQ5_YH0IJ8kAmE9rqUAEWj7HG0HjXAz2szfv8igZEY" />
                <div className="absolute top-4 right-4 glass-card px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-primary">TRỰC TIẾP</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details Sidebar */}
          <div className="lg:col-span-4 space-y-gutter">
            <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-sm border border-outline-variant/30 h-full">
              <h3 className="font-headline-md text-headline-md text-primary mb-stack-md font-bold">Chi tiết đơn hàng</h3>
              
              <div className="space-y-4 mb-stack-lg">
                <div className="flex justify-between items-center p-2 hover:bg-surface-container-low rounded-lg transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">coffee</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Latte Hạnh Nhân (L)</p>
                      <p className="text-xs text-on-surface-variant">Ít đường, Đá viên</p>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-bold">65.000đ</span>
                </div>
                
                <div className="flex justify-between items-center p-2 hover:bg-surface-container-low rounded-lg transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">bakery_dining</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Croissant Trứng Muối</p>
                      <p className="text-xs text-on-surface-variant">Hâm nóng</p>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-bold">45.000đ</span>
                </div>
              </div>
              
              <div className="border-t border-dashed border-outline-variant py-4 space-y-2">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-body-md">Tạm tính</span>
                  <span>110.000đ</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="text-body-md">Phí giao hàng</span>
                  <span>15.000đ</span>
                </div>
                <div className="flex justify-between text-primary font-bold text-lg pt-2">
                  <span>Tổng cộng</span>
                  <span>125.000đ</span>
                </div>
              </div>
              
              <div className="mt-stack-md p-4 bg-secondary-container rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <div>
                  <p className="text-xs text-on-secondary-fixed-variant uppercase font-bold tracking-tight">Phương thức thanh toán</p>
                  <p className="text-label-md font-label-md text-on-secondary-fixed">Ví MoMo • • • 9902</p>
                </div>
              </div>
              
              {/* Help Section */}
              <div className="mt-stack-lg pt-stack-lg border-t border-outline-variant">
                <p className="text-on-surface-variant text-center mb-4">Cần hỗ trợ về đơn hàng?</p>
                <button className="w-full py-3 px-6 rounded-full bg-primary text-white font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
                  <span className="material-symbols-outlined text-xl">forum</span>
                  Chat với Barista ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full mt-auto border-t border-outline-variant font-label-md text-label-md">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-margin py-stack-lg gap-stack-md max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</span>
            <p className="text-on-surface-variant">© 2024 AI-SMARTSERVE. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-stack-md">
            <a className="text-on-surface-variant hover:underline hover:text-primary transition-all cursor-pointer">Privacy Policy</a>
            <a className="text-on-surface-variant hover:underline hover:text-primary transition-all cursor-pointer">Terms of Service</a>
            <a className="text-on-surface-variant hover:underline hover:text-primary transition-all cursor-pointer">Contact Us</a>
            <a className="text-on-surface-variant hover:underline hover:text-primary transition-all cursor-pointer">Careers</a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-container-margin py-3 flex justify-around items-center z-50">
        <Link to="/" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold mt-1">Trang chủ</span>
        </Link>
        <Link to="/" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-bold mt-1">Thực đơn</span>
        </Link>
        <div className="flex flex-col items-center text-primary">
          <div className="relative">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
          </div>
          <span className="text-[10px] font-bold mt-1">Đơn hàng</span>
        </div>
        <div className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">loyalty</span>
          <span className="text-[10px] font-bold mt-1">Ưu đãi</span>
        </div>
      </div>
    </div>
  );
}
