import { createContext, useContext, ReactNode } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  partnerId: string | null;
  partnerRole: string | null;
  login: (token: string, partnerData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = typeof window !== 'undefined' ? !!sessionStorage.getItem('delivery_auth_token') : false;

  const login = (token: string, partnerData: any) => {
    sessionStorage.setItem('delivery_auth_token', token);
    sessionStorage.setItem('delivery_partner_data', JSON.stringify(partnerData));
  };

  const logout = () => {
    sessionStorage.removeItem('delivery_auth_token');
    sessionStorage.removeItem('delivery_partner_data');
    sessionStorage.removeItem('delivery_refresh_token');
  };

  const partnerData = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('delivery_partner_data') || '{}')
    : {};

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      partnerId: partnerData.id || null,
      partnerRole: partnerData.role || null,
      login,
      logout,
    }}>
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
