import { get, post } from "../fetcher";

/** Persist the driver's Online/Offline availability to the backend. */
export const toggleOnline = (isOnline: boolean) =>
  post<{ success: boolean; isOnline: boolean }>("/delivery/toggle-online", { isOnline });

/** Fetch the driver profile — includes the server-side isOnline state. */
export const getPartnerProfile = async () => {
  const data = await get<{ success?: boolean; message?: string }>("/delivery/profile");
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data;
};
