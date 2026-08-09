import { create } from 'zustand';
import { Tab, Order } from '@/types';

interface AuthState {
  isLoggedIn: boolean;
  partnerId: string | null;
  partnerRole: string | null;
  isOnboarding: boolean;
  showingPartnerVideo: boolean;
  setIsLoggedIn: (v: boolean) => void;
  setPartnerId: (id: string | null) => void;
  setPartnerRole: (role: string | null) => void;
  setIsOnboarding: (v: boolean) => void;
  setShowingPartnerVideo: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  partnerId: null,
  partnerRole: null,
  isOnboarding: false,
  showingPartnerVideo: false,
  setIsLoggedIn: (v) => set({ isLoggedIn: v }),
  setPartnerId: (id) => set({ partnerId: id }),
  setPartnerRole: (role) => set({ partnerRole: role }),
  setIsOnboarding: (v) => set({ isOnboarding: v }),
  setShowingPartnerVideo: (v) => set({ showingPartnerVideo: v }),
  logout: () => set({
    isLoggedIn: false,
    partnerId: null,
    partnerRole: null,
    isOnboarding: false,
    showingPartnerVideo: false,
  }),
}));

interface PartnerState {
  isOnline: boolean;
  isPaused: boolean;
  rushHour: boolean;
  selectedBranch: any;
  outletServices: any;
  gigStartTime: Date | null;
  gigEndTime: Date | null;
  setIsOnline: (v: boolean) => void;
  setIsPaused: (v: boolean) => void;
  setRushHour: (v: boolean) => void;
  setSelectedBranch: (branch: any) => void;
  setOutletServices: (services: any) => void;
  setGigStartTime: (time: Date | null) => void;
  setGigEndTime: (time: Date | null) => void;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  isOnline: false,
  isPaused: false,
  rushHour: false,
  selectedBranch: null,
  outletServices: null,
  gigStartTime: null,
  gigEndTime: null,
  setIsOnline: (v) => set({ isOnline: v }),
  setIsPaused: (v) => set({ isPaused: v }),
  setRushHour: (v) => set({ rushHour: v }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setOutletServices: (services) => set({ outletServices: services }),
  setGigStartTime: (time) => set({ gigStartTime: time }),
  setGigEndTime: (time) => set({ gigEndTime: time }),
}));

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

interface UIState {
  currentTab: Tab;
  showSnackbar: boolean;
  showBookHours: boolean;
  showConfirmSlotsSheet: boolean;
  bookedSlots: string[];
  contactNumber: string;
  isInitialLoading: boolean;
  isTabLoading: boolean;
  permissionStep: any;
  trackingDetails: any;
  offersList: any[];
  isSupport: boolean;
  setCurrentTab: (tab: Tab) => void;
  setShowSnackbar: (v: boolean) => void;
  setShowBookHours: (v: boolean) => void;
  setShowConfirmSlotsSheet: (v: boolean) => void;
  setBookedSlots: (slots: string[]) => void;
  setContactNumber: (number: string) => void;
  setIsInitialLoading: (v: boolean) => void;
  setIsTabLoading: (v: boolean) => void;
  setPermissionStep: (step: any) => void;
  setTrackingDetails: (details: any) => void;
  setOffersList: (offers: any[]) => void;
  setIsSupport: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentTab: Tab.HOME,
  showSnackbar: false,
  showBookHours: false,
  showConfirmSlotsSheet: false,
  bookedSlots: [],
  contactNumber: '',
  isInitialLoading: true,
  isTabLoading: false,
  permissionStep: null,
  trackingDetails: null,
  offersList: [],
  isSupport: false,
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setShowSnackbar: (v) => set({ showSnackbar: v }),
  setShowBookHours: (v) => set({ showBookHours: v }),
  setShowConfirmSlotsSheet: (v) => set({ showConfirmSlotsSheet: v }),
  setBookedSlots: (slots) => set({ bookedSlots: slots }),
  setContactNumber: (number) => set({ contactNumber: number }),
  setIsInitialLoading: (v) => set({ isInitialLoading: v }),
  setIsTabLoading: (v) => set({ isTabLoading: v }),
  setPermissionStep: (step) => set({ permissionStep: step }),
  setTrackingDetails: (details) => set({ trackingDetails: details }),
  setOffersList: (offers) => set({ offersList: offers }),
  setIsSupport: (v) => set({ isSupport: v }),
}));
