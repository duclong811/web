import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, createOrder } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = 5000;
  const total = subtotal + serviceFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder('table-1'); // Mock table number
    navigate('/order-success');
  };

  return (
    <div className="font-body-md text-on-surface custom-scrollbar min-h-screen flex flex-col">
      {/* TopNavBar Implementation */}
      <nav className="bg-surface sticky top-0 z-50 shadow-sm transition-all duration-200 border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-container-margin py-4 max-w-7xl mx-auto">
          <Link to="/menu" className="font-headline-md text-headline-md font-bold text-primary">AI-SMARTSERVE</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/menu" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">Menu</Link>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Rewards</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Our Story</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Locations</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95 duration-200">
                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined text-primary">person</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-container-margin py-stack-lg">
        <div className="flex flex-col lg:flex-row gap-stack-lg">
          {/* Left Side: Cart Items & Payment */}
          <div className="flex-grow space-y-stack-lg">
            {/* Section Header */}
            <div className="flex items-center gap-stack-sm mb-stack-md">
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-90" onClick={() => window.history.back()}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="font-headline-lg text-headline-lg text-primary">Checkout</h1>
            </div>

            {/* Cart Items List */}
            <section className="space-y-stack-md">
              <h2 className="font-headline-md text-headline-md text-on-surface-variant border-b border-outline-variant/20 pb-2">Your Order</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-[64px] text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                  <h2 className="font-headline-md text-on-surface">Your cart is empty.</h2>
                  <Link to="/" className="px-8 py-3 bg-primary text-white rounded-full font-label-md shadow-md hover:bg-primary-container transition-all active:scale-95">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_20px_rgba(85,55,34,0.05)] border border-surface-variant flex items-center gap-4 group transition-all hover:shadow-[0_8px_30px_rgba(85,55,34,0.1)]">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-headline-md text-headline-md text-primary">{item.name}</h3>
                          <p className="text-on-surface-variant text-label-sm font-label-sm">Standard</p>
                        </div>
                        <span className="font-bold text-primary">{item.price.toLocaleString()}₫</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-4 border border-outline-variant/10">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant active:scale-90 transition-all">
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className="font-label-md text-label-md font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant active:scale-90 transition-all">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-error text-label-sm font-label-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-[16px]">delete</span> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Payment Method Section */}
            {cart.length > 0 && (
              <section className="bg-white p-6 rounded-2xl border border-outline-variant/20">
                <h2 className="font-headline-md text-headline-md text-primary mb-6">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 border-2 border-primary bg-secondary-container/20 rounded-xl">
                      <span className="material-symbols-outlined text-primary mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                      <div className="flex-grow">
                        <p className="font-bold text-primary">VietQR Bank Transfer</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Instant confirmation</p>
                      </div>
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                    <div className="flex items-center p-4 border border-outline-variant rounded-xl hover:bg-surface-container-low cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant mr-3">payments</span>
                      <div className="flex-grow">
                        <p className="font-bold text-on-surface">Cash on Delivery</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">Pay when you receive</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code Area */}
                  <div className="flex flex-col items-center justify-center bg-surface-container-low rounded-2xl p-6 border border-dashed border-primary/30">
                    <div className="relative w-48 h-48 bg-white p-3 rounded-lg shadow-inner mb-4">
                      <div className="absolute inset-0 m-3 border-2 border-primary/10 rounded"></div>
                      <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUfM0jqU1ucCrF16D0Pk3cY4WKSYdtEprABtNdL0wOWCpaHMZ8d638jA7fKjTm5mDDTGp86Xrmo8lJZu5acec_HYloU7turdWft4pHjix04_EbqRN52OJ0b7RztzrFhAnhzompZfpwQRNjJE5IxyAH4pCZNz2IFzs3StAZtcwWox1AHC0vMSVml7cBhu3Z24LE-yl5hiJycyXJ8Z14Im6nsRpNSmRGyO9OPnNECriB0FcNIBH3oHeP" alt="QR Code" />
                    </div>
                    <p className="text-label-sm font-label-sm text-center text-on-surface-variant">
                      Scan the VietQR to pay <br/>
                      <span className="font-bold text-primary">{total.toLocaleString()}₫</span>
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Side: Order Summary */}
          {cart.length > 0 && (
            <aside className="w-full lg:w-[380px] shrink-0">
              <div className="sticky top-24 space-y-stack-lg">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_8px_40px_rgba(85,55,34,0.08)] border border-surface-variant">
                  <h2 className="font-headline-md text-headline-md text-primary mb-stack-md border-b border-outline-variant/10 pb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="font-body-md text-body-md">Subtotal</span>
                      <span className="font-bold">{subtotal.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="font-body-md text-body-md">Delivery Fee</span>
                      <span className="font-bold text-[#34d399]">FREE</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="font-body-md text-body-md">Service Fee</span>
                        <span className="material-symbols-outlined text-[16px] cursor-help">info</span>
                      </div>
                      <span className="font-bold">{serviceFee.toLocaleString()}₫</span>
                    </div>
                    
                    <div className="pt-4 border-t border-outline-variant/30 mt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-headline-md text-headline-md text-primary">Total</span>
                        <span className="font-headline-lg text-headline-lg text-primary">{total.toLocaleString()}₫</span>
                      </div>
                      
                      {/* Promo Code */}
                      <div className="relative mb-6">
                        <input className="w-full pl-4 pr-20 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-label-md font-label-md transition-all" placeholder="Promo code" type="text" />
                        <button className="absolute right-2 top-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-label-sm font-label-sm hover:brightness-110 active:scale-95 transition-all">Apply</button>
                      </div>
                      
                      {/* CTA Button */}
                      <button onClick={handleCheckout} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Đặt món
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                      
                      <p className="text-[11px] text-center text-on-surface-variant mt-4 leading-relaxed">
                        By placing your order, you agree to AI-SMARTSERVE's 
                        <a className="underline hover:text-primary mx-1" href="#">Terms of Service</a> and 
                        <a className="underline hover:text-primary mx-1" href="#">Privacy Policy</a>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Support Badge */}
                <div className="bg-secondary-container/30 border border-secondary-container p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">support_agent</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-label-md font-label-md">Need help with your order?</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Chat with our barista anytime</p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest mt-auto border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg max-w-7xl mx-auto gap-stack-md">
          <div className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Sustainability</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Careers</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Contact Us</a>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm opacity-70">
            © 2024 AI-SMARTSERVE. Handcrafted for your daily ritual.
          </p>
        </div>
      </footer>
    </div>
  );
}
