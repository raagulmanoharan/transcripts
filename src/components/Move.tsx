import { useEffect, useMemo, useRef, useState } from "react";
import type { Move as MoveT } from "../types";
import { loadState, saveState } from "../lib/store";
import { fetchWeather, type Weather } from "../lib/weather";

// A confirmed move renders here — the artifact the prediction produced. These
// are the only surfaces the person operates; they appear because the system
// proposed them, not because the person went looking.

export function Move({ move, id }: { move: MoveT; id: string }) {
  if (move.kind === "none") return null;
  return (
    <div className="move">
      <MoveBody move={move} id={id} />
    </div>
  );
}

function MoveBody({ move, id }: { move: MoveT; id: string }) {
  switch (move.kind) {
    case "note":
      return <NoteMove content={move.content} k={id} />;
    case "timer":
      return <TimerMove minutes={move.minutes} label={move.content} k={id} />;
    case "tasks":
      return <TasksMove content={move.content} k={id} />;
    case "message":
      return <MessageMove recipient={move.item} content={move.content} />;
    case "directions":
      return <DirectionsMove destination={move.query} note={move.content} />;
    case "weather":
      return <WeatherMove modifier={move.modifier} />;
    case "web":
      return <WebMove query={move.query} reason={move.content} />;
    case "info":
    default:
      return <p className="info-text">{move.content}</p>;
  }
}

function NoteMove({ content, k }: { content: string; k: string }) {
  const key = k + ".note";
  const [value, setValue] = useState(() => loadState(key, content));
  useEffect(() => saveState(key, value), [key, value]);
  return (
    <textarea
      className="note-area"
      rows={4}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Write it down…"
    />
  );
}

function WeatherMove({ modifier }: { modifier: string }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchWeather()
      .then(setWeather)
      .catch((e) => setError(e instanceof Error ? e.message : "unavailable"));
  }, []);
  if (error) return <p className="muted">{error}</p>;
  if (!weather) return <p className="muted">Reading conditions…</p>;
  return (
    <div className="weather">
      <div className="weather-temp">{weather.temperature}°</div>
      <div className="weather-meta">
        <div>{weather.description}</div>
        <div className="muted">
          wind {weather.windSpeed} km/h{modifier ? ` · ${modifier}` : ""}
        </div>
      </div>
    </div>
  );
}

function TimerMove({ minutes, label, k }: { minutes: number; label: string; k: string }) {
  const key = k + ".timer";
  const total = Math.max(1, minutes || 5) * 60;
  const [remaining, setRemaining] = useState(() => loadState(key, total));
  const [running, setRunning] = useState(false);
  const iv = useRef<number | null>(null);
  useEffect(() => saveState(key, remaining), [key, remaining]);
  useEffect(() => {
    if (!running) return;
    iv.current = window.setInterval(() => {
      setRemaining((r) => (r <= 1 ? (setRunning(false), 0) : r - 1));
    }, 1000);
    return () => {
      if (iv.current) window.clearInterval(iv.current);
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

interface Task {
  text: string;
  done: boolean;
}
function TasksMove({ content, k }: { content: string; k: string }) {
  const key = k + ".tasks";
  const initial = useMemo<Task[]>(
    () =>
      content
        .split("\n")
        .map((l) => l.replace(/^\s*[-*•\d.]+\s*/, "").trim())
        .filter(Boolean)
        .map((text) => ({ text, done: false })),
    [content],
  );
  const [items, setItems] = useState<Task[]>(() => loadState(key, initial));
  useEffect(() => saveState(key, items), [key, items]);
  if (!items.length) return <p className="muted">No items.</p>;
  return (
    <ul className="tasks">
      {items.map((it, i) => (
        <li key={i} className={it.done ? "task done" : "task"}>
          <label>
            <input
              type="checkbox"
              checked={it.done}
              onChange={() =>
                setItems((p) => p.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)))
              }
            />
            <span>{it.text}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function MessageMove({ recipient, content }: { recipient: string; content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      {recipient ? <div className="muted">To: {recipient}</div> : null}
      <div className="message-draft">{content}</div>
      <div className="timer-actions">
        <button
          className="btn"
          onClick={() => {
            navigator.clipboard?.writeText(content).then(
              () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              },
              () => setCopied(false),
            );
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <a className="btn btn-ghost" href={`sms:&body=${encodeURIComponent(content)}`}>
          Open in Messages
        </a>
      </div>
    </div>
  );
}

function DirectionsMove({ destination, note }: { destination: string; note: string }) {
  const href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  return (
    <div>
      {note ? <p className="muted">{note}</p> : null}
      <a className="btn" href={href} target="_blank" rel="noreferrer">
        Directions to {destination}
      </a>
    </div>
  );
}

function WebMove({ query, reason }: { query: string; reason: string }) {
  return (
    <div>
      {reason ? <p className="muted">{reason}</p> : null}
      <a
        className="btn"
        href={`https://duckduckgo.com/?q=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noreferrer"
      >
        Search: {query}
      </a>
    </div>
  );
}
