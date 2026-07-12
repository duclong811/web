import { create } from 'zustand';

// --- Types ---
export type OrderStatus = 'pending' | 'preparing' | 'done' | 'paid';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface StoreState {
  // Mock Data
  menuItems: MenuItem[];
  categories: Category[];
  orders: Order[];
  
  // Customer State
  currentTable: string | null;
  cart: CartItem[];
  
  // Actions
  setTable: (table: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: () => void;
  createOrder: (tableId: string) => string;
  updateQuantity: (id: string, quantity: number) => void;
  
  // Staff/Admin Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
}

const mockCategories: Category[] = [
  { id: 'c1', name: 'Coffee' },
  { id: 'c2', name: 'Tea' },
  { id: 'c3', name: 'Milk Tea' },
  { id: 'c4', name: 'Cake' },
];

const mockMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Espresso', description: 'Strong and bold coffee', price: 35000, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', categoryId: 'c1' },
  { id: 'm2', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 45000, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80', categoryId: 'c1' },
  { id: 'm3', name: 'Matcha Latte', description: 'Premium matcha with milk', price: 50000, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80', categoryId: 'c2' },
  { id: 'm4', name: 'Brown Sugar Milk Tea', description: 'Boba with brown sugar syrup', price: 45000, image: 'https://images.unsplash.com/photo-1626082895617-2c6ad361a86a?w=500&q=80', categoryId: 'c3' },
  { id: 'm5', name: 'Cheesecake', description: 'Classic NY style cheesecake', price: 60000, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&q=80', categoryId: 'c4' },
];

const mockOrders: Order[] = [
  { id: 'o1', tableNumber: 'T01', items: [{ ...mockMenuItems[0], quantity: 2 }], total: 70000, status: 'pending', createdAt: new Date().toISOString() },
  { id: 'o2', tableNumber: 'T05', items: [{ ...mockMenuItems[1], quantity: 1 }, { ...mockMenuItems[4], quantity: 1 }], total: 105000, status: 'preparing', createdAt: new Date().toISOString() }
];

export const useStore = create<StoreState>((set, get) => ({
  menuItems: mockMenuItems,
  categories: mockCategories,
  orders: mockOrders,
  
  currentTable: null,
  cart: [],

  setTable: (table) => set({ currentTable: table }),
  
  addToCart: (item) => set((state) => {
    const existing = state.cart.find(i => i.id === item.id);
    if (existing) {
      return { cart: state.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter(i => i.id !== itemId)
  })),

  clearCart: () => set({ cart: [] }),

  placeOrder: () => set((state) => {
    if (state.cart.length === 0 || !state.currentTable) return state;
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `o${Math.random().toString(36).substr(2, 9)}`,
      tableNumber: state.currentTable,
      items: state.cart,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    return { orders: [newOrder, ...state.orders], cart: [] };
  }),

  createOrder: (tableId) => {
    let newOrderId = '';
    set((state) => {
      const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      newOrderId = `o${Math.random().toString(36).substr(2, 9)}`;
      const newOrder: Order = {
        id: newOrderId,
        tableNumber: tableId,
        items: state.cart,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      return { orders: [newOrder, ...state.orders], cart: [] };
    });
    return newOrderId;
  },

  updateQuantity: (id, quantity) => set((state) => ({
    cart: state.cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)
  })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
  })),

  addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
  
  updateMenuItem: (item) => set((state) => ({
    menuItems: state.menuItems.map(m => m.id === item.id ? item : m)
  })),

  deleteMenuItem: (id) => set((state) => ({
    menuItems: state.menuItems.filter(m => m.id !== id)
  }))
}));
