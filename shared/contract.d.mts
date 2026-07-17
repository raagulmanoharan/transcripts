// Types for the shared contract so the TypeScript client can consume it.

export interface SourceSpec {
  source: string;
  hint: string;
}
export interface MoveSpec {
  kind: string;
  guidance: string;
}

export const SIGNAL_SOURCES: SourceSpec[];
export const MOVES: MoveSpec[];
export const MOVE_KINDS: readonly [
  "none",
  "note",
  "timer",
  "tasks",
  "message",
  "directions",
  "weather",
  "web",
  "info",
];
export function buildSourceList(): string;
export function buildMoveGuidance(): string;
export function buildPredictionSchema(): Record<string, unknown>;
