import { Capacitor } from "@capacitor/core";
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from "@capacitor/push-notifications";
import { post, del } from "@/api/fetcher";

let isPushInitialized = false;
let registeredToken: string | null = null;

/**
 * Initialize Firebase Cloud Messaging push notifications for the delivery partner app.
 *
 * Flow:
 * 1. Checks if running on native mobile device (Capacitor Android / iOS) or Web.
 * 2. Prompts user for notification permission if not yet granted on startup.
 * 3. Registers device with FCM and receives token.
 * 4. Persists token to backend so background new order & dispatch notifications reach driver.
 * 5. Sets up listeners for foreground and action events.
 */
export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch {}
      }
    }
    return;
  }

  if (isPushInitialized) {
    return;
  }
  isPushInitialized = true;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== "granted") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("[Push] Notification permission not granted:", permStatus.receive);
      return;
    }

    // Register with FCM
    await PushNotifications.register();

    // On successful registration
    await PushNotifications.addListener("registration", (token: Token) => {
      // SECURITY: Do NOT log FCM token values in production
      console.log("🔥 [FCM] Delivery Token received: [REDACTED]");
      registeredToken = token.value;
      try {
        // SECURITY: Use sessionStorage instead of localStorage for sensitive tokens
        sessionStorage.setItem("delivery_fcm_token", token.value);
      } catch {}
      void persistToken(token.value);
    });

    // Registration error
    await PushNotifications.addListener("registrationError", (error: any) => {
      console.error("[Push] FCM Registration Error:", JSON.stringify(error));
    });

    // Foreground push notification received
    await PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
      console.log("[Push] Foreground notification received:", notification);
    });

    // Push notification tapped
    await PushNotifications.addListener("pushNotificationActionPerformed", (action: ActionPerformed) => {
      console.log("[Push] Notification tapped:", action);
    });

    // If we already have a saved token from previous session, sync it to backend
    const savedToken = getSavedFcmToken();
    if (savedToken) {
      void persistToken(savedToken);
    }
  } catch (err: any) {
    console.error("[Push] Failed to initialize push notifications:", err?.message || err);
  }
}

/**
 * Resync FCM token to backend (call after login/token refresh)
 */
export async function syncDeviceToken(): Promise<void> {
  const token = registeredToken || getSavedFcmToken();
  if (token) {
    await persistToken(token);
  }
}

async function persistToken(token: string): Promise<void> {
  try {
    const platform = Capacitor.getPlatform();
    // SECURITY: Use authenticated fetcher instead of raw fetch
    await post("/delivery/notifications/devices", { token, platform });
  } catch (err) {
    console.warn("[Push] Failed to persist delivery FCM token:", err);
  }
}

/**
 * Remove device FCM token on logout.
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const token = registeredToken || getSavedFcmToken();
  registeredToken = null;
  if (!token) return;

  try {
    // SECURITY: Use authenticated fetcher instead of raw fetch
    await del("/delivery/notifications/devices", { body: { token } });
  } catch (err) {
    console.warn("[Push] Failed to unregister delivery FCM token:", err);
  }
}

export function getSavedFcmToken(): string | null {
  try {
    // SECURITY: Use sessionStorage instead of localStorage for sensitive tokens
    return sessionStorage.getItem("delivery_fcm_token");
  } catch {
    return null;
  }
}

