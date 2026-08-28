import React from "react";

/**
 * ServiceabilityGate is a non-blocking wrapper.
 * Riders can freely onboard, log in, manage KYC documents, vehicles, bank accounts,
 * and navigate the app. Serviceability validation is enforced when turning ONLINE.
 */
export function ServiceabilityGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

