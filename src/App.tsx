import { useCallback, useEffect, useRef, useState } from "react";
import type { Prediction, Situation } from "./types";
import { gatherSituation } from "./connectors";
import { predict } from "./lib/oracle";
import { Ambient, type Phase } from "./components/Ambient";
import { PredictionCard } from "./components/PredictionCard";
import { Move } from "./components/Move";

const CONFIDENCE_THRESHOLD = 60;
const CYCLE_MS = 45_000; // how often the system re-senses when it's quiet

export function App() {
  const [phase, setPhase] = useState<Phase>("waking");
  const [situation, setSituation] = useState<Situation | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [acting, setActing] = useState<Prediction | null>(null);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const timer = useRef<number | null>(null);

  // One sense -> think pass. Won't interrupt a surfaced card or an active move.
  const pulse = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setError("");
    setPhase("sensing");
    try {
      const s = await gatherSituation();
      setSituation(s);
      setPhase("thinking");
      const p = await predict(s);
      if (p.surface && p.confidence >= CONFIDENCE_THRESHOLD) {
        setPrediction(p);
        setPhase("surfaced");
      } else {
        setPrediction(null);
        setPhase("quiet");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The Oracle is unavailable.");
      setPhase("quiet");
    } finally {
      busy.current = false;
    }
  }, []);

  // Boot, then a gentle heartbeat while quiet. Re-sense when the app regains
  // focus (the world changed while they were away).
  useEffect(() => {
    void pulse();
    function schedule() {
      timer.current = window.setInterval(() => {
        if (!prediction && !acting) void pulse();
      }, CYCLE_MS);
    }
    schedule();
    const onFocus = () => {
      if (!prediction && !acting) void pulse();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirm() {
    if (!prediction) return;
    if (prediction.move.kind !== "none") {
      setActing(prediction);
      setPhase("acting");
    } else {
      setPhase("quiet");
    }
    setPrediction(null);
  }

  function dismiss() {
    setPrediction(null);
    setPhase("quiet");
  }

  function endMove() {
    setActing(null);
    setPhase("quiet");
    void pulse();
  }

  return (
    <div className="app">
      <Ambient situation={situation} phase={phase} onReveal={() => setReveal(true)} />

      {error ? <div className="whisper-error">{error}</div> : null}

      {prediction ? (
        <div className="focal">
          <PredictionCard prediction={prediction} onConfirm={confirm} onDismiss={dismiss} />
        </div>
      ) : null}

      {acting ? (
        <div className="focal">
          <div className="acting">
            <div className="acting-head">
              <span className="acting-label">{acting.headline}</span>
              <button className="acting-close" onClick={endMove} aria-label="Done">
                Done
              </button>
            </div>
            <Move move={acting.move} id={acting.headline} />
          </div>
        </div>
      ) : null}

      {reveal && situation ? (
        <SignalsSheet situation={situation} onClose={() => setReveal(false)} />
      ) : null}
    </div>
  );
}

function SignalsSheet({ situation, onClose }: { situation: Situation; onClose: () => void }) {
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-title">What I'm sensing</div>
        <div className="signals">
          {situation.signals.map((s) => (
            <div key={s.source} className="signal">
              <div className="signal-source">
                {s.source}
                {s.simulated ? <span className="sim">simulated</span> : null}
              </div>
              <div className="signal-label">{s.label}</div>
              <div className="signal-detail">{s.detail}</div>
            </div>
          ))}
        </div>
        <p className="sheet-note">
          Location, weather, time and device are live. Gmail, calendar, health and phone are
          simulated here — real connectors drop in behind the same interface.
        </p>
      </div>
    </div>
  );
}
