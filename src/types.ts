// The ambient model: signals -> situation -> prediction.
// MoveKind is derived from the shared Contract so client and Oracle can't drift.

import { MOVE_KINDS } from "../shared/contract.mjs";

export type MoveKind = (typeof MOVE_KINDS)[number];

export type SignalSource =
  | "time"
  | "location"
  | "weather"
  | "calendar"
  | "email"
  | "health"
  | "phone"
  | "device";

/** One reading from a connector. `simulated` flags stubbed providers. */
export interface Signal {
  source: SignalSource;
  label: string; // short, glanceable ("Standup in 20 min")
  detail: string; // a bit more context for the Oracle
  simulated: boolean;
}

/** A fused snapshot of what's happening now. */
export interface Situation {
  at: string; // ISO time
  dayPart: string; // morning | afternoon | evening | night
  weekday: string;
  signals: Signal[];
}

/** What confirming a prediction produces. */
export interface Move {
  kind: MoveKind;
  title: string;
  subtitle: string;
  item: string;
  action: string;
  modifier: string;
  content: string;
  minutes: number;
  query: string;
}

/** The Oracle's read of the situation: the single next move, to confirm. */
export interface Prediction {
  surface: boolean;
  confidence: number; // 0-100
  urgency: "ambient" | "soon" | "now";
  headline: string; // a statement to confirm
  because: string; // triangulation rationale, one line
  factors: string[]; // 2-3 signal fragments fused, shown as the reasoning
  confirmLabel: string;
  move: Move;
}
