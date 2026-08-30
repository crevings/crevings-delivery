import { create } from 'zustand';
import { Tab } from '@/types';

interface UIState {
  currentTab: Tab;
  showSnackbar: boolean;
  showBookHours: boolean;
  showConfirmSlotsSheet: boolean;
  bookedSlots: string[];
  contactNumber: string;
  isInitialLoading: boolean;
  isTabLoading: boolean;
  // SECURITY: Replace 'any' with proper types
  permissionStep: string | null;
  trackingDetails: Record<string, unknown> | null;
  offersList: Array<Record<string, unknown>>;
  isSupport: boolean;
  setCurrentTab: (tab: Tab) => void;
  setShowSnackbar: (v: boolean) => void;
  setShowBookHours: (v: boolean) => void;
  setShowConfirmSlotsSheet: (v: boolean) => void;
  setBookedSlots: (slots: string[]) => void;
  setContactNumber: (number: string) => void;
  setIsInitialLoading: (v: boolean) => void;
  setIsTabLoading: (v: boolean) => void;
  setPermissionStep: (step: string | null) => void;
  setTrackingDetails: (details: Record<string, unknown> | null) => void;
  setOffersList: (offers: Array<Record<string, unknown>>) => void;
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
