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

// Response Interceptor: Xử lý format lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);
