import useSWR from "swr";
import { fetcher, BASE_URL } from "../fetcher";

export const useVerifyToken = () => {
  return useSWR("/delivery/auth/verify-token", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });
};

export const login = async (payload: any) => {
  const response = await fetch(`${BASE_URL}/delivery/auth/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to log in.");
  }
  return data;
};

export const logout = async () => {
  const response = await fetch(`${BASE_URL}/delivery/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
};
