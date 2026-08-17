import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Settings,
  User,
} from 'lucide-react';
import { Tab } from '@/types';

const navItems = [
  { tab: Tab.HOME, icon: LayoutDashboard, label: 'Home' },
  { tab: Tab.ORDERS, icon: ClipboardList, label: 'Orders' },
  { tab: Tab.EARNINGS, icon: DollarSign, label: 'Earnings' },
  { tab: Tab.SETTINGS, icon: Settings, label: 'Settings' },
];

export function SideNav({ currentTab }: { currentTab: Tab }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-14">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ tab, icon: Icon, label }) => (
          <NavLink
            key={tab}
            to={getRouteForTab(tab)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive || currentTab === tab
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`
          }
        >
          <User className="w-5 h-5" />
          Profile
        </NavLink>
      </div>
    </aside>
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
