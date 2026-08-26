// Capacitor-aware geolocation service for Crevings Delivery Partner.
// - On Capacitor Android/iOS it uses @capacitor/geolocation, requesting ACCESS_FINE_LOCATION.
// - On Web/Browser preview it falls back to navigator.geolocation.
// - Includes Google Play Services in-app GPS resolution dialog via LocationSettingsPlugin.

import { Capacitor, registerPlugin } from "@capacitor/core";
import { isCapacitorNative } from "./permissions";

export { isCapacitorNative };

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
}

/**
 * Extended error codes:
 *   1 = user denied permission
 *   2 = position unavailable / unsupported
 *   3 = request timed out
 *   4 = device Location Services (GPS) turned off (permission granted but hardware disabled)
 */
export type LocationErrorCode = 1 | 2 | 3 | 4;

export class LocationError extends Error {
  readonly code: LocationErrorCode;

  constructor(message: string, code: LocationErrorCode) {
    super(message);
    this.name = "LocationError";
    this.code = code;
  }
}

/** True when user denied location access */
export const isLocationPermissionDenied = (err: unknown): boolean =>
  err instanceof LocationError && err.code === 1;

/** True when GPS / Location Services are turned off on the device */
export const isLocationServicesDisabled = (err: unknown): boolean => {
  if (err instanceof LocationError) {
    return err.code !== 1;
  }
  return !isLocationPermissionDenied(err);
};

const isDenialError = (err: unknown): boolean => {
  if (err instanceof LocationError) return err.code === 1;
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("denied") || msg.includes("permission");
};

// ── Native plugin bridge: Google Play Services in-app GPS dialog ──
interface LocationSettingsPlugin {
  openLocationSettings(): Promise<void>;
}
const LocationSettingsBridge = registerPlugin<LocationSettingsPlugin>("LocationSettings");

/**
 * Prompts user to turn on device GPS via Google Play Services in-app dialog (Android).
 */
export const openDeviceLocationSettings = async (): Promise<void> => {
  if (!isCapacitorNative()) return;
  if (Capacitor.getPlatform() === "android") {
    await LocationSettingsBridge.openLocationSettings();
  }
};

const getBrowserPosition = (): Promise<GeoPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new LocationError("Geolocation is not supported on this device", 2));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading
      }),
      (err) => {
        if (err.code === 1) {
          reject(new LocationError(err.message || "Location permission denied", 1));
        } else if (err.code === 2) {
          reject(
            new LocationError(
              "Your device's GPS appears to be turned off. Please turn on Location Services.",
              4
            )
          );
        } else {
          const code: LocationErrorCode = err.code === 3 ? 3 : 2;
          reject(new LocationError(err.message || "Could not determine location", code));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

/**
 * Requests location permission (OS dialog on native, browser prompt on web)
 * and resolves with the current high-accuracy position.
 */
export const requestLocationAndGetPosition = async (): Promise<GeoPosition> => {
  if (isCapacitorNative()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const checked = await Geolocation.checkPermissions();
      let perm = checked;
      if (perm.location !== "granted") {
        perm = await Geolocation.requestPermissions({ permissions: ["location"] });
      }
      if (perm.location !== "granted") {
        throw new LocationError("Location permission denied", 1);
      }
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        return {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading
        };
      } catch {
        throw new LocationError(
          "Your device's GPS is turned off or unavailable. Please turn on Location Services.",
          4
        );
      }
    } catch (e) {
      if (e instanceof LocationError) throw e;
      if (isDenialError(e)) {
        throw new LocationError("Location permission denied", 1);
      }
      try {
        return await getBrowserPosition();
      } catch (browserErr) {
        throw browserErr instanceof LocationError
          ? browserErr
          : new LocationError(
              "Your device's GPS is turned off. Please turn on Location Services.",
              4
            );
      }
    }
  }
  return getBrowserPosition();
};
