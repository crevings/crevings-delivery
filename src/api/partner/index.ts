import { get, post, patch } from "../fetcher";

/** Persist the driver's Online/Offline availability to the backend. */
export const toggleOnline = (isOnline: boolean) =>
  post<{ success: boolean; isOnline: boolean }>("/delivery/toggle-online", { isOnline });

/** Fetch the driver profile — includes the server-side isOnline state. */
export const getPartnerProfile = async () => {
  const data = await get<{ success?: boolean; message?: string; profile?: any }>("/delivery/profile");
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data;
};

/**
 * Send driver's live GPS coordinates to the backend.
 * Updates driver location in Mongo, Redis stream, and triggers customer proximity detection.
 */
export const updateDriverLocation = (lat: number, lng: number) =>
  patch<{ success: boolean }>("/delivery/location", { lat, lng });

