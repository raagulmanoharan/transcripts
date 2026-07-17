import { useEffect, useMemo, useRef, useState } from "react";
import type { IntentModule } from "../types";
import { loadModuleState, saveModuleState } from "../lib/store";
import { fetchWeather, type Weather } from "../lib/weather";

// A Module renders content + action, assembled on demand for the intent.
// The `kind` selects the renderer; the noun/verb/modifier come through as
// item/action/modifier for display.

export function Module({ mod, stateKey }: { mod: IntentModule; stateKey: string }) {
  return (
    <div className={`module module-${mod.kind}`}>
      <div className="module-head">
        <span className="module-kind">{mod.kind}</span>
        {mod.modifier ? <span className="module-modifier">{mod.modifier}</span> : null}
      </div>
      <h3 className="module-title">{mod.title}</h3>
      {mod.subtitle ? <p className="module-subtitle">{mod.subtitle}</p> : null}
      <div className="module-body">
        <Renderer mod={mod} stateKey={stateKey} />
      </div>
    </div>
  );
}

function Renderer({ mod, stateKey }: { mod: IntentModule; stateKey: string }) {
  switch (mod.kind) {
    case "note":
      return <NoteModule content={mod.content} stateKey={stateKey} />;
    case "weather":
      return <WeatherModule modifier={mod.modifier} />;
    case "timer":
      return <TimerModule minutes={mod.minutes} label={mod.content} stateKey={stateKey} />;
    case "tasks":
      return <TasksModule content={mod.content} stateKey={stateKey} />;
    case "message":
      return <MessageModule recipient={mod.item} content={mod.content} />;
    case "web":
      return <WebModule query={mod.query} reason={mod.content} />;
    case "info":
    default:
      return <InfoModule content={mod.content} />;
  }
}

function NoteModule({ content, stateKey }: { content: string; stateKey: string }) {
  const [value, setValue] = useState<string>(() => loadModuleState(stateKey, content));
  useEffect(() => {
    saveModuleState(stateKey, value);
  }, [stateKey, value]);
  return (
    <textarea
      className="note-area"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Write it down…"
      rows={4}
    />
  );
}

function WeatherModule({ modifier }: { modifier: string }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setWeather(await fetchWeather());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get weather.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="muted">Reading your location…</p>;
  if (error)
    return (
      <div>
        <p className="muted">{error}</p>
        <button className="btn" onClick={() => void load()}>
          Try again
        </button>
      </div>
    );
  if (!weather) return null;
  return (
    <div className="weather">
      <div className="weather-temp">{weather.temperature}°</div>
      <div className="weather-meta">
        <div>{weather.description}</div>
        <div className="muted">
          wind {weather.windSpeed} km/h · {weather.isDay ? "day" : "night"}
          {modifier ? ` · ${modifier}` : ""}
        </div>
      </div>
    </div>
  );
}

function TimerModule({
  minutes,
  label,
  stateKey,
}: {
  minutes: number;
  label: string;
  stateKey: string;
}) {
  const total = Math.max(1, minutes || 5) * 60;
  const [remaining, setRemaining] = useState<number>(() =>
    loadModuleState(stateKey, total),
  );
  const [running, setRunning] = useState(false);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    saveModuleState(stateKey, remaining);
  }, [stateKey, remaining]);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="timer">
      <div className="timer-clock">
        {mm}:{ss}
      </div>
      {label ? <div className="muted">{label}</div> : null}
      <div className="timer-actions">
        <button className="btn" onClick={() => setRunning((v) => !v)} disabled={remaining === 0}>
          {running ? "Pause" : "Start"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setRunning(false);
            setRemaining(total);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

interface TaskItem {
  text: string;
  done: boolean;
}

function TasksModule({ content, stateKey }: { content: string; stateKey: string }) {
  const initial = useMemo<TaskItem[]>(
    () =>
      content
        .split("\n")
        .map((l) => l.replace(/^\s*[-*•\d.]+\s*/, "").trim())
        .filter(Boolean)
        .map((text) => ({ text, done: false })),
    [content],
  );
  const [items, setItems] = useState<TaskItem[]>(() => loadModuleState(stateKey, initial));
  useEffect(() => {
    saveModuleState(stateKey, items);
  }, [stateKey, items]);

  function toggle(i: number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, done: !it.done } : it)));
  }

  if (items.length === 0) return <p className="muted">No items.</p>;
  return (
    <ul className="tasks">
      {items.map((it, i) => (
        <li key={i} className={it.done ? "task done" : "task"}>
          <label>
            <input type="checkbox" checked={it.done} onChange={() => toggle(i)} />
            <span>{it.text}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function MessageModule({ recipient, content }: { recipient: string; content: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  const smsHref = `sms:${recipient ? "" : ""}&body=${encodeURIComponent(content)}`;
  return (
    <div className="message">
      {recipient ? <div className="muted">To: {recipient}</div> : null}
      <div className="message-draft">{content}</div>
      <div className="timer-actions">
        <button className="btn" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </button>
        <a className="btn btn-ghost" href={smsHref}>
          Open in Messages
        </a>
      </div>
    </div>
  );
}

function WebModule({ query, reason }: { query: string; reason: string }) {
  const href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  return (
    <div className="web">
      {reason ? <p className="muted">{reason}</p> : null}
      <a className="btn" href={href} target="_blank" rel="noreferrer">
        Search: {query}
      </a>
    </div>
  );
}

function InfoModule({ content }: { content: string }) {
  return <p className="info-text">{content}</p>;
}
