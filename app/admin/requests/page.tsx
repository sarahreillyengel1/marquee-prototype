"use client";
// Marquee team only. Requests: people who asked for an invite code on marquee.bio/join. Approve emails the code; Decline sends nothing.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { id: number; created_at: string; name: string; email: string; linkedin: string; status: "pending" | "approved" | "declined"; decided_at: string | null; code_sent: string | null };
type Filter = "pending" | "all";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";

export default function RequestsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [code, setCode] = useState("");
  const [state, setState] = useState<"loading" | "denied" | "ok" | "notable">("loading");
  const [filter, setFilter] = useState<Filter>("pending");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/requests").catch(() => null);
    if (!r || r.status === 404) { setState("denied"); return; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState(String(j.error || "").includes("doesn't exist") ? "notable" : "denied"); return; }
    setRows(j.rows || []); setCode(j.code || ""); setState("ok");
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (filter === "all" || r.status === "pending") && (!needle || `${r.name} ${r.email} ${r.linkedin}`.toLowerCase().includes(needle)));
  }, [rows, filter, q]);
  const pending = rows.filter((r) => r.status === "pending").length;

  const decide = async (r: Row, action: "approve" | "decline") => {
    if (action === "approve" && !confirm(`Email ${code} to ${r.name} at ${r.email}?`)) return;
    setBusy(r.id); setNote("");
    const res = await fetch("/api/admin/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, action }) });
    const j = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) { setNote(j.error || "That didn't work."); return; }
    setNote(action === "approve" ? (j.sent ? `Code sent to ${r.email}.` : `Marked approved. Email isn't switched on, so nothing was sent.`) : `${r.name} declined. Nothing was sent.`);
    load();
  };
  const remove = async (r: Row) => {
    if (!confirm(`Remove ${r.name}'s request? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/requests", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== r.id)); setNote("Removed."); } else setNote("Couldn't remove it.");
  };

  const btn = "font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[8px] px-[13px] hover:border-brand-ink disabled:opacity-50";
  const dark = "font-sans text-[13px] font-semibold text-white bg-brand-ink py-[8px] px-[13px] hover:bg-[#670821] disabled:opacity-50";

  if (state === "loading") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Loading…</div>;
  if (state === "denied") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-brand-ink font-inter">
      <div className="max-w-[1100px] mx-auto px-5 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <Link href="/admin" className="text-[13px] text-[#7d7a74] hover:text-brand-ink">← Admin</Link>
            <h1 className="font-lora text-[32px] leading-[1.05] mt-2">Requests</h1>
            <p className="text-[14px] text-[#7d7a74] mt-1">{pending} waiting · {rows.length} in all. From the request form on marquee.bio/join. Approve emails the code <b className="text-brand-ink">{code}</b>; Decline sends nothing.</p>
          </div>
          <button onClick={() => { setState("loading"); load(); }} className={btn}>Refresh</button>
        </div>

        {state === "notable" && <div className="border border-[#E1DED7] bg-white p-5 text-[14px] mb-6">The <code>beta_requests</code> table doesn&rsquo;t exist yet. Run <code>lib/beta-requests-schema.sql</code> in Supabase, then refresh.</div>}

        <div className="flex gap-2 flex-wrap items-center mb-5">
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="font-inter text-[14px] py-[9px] px-[10px] border border-[#E1DED7] bg-white"><option value="pending">Waiting</option><option value="all">Everyone</option></select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names, emails" className="font-inter text-[14px] py-[9px] px-[12px] border border-[#E1DED7] bg-white min-w-[240px] focus:outline-none focus:border-brand-ink" />
          {note && <span className="text-[13px] text-[#7d7a74]">{note}</span>}
        </div>

        {shown.length === 0 && state === "ok" && <div className="border border-[#E1DED7] bg-white p-6 text-[14px] text-[#7d7a74]">{filter === "pending" ? "No one is waiting." : "Nothing here yet."}</div>}

        {shown.length > 0 && (
          <div className="border border-[#E1DED7] bg-white overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead><tr className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] border-b border-[#E1DED7]"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">LinkedIn</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3"></th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-[#F1EEE8] last:border-0 align-middle">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{r.name}</td>
                    <td className="px-4 py-3"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></td>
                    <td className="px-4 py-3"><a href={r.linkedin} target="_blank" rel="noopener" className="text-[#670821] underline break-all">{r.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</a></td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#6E6A62]">{when(r.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.status === "pending" ? (
                        <span className="flex gap-2 items-center"><button disabled={busy === r.id} onClick={() => decide(r, "approve")} className={dark}>{busy === r.id ? "Sending…" : "Approve"}</button><button disabled={busy === r.id} onClick={() => decide(r, "decline")} className={btn}>Decline</button></span>
                      ) : (
                        <span className="text-[12.5px] text-[#6E6A62]">{r.status === "approved" ? <>Approved · <b className="text-brand-ink">{r.code_sent}</b> sent {r.decided_at ? when(r.decided_at) : ""}</> : <>Declined {r.decided_at ? when(r.decided_at) : ""}</>} · <button onClick={() => remove(r)} className="hover:text-[#670821] underline">Remove</button></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
