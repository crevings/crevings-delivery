import { create } from 'zustand';
import { Order } from '@/types';

interface OrdersState {
  orders: Order[];
  activeOrder: Order | null;
  selectedOrder: Order | null;
  editingOrder: Order | null;
  quickOrderType: any;
  setOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
  setSelectedOrder: (order: Order | null) => void;
  setEditingOrder: (order: Order | null) => void;
  setQuickOrderType: (type: any) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  activeOrder: null,
  selectedOrder: null,
  editingOrder: null,
  quickOrderType: null,
  setOrders: (orders) => set({ orders }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setEditingOrder: (order) => set({ editingOrder: order }),
  setQuickOrderType: (type) => set({ quickOrderType: type }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, ...updates } : o),
  })),
  removeOrder: (orderId) => set((state) => ({
    orders: state.orders.filter(o => o.id !== orderId),
  })),
}));
