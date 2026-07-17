import type { Space } from "../types";

// Spaces replace the home screen / app grid: a list of intents you have open.

export function SpaceSwitcher({
  spaces,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: {
  spaces: Space[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <nav className="switcher">
      <button className="switcher-new" onClick={onNew}>
        + New intent
      </button>
      <div className="switcher-list">
        {spaces.map((s) => (
          <div
            key={s.id}
            className={s.id === activeId ? "switcher-item active" : "switcher-item"}
          >
            <button className="switcher-open" onClick={() => onSelect(s.id)}>
              <span className="switcher-name">{s.space.title}</span>
              <span className="switcher-sub">{s.space.subtitle}</span>
            </button>
            <button
              className="switcher-del"
              onClick={() => onDelete(s.id)}
              aria-label="Close space"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}
