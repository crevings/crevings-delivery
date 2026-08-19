import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  partnerId: string | null;
  partnerRole: string | null;
  partnerEmail: string | null;
  isOnboarding: boolean;
  showingPartnerVideo: boolean;
  setIsLoggedIn: (v: boolean) => void;
  setIsLoadingAuth: (v: boolean) => void;
  setPartnerId: (id: string | null) => void;
  setPartnerRole: (role: string | null) => void;
  setPartnerEmail: (email: string | null) => void;
  setIsOnboarding: (v: boolean) => void;
  setShowingPartnerVideo: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoadingAuth: true,
  partnerId: null,
  partnerRole: null,
  partnerEmail: null,
  isOnboarding: false,
  showingPartnerVideo: false,
  setIsLoggedIn: (v) => set({ isLoggedIn: v }),
  setIsLoadingAuth: (v) => set({ isLoadingAuth: v }),
  setPartnerId: (id) => set({ partnerId: id }),
  setPartnerRole: (role) => set({ partnerRole: role }),
  setPartnerEmail: (email) => set({ partnerEmail: email }),
  setIsOnboarding: (v) => set({ isOnboarding: v }),
  setShowingPartnerVideo: (v) => set({ showingPartnerVideo: v }),
  logout: () => set({
    isLoggedIn: false,
    isLoadingAuth: false,
    partnerId: null,
    partnerRole: null,
    partnerEmail: null,
    isOnboarding: false,
    showingPartnerVideo: false,
  }),
}));
