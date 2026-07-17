# Intentions

An **ambient, proactive intelligence** for the phone — as an installable web app (PWA) that runs on iOS.

It doesn't wait to be asked. It quietly **senses** your context across connectors, **triangulates** them into a picture of what's happening now, and **predicts the single next move** — surfaced as one calm card you **confirm, not answer**. Most of the time it stays silent. The UI is stripped to a breathing "now" surface; the system speaks first, and only when it's worth it.

> MVP scope: an app that *feels like* an ambient intelligent OS layer. See [What's real vs simulated](#whats-real-vs-simulated).

---

## The shift

From reactive to proactive:

| Old (reactive) | Now (proactive) |
| --- | --- |
| You declare an intent | The system predicts your next move |
| It answers | It anticipates |
| A command bar | A calm ambient surface — no command bar |
| You ask | You **confirm** (never "would you like…?") |

## Architecture

```
Connectors ──► Situation ──► Oracle (claude-opus-4-8) ──► Prediction ──► Confirm ──► Move
 (signals)     (fused now)     triangulate + predict       (one card)               (artifact)
```

- **Connectors** (`src/connectors/`) — each yields a `Signal`. **Live:** location (geolocation), weather (Open-Meteo), time, device (battery/network). **Simulated:** Gmail, calendar, health, phone — a browser can't read those without OAuth/native, so they're stub providers behind the *same* interface; swap in the real source without touching the Oracle or UI.
- **Situation** — the connectors fused into one snapshot of "now."
- **The Oracle** (`server/index.mjs`) — a server proxy (keeps the Anthropic key off the client) that hands the Situation to Claude with structured output. Claude **triangulates** the signals and returns one **Prediction**: a headline phrased to confirm, a "because" line naming the signals it combined, a confidence + urgency, and the **Move** that confirming produces. It's told to stay quiet (`surface: false`) unless confidence ≥ 60.
- **`shared/contract.mjs`** — single source of truth: defines the signal vocabulary and the Prediction schema, generates the Oracle's prompt, *and* is what the client renders against. Nothing drifts.
- **Ambient UI** (`src/`) — `Ambient` (the "now" surface + peripheral awareness + a presence that breathes while it thinks) and `PredictionCard` (the one focal confirm). Confirming produces a `Move` (note, timer, tasks, message draft, directions, weather, web, info). Tap the periphery to see exactly what it's sensing.

### Confirm, don't ask
Predictions are statements, ready to accept — *"Head out by 8:55 to stay ahead of the rain,"* not *"Do you want directions?"* The "because" line makes the triangulation legible: *"rain at 9:10 + a 9:30 across town + you're still home."*

## Run it

```bash
cp .env.example .env       # add your ANTHROPIC_API_KEY
npm install
npm run dev                # web on :5173, Oracle on :8787
```

Open http://localhost:5173. It boots, senses, and predicts; it re-senses on a gentle heartbeat and when the app regains focus. Grant location for live weather.

Scripts: `npm run dev` · `npm run build` (emits the PWA service worker) · `npm run typecheck` · `npm run icons`.

## Install on iOS

Over HTTPS (deploy `dist/` + the Oracle, or tunnel for local testing): Safari → **Share → Add to Home Screen** → launch full-screen.

## What's real vs simulated

- **Live now:** location, weather, time, device signals; the full Oracle loop (with a key); confirmed Moves (timers, notes, checklists, drafts, directions) persisted on-device.
- **Simulated (MVP):** Gmail, calendar, health, phone connectors return plausible data behind the real interface. Production would wire OAuth (Google), HealthKit / Health Connect (native), and notification/focus state.
- Moves are *prepared*, not executed — the system drafts and tees up; you confirm and act.

## Design lineage

- **[TRIDENT OS](https://www.researchgate.net/publication/401657391_TRIDENT_OS_An_Intent-Based_Operating_Environment_for_Natural_Human-Computer_Interaction)** — intent engine as an orchestration layer over an existing OS.
- **[Mercury OS](https://uxdesign.cc/introducing-mercury-os-f4de45a04289)** — Modules as content+action assembled on demand (here, what a confirmation produces).
- **[AppLess](https://github.com/thesysdev/appless)** — one contract as the source of truth that generates the model's prompt.
- **Apple HIG** — the ambient, monochrome treatment: materials and hairlines for depth, white as the only accent, quiet motion.
