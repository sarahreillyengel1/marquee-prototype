"use client";
// Marquee team only: everyone who has signed up. The data route refuses anyone else.

import { useEffect, useState } from "react";
import Link from "next/link";

type Member = { id: string; reviewedAt: string; removedAt: string; needsPassword?: boolean; draftAt: string; progress: number; filled: string[]; payoutReady: boolean; meetingLink: boolean; activeDays: number; lastActive: string; builderVisits: number; isAdmin: boolean; name: string; email: string; joined: string; lastSeen: string; plan: string; status: string; founding: boolean; verified: boolean; code: string; username: string; publishedAt: string };
type Wait = { email: string; first_name?: string | null; last_name?: string | null; status?: string | null; notes?: string | null; linkedin_url?: string | null; created_at: string };
type Count = { name: string; count: number };
type Span = { views: number; visitors: number };
type Traffic = { today: Span; week: Span; month: Span; days: { day: string; views: number; visitors: number }[]; pages: Count[]; profiles: Count[]; sources: Count[]; phones: number };
type Mail = { id: string; to: string; subject: string; at: string; status: string };
type Data = { usage: { activeByDay: { day: string; members: number }[]; tracked: boolean }; traffic: Traffic | null; asOf: string; members: Member[]; waitlist: Wait[]; reminders: Wait[]; codesLeft: string[] };

const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const PLAN: Record<string, string> = { founding_monthly: "Founding · $20/month", founding_yearly: "Founding · $200/year", founding_comped: "Founding · comped", "invite code": "Invite code" };
const th = "text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] py-[10px] pr-4 border-b border-[#E1DED7] whitespace-nowrap";
const td = "py-[11px] pr-4 border-b border-[#F1EEE8] text-[13.5px] align-top";

