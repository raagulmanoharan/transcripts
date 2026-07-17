import type { IntentResponse } from "../types";

/** Send the user's Locus input to the intent engine and get back a Space spec. */
export async function resolveIntent(text: string): Promise<IntentResponse> {
  const res = await fetch("/api/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    let message = "Something went wrong reading that intent.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }
  return (await res.json()) as IntentResponse;
}
