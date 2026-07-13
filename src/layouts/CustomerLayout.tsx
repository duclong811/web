import { Outlet, Link } from 'react-router-dom';
import { Coffee, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function CustomerLayout() {
  const cart = useStore(state => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.top-nav', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    gsap.from('.main-content', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out'
    });
  }, { scope: container });

  return (
    <div ref={container} className="app-layout" style={{ flexDirection: 'column' }}>
      <header className="top-nav">
        <Link to="/menu" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}>
            <Coffee size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>AI-SMARTSERVE</h1>
        </Link>
        <Link to="/cart" className="btn btn-secondary" style={{ position: 'relative', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)' }}>
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: 'var(--error)', color: 'white',
              borderRadius: '50%', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(248, 113, 113, 0.4)'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </header>
      <main className="main-content" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
