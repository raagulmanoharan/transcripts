import type { Signal } from "../types";
import { dayPartOf } from "./time";

// SIMULATED provider. Replace with HealthKit / Health Connect via a native
// bridge behind this function.

export async function readHealth(): Promise<Signal> {
  const part = dayPartOf(new Date(Date.now()));
  // Steps accumulate through the day in the stub.
  const steps = part === "morning" ? 800 : part === "afternoon" ? 2600 : part === "evening" ? 6100 : 6400;
  const low = steps < 4000;
  return {
    source: "health",
    label: `${steps.toLocaleString()} steps`,
    detail: `${steps.toLocaleString()} steps today${low ? " — low, little movement in the last few hours" : ""}. Slept 6h 40m.`,
    simulated: true,
  };
}
