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
  ShiftOperationsDto,
  BusinessAnalyticsReportDto,
  MenuEngineeringSummaryDto,
  RevenueReportDto,
  CustomerAnalyticsDto,
  CategoryPerformanceDto,
  PaginationRes,
  AiRecommendationRequestDto,
  AiRecommendationResponseDto,
  AiChatRequestDto,
  AiChatResponseDto,
  IngredientDto,
  CreateIngredientDto,
  UpdateIngredientDto,
  InventoryStockDto,
  InventoryTransactionDto,
  ImportInventoryDto,
  AdjustInventoryDto,
  MenuItemRecipeDto,
  UpsertRecipeDto,
  LowStockAlertDto,
  PlatformStatsDto,
  TenantDetailDto,
  CreateTenantDto,
  UpdateTenantPlanDto
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
  },
  getShiftOperations: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<ShiftOperationsDto>>(`/Analytics/shift-operations/store/${storeId}`);
    return res.data.data;
  },
  getBusinessReport: async (storeId: number, fromDate?: string, toDate?: string) => {
    const res = await apiClient.get<ApiResponse<BusinessAnalyticsReportDto>>(`/Analytics/business-report/store/${storeId}`, {
      params: { fromDate, toDate }
    });
    return res.data.data;
  },
  getMenuEngineering: async (storeId: number, fromDate?: string, toDate?: string) => {
    const res = await apiClient.get<ApiResponse<MenuEngineeringSummaryDto>>(`/Analytics/menu-engineering/store/${storeId}`, {
      params: { fromDate, toDate }
    });
    return res.data.data;
  },
  getRevenueReport: async (storeId: number, fromDate: string, toDate: string) => {
    const res = await apiClient.get<ApiResponse<RevenueReportDto>>(`/Analytics/revenue/store/${storeId}`, {
      params: { fromDate, toDate }
    });
    return res.data.data;
  },
  getCustomerAnalytics: async (tenantId: number, fromDate?: string, toDate?: string) => {
    const res = await apiClient.get<ApiResponse<CustomerAnalyticsDto>>(`/Analytics/customers/tenant/${tenantId}`, {
      params: { fromDate, toDate }
    });
    return res.data.data;
  },
  getCategoryPerformance: async (tenantId: number, fromDate?: string, toDate?: string) => {
    const res = await apiClient.get<ApiResponse<CategoryPerformanceDto[]>>(`/Analytics/categories/tenant/${tenantId}`, {
      params: { fromDate, toDate }
    });
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

// Inventory API (FnB 4-Modules System)
export const inventoryApi = {
  getStocks: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<InventoryStockDto[]>>(`/inventory/store/${storeId}`);
    return res.data.data;
  },
  getIngredients: async (tenantId: number = 1, storeId?: number) => {
    const res = await apiClient.get<ApiResponse<IngredientDto[]>>('/inventory/ingredients', {
      params: { tenantId, storeId }
    });
    return res.data.data;
  },
  createIngredient: async (dto: CreateIngredientDto) => {
    const res = await apiClient.post<ApiResponse<IngredientDto>>('/inventory/ingredients', dto);
    return res.data.data;
  },
  updateIngredient: async (id: number, dto: UpdateIngredientDto) => {
    const res = await apiClient.put<ApiResponse<IngredientDto>>(`/inventory/ingredients/${id}`, dto);
    return res.data.data;
  },
  deleteIngredient: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<object>>(`/inventory/ingredients/${id}`);
    return res.data;
  },
  importStock: async (dto: ImportInventoryDto) => {
    const res = await apiClient.post<ApiResponse<object>>('/inventory/import', dto);
    return res.data;
  },
  adjustStock: async (dto: AdjustInventoryDto) => {
    const res = await apiClient.post<ApiResponse<object>>('/inventory/adjust', dto);
    return res.data;
  },
  getTransactions: async (storeId: number, params?: { ingredientId?: number; fromDate?: string; toDate?: string }) => {
    const res = await apiClient.get<ApiResponse<InventoryTransactionDto[]>>(`/inventory/transactions/store/${storeId}`, {
      params
    });
    return res.data.data;
  },
  getMenuItemRecipes: async (menuItemId: number) => {
    const res = await apiClient.get<ApiResponse<MenuItemRecipeDto[]>>(`/inventory/recipes/menu-item/${menuItemId}`);
    return res.data.data;
  },
  upsertRecipe: async (dto: UpsertRecipeDto) => {
    const res = await apiClient.post<ApiResponse<object>>('/inventory/recipes/menu-item', dto);
    return res.data;
  },
  deleteRecipe: async (recipeId: number) => {
    const res = await apiClient.delete<ApiResponse<object>>(`/inventory/recipes/${recipeId}`);
    return res.data;
  },
  getLowStockAlerts: async (storeId: number) => {
    const res = await apiClient.get<ApiResponse<LowStockAlertDto[]>>(`/inventory/alerts/store/${storeId}`);
    return res.data.data;
  }
};

// Super Admin Platform API
export const systemAdminApi = {
  getPlatformStats: async () => {
    const res = await apiClient.get<ApiResponse<PlatformStatsDto>>('/system/stats');
    return res.data.data;
  },
  getTenants: async () => {
    const res = await apiClient.get<ApiResponse<TenantDetailDto[]>>('/system/tenants');
    return res.data.data;
  },
  createTenant: async (payload: CreateTenantDto) => {
    const res = await apiClient.post<ApiResponse<TenantDetailDto>>('/system/tenants', payload);
    return res.data.data;
  },
  toggleTenantStatus: async (tenantId: number) => {
    const res = await apiClient.put<ApiResponse<any>>(`/system/tenants/${tenantId}/toggle-status`);
    return res.data;
  },
  updateTenantPlan: async (tenantId: number, payload: UpdateTenantPlanDto) => {
    const res = await apiClient.put<ApiResponse<any>>(`/system/tenants/${tenantId}/plan`, payload);
    return res.data;
  }
};



