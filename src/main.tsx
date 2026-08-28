import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { ServiceabilityGate } from '@/app/gates/ServiceabilityGate';
import { LocationPermissionGate } from '@/app/gates/LocationPermissionGate';
import { env } from '@/config/env';
import { useAuthStore } from '@/app/store';
import { logInfo } from '@/utils/security/auditLog';
import { usePartnerStore } from '@/app/store';
import { initPushNotifications } from '@/services/push';
import './index.css';

logInfo('Application initializing', { mode: import.meta.env.MODE });

// Initialize Firebase Cloud Messaging push notifications (on native mobile devices)
void initPushNotifications();

const token = sessionStorage.getItem('delivery_auth_token');

// Optimistically restore partner identity if present in sessionStorage while SWR verifies cookie/token
let persistedPartnerData: any = {};
try {
  persistedPartnerData = JSON.parse(sessionStorage.getItem('delivery_partner_data') || '{}');
} catch {
  persistedPartnerData = {};
}

if (persistedPartnerData.referenceId || persistedPartnerData.id || token) {
  useAuthStore.setState({
    isLoggedIn: !!token,
    partnerId: persistedPartnerData.referenceId || persistedPartnerData.id || null,
    partnerRole: persistedPartnerData.role || null,
    partnerEmail: persistedPartnerData.email || null,
  });
}

// Restore the driver's online/offline availability status (persisted on toggle
// in the Dashboard) so a page refresh doesn't silently take the driver offline.
usePartnerStore.setState({ isOnline: localStorage.getItem('delivery_is_online') === '1' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <LocationPermissionGate>
              <ServiceabilityGate>
                <AppShell>
                  <AppRoutes />
                </AppShell>
              </ServiceabilityGate>
            </LocationPermissionGate>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);
