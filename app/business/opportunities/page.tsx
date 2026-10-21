"use client";
// marquee.bio/business/opportunities: a business account's own opportunities. Status, edit, close, post another.
import { useEffect, useState } from "react";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import { TYPE_LABEL, REQUIRE_LABEL, BETA_POST_LIMIT, payLabel, type Opportunity } from "@/lib/opportunities";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const STATUS: Record<string, [string, string]> = { draft: ["In review", "bg-[#EDE7FF] text-ink"], published: ["Live", "bg-dred text-white"], paused: ["Paused", "bg-beige text-ink"], closed: ["Closed", "bg-beige text-ink/60"] };

export default function MyOpportunities() {
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [state, setState] = useState<"loading" | "out" | "ok">("loading");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await fetch("/api/business/opportunities").catch(() => null);
    if (!r || r.status === 401) { setState("out"); return; }
    const j = await r.json().catch(() => ({}));
    setRows(j.rows || []); setCompany(j.company || ""); setState("ok");
  };
  useEffect(() => { load(); }, []);
  const close = async (o: Opportunity) => {
    if (!confirm(`Close "${o.title}"? It comes off the board and can't be reopened.`)) return;
    const r = await fetch("/api/business/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "close", id: o.id }) });
    setNote(r.ok ? "Closed." : "Couldn't close it."); load();
  };
  const open = rows.filter((r) => r.status !== "closed").length;

  return (
    <BrandShell source="business">
      <section className="bg-blue"><div className={`${WRAP} py-[clamp(28px,4vw,44px)]`}>
        <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred">For businesses</div>
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(28px,4.5vw,44px)] mt-2">Your opportunities{company ? ` at ${company}` : ""}.</h1>
        <p className="text-[14.5px] text-ink/75 mt-2">Every opportunity is reviewed before it goes live. {open} of {BETA_POST_LIMIT} open during the beta.</p>
      </div></section>
      <section className="bg-paper"><div className={`${WRAP} py-10`}>
        {state === "loading" && <div className="text-[14px] text-ink/60">Loading…</div>}
        {state === "out" && <div className="bg-white border border-hair rounded-[14px] p-8 text-[15px]">Sign in to see your opportunities. <Link href="/login?next=/business/opportunities" className="underline underline-offset-2 hover:text-dred">Sign in</Link> or <Link href="/business/join" className="underline underline-offset-2 hover:text-dred">create a business account</Link>.</div>}
        {state === "ok" && (
          <>
            {note && <div className="text-[13.5px] mb-4">{note}</div>}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="text-[14px]"><b>{rows.length}</b> {rows.length === 1 ? "opportunity" : "opportunities"}</div>
              {open < BETA_POST_LIMIT && <Link href="/opportunities/post" className="text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-5 py-[10px] hover:bg-red transition-colors">Post an opportunity</Link>}
            </div>
            {rows.length === 0 && <div className="bg-white border border-hair rounded-[14px] p-8 text-[15px] text-ink/70">Nothing posted yet. <Link href="/opportunities/post" className="underline underline-offset-2 text-ink hover:text-dred">Post your first opportunity</Link>.</div>}
            <div className="grid gap-3">
              {rows.map((o) => {
                const [label, cls] = STATUS[o.status] || STATUS.draft;
                return (
                  <article key={o.id} className="bg-white border border-hair rounded-[14px] p-5 sm:p-6 flex flex-wrap gap-4 items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="text-[17.5px] font-semibold leading-[1.25]">{o.title}</h2><span className={`text-[10.5px] font-bold tracking-[0.12em] uppercase rounded-full px-[9px] py-[3px] ${cls}`}>{label}</span></div>
                      <div className="text-[14px] text-ink/70 mt-[3px]">{TYPE_LABEL[o.work_type]}{o.location ? ` · ${o.location}` : ""}{payLabel(o) ? ` · ${payLabel(o)}` : ""} · {REQUIRE_LABEL[o.require_marquee || "optional"]}</div>
                      {o.status === "published" && <a href={`/opportunities/${o.slug}`} target="_blank" rel="noopener" className="text-[13px] underline underline-offset-2 hover:text-dred mt-1 inline-block">marquee.bio/opportunities/{o.slug}</a>}
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-semibold">
                      {o.status !== "closed" && <Link href={`/opportunities/post?id=${o.id}`} className="border border-ink rounded-full px-4 py-[8px] hover:bg-ink hover:text-white transition-colors">Edit</Link>}
                      {o.status !== "closed" && <button type="button" onClick={() => close(o)} className="underline underline-offset-2 text-ink/70 hover:text-dred">Close</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div></section>
    </BrandShell>
  );
}
