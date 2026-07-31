import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export interface LocationState {
  hasPermission: boolean;
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isChecking: boolean;
}

export function useLocationManager(isLoggedIn: boolean) {
  const [locationState, setLocationState] = useState<LocationState>({
    hasPermission: true, // Default true to prevent flash, checked immediately
    latitude: null,
    longitude: null,
    errorMsg: null,
    isChecking: true,
  });

  const requestAndFetchLocation = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, isChecking: true }));

    // 1. Try Capacitor Geolocation Plugin (For Native Android/iOS or Capacitor WebView)
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
        const permResult = await Geolocation.requestPermissions();
        if (permResult.location === 'granted' || permResult.coarseLocation === 'granted') {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          setLocationState({
            hasPermission: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            errorMsg: null,
            isChecking: false,
          });
          return;
        } else {
          setLocationState({
            hasPermission: false,
            latitude: null,
            longitude: null,
            errorMsg: 'Location permission denied on device.',
            isChecking: false,
          });
          return;
        }
      }
    } catch (e: any) {
      console.warn('Capacitor Geolocation check fallback to Web Geolocation API:', e?.message);
    }

    // 2. Web Browser Standard Geolocation API (HTML5 Geolocation)
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationState({
            hasPermission: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            errorMsg: null,
            isChecking: false,
          });
        },
        (error) => {
          let msg = 'Location access is required to receive delivery orders.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow location access in your browser/device settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable. Please enable GPS on your device.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Retrying...';
          }
          setLocationState({
            hasPermission: false,
            latitude: null,
            longitude: null,
            errorMsg: msg,
            isChecking: false,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationState({
        hasPermission: false,
        latitude: null,
        longitude: null,
        errorMsg: 'Geolocation is not supported by your device or browser.',
        isChecking: false,
      });
    }
  }, []);

  // Continuously check & monitor location
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial check
    requestAndFetchLocation();

    // Watch position continuously
    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocationState({
            hasPermission: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            errorMsg: null,
            isChecking: false,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationState({
              hasPermission: false,
              latitude: null,
              longitude: null,
              errorMsg: 'Location permission denied. Please enable location to continue working.',
              isChecking: false,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
      );
    }

    // Polling safety loop every 5 seconds if permission is denied
    const pollInterval = setInterval(() => {
      if (!locationState.hasPermission) {
        requestAndFetchLocation();
      }
    }, 5000);

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(pollInterval);
    };
  }, [isLoggedIn, requestAndFetchLocation, locationState.hasPermission]);

  return {
    ...locationState,
    retryLocationAccess: requestAndFetchLocation,
  };
}
