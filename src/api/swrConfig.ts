import type { Middleware } from "swr";

/**
 * Shared SWR (L1) cache policy — mirrors crevings-consumer's api layer.
 *
 * Freshness intent per category (HOT/WARM/LIVE) is documented below; the
 * actual coalescing is done by the global dedupingInterval in QueryProvider,
 * and every page remount revalidates in the background (SWR serves the cached
 * snapshot instantly, then updates) — the same model the consumer app uses.
 */
export const SWR_LIVE = { revalidateOnFocus: false }; // driver order feed / status (polled)
export const SWR_HOT = { revalidateOnFocus: false }; // profile / earnings
export const SWR_WARM = { revalidateOnFocus: false }; // static-ish reference data

/** Auth token checks must never auto-retry a 401 storm. */
export const SWR_AUTH = {
  shouldRetryOnError: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * Pass-through middleware, kept for API stability (see crevings-consumer's
 * src/api/swrStaleTime.ts).
 */
export const staleTimeMiddleware: Middleware = (useSWRNext) => (key, fetcher, config) => {
  return useSWRNext(key, fetcher, config);
};
