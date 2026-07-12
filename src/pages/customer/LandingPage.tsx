import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen bg-background">
      {/* TopNavBar (Shared Component Identity) */}
      <nav className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-container-margin py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-stack-lg">
            <Link to="/menu" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">AI-SMARTSERVE</Link>
            <div className="hidden md:flex gap-gutter items-center">
              <a className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1" href="#">Menu</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Rewards</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Our Story</a>
              <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Locations</a>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <button className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined text-primary">shopping_cart</span>
            </button>
            <Link to="/staff/login" className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-lg transition-all active:scale-95" title="Staff Login">
              <span className="material-symbols-outlined text-primary">person</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto flex min-h-screen">
        {/* SideNavBar (Shared Component Logic) */}
        <aside className="h-full w-64 fixed left-[calc(50%-640px)] top-0 pt-24 hidden lg:flex flex-col gap-stack-md px-4 py-8 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant/10">
          <div className="mb-stack-lg px-2">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 uppercase tracking-widest">Categories</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-xl font-bold transition-transform active:translate-x-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>coffee</span>
              <span className="font-label-md text-label-md">Hot Coffee</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30 rounded-xl transition-transform active:translate-x-1">
              <span className="material-symbols-outlined">ice_skating</span>
              <span className="font-label-md text-label-md">Cold Brew</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30 rounded-xl transition-transform active:translate-x-1">
              <span className="material-symbols-outlined">energy_savings_leaf</span>
              <span className="font-label-md text-label-md">Tea &amp; Botanicals</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30 rounded-xl transition-transform active:translate-x-1">
              <span className="material-symbols-outlined">bakery_dining</span>
              <span className="font-label-md text-label-md">Pastries</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-variant/30 rounded-xl transition-transform active:translate-x-1">
              <span className="material-symbols-outlined">local_mall</span>
              <span className="font-label-md text-label-md">Merchandise</span>
            </button>
          </nav>
          <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="font-label-sm text-label-sm text-primary mb-1">Welcome back</p>
            <p className="font-body-md text-on-surface mb-stack-md">Ready for your caffeine fix?</p>
            <button className="w-full py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
                Order Favorite
            </button>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 px-container-margin py-stack-lg">
          {/* Hero Banner */}
          <section className="relative h-[400px] rounded-3xl overflow-hidden mb-stack-lg group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                 data-alt="A high-end, atmospheric shot of a creamy vanilla latte" 
                 style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH')" }}>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-12">
              <span className="inline-block px-4 py-1 bg-tertiary text-on-tertiary rounded-full font-label-sm text-label-sm mb-4 self-start">
                  Limited Time Offer
              </span>
              <h1 className="font-headline-lg text-headline-lg text-white max-w-lg mb-4 leading-tight">
                  Awaken Your Senses with the New <span className="text-primary-fixed">Honey-Oak Latte</span>
              </h1>
              <p className="text-white/80 font-body-lg text-body-lg max-w-md mb-8">
                  Experience the delicate balance of wild clover honey and toasted oak-infused espresso.
              </p>
              <button className="w-fit px-8 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim transition-all active:scale-95">
                  Discover Seasonal Menu
              </button>
            </div>
          </section>

          {/* Search and Filter Bar */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-gutter mb-stack-lg">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full pl-12 pr-4 py-3 bg-white border border-primary/10 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface shadow-sm" placeholder="Search for your favorite brew..." type="text" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
              <button className="whitespace-nowrap px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm text-label-sm">All Items</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Popular</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">New Arrivals</button>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-primary/10 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-primary/5">Dairy-Free</button>
            </div>
          </section>

          {/* Menu Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-lg">
            {/* Drink Card 1 */}
            <Link to="/product/1" className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300 block">
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                     style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf')" }}>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                    $5.75
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-on-surface">4.8</span>
                </div>
              </div>
              <div className="p-stack-md flex flex-col h-full">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Caramel Cloud Macchiato</h3>
                <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 mb-4">
                    Velvety cold foam layered over espresso with a hint of vanilla and caramel drizzle.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <button className="px-4 py-2 border-1.5 border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary/5 transition-colors" onClick={(e) => {e.preventDefault();}}>Customize</button>
                  <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all active:scale-90" onClick={(e) => {e.preventDefault();}}>
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </Link>

            {/* Drink Card 2 */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                     style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc')" }}>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                    $4.95
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-on-surface">4.9</span>
                </div>
              </div>
              <div className="p-stack-md flex flex-col h-full">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Nitro Velvet Brew</h3>
                <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 mb-4">
                    Slow-steeped for 20 hours and infused with nitrogen for an ultra-smooth, creamy texture.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <button className="px-4 py-2 border-1.5 border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary/5 transition-colors">Customize</button>
                  <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all active:scale-90">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drink Card 3 */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                     style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S')" }}>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                    $5.25
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-on-surface">4.7</span>
                </div>
              </div>
              <div className="p-stack-md flex flex-col h-full">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Ceremonial Matcha Latte</h3>
                <p className="font-body-md text-on-surface-variant text-sm line-clamp-2 mb-4">
                    Finely ground, high-grade matcha whisked with your choice of milk for a mindful boost.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <button className="px-4 py-2 border-1.5 border-primary text-primary rounded-full font-label-sm text-label-sm hover:bg-primary/5 transition-colors">Customize</button>
                  <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-all active:scale-90">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Active Order Status Card */}
          <section className="mt-stack-lg p-stack-md bg-secondary-container/30 border border-primary/20 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white animate-pulse">coffee</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-tighter font-bold">In Preparation</p>
                <h4 className="font-headline-md text-label-md text-on-surface">Your Vanilla Cold Brew is being handcrafted</h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-secondary text-on-secondary rounded-full font-label-sm text-label-sm">ETA: 4 mins</span>
              <button className="text-primary font-label-md text-label-md hover:underline">View Details</button>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-highest dark:bg-surface-container border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin py-stack-lg max-w-7xl mx-auto gap-stack-md">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="font-headline-md text-headline-md text-primary font-bold">AI-SMARTSERVE</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 AI-SMARTSERVE. Handcrafted for your daily ritual.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-gutter">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Sustainability</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Careers</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
