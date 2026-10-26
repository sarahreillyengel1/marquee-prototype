"use client";
// Marquee team only. Opportunities: paste a link or the text, check the fields, publish. Then the list: feature, pause, close, re-check, edit.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WORK_TYPES, TYPE_LABEL, FUNCTIONS, FUNCTION_LABEL, SENIORITY, SENIORITY_LABEL, REMOTE, REMOTE_LABEL, PAY_PER, REQUIRE_LABEL, payLabel, type Opportunity } from "@/lib/opportunities";

type Row = Opportunity;
type Draft = Omit<Partial<Row>, "id"> & { id?: number; responsibilities: string[]; requirements: string[]; skills: string[] };
const EMPTY: Draft = { title: "", company: "", company_url: "", company_blurb: "", work_type: "full-time", function: "other", seniority: "other", location: "", remote: "unknown", pay_min: null, pay_max: null, pay_per: "", pay_note: "", hours_per_week: null, start_text: "", length_text: "", description: "", responsibilities: [], requirements: [], skills: [], apply_url: "", source: "", source_url: "", deadline: "", featured: false, status: "draft", require_marquee: "optional", questions: [] };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

export default function OpportunitiesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ok" | "notable">("loading");
  const [view, setView] = useState<"list" | "import" | "details">("list");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"link" | "text">("link");
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [d, setD] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "posted" | "paused" | "closed" | "gone">("all");
  const [sort, setSort] = useState<{ key: "title" | "company" | "work_type" | "pay" | "status" | "link" | "date"; dir: 1 | -1 }>({ key: "date", dir: -1 });

  const load = async () => {
    const r = await fetch("/api/admin/opportunities").catch(() => null);
    if (!r || r.status === 404) { setState("denied"); return; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setState(String(j.error || "").includes("doesn't exist") ? "notable" : "denied"); return; }
    setRows(j.rows || []); setState("ok");
  };
  useEffect(() => { load(); }, []);

  const scan = async () => {
    setNote(""); setScanning(true);
    const r = await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "extract", url: mode === "link" ? url : "", text: mode === "text" ? text : "" }) });
    const j = await r.json().catch(() => ({}));
    setScanning(false);
    if (!r.ok) { setNote(j.error || "Couldn't read that."); return; }
    const f = j.fields;
    setFound(f.found || []);
    setD({ ...EMPTY, ...f, pay_per: f.pay_per || "", apply_url: f.apply_url || (mode === "link" ? url : ""), status: "draft" });
    setView("details");
  };
  const edit = (r: Row) => { setD({ ...r, pay_per: r.pay_per || "", deadline: r.deadline || "" }); setFound([]); setView("details"); setNote(""); };
  const save = async (status?: string) => {
    setBusy(true); setNote("");
    const r = await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", row: { ...d, status: status || d.status } }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setNote(j.error || "Couldn't save."); return; }
    setNote(status === "published" ? `Published. marquee.bio/opportunities/${j.row.slug}` : "Saved.");
    setView("list"); setD(EMPTY); setUrl(""); setText(""); load();
  };
  const quick = async (r: Row, patch: Partial<Row>) => {
    const res = await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", row: { ...r, ...patch } }) });
    if (!res.ok) setNote("Couldn't save."); load();
  };
  const check = async (r: Row) => {
    setNote(`Checking ${r.title}…`);
    const res = await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check", id: r.id }) });
    const j = await res.json().catch(() => ({}));
    setNote(j.status === "ok" ? "Link opens." : j.status === "gone" ? "That posting looks gone. Close it if so." : "Couldn't reach it just now."); load();
  };
  const remove = async (r: Row) => {
    if (!confirm(`Remove "${r.title}" at ${r.company}? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/opportunities", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
    if (res.ok) { setNote("Removed."); load(); } else setNote("Couldn't remove it.");
  };

  const shown = useMemo(() => {
    const list = rows.filter((r) => filter === "all" ? true : filter === "gone" ? r.check_status === "gone" : filter === "posted" ? !!r.posted_by : r.status === filter);
    const val = (r: Row): string | number => sort.key === "pay" ? (r.pay_max || r.pay_min || 0) * (r.pay_per === "hour" ? 2000 : r.pay_per === "month" ? 12 : 1) : sort.key === "link" ? (r.check_status || "") : sort.key === "date" ? (r.published_at || r.created_at) : String(r[sort.key] || "").toLowerCase();
    return [...list].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  }, [rows, filter, sort]);
  const sortBy = (key: typeof sort.key) => setSort((c) => ({ key, dir: c.key === key ? (c.dir === 1 ? -1 : 1) : key === "date" || key === "pay" ? -1 : 1 }));
  const Th = ({ k, children, className = "" }: { k: typeof sort.key; children: React.ReactNode; className?: string }) => <th className={`px-4 py-3 ${className}`}><button type="button" onClick={() => sortBy(k)} className={`uppercase tracking-[0.12em] hover:text-brand-ink ${sort.key === k ? "text-brand-ink" : ""}`}>{children}{sort.key === k ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</button></th>;
  const counts = useMemo(() => ({ published: rows.filter((r) => r.status === "published").length, draft: rows.filter((r) => r.status === "draft").length, gone: rows.filter((r) => r.check_status === "gone").length, waiting: rows.filter((r) => r.status === "draft" && r.posted_by).length }), [rows]);

  const btn = "font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[8px] px-[13px] hover:border-brand-ink disabled:opacity-50";
  const dark = "font-sans text-[13px] font-semibold text-white bg-[#670821] py-[9px] px-[15px] hover:bg-[#4E0619] disabled:opacity-50";
  const small = "font-sans text-[12px] font-semibold border border-[#E1DED7] bg-white py-[6px] px-[10px] hover:border-brand-ink disabled:opacity-50";
  const inp = "w-full font-inter text-[14px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
  const lab = "block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6E6A62] mb-[5px]";
  const Tag = ({ k }: { k: string }) => (found.includes(k) ? <span className="ml-2 align-middle inline-block text-[9.5px] font-bold tracking-[0.1em] uppercase bg-[#EDE7FF] text-[#4B0618] px-[7px] py-[2px]">Scanned</span> : null);
  const set = (patch: Partial<Draft>) => setD((c) => ({ ...c, ...patch }));
  const lines = (v: string[]) => v.join("\n");
  const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  if (state === "loading") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Loading…</div>;
  if (state === "denied") return <div className="min-h-screen flex items-center justify-center text-[14px] text-[#7d7a74]">Not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-brand-ink font-inter">
      <div className="max-w-[1320px] mx-auto px-5 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <Link href="/admin" className="text-[13px] text-[#7d7a74] hover:text-brand-ink">&larr; Admin</Link>
            <h1 className="font-lora text-[32px] leading-[1.05] mt-2">Opportunities</h1>
            <p className="text-[14px] text-[#7d7a74] mt-1">{counts.published} live · {counts.draft} drafts{counts.waiting ? ` · ${counts.waiting} posted by businesses, waiting on you` : ""}{counts.gone ? ` · ${counts.gone} flagged gone` : ""}. Live ones show at <a href="/opportunities" target="_blank" className="underline">marquee.bio/opportunities</a>.</p>
          </div>
          <div className="flex gap-2">{view !== "list" && <button onClick={() => { setView("list"); setNote(""); }} className={btn}>Back to list</button>}{view === "list" && <button onClick={() => { setD(EMPTY); setFound([]); setView("import"); setNote(""); }} className={dark}>+ Add an opportunity</button>}</div>
        </div>
        {state === "notable" && <div className="border border-[#E1DED7] bg-white p-5 text-[14px] mb-6">The <code>opportunities</code> table doesn&rsquo;t exist yet. Run <code>lib/opportunities-schema.sql</code> in Supabase, then refresh.</div>}
        {note && <div className="text-[13.5px] mb-4 text-[#3a352f]">{note}</div>}

        {view === "import" && (
          <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="bg-white border border-[#E1DED7] p-6">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#670821]">Add an opportunity</div>
              <h2 className="font-lora text-[26px] leading-[1.1] mt-2">Start from the listing.</h2>
              <p className="text-[14px] text-[#6E6A62] mt-2">Paste the link, or the text if the page won&rsquo;t open. The fields get filled from what the posting says, nothing more. You check them next.</p>
              <div className="flex gap-2 mt-5">{(["link", "text"] as const).map((m) => <button key={m} type="button" onClick={() => setMode(m)} className={`${btn} ${mode === m ? "!border-brand-ink bg-[#F7F6F2]" : ""}`}>{m === "link" ? "Paste a link" : "Paste the text"}</button>)}</div>
              {mode === "link" ? (
                <div className="mt-4"><label className={lab}>Listing link</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={inp} /></div>
              ) : (
                <div className="mt-4"><label className={lab}>The posting</label><textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste the whole job description here" className={inp} /></div>
              )}
              <div className="flex items-center gap-3 mt-4"><button type="button" onClick={scan} disabled={scanning || (mode === "link" ? !url.trim() : !text.trim())} className={dark}>{scanning ? "Reading…" : "Scan listing"}</button><button type="button" onClick={() => { setD({ ...EMPTY, apply_url: url }); setFound([]); setView("details"); }} className="text-[13px] underline underline-offset-2 hover:text-[#670821]">Start from scratch</button></div>
            </div>
            <div className="bg-[#EDE7FF] p-5 text-[13.5px] leading-[1.55]"><b>What the scan does.</b> Reads the page, pulls out title, company, type of work, place, pay, hours, start, length, the description, responsibilities and requirements. A field the posting does not state stays empty and gets flagged for you. Pay is never guessed.</div>
          </div>
        )}

        {view === "details" && (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
            <div className="bg-white border border-[#E1DED7] p-6 space-y-6">
              <div><h2 className="font-lora text-[26px] leading-[1.1]">Check the details.</h2>{found.length > 0 && <p className="text-[13.5px] text-[#6E6A62] mt-1">Fields marked Scanned came from the listing. Edit anything. Empty ones were not in the posting.</p>}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={lab}>Role title<Tag k="title" /></label><input value={d.title || ""} onChange={(e) => set({ title: e.target.value })} className={inp} /></div>
                <div><label className={lab}>Company<Tag k="company" /></label><input value={d.company || ""} onChange={(e) => set({ company: e.target.value })} className={inp} /></div>
                <div><label className={lab}>Company site</label><input value={d.company_url || ""} onChange={(e) => set({ company_url: e.target.value })} placeholder="https://…" className={inp} /></div>
                <div><label className={lab}>One line about the company</label><input value={d.company_blurb || ""} onChange={(e) => set({ company_blurb: e.target.value })} className={inp} /></div>
              </div>
              <div>
                <label className={lab}>Work type<Tag k="work_type" /></label>
                <div className="flex flex-wrap gap-2">{WORK_TYPES.map((t) => <button key={t} type="button" onClick={() => set({ work_type: t })} className={`${btn} ${d.work_type === t ? "!bg-[#670821] !text-white !border-[#670821]" : ""}`}>{TYPE_LABEL[t]}</button>)}</div>
              </div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-4">
                <div><label className={lab}>Location<Tag k="location" /></label><input value={d.location || ""} onChange={(e) => set({ location: e.target.value })} placeholder="New York, US, Europe…" className={inp} /></div>
                <div><label className={lab}>Place</label><div className="flex gap-2">{REMOTE.filter((r) => r !== "unknown").map((r) => <button key={r} type="button" onClick={() => set({ remote: d.remote === r ? "unknown" : r })} className={`${btn} ${d.remote === r ? "!bg-[#670821] !text-white !border-[#670821]" : ""}`}>{REMOTE_LABEL[r]}</button>)}</div></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={lab}>Function</label><select value={d.function || "other"} onChange={(e) => set({ function: e.target.value })} className={inp}>{FUNCTIONS.map((f) => <option key={f} value={f}>{FUNCTION_LABEL[f]}</option>)}</select></div>
                <div><label className={lab}>Seniority</label><select value={d.seniority || "other"} onChange={(e) => set({ seniority: e.target.value })} className={inp}>{SENIORITY.map((s) => <option key={s} value={s}>{SENIORITY_LABEL[s]}</option>)}</select></div>
              </div>
              <div>
                <div className="font-lora text-[20px] mb-3">Pay and time</div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><label className={lab}>Pay from<Tag k="pay" /></label><input inputMode="numeric" value={d.pay_min ?? ""} onChange={(e) => set({ pay_min: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} placeholder="8000" className={inp} /></div>
                  <div><label className={lab}>Pay to</label><input inputMode="numeric" value={d.pay_max ?? ""} onChange={(e) => set({ pay_max: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} placeholder="10000" className={inp} /></div>
                  <div><label className={lab}>Per</label><select value={d.pay_per || ""} onChange={(e) => set({ pay_per: e.target.value })} className={inp}><option value="">—</option>{PAY_PER.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></div>
                  <div><label className={lab}>Pay note</label><input value={d.pay_note || ""} onChange={(e) => set({ pay_note: e.target.value })} placeholder="+ equity, DOE…" className={inp} /></div>
                  <div><label className={lab}>Hours per week<Tag k="hours_per_week" /></label><input inputMode="numeric" value={d.hours_per_week ?? ""} onChange={(e) => set({ hours_per_week: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} className={inp} /></div>
                  <div><label className={lab}>Start<Tag k="start_text" /></label><input value={d.start_text || ""} onChange={(e) => set({ start_text: e.target.value })} placeholder="November" className={inp} /></div>
                  <div><label className={lab}>Length<Tag k="length_text" /></label><input value={d.length_text || ""} onChange={(e) => set({ length_text: e.target.value })} placeholder="6 months, renewable" className={inp} /></div>
                  <div><label className={lab}>Deadline</label><input type="date" value={d.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} className={inp} /></div>
                </div>
              </div>
              <div><label className={lab}>Description<Tag k="description" /></label><textarea value={d.description || ""} onChange={(e) => set({ description: e.target.value })} rows={6} className={inp} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={lab}>What you&rsquo;ll do, one per line<Tag k="responsibilities" /></label><textarea value={lines(d.responsibilities)} onChange={(e) => set({ responsibilities: fromLines(e.target.value) })} rows={6} className={inp} /></div>
                <div><label className={lab}>What they&rsquo;re looking for, one per line<Tag k="requirements" /></label><textarea value={lines(d.requirements)} onChange={(e) => set({ requirements: fromLines(e.target.value) })} rows={6} className={inp} /></div>
              </div>
              <div><label className={lab}>Skills, comma separated</label><input value={d.skills.join(", ")} onChange={(e) => set({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={inp} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={lab}>Application link (Apply on company site)</label><input value={d.apply_url || ""} onChange={(e) => set({ apply_url: e.target.value })} placeholder="https://… or apply:marquee to take applications here" className={inp} /></div>
                <div><label className={lab}>Found on</label><input value={d.source || ""} onChange={(e) => set({ source: e.target.value })} placeholder="fractionaljobs.io" className={inp} /></div>
              </div>
              <div><label className={lab}>Qualifying questions, one per line, up to 3 (asked on Apply with Marquee)</label><textarea value={(d.questions || []).join("\n")} onChange={(e) => set({ questions: e.target.value.split("\n").slice(0, 3) })} rows={3} placeholder="Have you shipped a product from zero to launch?" className={inp} /></div>
              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div><label className={lab}>Marquee to apply</label><select value={d.require_marquee || "optional"} onChange={(e) => set({ require_marquee: e.target.value })} className={inp}>{Object.entries(REQUIRE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <label className="flex items-center gap-2 text-[13.5px] pb-[10px]"><input type="checkbox" checked={!!d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
              </div>
              {d.posted_by && <div className="bg-[#EDE7FF] p-4 text-[13.5px]">Posted by <b>{d.poster_name || "a business"}</b> · {d.poster_email}. Publishing emails them that it is live.</div>}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F1EEE8]">
                <button type="button" onClick={() => save("published")} disabled={busy} className={dark}>{busy ? "Saving…" : "Publish"}</button>
                <button type="button" onClick={() => save(d.status === "published" ? "published" : "draft")} disabled={busy} className={btn}>{d.status === "published" ? "Save changes" : "Save draft"}</button>
                {d.source_url && <a href={d.source_url} target="_blank" rel="noopener" className="text-[13px] underline underline-offset-2 ml-auto">Open the original</a>}
              </div>
            </div>
            <div className="lg:sticky lg:top-6">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#6E6A62] mb-2">Live preview</div>
              <div className="bg-white border border-[#E1DED7] rounded-[14px] p-5">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#C9DDF7] font-semibold text-[13px] flex items-center justify-center">{(d.company || "?").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}</div>
                <div className="font-semibold text-[16px] mt-3">{d.title || "Job title"}</div>
                <div className="text-[13px] text-[#6E6A62]">{d.company || "Company"}{d.location ? ` · ${d.location}` : ""}{d.remote && d.remote !== "unknown" ? ` · ${REMOTE_LABEL[d.remote]}` : ""}</div>
                <div className="mt-3"><span className="text-[11.5px] font-semibold bg-[#EDE7FF] rounded-full px-[9px] py-[3px]">{TYPE_LABEL[d.work_type || "full-time"]}</span></div>
                {payLabel({ pay_min: d.pay_min ?? null, pay_max: d.pay_max ?? null, pay_per: d.pay_per || null, pay_note: d.pay_note || null }) && <div className="font-semibold text-[20px] text-[#670821] tabular-nums mt-3">{payLabel({ pay_min: d.pay_min ?? null, pay_max: d.pay_max ?? null, pay_per: d.pay_per || null, pay_note: d.pay_note || null })}</div>}
                <div className="text-[12.5px] text-[#6E6A62] mt-1">{[d.hours_per_week ? `${d.hours_per_week} hrs a week` : "", d.length_text].filter(Boolean).join(" · ")}</div>
                <div className="mt-4 inline-block text-[11px] font-bold tracking-[0.08em] uppercase bg-[#F8563A] text-white rounded-full px-4 py-[9px]">Apply on company site</div>
              </div>
            </div>
          </div>
        )}

        {view === "list" && (
          <>
            <div className="flex gap-2 flex-wrap items-center mb-4">
              {(["all", "published", "draft", "posted", "paused", "closed", "gone"] as const).map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={`${btn} ${filter === f ? "!border-brand-ink bg-white" : "bg-transparent"}`}>{f === "gone" ? "Flagged gone" : f === "posted" ? "Posted by businesses" : f[0].toUpperCase() + f.slice(1)}</button>)}
            </div>
            {shown.length === 0 && state === "ok" && <div className="border border-[#E1DED7] bg-white p-6 text-[14px] text-[#7d7a74]">{rows.length ? "Nothing here." : "No opportunities yet. Add the first one."}</div>}
            {shown.length > 0 && (
              <div className="border border-[#E1DED7] bg-white overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead><tr className="text-left text-[11px] font-semibold text-[#6E6A62] border-b border-[#E1DED7]"><Th k="title" className="min-w-[280px]">Role</Th><Th k="company">Company</Th><Th k="work_type">Type</Th><Th k="pay">Pay</Th><Th k="status">Status</Th><Th k="date">Date</Th><Th k="link">Link</Th><th className="px-4 py-3"></th></tr></thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.id} className="border-b border-[#F1EEE8] last:border-0 align-middle">
                        <td className="px-4 py-3 min-w-[280px]"><div className="font-semibold">{r.title}</div><div className="text-[12.5px] text-[#6E6A62]">{r.location || ""}{r.featured ? " · Featured" : ""}{r.require_marquee === "yes" ? " · Marquee required" : ""}</div>{r.posted_by && <div className="text-[12.5px] text-[#670821] mt-[2px]">Posted by {r.poster_name || "a business"} · {r.poster_email}</div>}</td>
                        <td className="px-4 py-3 min-w-[140px]">{r.company}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{TYPE_LABEL[r.work_type]}</td>
                        <td className="px-4 py-3 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title={payLabel(r)}>{payLabel(r) || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.status}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#6E6A62]">{when(r.published_at || r.created_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.check_status === "gone" ? <span className="text-[#AB0000] font-semibold">gone</span> : r.check_status === "error" ? <span className="text-[#6E6A62]">unreachable</span> : r.last_checked_at ? <span className="text-[#6E6A62]">ok · {when(r.last_checked_at)}</span> : <span className="text-[#6E6A62]">not checked</span>}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex gap-[6px] items-center">
                            <button onClick={() => edit(r)} className={small}>Edit</button>
                            {r.status === "published" ? <button onClick={() => quick(r, { status: "paused" })} className={small}>Pause</button> : r.status !== "closed" && <button onClick={() => quick(r, { status: "published" })} className={`${small} !bg-[#670821] !text-white !border-[#670821]`}>Publish</button>}
                            <button onClick={() => quick(r, { featured: !r.featured })} className={small}>{r.featured ? "Unfeature" : "Feature"}</button>
                            <button onClick={() => check(r)} className={small}>Check</button>
                            {r.status !== "closed" && <button onClick={() => quick(r, { status: "closed" })} className="text-[12.5px] underline underline-offset-2 hover:text-[#670821]">Close</button>}
                            <button onClick={() => remove(r)} className="text-[12.5px] text-[#6E6A62] hover:text-[#AB0000] underline underline-offset-2">Remove</button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
