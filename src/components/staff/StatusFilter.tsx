interface StatusFilterProps {
  activeFilter: string;
  onFilterChange: (status: 'all' | 'pending' | 'preparing' | 'ready' | 'paid') => void;
  counts: {
    all: number;
    pending: number;
    preparing: number;
    ready: number;
    paid: number;
  };
}

const FILTERS = [
  { key: 'all', label: 'Tất cả', icon: 'apps', color: 'gray' },
  { key: 'pending', label: 'Chờ xác nhận', icon: 'schedule', color: 'yellow' },
  { key: 'preparing', label: 'Đang chuẩn bị', icon: 'restaurant', color: 'blue' },
  { key: 'ready', label: 'Sẵn sàng', icon: 'check_circle', color: 'green' },
  { key: 'paid', label: 'Đã thanh toán', icon: 'paid', color: 'gray' },
];

export default function StatusFilter({ activeFilter, onFilterChange, counts }: StatusFilterProps) {
  const getButtonClasses = (filterKey: string, color: string) => {
    const isActive = activeFilter === filterKey;
    
    const colorClasses = {
      gray: isActive 
        ? 'bg-gray-600 text-white border-gray-600' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      yellow: isActive 
        ? 'bg-yellow-500 text-white border-yellow-500' 
        : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50',
      blue: isActive 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
      green: isActive 
        ? 'bg-green-600 text-white border-green-600' 
        : 'bg-white text-green-700 border-green-300 hover:bg-green-50',
    };

    return `flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
      colorClasses[color as keyof typeof colorClasses]
    } ${isActive ? 'shadow-md' : 'hover:shadow-sm'}`;
  };

  return (
    <div className="mb-6">
      {/* Desktop: Horizontal Filter */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key as any)}
            className={getButtonClasses(filter.key, filter.color)}
          >
            <span className="material-symbols-outlined text-xl">{filter.icon}</span>
            <span className="whitespace-nowrap">{filter.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === filter.key 
                ? 'bg-white/20' 
                : 'bg-gray-100'
            }`}>
              {counts[filter.key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile: Dropdown Filter */}
      <div className="md:hidden">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lọc theo trạng thái
        </label>
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          {FILTERS.map((filter) => (
            <option key={filter.key} value={filter.key}>
              {filter.label} ({counts[filter.key as keyof typeof counts]})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
