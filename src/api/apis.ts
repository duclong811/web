import { apiClient } from './apiClient';
import type { 
  ApiResponse, 
  StoreMenuResponse, 
  MenuItemDto, 
  CategoryDto, 
  CreateOrderDto, 
  OrderDto, 
  TableDto, 
  LoginRequest, 
  LoginResponse, 
  CheckVoucherRequest, 
  VoucherValidationResult, 
  DashboardStatsDto,
  PaginationRes,
  AiRecommendationRequestDto,
  AiRecommendationResponseDto,
  AiChatRequestDto,
  AiChatResponseDto
} from '../types/apiTypes';

// Menu API
export const menuApi = {
  getStoreMenu: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<StoreMenuResponse>>(`/Menu/store/${storeId}`);
    return res.data.data;
  },
  getCategories: async (tenantId: number) => {
    const res = await apiClient.get<ApiResponse<CategoryDto[]>>(`/Menu/categories/tenant/${tenantId}`);
    return res.data.data;
  },
  getMenuItems: async (tenantId: number, categoryId?: number) => {
    const res = await apiClient.get<ApiResponse<MenuItemDto[]>>(`/Menu/items/tenant/${tenantId}`, {
      params: { categoryId }
    });
    return res.data.data;
  },
  getMenuItemById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<MenuItemDto>>(`/Menu/items/${id}`);
    return res.data.data;
  }
};

// Order API
export const orderApi = {
  createOrder: async (dto: CreateOrderDto) => {
    const res = await apiClient.post<ApiResponse<OrderDto>>('/orders', dto);
    return res.data.data;
  },
  getOrderById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<OrderDto>>(`/orders/${id}`);
    return res.data.data;
  },
  getOrderByCode: async (code: string) => {
    const res = await apiClient.get<ApiResponse<OrderDto>>(`/orders/code/${code}`);
    return res.data.data;
  },
  getActiveOrders: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<OrderDto[]>>(`/orders/active/store/${storeId}`);
    return res.data.data;
  },
  searchOrders: async (storeId: number, pageNumber = 1, pageSize = 20, status?: string) => {
    const res = await apiClient.get<ApiResponse<PaginationRes<OrderDto>>>(`/orders/store/${storeId}`, {
      params: { pageNumber, pageSize, status }
    });
    return res.data.data;
  },
  updateStatus: async (orderId: number, status: string) => {
    const res = await apiClient.put<ApiResponse<OrderDto>>(`/orders/${orderId}/status`, { status });
    return res.data.data;
  }
};

// Auth API
export const authApi = {
  loginStaff: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/Auth/login', data);
    return res.data.data;
  },
  loginOwner: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/Auth/owner-login', data);
    return res.data.data;
  }
};

// Table API
export const tableApi = {
  getTablesByStore: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<TableDto[]>>(`/Tables/store/${storeId}`);
    return res.data.data;
  },
  updateStatus: async (tableId: number, status: string) => {
    const res = await apiClient.put<ApiResponse<TableDto>>(`/Tables/${tableId}/status`, { status });
    return res.data.data;
  }
};

// Voucher API
export const voucherApi = {
  checkVoucher: async (data: CheckVoucherRequest) => {
    const res = await apiClient.post<ApiResponse<VoucherValidationResult>>('/Vouchers/check', data);
    return res.data.data;
  }
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<DashboardStatsDto>>(`/Analytics/dashboard/store/${storeId}`);
    return res.data.data;
  }
};

// AI SmartServe API
export const aiApi = {
  getRecommendations: async (dto: AiRecommendationRequestDto) => {
    const res = await apiClient.post<ApiResponse<AiRecommendationResponseDto>>('/AI/recommend', dto);
    return res.data.data;
  },
  chatWithSommelier: async (dto: AiChatRequestDto) => {
    const res = await apiClient.post<ApiResponse<AiChatResponseDto>>('/AI/chat', dto);
    return res.data.data;
  }
};

