import React from 'react';
import { MapPin, Navigation, ShieldAlert, RefreshCw } from 'lucide-react';

interface LocationPermissionModalProps {
  errorMsg: string | null;
  onRetry: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  errorMsg,
  onRetry,
}) => {
  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Animated Icon Header */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/50 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 animate-pulse">
            <MapPin size={40} className="stroke-[2.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Location Access Required
        </h2>

        {/* Message Description */}
        <p className="text-[14px] text-slate-600 dark:text-slate-300 mb-6 leading-relaxed font-medium">
          {errorMsg ||
            'Crevings Delivery Partner requires continuous GPS location access to assign nearby orders and navigate delivery routes.'}
        </p>

        {/* Instructions Card */}
        <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 text-left border border-slate-200/60 dark:border-slate-700/50 space-y-2.5">
          <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] flex items-center justify-center font-bold">1</span>
            <span>Tap <strong className="text-blue-600 dark:text-blue-400">"Enable Location"</strong> button below</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] flex items-center justify-center font-bold">2</span>
            <span>Select <strong className="text-emerald-600 dark:text-emerald-400">"Allow while using app"</strong> or <strong className="text-emerald-600 dark:text-emerald-400 font-bold">"Always Allow"</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] flex items-center justify-center font-bold">3</span>
            <span>Make sure GPS / Location is turned ON on your phone</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRetry}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-[16px] tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Navigation size={20} />
          <span>Enable Location Access</span>
        </button>

        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-4 font-medium flex items-center gap-1">
          <RefreshCw size={12} className="animate-spin" /> Checking location status continuously...
        </p>
      </div>
    </div>
  );
};
