"use client";
// Marquee team only: everyone who has signed up. The data route refuses anyone else.

import { useEffect, useState } from "react";
import Link from "next/link";

type Member = { name: string; email: string; joined: string; lastSeen: string; plan: string; status: string; founding: boolean; verified: boolean; code: string; username: string; publishedAt: string };
type Wait = { email: string; first_name?: string | null; last_name?: string | null; status?: string | null; notes?: string | null; linkedin_url?: string | null; created_at: string };
type Data = { asOf: string; members: Member[]; waitlist: Wait[]; reminders: Wait[]; codesLeft: string[] };

const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const PLAN: Record<string, string> = { founding_monthly: "Founding · $20/month", founding_yearly: "Founding · $200/year", founding_comped: "Founding · comped", "invite code": "Invite code" };
const th = "text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] py-[10px] pr-4 border-b border-[#E1DED7] whitespace-nowrap";
const td = "py-[11px] pr-4 border-b border-[#F1EEE8] text-[13.5px] align-top";

export default function Admin() {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const load = () => fetch("/api/admin/members").then(async (r) => { if (!r.ok) { setState("denied"); return; } setD(await r.json()); setState("ok"); }).catch(() => setState("denied"));
  useEffect(() => { load(); }, []);

  if (state === "loading") return <main className="min-h-screen bg-brand-paper font-inter p-10 text-[#6E6A62]">Loading…</main>;
  if (state === "denied" || !d) return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">Nothing here.</h1><p className="text-[14.5px] text-[#3a352f]">This page is for the Marquee team. <Link href="/login" className="underline">Sign in</Link> with a team account.</p></main>;

  const paying = d.members.filter((m) => m.plan.startsWith("founding_") && m.plan !== "founding_comped" && ["active", "trialing", "past_due"].includes(m.status));
  const published = d.members.filter((m) => m.username);
  const Stat = ({ n, t, s }: { n: string | number; t: string; s?: string }) => <div className="bg-white border border-[#E1DED7] p-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">{t}</div><div className="font-lora text-[34px] leading-none mt-[10px] mb-1">{n}</div>{s && <div className="text-[12.5px] text-[#6E6A62]">{s}</div>}</div>;
  const copy = (list: string[]) => navigator.clipboard?.writeText(list.join(", "));

  return (
    <main className="min-h-screen bg-brand-paper font-inter text-brand-ink px-6 md:px-12 py-10">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-7">
          <div><Link href="/" className="wordmark block mb-6">MARQUEE</Link><h1 className="font-lora text-[34px] leading-[1.05]">Who has signed up</h1><p className="text-[13.5px] text-[#6E6A62] mt-1">As of {new Date(d.asOf).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}. Only you can see this page.</p></div>
          <button onClick={() => { setState("loading"); load(); }} className="font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[10px] px-[15px] hover:border-brand-ink">Refresh</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-9">
          <Stat n={`${paying.length} of 250`} t="Paying Founding Members" s={paying.length ? `$${paying.reduce((a, m) => a + (m.plan === "founding_yearly" ? 200 : 20), 0)} in first charges` : "None yet"} />
          <Stat n={d.members.length} t="Accounts" s={`${published.length} with a live profile`} />
          <Stat n={d.waitlist.length} t="Waitlist" s="Asked before sign-up opened" />
          <Stat n={d.reminders.length} t="Remind me, Dec 1" s="For Marquee Pro" />
        </div>

        <div className="flex items-baseline justify-between mb-2"><h2 className="font-lora text-[22px]">Members</h2><button onClick={() => copy(d.members.map((m) => m.email))} className="text-[12.5px] text-[#670821] font-semibold hover:underline">Copy all emails</button></div>
        <div className="bg-white border border-[#E1DED7] px-5 mb-9 overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]"><thead><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Plan</th><th className={th}>Status</th><th className={th}>Joined</th><th className={th}>Profile</th></tr></thead>
            <tbody>{d.members.map((m) => (
              <tr key={m.email}>
                <td className={td}><span className="font-semibold">{m.name || "—"}</span>{m.verified && <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] bg-[#670821] text-white px-[6px] py-[2px]">Verified</span>}</td>
                <td className={td}><a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a></td>
                <td className={td}>{PLAN[m.plan] || m.plan || "—"}{m.code && <span className="text-[#6E6A62]"> · {m.code}</span>}</td>
                <td className={td}>{m.status ? <span className={`text-[12px] font-semibold px-[8px] py-[3px] ${m.status === "active" ? "bg-[#EDE7FF] text-[#670821]" : "bg-[#F4F2EF] text-[#3a352f]"}`}>{m.status}</span> : "—"}</td>
                <td className={td}>{day(m.joined)}</td>
                <td className={td}>{m.username ? <a href={`/${m.username}`} target="_blank" rel="noopener" className="text-[#670821] font-semibold hover:underline">/{m.username} ↗</a> : <span className="text-[#9C968C]">Not published</span>}</td>
              </tr>))}</tbody></table>
        </div>

        <div className="flex items-baseline justify-between mb-2"><h2 className="font-lora text-[22px]">Waitlist</h2><button onClick={() => copy(d.waitlist.map((w) => w.email))} className="text-[12.5px] text-[#670821] font-semibold hover:underline">Copy all emails</button></div>
        <div className="bg-white border border-[#E1DED7] px-5 mb-9 overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]"><thead><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Asked</th><th className={th}>Notes</th></tr></thead>
            <tbody>{d.waitlist.length === 0 ? <tr><td className={td} colSpan={4}>Nobody yet.</td></tr> : d.waitlist.map((w) => (
              <tr key={w.email + w.created_at}>
                <td className={td}><span className="font-semibold">{[w.first_name, w.last_name].filter(Boolean).join(" ") || "—"}</span></td>
                <td className={td}><a href={`mailto:${w.email}`} className="hover:underline">{w.email}</a></td>
                <td className={td}>{day(w.created_at)}</td>
                <td className={`${td} text-[#6E6A62]`}>{w.linkedin_url ? <a href={w.linkedin_url} target="_blank" rel="noopener" className="hover:underline">LinkedIn ↗</a> : (w.notes || "").slice(0, 80)}</td>
              </tr>))}</tbody></table>
        </div>

        <h2 className="font-lora text-[22px] mb-2">Remind me on December 1</h2>
        <div className="bg-white border border-[#E1DED7] px-5 mb-9">
          <table className="w-full border-collapse"><thead><tr><th className={th}>Email</th><th className={th}>Asked</th><th className={th}>About</th></tr></thead>
            <tbody>{d.reminders.length === 0 ? <tr><td className={td} colSpan={3}>Nobody yet.</td></tr> : d.reminders.map((w) => (
              <tr key={w.email + w.created_at}><td className={td}><a href={`mailto:${w.email}`} className="hover:underline">{w.email}</a></td><td className={td}>{day(w.created_at)}</td><td className={`${td} text-[#6E6A62]`}>{(w.notes || "").slice(0, 80)}</td></tr>))}</tbody></table>
        </div>

        <p className="text-[12.5px] text-[#6E6A62]">Unused invite codes: {d.codesLeft.length ? d.codesLeft.join(" · ") : "none"}</p>
      </div>
    </main>
  );
}
