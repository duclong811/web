import { useStore } from '../../store/useStore';

export default function AdminDashboard() {
  const { orders } = useStore();

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const activeTables = new Set(orders.filter(o => o.status !== 'paid').map(o => o.tableNumber)).size;

  return (
    <div className="pt-24 px-container-margin pb-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <header className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary">Overview</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Welcome back, Alex. Here's what's brewing today.</p>
      </header>

      {/* Top Level Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md mb-stack-lg">
        {/* Revenue Card */}
        <div className="bg-surface-container-lowest p-stack-md rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5 group hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span className="text-green-600 font-label-sm bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">Today's Revenue</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{revenue.toLocaleString()}đ</h3>
        </div>

        {/* Orders Card */}
        <div className="bg-surface-container-lowest p-stack-md rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5 group hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <span className="text-on-surface-variant font-label-sm bg-surface-container px-2 py-1 rounded-lg">{todayOrders.length} orders</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">Order Volume</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{todayOrders.length}</h3>
        </div>

        {/* Active Tables Card */}
        <div className="bg-surface-container-lowest p-stack-md rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5 group hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">table_restaurant</span>
            </div>
            <span className="text-primary font-label-sm bg-primary/5 px-2 py-1 rounded-lg">{activeTables > 0 ? 'Busy' : 'Quiet'}</span>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">Bàn Đang Phục Vụ</p>
          <h3 className="font-headline-md text-headline-md text-on-surface">{activeTables}/12</h3>
        </div>

        {/* Best Seller Card */}
        <div className="bg-surface-container-lowest p-stack-md rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5 group hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-md mb-1">Signature Choice</p>
          <h3 className="font-label-md text-primary">Signature Latte</h3>
        </div>
      </div>

      {/* Analytics & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg mb-stack-lg">
        {/* Revenue Trend Chart (Visual Simulation) */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-[2.5rem] shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5">
          <div className="flex justify-between items-center mb-stack-lg">
            <h4 className="font-headline-md text-primary">Revenue Trends</h4>
            <select className="bg-surface-container border-none text-sm rounded-full px-4 py-1.5 focus:ring-primary/20 outline-none">
              <option>Last 7 Days</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-[180px] w-full relative overflow-hidden flex items-end justify-between gap-2 px-2">
            <div className="flex-1 bg-primary/10 rounded-t-xl h-[40%] transition-all hover:bg-primary/40"></div>
            <div className="flex-1 bg-primary/10 rounded-t-xl h-[55%] transition-all hover:bg-primary/40"></div>
            <div className="flex-1 bg-primary/10 rounded-t-xl h-[45%] transition-all hover:bg-primary/40"></div>
            <div className="flex-1 bg-primary/10 rounded-t-xl h-[70%] transition-all hover:bg-primary/40"></div>
            <div className="flex-1 bg-primary/20 rounded-t-xl h-[90%] transition-all hover:bg-primary/60"></div>
            <div className="flex-1 bg-primary/10 rounded-t-xl h-[65%] transition-all hover:bg-primary/40"></div>
            <div className="flex-1 bg-primary-container rounded-t-xl h-[85%] transition-all hover:bg-primary shadow-lg"></div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-primary">Today</span>
          </div>
        </div>

        {/* Best Sellers List */}
        <div className="bg-surface-container-lowest p-stack-lg rounded-[2.5rem] shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5">
          <h4 className="font-headline-md text-primary mb-stack-lg">Top Sellers</h4>
          <div className="space-y-stack-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGXjRn8A92In3tf-6hUVu56mwEQ1psqfRr2yc_6r_dS8v2-m9nyBurXTBbMEW0Whb7LmcuPt6QOcwVKaDo55L4FH8ocdiaxdHvA_-2Il-Dksj8HfRq45bxnb9uN9WvUyTpMCUi8R91fJGlUUcwx56BzL_9ZuKnAb1oHt-JfQJyAWRUYjDCSsxLRWLKZA1sEIRVdaPpLtArMcWI6U9BmlHEJYIRO3TDbGsSF4bhpd-iVW3itFcgvRA3" alt="Latte" />
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">Signature Latte</p>
                <p className="text-xs text-on-surface-variant">142 orders this week</p>
              </div>
              <span className="font-label-md text-primary">65.000đ</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaaoZchupSP2VKB3--PRU2j-EtTS0mFkVm0sbLLVm8bgOjyT7S0kHEVV5FMwpFfX5n90iVrZ-XlTKLixTPiFP8x2Xl3N25c8vKJmeXj_gk4lc-VF93-O03UTUPOKIZcla8hfDpZVyUxahw8DtoymE1ppsD76zOMUilQ8UaezXDixCvm5Z-omeWAwRmKTxrYir0Mge5DK50vVPT3QtaFjo5SBXGZuKvXT9v1MRWzJWcKNjIOd73-Daj" alt="Croissant" />
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">Butter Croissant</p>
                <p className="text-xs text-on-surface-variant">98 orders this week</p>
              </div>
              <span className="font-label-md text-primary">45.000đ</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqNiKdibTt6bFQJ8p52Vm5cE-a0FZ_uWOaErtIWzfFQ-UTOY1cf8pNtAD8eh6hCYQG68w6jTQM_-D-rsQZeaDlaXJxnz49CrKnfWzMqFJPnck0PKALuVz_DqSJW52yaAbXpfi2zmP6isWCMaQxadRca-EmvPmIeEXfAqxmdGxmgDiJsHwzJlMeRwuamvpX22hmzdMpWVc08erBRGDcTvz6E2qaV-U3qHF-CPLGamlSKIcLC1HTzdpa" alt="Cold Brew" />
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">Cold Brew</p>
                <p className="text-xs text-on-surface-variant">76 orders this week</p>
              </div>
              <span className="font-label-md text-primary">55.000đ</span>
            </div>
          </div>
          <button className="w-full mt-stack-lg py-3 rounded-full border-2 border-primary text-primary font-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95">
            View Full Menu Analytics
          </button>
        </div>
      </div>

      {/* Recent Activity & Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
        {/* Recent Activity List */}
        <div className="bg-surface-container-lowest p-stack-lg rounded-[2.5rem] shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5">
          <div className="flex justify-between items-center mb-stack-lg">
            <h4 className="font-headline-md text-primary">Recent Activity</h4>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">more_horiz</span>
          </div>
          <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
            
            {orders.slice(0, 4).map((order, idx) => (
              <div key={order.id} className="flex gap-4 items-start p-3 hover:bg-surface-container-low rounded-2xl transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${order.status === 'paid' ? 'bg-secondary-container text-primary' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-lg" style={order.status === 'paid' ? {fontVariationSettings: "'FILL' 1"} : {}}>
                    {order.status === 'paid' ? 'check_circle' : 'receipt_long'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Order #{order.id.slice(-4)} {order.status === 'paid' ? 'Completed' : 'Created'}</p>
                  <p className="text-xs text-on-surface-variant">{order.items.length} items • Table {order.tableNumber.replace('table-', '')}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-bold">{idx * 15} MINS AGO</p>
                </div>
              </div>
            ))}

            <div className="flex gap-4 items-start p-3 hover:bg-surface-container-low rounded-2xl transition-colors border-l-4 border-tertiary-fixed">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-lg">error</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Inventory Alert</p>
                <p className="text-xs text-on-surface-variant">Whole Milk stock is below 15% threshold.</p>
                <p className="text-[10px] text-on-surface-variant mt-1 font-bold">1 HOUR AGO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Status Map (Interactive Visualization) */}
        <div className="bg-surface-container-lowest p-stack-lg rounded-[2.5rem] shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/5">
          <div className="flex justify-between items-center mb-stack-lg">
            <h4 className="font-headline-md text-primary">Live Floor Map</h4>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary"></span> {activeTables} Occupied
              <span className="w-2 h-2 rounded-full bg-surface-container-highest ml-2"></span> {12 - activeTables} Free
            </div>
          </div>
          
          <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[280px]">
            {/* Dynamic Table Grid */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const tableNo = idx + 1;
              const isOccupied = Array.from(orders.filter(o => o.status !== 'paid').map(o => o.tableNumber)).includes(tableNo.toString());
              
              if (isOccupied) {
                return (
                  <div key={tableNo} className="bg-primary-container/20 rounded-2xl flex flex-col items-center justify-center border-2 border-primary/30 relative overflow-hidden group cursor-pointer hover:bg-primary/20 transition-all">
                    <span className="text-xs font-bold text-primary mb-1">T-{tableNo.toString().padStart(2, '0')}</span>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                  </div>
                );
              }
              
              return (
                <div key={tableNo} className="bg-surface-container rounded-2xl flex flex-col items-center justify-center border-2 border-transparent cursor-pointer hover:border-primary/20 transition-all">
                  <span className="text-xs font-bold text-on-surface-variant mb-1">T-{tableNo.toString().padStart(2, '0')}</span>
                  <span className="material-symbols-outlined text-on-surface-variant/40">person</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
