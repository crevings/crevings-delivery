import React from 'react';
import { Navigation, MapPinOff, AlertTriangle, RefreshCw, ShieldCheck, Settings, Power } from 'lucide-react';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useAuthStore } from '@/app/store';
import { useLocation } from 'react-router-dom';
import { isCapacitorNative } from '@/services/geolocation';

export function LocationPermissionGate({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();
  const isPublicPage = location.pathname === '/login' || location.pathname === '/onboarding';

  const {
    hasPermission,
    latitude,
    longitude,
    errorMsg,
    isChecking,
    isGpsOff,
    retryLocationAccess,
    promptEnableGps,
    openAppSettings,
  } = useLocationManager(isLoggedIn && !isPublicPage);

  // If on login/onboarding or not logged in, pass through without blocking
  if (isPublicPage || !isLoggedIn) {
    return <>{children}</>;
  }

  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  const isLocationBlocked = !hasPermission || (!hasCoordinates && !isChecking && !!errorMsg);

  if (isLocationBlocked) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        {/* Animated Radar Pulse Container */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center relative">
            <span className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
            <span className="absolute -inset-3 rounded-full bg-red-500/10 animate-pulse" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
              <MapPinOff className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Heading & Context */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {isGpsOff ? 'Device GPS Is Turned Off' : 'Location Access Required'}
        </h1>
        <p className="text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
          {isGpsOff
            ? 'Please turn on GPS / Location Services on your device to receive delivery orders and navigate trips.'
            : 'To receive nearby food orders, navigate to restaurants, and track active deliveries, please enable location.'}
        </p>

        {/* Status Error Note */}
        {errorMsg && (
          <div className="w-full max-w-sm mb-6 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-left text-xs text-red-700 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-xs space-y-3">
          {isGpsOff ? (
            <button
              onClick={async () => {
                await promptEnableGps();
                await retryLocationAccess();
              }}
              disabled={isChecking}
              className="w-full h-13 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>Turn On Device GPS</span>
            </button>
          ) : (
            <button
              onClick={() => retryLocationAccess()}
              disabled={isChecking}
              className="w-full h-13 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>Enable Device Location</span>
                </>
              )}
            </button>
          )}

          {(!hasPermission || errorMsg?.toLowerCase().includes('denied')) && isCapacitorNative() && (
            <button
              onClick={() => openAppSettings()}
              className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Open App Settings</span>
            </button>
          )}
        </div>

        {/* Troubleshooting Instructions */}
        <div className="mt-8 max-w-xs p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            How to allow location:
          </h4>
          <ol className="text-[11px] text-slate-500 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
            <li>If a system prompt appeared, tap <strong>Allow</strong>.</li>
            <li>Ensure device <strong>Location / GPS</strong> is turned ON in Quick Settings.</li>
            {isCapacitorNative() ? (
              <li>If blocked, tap <strong>Open App Settings</strong> above and enable Location permission.</li>
            ) : (
              <li>If blocked, tap the <strong>🔒 Lock icon</strong> in browser address bar and enable Location.</li>
            )}
          </ol>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
