// Intentions — intent proxy.
//
// The one job of this server is to keep the Anthropic API key server-side and
// turn a line of natural language into a structured "Space" the web app can
// render. The web app never sees the key.

import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { buildModuleGuidance, buildSpaceSchema } from "../shared/contract.mjs";

const PORT = process.env.PORT || 8787;
const app = express();
app.use(express.json({ limit: "64kb" }));

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

// The interaction grammar, borrowed from Mercury OS and given a real engine:
//   Locus (this request)  ->  intent
//   Module                ->  content + action, rendered on demand
//   Flow                  ->  an ordered row/stack of Modules for one task
//   Space                 ->  the Flows that fulfil one overarching intent
//
// A Module's kind selects a renderer on the client. `item` (noun) + `action`
// (verb) + `modifier` (context) is the noun-verb-modifier intent schema.
const SPACE_SCHEMA = buildSpaceSchema();

const SYSTEM = `You are the intent engine of Intentions, an intent-based operating environment for a phone.

The user declares what they want in natural language. You translate that intent into a Space: a set of Flows, each a short ordered stack of Modules. A Module is a small unit of content-and-action, rendered on demand. This replaces launching apps — the user states a goal and the interface assembles itself.

Model every Module with the noun-verb-modifier grammar:
- item: the noun the Module is about (e.g. "Sarah", "Tokyo trip", "groceries")
- action: the verb the user wants (e.g. "reply", "plan", "remember")
- modifier: the context (e.g. "before 5pm", "this weekend", "")

Choose each Module's kind from exactly this set:
${buildModuleGuidance()}

Rules:
- Keep it tight: 1-3 Flows, each with 1-4 Modules. Prefer fewer, well-chosen Modules over many.
- One intent in focus. Do not invent unrelated Modules.
- Always fill every field. Use "" for text that does not apply and 0 for minutes when not a timer.
- Write content the user could use as-is (real draft text, real checklist items, a real answer).
- Titles are short and human (2-5 words). The space.subtitle restates the intent in a few words.
- You cannot actually send messages, set system alarms, or read the user's private data. Draft and prepare; the user acts.`;

app.post("/api/intent", async (req, res) => {
  const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
  if (!text) {
    return res.status(400).json({ error: "Say what you want to do." });
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res
      .status(401)
      .json({ error: "The server is missing ANTHROPIC_API_KEY. Add it to your .env and restart." });
  }
  try {
    const resp = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SPACE_SCHEMA },
      },
      messages: [{ role: "user", content: text }],
    });
    const block = resp.content.find((b) => b.type === "text");
    if (!block) throw new Error("No content returned from the model.");
    const data = JSON.parse(block.text);
    res.json(data);
  } catch (err) {
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    console.error("intent error:", err?.message || err);
    res.status(status).json({
      error:
        status === 401
          ? "The server is missing or has an invalid ANTHROPIC_API_KEY."
          : "Could not read that intent. Try rephrasing.",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.listen(PORT, () => {
  const keyState = process.env.ANTHROPIC_API_KEY ? "key loaded" : "NO KEY — set ANTHROPIC_API_KEY";
  console.log(`intent proxy on http://localhost:${PORT}  (${keyState})`);
});
