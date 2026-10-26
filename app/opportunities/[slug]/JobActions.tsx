"use client";
// The buttons on a listing: Apply on company site, Save, Share.
import { useState } from "react";
import Link from "next/link";

export default function JobActions({ id, slug, title, company, applyUrl, saved: saved0, signedIn, requireMarquee, myMarquee, questions = [] }: { id: number; slug: string; title: string; company: string; applyUrl: string; saved: boolean; signedIn: boolean; requireMarquee?: boolean; myMarquee?: string; questions?: string[] }) {
  const [saved, setSaved] = useState(saved0);
  const [note, setNote] = useState("");
  const here = applyUrl.startsWith("apply:"); // the role takes applications on Marquee
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ note: "" });
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const apply = async () => {
    if (questions.some((_, i) => !(answers[i] || "").trim())) { setErr("Please answer each question."); return; }
    setErr(""); setSending(true);
    const r = await fetch("/api/opportunities/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...f, answers }) });
    const j = await r.json().catch(() => ({}));
    setSending(false);
    if (!r.ok) { setErr(j.error || "Couldn't send. Try again."); return; }
    setDone(true);
  };
  const inp = "w-full rounded-[10px] border-[1.5px] border-hair bg-white px-4 py-[10px] text-[14.5px] focus:outline-none focus:border-ink";
  const url = `https://marquee.bio/opportunities/${slug}`;
  const save = async () => {
    if (!signedIn) { window.location.href = `/login?next=/opportunities/${slug}`; return; }
    const next = !saved; setSaved(next);
    const r = await fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, save: next }) });
    if (!r.ok) { setSaved(!next); setNote("Couldn't save that."); }
  };
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: `${title} at ${company}`, url }); return; }
      await navigator.clipboard.writeText(url); setNote("Link copied."); setTimeout(() => setNote(""), 2000);
    } catch { /* cancelled */ }
  };
  return (
    <div className="flex flex-col items-start md:items-end gap-3">
      {here ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-red text-white rounded-full px-6 py-[13px] hover:bg-dred transition-colors">Apply with Marquee</button>
      ) : (
        <a href={applyUrl} target="_blank" rel="noopener" onClick={() => { if (signedIn) fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, applied: true }), keepalive: true }).catch(() => null); }} className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-red text-white rounded-full px-6 py-[13px] hover:bg-dred transition-colors">{/linkedin\.com/.test(applyUrl) ? "Apply on LinkedIn" : "Apply on company site"}</a>
      )}
      {here && open && (
        <div className="w-full md:w-[360px] bg-white border border-hair rounded-[14px] p-5 text-left">
          {done ? <div className="text-[14.5px] leading-[1.55]"><b>Sent.</b> {company} has your Marquee and your note, and replies to you by email.</div>
          : !signedIn ? <div className="space-y-3 text-[14.5px] leading-[1.55]"><div className="font-semibold text-[15px]">Apply with your Marquee</div><p>You apply here with your Marquee, so {company} sees your experience, skills and how to work with you in one place. Create yours to apply.</p><div className="flex items-center gap-3"><Link href={`/join?src=apply-${slug}`} className="text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-5 py-[11px]">Create your Marquee</Link><Link href={`/login?next=/opportunities/${slug}`} className="text-[13px] underline underline-offset-2">Sign in</Link></div></div>
          : !myMarquee ? <div className="space-y-3 text-[14.5px] leading-[1.55]"><div className="font-semibold text-[15px]">Publish your Marquee first</div><p>Your application is your Marquee. Finish and publish it, then come back and apply.</p><Link href="/build-preview" className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-5 py-[11px]">Open the builder</Link></div>
          : (
            <div className="space-y-3">
              <div className="font-semibold text-[15px]">Apply for {title}</div>
              <div className="text-[13px] text-ink/70">Applying as <b className="text-ink">marquee.bio/{myMarquee}</b></div>
              {questions.map((q, i) => <div key={i}><div className="text-[13px] font-semibold mb-1">{q}</div><textarea value={answers[i] || ""} onChange={(e) => setAnswers((a) => a.map((x, k) => (k === i ? e.target.value : x)))} rows={2} className={inp} /></div>)}
              <textarea value={f.note} onChange={(e) => setF({ note: e.target.value })} placeholder="Anything else" rows={3} className={inp} />
              {err && <div className="text-[13px] text-dred">{err}</div>}
              <div className="flex items-center gap-3"><button type="button" onClick={apply} disabled={sending} className="text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-5 py-[11px] disabled:opacity-50">{sending ? "Sending…" : "Send my Marquee"}</button><button type="button" onClick={() => setOpen(false)} className="text-[13px] underline underline-offset-2">Cancel</button></div>
            </div>
          )}
        </div>
      )}
      {requireMarquee && <div className="text-[12.5px] text-ink/70 md:text-right max-w-[260px]">Have your Marquee link ready. This company asks for it when you apply.</div>}
      <div className="flex items-center gap-4 text-[13.5px] font-semibold">
        <button type="button" onClick={save} className="flex items-center gap-[6px] hover:text-dred"><svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>{saved ? "Saved" : "Save"}</button>
        <button type="button" onClick={share} className="flex items-center gap-[6px] hover:text-dred"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" /></svg>Share</button>
      </div>
      {note && <div className="text-[12.5px] text-ink/60">{note}</div>}
    </div>
  );
}
