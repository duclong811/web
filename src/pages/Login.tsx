import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const u = formData.username.trim().toLowerCase();
      // Chọn endpoint đăng nhập phù hợp theo tài khoản
      let endpoint = '/auth/login';
      if (u === 'superadmin' || u === 'admin') {
        endpoint = '/auth/admin-login';
      } else if (u.includes('@')) {
        endpoint = '/auth/owner-login';
      }

      let response;
      try {
        response = await apiClient.post(endpoint, formData);
      } catch (firstErr: any) {
        // Fallback thử các role khác nếu không khớp endpoint ban đầu
        try {
          response = await apiClient.post('/auth/admin-login', formData);
        } catch {
          try {
            response = await apiClient.post('/auth/owner-login', formData);
          } catch {
            try {
              response = await apiClient.post('/auth/login', formData);
            } catch {
              throw firstErr;
            }
          }
        }
      }

      const { token, username, fullName, role, tenantId, storeId, storeName, brandName } = response.data.data;

      // Lưu token vào localStorage
      localStorage.setItem('token', token);

      // Lưu thông tin user vào store
      setAuth({
        token,
        user: {
          username,
          fullName,
          role,
          tenantId,
          storeId,
          storeName,
          brandName,
        },
      });

      // Kiểm tra URL redirect
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
        return;
      }

      // Điều hướng dựa trên role
      if (role === 'SystemAdmin' || role === 'Owner' || role === 'Manager' || role === 'TenantOwner') {
        navigate('/admin/inventory'); // Admin Dashboard & Inventory
      } else if (role === 'Staff' || role === 'Kitchen' || role === 'Cashier' || role === 'Barista') {
        navigate('/staff/orders'); // Staff → Staff Order Dashboard
      } else {
        navigate('/'); // Customer → Menu
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (username: string, password: string) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">WC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">WebCafe</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập / Email
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="superadmin hoặc staff_q1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm text-orange-600 hover:text-orange-700">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
              Đăng ký ngay
            </a>
          </p>
        </div>

        {/* Demo Accounts (Clickable 1-Click) */}
        <div className="mt-8 p-4 bg-orange-50/70 border border-orange-200/60 rounded-xl">
          <p className="text-xs font-bold text-orange-900 mb-2.5 flex items-center gap-1.5">
            <span></span>
            <span>Tài khoản demo sẵn có (Bấm để điền nhanh):</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setDemo('superadmin', 'Admin@123')}
              className="text-left px-3 py-2 bg-white hover:bg-orange-100/60 border border-orange-200 rounded-lg text-xs transition-all flex items-center justify-between group active:scale-95"
            >
              <div>
                <span className="font-bold text-orange-800"> Quản Trị Viên (Admin):</span>
                <span className="ml-1.5 font-mono text-gray-700">superadmin</span>
              </div>
              <span className="text-[11px] font-semibold text-orange-600 group-hover:underline">Bấm để điền</span>
            </button>

            <button
              type="button"
              onClick={() => setDemo('staff_q1', 'Staff@123')}
              className="text-left px-3 py-2 bg-white hover:bg-orange-100/60 border border-orange-200 rounded-lg text-xs transition-all flex items-center justify-between group active:scale-95"
            >
              <div>
                <span className="font-bold text-orange-800"> Nhân Viên (Staff):</span>
                <span className="ml-1.5 font-mono text-gray-700">staff_q1</span>
              </div>
              <span className="text-[11px] font-semibold text-orange-600 group-hover:underline">Bấm để điền</span>
            </button>

            <button
              type="button"
              onClick={() => setDemo('owner@thecoffeehouse.vn', 'Owner@123')}
              className="text-left px-3 py-2 bg-white hover:bg-orange-100/60 border border-orange-200 rounded-lg text-xs transition-all flex items-center justify-between group active:scale-95"
            >
              <div>
                <span className="font-bold text-orange-800"> Chủ Quán (Owner):</span>
                <span className="ml-1.5 font-mono text-gray-700 truncate max-w-[150px] inline-block align-bottom">owner@thecoffeehouse.vn</span>
              </div>
              <span className="text-[11px] font-semibold text-orange-600 group-hover:underline">Bấm để điền</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
