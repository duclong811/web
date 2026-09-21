import { useState, useEffect } from 'react';
import { systemAdminApi } from '../../api/apis';
import type { TenantDetailDto, CreateTenantDto } from '../../types/apiTypes';
import { 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Store, 
  Mail, 
  Phone, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export default function TenantManagement() {
  const [tenants, setTenants] = useState<TenantDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for new Tenant
  const [form, setForm] = useState<CreateTenantDto>({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    plan: 'basic',
    maxStores: 1,
    initialStoreName: '',
    initialStoreAddress: '',
    initialStorePhone: ''
  });

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await systemAdminApi.getTenants();
      setTenants(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đối tác:', err);
      showToast('error', 'Không thể tải danh sách quán cafe đối tác.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = async (tenant: TenantDetailDto) => {
    try {
      await systemAdminApi.toggleTenantStatus(tenant.tenantId);
      showToast('success', `Đã ${tenant.isActive ? 'khóa' : 'mở khóa'} quán '${tenant.name}' thành công!`);
      await loadTenants();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đổi trạng thái.';
      showToast('error', msg);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await systemAdminApi.createTenant({
        ...form,
        initialStoreName: form.initialStoreName || `${form.name} - Chi Nhánh 1`,
        initialStorePhone: form.initialStorePhone || form.ownerPhone
      });
      showToast('success', `Tạo quán cafe đối tác '${form.name}' và cấp tài khoản chủ quán thành công!`);
      setShowModal(false);
      setForm({
        name: '',
        slug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerPassword: '',
        plan: 'basic',
        maxStores: 1,
        initialStoreName: '',
        initialStoreAddress: '',
        initialStorePhone: ''
      });
      await loadTenants();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi tạo quán mới. Vui lòng kiểm tra lại thông tin.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerPhone.includes(searchTerm);

    const matchStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'active' ? t.isActive : !t.isActive;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-3 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary">
            Quản Lý Quán Cafe Đối Tác
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Danh sách tất cả các thương hiệu FnB đang sử dụng giải pháp QR gọi món.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-container transition active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Thêm Quán Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm theo tên quán, chủ quán, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tất cả ({tenants.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Đang hoạt động ({tenants.filter(t => t.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tạm khóa ({tenants.filter(t => !t.isActive).length})
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-4">Thương Hiệu / Quán</th>
                <th className="py-4 px-4">Chủ Sở Hữu</th>
                <th className="py-4 px-4">Gói SaaS</th>
                <th className="py-4 px-4">Quy Mô</th>
                <th className="py-4 px-4">Ngày Tham Gia</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredTenants.map(tenant => (
                <tr key={tenant.tenantId} className="hover:bg-surface-container transition">
                  {/* Brand info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/30 shrink-0">
                        <img 
                          src={tenant.logoUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&q=80'} 
                          alt={tenant.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="font-bold text-on-surface text-sm">{tenant.name}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">slug: {tenant.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Owner info */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-on-surface">{tenant.ownerName}</div>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Mail size={11} />
                      <span>{tenant.ownerEmail}</span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Phone size={11} />
                      <span>{tenant.ownerPhone}</span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      tenant.plan === 'premium' || tenant.plan === 'enterprise'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : tenant.plan === 'pro'
                        ? 'bg-secondary-container text-on-secondary-container border border-primary/20'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                    }`}>
                      {tenant.plan || 'basic'}
                    </span>
                  </td>

                  {/* Size: Stores & Tables */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-on-surface flex items-center gap-1.5">
                      <Building2 size={13} className="text-primary" />
                      <span>{tenant.storeCount} điểm bán</span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                      <Layers size={13} className="text-on-surface-variant" />
                      <span>{tenant.tableCount} bàn QR</span>
                    </div>
                  </td>

                  {/* Created At */}
                  <td className="py-4 px-4 text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(tenant.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      tenant.isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tenant.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      {tenant.isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(tenant)}
                      title={tenant.isActive ? 'Khóa quán này (tạm ngừng cung cấp dịch vụ)' : 'Mở khóa quán này'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                        tenant.isActive
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {tenant.isActive ? (
                        <>
                          <Lock size={12} />
                          <span>Khóa Quán</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>Mở Khóa</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTenants.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">
                    Không tìm thấy quán cafe nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Quán Mới - Tone ấm áp hài hòa */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl border border-outline-variant/30 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5 text-on-surface">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="text-lg font-black text-primary">Thêm Quán Cafe Đối Tác Mới</h3>
                <p className="text-xs text-on-surface-variant">Tạo đối tác và tự động cấp tài khoản đăng nhập cho Chủ Quán</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-variant transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Tên Quán Cafe / Thương Hiệu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phúc Long Coffee & Tea"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Gói Dịch Vụ SaaS *</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="basic">Gói Cơ Bản (Starter - 290k/tháng)</option>
                    <option value="pro">Gói Phổ Thông (Pro - 790k/tháng)</option>
                    <option value="premium">Gói Cao Cấp (Premium - 1.5tr/tháng)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-3">
                <div className="font-bold text-primary text-xs uppercase tracking-wider mb-2">Thông Tin Chủ Quán (Owner)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Họ và Tên Chủ Quán *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={form.ownerPhone}
                      onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Email Đăng Nhập *</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@phuclong.vn"
                      value={form.ownerEmail}
                      onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Mật Khẩu Khởi Tạo *</label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={form.ownerPassword}
                      onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-3">
                <div className="font-bold text-primary text-xs uppercase tracking-wider mb-2">Chi Nhánh Đầu Tiên</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Tên Chi Nhánh (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Chi Nhánh Quận 1"
                      value={form.initialStoreName}
                      onChange={(e) => setForm({ ...form, initialStoreName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Địa Chỉ</label>
                    <input
                      type="text"
                      placeholder="Số 10 Lê Lợi, Q.1, TP.HCM"
                      value={form.initialStoreAddress}
                      onChange={(e) => setForm({ ...form, initialStoreAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Đang Khởi Tạo...' : 'Tạo Quán Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
