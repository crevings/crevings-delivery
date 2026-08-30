import { create } from 'zustand';

interface PartnerState {
  isOnline: boolean;
  isPaused: boolean;
  rushHour: boolean;
  floatingCash: number;
  // SECURITY: Replace 'any' with proper types
  selectedBranch: Record<string, unknown> | null;
  outletServices: Record<string, unknown> | null;
  gigStartTime: Date | null;
  gigEndTime: Date | null;
  setIsOnline: (v: boolean) => void;
  setIsPaused: (v: boolean) => void;
  setRushHour: (v: boolean) => void;
  setFloatingCash: (v: number) => void;
  setSelectedBranch: (branch: Record<string, unknown> | null) => void;
  setOutletServices: (services: Record<string, unknown> | null) => void;
  setGigStartTime: (time: Date | null) => void;
  setGigEndTime: (time: Date | null) => void;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  isOnline: false,
  isPaused: false,
  rushHour: false,
  floatingCash: 0,
  selectedBranch: null,
  outletServices: null,
  gigStartTime: null,
  gigEndTime: null,
  setIsOnline: (v) => set({ isOnline: v }),
  setIsPaused: (v) => set({ isPaused: v }),
  setRushHour: (v) => set({ rushHour: v }),
  setFloatingCash: (v) => set({ floatingCash: v }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setOutletServices: (services) => set({ outletServices: services }),
  setGigStartTime: (time) => set({ gigStartTime: time }),
  setGigEndTime: (time) => set({ gigEndTime: time }),
}));
