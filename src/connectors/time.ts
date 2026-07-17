import type { Signal } from "../types";

export function dayPartOf(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function weekdayOf(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

export async function readTime(): Promise<Signal> {
  const d = new Date(Date.now());
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return {
    source: "time",
    label: time,
    detail: `${weekdayOf(d)} ${dayPartOf(d)}, local time ${time}`,
    simulated: false,
  };
}
