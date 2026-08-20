/**
 * Opens navigation in Google Maps app on mobile/Android or in browser tab on desktop/web,
 * providing driving directions from current location to the target destination.
 */
export const openMapsNavigation = (destination?: string, destinationName?: string) => {
  const parts = [destinationName, destination].filter(Boolean);
  if (parts.length === 0) return;

  const target = parts.join(", ").trim();
  const encoded = encodeURIComponent(target);

  // Google Maps Universal Directions URL:
  // - On Android / iOS: Automatically launches the native Google Maps app with turn-by-turn navigation from current GPS location.
  // - In Web / Browser: Opens Google Maps in a new browser tab with driving directions from current location.
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;

  window.open(mapsUrl, "_blank", "noopener,noreferrer");
};
