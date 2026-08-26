import { useState, useEffect, useCallback, useRef } from 'react';
import {
  requestLocationAndGetPosition,
  openDeviceLocationSettings,
  LocationError,
  isCapacitorNative
} from '@/services/geolocation';
import { openAppSettings } from '@/services/permissions';
import { updateDriverLocation } from '@/api/partner';
import { usePartnerStore } from '@/app/store';

export interface LocationState {
  hasPermission: boolean;
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isChecking: boolean;
  isGpsOff: boolean;
}

export function useLocationManager(isLoggedIn: boolean) {
  const isOnline = usePartnerStore((s) => s.isOnline);
  const [locationState, setLocationState] = useState<LocationState>({
    hasPermission: true, // Optimistic to avoid flash
    latitude: null,
    longitude: null,
    errorMsg: null,
    isChecking: true,
    isGpsOff: false,
  });

  const lastSyncTimeRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Sync coordinates to backend when online / logged in
  const maybeSyncLocationToBackend = useCallback(
    async (lat: number, lng: number) => {
      if (!isLoggedIn) return;
      const now = Date.now();
      // Sync at most once every 8 seconds, or if moved > 50 meters
      const last = lastCoordsRef.current;
      const timeDiff = now - lastSyncTimeRef.current;
      const hasMoved = !last || Math.abs(last.lat - lat) > 0.0003 || Math.abs(last.lng - lng) > 0.0003;

      if (timeDiff >= 8000 || (timeDiff >= 3000 && hasMoved)) {
        lastSyncTimeRef.current = now;
        lastCoordsRef.current = { lat, lng };
        try {
          await updateDriverLocation(lat, lng);
        } catch (err: any) {
          console.warn('[LocationManager] Failed to sync driver location to backend:', err?.message);
        }
      }
    },
    [isLoggedIn]
  );

  const requestAndFetchLocation = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, isChecking: true }));

    try {
      const pos = await requestLocationAndGetPosition();
      setLocationState({
        hasPermission: true,
        latitude: pos.lat,
        longitude: pos.lng,
        errorMsg: null,
        isChecking: false,
        isGpsOff: false,
      });
      maybeSyncLocationToBackend(pos.lat, pos.lng);
    } catch (err: any) {
      const isDenied = err instanceof LocationError && err.code === 1;
      const isGpsOff = err instanceof LocationError && err.code === 4;

      let msg = err?.message || 'Location access is required to receive delivery orders.';
      if (isDenied) {
        msg = isCapacitorNative()
          ? 'Location permission is denied. Please enable location permission in app settings.'
          : 'Location is blocked. Please tap the lock icon in your browser address bar and set Location to Allow.';
      } else if (isGpsOff) {
        msg = 'Device GPS is turned off. Please turn on Location in your device quick settings.';
      }

      setLocationState({
        hasPermission: !isDenied,
        latitude: null,
        longitude: null,
        errorMsg: msg,
        isChecking: false,
        isGpsOff,
      });
    }
  }, [maybeSyncLocationToBackend]);

  // Continuous monitoring & background watch
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial check
    requestAndFetchLocation();

    let watchCallbackId: string | number | null = null;
    let cancelled = false;

    // Setup native / web watch
    const startWatching = async () => {
      if (isCapacitorNative()) {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          watchCallbackId = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
            (position, err) => {
              if (cancelled) return;
              if (err) {
                console.warn('[LocationManager] Watch position error:', err.message);
                return;
              }
              if (position?.coords) {
                const { latitude, longitude } = position.coords;
                setLocationState((prev) => ({
                  ...prev,
                  hasPermission: true,
                  latitude,
                  longitude,
                  errorMsg: null,
                  isChecking: false,
                  isGpsOff: false,
                }));
                maybeSyncLocationToBackend(latitude, longitude);
              }
            }
          );
        } catch (e: any) {
          console.warn('[LocationManager] Capacitor watch error, falling back to standard watch:', e?.message);
        }
      }

      // Web fallback watch
      if (!watchCallbackId && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        watchCallbackId = navigator.geolocation.watchPosition(
          (position) => {
            if (cancelled) return;
            const { latitude, longitude } = position.coords;
            setLocationState((prev) => ({
              ...prev,
              hasPermission: true,
              latitude,
              longitude,
              errorMsg: null,
              isChecking: false,
              isGpsOff: false,
            }));
            maybeSyncLocationToBackend(latitude, longitude);
          },
          (error) => {
            if (cancelled) return;
            if (error.code === error.PERMISSION_DENIED) {
              setLocationState((prev) => ({
                ...prev,
                hasPermission: false,
                errorMsg: 'Location permission denied. Please allow location to continue working.',
                isChecking: false,
              }));
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
        );
      }
    };

    startWatching();

    // Heartbeat safety poll every 6s when online or missing coordinates
    const pollInterval = setInterval(() => {
      if (!locationState.hasPermission || locationState.latitude === null || isOnline) {
        requestAndFetchLocation();
      }
    }, isOnline ? 6000 : 10000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      if (watchCallbackId !== null) {
        if (typeof watchCallbackId === 'string') {
          import('@capacitor/geolocation').then(({ Geolocation }) => {
            Geolocation.clearWatch({ id: watchCallbackId as string }).catch(() => {});
          });
        } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.clearWatch(watchCallbackId as number);
        }
      }
    };
  }, [isLoggedIn, isOnline, requestAndFetchLocation, maybeSyncLocationToBackend]);

  return {
    ...locationState,
    retryLocationAccess: requestAndFetchLocation,
    promptEnableGps: openDeviceLocationSettings,
    openAppSettings,
  };
}
