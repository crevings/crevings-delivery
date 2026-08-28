import { Capacitor } from "@capacitor/core";
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from "@capacitor/push-notifications";
import { BASE_URL } from "@/api/fetcher";

let isPushInitialized = false;
let registeredToken: string | null = null;

/**
 * Initialize Firebase Cloud Messaging push notifications for the delivery partner app.
 *
 * Flow:
 * 1. Checks if running on native mobile device (Capacitor Android / iOS).
 * 2. Prompts user for notification permission if not yet granted.
 * 3. Registers device with FCM and receives token.
 * 4. Persists token to backend so background new order & dispatch notifications reach driver.
 * 5. Sets up listeners for foreground and action events.
 */
export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (isPushInitialized) {
    return;
  }
  isPushInitialized = true;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
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
      console.log("🔥 [FCM] Delivery Token received:", token.value);
      registeredToken = token.value;
      try {
        localStorage.setItem("delivery_fcm_token", token.value);
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
  } catch (err: any) {
    console.error("[Push] Failed to initialize push notifications:", err?.message || err);
  }
}

async function persistToken(token: string): Promise<void> {
  try {
    const platform = Capacitor.getPlatform();
    const res = await fetch(`${BASE_URL}/delivery/notifications/devices`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform }),
    });
    if (!res.ok) {
      console.warn(`[Push] Token persist returned status: ${res.status}`);
    }
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
    await fetch(`${BASE_URL}/delivery/notifications/devices`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn("[Push] Failed to unregister delivery FCM token:", err);
  }
}

export function getSavedFcmToken(): string | null {
  try {
    return localStorage.getItem("delivery_fcm_token");
  } catch {
    return null;
  }
}
