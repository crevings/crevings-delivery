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
import { initPushNotifications } from '@/services/push';
import './index.css';

logInfo('Application initializing', { mode: import.meta.env.MODE });

// Initialize Firebase Cloud Messaging push notifications (on native mobile devices)
void initPushNotifications();

// Let AuthProvider verify the live session from backend cookies. The driver's
// online/offline status is fetched from the backend by the Dashboard on mount
// (getPartnerProfile), so nothing is restored from client storage.

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
