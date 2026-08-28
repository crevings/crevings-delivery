import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { useEffect, useState } from 'react';
import { get } from '@/api/fetcher';
import { LoadingSpinner } from '@/shared/components/layout';

/**
 * Read the persisted onboarding-complete flag.  We store it in localStorage
 * so the flag survives app restarts.  The key is per-partner (scoped by
 * partnerId stored in the auth store) so switching accounts works correctly.
 */
function isOnboardingComplete(partnerId: string | null): boolean {
  if (!partnerId) return false;
  try {
    return localStorage.getItem(`onboarding_complete_${partnerId}`) === 'true';
  } catch {
    return false;
  }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  const partnerId = useAuthStore((s) => s.partnerId);
  const [backendCheckDone, setBackendCheckDone] = useState(false);
  const [backendOnboardingComplete, setBackendOnboardingComplete] = useState<boolean | null>(null);

  // If localStorage flag is already set, skip the backend check
  const localFlag = isOnboardingComplete(partnerId);

  useEffect(() => {
    if (localFlag || !partnerId) {
      setBackendCheckDone(true);
      return;
    }
    // localStorage flag missing -- check backend as fallback
    (async () => {
      try {
        const data = await get<Record<string, any>>('/delivery/onboarding');
        const status = data?.onboardingStatus;
        const isComplete = status === 'COMPLETE';
        setBackendOnboardingComplete(isComplete);
        if (isComplete) {
          // Restore the localStorage flag so future loads are fast
          try { localStorage.setItem(`onboarding_complete_${partnerId}`, 'true'); } catch {}
        }
      } catch {
        setBackendOnboardingComplete(false);
      } finally {
        setBackendCheckDone(true);
      }
    })();
  }, [partnerId, localFlag]);

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

  // Allow access if either localStorage flag or backend says onboarding is complete
  const onboardingAllowed = localFlag || backendOnboardingComplete === true;

  if (!onboardingAllowed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
