"use client";

import { useEffect, useState } from "react";
import {
  QUESTIONS,
  PROFILE_TYPES,
  INTRO,
  type BlueprintQuestion,
  type QOption,
} from "@/lib/blueprint/questions";
import type { BlueprintResult } from "@/lib/blueprint/engine";
import Results from "./Results";

// Brand rules applied (BRAND.md): 0px square corners everywhere; Wine #670821
// is the hero accent; Poppins for headings/labels, Inter for body.

type Answers = Record<string, any>;

export default function BlueprintFlow() {
  const [stage, setStage] = useState<"intro" | "questions" | "capture" | "saved" | "generating" | "results" | "error">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<BlueprintResult | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);

  // ── Signup gate: capture first/last/email at "get results" and "save & finish later" ──
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<"results" | "save">("results");
  const [lead, setLead] = useState({ first_name: "", last_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [leadErr, setLeadErr] = useState<string | null>(null);

  async function generate(idArg?: string | null) {
    const sid = idArg !== undefined ? idArg : sessionId;
    setStage("generating");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sid, answers }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setResult(data.result);
      setShareId(data.id ?? null);
      setStage("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStage("error");
    }
  }

  // Save the lead (→ waitlist source=blueprint + in-progress session), then either
  // generate into that session ("results") or confirm ("save"). Never blocks on a
  // failed save — the user always moves forward.
  async function submitLead() {
    const email = lead.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLeadErr("Please enter a valid email."); return; }
    setLeadErr(null);
    setSubmitting(true);
    let id: string | null = sessionId;
    try {
      const res = await fetch("/api/blueprint/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, first_name: lead.first_name, last_name: lead.last_name, email, answers, current_step: currentQ }),
      });
      if (res.ok) { const d = await res.json(); id = d.id ?? id; setSessionId(id); }
    } catch { /* proceed regardless */ }
    setSubmitting(false);
    if (captureMode === "results") generate(id);
    else setStage("saved");
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blueprintAnswers");
      const savedQ = localStorage.getItem("blueprintQ");
      if (saved) setAnswers(JSON.parse(saved));
      if (savedQ) {
        const n = parseInt(savedQ, 10) || 0;
        // Clamp to a valid index — a saved position can outrun the question
        // list if questions were removed since the answers were stored.
        setCurrentQ(Math.max(0, Math.min(n, QUESTIONS.length - 1)));
      }
    } catch {}
    setHydrated(true);
  }, []);

  function saveAnswer(id: string, val: any) {
    const next = { ...answers, [id]: val };
    setAnswers(next);
    try { localStorage.setItem("blueprintAnswers", JSON.stringify(next)); } catch {}
  }
  function goToQ(n: number) {
    setCurrentQ(n);
    try { localStorage.setItem("blueprintQ", String(n)); } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleMulti(id: string, val: string, max?: number) {
    const cur: string[] = answers[id] || [];
    if (cur.includes(val)) saveAnswer(id, cur.filter((v) => v !== val));
    else if (!max || cur.length < max) saveAnswer(id, [...cur, val]);
  }
  function toggleMatrix(id: string, row: string, col: "today" | "future") {
    const cur = { ...(answers[id] || {}) };
    const key = `${row}-${col}`;
    if (cur[key]) delete cur[key];
    else cur[key] = true;
    saveAnswer(id, cur);
  }

  if (!hydrated) return null;

  // ── INTRO ──
  if (stage === "intro") {
    return (
      <div className="max-w-[700px] mx-auto py-6 md:py-10">
        <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dred mb-4">
          Free · {QUESTIONS.length} questions
        </span>
        <h1 className="font-lora font-normal text-5xl md:text-6xl text-ink leading-[1.04] tracking-[-0.01em]">
          {INTRO.title}
        </h1>
        <p className="font-lora font-normal text-2xl md:text-[26px] text-ink/60 mt-4 leading-[1.3]">
          {INTRO.subtitle}
        </p>
        <p className="font-inter text-ink/70 mt-6 leading-relaxed">{INTRO.body}</p>

        <div className="bg-white border border-hair p-6 md:p-7 mt-9">
          <div className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45 mb-5">
            {INTRO.eyebrow}
          </div>
          <div className="space-y-4">
            {INTRO.items.map((it) => (
              <div key={it.title} className="flex gap-3.5">
                <div className="text-2xl leading-none shrink-0">{it.icon}</div>
                <div>
                  <div className="font-sans font-semibold text-ink text-[15px]">{it.title}</div>
                  <div className="font-inter text-sm text-ink/60 leading-relaxed mt-0.5">{it.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { goToQ(currentQ || 0); setStage("questions"); }}
          className="w-full mt-8 bg-ink text-white font-sans font-semibold py-4 hover:bg-black transition-colors"
        >
          {currentQ > 0 ? "Resume the Blueprint →" : "Start the Blueprint →"}
        </button>
      </div>
    );
  }

  // ── CAPTURE (signup gate: get results / save & finish later) ──
  if (stage === "capture") {
    const forResults = captureMode === "results";
    return (
      <div className="max-w-[520px] mx-auto py-12 md:py-16">
        <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dred mb-4">
          {forResults ? "Last step" : "Save your progress"}
        </span>
        <h1 className="font-lora font-normal text-4xl md:text-5xl text-ink leading-[1.08]">
          {forResults ? "Where should we send your Blueprint?" : "Save it for later."}
        </h1>
        <p className="font-inter text-ink/70 mt-5 leading-relaxed">
          {forResults
            ? "Your Blueprint is ready. Add your details and we’ll build it right now — it opens on the very next screen (about a minute to generate)."
            : "Enter your details and we’ll save your progress, so you can pick up right where you left off."}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <input value={lead.first_name} onChange={(e) => setLead({ ...lead, first_name: e.target.value })} placeholder="First name"
            className="border border-hair px-4 py-3.5 font-inter text-ink placeholder:text-ink/40 focus:border-ink outline-none" />
          <input value={lead.last_name} onChange={(e) => setLead({ ...lead, last_name: e.target.value })} placeholder="Last name"
            className="border border-hair px-4 py-3.5 font-inter text-ink placeholder:text-ink/40 focus:border-ink outline-none" />
        </div>
        <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} type="email" placeholder="you@email.com"
          className="mt-4 w-full border border-hair px-4 py-3.5 font-inter text-ink placeholder:text-ink/40 focus:border-ink outline-none" />
        {leadErr && <p className="font-inter text-sm text-dred mt-3">{leadErr}</p>}
        <button disabled={submitting} onClick={submitLead}
          className="mt-6 w-full bg-ink text-white font-sans font-semibold py-4 hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? "Saving…" : forResults ? "Build my Blueprint →" : "Save my progress →"}
        </button>
        <button onClick={() => setStage("questions")}
          className="block mx-auto mt-5 font-sans text-[12px] text-ink/50 hover:text-dred underline underline-offset-4">
          {forResults ? "← Back to questions" : "← Keep going"}
        </button>
      </div>
    );
  }

  // ── SAVED (confirmation for "save & finish later") ──
  if (stage === "saved") {
    return (
      <div className="max-w-[520px] mx-auto py-16 text-center">
        <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dred mb-4">Saved</span>
        <h1 className="font-lora font-normal text-4xl md:text-5xl text-ink leading-[1.08]">You&apos;re saved.</h1>
        <p className="font-inter text-ink/70 mt-5 leading-relaxed">
          You&apos;re on the list, and your answers are saved on this device — pick up right where you left off, anytime.
        </p>
        <button onClick={() => setStage("questions")}
          className="mt-8 bg-ink text-white font-sans font-semibold px-8 py-4 hover:bg-black transition-colors">
          Keep going &rarr;
        </button>
      </div>
    );
  }

  // ── GENERATING ──
  if (stage === "generating") {
    return (
      <div className="max-w-[640px] mx-auto py-16 text-center">
        <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dred mb-4">
          Building your Blueprint
        </span>
        <h1 className="font-lora font-normal text-4xl md:text-5xl text-ink leading-[1.08]">
          Reading your answers,<br />researching, and writing.
        </h1>
        <p className="font-inter text-ink/70 mt-6 leading-relaxed">
          This takes up to a minute — we research the people you admire and tailor every
          recommendation to what you told us. Hang tight.
        </p>
        <div className="mt-10 h-[3px] w-full bg-beige overflow-hidden">
          <div className="h-full w-1/3 bg-dred bp-indeterminate" />
        </div>
        <style>{`@keyframes bpslide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}.bp-indeterminate{animation:bpslide 1.3s ease-in-out infinite}`}</style>
      </div>
    );
  }

  // ── ERROR ──
  if (stage === "error") {
    return (
      <div className="max-w-[640px] mx-auto py-16 text-center">
        <h1 className="font-lora font-normal text-4xl text-ink leading-[1.08]">
          That didn&apos;t go through.
        </h1>
        <p className="font-inter text-ink/70 mt-5 leading-relaxed">
          The Blueprint couldn&apos;t be generated just now. Your answers are still saved — try again.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button onClick={() => setStage("questions")} className="border border-hair text-ink font-sans font-semibold px-7 py-3.5 hover:border-ink transition-colors">
            Back
          </button>
          <button onClick={() => generate()} className="bg-ink text-white font-sans font-semibold px-7 py-3.5 hover:bg-black transition-colors">
            Try again →
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (stage === "results" && result) {
    return (
      <Results
        result={result}
        shareId={shareId}
        onRestart={() => { setAnswers({}); setResult(null); setShareId(null); try { localStorage.clear(); } catch {} goToQ(0); setStage("intro"); }}
      />
    );
  }

  // ── QUESTIONS ──
  const q = QUESTIONS[currentQ];
  const progress = Math.round(((currentQ + 1) / QUESTIONS.length) * 100);
  const answered = isAnswered(q, answers[q.id]);

  return (
    <div className="max-w-[700px] mx-auto py-6 md:py-10">
      <div className="flex items-center justify-between font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
        <span className="text-dred">{q.cat}</span>
        <span>{currentQ + 1} of {QUESTIONS.length}</span>
      </div>
      <div className="w-full h-[3px] bg-beige mt-2 mb-9 overflow-hidden">
        <div className="h-full bg-dred transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="font-lora font-normal text-[28px] md:text-[34px] text-ink leading-[1.15] tracking-[-0.01em]">
        {q.prompt}
      </h2>
      {q.maxSelect && (q.type === "multi" || q.type === "profiletype") ? (
        <p className="font-inter text-sm text-ink/55 mt-2">Choose up to {q.maxSelect}</p>
      ) : null}

      <div className="mt-7">
        <Field q={q} value={answers[q.id]} save={saveAnswer} toggleMulti={toggleMulti} toggleMatrix={toggleMatrix} />
      </div>

      <div className="flex gap-4 mt-10">
        <button
          onClick={() => { if (currentQ > 0) goToQ(currentQ - 1); else setStage("intro"); }}
          className="flex-1 border border-hair text-ink font-sans font-semibold py-3.5 hover:border-ink transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={!answered}
          onClick={() => { if (currentQ < QUESTIONS.length - 1) goToQ(currentQ + 1); else { setCaptureMode("results"); setStage("capture"); } }}
          className="flex-1 bg-ink text-white font-sans font-semibold py-3.5 hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentQ === QUESTIONS.length - 1 ? "Get my Blueprint →" : "Next →"}
        </button>
      </div>

      <button
        onClick={() => { setCaptureMode("save"); setStage("capture"); }}
        className="block mx-auto mt-7 font-sans text-[12px] text-ink/45 hover:text-dred underline underline-offset-4"
      >
        Save &amp; finish later
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function isAnswered(q: BlueprintQuestion, v: any): boolean {
  if (q.type === "matrix") return v && Object.keys(v).length > 0;
  if (q.type === "peoplelist") return Array.isArray(v) && v.some((p: any) => p?.name?.trim());
  if (Array.isArray(v)) return v.length > 0;
  if (q.type === "slider") return v !== undefined && v !== null;
  return v !== undefined && v !== null && String(v).trim() !== "";
}

function optLabel(o: QOption): string { return typeof o === "string" ? o : o.label; }
function optDesc(o: QOption): string | undefined { return typeof o === "string" ? undefined : o.desc; }

function Field({
  q, value, save, toggleMulti, toggleMatrix,
}: {
  q: BlueprintQuestion;
  value: any;
  save: (id: string, v: any) => void;
  toggleMulti: (id: string, v: string, max?: number) => void;
  toggleMatrix: (id: string, row: string, col: "today" | "future") => void;
}) {
  switch (q.type) {
    case "text":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => save(q.id, e.target.value)}
          placeholder="Your answer here…"
          rows={4}
          className="w-full border-2 border-hair bg-white p-4 font-inter text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink resize-y leading-relaxed"
        />
      );

    case "slider": {
      const set = value !== undefined && value !== null;
      const val = set ? value : q.min ?? 0;
      return (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-lora font-normal text-4xl text-ink">{set ? val : "—"}</span>
            <span className="font-inter text-ink/50">{val >= (q.max ?? 40) ? `${q.unit ?? ""}+`.trim() : q.unit}</span>
          </div>
          <input
            type="range"
            min={q.min ?? 0}
            max={q.max ?? 40}
            step={q.step ?? 1}
            value={val}
            onChange={(e) => save(q.id, Number(e.target.value))}
            className="w-full accent-[#670821] h-1.5 cursor-pointer"
          />
          <div className="flex justify-between font-inter text-xs text-ink/40 mt-2">
            <span>{q.min ?? 0}</span>
            <span>{q.max ?? 40}+</span>
          </div>
          {!set && <p className="font-inter text-sm text-ink/45 mt-3">Drag to set</p>}
        </div>
      );
    }

    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => save(q.id, e.target.value)}
          className="w-full border-2 border-hair bg-white p-4 font-inter text-base text-ink focus:outline-none focus:border-ink appearance-none cursor-pointer"
        >
          <option value="" disabled>Select an industry…</option>
          {(q.options || []).map((o) => (
            <option key={optLabel(o)} value={optLabel(o)}>{optLabel(o)}</option>
          ))}
        </select>
      );

    case "single":
      return (
        <div className="flex flex-col gap-3">
          {(q.options || []).map((o) => {
            const label = optLabel(o), desc = optDesc(o);
            const selected = value === label;
            return (
              <OptionCard key={label} selected={selected} onClick={() => save(q.id, label)} label={label} desc={desc} />
            );
          })}
        </div>
      );

    case "multi":
      return (
        <div className="flex flex-col gap-3">
          {(q.options || []).map((o) => {
            const label = optLabel(o), desc = optDesc(o);
            const arr: string[] = value || [];
            const selected = arr.includes(label);
            const disabled = !selected && !!q.maxSelect && arr.length >= q.maxSelect;
            return (
              <OptionCard
                key={label} selected={selected} disabled={disabled} checkbox
                onClick={() => toggleMulti(q.id, label, q.maxSelect)}
                label={label} desc={desc}
              />
            );
          })}
        </div>
      );

    case "profiletype":
      return (
        <div className="flex flex-col gap-3">
          {PROFILE_TYPES.map((t) => {
            const arr: string[] = value || [];
            const selected = arr.includes(t.id);
            const disabled = !selected && !!q.maxSelect && arr.length >= q.maxSelect;
            return (
              <OptionCard
                key={t.id} selected={selected} disabled={disabled} checkbox
                onClick={() => toggleMulti(q.id, t.id, q.maxSelect)}
                label={t.label} desc={t.oneLiner}
              />
            );
          })}
        </div>
      );

    case "peoplelist": {
      const arr: { name: string; why: string }[] = value || [];
      const slots = q.maxSelect || 3;
      function update(i: number, field: "name" | "why", v: string) {
        const next = Array.from({ length: slots }, (_, k) => arr[k] || { name: "", why: "" });
        next[i] = { ...next[i], [field]: v };
        save(q.id, next);
      }
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} className="border-2 border-hair bg-white p-4">
              <div className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40 mb-3">
                Person {i + 1}
              </div>
              <input
                value={arr[i]?.name || ""}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Name or @handle"
                className="w-full border-2 border-hair bg-white p-3 font-inter text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink mb-2"
              />
              <input
                value={arr[i]?.why || ""}
                onChange={(e) => update(i, "why", e.target.value)}
                placeholder="Why they inspire you"
                className="w-full border-2 border-hair bg-white p-3 font-inter text-base text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
              />
            </div>
          ))}
        </div>
      );
    }

    case "matrix": {
      const val = value || {};
      return (
        <div className="border-2 border-hair">
          <div className="grid grid-cols-[1fr_64px_64px] items-center bg-white border-b-2 border-hair px-4 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-ink/50">
            <span>{q.matrixHeader}</span>
            <span className="text-center">Today</span>
            <span className="text-center">Future</span>
          </div>
          {(q.matrixRows || []).map((row, i) => (
            <div key={row} className={`grid grid-cols-[1fr_64px_64px] items-center px-4 py-2.5 ${i % 2 ? "bg-white/50" : ""}`}>
              <span className="font-inter text-sm text-ink">{row}</span>
              <MatrixCell active={!!val[`${row}-today`]} mark="✓" onClick={() => toggleMatrix(q.id, row, "today")} />
              <MatrixCell active={!!val[`${row}-future`]} mark="☆" onClick={() => toggleMatrix(q.id, row, "future")} />
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

function OptionCard({
  label, desc, selected, disabled, checkbox, onClick,
}: {
  label: string;
  desc?: string;
  selected: boolean;
  disabled?: boolean;
  checkbox?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full text-left p-4 border-2 bg-white transition-colors flex gap-3",
        selected ? "border-dred bg-dred/[0.04]" : "border-hair hover:border-ink/40",
        disabled ? "opacity-35 cursor-not-allowed hover:border-hair" : "",
      ].join(" ")}
    >
      {checkbox && (
        <span
          className={[
            "mt-0.5 shrink-0 w-5 h-5 grid place-items-center text-white text-xs",
            selected ? "bg-dred" : "border-2 border-hair",
          ].join(" ")}
        >
          {selected ? "✓" : ""}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-sans font-semibold text-ink leading-snug">{label}</span>
        {desc && <span className="block font-inter text-sm text-ink/60 leading-relaxed mt-1">{desc}</span>}
      </span>
    </button>
  );
}

function MatrixCell({ active, mark, onClick }: { active: boolean; mark: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "w-10 h-10 mx-auto grid place-items-center text-lg transition-colors",
        active ? "bg-dred text-white" : "text-ink/25 hover:bg-beige/60",
      ].join(" ")}
    >
      {active ? mark : "○"}
    </button>
  );
}
