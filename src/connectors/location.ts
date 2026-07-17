import type { Signal } from "../types";

// Real: coarse position from the browser. We don't reverse-geocode (no key),
// so we report a coarse fix and cache coordinates for the weather connector.

let cachedCoords: { lat: number; lon: number } | null = null;
export function getCachedCoords() {
  return cachedCoords;
}

function position(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function readLocation(): Promise<Signal | null> {
  try {
    const pos = await position();
    cachedCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
    return {
      source: "location",
      label: "Located",
      detail: `near ${tz} (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
      simulated: false,
    };
  } catch {
    return null;
  }
}
