import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { useEffect, useState } from 'react';
import { get } from '@/api/fetcher';
import { LoadingSpinner } from '@/shared/components/layout';

/**
 * Onboarding-complete state is fetched from the backend (GET /delivery/onboarding)
 * and cached in memory for the lifetime of the session. Nothing is persisted to
 * localStorage — a cold start always asks the API, so admin-side approval is
 * picked up even if this device was previously told the partner was incomplete.
 */
const onboardingCache = new Map<string, boolean>();
let inFlightOnboardingPromise: Promise<boolean> | null = null;

/** Drop the cached flag (e.g. after onboarding is submitted or on logout). */
export function invalidateOnboardingCache(partnerId?: string | null): void {
  inFlightOnboardingPromise = null;
  if (partnerId) {
    onboardingCache.delete(partnerId);
  } else {
    onboardingCache.clear();
  }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  const partnerId = useAuthStore((s) => s.partnerId);
  const [backendCheckDone, setBackendCheckDone] = useState(false);
  const [backendOnboardingComplete, setBackendOnboardingComplete] = useState<boolean | null>(null);

  // In-memory flag (no storage) — if present, skip the backend round-trip
  const cached = partnerId ? onboardingCache.get(partnerId) : undefined;

  useEffect(() => {
    if (cached !== undefined || !partnerId) {
      setBackendCheckDone(true);
      return;
    }

    // Reuse in-flight request if one is already running
    if (!inFlightOnboardingPromise) {
      inFlightOnboardingPromise = (async () => {
        try {
          const data = await get<Record<string, any>>('/delivery/onboarding');
          const status = data?.onboardingStatus;
          const isComplete = status === 'COMPLETE';
          onboardingCache.set(partnerId, isComplete);
          return isComplete;
        } catch {
          onboardingCache.set(partnerId, false);
          return false;
        } finally {
          inFlightOnboardingPromise = null;
        }
      })();
    }

    inFlightOnboardingPromise.then((isComplete) => {
      setBackendOnboardingComplete(isComplete);
      setBackendCheckDone(true);
    });
  }, [partnerId, cached]);

  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Show spinner while checking backend
  if (!backendCheckDone) {
    return <LoadingSpinner />;
  }

  // Allow access if the in-memory flag or the backend says onboarding is complete
  const onboardingAllowed = cached === true || backendOnboardingComplete === true;

  if (!onboardingAllowed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}