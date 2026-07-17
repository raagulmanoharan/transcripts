import type { Signal } from "../types";
import { dayPartOf } from "./time";

// SIMULATED provider. Replace with native focus/notification state.

export async function readPhone(): Promise<Signal> {
  const part = dayPartOf(new Date(Date.now()));
  const dnd = part === "night";
  return {
    source: "phone",
    label: dnd ? "Do Not Disturb" : "Notifications on",
    detail: dnd
      ? "Focus (Do Not Disturb) is on. 1 missed call earlier."
      : "No focus mode. A few app notifications waiting.",
    simulated: true,
  };
}
