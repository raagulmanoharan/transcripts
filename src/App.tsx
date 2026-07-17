import { useEffect, useState } from "react";
import type { Space } from "./types";
import { resolveIntent } from "./lib/intent";
import {
  createSpace,
  loadSpaces,
  saveSpaces,
} from "./lib/store";
import { Locus } from "./components/Locus";
import { SpaceView } from "./components/SpaceView";
import { SpaceSwitcher } from "./components/SpaceSwitcher";

export function App() {
  const [spaces, setSpaces] = useState<Space[]>(() => loadSpaces());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    saveSpaces(spaces);
  }, [spaces]);

  const active = spaces.find((s) => s.id === activeId) ?? null;

  async function handleIntent(text: string) {
    setBusy(true);
    setError("");
    try {
      const resp = await resolveIntent(text);
      const space = createSpace(text, resp);
      setSpaces((prev) => [space, ...prev]);
      setActiveId(space.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function deleteSpace(id: string) {
    setSpaces((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <div className="app">
      <header className="app-bar">
        <button
          className="app-bar-menu"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="Spaces"
        >
          ☰
        </button>
        <div className="app-bar-title" onClick={() => setActiveId(null)}>
          Intentions
        </div>
        <div className="app-bar-spacer" />
      </header>

      {drawerOpen ? (
        <div className="drawer-scrim" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <SpaceSwitcher
              spaces={spaces}
              activeId={activeId}
              onSelect={(id) => {
                setActiveId(id);
                setDrawerOpen(false);
              }}
              onDelete={deleteSpace}
              onNew={() => {
                setActiveId(null);
                setDrawerOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

      <main className="app-main">
        {error ? <div className="banner-error">{error}</div> : null}

        {active ? (
          <SpaceView space={active} />
        ) : (
          <EmptyState spaces={spaces} onOpen={setActiveId} />
        )}
      </main>

      <Locus onSubmit={handleIntent} busy={busy} />
    </div>
  );
}

function EmptyState({
  spaces,
  onOpen,
}: {
  spaces: Space[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="empty">
      <div className="empty-mark" aria-hidden="true">
        <span />
      </div>
      <h1 className="empty-title">Declare an intention</h1>
      <p className="empty-sub">
        No apps to launch. Say what you want, and the interface assembles itself.
      </p>
      {spaces.length > 0 ? (
        <div className="empty-recent">
          <div className="empty-recent-label">Open intentions</div>
          {spaces.slice(0, 6).map((s) => (
            <button key={s.id} className="chip" onClick={() => onOpen(s.id)}>
              {s.space.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
