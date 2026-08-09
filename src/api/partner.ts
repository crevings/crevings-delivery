import { BASE_URL } from "./fetcher";

/** Persist the driver's Online/Offline availability to the backend. */
export const toggleOnline = async (isOnline: boolean) => {
  const response = await fetch(`${BASE_URL}/delivery/toggle-online`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isOnline }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update availability");
  }
  return data;
};

/** Fetch the driver profile — includes the server-side isOnline state. */
export const getPartnerProfile = async () => {
  const response = await fetch(`${BASE_URL}/delivery/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data;
};
