
import React, { useState, useEffect } from 'react';
import { Bell, User, Power, Plus, X, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onProfileClick?: () => void;
  onNotificationClick: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  rushHour?: boolean;
  onToggleRush?: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  restaurantName?: string;
  showOperationalControls?: boolean;
  onCreateOrder?: () => void;
  onBookHours?: () => void;
  isGigActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard',
  onProfileClick,
  onNotificationClick,
  isOnline, 
  onToggleOnline,
  onCreateOrder,
  onBookHours,
  isGigActive
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const handleToggleClick = () => {
    setShowConfirm(true);
  };

  const confirmToggle = () => {
    onToggleOnline();
    setShowConfirm(false);
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-[60] bg-[#FFFFFF] border-b border-slate-100 flex items-center justify-between h-[64px] px-4 w-full max-w-md mx-auto lg:max-w-none lg:px-6 lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm lg:static lg:h-[80px]">
      
      {/* Left side */}
      <div className="flex items-center gap-3">
      </div>

      <div className="flex items-center gap-3 lg:gap-4 ml-auto">
        {/* Online / Offline Toggle */}
        <div className="flex items-center gap-2.5 mr-1 lg:mr-2">
          <span className={`text-[12px] lg:text-[13px] tracking-widest font-bold transition-colors ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            onClick={handleToggleClick}
            className={`relative w-11 h-6 lg:w-12 lg:h-[28px] rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${
              isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-200 hover:bg-slate-300'
            }`}
          >
            <div 
              className={`absolute top-[3px] lg:top-[4px] left-[3px] lg:left-[4px] bg-white w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                isOnline ? 'transform translate-x-[20px] lg:translate-x-[24px]' : ''
              }`} 
            />
          </button>
        </div>
      </div>
    </header>

    {/* Confirmation Bottom Sheet */}
    {showConfirm && (
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center">
        <div className="w-full bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl sm:max-w-sm p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isOnline ? 'Go Offline?' : 'Go Online?'}
            </h3>
            <button onClick={() => setShowConfirm(false)} className="p-1 rounded-full hover:bg-slate-100">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          <p className="text-slate-600 mb-6">
            {isOnline 
              ? 'Are you sure you want to go offline? You will stop receiving new delivery requests.' 
              : 'Are you sure you want to go online? You will start receiving new delivery requests.'}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button 
              onClick={confirmToggle}
              className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl active:scale-95 transition-transform ${isOnline ? 'bg-red-600' : 'bg-blue-600'}`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
