import { SWRConfig } from 'swr';
import { fetcher } from '@/api/fetcher';
import { staleTimeMiddleware } from '@/api/swrConfig';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // No refetch on window focus or reconnect — the driver app must not
        // spray requests while the phone is in a pocket on a flaky network.
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        // Bounded retries: a single transient failure self-heals on the next
        // poll/remount instead of permanently leaving the feed empty.
        shouldRetryOnError: true,
        errorRetryCount: 2,
        errorRetryInterval: 1000,
        // Coalesce concurrent requests for the same key within 2s (L1 cache
        // policy — see backend caching-strategy.md).
        dedupingInterval: 2000,
        // Pass-through middleware kept for API stability (consumer parity).
        use: [staleTimeMiddleware],
      }}
    >
      {children}
    </SWRConfig>
  );
}
