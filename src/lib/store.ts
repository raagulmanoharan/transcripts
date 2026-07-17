// Local persistence for Spaces and per-Module state (notes, checklists).
// Everything lives in localStorage — no account, nothing leaves the device
// except the one line of intent that goes to the engine.

import type { IntentResponse, Space } from "../types";

const SPACES_KEY = "intentions.spaces.v1";
const MODULE_STATE_PREFIX = "intentions.module.v1.";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSpaces(): Space[] {
  return safeParse<Space[]>(localStorage.getItem(SPACES_KEY), []);
}

export function saveSpaces(spaces: Space[]): void {
  localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
}

function makeId(): string {
  // crypto.randomUUID is available in every browser that runs an installable PWA.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function createSpace(intent: string, resp: IntentResponse): Space {
  return {
    id: makeId(),
    intent,
    createdAt: Date.now(),
    space: resp.space,
    flows: resp.flows,
  };
}

/** Per-Module state is keyed by Space id + Flow/Module position, so a Module
 *  keeps its note text or checked items across reloads. */
export function moduleStateKey(spaceId: string, flowIndex: number, moduleIndex: number): string {
  return `${MODULE_STATE_PREFIX}${spaceId}.${flowIndex}.${moduleIndex}`;
}

export function loadModuleState<T>(key: string, fallback: T): T {
  return safeParse<T>(localStorage.getItem(key), fallback);
}

export function saveModuleState<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
