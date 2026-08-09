import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { AppShell } from '@/app/layout/AppShell';
import { AppRoutes } from '@/app/routes';
import { ServiceabilityGate } from '@/components/ServiceabilityGate';
import { env } from '@/config/env';
import { useAuthStore } from '@/app/store';
import { logInfo } from '@/utils/security/auditLog';
import { clearSecureStorage } from '@/utils/security/secureStorage';
import './index.css';

logInfo('Application initializing', { env: env.VITE_APP_ENV });

const token = sessionStorage.getItem('delivery_auth_token');
if (!token) {
  clearSecureStorage();
  useAuthStore.setState({ isLoggedIn: false });
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
