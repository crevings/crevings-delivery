import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { ServiceabilityGate } from '@/app/gates/ServiceabilityGate';
import { env } from '@/config/env';
import { useAuthStore } from '@/app/store';
import { logInfo } from '@/utils/security/auditLog';
import { clearSecureStorage } from '@/utils/security/secureStorage';
import { usePartnerStore } from '@/app/store';
import './index.css';

logInfo('Application initializing', { env: env.VITE_APP_ENV });

const token = sessionStorage.getItem('delivery_auth_token');

// Restore the session on refresh: the store boots logged-out, so derive
// isLoggedIn (and partner identity) from the persisted session data.
let persistedPartnerData: any = {};
try {
  persistedPartnerData = JSON.parse(sessionStorage.getItem('delivery_partner_data') || '{}');
} catch {
  persistedPartnerData = {};
}

useAuthStore.setState({
  isLoggedIn: !!token,
  partnerId: persistedPartnerData.referenceId || persistedPartnerData.id || null,
  partnerRole: persistedPartnerData.role || null,
});

// Restore the driver's online/offline availability status (persisted on toggle
// in the Dashboard) so a page refresh doesn't silently take the driver offline.
usePartnerStore.setState({ isOnline: localStorage.getItem('delivery_is_online') === '1' });

if (!token) {
  clearSecureStorage();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <ServiceabilityGate>
              <AppShell>
                <AppRoutes />
              </AppShell>
            </ServiceabilityGate>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);
