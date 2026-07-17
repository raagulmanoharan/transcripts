import type { Signal } from "../types";
import { dayPartOf } from "./time";

// SIMULATED provider. A browser app can't read a real calendar without OAuth;
// this stands in with plausible, time-aware events. Swap for the Google
// Calendar API behind this same function to go live.

export async function readCalendar(): Promise<Signal> {
  const d = new Date(Date.now());
  const part = dayPartOf(d);
  let label: string;
  let detail: string;
  if (part === "morning") {
    label = "Standup 9:30";
    detail = "Team standup at 9:30 (video). Nothing else before noon.";
  } else if (part === "afternoon") {
    label = "1:1 at 3:00";
    detail = "1:1 with your manager at 3:00. Free until then.";
  } else if (part === "evening") {
    label = "No events";
    detail = "Calendar is clear for the rest of the day.";
  } else {
    label = "Tomorrow 9:30";
    detail = "Next event is standup tomorrow at 9:30.";
  }
  return { source: "calendar", label, detail, simulated: true };
}
