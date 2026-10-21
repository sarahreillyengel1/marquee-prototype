"use client";
// The buttons on a listing: Apply on company site, Save, Share.
import { useState } from "react";

export default function JobActions({ id, slug, title, company, applyUrl, saved: saved0, signedIn }: { id: number; slug: string; title: string; company: string; applyUrl: string; saved: boolean; signedIn: boolean }) {
  const [saved, setSaved] = useState(saved0);
  const [note, setNote] = useState("");
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
      <a href={applyUrl} target="_blank" rel="noopener" className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-red text-white rounded-full px-6 py-[13px] hover:bg-dred transition-colors">Apply on company site</a>
      <div className="flex items-center gap-4 text-[13.5px] font-semibold">
        <button type="button" onClick={save} className="flex items-center gap-[6px] hover:text-dred"><svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>{saved ? "Saved" : "Save"}</button>
        <button type="button" onClick={share} className="flex items-center gap-[6px] hover:text-dred"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" /></svg>Share</button>
      </div>
      {note && <div className="text-[12.5px] text-ink/60">{note}</div>}
    </div>
  );
}
