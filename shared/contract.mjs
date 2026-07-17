// The Contract — the single source of truth for the Module vocabulary.
//
// Borrowed from AppLess (thesysdev/appless): one contract defines every
// Module kind, and that same contract generates the LLM's system prompt AND
// the JSON schema it must fill. The client renderer switches on the same kinds.
// Because there is one definition, the model's vocabulary and the renderer's
// capabilities cannot drift apart.

/** Every Module kind, with the guidance the model reads to choose and fill it. */
export const MODULES = [
  {
    kind: "note",
    guidance:
      "something to write down or keep. Put a sensible starting draft in content.",
  },
  {
    kind: "weather",
    guidance:
      "the user wants weather. The client fetches live weather from the device location; leave content empty. Use modifier for a named place only if the user specified one.",
  },
  {
    kind: "timer",
    guidance: "a countdown. Set minutes to the number of minutes; put a label in content.",
  },
  {
    kind: "tasks",
    guidance: "a checklist. Put one task per line in content.",
  },
  {
    kind: "message",
    guidance:
      "a message to a person. Put the drafted message text in content and the recipient in item.",
  },
  {
    kind: "web",
    guidance:
      "something that needs the open web (current facts, links, shopping). Put a good search query in query; a one-line reason in content.",
  },
  {
    kind: "info",
    guidance:
      "a direct answer, explanation, or summary you can give right now. Put the answer in content.",
  },
];

export const MODULE_KINDS = MODULES.map((m) => m.kind);

/** The prompt fragment enumerating the kinds — derived from the contract. */
export function buildModuleGuidance() {
  return MODULES.map((m) => `- ${m.kind}: ${m.guidance}`).join("\n");
}

/** Every Module carries the same flat field set (noun/verb/modifier + payload).
 *  Keeping them uniform and all-required keeps structured output robust. */
const MODULE_PROPERTIES = {
  kind: { type: "string", enum: MODULE_KINDS },
  title: { type: "string" },
  subtitle: { type: "string" },
  item: { type: "string" },
  action: { type: "string" },
  modifier: { type: "string" },
  content: { type: "string" },
  minutes: { type: "integer" },
  query: { type: "string" },
};

/** The JSON schema the intent engine must fill — derived from the contract. */
export function buildSpaceSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      space: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
        },
        required: ["title", "subtitle"],
      },
      flows: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            modules: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: MODULE_PROPERTIES,
                required: Object.keys(MODULE_PROPERTIES),
              },
            },
          },
          required: ["title", "modules"],
        },
      },
    },
    required: ["space", "flows"],
  };
}
