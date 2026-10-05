"use client";
// Marquee team only: the Spotlight editor. Laid out section by section, in the order the page shows them.
// Each section has its own add button and only the fields that section needs.

import { useEffect, useState } from "react";
import Link from "next/link";
import { KINDS, SECTIONS, SECTION_INFO, type SpotlightItem, type SpotlightType } from "@/lib/spotlight";

type Draft = Partial<SpotlightItem> & { type: SpotlightType; title: string; starts_local?: string };
const blank = (type: SpotlightType): Draft => ({ type, title: "", kind: "", blurb: "", url: "", cta: "", image_url: "", org: "", detail: "", place: "", price: "", starts_local: "", published: false, sort: 0 });

const label = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-1";
const input = "w-full font-inter text-[14px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : "");
const when = (iso: string) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET" : "");
// datetime-local works in the browser's own time zone; Sarah is on Eastern time.
const toLocal = (iso: string | null | undefined) => { if (!iso) return ""; const d = new Date(iso); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

// Which fields each section's form shows, and what to call them.
const FIELDS: Record<SpotlightType, { org?: string; detail?: string; price?: string; when?: boolean; place?: boolean; cta: string; blurb: string }> = {
  hero: { org: "Author", detail: "Read time (6 min read)", cta: "Read the article", blurb: "Standfirst: one or two sentences under the headline" },
  news: { cta: "", blurb: "One line" },
  featured: { cta: "", blurb: "One line" },
  event: { org: "Host", price: "Price (Free, $25, Invite only)", when: true, place: true, cta: "RSVP", blurb: "One line (optional)" },
  opportunity: { org: "Company or organisation", detail: "Details (10 hrs a month · Start now)", cta: "Apply", blurb: "One line" },
  education: { detail: "Length (90 minutes, Four weeks)", price: "Price (Free, Paid, $49)", cta: "", blurb: "One line" },
  community: { cta: "Join", blurb: "One line" },
};

export default function SpotlightAdmin() {
  const [items, setItems] = useState<SpotlightItem[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ok" | "notable">("loading");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/spotlight").catch(() => null);
    if (!r || r.status === 404) { setState("denied"); return; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState(String(j.error || "").includes("doesn't exist") ? "notable" : "denied"); return; }
    setItems(j.items); setState("ok");
  };
  useEffect(() => { load(); }, []);

  const startNew = (type: SpotlightType) => { setDraft(blank(type)); setNote(""); };
  const edit = (i: SpotlightItem) => { setDraft({ ...i, starts_local: toLocal(i.starts_at) }); setNote(""); };
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async (published: boolean) => {
    if (!draft) return;
    setBusy(true); setNote("");
    const body = { ...draft, published, starts_at: draft.starts_local ? new Date(draft.starts_local).toISOString() : null };
    const r = await fetch("/api/admin/spotlight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setNote(j.error || "Couldn't save."); return; }
    setNote(published ? `Saved. "${body.title}" is live on marquee.bio/spotlight.` : `Saved "${body.title}" as a draft. Not on the page yet.`);
    setDraft(null); load();
  };
  const toggle = async (i: SpotlightItem, patch: Partial<SpotlightItem>) => {
    setBusy(true);
    await fetch("/api/admin/spotlight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...i, ...patch }) });
    setBusy(false); load();
  };
  const remove = async (i: SpotlightItem) => {
    if (!window.confirm(`Delete "${i.title}"? This can't be undone.`)) return;
    setBusy(true);
    await fetch("/api/admin/spotlight", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: i.id }) });
    setBusy(false); load();
  };

  if (state === "loading") return <main className="min-h-screen bg-brand-paper font-inter p-10 text-[#6E6A62]">Loading…</main>;
  if (state === "denied") return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">Nothing here.</h1><p className="text-[14.5px]">This page is for the Marquee team. <Link href="/login" className="underline">Sign in</Link>.</p></main>;
  if (state === "notable") return <main className="min-h-screen bg-brand-paper font-inter p-10"><h1 className="font-lora text-[28px] mb-2">One step first.</h1><p className="text-[14.5px] max-w-[60ch]">The spotlight_items table hasn&apos;t been added in Supabase yet. Run lib/spotlight-schema.sql in the SQL Editor, then refresh.</p></main>;

  const live = items.filter((i) => i.published).length;

  // a plain function, not a component, so typing in the form doesn't remount it and lose focus
  const renderForm = () => {
    if (!draft) return null;
    const f = FIELDS[draft.type], info = SECTION_INFO[draft.type];
    return (
      <div className="bg-white border-2 border-[#670821] p-6 my-3">
        <div className="flex items-baseline justify-between mb-5"><h3 className="font-lora text-[20px]">{draft.id ? "Edit" : info.add}</h3><button onClick={() => setDraft(null)} className="text-[13px] text-[#6E6A62] hover:underline">Cancel</button></div>
        <div className="grid md:grid-cols-[1fr_220px] gap-4 mb-4">
          <div><label className={label}>{draft.type === "hero" ? "Headline" : "Title"}</label><input autoFocus value={draft.title} onChange={(e) => set({ title: e.target.value })} className={input} /></div>
          <div><label className={label}>{draft.type === "event" ? "In person or online" : draft.type === "opportunity" ? "Kind of work" : draft.type === "education" ? "Format" : draft.type === "community" ? "Kind" : "Kind"}</label>
            <input list={`kinds-${draft.type}`} value={draft.kind || ""} onChange={(e) => set({ kind: e.target.value })} placeholder={KINDS[draft.type].join(", ")} className={input} />
            <datalist id={`kinds-${draft.type}`}>{KINDS[draft.type].map((k) => <option key={k} value={k} />)}</datalist></div>
        </div>
        <div className="mb-4"><label className={label}>{f.blurb}</label><textarea value={draft.blurb || ""} onChange={(e) => set({ blurb: e.target.value })} rows={2} className={input} /></div>
        {(f.org || f.detail || f.price) && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {f.org && <div><label className={label}>{f.org}</label><input value={draft.org || ""} onChange={(e) => set({ org: e.target.value })} className={input} /></div>}
            {f.detail && <div><label className={label}>{f.detail}</label><input value={draft.detail || ""} onChange={(e) => set({ detail: e.target.value })} className={input} /></div>}
            {f.price && <div><label className={label}>{f.price}</label><input value={draft.price || ""} onChange={(e) => set({ price: e.target.value })} className={input} /></div>}
          </div>
        )}
        {f.when && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div><label className={label}>Date and time (Eastern)</label><input type="datetime-local" value={draft.starts_local || ""} onChange={(e) => set({ starts_local: e.target.value })} className={input} /></div>
            <div><label className={label}>Place (New York, Online)</label><input value={draft.place || ""} onChange={(e) => set({ place: e.target.value })} className={input} /></div>
          </div>
        )}
        <div className="grid md:grid-cols-[1fr_200px] gap-4 mb-4">
          <div><label className={label}>Link</label><input value={draft.url || ""} onChange={(e) => set({ url: e.target.value })} className={input} placeholder="https://…" /></div>
          <div><label className={label}>Button label</label><input value={draft.cta || ""} onChange={(e) => set({ cta: e.target.value })} className={input} placeholder={f.cta || "Optional"} /></div>
        </div>
        <div className="grid md:grid-cols-[1fr_140px] gap-4 mb-5">
          <div><label className={label}>Picture link (optional)</label><input value={draft.image_url || ""} onChange={(e) => set({ image_url: e.target.value })} className={input} placeholder="https://… .jpg" /><p className="text-[12px] text-[#6E6A62] mt-1">Without a picture the item shows a brand colour block.</p></div>
          <div><label className={label}>Order</label><input type="number" value={draft.sort ?? 0} onChange={(e) => set({ sort: Number(e.target.value) })} className={input} /><p className="text-[12px] text-[#6E6A62] mt-1">Lower shows first.</p></div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button disabled={busy} onClick={() => save(true)} className="font-sans text-[14px] font-semibold text-white bg-[#670821] py-[11px] px-5 hover:bg-[#4E0619] disabled:opacity-50">{busy ? "Saving…" : "Save and publish"}</button>
          <button disabled={busy} onClick={() => save(false)} className="font-sans text-[14px] font-semibold border border-[#E1DED7] bg-white py-[11px] px-5 hover:border-brand-ink disabled:opacity-50">Save as draft</button>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-brand-paper font-inter text-brand-ink px-6 md:px-12 py-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div><Link href="/admin" className="text-[13px] text-[#6E6A62] hover:underline">← Who has signed up</Link><h1 className="font-lora text-[34px] leading-[1.05] mt-3">Spotlight editor</h1><p className="text-[13.5px] text-[#6E6A62] mt-1">{live} item{live === 1 ? "" : "s"} live · laid out as the page is · <a href="/spotlight" target="_blank" rel="noopener" className="text-[#670821] font-semibold hover:underline">Open the page ↗</a></p></div>
        </div>

        {note && <div className="bg-white border border-[#E1DED7] border-l-[3px] border-l-[#670821] px-5 py-[12px] mb-6 text-[14px]" role="status">{note}</div>}

        {SECTIONS.map((sec) => {
          const info = SECTION_INFO[sec];
          const rows = items.filter((i) => i.type === sec).sort((a, b) => sec === "event" ? String(a.starts_at || "").localeCompare(String(b.starts_at || "")) : a.sort - b.sort || b.created_at.localeCompare(a.created_at));
          const open = draft?.type === sec;
          return (
            <section key={sec} className="mb-10">
              <div className="flex items-end justify-between gap-4 flex-wrap border-b-2 border-brand-ink pb-3 mb-1">
                <div><h2 className="font-lora text-[26px] leading-[1.1]">{info.title}</h2><p className="text-[12.5px] text-[#6E6A62] mt-1">{info.help}</p></div>
                {!open && <button disabled={busy} onClick={() => startNew(sec)} className="font-sans text-[13px] font-semibold text-white bg-[#670821] py-[9px] px-4 hover:bg-[#4E0619] disabled:opacity-50">+ {info.add}</button>}
              </div>
              {open && !draft?.id && renderForm()}
              {rows.length === 0 && !open && <p className="py-4 text-[13.5px] text-[#9C968C]">Nothing here yet.</p>}
              {rows.map((i) => draft?.id === i.id ? <div key={i.id}>{renderForm()}</div> : (
                <div key={i.id} className={`flex items-center gap-4 py-[12px] border-b border-[#F1EEE8] ${i.published ? "" : "opacity-60"}`}>
                  {i.image_url ? <img src={i.image_url} alt="" className="w-[52px] h-[40px] object-cover shrink-0" /> : <div className="w-[52px] h-[40px] bg-[#EDE7FF] shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {i.kind && <span className="font-semibold uppercase tracking-[0.1em] text-[#670821]">{i.kind}</span>}
                      <span className={`font-semibold px-[6px] py-[1px] ${i.published ? "bg-[#EDE7FF] text-[#670821]" : "bg-[#F4F2EF] text-[#6E6A62]"}`}>{i.published ? "Live" : "Draft"}</span>
                      <span className="text-[#9C968C]">{sec === "event" ? when(String(i.starts_at)) : `added ${day(i.created_at)}`}</span>
                    </div>
                    <button onClick={() => edit(i)} className="font-semibold text-[15px] text-left hover:underline block truncate max-w-full mt-[2px]">{i.title}</button>
                    {(i.org || i.place || i.detail) && <div className="text-[12.5px] text-[#6E6A62] truncate">{[i.org, i.place, i.detail].filter(Boolean).join(" · ")}</div>}
                  </div>
                  <div className="text-[12.5px] whitespace-nowrap shrink-0">
                    <button disabled={busy} onClick={() => toggle(i, { published: !i.published })} className="font-semibold text-[#670821] hover:underline mr-4">{i.published ? "Unpublish" : "Publish"}</button>
                    <button disabled={busy} onClick={() => edit(i)} className="font-semibold hover:underline mr-4">Edit</button>
                    <button disabled={busy} onClick={() => remove(i)} className="text-[#6E6A62] hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
