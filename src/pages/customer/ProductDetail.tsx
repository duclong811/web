import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { MENU_DATA } from './Menu';

export default function ProductDetail() {
  const { id } = useParams();

  const { addToCart } = useStore();
  
  let foundItem = null;
  let categoryName = 'Cà Phê Pha Máy';
  for (const [category, items] of Object.entries(MENU_DATA)) {
    const match = items.find(i => i.id === id);
    if (match) {
      foundItem = match;
      categoryName = category;
      break;
    }
  }

  // Use a default item if not found, or find the specific item
  const item = foundItem ? { ...foundItem, categoryId: categoryName } : {
    id: '1',
    name: 'Oolong Milk Tea',
    description: 'Experience the deep, earthy soul of premium roasted Oolong tea leaves, expertly blended with our signature silky milk. A sophisticated balance of toasted notes and creamy smoothness.',
    price: 57500,
    categoryId: 'Cà Phê Pha Máy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKd6TB68l0dgvWLbBxZzmjvDZZZ_cMU4ok5MEOMER0SqvsbIR_nTB6LVT6KeYzL8siPAiiRYfcYqe09wQyWL95hdMlh1AfQJZRfWGfAqDJ7tRa5zFALx4h9trbOeMQ606u34IaPz5suzCjWu63v8yMrVSH5a_N9oGzS8XsrITZ2v-yg_2T_sFH0KVRu6ZEh1okmdJea_sxDSGMHr0U5XZlYvh8y2rRcDZXBFL0lQFP66vs7u-qb2lZ'
  };

  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState(100);
  const [ice, setIce] = useState(100);
  const [size, setSize] = useState('Vừa');
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    // Typically we'd construct a customized cart item here
    for(let i=0; i<quantity; i++){
      addToCart({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: currentPrice,
        image: item.image,
        categoryId: item.categoryId
      });
    }
    
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      // Optionally navigate back or to cart
      // navigate('/cart');
    }, 2000);
  };

  const currentPrice = item.price + (size === 'Lớn' ? 15000 : 0);
  const totalPrice = currentPrice * quantity;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim shadow-sm dark:shadow-none border-b border-outline-variant/10">
        <nav className="flex justify-between items-center px-container-margin py-4 max-w-7xl mx-auto">
          <Link to="/menu" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">AI-SMARTSERVE</Link>
          <div className="hidden md:flex items-center gap-stack-lg">
            <Link to="/menu" className="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-label-md text-label-md transition-colors">Thực Đơn</Link>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Ưu Đãi</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Câu Chuyện</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Cửa Hàng</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="material-symbols-outlined p-2 hover:bg-surface-container-low rounded-lg transition-all text-on-surface-variant">shopping_cart</Link>
            <Link to="/staff/login" className="material-symbols-outlined p-2 hover:bg-surface-container-low rounded-lg transition-all text-on-surface-variant">person</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-container-margin py-stack-lg flex flex-col md:flex-row gap-12 items-start">
        {/* Left: Product Image Section */}
        <section className="w-full md:w-1/2 md:sticky md:top-24">
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-white shadow-xl shadow-primary/5">
            <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-primary text-white font-label-sm text-label-sm px-3 py-1 rounded-full shadow-lg">Bán Chạy</span>
              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full shadow-lg">Cao Cấp</span>
            </div>
          </div>
          {/* Additional Thumbnails / Details */}
          <div className="mt-stack-md flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            <div className="w-20 h-20 rounded-xl bg-white border border-primary/10 overflow-hidden cursor-pointer hover:border-primary transition-all flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuyi1CuWmk6DXnFjciKShiOsS8MKe655-8H-quG8gcgOzsOzJs_iQrj27lXSjbqvBrD968PvHGgWQw6nLbRCz0KN-788-qvek5llm4gyk2nqg4q56vJWo8Rk1CTGScf5wyYGYkO6iWe1k5YPExcWn4XnTRpS_XQcMaqfFMSQr6pvyE0Vun6NcW-EI5XjjG-kAyugNsFHazwMnbbwuApq5nW2fFk7JCltSOmTD1pPl8ZCN-tNpt5nFL" alt="Thumb 1" />
            </div>
            <div className="w-20 h-20 rounded-xl bg-white border border-primary/10 overflow-hidden cursor-pointer hover:border-primary transition-all flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCkmlidVNiLGWsYV5ZIb58oQLTETr-Vkz3h38K-Rg6hbQf3yXR8tYOJzwvUJvMlznLxoYYRHmNmxrdgOHdakJy8ze_HVeO1zXOhXB_dpdhG-j7lt4auTcEZQy8Xn-asxA-R1WED41J7MQ1OELVuD9zbxj1I26QrnSAGQlkJth-hu2dOzELB0Rm7B3Pru5p7v3MLyYXBm0OSw_KuaccguORklobFPGGQrQYcdWhhD2WOH6BwcepRV2Y" alt="Thumb 2" />
            </div>
          </div>
        </section>

        {/* Right: Content & Customization Section */}
        <section className="w-full md:w-1/2 space-y-stack-lg">
          {/* Header Info */}
          <div className="space-y-stack-sm">
            <nav className="flex text-on-surface-variant font-label-sm text-label-sm gap-2">
              <Link to="/" className="hover:text-primary">Thực Đơn</Link>
              <span>/</span>
              <a className="hover:text-primary" href="#">Trà Sữa</a>
              <span>/</span>
              <span className="text-primary font-bold">{item.name}</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg text-on-background">{item.name}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {item.description}
            </p>
            <div className="pt-2">
              <span className="font-headline-md text-headline-md text-primary font-bold">{item.price.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-stack-lg bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/5">
            {/* Size Selector */}
            <div className="space-y-stack-sm">
              <label className="font-label-md text-label-md text-on-background block">Chọn Kích Cỡ</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSize('Vừa')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all interactive-press ${size === 'Vừa' ? 'border-primary bg-secondary-container/20 text-primary font-bold' : 'border-outline text-on-surface-variant hover:border-primary'}`}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">coffee</span> Medium
                  </span>
                  <span className="text-label-sm">+0đ</span>
                </button>
                <button 
                  onClick={() => setSize('Lớn')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all interactive-press ${size === 'Lớn' ? 'border-primary bg-secondary-container/20 text-primary font-bold' : 'border-outline text-on-surface-variant hover:border-primary'}`}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'opsz' 32" }}>coffee</span> Large
                  </span>
                  <span className="text-label-sm">+15.000đ</span>
                </button>
              </div>
            </div>

            {/* Sliders for Sugar and Ice */}
            <div className="space-y-stack-md">
              {/* Sugar */}
              <div className="space-y-stack-sm">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-background">Lượng Đường</label>
                  <span className="text-primary font-bold">{sugar}%</span>
                </div>
                <input 
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="100" min="0" step="25" type="range" value={sugar} onChange={(e) => setSugar(Number(e.target.value))} 
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1 uppercase tracking-wider">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
              
              {/* Ice */}
              <div className="space-y-stack-sm pt-4">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-background">Lượng Đá</label>
                  <span className="text-primary font-bold">{ice}%</span>
                </div>
                <input 
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="100" min="0" step="25" type="range" value={ice} onChange={(e) => setIce(Number(e.target.value))} 
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1 uppercase tracking-wider">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-stack-sm pt-2">
              <label className="font-label-md text-label-md text-on-background">Ghi Chú Đặc Biệt</label>
              <textarea 
                className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] resize-none transition-all" 
                placeholder="VD: Ít đá, thêm trân châu..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-stack-md border-t border-outline-variant/10">
            {/* Quantity Selector */}
            <div className="flex items-center bg-surface-variant/30 p-1 rounded-full border border-outline-variant/20">
              <button onClick={handleDecrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-primary hover:text-white transition-all interactive-press">
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="w-12 text-center font-bold text-headline-md">{quantity}</span>
              <button onClick={handleIncrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-primary hover:text-white transition-all interactive-press">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            {/* Add to Cart */}
            <button onClick={handleAddToCart} className={`flex-grow w-full sm:w-auto text-white py-4 px-8 rounded-full font-bold text-label-md flex items-center justify-center gap-2 transition-all shadow-lg interactive-press ${isAdded ? 'bg-tertiary-container shadow-tertiary-container/20' : 'bg-primary hover:bg-primary-container shadow-primary/20'}`}>
              <span className="material-symbols-outlined">{isAdded ? 'check_circle' : 'shopping_bag'}</span>
              {isAdded ? 'Đã Thêm!' : `Thêm vào Giỏ • ${totalPrice.toLocaleString()}đ`}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg max-w-7xl mx-auto gap-stack-md">
          <div className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</div>
          <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant font-label-sm text-label-sm">
            <a className="hover:text-primary transition-opacity" href="#">Chính Sách Bảo Mật</a>
            <a className="hover:text-primary transition-opacity" href="#">Điều Khoản</a>
            <a className="hover:text-primary transition-opacity" href="#">Bền Vững</a>
            <a className="hover:text-primary transition-opacity" href="#">Tuyển Dụng</a>
            <a className="hover:text-primary transition-opacity" href="#">Liên Hệ</a>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm text-center md:text-right">
            © 2024 AI-SMARTSERVE. Pha chế thủ công cho thói quen mỗi ngày của bạn.
          </p>
        </div>
      </footer>
    </div>
  );
}
