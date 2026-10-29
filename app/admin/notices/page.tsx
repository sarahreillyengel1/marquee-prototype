"use client";
// Marquee team only: post a notification to every member, and read the "How is it going?" answers.

import { useEffect, useState } from "react";
import Link from "next/link";
import { NOTICE_TAGS } from "@/lib/team";

type Notice = { id: number; created_at: string; tag: string; title: string; body: string; link_url: string; link_label: string; published: boolean; reads: number; likes: number; readers: { name: string; email: string; liked: boolean }[] };
type Checkin = { id: number; created_at: string; email: string; name: string; ask: number; answer: string };
type Data = { notices: Notice[]; checkins: Checkin[]; startedAt: string; members: number };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const ANSWER: Record<string, string> = { great: "Great! Loving it so far.", starting: "Just getting started.", ok: "It's just okay." };
const THUMB = <svg viewBox="0 0 24 24" fill="#670821" stroke="#670821" strokeWidth={1.8} strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>;
const input = "w-full font-inter text-[14px] py-[10px] px-[12px] border border-[#E1DED7] focus:outline-none focus:border-brand-ink";

export default function AdminNotices() {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const BLANK = { tag: "Feature", title: "", body: "", link_url: "", link_label: "" };
  const [f, setF] = useState(BLANK);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const load = () => fetch("/api/admin/notices").then(async (r) => { if (!r.ok) { setState("denied"); return; } setD(await r.json()); setState("ok"); }).catch(() => setState("denied"));
  useEffect(() => { load(); }, []);
  const act = async (body: Record<string, unknown>, key: string, done: string) => {
    setBusy(key); setNote("");
    const r = await fetch("/api/admin/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(""); setNote(r.ok ? done : j.error || "That didn't work.");
    if (r.ok) load();
  };

  if (state === "loading") return <main className="min-h-screen bg-brand-paper font-inter p-10 text-[#6E6A62]">Loading…</main>;
  if (state === "denied" || !d) return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">Nothing here.</h1><p className="text-[14.5px] text-[#3a352f]">This page is for the Marquee team. <Link href="/login" className="underline">Sign in</Link> with a team account.</p></main>;

  const count = (a: string, ask: number) => d.checkins.filter((c) => c.answer === a && c.ask === ask).length;
  return (
    <main className="min-h-screen bg-brand-paper font-inter px-10 py-8 text-brand-ink">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="font-lora text-[30px] leading-none">Notifications</h1><p className="text-[13.5px] text-[#6E6A62] mt-2">What members see behind the bell, and the check-in answers.</p></div>
        <Link href="/admin" className="text-[13px] underline underline-offset-2">← Admin</Link>
      </div>
      {note && <p className="text-[13.5px] mb-4 text-[#3a352f] bg-white border border-[#E1DED7] px-4 py-3">{note}</p>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] items-start">
        <section className="bg-white border border-[#E1DED7] p-6">
          <h2 className="font-lora text-[22px] mb-1">Post a notification</h2>
          <p className="text-[13px] text-[#6E6A62] mb-4">Every member sees it the next time they open the builder or their profile. Shown as from Team Marquee.</p>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">Tag</label>
          <div className="flex gap-2 flex-wrap mb-3">{NOTICE_TAGS.map((t) => <button key={t} type="button" onClick={() => setF({ ...f, tag: t })} className={"font-sans text-[12px] font-semibold py-[6px] px-[11px] border " + (f.tag === t ? "bg-brand-ink text-white border-brand-ink" : "border-[#E1DED7] text-[#3a352f] hover:border-brand-ink")}>{t}</button>)}</div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">Title</label>
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input + " mb-3"} placeholder="Book a Call is coming" />
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">Text</label>
          <textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} rows={5} className={input + " mb-3 resize-none"} placeholder="A few lines. Line breaks are kept." />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">Link (optional)</label><input value={f.link_url} onChange={(e) => setF({ ...f, link_url: e.target.value })} className={input} placeholder="/build-preview or https://…" /></div>
            <div><label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1">Link text</label><input value={f.link_label} onChange={(e) => setF({ ...f, link_label: e.target.value })} className={input} placeholder="Read more" /></div>
          </div>
          <button disabled={!f.title.trim() || busy === "post"} onClick={() => act({ action: "post", ...f }, "post", "Posted.").then(() => setF(BLANK))} className="font-sans text-[13px] font-semibold text-white bg-[#670821] py-[10px] px-[15px] hover:bg-[#4E0619] disabled:opacity-50">Post to all members</button>
        </section>

        <section>
          <div className="bg-white border border-[#E1DED7] p-6 mb-6">
            <h2 className="font-lora text-[22px] mb-1">How&rsquo;s it going?</h2>
            <p className="text-[13px] text-[#6E6A62] mb-4">Asked on a member&rsquo;s 2nd visit and again on their 5th. A visit is a day they opened Marquee signed in.{d.startedAt ? ` Counting since ${day(d.startedAt)} for anyone already past their 2nd visit by then.` : " Not live yet: run lib/notices-schema.sql in Supabase."}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[2, 5].map((ask) => <div key={ask}><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-2">{ask === 2 ? "2nd visit" : "5th visit"} · {d.checkins.filter((c) => c.ask === ask).length} of {d.members}</div><div className="grid grid-cols-3 gap-2">{[["Great", count("great", ask)], ["Getting started", count("starting", ask)], ["Just okay", count("ok", ask)]].map(([t, n]) => <div key={String(t)} className="border border-[#E1DED7] p-3"><div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">{t}</div><div className="font-lora text-[24px] leading-none mt-2">{n}</div></div>)}</div></div>)}
            </div>
            {d.checkins.length === 0 ? <p className="text-[13.5px] text-[#6E6A62]">No answers yet.</p> : (
              <div className="divide-y divide-[#F1EEE8] text-[13.5px]">{d.checkins.map((c) => <div key={c.id} className="py-2 flex flex-wrap gap-x-4 gap-y-1 items-center"><b>{c.name || c.email}</b>{c.name && <span className="text-[#6E6A62]">{c.email}</span>}<span className={c.answer === "ok" ? "text-[#AB0000] font-semibold" : ""}>{ANSWER[c.answer] || c.answer}</span><span className="text-[#9C968C]">{c.ask === 2 ? "2nd visit" : "5th visit"}</span><span className="ml-auto text-[#6E6A62]">{day(c.created_at)}</span></div>)}</div>
            )}
          </div>

          <div className="bg-white border border-[#E1DED7] p-6">
            <h2 className="font-lora text-[22px] mb-3">Posted</h2>
            {d.notices.length === 0 ? <p className="text-[13.5px] text-[#6E6A62]">Nothing posted yet.</p> : d.notices.map((n) => (
              <div key={n.id} className={"py-4 border-t border-[#F1EEE8] first:border-t-0" + (n.published ? "" : " opacity-60")}>
                <div className="flex items-baseline gap-3 flex-wrap">{n.tag && <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#670821]">{n.tag}</span>}<b className="text-[14.5px]">{n.title}</b><span className="text-[12.5px] text-[#6E6A62]">{day(n.created_at)} · read by {n.reads} of {d.members} · {n.likes} thumbs up</span>{!n.published && <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C968C]">Hidden</span>}</div>
                {n.body && <p className="text-[13.5px] text-[#3a352f] mt-1 whitespace-pre-line">{n.body}</p>}
                {n.link_url && <a href={n.link_url} target="_blank" rel="noopener" className="text-[13px] underline underline-offset-2 text-[#670821] mt-1 inline-block">{n.link_label || n.link_url}</a>}
                {n.readers.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12.5px] text-[#3a352f]">
                    {n.readers.map((r, i) => <span key={i} className="inline-flex items-center gap-1" title={r.email}>{r.name || r.email}{r.liked && <span aria-label="thumbs up" className="text-[#670821]">{THUMB}</span>}</span>)}
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-[12.5px]">
                  <button disabled={!!busy} onClick={() => act({ action: n.published ? "unpublish" : "publish", id: n.id }, "p" + n.id, n.published ? "Hidden from members." : "Shown to members again.")} className="underline underline-offset-2">{n.published ? "Hide" : "Show"}</button>
                  <button disabled={!!busy} onClick={() => { if (window.confirm(`Delete "${n.title}"? It disappears for everyone.`)) act({ action: "delete", id: n.id }, "d" + n.id, "Deleted."); }} className="underline underline-offset-2 text-[#AB0000]">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
