import useSWR from "swr";
import { fetcher, post } from "../fetcher";
import { SWR_HOT } from "../swrConfig";
import type { DeliveryProfile } from "@/types";

export type { DeliveryProfile } from "@/types";

// NOTE: hardcoded placeholder until the profile screen is wired to the real
// `/delivery/profile` payload — flagged in the architectural audit (the hook
// is currently unwired; ProfileView is static mock UI).
const DEFAULT_PROFILE: DeliveryProfile = {
  id: "DEL-8841",
  name: "Vikram Singh",
  phone: "+91 98765 43210",
  email: "vikram@crevings.com",
  vehicleType: "Electric Scooter",
  vehicleNumber: "MH 12 AB 1234",
  status: "Active",
};

export const usePartnerProfile = () => {
  const { data, error, isLoading, mutate } = useSWR<DeliveryProfile>(
    "/delivery/profile",
    fetcher,
    {
      fallbackData: DEFAULT_PROFILE,
      revalidateOnMount: true,
      ...SWR_HOT,
    }
  );

  return {
    profile: data || DEFAULT_PROFILE,
    isLoading,
    isError: error,
    mutate,
  };
};

export const updatePartnerStatus = async (status: "Active" | "Offline" | "Busy") => {
  const data = await post<{ success?: boolean; message?: string }>("/delivery/toggle-online", {
    isOnline: status === "Active",
  });
  if (!data.success) {
    throw new Error(data.message || "Failed to update profile status");
  }
  return data;
};
