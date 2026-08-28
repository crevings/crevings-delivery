import React from 'react';
import { 
  ArrowLeft, 
  Check, 
  ShoppingBag, 
  Tag, 
  ChevronRight, 
  Clock,
  Package,
  BadgeCheck,
  Percent,
  Star,
  TrendingUp,
  AlertCircle,
  Wallet,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import useSWR from 'swr';
import { fetcher, patch } from '@/api/fetcher';

interface NotificationsViewProps {
  onBack?: () => void;
}

interface RawNotification {
  _id: string;
  id?: string;
  type?: string;
  title: string;
  message?: string;
  description?: string;
  read?: boolean;
  createdAt?: string;
  data?: any;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const { data, isLoading, mutate } = useSWR<{
    success?: boolean;
    notifications?: RawNotification[];
    unreadCount?: number;
  }>('/delivery/notifications', fetcher, {
    revalidateOnMount: true,
    refreshInterval: 10000,
  });

  const notifications: RawNotification[] = data?.notifications || [];

  const handleMarkAsRead = async (id: string) => {
    try {
      await patch(`/delivery/notifications/${id}/read`);
      mutate();
    } catch {
      // non-fatal
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await patch('/delivery/notifications/read-all');
      mutate();
    } catch {
      // non-fatal
    }
  };

  const getIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
      case 'dispatch':
        return Check;
      case 'payout':
      case 'wallet':
      case 'finance':
        return Wallet;
      case 'surge':
      case 'promo':
        return Zap;
      case 'rating':
        return Star;
      default:
        return BellIcon;
    }
  };

  const BellIcon = AlertCircle;

  return (
    <div className="min-h-screen bg-[#FFFFFF] animate-in slide-in-from-right duration-300 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF] px-4 py-4 border-b border-slate-100 flex items-center justify-between shadow-xs">
        <button 
          onClick={handleBack}
          className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-all border border-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h1>
        {notifications.some(n => !n.read) ? (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all"
          >
            Mark all read
          </button>
        ) : (
          <div className="w-9"></div>
        )}
      </header>

      {/* Content */}
      <div className="px-4 py-5 space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const id = notif._id || notif.id || '';
            const Icon = getIcon(notif.type);
            const isUnread = !notif.read;
            const timeStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--';

            return (
              <div 
                key={id}
                onClick={() => isUnread && handleMarkAsRead(id)}
                className={`p-4 rounded-[20px] transition-all border cursor-pointer ${
                  isUnread 
                    ? 'bg-blue-50/30 border-blue-100 shadow-xs' 
                    : 'bg-[#FFFFFF] border-slate-100'
                } relative overflow-hidden`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border border-slate-100/50 ${
                    isUnread ? 'bg-blue-100/50 text-blue-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-[13px] font-bold text-slate-900 leading-snug pr-2">
                        {notif.title}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap pt-0.5 uppercase tracking-tighter">
                        {timeStr}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                      {notif.description || notif.message || ''}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="absolute top-4 right-4 flex items-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-400 mt-1">Updates on payouts, trips, and incentives will appear here.</p>
          </div>
        )}
      </div>

      <footer className="text-center py-6 opacity-20">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Crevings Platform Hub</p>
      </footer>
    </div>
  );
};