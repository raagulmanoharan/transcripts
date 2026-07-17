import { useRef, useState } from "react";

// The Locus — the single command surface. One entry point for every intent;
// no app launching. (Voice would slot in here behind the same submit.)

const SUGGESTIONS = [
  "Plan a weekend trip to the coast",
  "Remind me to call the dentist",
  "What's the weather and should I bring a jacket",
  "Draft a message to Sam moving lunch to 1pm",
  "Start a 20 minute focus timer and jot my three priorities",
];

export function Locus({
  onSubmit,
  busy,
}: {
  onSubmit: (text: string) => void;
  busy: boolean;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const t = text.trim();
    if (!t || busy) return;
    onSubmit(t);
    setText("");
  }

  return (
    <div className="locus">
      <div className="locus-bar">
        <textarea
          ref={inputRef}
          className="locus-input"
          placeholder="What do you want to do?"
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={busy}
        />
        <button
          className="locus-go"
          onClick={submit}
          disabled={busy || !text.trim()}
          aria-label="Resolve intent"
        >
          {busy ? <span className="spinner" /> : "→"}
        </button>
      </div>
      <div className="locus-suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => onSubmit(s)} disabled={busy}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
