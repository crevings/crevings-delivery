import { create } from 'zustand';

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
