import useSWR from "swr";
import { fetcher, post } from "../fetcher";
import { SWR_AUTH } from "../swrConfig";

export interface VerifyTokenResponse {
  success: boolean;
  message?: string;
  user?: {
    email?: string;
    role?: string;
    referenceId?: string;
    name?: string;
    phone?: string;
  };
  profile?: unknown;
}

export const useVerifyToken = () => {
  return useSWR<VerifyTokenResponse>("/delivery/auth/verify-token", fetcher, SWR_AUTH);
};

export const requestWhatsappOtp = async (phone: string) => {
  return await post<{ success: boolean; message: string; otp?: string }>(
    "/delivery/auth/request-whatsapp-otp",
    { phone }
  );
};

export const requestOtp = async (payload: { email?: string; phone?: string }) => {
  return await post<{ success: boolean; message: string; otp?: string }>(
    "/delivery/auth/request-otp",
    payload
  );
};

export const verifyOtp = async (payload: { email?: string; phone?: string; otp: string; password?: string }) => {
  const data = await post<{
    success: boolean;
    message?: string;
    error?: string;
    token?: string;
    user?: {
      email?: string;
      role?: string;
      referenceId?: string;
      name?: string;
      phone?: string;
    };
    deletionCancelled?: boolean;
  }>("/delivery/auth/verify-otp", payload);
  return data;
};

export const login = async (payload: unknown) => {
  const data = await post<{ success?: boolean; message?: string; token?: string; user?: any }>(
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
    await post("/delivery/auth/logout");
  } catch {
    // Best-effort
  }
  await post("/auth/logout").catch(() => {});
  return { success: true };
};
