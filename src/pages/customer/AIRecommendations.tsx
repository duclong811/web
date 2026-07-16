import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import MobileBottomNav from '../../components/MobileBottomNav';
import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';

export default function AIRecommendations() {
  const { cart, addToCart } = useStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (id: string, name: string, price: number, image: string, categoryId: string = 'AI Gợi Ý') => {
    addToCart({
      id,
      name,
      price,
      categoryId,
      description: 'Gợi ý từ chuyên gia AI',
      image
    });
  };

  useEffect(() => {
    // Subtle parallax effect on scroll for cards
    const handleScroll = () => {
      const cards = document.querySelectorAll('.group.bg-white');
      cards.forEach((card: any) => {
        const speed = 0.05;
        const rect = card.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;
        if (visible) {
          const shift = (window.innerHeight / 2 - rect.top) * speed;
          card.style.transform = `translateY(${shift}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <header className="bg-surface dark:bg-surface-container-high shadow-sm dock full-width top-0 sticky z-50 transition-all duration-300">
        <div className="flex justify-between items-center px-container-margin py-4 w-full max-w-7xl mx-auto">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">AI-SMARTSERVE</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container px-3 py-2 rounded-lg">Thực Đơn</Link>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container px-3 py-2 rounded-lg cursor-pointer">Ưu Đãi</a>
            <Link to="/cart" className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md">Giỏ Hàng</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <ShoppingCart className="text-primary" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        {/* Hero Confirmation Section */}
        <section className="px-container-margin py-stack-lg max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-stack-lg bg-secondary-container rounded-3xl p-8 shadow-sm">
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
              <div className="relative z-10 w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                <img className="w-full h-full object-cover" data-alt="Oolong Milk Tea" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOZn-rzgY3-0eTzFo51NLGFduXdcaJXtSTzb80iQQGWxC54cgzZS0N41q0Tqakdr9wAudUjTzfJrvKSyzEOayl861oFzYDfu_SYO2c-t2x92ORYFVQAIK0EMG9HyfGMOngsH5xCGdB86p6iaRzbWB_8PfVylIdjRL6ht1OmVVY0vlwzcy8qXH6PRENkxIgXLJQexWbsc8JveIYk1qkp0rJ4h4XioU1YA6JGaKksqCI8AIZf7vnUq1f" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Lựa Chọn Tuyệt Vời!</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Món <span className="font-bold text-primary">Oolong Milk Tea</span> của bạn đã được thêm vào giỏ. Để ngon hơn nữa, chuyên gia AI của chúng tôi gợi ý các món ăn kèm sau.</p>
            </div>
          </div>
        </section>

        {/* AI-Powered Pairings (Bento Grid Style) */}
        <section className="px-container-margin py-stack-lg max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h3 className="font-headline-md text-headline-md text-primary">Gợi Ý Ghép Đôi Từ AI</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Recommendation 1 */}
            <div className="group bg-white rounded-[16px] p-4 shadow-[0_4px_20px_rgba(85,55,34,0.08)] hover:shadow-[0_8px_30px_rgba(85,55,34,0.12)] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Almond Croissant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAlwhNX6VEn4w1bVqQuNP4PUn6Q2E4EJpS7Mpqgrd2OSfvPjEZvCHn4t8ywUAeAfoSgsNjiIJeJfYuRRGAEaF7BZmucXjsF_cHCyESl4UeEWOzc8Td9B_oGwhLagwLJn-u5e0L52t7AcC22VeNxjYmOxY58d-bY-quB2bZOQQBKSBmGonefSR9FSP3ejUE8Rn6wmpcqoveWKKO5jdvA9WG7MX81sq9371MSF_iGWKKbRA-nYfKd0gY" />
                <div className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-label-sm font-bold shadow-lg">45.000đ</div>
              </div>
              <h4 className="font-headline-md text-[18px] text-primary mb-1">Almond Croissant</h4>
              <div className="bg-tertiary-fixed-dim/20 rounded-lg p-3 mb-4">
                <p className="text-label-sm text-on-tertiary-fixed-variant leading-relaxed italic">"Vị bùi của hạnh nhân nướng cân bằng hoàn hảo với hương vị mộc mạc, đậm mùi hoa của trà Oolong."</p>
              </div>
              <button onClick={() => handleAddToCart('pas-1', 'Almond Croissant', 45000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlwhNX6VEn4w1bVqQuNP4PUn6Q2E4EJpS7Mpqgrd2OSfvPjEZvCHn4t8ywUAeAfoSgsNjiIJeJfYuRRGAEaF7BZmucXjsF_cHCyESl4UeEWOzc8Td9B_oGwhLagwLJn-u5e0L52t7AcC22VeNxjYmOxY58d-bY-quB2bZOQQBKSBmGonefSR9FSP3ejUE8Rn6wmpcqoveWKKO5jdvA9WG7MX81sq9371MSF_iGWKKbRA-nYfKd0gY', 'Bánh Ngọt')} className="w-full py-3 rounded-full bg-primary text-white font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm vào Combo
              </button>
            </div>

            {/* Recommendation 2 */}
            <div className="group bg-white rounded-[16px] p-4 shadow-[0_4px_20px_rgba(85,55,34,0.08)] hover:shadow-[0_8px_30px_rgba(85,55,34,0.12)] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Lavender Macaron" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47" />
                <div className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-label-sm font-bold shadow-lg">32.500đ</div>
              </div>
              <h4 className="font-headline-md text-[18px] text-primary mb-1">Lavender Macaron</h4>
              <div className="bg-tertiary-fixed-dim/20 rounded-lg p-3 mb-4">
                <p className="text-label-sm text-on-tertiary-fixed-variant leading-relaxed italic">"Hương hoa oải hương dịu nhẹ hòa quyện tuyệt vời với kết cấu béo ngậy của trà sữa."</p>
              </div>
              <button onClick={() => handleAddToCart('pas-2', 'Lavender Macaron', 32500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2LFP7YTlf3W-DOmahNfhkeE0REOIwkRfAktI1kbdHD2DK0vqUqOO1NX7ea-dKF2oXfa1tXT89j6nrCHqkiBa5DHKBi5C1yl-c1d1cB5ZtC-FHi5MQsWVr5VS97cW6etQbfGBvzm73n1NvYWZH86mQ8higX0Li6GemA1RgpGQJicWWjzt-16tjecEePOQrA2S9mNGh8knNi6OFTvPR27SVcbAWYjBviiIJXgLOeLvL4k0YW0P_47', 'Bánh Ngọt')} className="w-full py-3 rounded-full bg-primary text-white font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm vào Combo
              </button>
            </div>

            {/* Recommendation 3 */}
            <div className="group bg-white rounded-[16px] p-4 shadow-[0_4px_20px_rgba(85,55,34,0.08)] hover:shadow-[0_8px_30px_rgba(85,55,34,0.12)] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Lemon Drizzle Cake" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5PnNR9EJ9_C7qSwCOdp6yH1t5-DLWUqXtY4A5FMhwixIoOJyrBg3bK9e-_f1-tzeYsFanDAgNYJPf4VoznlqPppyyWKhfqWRSBYYn5TQaf3CfhjPggGJZGJx8ScOQik2WgFnbY1LzqDNtBXCIBehrlilZbnWITubGSTs5j-JrsLztnB5PrcdOqJe7-ZX-yOAwdYox_sfSDO1Wjg5TPhTGbVfBAhjQvmMRLZYHfjlgrIi7HSGnR0wd" />
                <div className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-label-sm font-bold shadow-lg">57.500đ</div>
              </div>
              <h4 className="font-headline-md text-[18px] text-primary mb-1">Lemon Drizzle Cake</h4>
              <div className="bg-tertiary-fixed-dim/20 rounded-lg p-3 mb-4">
                <p className="text-label-sm text-on-tertiary-fixed-variant leading-relaxed italic">"Vị cam chanh thanh mát làm dịu đi độ béo của sữa, làm tươi mới vị giác sau mỗi ngụm."</p>
              </div>
              <button onClick={() => handleAddToCart('pas-3', 'Lemon Drizzle Cake', 57500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PnNR9EJ9_C7qSwCOdp6yH1t5-DLWUqXtY4A5FMhwixIoOJyrBg3bK9e-_f1-tzeYsFanDAgNYJPf4VoznlqPppyyWKhfqWRSBYYn5TQaf3CfhjPggGJZGJx8ScOQik2WgFnbY1LzqDNtBXCIBehrlilZbnWITubGSTs5j-JrsLztnB5PrcdOqJe7-ZX-yOAwdYox_sfSDO1Wjg5TPhTGbVfBAhjQvmMRLZYHfjlgrIi7HSGnR0wd', 'Bánh Ngọt')} className="w-full py-3 rounded-full bg-primary text-white font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm vào Combo
              </button>
            </div>

            {/* Recommendation 4 */}
            <div className="group bg-white rounded-[16px] p-4 shadow-[0_4px_20px_rgba(85,55,34,0.08)] hover:shadow-[0_8px_30px_rgba(85,55,34,0.12)] transition-all duration-300 border border-transparent hover:border-primary/10">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Butter Shortbread" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S" />
                <div className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-label-sm font-bold shadow-lg">40.000đ</div>
              </div>
              <h4 className="font-headline-md text-[18px] text-primary mb-1">Butter Shortbread</h4>
              <div className="bg-tertiary-fixed-dim/20 rounded-lg p-3 mb-4">
                <p className="text-label-sm text-on-tertiary-fixed-variant leading-relaxed italic">"Hương vị bơ nguyên bản, mộc mạc giúp làm nổi bật trọn vẹn hương vị lá trà Oolong thượng hạng."</p>
              </div>
              <button onClick={() => handleAddToCart('pas-4', 'Butter Shortbread', 40000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQmARlY698zgmUMPEQAyQyQi2X-Py-b6Ni4vHDZnB6JZq6CZaFYoxcEa3WHflpNIpEShXRYYllKUeYssnYg6p03XLfsbVPKP511ra2kOYQ84RlyWMi_Rsv-Q1BMIovtQ_3UvvgK3JJM81xrVVu0umKCdUbXyLbxPmpwO7orbW8rojKDeFEIlpqySzrjPVf74T0PinblMbp9HMq2NQUl0xqaKmX7Y140jvlQm_3-ERmJw6FK6Bcea0S', 'Bánh Ngọt')} className="w-full py-3 rounded-full bg-primary text-white font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm vào Combo
              </button>
            </div>
          </div>
        </section>

        {/* Recommended Combos (Asymmetric Layout) */}
        <section className="bg-surface-container py-stack-lg px-container-margin">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-tertiary font-bold tracking-widest text-label-sm uppercase mb-2 block">Ưu Đãi Đặc Biệt</span>
                <h3 className="font-headline-md text-headline-md text-primary">Gói Combo Tuyển Chọn</h3>
              </div>
              <p className="text-on-surface-variant max-w-md">Các Barista của chúng tôi đã tuyển chọn sẵn những món được yêu thích nhất. Tiết kiệm 15% khi bạn gọi theo gói hôm nay.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
              {/* Bundle Card 1 */}
              <div className="flex flex-col sm:flex-row bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="sm:w-1/2 h-64 sm:h-auto relative">
                  <img className="w-full h-full object-cover" data-alt="Combo 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJonOoRVtp75jLFjbYKlZWznNOnDuOeLHG64m4ONgxDQCNWifUblrvlsw4VgG_p69645mJnnA6cLzCSr2NjW4A0e91iuAZ5gphC5kmfvUNVMPtFZcvV3gFW6vUgJQyrpYQzqh9b3Jcul57FUQ9nBr1evDsi-FVn66O5fBV_P9trR4rl63JLjAakZ26AMRbSOj7h1yCtRWs1oGecyRN_28gVhkuLy5vWrgeX4XnjfUP4qR7CLM25nJR" />
                  <div className="absolute top-4 left-4 bg-tertiary text-white font-bold text-label-sm px-3 py-1 rounded-full">BÁN CHẠY NHẤT</div>
                </div>
                <div className="sm:w-1/2 p-8 flex flex-col justify-center">
                  <h4 className="font-headline-md text-primary mb-2">Thức Uống Buổi Sáng</h4>
                  <p className="text-on-surface-variant text-body-md mb-6">Oolong Milk Tea + Almond Croissant + Trái Cây Tươi</p>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-on-surface-variant line-through font-body-md text-body-md">142.500đ</span>
                    <span className="text-primary font-bold text-headline-md">119.500đ</span>
                  </div>
                  <button onClick={() => handleAddToCart('combo-1', 'Thức Uống Buổi Sáng', 119500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJonOoRVtp75jLFjbYKlZWznNOnDuOeLHG64m4ONgxDQCNWifUblrvlsw4VgG_p69645mJnnA6cLzCSr2NjW4A0e91iuAZ5gphC5kmfvUNVMPtFZcvV3gFW6vUgJQyrpYQzqh9b3Jcul57FUQ9nBr1evDsi-FVn66O5fBV_P9trR4rl63JLjAakZ26AMRbSOj7h1yCtRWs1oGecyRN_28gVhkuLy5vWrgeX4XnjfUP4qR7CLM25nJR', 'Combo')} className="w-full py-3 rounded-full bg-secondary text-white font-label-md hover:bg-opacity-90 transition-all active:scale-95">Nâng Cấp Đơn Hàng</button>
                </div>
              </div>

              {/* Bundle Card 2 */}
              <div className="flex flex-col sm:flex-row bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="sm:w-1/2 h-64 sm:h-auto relative order-first sm:order-last">
                  <img className="w-full h-full object-cover" data-alt="Combo 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdS9L4GoZiyPNcaqpTJhX2PFNee5iRRr-ZSOifvQ9Rfa8Huzrfaf8btQuIpUvzIdqk6mu4aErLJ7nY0N_qC8sih8bWa5ZwzCAg4whxroQTnt8--_VTqMKwkvRenjIWnzNm1wIsc2a82P_jfVjFJ7s_3Uuz8lwur7RWYGqtEWfUOmAOH3MS3VZA7zGWcdmxrTkAE4XdyuszhK5WcWp0R5Hq-MYk66AhBysE80BInlA940__GYZr5xiS" />
                  <div className="absolute top-4 right-4 bg-primary text-white font-bold text-label-sm px-3 py-1 rounded-full">MÓN NGỌT</div>
                </div>
                <div className="sm:w-1/2 p-8 flex flex-col justify-center">
                  <h4 className="font-headline-md text-primary mb-2">Tiệc Trà Chiều</h4>
                  <p className="text-on-surface-variant text-body-md mb-6">Oolong Milk Tea + 3 Macaron + Shortbread</p>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-on-surface-variant line-through font-body-md text-body-md">165.000đ</span>
                    <span className="text-primary font-bold text-headline-md">135.000đ</span>
                  </div>
                  <button onClick={() => handleAddToCart('combo-2', 'Tiệc Trà Chiều', 135000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdS9L4GoZiyPNcaqpTJhX2PFNee5iRRr-ZSOifvQ9Rfa8Huzrfaf8btQuIpUvzIdqk6mu4aErLJ7nY0N_qC8sih8bWa5ZwzCAg4whxroQTnt8--_VTqMKwkvRenjIWnzNm1wIsc2a82P_jfVjFJ7s_3Uuz8lwur7RWYGqtEWfUOmAOH3MS3VZA7zGWcdmxrTkAE4XdyuszhK5WcWp0R5Hq-MYk66AhBysE80BInlA940__GYZr5xiS', 'Combo')} className="w-full py-3 rounded-full bg-secondary text-white font-label-md hover:bg-opacity-90 transition-all active:scale-95">Nâng Cấp Đơn Hàng</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-16 md:bottom-0 bg-white/80 backdrop-blur-md border-t border-outline-variant py-6 px-container-margin z-40">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Link to="/" className="w-full sm:w-auto px-10 py-3 rounded-full border-2 border-primary text-primary font-label-md hover:bg-primary/5 transition-colors text-center">Tiếp Tục Chọn Món</Link>
            <Link to="/cart" className="w-full sm:w-auto px-12 py-4 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
              Đến Trang Thanh Toán
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-lowest full-width bottom transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg w-full max-w-7xl mx-auto gap-8">
          <div className="text-center md:text-left">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">AI-SMARTSERVE</h2>
            <p className="text-on-surface-variant mt-2 font-body-md text-body-md">Nơi mang đến sự ấm áp và thoải mái mỗi ngày.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed font-body-md text-body-md transition-colors opacity-100 hover:opacity-80 cursor-pointer">Về Chúng Tôi</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed font-body-md text-body-md transition-colors opacity-100 hover:opacity-80 cursor-pointer">Cửa Hàng</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed font-body-md text-body-md transition-colors opacity-100 hover:opacity-80 cursor-pointer">Chính Sách Bảo Mật</a>
            <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed font-body-md text-body-md transition-colors opacity-100 hover:opacity-80 cursor-pointer">Điều Khoản Dịch Vụ</a>
          </div>
          <div className="text-on-surface-variant font-body-md text-body-md">
            © 2024 AI-SMARTSERVE. All rights reserved.
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
