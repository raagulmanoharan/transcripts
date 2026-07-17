import type { Signal } from "../types";

// SIMULATED provider. Replace with the Gmail API (OAuth) behind this function.

export async function readEmail(): Promise<Signal> {
  return {
    source: "email",
    label: "Sam: move lunch?",
    detail:
      "2 unread. Newest, from Sam (10 min ago): \"Any chance we push lunch to 1pm? Something came up.\" — likely wants a quick reply.",
    simulated: true,
  };
}
