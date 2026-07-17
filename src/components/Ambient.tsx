import type { Situation } from "../types";

export type Phase = "waking" | "sensing" | "thinking" | "quiet" | "surfaced" | "acting";

const STATUS: Record<Phase, string> = {
  waking: "Waking",
  sensing: "Sensing",
  thinking: "Thinking",
  quiet: "All quiet",
  surfaced: "",
  acting: "",
};

// The calm "now" surface. Peripheral awareness, never demanding. The time and
// a faint line of what the system is sensing — and a presence that breathes
// while it thinks.

export function Ambient({
  situation,
  phase,
  onReveal,
}: {
  situation: Situation | null;
  phase: Phase;
  onReveal: () => void;
}) {
  const now = new Date(Date.now());
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const status = STATUS[phase];
  const thinking = phase === "sensing" || phase === "thinking" || phase === "waking";

  return (
    <div className="ambient">
      <div className="ambient-top">
        <span className={`presence ${thinking ? "thinking" : phase === "quiet" ? "quiet" : ""}`} />
        {status ? <span className="status">{status}</span> : null}
      </div>

      <div className="ambient-now">
        <div className="now-time">{time}</div>
        {situation ? (
          <div className="now-sub">
            {situation.weekday} · {situation.dayPart}
          </div>
        ) : null}
      </div>

      {situation && situation.signals.length > 0 ? (
        <button className="periphery" onClick={onReveal} aria-label="What I'm sensing">
          {situation.signals.slice(0, 5).map((s) => (
            <span key={s.source} className="periph-item">
              {s.label}
            </span>
          ))}
        </button>
      ) : null}
    </div>
  );
}
