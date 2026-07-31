import useSWR from "swr";
import { fetcher, BASE_URL } from "../fetcher";

export interface DeliveryProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  status: "Active" | "Offline" | "Busy";
}

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
      revalidateOnFocus: false,
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
  const response = await fetch(`${BASE_URL}/delivery/toggle-online`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isOnline: status === "Active" }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile status");
  }
  return data;
};
