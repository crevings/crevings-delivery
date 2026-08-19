import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wallet, UserCircle, Settings, LogOut, Package } from 'lucide-react';
import { Tab } from '@/types';
import { useAuthStore, useOrdersStore } from '@/app/store';
import { logout as apiLogout } from '@/api/auth';

interface SideNavProps {
  currentTab?: Tab;
}

export const SideNav: React.FC<SideNavProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(s => s.logout);
  const partnerEmail = useAuthStore(s => s.partnerEmail);
  const partnerId = useAuthStore(s => s.partnerId);
  const orders = useOrdersStore(s => s.orders);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'COMPLETED').length;

  const currentPath = location.pathname;

  const primaryNav = [
    { id: Tab.HOME, label: 'Home', path: '/', icon: Home },
    { id: Tab.ORDERS, label: 'Deliveries', path: '/orders', icon: ShoppingBag },
  ];

  const businessNav = [
    { id: Tab.EARNINGS, label: 'Payout', path: '/earnings', icon: Wallet },
  ];

  const managementNav = [
    { id: Tab.PROFILE, label: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // non-fatal
    }
    logout();
    navigate('/login');
  };

  const renderNavSection = (title: string, items: typeof primaryNav) => (
    <div className="mb-6">
      {title && <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-[#1E90FF] font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors duration-200 ${isActive ? 'text-[#1E90FF]' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                {item.id === Tab.ORDERS && activeOrdersCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1E90FF] rounded-full border-2 border-white" />
                )}
              </div>
              <span className="text-[14px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#FFFFFF] border-r border-slate-200 h-screen sticky top-0 shrink-0 py-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-sm">
          <Package size={20} className="text-white" />
        </div>
        <span className="text-[22px] font-black text-slate-900 tracking-tight">Rider App</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        {renderNavSection('', primaryNav)}
        {renderNavSection('Earnings', businessNav)}
        {renderNavSection('Account', managementNav)}
      </div>

      <div className="px-4 pt-4 border-t border-slate-100 mt-auto">
        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors mb-1"
        >
          <Settings size={20} className="text-slate-400" />
          <span className="text-[14px]">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 font-medium transition-colors mb-3"
        >
          <LogOut size={20} className="text-rose-400" />
          <span className="text-[14px]">Logout</span>
        </button>
        
        <div 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {partnerEmail ? partnerEmail.slice(0, 2).toUpperCase() : 'RS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Rohan Sharma</p>
            <p className="text-xs text-slate-500 truncate">{partnerEmail || partnerId || 'Prayagraj Zone'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
