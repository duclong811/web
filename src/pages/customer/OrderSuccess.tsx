import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MobileBottomNav from '../../components/MobileBottomNav';
import { useStore } from '../../store/useStore';
import { ShoppingCart, Copy, Check } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('code') || searchParams.get('orderCode');
  
  const { cart, activeOrder, guestSession } = useStore();
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  
  const [copied, setCopied] = useState(false);
  
  // Get order details from activeOrder or construct from params
  const displayOrder = activeOrder || {
    orderCode: orderCode || 'N/A',
    total: 0,
    items: []
  };

  // Generate VietQR URL
  const generateVietQR = () => {
    const bankId = '970422'; // MB Bank
    const accountNo = '0123456789'; // Replace with actual account
    const accountName = 'THECOFFEEHOUSE';
    const amount = Math.round(displayOrder.total || 50000);
    const description = `Thanh toan ${displayOrder.orderCode}`.replace(/\s/g, '%20');
    
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;
  };

  const trackingUrl = guestSession 
    ? `${window.location.origin}/tracking?guestId=${guestSession.guestId}`
    : `${window.location.origin}/tracking?code=${displayOrder.orderCode}`;

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const createConfetti = () => {
      const container = document.getElementById('confetti-container');
      if (!container) return;
      
      const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];
      
      for (let i = 0; i < 30; i++) {
        const confetto = document.createElement('div');
        confetto.classList.add('confetti');
        confetto.style.left = Math.random() * 100 + '%';
        confetto.style.top = Math.random() * 100 + '%';
        confetto.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetto.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
        confetto.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`;
        confetto.style.opacity = (Math.random() * 0.4 + 0.1).toString();
        
        confetto.animate([
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 0.5 },
            { transform: `translate(${Math.random() * 40 - 20}px, ${Math.random() * -100 - 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 3000,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
        });

        container.appendChild(confetto);
      }
    };

    createConfetti();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-background font-body-md">
      <style>{`
        .success-float {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .confetti {
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #79573f;
            opacity: 0.3;
        }
      `}</style>

      {/* Top Navigation Anchor (Shared Component Mapping) */}
      <header className="bg-surface docked full-width top-0 sticky z-50 shadow-sm w-full">
        <div className="flex justify-between items-center w-full px-container-margin py-4 max-w-7xl mx-auto">
          <Link to="/" className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</Link>
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
      </header>

      {/* Main Success Canvas */}
      <main className="flex-grow flex items-center justify-center w-full px-container-margin py-stack-lg">
        <div className="max-w-xl w-full text-center space-y-stack-lg relative">
          
          {/* Atmospheric Confetti (Canvas layer) */}
          <div className="absolute inset-0 pointer-events-none overflow-visible" id="confetti-container"></div>
          
          {/* Hero Success Icon */}
          <div className="relative inline-block mt-8">
            <div className="w-48 h-48 bg-secondary-container rounded-full flex items-center justify-center success-float mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[80px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>coffee</span>
              <div className="absolute -top-2 -right-2 bg-primary w-14 h-14 rounded-full border-4 border-surface flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl font-bold" data-icon="check">check</span>
              </div>
            </div>
            
            {/* Subtle steam effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 opacity-40">
              <div className="w-1 h-8 bg-primary-fixed rounded-full blur-[1px] animate-pulse"></div>
              <div className="w-1 h-12 bg-primary-fixed rounded-full blur-[1px] animate-pulse delay-75"></div>
              <div className="w-1 h-6 bg-primary-fixed rounded-full blur-[1px] animate-pulse delay-150"></div>
            </div>
          </div>
          
          {/* Title Section */}
          <div className="space-y-stack-sm">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">
              Đặt Món Thành Công! 🎉
            </h2>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Mã đơn hàng:</span>
              <span className="font-label-md text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full font-bold">
                {displayOrder.orderCode}
              </span>
            </div>
            {guestSession?.tableId && (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">table_restaurant</span>
                <span className="text-sm text-on-surface-variant">Bàn {guestSession.tableId}</span>
              </div>
            )}
          </div>
          
          {/* VietQR Payment Section */}
          <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-lg space-y-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                Quét Mã Thanh Toán
              </h3>
              <span className="text-xl font-black text-primary">
                {(displayOrder.total || 50000).toLocaleString('vi-VN')}đ
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
              <img 
                src={generateVietQR()} 
                alt="VietQR Payment" 
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/300x300/8B5CF6/white?text=VietQR';
                }}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xs text-on-surface-variant">
                Mở app Ngân hàng → Quét QR → Thanh toán
              </p>
              <p className="text-xs font-bold text-primary">
                Nội dung: Thanh toan {displayOrder.orderCode}
              </p>
            </div>
          </div>
          
          {/* Tracking Link */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 space-y-3 relative z-10">
            <p className="text-sm font-bold text-on-surface">Lưu link theo dõi đơn hàng:</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={trackingUrl}
                className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface-variant"
              />
              <button
                onClick={copyTrackingLink}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                title="Sao chép link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              💡 Lưu link này để theo dõi trạng thái đơn hàng bất cứ lúc nào!
            </p>
          </div>
          
          {/* Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/30 shadow-sm text-left space-y-stack-md relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-container rounded-lg">
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Thời gian chuẩn bị</p>
                <p className="font-body-lg text-body-lg text-on-surface font-bold">10-15 phút</p>
              </div>
            </div>
            
            <div className="h-px bg-outline-variant/20 w-full"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-fixed rounded-lg">
                <span className="material-symbols-outlined text-primary">restaurant_menu</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Barista của chúng tôi đang bắt đầu pha chế món ngon cho bạn. 
                Vui lòng thanh toán qua VietQR bên trên để xác nhận đơn hàng nhé!
              </p>
            </div>
          </div>
          
          {/* Call to Action Cluster */}
          <div className="flex flex-col md:flex-row gap-4 pt-stack-md relative z-10">
            <Link 
              to={guestSession ? `/tracking?guestId=${guestSession.guestId}` : `/tracking?code=${displayOrder.orderCode}`}
              className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-4 rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Theo dõi đơn hàng
            </Link>
            <Link to="/menu" className="flex-1 border-2 border-primary text-primary font-label-md text-label-md py-4 rounded-full hover:bg-surface-container-low transition-colors active:scale-[0.98] flex items-center justify-center">
              Tiếp tục đặt món
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer Component */}
      <footer className="w-full mt-auto bg-surface-container-low border-t border-outline-variant relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-margin py-stack-lg gap-stack-md max-w-7xl mx-auto">
          <span className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</span>
          <div className="flex flex-wrap justify-center gap-stack-md">
            <a className="font-label-md text-label-md text-on-surface-variant hover:underline cursor-pointer">Privacy Policy</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:underline cursor-pointer">Terms of Service</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:underline cursor-pointer">Contact Us</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:underline cursor-pointer">Careers</a>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">© 2024 AI-SMARTSERVE. All rights reserved.</p>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
