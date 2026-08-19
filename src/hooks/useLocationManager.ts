import { useState, useEffect, useCallback } from 'react';

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

  const requestAndFetchLocation = useCallback(() => {
    setLocationState((prev) => ({ ...prev, isChecking: true }));

    // 1. Try Capacitor Geolocation Plugin (For Native Android/iOS or Capacitor WebView)
    try {
      const capGeo = (window as any).Capacitor?.Plugins?.Geolocation;
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.() && capGeo) {
        capGeo
          .requestPermissions()
          .then((permResult: any) => {
            if (permResult.location === 'granted' || permResult.coarseLocation === 'granted') {
              return capGeo.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
            }
            throw new Error('Location permission denied on device.');
          })
          .then((position: any) => {
            setLocationState({
              hasPermission: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              errorMsg: null,
              isChecking: false,
            });
          })
          .catch((err: any) => {
            setLocationState({
              hasPermission: false,
              latitude: null,
              longitude: null,
              errorMsg: err?.message || 'Location permission denied on device.',
              isChecking: false,
            });
          });
        return;
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
            msg = 'Location is blocked. Please tap the 🔒 lock / tune icon in your browser address bar, set Location to "Allow", and retry.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Device GPS is turned off. Please turn on Location in your device quick settings.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please tap "Enable Device Location" again.';
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

    // Check permission API directly if supported
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'denied') {
            setLocationState((prev) => ({
              ...prev,
              hasPermission: false,
              isChecking: false,
              errorMsg: 'Location permission is blocked. Please allow location in your browser settings.',
            }));
          }
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              requestAndFetchLocation();
            } else if (permissionStatus.state === 'denied') {
              setLocationState((prev) => ({
                ...prev,
                hasPermission: false,
                isChecking: false,
                errorMsg: 'Location permission is blocked. Please allow location in your browser settings.',
              }));
            }
          };
        })
        .catch(() => {
          // Permissions API query not supported or failed
        });
    }

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

    // Polling safety loop every 4 seconds if permission is not yet acquired
    const pollInterval = setInterval(() => {
      if (!locationState.hasPermission || locationState.latitude === null) {
        requestAndFetchLocation();
      }
    }, 4000);

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(pollInterval);
    };
  }, [isLoggedIn, requestAndFetchLocation, locationState.hasPermission, locationState.latitude]);

  return {
    ...locationState,
    retryLocationAccess: requestAndFetchLocation,
  };
}
