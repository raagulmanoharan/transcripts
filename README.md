# Intentions

An **intent-based operating environment** for the phone — as an installable web app (PWA) that runs on iOS.

There are no apps to launch. You declare what you want in a single command surface, and the interface assembles itself: a real Claude model reads your intent and returns a **Space** of **Flows** and **Modules** that the app renders on demand.

> MVP scope: an app that *mimics an OS*. It prototypes the interaction model, not a real mobile OS. See [Design lineage](#design-lineage).

---

## The interaction grammar

Borrowed from [Mercury OS](https://uxdesign.cc/introducing-mercury-os-f4de45a04289) and given a working engine:

| Primitive | What it is | Here |
| --- | --- | --- |
| **Locus** | The single command surface — one entry point for every intent | The input bar at the bottom |
| **Module** | Content + action, assembled on demand | An intent-rendered card (note, weather, timer, tasks, message, web, info) |
| **Flow** | An ordered stack of Modules for one task | A vertical group |
| **Space** | The Flows that fulfil one overarching intent | Replaces the home screen / app grid |

Every Module is described with a **noun-verb-modifier** intent schema (`item` / `action` / `modifier`), which maps cleanly onto how a real phone OS (e.g. Android Intents) routes actions.

## Architecture

```
Locus (you)  ─►  /api/intent  ─►  Claude (claude-opus-4-8, structured output)
                    │
                    ▼
              Space { Flows[ Modules[] ] }  ─►  React renderer  ─►  cards
```

- **`shared/contract.mjs`** — the single source of truth for the Module vocabulary. It generates *both* the model's system prompt **and** the JSON schema it must fill; the client renderer switches on the same kinds. One definition, so the model's vocabulary and the renderer can't drift apart. (This pattern is borrowed from [AppLess](https://github.com/thesysdev/appless).)
- **`server/index.mjs`** — a tiny Express proxy. Its only job is to keep the Anthropic API key server-side and turn one line of natural language into a Space via structured output. **The key never reaches the browser.**
- **`src/`** — the React PWA: `Locus`, `SpaceView` → `Flow` → `Module`, and a `SpaceSwitcher` drawer.

### Real device APIs

- **Weather** Modules use `navigator.geolocation` + [Open-Meteo](https://open-meteo.com) (no key) for live weather.
- **Notes** and **checklists** persist to `localStorage`.
- iOS Safari doesn't expose contacts to web apps, so `message` Modules draft text you can copy or open in Messages.

## Run it

```bash
cp .env.example .env       # add your ANTHROPIC_API_KEY
npm install
npm run dev                # web on :5173, intent proxy on :8787
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the Express proxy.

Scripts:

- `npm run dev` — web + proxy together
- `npm run build` — production build (emits the PWA service worker)
- `npm run typecheck` — TypeScript check
- `npm run icons` — regenerate app icons

## Install on iOS

The app is a PWA. On a phone (over HTTPS — deploy the `dist/` build and run the proxy behind it, or use a tunnel for local testing):

1. Open the site in **Safari**
2. Share → **Add to Home Screen**
3. Launch from the icon — it runs full-screen, no browser chrome

> Geolocation needs a secure context. `localhost` counts in dev; in the field you need HTTPS.

## Design lineage

- **[TRIDENT OS](https://www.researchgate.net/publication/401657391_TRIDENT_OS_An_Intent-Based_Operating_Environment_for_Natural_Human-Computer_Interaction)** — intent engine as an orchestration layer over an existing OS (the pragmatic pattern).
- **[Mercury OS](https://uxdesign.cc/introducing-mercury-os-f4de45a04289)** — the Locus / Module / Flow / Space interaction grammar.
- **[AppLess](https://github.com/thesysdev/appless)** — one contract as the source of truth that generates the model's prompt; generative UI from intent.

## Limitations (MVP)

- Actions are *prepared*, not executed — the app drafts messages, checklists, and searches; you act. A real OS would route these to system intents.
- Intent parsing is cloud (Claude). A production phone build would add an on-device model for routing/privacy and reserve the cloud for hard intents.
- One renderer (web). No security/permission model beyond what the browser enforces.
