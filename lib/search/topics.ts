// ─────────────────────────────────────────────────────────────
// Topics for evidence rows. One Claude call per batch, once per item, reused while the item is unchanged.
// A podcast episode called "Pricing for Series A" supports pricing, fundraising, early-stage startups.
// The member never tags anything.
// ─────────────────────────────────────────────────────────────
import { callClaude, parseJSON } from "../claude";
import type { EvidenceRow } from "./evidence";

const BATCH = 40;

function prompt(items: { i: number; kind: string; title: string; body: string }[]) {
  return `You read items from a professional's storefront and name the topics each one is evidence of.

For each item return 2 to 6 topics. A topic is a short lowercase phrase a searcher might type: a field ("paid media", "organizational design"), an industry ("fintech", "natural products retail"), a stage ("series a", "pre-seed"), a situation ("first-time managers", "post-acquisition restructuring"), a kind of client ("small businesses", "founders"), or a skill shown by the item. Use the item's own words where they exist. Do not invent anything the item does not say. Do not return the person's name, dates, or generic words like "leadership" unless the item is specifically about them.

Items:
${items.map((it) => `#${it.i} [${it.kind}] ${it.title}${it.body ? ` — ${it.body.slice(0, 700)}` : ""}`).join("\n")}

Answer with JSON only, no prose: {"topics": {"<i>": ["topic", ...], ...}}`;
}

/** Fill `topics` on every row that needs them. Rows with fixedTopics or already-filled topics are left alone. */
export async function addTopics(rows: EvidenceRow[]): Promise<{ rows: EvidenceRow[]; calls: number; items: number }> {
  const need = rows.map((r, i) => ({ r, i })).filter(({ r }) => !r.fixedTopics && r.topics.length === 0 && (r.title || r.body));
  let calls = 0;
  for (let start = 0; start < need.length; start += BATCH) {
    const slice = need.slice(start, start + BATCH);
    const items = slice.map(({ r, i }) => ({ i, kind: r.kind.replace(/_/g, " "), title: r.title, body: r.body }));
    try {
      const raw = await callClaude(prompt(items), "haiku");
      calls += 1;
      const parsed = await parseJSON<{ topics?: Record<string, unknown> }>(raw);
      for (const { r, i } of slice) {
        const t = parsed.topics?.[String(i)];
        if (Array.isArray(t)) r.topics = Array.from(new Set(t.map((x) => String(x).toLowerCase().trim()).filter((x) => x && x.length <= 60))).slice(0, 8);
      }
    } catch (e) {
      // a failed batch leaves topics empty; the text search still works on the words, and the next index run retries
      console.error("search topics:", e);
    }
  }
  return { rows, calls, items: need.length };
}
