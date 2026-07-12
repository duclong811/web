import { useState } from 'react';

export default function NewOrder() {
  const [toastVisible, setToastVisible] = useState(false);
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Dine-in');

  const handleAddItem = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden">
      <style>{`
        .order-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .order-scroll::-webkit-scrollbar-thumb {
            background: #d4c3ba;
            border-radius: 10px;
        }
        .card-shadow { box-shadow: 0 4px 20px -2px rgba(85, 55, 34, 0.1); }
        .active-sink:active { transform: translateY(0.5px); box-shadow: none; }
      `}</style>
      
      {/* Left Section: Menu Grid (70%) */}
      <section className="w-[70%] h-full flex flex-col p-container-margin gap-stack-lg overflow-hidden">
        {/* Categories */}
        <div className="flex items-center gap-stack-md overflow-x-auto hide-scrollbar pb-2 shrink-0">
          <button className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md whitespace-nowrap active:scale-95 transition-transform">Coffee</button>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-surface-variant hover:bg-outline-variant rounded-full font-label-md whitespace-nowrap active:scale-95 transition-transform">Tea</button>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-surface-variant hover:bg-outline-variant rounded-full font-label-md whitespace-nowrap active:scale-95 transition-transform">Smoothies</button>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-surface-variant hover:bg-outline-variant rounded-full font-label-md whitespace-nowrap active:scale-95 transition-transform">Pastries</button>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-surface-variant hover:bg-outline-variant rounded-full font-label-md whitespace-nowrap active:scale-95 transition-transform">Brunch</button>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 custom-scrollbar pb-10">
          {/* Item 1 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjSw3sWz0_PEzYqf8HmVHzDz44J3paYXWzaNn_DKhAQgvSw1mZ2Pd17rI7eVNkLGia2oDzAYSeFigOouiiUiw3v-Ar3sV-3hRPteFCo2WfMVXjZGnQJtgyfq3SBBDKJroyOLSNhxHMYGPzqX4rena7XbWnvvHBZ2wh8MnIaVOKtXbw7bmMCTcyT_ZOtf6hmM7BpGwJV5XRCQ7W-zH5TqUSy_BtYrL4cSUlW34JZDjxQ6fetyYe3Mzr" alt="Classic Latte" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">45k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Classic Latte</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Double shot espresso with silky micro-foam.</p>
            </div>
          </div>
          {/* Item 2 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7cLsBInhGroeLJXKzWYtLyI0OvxkGhTW5isjyUb34prbvK9wsgdI6dC5nsehFByHYLZhhgFWSVKeeFoByzVIMqRkRUTL9cQHU6GCM7dtVsdZXeePG3_adN0tlO7nfc1VVbiRfpecZSZ-wkFBVlR-LiBLsSd39GxRgrsBGvjh4qTcC0uYGQcYeRiSN1DVJNj6USzw0mN0seQrnhhg6qF4coHDgM1kuCVZ6Fkvw8UGRl0FDoblwtbjQ" alt="Iced Matcha" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">55k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Iced Matcha</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Ceremonial grade Uji matcha with fresh milk.</p>
            </div>
          </div>
          {/* Item 3 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXfjhLwJb7kuUg8x4NT5wfQOpY2aVN0QWLDKuD9HVwus9cfSxsRwvMOrf5pKq-k8SG0no9dfkquiJarHrjiSjWOZvVVkBEBUTWcNRBkv6-F_nyNwlY-2bstq0uZaF7gt4RootMPdiuCQ72_PE0KRWLE2hnpMcHl7E7PKdLpKnd-3_2kFe2D5awgoaEQjAmGlQpjncGnI731eyJuE_SMamJC9plQunLtmsOd5k8L2iAA-Ws_BOs0Ew8" alt="Butter Croissant" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">35k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Butter Croissant</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Freshly baked, 24-hour fermented dough.</p>
            </div>
          </div>
          {/* Item 4 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSNAgtl36r1JpadMnEMDks3RvZjxRNCsltE9hgtVg0G9XbPGvlFZvwf1IuCq4Lo_Bxd1-j4gWFtcHr5ETttMyh-x11lguwOTUDWrzlca6upW7ZXdYwoY6Uq_FKEmdGSwjZGwHmSOMvS1_Jq8CY2HrjsvOv_g68z_mSyL8FSoibQTQsuGJn8fn3mvk7pyNglVcCxHiCpMAdnJvo3WPzyYyu1etkUv169DFTrpaAXCWHbDE8a0roeP2W" alt="Cold Brew" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">40k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Cold Brew</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Slow-steeped for 18 hours for a smooth finish.</p>
            </div>
          </div>
          {/* Item 5 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn3CHA9cASoeIA8SPcZ-T-5h28Q07FA2JXLYIxRE1SMpQknReYPICEcZIBos4LPzWvVsk7Fo_tSIxsT7VxECj-RXnkPf47bnyp0REjoDMbZpcDs0hJj5UQjiXhHliOq3HEIOCDCNYFAqpslZGJGk4x9Ct8EDmY6hroMs0t9mgk_bI15QzcJuz8fzGUpoMcGZimxaEmfUjRlmYyQ1J1qdVyHiOPrAgqCNiLURGJ6bx2c-4lEWIW2vkA" alt="Avo Smash" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">85k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Avo Smash</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Sourdough with poached egg and chili flakes.</p>
            </div>
          </div>
          {/* Item 6 */}
          <div onClick={handleAddItem} className="bg-surface rounded-xl card-shadow overflow-hidden flex flex-col active-sink cursor-pointer group transition-all">
            <div className="h-40 relative overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy9Ql1dNYJ7V-NMXX0c4eBceyRTH7gTBGQHGHyiUYuTxOTOKdAe3wRunAdwVxqpN2ntldTKT42ZOldSt8f6d6-FSdVXmcTJMCDvVM5TQA582nmLnBWA5gPx5O16BqaLvsEPadFSrM-UHrYuKOSe6MMvScJuNtIZ3F7q3vvj4ko6lVIqUxRvhvQtrJQ6lR6LazrtTwSq9Xh5n9b5NsdQrvAtA868j8qDxlAkYr7amLRffL4qUcQdWfE" alt="Tropical Acai" />
              <span className="absolute bottom-3 right-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-label-md shadow-lg">95k VND</span>
            </div>
            <div className="p-stack-md">
              <h3 className="font-headline-md text-body-lg text-primary">Tropical Acai</h3>
              <p className="text-on-surface-variant font-body-md text-label-sm mt-1">Organic acai with seasonal fruits and granola.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Right Section: Order Summary (30%) */}
      <aside className="w-[30%] h-full bg-surface-container border-l border-outline-variant flex flex-col p-6 shadow-2xl z-20 shrink-0">
        <div className="flex items-center justify-between mb-stack-lg">
          <h2 className="font-headline-md text-primary font-bold">Current Order</h2>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-bold">#4202</span>
        </div>
        
        {/* Order Type Toggle */}
        <div className="flex p-1 bg-surface-container-high rounded-xl mb-stack-md">
          <button 
            onClick={() => setOrderType('Dine-in')}
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${orderType === 'Dine-in' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
          >
            Dine-in
          </button>
          <button 
            onClick={() => setOrderType('Takeaway')}
            className={`flex-1 py-2 rounded-lg font-label-md transition-all ${orderType === 'Takeaway' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
          >
            Takeaway
          </button>
        </div>
        
        {/* Item List */}
        <div className="flex-1 overflow-y-auto order-scroll pr-2 flex flex-col gap-6">
          {/* Order Item 1 */}
          <div className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="font-label-md text-on-surface">Classic Latte</span>
              <span className="text-label-sm text-on-surface-variant italic">Hot, Oat Milk</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-label-md text-primary font-bold">90k</span>
              <div className="flex items-center bg-surface border border-outline-variant rounded-lg">
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                <span className="px-2 font-label-md">2</span>
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">add</span></button>
              </div>
            </div>
          </div>
          
          {/* Order Item 2 */}
          <div className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="font-label-md text-on-surface">Butter Croissant</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-label-md text-primary font-bold">35k</span>
              <div className="flex items-center bg-surface border border-outline-variant rounded-lg">
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                <span className="px-2 font-label-md">1</span>
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">add</span></button>
              </div>
            </div>
          </div>
          
          {/* Order Item 3 */}
          <div className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="font-label-md text-on-surface">Iced Matcha</span>
              <span className="text-label-sm text-on-surface-variant italic">Stevia, Less Ice</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-label-md text-primary font-bold">55k</span>
              <div className="flex items-center bg-surface border border-outline-variant rounded-lg">
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                <span className="px-2 font-label-md">1</span>
                <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">add</span></button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Totals */}
        <div className="mt-auto pt-stack-lg border-t border-outline-variant flex flex-col gap-2 shrink-0">
          <div className="flex justify-between font-body-md text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-bold">180k</span>
          </div>
          <div className="flex justify-between font-body-md text-on-surface-variant">
            <span>Tax (8%)</span>
            <span className="font-bold">14.4k</span>
          </div>
          <div className="flex justify-between font-headline-md text-primary mt-2 font-bold">
            <span>Total</span>
            <span>194.4k</span>
          </div>
          <button className="w-full mt-4 bg-primary text-on-primary py-4 rounded-xl font-headline-md text-body-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-tertiary-container shadow-lg font-bold">
            Proceed to Payment
            <span className="material-symbols-outlined">payments</span>
          </button>
        </div>
      </aside>

      {/* Floating Action Feedback / Toast */}
      <div className={`fixed bottom-gutter right-gutter bg-secondary text-on-secondary px-6 py-3 rounded-full shadow-xl transition-all duration-300 flex items-center gap-3 z-50 ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <span className="material-symbols-outlined">check_circle</span>
        <span className="font-label-md font-bold">Item added to order</span>
      </div>
    </div>
  );
}
