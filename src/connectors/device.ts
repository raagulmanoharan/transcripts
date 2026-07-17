import type { Signal } from "../types";

// Real: connectivity always; battery where the browser exposes it (not iOS
// Safari — it's fine, the connector just omits the battery detail there).

interface BatteryLike {
  level: number;
  charging: boolean;
}

export async function readDevice(): Promise<Signal> {
  const online = navigator.onLine;
  let battery: BatteryLike | null = null;
  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
  if (typeof nav.getBattery === "function") {
    try {
      battery = await nav.getBattery();
    } catch {
      battery = null;
    }
  }
  const pct = battery ? Math.round(battery.level * 100) : null;
  const label = pct != null ? `${pct}%${battery?.charging ? " charging" : ""}` : online ? "Online" : "Offline";
  const detail =
    (pct != null ? `battery ${pct}%${battery?.charging ? " (charging)" : ""}, ` : "") +
    (online ? "connected" : "offline");
  return { source: "device", label, detail, simulated: false };
}
