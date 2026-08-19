import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { SideNav } from '@/shared/components/layout/SideNav';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { EmergencyHelpButton } from '@/shared/components/help/EmergencyHelpButton';
import { useAuthStore } from '@/app/store';

export function AppShell({ children }: { children?: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/onboarding';

  if (isLoginPage || !isLoggedIn) {
    return <main className="min-h-screen bg-white">{children || <Outlet />}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop SideNav */}
      <SideNav />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:px-8 bg-slate-50 min-w-0">
        <div className="lg:mt-4 lg:mb-4">
          <Header />
        </div>

        <main className="flex-1 max-w-md mx-auto w-full relative lg:max-w-none lg:w-full flex flex-col pb-24 lg:pb-8">
          {children || <Outlet />}
        </main>
      </div>

      {/* Floating Emergency / Help SOS Button */}
      <EmergencyHelpButton />

      {/* Mobile BottomNav */}
      <BottomNav />
    </div>
  );
}
