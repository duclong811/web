import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock redirect delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/staff/orders');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Ambient Background Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBL3OG0JPGtQv0hk0ozMrDDBzNYJCDoKKStLYaY7D8O6Su6hZ-Cze3aiq83qssevJqSCgURnzjDvouuGoaXPRRJ4MFvPdajcFUL7R6vAjK9V_YAabyuXldtgCzKjFLaJRQcUR5WBBp-ZxYnqxaR743sSmJHifR0ANwBelvYbms-0Nlw6hGIG8_CiqgzacHMOmsT2cZOJOCo7QC_w1q7TkFBwTT4v6Uiubk0b97Pl7LO6WMWddmYIxx')" }}>
        </div>
        <div className="absolute inset-0 glass-header"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md px-container-margin animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-stack-lg text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-stack-md shadow-lg transform transition-transform hover:scale-105">
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>coffee</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1 tracking-tight">BaristaFlow</h1>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">by AI-SMARTSERVE</p>
        </div>

        {/* Login Card */}
        <div className="login-card bg-white rounded-[20px] p-8 md:p-10 border border-outline-variant/30 shadow-[0_10px_40px_-10px_rgba(85,55,34,0.1)]">
          <div className="mb-stack-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Staff Portal</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Welcome back. Please sign in to access your shift dashboard.</p>
          </div>
          
          <form className="space-y-stack-md" id="loginForm" onSubmit={handleLogin}>
            {/* Staff ID Field */}
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="staffId">Staff ID</label>
              <div className="relative group focus-within:text-primary text-on-surface-variant">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors">badge</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/50 text-on-surface" 
                  id="staffId" name="staffId" placeholder="Enter your unique ID" required type="text" defaultValue="STAFF_001" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <a className="text-label-sm font-label-sm text-primary hover:underline transition-all" href="#">Forgot PIN?</a>
              </div>
              <div className="relative group focus-within:text-primary text-on-surface-variant">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/50 text-on-surface" 
                  id="password" name="password" placeholder="••••••••" required type={showPassword ? 'text' : 'password'} defaultValue="123456"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" onClick={togglePassword} type="button">
                  <span className="material-symbols-outlined" id="eyeIcon">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 py-2">
              <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" id="remember" name="remember" type="checkbox" />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this station</label>
            </div>

            {/* Login Button */}
            <button 
              className={`w-full py-4 text-white rounded-full font-headline-md text-[18px] shadow-lg transition-all flex items-center justify-center gap-2 mt-4 group ${isSuccess ? 'bg-secondary' : 'bg-primary hover:bg-tertiary-container active:scale-[0.98]'}`} 
              type="submit"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Branding/Links */}
        <footer className="mt-stack-lg text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant/70">
            © 2024 BaristaFlow Operations. All Rights Reserved.<br/>
            Unauthorized access is prohibited.
          </p>
        </footer>
      </main>
    </div>
  );
}
