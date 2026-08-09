import { Bell, Moon } from 'lucide-react';
import { usePartnerStore } from '@/app/store';
import { useTheme } from '@/app/providers/ThemeProvider';

export function Header() {
  const isOnline = usePartnerStore(s => s.isOnline);
  const { toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">Crevings</span>
          <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            Partner
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button className="p-2 rounded-full hover:bg-slate-100" aria-label="Notifications">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-slate-100"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <Moon className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
