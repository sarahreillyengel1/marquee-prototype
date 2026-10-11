"use client";
// Marquee team only. Feedback: every answer from marquee.bio/community. Search, sort, group by person, export to CSV.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { id: number; created_at: string; first_name: string; last_name: string; email: string; linkedin: string | null; background: string | null; challenges: string | null; curious: string | null; anything: string | null; source: string | null };
type Sort = "newest" | "oldest" | "name" | "email";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
const QS: { key: keyof Row; label: string }[] = [
  { key: "background", label: "About them" }, { key: "challenges", label: "Challenges" }, { key: "curious", label: "Curious about" }, { key: "anything", label: "Anything else" },
];

export default function FeedbackAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ok" | "notable">("loading");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [group, setGroup] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/feedback").catch(() => null);
    if (!r || r.status === 404) { setState("denied"); return; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState(String(j.error || "").includes("doesn't exist") ? "notable" : "denied"); return; }
    setRows(j.rows || []); setState("ok");
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => !needle || [r.first_name, r.last_name, r.email, r.background, r.challenges, r.curious, r.anything].join(" ").toLowerCase().includes(needle));
    if (group) { // one card per person: their latest answers, with how many times they wrote in
      const seen = new Map<string, Row & { times: number }>();
      for (const r of list) { const k = r.email.toLowerCase(); const cur = seen.get(k); if (cur) cur.times += 1; else seen.set(k, { ...r, times: 1 }); }
      list = Array.from(seen.values());
    }
    const by: Record<Sort, (a: Row, b: Row) => number> = {
      newest: (a, b) => b.created_at.localeCompare(a.created_at),
      oldest: (a, b) => a.created_at.localeCompare(b.created_at),
      name: (a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`),
      email: (a, b) => a.email.localeCompare(b.email),
    };
    return [...list].sort(by[sort]);
  }, [rows, q, sort, group]);

  const remove = async (id: number) => {
    if (!confirm("Remove this response? This cannot be undone.")) return;
    const r = await fetch("/api/admin/feedback", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) { setRows((p) => p.filter((x) => x.id !== id)); setNote("Removed."); } else setNote("Couldn't remove it.");
  };

  const btn = "font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[9px] px-[14px] hover:border-brand-ink";
  const people = new Set(rows.map((r) => r.email.toLowerCase())).size;

  if (state === "loading") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Loading…</div>;
  if (state === "denied") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-brand-ink font-inter">
      <div className="max-w-[1100px] mx-auto px-5 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <Link href="/admin" className="text-[13px] text-[#7d7a74] hover:text-brand-ink">← Admin</Link>
            <h1 className="font-lora text-[32px] leading-[1.05] mt-2">Feedback</h1>
            <p className="text-[14px] text-[#7d7a74] mt-1">{rows.length} {rows.length === 1 ? "response" : "responses"} from {people} {people === 1 ? "person" : "people"}. Answers from marquee.bio/community-feedback. Never published.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/api/admin/feedback?format=csv" className="font-sans text-[13px] font-semibold text-white bg-[#670821] py-[9px] px-[14px] hover:bg-[#4E0619]">Export CSV</a>
            <button onClick={() => { setState("loading"); load(); }} className={btn}>Refresh</button>
          </div>
        </div>

        {state === "notable" && <div className="border border-[#E1DED7] bg-white p-5 text-[14px] mb-6">The <code>community_responses</code> table doesn&rsquo;t exist yet. Run <code>lib/community-schema.sql</code> in Supabase, then refresh.</div>}

        <div className="flex gap-2 flex-wrap items-center mb-5">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names, emails, answers" className="font-inter text-[14px] py-[9px] px-[12px] border border-[#E1DED7] bg-white min-w-[260px] focus:outline-none focus:border-brand-ink" />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="font-inter text-[14px] py-[9px] px-[10px] border border-[#E1DED7] bg-white">
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">By last name</option><option value="email">By email</option>
          </select>
          <label className="text-[13.5px] flex items-center gap-2 ml-1"><input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} /> One card per person</label>
          {note && <span className="text-[13px] text-[#7d7a74]">{note}</span>}
        </div>

        {shown.length === 0 && state === "ok" && <div className="border border-[#E1DED7] bg-white p-6 text-[14px] text-[#7d7a74]">Nothing here yet.</div>}

        <div className="grid gap-3">
          {shown.map((r) => {
            const times = (r as Row & { times?: number }).times || 1;
            const isOpen = open === r.id;
            return (
              <div key={r.id} className="border border-[#E1DED7] bg-white">
                <button onClick={() => setOpen(isOpen ? null : r.id)} className="w-full text-left px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-[15px]">{r.first_name} {r.last_name} <span className="font-normal text-[#7d7a74]">· {r.email}</span>{times > 1 && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.1em] bg-[#EDE7FF] text-[#4B0618] px-2 py-[2px]">{times}×</span>}</div>
                    <div className="text-[13px] text-[#7d7a74] mt-[2px]">{when(r.created_at)}{r.source ? ` · from ${r.source}` : ""}{r.linkedin && <> · <a href={r.linkedin} target="_blank" rel="noopener" className="underline hover:text-brand-ink" onClick={(e) => e.stopPropagation()}>LinkedIn</a></>}</div>
                    {!isOpen && r.background && <div className="text-[13.5px] mt-2 line-clamp-2 text-[#3a352f]">{r.background}</div>}
                  </div>
                  <span className="text-[#7d7a74] text-[13px] whitespace-nowrap">{isOpen ? "Close" : "Open"}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 grid gap-4 border-t border-[#F1EEE8] pt-4">
                    {QS.map((x) => (
                      <div key={x.key}><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">{x.label}</div><div className="text-[14.5px] leading-[1.55] whitespace-pre-wrap">{(r[x.key] as string) || <span className="text-[#9C968C]">—</span>}</div></div>
                    ))}
                    {group && times > 1 && <div className="text-[13px] text-[#7d7a74]">This person wrote in {times} times. Untick &ldquo;One card per person&rdquo; to see every submission.</div>}
                    <div className="flex gap-3 items-center"><a href={`mailto:${r.email}`} className={btn}>Email {r.first_name}</a><button onClick={() => remove(r.id)} className="text-[13px] text-[#7d7a74] hover:text-[#670821]">Remove</button></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
