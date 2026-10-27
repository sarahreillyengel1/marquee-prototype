"use client";
// Marquee team only: the search index behind Find an Expert. Counts, a backfill button, and one member's evidence list.

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = { id: number; kind: string; username: string | null; opportunity_id: number | null; title: string; subtitle: string; evidence_count: number; published_at: string | null; indexed_at: string };
type Counts = { professionals: number; opportunities: number; evidence: number; hidden: number; byKind: Record<string, number>; publishedProfiles: number; publishedOpportunities: number };
type Evidence = { kind: string; page: string; item_id: string | null; title: string; body: string; date_text: string | null; source: string | null; url: string | null; topics: string[]; hidden: boolean; weight: number };
type Member = { username: string; row: { title: string; subtitle: string; facets: Record<string, unknown>; private_facets: Record<string, unknown>; card: Record<string, unknown>; indexed_at: string; evidence_count: number } | null; evidence: Evidence[] };

const KIND: Record<string, string> = { did_it: "Did it", got_results: "Got results", taught_it: "Taught it", wrote_or_spoke: "Wrote or spoke about it", was_asked: "Was asked to", others_say: "Others say so", has_audience: "Has an audience", credential: "Credential", offer: "Offer", claim: "Claim" };
const PAGE: Record<string, string> = { profile: "Profile home", experience: "Experience", media: "Media", shop: "Shop", workwith: "Work with Me", testimonials: "Testimonials", reach: "Reach", education: "Education" };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");
const Stat = ({ n, t, s }: { n: string | number; t: string; s?: string }) => <div className="bg-white border border-[#E1DED7] p-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">{t}</div><div className="font-lora text-[34px] leading-none mt-[10px] mb-1">{n}</div>{s && <div className="text-[12.5px] text-[#6E6A62]">{s}</div>}</div>;

