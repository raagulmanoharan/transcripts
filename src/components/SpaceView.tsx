import type { Space } from "../types";
import { Module } from "./Module";
import { moduleStateKey } from "../lib/store";

// A Space: the Flows that fulfil one overarching intent. On a phone the Flows
// stack vertically (Mercury's horizontal rows, turned thumb-first).

export function SpaceView({ space }: { space: Space }) {
  return (
    <section className="space">
      <header className="space-header">
        <h1 className="space-title">{space.space.title}</h1>
        <p className="space-subtitle">{space.space.subtitle}</p>
      </header>
      {space.flows.map((flow, fi) => (
        <div className="flow" key={fi}>
          {flow.title ? <h2 className="flow-title">{flow.title}</h2> : null}
          <div className="flow-modules">
            {flow.modules.map((mod, mi) => (
              <Module key={mi} mod={mod} stateKey={moduleStateKey(space.id, fi, mi)} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
