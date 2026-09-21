import { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', loginData);
      const { token, username, fullName, role, tenantId, storeId, storeName, brandName } = response.data.data;

      localStorage.setItem('token', token);
      setAuth({
        token,
        user: { username, fullName, role, tenantId, storeId, storeName, brandName },
      });

      onClose();
      window.location.reload(); // Reload để update UI
    } catch (err: any) {
      console.error('Login error:', err);
      console.log('Full error response data:', err.response?.data);
      
      // Handle specific error cases with user-friendly Vietnamese messages
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        const message = data?.message; // Backend format: { success: false, message: "..." }
        
        if (status === 401) {
          // Unauthorized - wrong credentials
          setError('❌ Tên đăng nhập hoặc mật khẩu không đúng.\n\nVui lòng kiểm tra lại.');
        } else if (status === 404) {
          // Not found - user doesn't exist
          setError('❌ Tài khoản không tồn tại.\n\nVui lòng đăng ký tài khoản mới.');
        } else if (status === 400) {
          // Bad request
          if (message) {
            setError(`❌ ${message}`);
          } else {
            setError('❌ Thông tin đăng nhập không hợp lệ.');
          }
        } else if (status === 500) {
          setError('⚠️ Lỗi máy chủ.\n\nVui lòng thử lại sau ít phút.');
        } else {
          if (message) {
            setError(`❌ ${message}`);
          } else {
            setError('❌ Đăng nhập thất bại.\n\nVui lòng thử lại.');
          }
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('🌐 Không thể kết nối đến máy chủ.\n\nVui lòng kiểm tra kết nối mạng.');
      } else {
        const fallbackMessage = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        setError(`❌ ${fallbackMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        fullName: registerData.fullName,
        email: registerData.email,
        phone: registerData.phoneNumber.trim(),
        password: registerData.password,
      };

      const response = await apiClient.post('/auth/register', payload);
      const resData = response.data.data;

      // Lưu thông tin khách hàng vào localStorage để sử dụng khi đặt món
      if (resData?.phone) {
        const guestSession = {
          guestId: `cust_${resData.customerId || Date.now()}`,
          storeId: 1,
          tableId: 'T01',
          guestName: resData.fullName,
          guestPhone: resData.phone,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('guestSession', JSON.stringify(guestSession));
      }

      if (resData?.token) {
        localStorage.setItem('token', resData.token);
        setAuth({
          token: resData.token,
          user: { 
            username: resData.username || resData.email, 
            fullName: resData.fullName, 
            role: resData.role || 'Customer', 
            tenantId: resData.tenantId || 1 
          },
        });
      }

      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error('Register error:', err);
      console.log('Full error response data:', err.response?.data);
      
      // Handle specific error cases with user-friendly Vietnamese messages
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        // Backend trả về format: { success: false, message: "...", errors: {...} }
        const message = data?.message;
        const errors = data?.errors; // Validation errors object from backend (ASP.NET ModelState)
        
        console.log('Parsed - status:', status);
        console.log('Parsed - message:', message);
        console.log('Parsed - errors:', errors);
        
        if (status === 400) {
          // Bad Request - validation errors
          if (errors && typeof errors === 'object') {
            // Backend trả về object errors: { "Email": ["error1", "error2"], "Password": ["error"] }
            const errorMessages: string[] = [];
            Object.keys(errors).forEach(field => {
              const fieldErrors = errors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach(msg => errorMessages.push(`❌ ${msg}`));
              } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`❌ ${fieldErrors}`);
              }
            });
            
            if (errorMessages.length > 0) {
              setError(errorMessages.join('\n'));
            } else if (message) {
              setError(`❌ ${message}`);
            } else {
              setError('❌ Dữ liệu không hợp lệ.\n\nVui lòng kiểm tra lại thông tin đã nhập.');
            }
          } else if (message) {
            // Backend trả về message trực tiếp (từ AppException)
            setError(`❌ ${message}`);
          } else {
            setError('❌ Dữ liệu không hợp lệ.\n\nVui lòng kiểm tra lại thông tin đã nhập.');
          }
        } else if (status === 409) {
          // Conflict - duplicate data (thường từ AppException với StatusCode 409)
          if (message) {
            setError(`❌ ${message}`);
          } else {
            setError('❌ Thông tin đã tồn tại trong hệ thống.\n\nVui lòng kiểm tra lại.');
          }
        } else if (status === 500) {
          setError('⚠️ Lỗi máy chủ.\n\nVui lòng thử lại sau ít phút.');
        } else {
          // Fallback cho các status code khác
          if (message) {
            setError(`❌ ${message}`);
          } else {
            setError('❌ Đăng ký thất bại.\n\nVui lòng thử lại.');
          }
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('🌐 Không thể kết nối đến máy chủ.\n\nVui lòng kiểm tra kết nối mạng của bạn.');
      } else {
        // Fallback: show any message we can get
        const fallbackMessage = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        setError(`❌ ${fallbackMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">WC</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isLogin ? 'Chào mừng bạn quay lại!' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="username123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={registerData.phoneNumber}
                onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="0912345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>
          </form>
        )}

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
