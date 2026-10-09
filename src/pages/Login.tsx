import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const isSystemAdminPortal = window.location.pathname === '/system-admin/login';

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
      if (u === 'superadmin' && !isSystemAdminPortal) {
        setError('Tài khoản quản trị hệ thống chỉ đăng nhập tại cổng quản trị riêng.');
        return;
      }
      const endpoint = isSystemAdminPortal ? '/auth/admin-login' : u.includes('@') ? '/auth/owner-login' : '/auth/login';
      const response = await apiClient.post(endpoint, formData);

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

      // Kiểm tra URL redirect nhưng PHẢI kiểm tra quyền phù hợp với vai trò
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');

      // Điều hướng dựa trên vai trò (Role-based redirection)
      if (role === 'SystemAdmin') {
        // SuperAdmin chỉ nhận redirect nếu là trang của system-admin
        if (redirect && redirect.startsWith('/system-admin')) {
          navigate(redirect);
        } else {
          navigate('/system-admin');
        }
      } else if (role === 'Owner' || role === 'TenantOwner') {
        // Chủ quán chỉ nhận redirect nếu là trang /admin (không phải system-admin)
        if (redirect && redirect.startsWith('/admin') && !redirect.startsWith('/system-admin')) {
          navigate(redirect);
        } else {
          navigate('/admin');
        }
      } else if (role === 'Staff') {
        // Nhân viên chỉ nhận redirect nếu là trang /staff
        if (redirect && redirect.startsWith('/staff')) {
          navigate(redirect);
        } else {
          navigate('/staff/orders');
        }
      } else {
        navigate('/'); // Customer → Thực đơn gọi món
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message = status === 429
        ? 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ khoảng 1 phút rồi thử lại.'
        : status === 401
          ? 'Tên đăng nhập hoặc mật khẩu không chính xác.'
          : status === 403
            ? 'Tài khoản không có quyền đăng nhập vào khu vực này.'
            : err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5A4030]">AI-SMARTSERVE</h1>
          <p className="text-gray-600 mt-2">{isSystemAdminPortal ? 'Cổng quản trị hệ thống' : 'Đăng nhập vào hệ thống'}</p>
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
              placeholder="email chủ quán hoặc tài khoản nhân viên"
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
            <a href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
              Đăng ký ngay
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
