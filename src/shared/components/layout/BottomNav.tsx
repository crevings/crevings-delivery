import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Settings,
} from 'lucide-react';
import { Tab } from '@/types';

const navItems = [
  { tab: Tab.HOME, icon: LayoutDashboard, label: 'Home' },
  { tab: Tab.ORDERS, icon: ClipboardList, label: 'Orders' },
  { tab: Tab.EARNINGS, icon: DollarSign, label: 'Earnings' },
  { tab: Tab.SETTINGS, icon: Settings, label: 'Settings' },
];

export function BottomNav({ currentTab }: { currentTab: Tab }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <NavLink
            key={tab}
            to={getRouteForTab(tab)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors ${
                isActive || currentTab === tab
                  ? 'text-blue-600'
                  : 'text-slate-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function getRouteForTab(tab: Tab): string {
  switch (tab) {
    case Tab.HOME: return '/';
    case Tab.ORDERS: return '/orders';
    case Tab.EARNINGS: return '/earnings';
    case Tab.SETTINGS: return '/settings';
    default: return '/';
  }
}
