// The Contract — single source of truth for the ambient intelligence.
//
// It defines (1) the signal sources the system triangulates, and (2) the
// Prediction shape the Oracle returns. The same contract generates the
// Oracle's system prompt AND the JSON schema it must fill, and the client
// renders against the same vocabulary — so nothing drifts.

/** The connectors the system fuses. Real where a browser allows; the rest are
 *  simulated providers behind the same interface (swap in OAuth/native later). */
export const SIGNAL_SOURCES = [
  { source: "time", hint: "time of day, weekday, part of day" },
  { source: "location", hint: "where the person is / whether they're moving" },
  { source: "weather", hint: "current conditions at their location" },
  { source: "calendar", hint: "next events and how soon they are" },
  { source: "email", hint: "recent/unread mail that may need a reply or action" },
  { source: "health", hint: "activity today (steps, movement, sleep)" },
  { source: "phone", hint: "focus/DND, recent calls, notifications" },
  { source: "device", hint: "battery, connectivity" },
];

/** What confirming a prediction produces. `none` = pure acknowledgement. */
export const MOVES = [
  { kind: "none", guidance: "no artifact — just acknowledge. Use when the move is a nudge, not a thing to open." },
  { kind: "note", guidance: "capture or prep some text. Put a starting draft in content." },
  { kind: "timer", guidance: "start a countdown. Set minutes; label in content." },
  { kind: "tasks", guidance: "surface a short checklist. One item per line in content." },
  { kind: "message", guidance: "a drafted reply/message. Recipient in item, draft in content." },
  { kind: "directions", guidance: "leaving for somewhere. Destination in query, the timing/why in content." },
  { kind: "weather", guidance: "show live weather. The client fetches it; leave content empty." },
  { kind: "web", guidance: "needs the open web. Search query in query; one-line reason in content." },
  { kind: "info", guidance: "a direct answer or briefing you can give now. Put it in content." },
];

export const MOVE_KINDS = MOVES.map((m) => m.kind);

export function buildSourceList() {
  return SIGNAL_SOURCES.map((s) => `- ${s.source}: ${s.hint}`).join("\n");
}

export function buildMoveGuidance() {
  return MOVES.map((m) => `- ${m.kind}: ${m.guidance}`).join("\n");
}

const MOVE_PROPERTIES = {
  kind: { type: "string", enum: MOVE_KINDS },
  title: { type: "string" },
  subtitle: { type: "string" },
  item: { type: "string" },
  action: { type: "string" },
  modifier: { type: "string" },
  content: { type: "string" },
  minutes: { type: "integer" },
  query: { type: "string" },
};

/** The Prediction the Oracle returns for a Situation. */
export function buildPredictionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      surface: { type: "boolean" }, // whether anything is worth surfacing now
      confidence: { type: "integer" }, // 0-100
      urgency: { type: "string", enum: ["ambient", "soon", "now"] },
      icon: {
        type: "string",
        enum: ["rain", "sun", "cloud", "message", "note", "walk", "battery", "clock", "location", "calendar", "moon", "idea", "check"],
      },
      headline: { type: "string" }, // a statement to CONFIRM, never a question
      because: { type: "string" }, // the triangulation rationale, one line
      factors: { type: "array", items: { type: "string" } }, // 2-3 signal fragments fused (each 2-4 words)
      confirmLabel: { type: "string" }, // e.g. "Start", "Send", "Got it"
      move: {
        type: "object",
        additionalProperties: false,
        properties: MOVE_PROPERTIES,
        required: Object.keys(MOVE_PROPERTIES),
      },
    },
    required: [
      "surface",
      "confidence",
      "urgency",
      "icon",
      "headline",
      "because",
      "factors",
      "confirmLabel",
      "move",
    ],
  };
}
