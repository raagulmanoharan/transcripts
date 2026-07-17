// The interaction grammar, mirrored on the client.
// ModuleKind is derived from the shared Contract so the client's renderer and
// the server's prompt/schema can never drift apart.

import { MODULE_KINDS } from "../shared/contract.mjs";

export type ModuleKind = (typeof MODULE_KINDS)[number];

export interface IntentModule {
  kind: ModuleKind;
  title: string;
  subtitle: string;
  item: string; // noun
  action: string; // verb
  modifier: string; // context
  content: string;
  minutes: number;
  query: string;
}

export interface Flow {
  title: string;
  modules: IntentModule[];
}

export interface SpaceHeader {
  title: string;
  subtitle: string;
}

/** The raw shape returned by /api/intent. */
export interface IntentResponse {
  space: SpaceHeader;
  flows: Flow[];
}

/** A Space as persisted locally, with identity and the originating intent. */
export interface Space extends IntentResponse {
  id: string;
  intent: string;
  createdAt: number;
}
