import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useVerifyToken, logout as apiLogout } from '@/api/auth';
import { UNAUTHORIZED_EVENT } from '@/api/fetcher';
import { useAuthStore } from '@/app/store';
import { clearSecureStorage, setSecureToken } from '@/utils/security/secureStorage';

import { syncDeviceToken, unregisterPushNotifications } from '@/services/push';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  partnerId: string | null;
  partnerRole: string | null;
  partnerEmail: string | null;
  login: (token?: string, partnerData?: any) => void;
  logout: () => Promise<void>;
  mutate: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, error, mutate } = useVerifyToken();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  const partnerId = useAuthStore((s) => s.partnerId);
  const partnerRole = useAuthStore((s) => s.partnerRole);
  const partnerEmail = useAuthStore((s) => s.partnerEmail);

  useEffect(() => {
    if (data?.success && data.user) {
      useAuthStore.setState({
        isLoggedIn: true,
        isLoadingAuth: false,
        partnerId: data.user.referenceId || null,
        partnerRole: data.user.role || 'DELIVERY_PARTNER',
        partnerEmail: data.user.email || null,
      });
      try {
        sessionStorage.setItem('delivery_partner_data', JSON.stringify(data.user));
      } catch {
        // non-fatal
      }
      void syncDeviceToken();
    } else if (error || (data && !data.success)) {
      useAuthStore.setState({
        isLoggedIn: false,
        isLoadingAuth: false,
        partnerId: null,
        partnerRole: null,
        partnerEmail: null,
      });
      clearSecureStorage();
    }
  }, [data, error]);

  // Global 401 hook: any authenticated request that returns 401 (expired
  // session, revoked token, backend restart) drops the local session so
  // ProtectedRoute redirects to /login instead of leaving the driver stuck
  // on error screens. Guard against firing during the boot-time verify.
  useEffect(() => {
    const onUnauthorized = () => {
      if (!useAuthStore.getState().isLoggedIn) return;
      clearSecureStorage();
      useAuthStore.getState().logout();
      mutate(undefined, false);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [mutate]);

  const login = (token?: string, partnerData?: any) => {
    if (token) {
      setSecureToken(token);
    }
    useAuthStore.setState({
      isLoggedIn: true,
      isLoadingAuth: false,
      partnerId: partnerData?.referenceId || partnerData?.id || null,
      partnerRole: partnerData?.role || 'DELIVERY_PARTNER',
      partnerEmail: partnerData?.email || null,
    });
    if (partnerData) {
      try {
        sessionStorage.setItem('delivery_partner_data', JSON.stringify(partnerData));
      } catch {
        // non-fatal
      }
    }
    void syncDeviceToken();
    mutate();
  };

  const logout = async () => {
    try {
      await unregisterPushNotifications().catch(() => {});
      await apiLogout().catch(() => {});
    } finally {
      clearSecureStorage();
      useAuthStore.getState().logout();
      mutate(undefined, false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isLoggedIn,
        isLoadingAuth,
        partnerId,
        partnerRole,
        partnerEmail,
        login,
        logout,
        mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
