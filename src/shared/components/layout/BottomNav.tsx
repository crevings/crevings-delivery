import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, UserCircle } from 'lucide-react';
import { Tab } from '@/types';

interface BottomNavProps {
  currentTab?: Tab;
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: Tab.HOME, label: 'Home', path: '/', icon: Home },
    { id: Tab.EARNINGS, label: 'Payout', path: '/earnings', icon: Wallet },
    { id: Tab.PROFILE, label: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const currentPath = location.pathname;
  let activeIndex = navItems.findIndex(item => item.path === currentPath);
  if (activeIndex === -1) {
    if (currentPath.startsWith('/profile')) activeIndex = 2;
    else if (currentPath.startsWith('/earnings') || currentPath.startsWith('/payout')) activeIndex = 1;
    else activeIndex = 0;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E7EB] min-h-[64px] pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
      <div className="flex relative items-center h-[64px] w-full max-w-md mx-auto">
        {/* Smooth Switching Indicator */}
        <div 
          className="absolute top-2 bottom-2 transition-transform duration-300 ease-out pointer-events-none flex justify-center items-center"
          style={{ 
            width: `${100 / navItems.length}%`, 
            transform: `translateX(${activeIndex * 100}%)` 
          }}
        >
          <div className="w-[80%] h-full bg-blue-50/80 rounded-[14px]" />
        </div>

        {navItems.map((item, idx) => {
          const isActive = activeIndex === idx;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full z-10 active:scale-95 transition-transform"
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  color={isActive ? '#1E90FF' : '#9CA3AF'}
                  className="transition-colors duration-300" 
                />
              </div>
              <span 
                className={`text-[10px] font-bold leading-none mt-[3px] transition-colors duration-300 ${isActive ? 'text-[#1E90FF]' : 'text-[#9CA3AF]'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
