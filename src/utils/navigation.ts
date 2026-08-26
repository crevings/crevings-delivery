/**
 * Opens external map navigation (Google Maps / Apple Maps / default nav app)
 * providing turn-by-turn driving directions from the driver's current GPS location
 * to the target destination (restaurant or customer).
 *
 * Supports both exact GPS coordinates { lat, lng } and full address strings.
 */

export interface MapDestinationCoords {
  lat: number;
  lng: number;
}

export const openMapsNavigation = (
  destination?: string | MapDestinationCoords | null,
  destinationName?: string,
  explicitCoords?: MapDestinationCoords | null
) => {
  let mapsUrl = "";

  // 1. Determine if we have coordinates
  const coords: MapDestinationCoords | null =
    explicitCoords && typeof explicitCoords.lat === "number" && typeof explicitCoords.lng === "number"
      ? explicitCoords
      : destination && typeof destination === "object" && typeof (destination as any).lat === "number" && typeof (destination as any).lng === "number"
        ? (destination as MapDestinationCoords)
        : null;

  if (coords && !isNaN(coords.lat) && !isNaN(coords.lng) && coords.lat !== 0 && coords.lng !== 0) {
    // Exact GPS coordinate navigation (highest precision for delivery drivers)
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`;
  } else {
    // Address string fallback
    const destStr = typeof destination === "string" ? destination : "";
    const parts = [destinationName, destStr].filter(Boolean);
    if (parts.length === 0) return;

    const target = parts.join(", ").trim();
    const encoded = encodeURIComponent(target);
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
  }

  // Open in system external map (Google Maps app on Android/iOS, or new tab on web)
  try {
    const isNative =
      typeof window !== "undefined" &&
      !!(window as any).Capacitor?.isNativePlatform?.();

    if (isNative) {
      // In native Capacitor Android/iOS, '_system' delegates to OS URL handler / Google Maps app
      window.open(mapsUrl, "_system");
    } else {
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }
  } catch {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }
};
