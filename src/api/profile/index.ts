import useSWR from "swr";
import { fetcher, post, patch } from "../fetcher";
import { SWR_HOT } from "../swrConfig";

/** Partner profile doc as returned by `GET /delivery/profile` (raw partner doc). */
export interface DeliveryPartnerProfile {
  partnerId?: string;
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
  email?: string;
  dateOfBirth?: string | Date;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  status?: string;
  isOnline?: boolean;
}

/** Fields a delivery partner can update via PATCH /delivery/profile. */
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
  dateOfBirth?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}

export const usePartnerProfile = () => {
  const { data, error, isLoading, mutate } = useSWR<{
    success?: boolean;
    profile?: DeliveryPartnerProfile;
  }>("/delivery/profile", fetcher, {
    revalidateOnMount: true,
    ...SWR_HOT,
  });

  return {
    profile: data?.profile,
    isLoading,
    isError: error,
    mutate,
  };
};

export const updatePartnerProfile = async (updateData: UpdateProfileData) => {
  const data = await patch<{ success?: boolean; profile?: DeliveryPartnerProfile; message?: string }>("/delivery/profile", updateData);
  if (!data.success) {
    throw new Error(data.message || "Failed to update profile");
  }
  return data;
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