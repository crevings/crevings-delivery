import React, { useEffect, useState } from "react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { fetcher } from "@/api/fetcher";

interface ZoneCheckResponse {
  success: boolean;
  serviceable?: boolean;
  zone?: unknown;
}

type GateState = "checking" | "serviceable" | "not-serviceable" | "error";

/**
 * Mandatory serviceable-zone gate for the delivery (rider) app.
 *
 * The rider's live location (from useLocationManager, which watches position)
 * is checked against the backend's /zones/check endpoint. While the rider is
 * confirmed to be OUTSIDE every designated service area, the app is replaced
 * by a prominent full-screen block: "Crevings is not available in your city."
 * The gate re-checks as the rider moves, so it clears automatically once they
 * re-enter a serviceable zone.
 */
export function ServiceabilityGate({ children }: { children: React.ReactNode }) {
  const { latitude, longitude, isChecking, hasPermission } = useLocationManager(true);
  const [state, setState] = useState<GateState>("checking");
  const [checkedKey, setCheckedKey] = useState("");

  useEffect(() => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      // No coordinates yet: if the device can't provide a location at all,
      // don't hard-block the app — the rest of the app already prompts for
      // permission. Otherwise keep waiting for the first fix.
      if (!isChecking && !hasPermission) setState("serviceable");
      return;
    }

    const key = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    if (key === checkedKey) return;
    setCheckedKey(key);
    setState("checking");

    fetcher(`/zones/check?lat=${latitude}&lng=${longitude}`)
      .then((res: ZoneCheckResponse) => {
        if (res?.success === true) {
          setState(res.serviceable === false ? "not-serviceable" : "serviceable");
        } else {
          // Fail-open on a malformed response — never block on API quirks.
          setState("serviceable");
        }
      })
      .catch(() => {
        // Fail-open on network errors — the rest of the app handles offline.
        setState("serviceable");
      });
  }, [latitude, longitude, isChecking, hasPermission, checkedKey]);

  if (state === "not-serviceable") {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-3xl">📍</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-6 tracking-tight">
          Crevings is not available in your city.
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-xs leading-relaxed">
          You are currently outside the designated service area. Move back into a
          serviceable zone to receive delivery requests — this screen clears
          automatically when you re-enter one.
        </p>
        <button
          onClick={() => {
            setCheckedKey("");
            setState("checking");
          }}
          className="mt-8 px-6 py-3 bg-[#00bd6f] text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          Check again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
