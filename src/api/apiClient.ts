import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5277/api';
export const HUB_URL = 'http://localhost:5277/hubs/orders';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Bearer Token nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Xử lý format lỗi chung và kiểm tra kết nối Backend
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu Backend chưa bật hoặc không kết nối được
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error(' Backend chưa khởi động hoặc không kết nối được tại:', API_BASE_URL);
      return Promise.reject(new Error('Không thể kết nối đến Backend. Vui lòng kiểm tra Backend đang chạy tại ' + API_BASE_URL));
    }

    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('Token hết hạn hoặc không hợp lệ. Chuyển về trang đăng nhập.');
      localStorage.removeItem('token');
      // Auto redirect về login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Xử lý lỗi 403 Forbidden
    if (error.response?.status === 403) {
      console.warn(' Không có quyền truy cập.');
    }

    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
    });

    return Promise.reject(new Error(message));
  }
);
