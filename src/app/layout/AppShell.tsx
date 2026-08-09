import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { SideNav } from '@/shared/components/layout/SideNav';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { useUIStore } from '@/app/store';

export function AppShell({ children }: { children?: React.ReactNode }) {
  const currentTab = useUIStore(s => s.currentTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <SideNav currentTab={currentTab} />
        <main className="flex-1 p-4 pb-24 md:ml-64">
          {children || <Outlet />}
        </main>
      </div>
      <BottomNav currentTab={currentTab} />
    </div>
  );
}
