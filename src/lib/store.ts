// Local persistence for the state a confirmed move carries (note text, checked
// items, timer remaining). Everything is on-device; only the fused Situation is
// sent to the Oracle.

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const PREFIX = "intentions.move.v1.";

export function moveStateKey(id: string, suffix: string): string {
  return `${PREFIX}${id}.${suffix}`;
}

export function loadState<T>(key: string, fallback: T): T {
  return safeParse<T>(localStorage.getItem(key), fallback);
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}