export default function SearchAdmin() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ok" | "missing">("loading");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [who, setWho] = useState("");
  const [member, setMember] = useState<Member | null>(null);

  const load = () => fetch("/api/admin/search").then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (r.status === 404) { setState("denied"); return; }
    if (!r.ok) { setState("missing"); setNote(j.error || "Couldn't load."); return; }
    setCounts(j.counts); setRows(j.rows || []); setState("ok");
  }).catch(() => setState("denied"));
  useEffect(() => { load(); }, []);

  const backfill = async () => {
    if (!window.confirm("Index every published page and every live opportunity now? Unchanged items reuse their topics; new ones go to Claude.")) return;
    setBusy("backfill"); setNote("");
    const r = await fetch("/api/admin/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "backfill" }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { setNote(j.error || "That didn't work."); return; }
    const calls = (j.profiles || []).reduce((n: number, p: { topicsCalls: number }) => n + (p.topicsCalls || 0), 0);
    setNote(`${(j.profiles || []).length} professionals and ${j.opportunities} opportunities indexed. ${calls} Claude call${calls === 1 ? "" : "s"}.${j.failed?.length ? ` Failed: ${j.failed.join(", ")}.` : ""}`);
    load();
  };
  const show = async (u: string) => {
    const name = u.trim().toLowerCase(); if (!name) return;
    setBusy("show"); setMember(null);
    const r = await fetch(`/api/admin/search?username=${encodeURIComponent(name)}`);
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { setNote(j.error || "Couldn't load."); return; }
    setMember(j); setWho(name);
  };
  const reindex = async (u: string) => {
    setBusy("re" + u); setNote("");
    const r = await fetch("/api/admin/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reindex", username: u }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { setNote(j.error || "That didn't work."); return; }
    const p = j.profiles?.[0];
    setNote(p ? `${u}: ${p.evidence} evidence rows, ${p.reused} reused, ${p.topicsItems} sent to Claude.` : `${u} indexed.`);
    load(); if (who === u) show(u);
  };

  if (state === "loading") return <main className="min-h-screen bg-brand-paper font-inter p-10 text-[#6E6A62]">Loading…</main>;
  if (state === "denied") return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">Nothing here.</h1><p className="text-[14.5px] text-[#3a352f]">This page is for the Marquee team. <Link href="/login" className="underline">Sign in</Link> with a team account.</p></main>;

  const th = "text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] py-[10px] pr-4 border-b border-[#E1DED7] whitespace-nowrap";
  const td = "py-[11px] pr-4 border-b border-[#F1EEE8] text-[13.5px] align-top";
  const pros = rows.filter((r) => r.kind === "professional");

  return (
    <main className="min-h-screen bg-brand-paper font-inter p-6 sm:p-10 max-w-[1180px]">
      <div className="flex items-baseline gap-4 flex-wrap mb-6">
        <h1 className="font-lora text-[30px]">Search index</h1>
        <Link href="/admin" className="text-[13px] underline text-[#6E6A62]">Admin home</Link>
        <Link href="/admin/opportunities" className="text-[13px] underline text-[#6E6A62]">Opportunities</Link>
      </div>
      <p className="text-[14px] text-[#3a352f] max-w-[72ch] mb-5">What Find an Expert reads. One row per published page and per live opportunity, and one evidence row per role, result, course, newsletter, talk, board seat or testimonial, with the topics it supports. A page is indexed when its member publishes; this backfill covers everything already live.</p>

      {state === "missing" && <div className="bg-white border border-[#E1DED7] p-4 text-[13.5px] mb-5">{note}</div>}

      {counts && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat n={counts.professionals} t="Professionals indexed" s={`${counts.publishedProfiles} published`} />
        <Stat n={counts.opportunities} t="Opportunities indexed" s={`${counts.publishedOpportunities} live`} />
        <Stat n={counts.evidence} t="Evidence rows" s={`${counts.hidden} from hidden sections`} />
        <Stat n={Object.entries(counts.byKind).filter(([k]) => k !== "claim" && k !== "offer").reduce((n, [, c]) => n + c, 0)} t="Pieces of real evidence" s="not claims or offers" />
      </div>}

      {counts && <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[#6E6A62] mb-5">{Object.entries(counts.byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => <span key={k}><b className="text-brand-ink">{n}</b> {KIND[k] || k}</span>)}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={backfill} disabled={!!busy} className="bg-brand-ink text-white text-[13px] font-medium py-[10px] px-4 disabled:opacity-50">{busy === "backfill" ? "Indexing…" : "Index everything now"}</button>
        <form onSubmit={(e) => { e.preventDefault(); show(who); }} className="flex items-center gap-2">
          <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="username" className="border border-[#E1DED7] bg-white px-3 py-[9px] text-[13.5px] w-[220px]" />
          <button className="border border-brand-ink text-[13px] font-medium py-[9px] px-4 bg-white" disabled={!!busy}>Show evidence</button>
        </form>
        {note && <span className="text-[13px] text-[#3a352f]">{note}</span>}
      </div>

      {member && <section className="bg-white border border-[#E1DED7] p-5 mb-8">
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <h2 className="font-lora text-[22px]">{member.row?.title || member.username}</h2>
          <span className="text-[13px] text-[#6E6A62]">{member.row?.subtitle}</span>
          <Link href={`/${member.username}`} className="text-[12.5px] underline">marquee.bio/{member.username}</Link>
          {member.row && <span className="text-[12px] text-[#9C968C]">indexed {when(member.row.indexed_at)}</span>}
          <button onClick={() => reindex(member.username)} disabled={!!busy} className="text-[12.5px] underline ml-auto">Reindex from the published page</button>
        </div>
        {!member.row && <p className="text-[13.5px] text-[#3a352f]">Not indexed yet.</p>}
        {member.row && <>
          <div className="text-[12.5px] text-[#6E6A62] mb-4">
            <b className="text-brand-ink">Facets:</b> {Object.entries(member.row.facets).filter(([k, v]) => k !== "evidence" && (Array.isArray(v) ? v.length : v !== "" && v !== undefined && v !== false)).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ")}
            {Object.keys(member.row.private_facets).length > 0 && <> <br /><b className="text-brand-ink">Search-only:</b> {Object.entries(member.row.private_facets).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ")}</>}
          </div>
          <table className="w-full border-collapse">
            <thead><tr><th className={th}>Kind</th><th className={th}>Page</th><th className={th}>Item</th><th className={th}>Topics</th></tr></thead>
            <tbody>{member.evidence.map((e, i) => <tr key={i} className={e.hidden ? "opacity-60" : ""}>
              <td className={td + " whitespace-nowrap"}>{KIND[e.kind] || e.kind}{e.hidden && <span className="block text-[11px] text-[#9C968C]">hidden</span>}</td>
              <td className={td + " whitespace-nowrap text-[#6E6A62]"}>{PAGE[e.page] || e.page}</td>
              <td className={td}><b>{e.title}</b>{e.source && <span className="text-[#6E6A62]"> · {e.source}</span>}{e.date_text && <span className="text-[#9C968C]"> · {e.date_text}</span>}{e.body && <div className="text-[12.5px] text-[#3a352f] mt-[2px] max-w-[62ch]">{e.body.length > 260 ? e.body.slice(0, 260) + "…" : e.body}</div>}</td>
              <td className={td + " text-[12.5px]"}>{e.topics.length ? e.topics.join(", ") : <span className="text-[#9C968C]">none</span>}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </section>}

      <table className="w-full border-collapse">
        <thead><tr><th className={th}>Page</th><th className={th}>Headline</th><th className={th}>Evidence</th><th className={th}>Published</th><th className={th}>Indexed</th><th className={th}></th></tr></thead>
        <tbody>{pros.map((r) => <tr key={r.id}>
          <td className={td + " whitespace-nowrap"}><button onClick={() => show(r.username || "")} className="underline">{r.username}</button><div className="text-[12px] text-[#6E6A62]">{r.title}</div></td>
          <td className={td + " max-w-[40ch]"}>{r.subtitle}</td>
          <td className={td}>{r.evidence_count}</td>
          <td className={td + " text-[#6E6A62] whitespace-nowrap"}>{when(r.published_at)}</td>
          <td className={td + " text-[#6E6A62] whitespace-nowrap"}>{when(r.indexed_at)}</td>
          <td className={td}><button onClick={() => reindex(r.username || "")} disabled={!!busy} className="text-[12.5px] underline">Reindex</button></td>
        </tr>)}</tbody>
      </table>
      {pros.length === 0 && state === "ok" && <p className="text-[13.5px] text-[#6E6A62] mt-3">Nothing indexed yet. Index everything now, above.</p>}
    </main>
  );
}
