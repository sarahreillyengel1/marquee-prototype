// ─────────────────────────────────────────────────────────────
// claudex-loop — Claude ↔ ChatGPT review loop.
//
// Each round:  Claude's work → ChatGPT audits (strict JSON verdict)
//              → if not approved, Claude revises → repeat.
// Stops when ChatGPT approves or --rounds is hit. Never overwrites the
// source files: the final artifact goes to --out, the transcript to a log.
//
// Usage:
//   npx tsx scripts/claudex-loop.mts \
//     --task "Review the profile renderer for correctness + fidelity to PROFILE-ARCHITECTURE.md" \
//     --files "app/[username]/ProfileView.tsx,lib/builder-to-profile.ts" \
//     --spec PROFILE-ARCHITECTURE.md --rounds 3 --out .claudex/out.md
//
// Env (.env.local): OPENAI_API_KEY, ANTHROPIC_API_KEY
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// ── env ──
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const need = (k: string) => { const v = process.env[k]; if (!v) { console.error(`Missing ${k} in .env.local`); process.exit(1); } return v; };
const openai = new OpenAI({ apiKey: need("OPENAI_API_KEY") });
const anthropic = new Anthropic({ apiKey: need("ANTHROPIC_API_KEY") });

// ── args ──
const arg = (k: string, d = "") => { const i = process.argv.indexOf(`--${k}`); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const task = arg("task");
const files = arg("files").split(",").map((s) => s.trim()).filter(Boolean);
const spec = arg("spec");
const rounds = Math.max(1, parseInt(arg("rounds", "3"), 10));
const out = arg("out", ".claudex/out.md");
const reviewModel = arg("review-model", "gpt-4o");
const reviseModel = arg("revise-model", "claude-sonnet-5");
if (!task) { console.error("--task is required"); process.exit(1); }

const read = (p: string) => fs.existsSync(p) ? fs.readFileSync(p, "utf8") : `(missing: ${p})`;
const fileBlock = () => files.map((f) => `\n### FILE: ${f}\n\`\`\`\n${read(f)}\n\`\`\``).join("\n");
const specBlock = spec ? `\n### SPEC (source of truth): ${spec}\n${read(spec)}\n` : "";

// The "artifact" under review starts as Claude's existing work (the files).
let artifact = files.length ? fileBlock() : "(no files given — Claude will draft from the task)";
const log: string[] = [`# claudex-loop — ${new Date().toISOString()}`, `**Task:** ${task}`, `**Files:** ${files.join(", ") || "—"}`, `**Spec:** ${spec || "—"}`, ""];

// ── ChatGPT: strict reviewer ──
async function chatgptReview(round: number): Promise<{ approved: boolean; summary: string; issues: { severity: string; where: string; problem: string; fix: string }[] }> {
  const res = await openai.chat.completions.create({
    model: reviewModel,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `You are a rigorous, skeptical senior reviewer. You audit another AI's work for correctness, fidelity to the spec, integrity (no invented content, no unrequested changes), and quality. You never rubber-stamp. Approve ONLY if there are no material problems. Respond with STRICT JSON: {"approved": boolean, "summary": string, "issues": [{"severity": "blocker|major|minor", "where": string, "problem": string, "fix": string}]}` },
      { role: "user", content: `TASK:\n${task}\n${specBlock}\nWORK UNDER REVIEW (round ${round}):\n${artifact}\n\nAudit it. Be specific and concrete. Cite exact locations.` },
    ],
  });
  const txt = res.choices[0]?.message?.content ?? "{}";
  try { return JSON.parse(txt); } catch { return { approved: false, summary: "Reviewer returned non-JSON", issues: [{ severity: "major", where: "reviewer", problem: txt.slice(0, 400), fix: "retry" }] }; }
}

// ── Claude: reviser ──
async function claudeRevise(review: Awaited<ReturnType<typeof chatgptReview>>): Promise<string> {
  const msg = await anthropic.messages.create({
    model: reviseModel,
    max_tokens: 8000,
    system: `You are a careful senior engineer revising your own work in response to an independent review. Fix every blocker and major issue precisely. Do NOT invent content, do NOT make unrequested changes, do NOT restyle. Preserve the original structure and intent. Return the COMPLETE revised artifact in the same format you received it (same ### FILE blocks and fences), followed by a short "### CHANGES" list explaining what you fixed and why.`,
    messages: [{ role: "user", content: `TASK:\n${task}\n${specBlock}\nCURRENT WORK:\n${artifact}\n\nINDEPENDENT REVIEW (address it):\n${JSON.stringify(review, null, 2)}` }],
  });
  return msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n");
}

// ── loop ──
(async () => {
  for (let r = 1; r <= rounds; r++) {
    process.stdout.write(`\n── Round ${r}/${rounds} · ChatGPT reviewing… `);
    const review = await chatgptReview(r);
    console.log(review.approved ? "APPROVED ✓" : `${review.issues.length} issue(s)`);
    log.push(`## Round ${r} — ChatGPT review`, `**Approved:** ${review.approved}`, `**Summary:** ${review.summary}`, ...review.issues.map((i) => `- **[${i.severity}]** ${i.where} — ${i.problem}\n  ↳ fix: ${i.fix}`), "");
    if (review.approved) { log.push(`✅ Approved by ChatGPT on round ${r}.`); break; }
    if (r === rounds) { log.push(`⚠️ Hit round limit (${rounds}) without approval.`); break; }
    process.stdout.write(`   Claude revising… `);
    artifact = await claudeRevise(review);
    console.log("done");
    log.push(`## Round ${r} — Claude revision`, artifact, "");
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, artifact);
  const logPath = out.replace(/\.md$/, "") + ".log.md";
  fs.writeFileSync(logPath, log.join("\n"));
  console.log(`\nFinal artifact → ${out}\nTranscript     → ${logPath}\n(Source files were NOT modified — review the artifact, then apply.)`);
})().catch((e) => { console.error("claudex-loop failed:", e?.message ?? e); process.exit(1); });
