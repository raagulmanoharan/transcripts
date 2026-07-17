// A real device API: geolocation -> live weather via Open-Meteo (no API key).
// On iOS Safari, geolocation requires a secure context (https, or localhost in
// dev) and a user permission grant.

export interface Weather {
  temperature: number;
  windSpeed: number;
  code: number;
  description: string;
  isDay: boolean;
}

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export function describeWeather(code: number): string {
  return WEATHER_CODES[code] ?? "Unknown conditions";
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("This device does not expose location to the browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (err) => reject(new Error(err.message)), {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function fetchWeather(): Promise<Weather> {
  const pos = await getPosition();
  const { latitude, longitude } = pos.coords;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,is_day`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather service is unavailable right now.");
  const data = (await res.json()) as {
    current: {
      temperature_2m: number;
      weather_code: number;
      wind_speed_10m: number;
      is_day: number;
    };
  };
  const c = data.current;
  return {
    temperature: Math.round(c.temperature_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    code: c.weather_code,
    description: describeWeather(c.weather_code),
    isDay: c.is_day === 1,
  };
}
