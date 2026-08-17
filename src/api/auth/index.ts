import useSWR from "swr";
import { fetcher, post } from "../fetcher";
import { SWR_AUTH } from "../swrConfig";

export const useVerifyToken = () => {
  return useSWR("/delivery/auth/verify-token", fetcher, SWR_AUTH);
};

export const login = async (payload: unknown) => {
  const data = await post<{ success?: boolean; message?: string; token?: string }>(
    "/delivery/auth/verify-otp",
    payload
  );
  if (!data.success) {
    throw new Error(data.message || "Failed to log in.");
  }
  return data;
};

export const logout = async () => {
  try {
    return await post("/delivery/auth/logout");
  } catch {
    // Backend may already have dropped the session — logout is best-effort.
    return { success: true };
  }
};
