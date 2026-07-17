import type { Prediction, Situation } from "../types";

// The Oracle: hand the current situation to the server, get back the single
// next move to confirm (or surface:false when nothing is worth interrupting).

export async function predict(situation: Situation): Promise<Prediction> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ situation }),
  });
  if (!res.ok) {
    let message = "The Oracle is unavailable.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return (await res.json()) as Prediction;
}
