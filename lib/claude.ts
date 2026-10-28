import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

type ClaudeModel = "sonnet" | "haiku" | "reader";

const MODEL_IDS: Record<ClaudeModel, string> = {
  // Sonnet — for the high-quality creative work (profile generation). Sonnet 4 was retired Oct 2026.
  sonnet: "claude-sonnet-5-5",
  // Haiku — ~3× faster, cheaper. Good enough for structured extraction (resume parse).
  haiku: "claude-haiku-4-5-20251001",
  // Reader — judgement over long lists of links (site scan).
  reader: "claude-sonnet-5-5",
};

export async function callClaude(
  prompt: string,
  model: ClaudeModel = "sonnet"
): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL_IDS[model],
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  // newer models can put a non-text block first; the answer is the first text block
  const block = message.content.find((b) => b.type === "text");
  if (block && block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type from Claude");
}

export async function parseJSON<T>(raw: string): Promise<T> {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}
