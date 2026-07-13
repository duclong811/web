import { useStore } from '../../store/useStore';
import { useState } from 'react';

export default function MenuManagement() {
  const { menuItems, categories } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All Items');

  const filteredItems = activeCategory === 'All Items' 
    ? menuItems 
    : menuItems.filter(item => categories.find(c => c.id === item.categoryId)?.name === activeCategory);

  return (
    <div className="pt-24 pb-12 px-gutter animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-stack-lg gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Quản Lý Thực Đơn</h2>
            <p className="text-on-surface-variant font-body-md">Refine and organize your offerings for 'AI-SMARTSERVE'</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label-md shadow-md hover:bg-primary-container transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Add New Item
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-stack-md pb-2">
          {['All Items', ...categories.map(c => c.name)].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-secondary-container text-on-secondary-container border border-primary/20' 
                  : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md">
          {/* Main Product Table/List (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Product</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Danh Mục</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Giá</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Trạng Thái</th>
                    <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredItems.map(item => {
                    const category = categories.find(c => c.id === item.categoryId)?.name || 'Unknown';
                    const isPreparing = item.id.includes('3'); // Just a mock logic to show some 'Preparing' state
                    
                    return (
                      <tr key={item.id} className="hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img className="w-12 h-12 rounded-lg object-cover" src={item.image} alt={item.name} />
                            <div>
                              <p className="font-label-md text-on-surface">{item.name}</p>
                              <p className="text-xs text-on-surface-variant line-clamp-1">{item.description || 'Signature blend'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-secondary-container/40 text-secondary text-xs font-semibold">
                            {category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-label-md text-primary">{item.price.toLocaleString()}đ</td>
                        <td className="px-6 py-4">
                          {isPreparing ? (
                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Đang Pha Chế</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">Ready</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:bg-primary-fixed px-3 py-1.5 rounded-lg transition-all text-sm font-bold active:scale-95">Sửa</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-sm text-on-surface-variant">
              <span>Showing 1-{filteredItems.length} of {filteredItems.length} items</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-surface-container-highest disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-container-highest disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats/Quick Thao Tács (4 cols) */}
          <div className="lg:col-span-4 space-y-stack-md">
            {/* Analytics Card */}
            <div className="bg-surface-container-highest p-stack-md rounded-xl hover:scale-[0.985] transition-transform duration-200 shadow-[0_4px_20px_rgba(85,55,34,0.06)] relative overflow-hidden group">
              <h3 className="font-label-md text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Menu Performance
              </h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-2xl font-bold text-primary">84%</p>
                  <p className="text-xs text-on-surface-variant">Inventory Efficiency</p>
                  <div className="w-full bg-outline-variant/30 h-1.5 rounded-full mt-1">
                    <div className="bg-primary h-full w-[84%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-surface-container-lowest/50 p-3 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold">Top Seller</p>
                    <p className="text-sm font-bold">Caramel Macchiato</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">award_star</span>
                </div>
              </div>
            </div>


            {/* Marketing Banner */}
            <div className="bg-primary-container p-stack-md rounded-xl text-on-primary-container relative overflow-hidden min-h-[160px] flex flex-col justify-end">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="material-symbols-outlined !text-6xl">campaign</span>
              </div>
              <h4 className="font-headline-md leading-tight mb-2">Seasonal Specials Launching Soon</h4>
              <p className="text-xs opacity-90 mb-4">Update your menu with Autumn roasts before Sept 15th.</p>
              <button className="w-fit bg-on-primary-container text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform">Plan Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
