import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { systemAdminApi } from '../../api/apis';
import type { PlatformStatsDto, TenantDetailDto } from '../../types/apiTypes';
import { 
  Store, 
  QrCode, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Building2, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);
  const [tenants, setTenants] = useState<TenantDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, tenantsData] = await Promise.all([
          systemAdminApi.getPlatformStats(),
          systemAdminApi.getTenants()
        ]);
        setStats(statsData);
        setTenants(tenantsData || []);
      } catch (err) {
        console.error('Lỗi khi tải thống kê nền tảng:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner - Đồng bộ tone màu ấm cà phê */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary-container to-primary text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-on-primary-container text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Trung Tâm Điều Hành Toàn Sàn SaaS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hệ Sinh Thái Đối Tác FnB
          </h1>
          <p className="text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
            Theo dõi lưu lượng giao dịch, quản lý các quán cafe đối tác và đo lường doanh thu phí dịch vụ toàn hệ thống.
          </p>
        </div>

        <Link
          to="/system-admin/tenants"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary font-bold text-sm shadow-md hover:bg-surface-container-high transition active:scale-95 self-start md:self-auto shrink-0"
        >
          <Plus size={18} />
          <span>Thêm Quán Mới</span>
        </Link>
      </div>

      {/* KPI Bento Grid - Đồng bộ thẻ card sáng ấm áp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Tenants */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Tổng Số Quán</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Store size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-primary">
            {loading ? '...' : (stats?.totalTenants ?? 0)}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-bold">
            <CheckCircle2 size={12} />
            <span>{stats?.activeTenants ?? 0} đang hoạt động</span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Tổng Chi Nhánh</span>
            <div className="w-8 h-8 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">
            {loading ? '...' : (stats?.totalStores ?? 0)}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Điểm bán trên thị trường</div>
        </div>

        {/* Total Tables */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Bàn Gắn QR</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <QrCode size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">
            {loading ? '...' : (stats?.totalTables ?? 0)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Điểm quét đặt món</div>
        </div>

        {/* Total Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Đơn Toàn Hệ Thống</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-on-surface">
            {loading ? '...' : (stats?.totalOrders ?? 0)}
          </div>
          <div className="text-[11px] text-orange-600 mt-1">Lượt khách đã đặt món</div>
        </div>

        {/* Total GMV */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Doanh Thu Toàn Sàn (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-700 truncate" title={formatCurrency(stats?.totalGmv ?? 0)}>
            {loading ? '...' : formatCurrency(stats?.totalGmv ?? 0)}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Tổng tiền khách thanh toán</div>
        </div>

        {/* Subscription Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface-variant">Phí Thuê Bao SaaS</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-primary truncate" title={formatCurrency(stats?.monthlySubscriptionRevenue ?? 0)}>
            {loading ? '...' : formatCurrency(stats?.monthlySubscriptionRevenue ?? 0)}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Ước tính thu / tháng</div>
        </div>
      </div>

      {/* Main Grid: Tenants Table & SaaS Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tenants Table (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-primary">Các Quán Cafe Đối Tác Gần Nhất</h2>
              <p className="text-xs text-on-surface-variant">Danh sách thương hiệu đang kết nối giải pháp</p>
            </div>

            <Link
              to="/system-admin/tenants"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition"
            >
              <span>Xem tất cả ({tenants.length})</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-bold border-b border-outline-variant/20">
                <tr>
                  <th className="py-3.5 px-3">Quán Cafe</th>
                  <th className="py-3.5 px-3">Chủ Quán</th>
                  <th className="py-3.5 px-3">Gói Dịch Vụ</th>
                  <th className="py-3.5 px-3">Quy Mô</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {tenants.slice(0, 5).map(t => (
                  <tr key={t.tenantId} className="hover:bg-surface-container transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.logoUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&q=80'} 
                          alt={t.name}
                          className="w-9 h-9 rounded-xl object-cover border border-outline-variant/30 shadow-xs" 
                        />
                        <div>
                          <div className="font-bold text-on-surface text-sm">{t.name}</div>
                          <div className="text-[11px] text-on-surface-variant">{t.ownerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-on-surface">{t.ownerName}</div>
                      <div className="text-[11px] text-on-surface-variant">{t.ownerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.plan === 'premium' || t.plan === 'enterprise'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : t.plan === 'pro'
                          ? 'bg-secondary-container text-on-secondary-container border border-primary/20'
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                      }`}>
                        {t.plan || 'basic'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-on-surface">
                      {t.storeCount} điểm bán
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        t.isActive 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                        {t.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                  </tr>
                ))}

                {tenants.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant text-sm">
                      Chưa có quán cafe đối tác nào. Hãy bấm "Thêm Quán Mới".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SaaS Subscription Info Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-black text-primary">Các Gói Phần Mềm FnB</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Biểu phí áp dụng cho các quán đối tác</p>
          </div>
          
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-on-surface">Gói Starter / Cơ bản</div>
                <div className="text-[11px] text-on-surface-variant">1 Quán - Tối đa 10 bàn QR</div>
              </div>
              <span className="font-black text-primary text-sm">290.000đ/th</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary-container/50 border border-primary/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-primary">Gói Pro / Phổ thông</div>
                <div className="text-[11px] text-on-surface-variant">3 Chi nhánh - Không giới hạn bàn</div>
              </div>
              <span className="font-black text-primary text-sm">790.000đ/th</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-900">Gói Premium / Chuỗi lớn</div>
                <div className="text-[11px] text-amber-800/80">Không giới hạn điểm bán & Kho định lượng BOM</div>
              </div>
              <span className="font-black text-amber-900 text-sm">1.500.000đ/th</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed">
            💡 Super Admin có quyền cấp quyền truy cập, tạo tài khoản cho chủ quán và quản lý trạng thái dịch vụ của từng quán trên toàn quốc.
          </div>
        </div>
      </div>
    </div>
  );
}
