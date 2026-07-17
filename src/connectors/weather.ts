import type { Signal } from "../types";
import { getCachedCoords } from "./location";

// Real: live weather via Open-Meteo (no key), using coordinates the location
// connector cached this cycle.

const CODES: Record<number, string> = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "light drizzle",
  53: "drizzle",
  55: "drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "rain showers",
  81: "rain showers",
  82: "heavy showers",
  95: "thunderstorms",
  96: "thunderstorms",
  99: "thunderstorms",
};

export async function readWeather(): Promise<Signal | null> {
  const c = getCachedCoords();
  if (!c) return null;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
      `&current=temperature_2m,weather_code,precipitation`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current: { temperature_2m: number; weather_code: number; precipitation: number };
    };
    const cur = data.current;
    const desc = CODES[cur.weather_code] ?? "unknown";
    const temp = Math.round(cur.temperature_2m);
    return {
      source: "weather",
      label: `${temp}° ${desc}`,
      detail: `${temp}°C, ${desc}${cur.precipitation > 0 ? `, ${cur.precipitation}mm precip` : ""}`,
      simulated: false,
    };
  } catch {
    return null;
  }
}