export default function Admin() {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [busy, setBusy] = useState("");
  const [mail, setMail] = useState<{ emails?: Mail[]; error?: string } | null>(null);
  const [payLink, setPayLink] = useState("");
  const [mailQ, setMailQ] = useState("");
  const [note, setNote] = useState("");
  const load = () => fetch("/api/admin/members").then(async (r) => { if (!r.ok) { setState("denied"); return; } setD(await r.json()); setState("ok"); }).catch(() => setState("denied"));
  useEffect(() => { load(); fetch("/api/admin/emails").then(async (r) => setMail(await r.json().catch(() => ({ error: "Couldn't load." })))).catch(() => setMail({ error: "Couldn't load." })); }, []);

  if (state === "loading") return <main className="min-h-screen bg-brand-paper font-inter p-10 text-[#6E6A62]">Loading…</main>;
  if (state === "denied" || !d) return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">Nothing here.</h1><p className="text-[14.5px] text-[#3a352f]">This page is for the Marquee team. <Link href="/login" className="underline">Sign in</Link> with a team account.</p></main>;

  const paying = d.members.filter((m) => m.plan.startsWith("founding_") && m.plan !== "founding_comped" && ["active", "trialing", "past_due"].includes(m.status));
  const published = d.members.filter((m) => m.username);
  const Stat = ({ n, t, s }: { n: string | number; t: string; s?: string }) => <div className="bg-white border border-[#E1DED7] p-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">{t}</div><div className="font-lora text-[34px] leading-none mt-[10px] mb-1">{n}</div>{s && <div className="text-[12.5px] text-[#6E6A62]">{s}</div>}</div>;
  const copy = (list: string[]) => navigator.clipboard?.writeText(list.join(", "));
  const act = async (m: Member, action: "verify" | "remove") => {
    if (action === "remove" && !window.confirm(`Remove ${m.name || m.email}?\n\nThis refunds their latest payment, cancels their membership, takes their profile down and blocks the account. It can't be undone from here.`)) return;
    setBusy(m.id + action); setNote("");
    const r = await fetch("/api/admin/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id: m.id }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    setNote(!r.ok ? (j.error || "That didn't work.") : action === "verify" ? `${m.name || m.email} verified. ${j.emailed ? "Getting Started guide sent." : "The guide email did NOT send — email it to them yourself."}` : `${m.name || m.email} removed: ${(j.notes || []).join(", ")}.`);
    load();
  };
  const dropWait = async (email: string) => {
    if (!window.confirm(`Remove ${email} from the waitlist?`)) return;
    setBusy(email);
    const r = await fetch("/api/admin/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setBusy(""); setNote(r.ok ? `${email} removed from the waitlist.` : "That didn't work.");
    load();
  };
  const fromPayment = async () => {
    if (!payLink.trim()) return;
    setBusy("pay"); setNote("");
    const r = await fetch("/api/admin/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "from_payment", link: payLink.trim() }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    setNote(!r.ok ? (j.error || "That didn't work.") : `${j.email} now has an account (Founding Member, ${j.plan}).${j.needsPassword ? " They choose a password from the link in their welcome email." : ""}`);
    if (r.ok) { setPayLink(""); load(); }
  };
  const waiting = d.members.filter((m) => !m.reviewedAt && !m.removedAt && !m.isAdmin);

  return (
    <main className="min-h-screen bg-brand-paper font-inter text-brand-ink px-6 md:px-12 py-10">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-7">
          <div><Link href="/" className="wordmark block mb-6">MARQUEE</Link><h1 className="font-lora text-[34px] leading-[1.05]">Who has signed up</h1><p className="text-[13.5px] text-[#6E6A62] mt-1">As of {new Date(d.asOf).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}. Only you can see this page.</p></div>
          <div className="flex gap-3"><Link href="/admin/spotlight" className="font-sans text-[13px] font-semibold text-white bg-[#670821] py-[10px] px-[15px] hover:bg-[#4E0619]">Spotlight editor →</Link><button onClick={() => { setState("loading"); load(); }} className="font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[10px] px-[15px] hover:border-brand-ink">Refresh</button></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-9">
          <Stat n={`${paying.length} of 250`} t="Paying Founding Members" s={paying.length ? `$${paying.reduce((a, m) => a + (m.plan === "founding_yearly" ? 200 : 20), 0)} in first charges` : "None yet"} />
          <Stat n={d.members.length} t="Accounts" s={`${published.length} with a live profile`} />
          <Stat n={d.reminders.length} t="Remind me, Dec 1" s="For Marquee Pro" />
        </div>

        {waiting.length > 0 && <div className="bg-[#EDE7FF] border border-[#C7B5FF] px-5 py-[13px] mb-5 text-[14px]"><strong>{waiting.length} new {waiting.length === 1 ? "member needs" : "members need"} your review:</strong> {waiting.map((m) => m.name || m.email).join(", ")}. Verify to send the Getting Started guide, or remove.</div>}
        {note && <div className="bg-white border border-[#E1DED7] border-l-[3px] border-l-[#670821] px-5 py-[12px] mb-5 text-[14px]" role="status">{note}</div>}
        <div className="bg-white border border-[#E1DED7] px-5 py-4 mb-5">
          <div className="text-[13.5px] font-semibold mb-1">Someone paid but isn&apos;t listed below?</div>
          <p className="text-[12.5px] text-[#6E6A62] mb-3">Paste the &ldquo;Build your Marquee&rdquo; link from their welcome email (find it in Resend) and their account is created. They set a password from that same link.</p>
          <div className="flex gap-2 flex-wrap"><input value={payLink} onChange={(e) => setPayLink(e.target.value)} placeholder="https://marquee.bio/join/welcome?session_id=cs_live_…" className="flex-1 min-w-[260px] font-inter text-[13px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" /><button disabled={!!busy || !payLink.trim()} onClick={fromPayment} className="font-sans text-[13px] font-semibold text-white bg-[#670821] py-[9px] px-4 hover:bg-[#4E0619] disabled:opacity-50">{busy === "pay" ? "Creating…" : "Create their account"}</button></div>
        </div>
        <div className="flex items-baseline justify-between mb-2"><h2 className="font-lora text-[22px]">Members</h2><button onClick={() => copy(d.members.map((m) => m.email))} className="text-[12.5px] text-[#670821] font-semibold hover:underline">Copy all emails</button></div>
        <div className="bg-white border border-[#E1DED7] px-5 mb-9 overflow-x-auto">
          <table className="w-full border-collapse min-w-[1080px]"><thead><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Plan</th><th className={th}>Status</th><th className={th}>Joined</th><th className={th}>Profile</th><th className={th}>Review</th></tr></thead>
            <tbody>{d.members.map((m) => (
              <tr key={m.email}>
                <td className={td}><span className="font-semibold">{m.name || "—"}</span>{m.verified && <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] bg-[#670821] text-white px-[6px] py-[2px]">Verified</span>}</td>
                <td className={td}><a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a></td>
                <td className={td}>{PLAN[m.plan] || m.plan || "—"}{m.code && <span className="text-[#6E6A62]"> · {m.code}</span>}</td>
                <td className={td}>{m.status ? <span className={`text-[12px] font-semibold px-[8px] py-[3px] ${m.status === "active" ? "bg-[#EDE7FF] text-[#670821]" : "bg-[#F4F2EF] text-[#3a352f]"}`}>{m.status}</span> : "—"}{m.needsPassword && <div className="text-[11.5px] text-[#6E6A62] mt-1 whitespace-nowrap">Paid · no password yet</div>}</td>
                <td className={td}>{day(m.joined)}</td>
                <td className={td}>{m.username ? <a href={`/${m.username}`} target="_blank" rel="noopener" className="text-[#670821] font-semibold hover:underline">/{m.username} ↗</a> : <span className="text-[#9C968C]">Not published</span>}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {m.removedAt ? <span className="text-[12px] font-semibold px-[8px] py-[3px] bg-[#111] text-white">Removed {day(m.removedAt)}</span>
                    : m.isAdmin ? <span className="text-[#9C968C]">Team</span>
                    : <>
                      {m.reviewedAt ? <span className="text-[12.5px] text-[#3a352f]">Verified {day(m.reviewedAt)} · guide sent</span>
                        : <button disabled={!!busy} onClick={() => act(m, "verify")} className="font-sans text-[12.5px] font-semibold bg-[#670821] text-white py-[7px] px-[11px] hover:bg-[#4E0619] disabled:opacity-50">{busy === m.id + "verify" ? "Sending…" : "Verify & send guide"}</button>}
                      <button disabled={!!busy} onClick={() => act(m, "remove")} className="ml-3 font-sans text-[12.5px] font-semibold text-[#670821] hover:underline disabled:opacity-50">{busy === m.id + "remove" ? "Removing…" : "Remove"}</button>
                    </>}
                </td>
              </tr>))}</tbody></table>
        </div>

        <h2 className="font-lora text-[22px] mb-2">Usage</h2>
        {(() => {
          const real = d.members.filter((m) => !m.isAdmin && !m.removedAt);
          const paid = real.length, pw = real.filter((m) => !m.needsPassword).length, started = real.filter((m) => m.progress > 0).length, pub = real.filter((m) => m.username).length, pay = real.filter((m) => m.payoutReady).length;
          const steps = [["Joined", paid], ["Password set", pw], ["Started building", started], ["Published", pub], ["Payouts connected", pay]] as [string, number][];
          const max = Math.max(1, ...d.usage.activeByDay.map((x) => x.members));
          const dayLbl = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }) : "—");
          return (
            <div className="mb-9">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {steps.map(([t, n], i) => <div key={t} className="bg-white border border-[#E1DED7] p-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">{i + 1} · {t}</div><div className="font-lora text-[34px] leading-none mt-2">{n}</div><div className="text-[12.5px] text-[#6E6A62] mt-1">{paid ? `${Math.round((n / paid) * 100)}% of members` : "No members yet"}</div></div>)}
              </div>
              <div className="bg-white border border-[#E1DED7] p-[18px] mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C] mb-3">Members signed in per day · last 14 days</div>
                {!d.usage.tracked ? <p className="text-[13px] text-[#6E6A62]">Sign-ins are counted from the moment the member column is added to page_views (lib/usage-schema.sql). Nothing counted yet.</p> : (<>
                  <div className="flex items-end gap-[6px] h-[90px]">{d.usage.activeByDay.map((x) => <div key={x.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${x.day}: ${x.members} signed in`}><div className="text-[10.5px] text-[#6E6A62] mb-1 tabular-nums">{x.members || ""}</div><div className="w-full" style={{ height: `${Math.max(x.members ? 3 : 1, (x.members / max) * 64)}px`, background: x.members ? "#670821" : "#EDE7FF" }} /></div>)}</div>
                  <div className="flex gap-[6px] mt-1">{d.usage.activeByDay.map((x) => <div key={x.day} className="flex-1 text-center text-[10px] text-[#9C968C] tabular-nums">{Number(x.day.slice(8))}</div>)}</div>
                </>)}
              </div>
              <div className="bg-white border border-[#E1DED7] px-5 overflow-x-auto">
                <table className="w-full border-collapse min-w-[980px]"><thead><tr>{["Member", "Joined", "Last seen", "Days active · 30d", "Builder visits", "Profile", "Live", "Payouts"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
                  <tbody>{real.length === 0 ? <tr><td className={td} colSpan={8}>No members yet.</td></tr> : real.map((m) => (
                    <tr key={m.id}>
                      <td className={td}><span className="font-semibold">{m.name || m.email}</span>{m.needsPassword && <div className="text-[11.5px] text-[#670821]">Paid · no password yet</div>}</td>
                      <td className={`${td} whitespace-nowrap`}>{day(m.joined)}</td>
                      <td className={`${td} whitespace-nowrap`}>{dayLbl(m.lastActive)}</td>
                      <td className={`${td} tabular-nums`}>{m.activeDays}</td>
                      <td className={`${td} tabular-nums`}>{m.builderVisits}</td>
                      <td className={td}><div className="flex items-center gap-2"><div className="w-[90px] h-[6px] bg-[#EDE7FF]"><div className="h-full bg-[#670821]" style={{ width: `${m.progress}%` }} /></div><span className="text-[12.5px] tabular-nums">{m.progress}%</span></div><div className="text-[11px] text-[#9C968C] mt-[2px]">{m.filled.length ? m.filled.join(", ") : m.draftAt ? "nothing filled yet" : "not started"}</div></td>
                      <td className={td}>{m.username ? <a href={`/${m.username}`} target="_blank" rel="noopener" className="text-[#670821] font-semibold hover:underline">Yes ↗</a> : <span className="text-[#9C968C]">Not yet</span>}</td>
                      <td className={td}>{m.payoutReady ? <span className="text-[12px] font-semibold px-[8px] py-[3px] bg-[#EDE7FF] text-[#670821]">Connected</span> : <span className="text-[#9C968C]">Not yet</span>}{!m.meetingLink && m.payoutReady && <div className="text-[11px] text-[#9C968C] mt-[2px]">no meeting link</div>}</td>
                    </tr>))}</tbody></table>
                <p className="text-[12px] text-[#9C968C] py-3">Profile shows which builder sections hold something: photo, bio, experience, skills, offers, media, values, testimonials, CTAs. Your own account is left out.</p>
              </div>
            </div>);
        })()}

        <h2 className="font-lora text-[22px] mb-2">Site visits</h2>
        {!d.traffic ? <div className="bg-white border border-[#E1DED7] px-5 py-4 mb-9 text-[14px] text-[#3a352f]">Visit counting isn&apos;t switched on yet. It needs one table added in Supabase.</div> : (() => {
          const t = d.traffic; const max = Math.max(1, ...t.days.map((x) => x.views));
          const List = ({ title, rows, empty, link }: { title: string; rows: Count[]; empty: string; link?: boolean }) => (
            <div className="bg-white border border-[#E1DED7] p-[18px]"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C] mb-2">{title} · 7 days</div>
              {rows.length === 0 ? <div className="text-[13px] text-[#9C968C]">{empty}</div> : rows.map((r) => <div key={r.name} className="flex justify-between gap-3 text-[13.5px] py-[5px] border-b border-[#F1EEE8] last:border-0"><span className="truncate">{link ? <a href={`/${r.name}`} target="_blank" rel="noopener" className="hover:underline">/{r.name}</a> : r.name}</span><span className="font-semibold tabular-nums">{r.count}</span></div>)}
            </div>);
          return (
            <div className="mb-9">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Stat n={t.today.visitors} t="Visitors today" s={`${t.today.views} pages viewed`} />
                <Stat n={t.week.visitors} t="Visitors, 7 days" s={`${t.week.views} pages viewed`} />
                <Stat n={t.month.visitors} t="Visitors, 30 days" s={`${t.month.views} pages viewed`} />
                <Stat n={`${t.phones}%`} t="On a phone" s="Last 7 days" />
              </div>
              <div className="bg-white border border-[#E1DED7] p-[18px] mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C] mb-3">Pages viewed per day · last 14 days</div>
                <div className="flex items-end gap-[6px] h-[110px]">{t.days.map((x) => <div key={x.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${x.day}: ${x.views} pages, ${x.visitors} visitors`}><div className="text-[10.5px] text-[#6E6A62] mb-1 tabular-nums">{x.views || ""}</div><div className="w-full bg-[#C7B5FF]" style={{ height: `${Math.max(x.views ? 3 : 1, (x.views / max) * 80)}px`, background: x.views ? "#C7B5FF" : "#EDE7FF" }} /></div>)}</div>
                <div className="flex gap-[6px] mt-1">{t.days.map((x) => <div key={x.day} className="flex-1 text-center text-[10px] text-[#9C968C] tabular-nums">{Number(x.day.slice(8))}</div>)}</div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <List title="Where visitors came from" rows={t.sources} empty="No outside links yet. Visits typed in directly aren't listed." />
                <List title="Top pages" rows={t.pages} empty="No visits yet." />
                <List title="Most viewed profiles" rows={t.profiles} empty="No profile visits yet." link />
              </div>
              <p className="text-[12px] text-[#9C968C] mt-2">Counted by Marquee, without cookies. A visitor is one person on one day. Your own visits count too.</p>
            </div>);
        })()}

        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2"><h2 className="font-lora text-[22px]">Emails sent</h2><input value={mailQ} onChange={(e) => setMailQ(e.target.value)} placeholder="Search by email or subject" className="font-inter text-[13px] py-[8px] px-[11px] border border-[#E1DED7] bg-white w-[280px] max-w-full focus:outline-none focus:border-brand-ink" /></div>
        <div className="bg-white border border-[#E1DED7] px-5 mb-9 overflow-x-auto">
          {!mail ? <p className="py-4 text-[14px] text-[#9C968C]">Loading…</p> : mail.error ? <p className="py-4 text-[14px] text-[#3a352f]">{mail.error}</p> : (() => {
            const q = mailQ.trim().toLowerCase(); const rows = (mail.emails || []).filter((m) => !q || m.to.toLowerCase().includes(q) || (m.subject || "").toLowerCase().includes(q));
            const tone = (st: string) => /bounce|fail|complain/i.test(st) ? "bg-[#111] text-white" : /open|click/i.test(st) ? "bg-[#670821] text-white" : /deliver/i.test(st) ? "bg-[#EDE7FF] text-[#670821]" : "bg-[#F4F2EF] text-[#3a352f]";
            return rows.length === 0 ? <p className="py-4 text-[14px] text-[#9C968C]">{q ? "No emails match." : "Nothing sent yet."}</p> : (
              <table className="w-full border-collapse min-w-[760px]"><thead><tr><th className={th}>To</th><th className={th}>Subject</th><th className={th}>Sent</th><th className={th}>Status</th></tr></thead>
                <tbody>{rows.slice(0, 100).map((m) => <tr key={m.id}><td className={td}>{m.to}</td><td className={td}>{m.subject}</td><td className={`${td} whitespace-nowrap`}>{new Date(m.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET</td><td className={td}>{m.status ? <span className={`text-[12px] font-semibold px-[8px] py-[3px] ${tone(m.status)}`}>{m.status.replace(/_/g, " ")}</span> : "—"}</td></tr>)}</tbody></table>);
          })()}
          {mail?.emails && <p className="text-[12px] text-[#9C968C] py-3">The last 100 emails Marquee sent, from Resend. "delivered" means it reached their mailbox; "opened" shows only if open tracking is on in Resend.</p>}
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
