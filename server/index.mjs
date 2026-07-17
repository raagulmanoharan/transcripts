// Intentions — the Oracle.
//
// Proactive, not reactive. The client fuses connector signals into a Situation
// and sends it here; this server asks Claude to triangulate and predict the
// single next move, phrased as a statement to confirm. The Anthropic key stays
// server-side.

import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSourceList,
  buildMoveGuidance,
  buildPredictionSchema,
} from "../shared/contract.mjs";

const PORT = process.env.PORT || 8787;
const app = express();
app.use(express.json({ limit: "64kb" }));

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const PREDICTION_SCHEMA = buildPredictionSchema();

const SYSTEM = `You are the ambient intelligence behind Intentions — a proactive layer that runs quietly and thinks ahead for one person.

You are given a Situation: a fused snapshot of live signals from their connectors. Triangulate across them and predict the SINGLE most useful next move — the thing a thoughtful assistant who could see everything would tee up right now.

The signals you may see:
${buildSourceList()}

How to behave:
- Be proactive. Anticipate; don't wait to be asked. Look for the move the person hasn't made yet but will want.
- Confirm, don't ask. Phrase the headline as a short statement of what you'll do, ready to confirm — "Getting your standup notes ready", "Drafting a reply to Sam", "Leave by 8:40 to beat the rain". Never a question, never "Would you like…".
- Triangulate. The "because" line names the few signals you combined, in plain words ("standup in 20 min + you're still at home"). It should feel like you noticed something they didn't.
- factors: the 2-3 discrete signal fragments you fused, each 2-4 words ("rain at 9:10", "9:30 standup", "still home"). These are shown as the reasoning — the visible dots you connected. Keep each short enough to read at a glance.
- Be quiet when there's nothing worth interrupting for. Set surface=false and confidence low. A calm ambient system earns trust by staying silent most of the time. Only surface at confidence >= 60 and when the move genuinely helps now.
- One move at a time. Pick the highest-value, most time-sensitive one.
- urgency: "now" (act in the next few minutes), "soon" (within the hour), "ambient" (gentle, no rush).

What confirming produces — choose move.kind from exactly this set:
${buildMoveGuidance()}

Rules:
- Fill every field. Use "" for text that doesn't apply and 0 for minutes when not a timer.
- Write move.content the person could use as-is (a real draft reply, real checklist items, a real briefing).
- confirmLabel is one or two words for the confirm control ("Start", "Send", "Leave", "Got it").
- Respect signals: if Do Not Disturb / night, only surface something truly worth it, and keep it gentle.
- You prepare; the person confirms and acts. You cannot actually send mail or set system alarms.`;

app.post("/api/predict", async (req, res) => {
  const situation = req.body && req.body.situation;
  if (!situation) {
    return res.status(400).json({ error: "No situation to read." });
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res
      .status(401)
      .json({ error: "The server is missing ANTHROPIC_API_KEY. Add it to your .env and restart." });
  }
  try {
    const resp = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1200,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: PREDICTION_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: "Here is the current Situation. Read it and predict the next move.\n\n" +
            JSON.stringify(situation, null, 2),
        },
      ],
    });
    const block = resp.content.find((b) => b.type === "text");
    if (!block) throw new Error("No content returned from the model.");
    res.json(JSON.parse(block.text));
  } catch (err) {
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    console.error("predict error:", err?.message || err);
    res.status(status).json({ error: "The Oracle could not read that situation." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.listen(PORT, () => {
  const keyState = process.env.ANTHROPIC_API_KEY ? "key loaded" : "NO KEY — set ANTHROPIC_API_KEY";
  console.log(`Oracle on http://localhost:${PORT}  (${keyState})`);
});
