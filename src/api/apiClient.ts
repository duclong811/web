import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5277/api';
export const HUB_URL = 'http://localhost:5277/hubs/orders';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Bearer Token nếu có (NHƯNG không bắt buộc)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Chỉ gắn token nếu có, không throw error nếu không có
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Guest requests sẽ không có Authorization header → Backend cho phép
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
      
      // Chỉ xóa token và redirect nếu KHÔNG PHẢI là guest request
      const isGuestRequest = !localStorage.getItem('token');
      if (!isGuestRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Auto redirect về login (chỉ cho staff/authenticated users)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      // Guest requests nhận 401 → Không làm gì, để component xử lý
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
      fullResponse: error.response?.data, // Log full response để debug
    });

    // GIỮ NGUYÊN error object thay vì tạo Error mới
    // Điều này giúp component truy cập được err.response.data.errors
    return Promise.reject(error);
  }
);
