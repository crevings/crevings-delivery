/**
 * permissions.ts — Capacitor-aware helpers for opening the OS app-settings
 * page, used when location permissions are denied.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

interface AppSettingsPlugin {
  open(): Promise<void>;
}

/** Native Android bridge — registered from MainActivity.onCreate(). */
const AppSettings = registerPlugin<AppSettingsPlugin>("AppSettings");

export const isCapacitorNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/** Opens the OS app-settings page for this app (native only). No-op on web. */
export const openAppSettings = async (): Promise<void> => {
  if (!isCapacitorNative()) return;

  // Android → native Intent via AppSettingsPlugin
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.getPlatform() === "android") {
      await AppSettings.open();
      return;
    }
  } catch {
    // fall through
  }

  // iOS / fallback
  try {
    const { App } = await import("@capacitor/app");
    await (App as unknown as { openUrl?: (options: { url: string }) => Promise<void> }).openUrl?.({
      url: "app-settings:",
    });
  } catch {
    // best effort — ignore
  }
};

/** Backwards-compatible alias */
export const openLocationSettings = openAppSettings;
