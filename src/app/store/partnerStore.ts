import { create } from 'zustand';

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
