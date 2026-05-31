import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

type ClaudeModel = "sonnet" | "haiku";

const MODEL_IDS: Record<ClaudeModel, string> = {
  // Sonnet — for the high-quality creative work (profile generation)
  sonnet: "claude-sonnet-4-20250514",
  // Haiku — ~3× faster, cheaper. Good enough for structured extraction (resume parse).
  haiku: "claude-haiku-4-5-20251001",
};

export async function callClaude(
  prompt: string,
  model: ClaudeModel = "sonnet"
): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL_IDS[model],
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
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
