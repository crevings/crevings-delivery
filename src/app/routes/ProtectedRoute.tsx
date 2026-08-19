import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { LoadingSpinner } from '@/shared/components/layout';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);

  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
