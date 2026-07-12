import { useEffect } from 'react';

export default function Analytics() {
  return (
    <div className="pt-24 px-container-margin pb-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); border: 1px solid rgba(85, 55, 34, 0.05); }
        .chart-bar { transition: height 1s ease-in-out; }
        .heatmap-cell:hover { transform: scale(1.1); z-index: 10; transition: transform 0.2s; }
      `}</style>

      {/* Header Section */}
      <section className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Analytics Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Tracking your cafe's growth and operational health.</p>
        </div>
        <div className="flex bg-surface-container p-1 rounded-xl w-fit">
          <button className="px-4 py-2 rounded-lg text-label-sm font-semibold bg-white shadow-sm text-primary">Daily</button>
          <button className="px-4 py-2 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Weekly</button>
          <button className="px-4 py-2 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Monthly</button>
        </div>
      </section>

      {/* KPI Metric Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {/* Total Revenue */}
        <div className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-fixed rounded-lg text-primary">
              <span className="material-symbols-outlined" data-icon="payments">payments</span>
            </div>
            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px] mr-1" data-icon="trending_up">trending_up</span>
              <span className="text-[12px] font-bold">12.5%</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-headline-md font-bold text-on-surface">$24,850.00</h3>
        </div>
        
        {/* Total Orders */}
        <div className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
              <span className="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
            </div>
            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px] mr-1" data-icon="trending_up">trending_up</span>
              <span className="text-[12px] font-bold">8.2%</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Orders</p>
          <h3 className="text-headline-md font-bold text-on-surface">1,429</h3>
        </div>
        
        {/* Average Order Value */}
        <div className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
              <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
            </div>
            <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px] mr-1" data-icon="trending_down">trending_down</span>
              <span className="text-[12px] font-bold">2.1%</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Avg. Order Value</p>
          <h3 className="text-headline-md font-bold text-on-surface">$17.39</h3>
        </div>
        
        {/* Customer Retention */}
        <div className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-outline-variant/20 rounded-lg text-primary">
              <span className="material-symbols-outlined" data-icon="person_celebrate">person_celebrate</span>
            </div>
            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px] mr-1" data-icon="trending_up">trending_up</span>
              <span className="text-[12px] font-bold">4.8%</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Retention Rate</p>
          <h3 className="text-headline-md font-bold text-on-surface">68.4%</h3>
        </div>
      </section>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg">
        {/* Revenue Chart (Large Area) */}
        <section className="lg:col-span-8 glass-card p-6 rounded-3xl min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-md text-headline-md text-primary">Revenue Trends</h3>
            <div className="flex items-center space-x-2 text-on-surface-variant font-label-sm">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span>Direct Sales</span>
              <span className="w-3 h-3 rounded-full bg-secondary ml-4"></span>
              <span>Delivery</span>
            </div>
          </div>
          {/* Mock Chart Visualization */}
          <div className="flex-1 flex items-end justify-between px-2 gap-2">
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-32 hover:h-40 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$1.2k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-2/3"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">MON</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-48 hover:h-52 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2.8k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-3/4"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">TUE</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-40 hover:h-44 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$1.9k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-1/2"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">WED</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-64 hover:h-72 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$3.4k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-4/5"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">THU</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-56 hover:h-60 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2.9k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-2/3"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">FRI</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-72 hover:h-80 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$4.1k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-full"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">SAT</span>
            </div>
            <div className="flex flex-col items-center flex-1 space-y-2">
              <div className="w-full bg-primary/20 rounded-t-lg relative group h-52 hover:h-56 transition-all duration-500 cursor-pointer">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$3.0k</div>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-4/5"></div>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">SUN</span>
            </div>
          </div>
        </section>

        {/* Category Distribution (Doughnut) */}
        <section className="lg:col-span-4 glass-card p-6 rounded-3xl flex flex-col">
          <h3 className="font-headline-md text-headline-md text-primary mb-6">Sales by Category</h3>
          <div className="relative flex-1 flex items-center justify-center mb-6">
            {/* Semi-circle ring visualization */}
            <div className="w-48 h-48 rounded-full border-[24px] border-secondary-container relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[24px] border-primary" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }}></div>
              <div className="absolute inset-0 rounded-full border-[24px] border-secondary" style={{ clipPath: "polygon(0% 0%, 50% 0%, 50% 50%, 0% 0%)", transform: "rotate(45deg)" }}></div>
              <div className="text-center">
                <p className="text-headline-md font-bold text-primary">100%</p>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Inventory</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-label-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Specialty Coffee</span>
              </div>
              <span className="font-bold">45%</span>
            </div>
            <div className="flex items-center justify-between text-label-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Pastries &amp; Bakery</span>
              </div>
              <span className="font-bold">30%</span>
            </div>
            <div className="flex items-center justify-between text-label-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                <span>Tea &amp; Smoothies</span>
              </div>
              <span className="font-bold">15%</span>
            </div>
            <div className="flex items-center justify-between text-label-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                <span>Seasonal/Merch</span>
              </div>
              <span className="font-bold">10%</span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Top Selling Products */}
        <section className="lg:col-span-5 glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">Top Products</h3>
            <button className="text-primary text-label-sm font-bold flex items-center hover:underline">
              View All <span className="material-symbols-outlined text-[16px] ml-1" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-2 hover:bg-surface-container rounded-2xl transition-colors group">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjnpQy9KJxOKYPh_YSnRI6BzlGiyLhSxYxOoSmHomqwmedbRxDzsmGFSpeirRTrW7uaoV5Myppsv_wWKSx32NW1eBnNxR4xLioiLpav28-qgZ17L5IAiOfx9_YFShIRe4EQm_7qld7VaBNQ2nnFVA-bLdolozUFGcqIaTs-Rxx3jOFZcxFnJhRMO1UGdFZJsHY62VO1Tmw6z3syJCH5WCYVhJnQC3s4YcSePKaDCZBajcW-R8lOqWR" alt="Brown Sugar Pearl Milk Tea" />
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface">Brown Sugar Pearl Milk Tea</h4>
                <p className="text-[12px] text-on-surface-variant">Signature Drink</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">482 sold</p>
                <p className="text-[10px] text-green-600 font-bold">+$3,374</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-2 hover:bg-surface-container rounded-2xl transition-colors group">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZc4O2oP-3YhY6dZKyBksQVGU5JZa09oQ-Gq2TOg2R_5Ha-MdeUSpyAzg_dTX6NxxBBZYxt3nIyHLdemWs9Q90gKgekfYGIJPTY8oE-i8O7clXe0gShlvDwBroB4LMhSG3NgVfNEDunGRkLScaJdOQd1ydi9sJgXALfYE_zhHkx_f7r3S7yKfEF0_5kyVlGuFBm8UTaaf-_ctMbE4aZqo-fGCk0kI9Z66kehURg9V8klvphy4JGPzC" alt="Almond Croissant" />
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface">Almond Croissant</h4>
                <p className="text-[12px] text-on-surface-variant">Fresh Bakery</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">315 sold</p>
                <p className="text-[10px] text-green-600 font-bold">+$1,575</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-2 hover:bg-surface-container rounded-2xl transition-colors group">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1bVTjD8yTCyCUR5knyHB26Zekk4FLaoRsrRY7A-ljPL0JD-OhqKQVvJRMhztazOlpCZtL7OSTyq_n3NKp5QAeTxcIHwDfm7aXVg53Gu2e_Hcugq7E3ZBLka-Ba7z_XoQgk5xWvSa4snWYcUm9oDdsgfL_MKEeGYcFcv25Zh8hCr-ngSduJwKtNRWKqUc6E6nO6KJModxZR0-mVIewqF8dHIUp-rStzurVtYzcmt-IrZKSS6il-GrU" alt="Oat Milk Latte" />
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface">Oat Milk Latte</h4>
                <p className="text-[12px] text-on-surface-variant">Classic Coffee</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">289 sold</p>
                <p className="text-[10px] text-green-600 font-bold">+$1,734</p>
              </div>
            </div>
          </div>
        </section>

        {/* Peak Hours Heatmap */}
        <section className="lg:col-span-7 glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">Peak Hours Heatmap</h3>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">Activity:</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-sm bg-primary/10"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Heatmap Grid */}
              <div className="grid grid-cols-[auto_repeat(12,_1fr)] gap-2">
                {/* Header Hours */}
                <div className="h-6"></div>
                {['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm'].map(h => (
                  <div key={h} className="text-[10px] font-bold text-center text-on-surface-variant">{h}</div>
                ))}
                
                {/* Row: Mon-Fri Average */}
                <div className="text-[10px] font-bold flex items-center pr-2 text-on-surface-variant">WEEKDAYS</div>
                <div className="h-10 rounded bg-primary/40 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/70 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/80 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/50 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/60 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/30 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/40 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/70 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/90 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/60 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/20 heatmap-cell"></div>
                
                {/* Row: Weekend Average */}
                <div className="text-[10px] font-bold flex items-center pr-2 text-on-surface-variant">WEEKENDS</div>
                <div className="h-10 rounded bg-primary/20 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/50 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/80 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary heatmap-cell"></div>
                <div className="h-10 rounded bg-primary heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/90 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/80 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/70 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/60 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/50 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/40 heatmap-cell"></div>
                <div className="h-10 rounded bg-primary/30 heatmap-cell"></div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-secondary-container/20 rounded-2xl border border-secondary/20">
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-secondary" data-icon="lightbulb">lightbulb</span>
              <p className="text-label-sm text-on-surface">Staffing Recommendation: Increase counter staff by 2 between 10am - 12pm on Saturdays to reduce wait times during peak morning rush.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
