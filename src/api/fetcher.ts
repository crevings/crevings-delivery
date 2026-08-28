/**
 * Typed API client — the single request layer for the entire app
 * (mirrors crevings-consumer's src/api/fetcher.ts).
 *
 * - Cookie-based auth (`credentials: "include"`) AND the session Bearer token
 *   when present (delivery auth supports both; keeps existing behavior).
 * - Automatic request timeout via AbortController (no hung requests).
 * - Optional external `signal` for effect cleanup (race-safe requests).
 * - Typed helpers: get / post / patch / del.
 * - Consistent ResponseError that preserves the backend's error message.
 * - Automatic token refresh on 401 (single retry, then fail).
 */

const RAW_BASE_URL =
  import.meta.env.VITE_PUBLIC_BASE_API_URL ||
  "https://backend.crevings.com";

export const BASE_URL = RAW_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "") + "/api";

const DEFAULT_TIMEOUT_MS = 15000;

export class ResponseError extends Error {
  response: Response;
  status: number;
  info: unknown;

  constructor(message: string, response: Response, info: unknown) {
    super(message);
    this.name = "ResponseError";
    this.response = response;
    this.status = response.status;
    this.info = info;
  }
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Session Bearer token for the delivery API (kept in sessionStorage by AuthProvider). */
const getSessionToken = (): string | null => {
  try {
    return typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("delivery_auth_token")
      : null;
  } catch {
    return null;
  }
};

/**
 * Fired once when any authenticated request comes back 401, so the app can
 * drop the session and redirect to /login (AuthProvider listens for it).
 */
export const UNAUTHORIZED_EVENT = "delivery:unauthorized";

const notifyUnauthorized = () => {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
  } catch {
    // non-fatal
  }
};

// ─── Token refresh ──────────────────────────────────────────────────────────

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      // Persist new token if backend returns one in response body
      try {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem("delivery_auth_token", data.token);
        }
      } catch {}
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Core request ───────────────────────────────────────────────────────────

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const isRelative = !path.startsWith("http");
  const { timeoutMs = DEFAULT_TIMEOUT_MS, body, signal, headers, method, ...rest } = options;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const combinedSignal = signal
    ? AbortSignal.any([timeoutController.signal, signal])
    : timeoutController.signal;

  const token = getSessionToken();

  const doFetch = async (resignal?: AbortSignal) => {
    return fetch(isRelative ? `${BASE_URL}${path}` : path, {
      ...rest,
      method: method || "GET",
      credentials: isRelative ? "include" : "omit",
      headers: isRelative
        ? {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(headers || {}),
          }
        : (headers || {}),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: resignal || combinedSignal,
    });
  };

  try {
    const res = await doFetch();

    // Auto-refresh on 401
    if (res.status === 401 && isRelative) {
      if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken();
      }
      const refreshed = await refreshInFlight;
      refreshInFlight = null;

      if (refreshed) {
        const retryRes = await doFetch();
        if (!retryRes.ok) {
          // Refresh succeeded but retry still failed — session is truly dead
          if (retryRes.status === 401 && getSessionToken() !== null) {
            notifyUnauthorized();
          }
          let info: unknown = null;
          try { info = await retryRes.json(); } catch { info = { message: retryRes.statusText }; }
          const message = info && typeof info === "object" && "message" in info
            ? String((info as any).message) : "An error occurred.";
          throw new ResponseError(message, retryRes, info);
        }
        if (retryRes.status === 204) return undefined as T;
        const retryText = await retryRes.text();
        return (retryText ? JSON.parse(retryText) : undefined) as T;
      }

      // Refresh failed — notify and throw
      if (getSessionToken() !== null) {
        notifyUnauthorized();
      }
    }

    if (!res.ok) {
      if (res.status === 401 && isRelative && getSessionToken() !== null) {
        notifyUnauthorized();
      }
      let info: unknown = null;
      try {
        info = await res.json();
      } catch {
        info = { message: res.statusText || "Request failed" };
      }
      const message =
        info &&
        typeof info === "object" &&
        "message" in info &&
        typeof (info as { message?: unknown }).message === "string"
          ? (info as { message: string }).message
          : "An error occurred while fetching the data.";
      throw new ResponseError(message, res, info);
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const get = <T = unknown>(path: string, options?: RequestOptions) =>
  request<T>(path, { method: "GET", ...options });

export const post = <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
  request<T>(path, { method: "POST", body, ...options });

export const patch = <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
  request<T>(path, { method: "PATCH", body, ...options });

export const del = <T = unknown>(path: string, options?: RequestOptions) =>
  request<T>(path, { method: "DELETE", ...options });

/** SWR-compatible GET fetcher. */
export const fetcher = async <T = unknown>(url: string): Promise<T> => request<T>(url);
