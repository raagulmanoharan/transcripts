// Types for the shared contract so the TypeScript client can consume it.

export interface ModuleSpec {
  kind: string;
  guidance: string;
}

export const MODULES: ModuleSpec[];
export const MODULE_KINDS: readonly [
  "note",
  "weather",
  "timer",
  "tasks",
  "message",
  "web",
  "info",
];
export function buildModuleGuidance(): string;
export function buildSpaceSchema(): Record<string, unknown>;
