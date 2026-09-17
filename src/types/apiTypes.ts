export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

export interface PaginationRes<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// --- Menu Types ---
export interface CategoryDto {
  categoryId: number;
  tenantId: number;
  name: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SizeDto {
  sizeId: number;
  name: string;
  extraPrice: number;
}

export interface ToppingDto {
  toppingId: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItemDto {
  menuItemId: number;
  tenantId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  rating: number;
  isFeatured: boolean;
  isAvailable: boolean;
  sortOrder: number;
  sizes: SizeDto[];
  toppings: ToppingDto[];
}

export interface StoreMenuResponse {
  storeId: number;
  tenantId: number;
  storeName: string;
  address?: string | null;
  phone?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  brandName: string;
  logoUrl?: string | null;
  categories: CategoryDto[];
  menuItems: MenuItemDto[];
}

// --- Order Types ---
export interface CreateOrderItemToppingDto {
  toppingId: number;
}

export interface CreateOrderItemDto {
  menuItemId: number;
  sizeId?: number | null;
  quantity: number;
  sugarLevel: string;
  iceLevel: string;
  note?: string | null;
  toppings?: CreateOrderItemToppingDto[];
}

export interface CreateOrderDto {
  storeId: number;
  tableId?: number | null;
  customerPhone?: string | null;
  customerName?: string | null;
  voucherCode?: string | null;
  pointsToUse: number;
  note?: string | null;
  items: CreateOrderItemDto[];
}

export interface OrderItemToppingDto {
  orderItemToppingId: number;
  toppingId: number;
  toppingName: string;
  price: number;
}

export interface OrderItemDto {
  orderItemId: number;
  menuItemId: number;
  menuItemName: string;
  imageUrl?: string | null;
  sizeId?: number | null;
  sizeName?: string | null;
  quantity: number;
  unitPrice: number;
  toppingTotal: number;
  subTotal: number;
  sugarLevel: string;
  iceLevel: string;
  note?: string | null;
  toppings: OrderItemToppingDto[];
}

export interface OrderDto {
  orderId: number;
  tenantId: number;
  storeId: number;
  storeName: string;
  orderCode: string;
  tableId?: number | null;
  tableNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  subTotal: number;
  discountAmount: number;
  pointsUsed: number;
  pointsEarned: number;
  totalAmount: number;
  note?: string | null;
  createdAt: string;
  items: OrderItemDto[];
}

// --- Table Types ---
export interface TableDto {
  tableId: number;
  storeId: number;
  tableNumber: string;
  capacity: number;
  location?: string | null;
  qrCodeUrl?: string | null;
  status: 'Available' | 'Occupied' | 'Reserved';
  isActive: boolean;
  activeOrderId?: number | null;
  activeOrderCode?: string | null;
}

// --- Auth Types ---
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  tenantId: number;
  storeId?: number | null;
  storeName?: string | null;
  brandName?: string | null;
}

// --- Voucher Types ---
export interface CheckVoucherRequest {
  code: string;
  storeId: number;
  orderAmount: number;
  customerPhone?: string | null;
}

export interface VoucherValidationResult {
  isValid: boolean;
  message: string;
  voucherId?: number | null;
  code: string;
  title: string;
  discountType: 'percent' | 'fixed';
  discountAmount: number;
  finalAmount: number;
}

// --- Analytics Types ---
export interface TopProductDto {
  menuItemId: number;
  name: string;
  soldCount: number;
  totalRevenue: number;
}

export interface DailyRevenueDto {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface DashboardStatsDto {
  todayRevenue: number;
  todayOrders: number;
  totalCustomers: number;
  availableTables: number;
  occupiedTables: number;
  topProducts: TopProductDto[];
  revenueChart: DailyRevenueDto[];
}

// --- Cart Item State (Local) ---
export interface CartItemState {
  cartItemId: string; // unique for cart item (same menuItemId + sizeId + toppings)
  menuItem: MenuItemDto;
  selectedSize?: SizeDto | null;
  selectedToppings: ToppingDto[];
  sugarLevel: string;
  iceLevel: string;
  quantity: number;
  note?: string;
  itemPrice: number; // base + size extra + toppings
  subTotal: number;
}

// --- AI Recommendation Types ---
export interface AiRecommendationRequestDto {
  storeId: number;
  tenantId: number;
  customerId?: number | null;
  currentCartItemIds?: number[];
  occasion?: string | null;
  moodOrPreference?: string | null;
}

export interface AiRecommendedItemDto {
  menuItemId: number;
  name: string;
  imageUrl?: string | null;
  price: number;
  categoryName: string;
  reason: string;
  pairingTip?: string | null;
  badge: string;
  confidenceScore: number;
  suggestedSugarLevel?: string | null;
  suggestedIceLevel?: string | null;
  suggestedSize?: string | null;
  isDrink?: boolean;
}

export interface AiRecommendedComboDto {
  title: string;
  description: string;
  itemIds: number[];
  items: AiRecommendedItemDto[];
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  tag: string;
}

export interface AiRecommendationResponseDto {
  isAiGenerated: boolean;
  modelUsed: string;
  headline: string;
  chefNote: string;
  recommendations: AiRecommendedItemDto[];
  combos: AiRecommendedComboDto[];
}

// --- AI Sommelier Chat Types ---
export interface AiChatMessageDto {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface AiChatRequestDto {
  storeId: number;
  tenantId: number;
  customerId?: number | null;
  message: string;
  history?: AiChatMessageDto[];
  currentCartItemIds?: number[];
}

export interface AiChatResponseDto {
  reply: string;
  suggestedItems: AiRecommendedItemDto[];
  quickFollowUps: string[];
  isAiGenerated: boolean;
  modelUsed: string;
}

