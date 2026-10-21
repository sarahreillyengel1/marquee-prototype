"use client";
// marquee.bio/opportunities: the board. Search, work-type and place chips, sidebar filters with counts. No account needed to browse.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import JobCard, { type JobRow } from "./JobCard";
import { WORK_TYPES, TYPE_LABEL, FUNCTIONS, FUNCTION_LABEL, SENIORITY, SENIORITY_LABEL } from "@/lib/opportunities";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const PLACES: [string, string][] = [["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"]];
const PAY: [string, string, (j: JobRow) => boolean][] = [
  ["y100", "$100K+ / year", (j) => j.pay_per === "year" && (j.pay_max || j.pay_min || 0) >= 100000],
  ["m5", "$5K+ / month", (j) => j.pay_per === "month" && (j.pay_max || j.pay_min || 0) >= 5000],
  ["h150", "$150+ / hour", (j) => j.pay_per === "hour" && (j.pay_max || j.pay_min || 0) >= 150],
];
const HOURS: [string, string, (j: JobRow) => boolean][] = [
  ["u10", "Under 10", (j) => !!j.hours_per_week && j.hours_per_week < 10],
  ["10-20", "10–20", (j) => !!j.hours_per_week && j.hours_per_week >= 10 && j.hours_per_week <= 20],
  ["20-40", "20–40", (j) => !!j.hours_per_week && j.hours_per_week > 20 && j.hours_per_week <= 40],
];

export default function OpportunitiesBoard() {
  const [rows, setRows] = useState<JobRow[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [signedIn, setSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [place, setPlace] = useState("");
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState<Set<string>>(new Set());
  const [pay, setPay] = useState<Set<string>>(new Set());
  const [hours, setHours] = useState<Set<string>>(new Set());
  const [sen, setSen] = useState<Set<string>>(new Set());
  const [fns, setFns] = useState<Set<string>>(new Set());
  const [shown, setShown] = useState(20);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/opportunities").then((r) => r.json()).then((j) => { setRows(j.rows || []); setSaved(new Set(j.saved || [])); setSignedIn(!!j.signedIn); }).catch(() => null).finally(() => setLoaded(true));
  }, []);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, v: string) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); setter(n); setShown(20); };
  const passes = (j: JobRow, skip?: string) => {
    const needle = q.trim().toLowerCase();
    if (needle && !`${j.title} ${j.company} ${j.function || ""} ${(j.skills || []).join(" ")}`.toLowerCase().includes(needle)) return false;
    const where = place.trim().toLowerCase();
    if (where && !(`${j.location || ""} ${j.remote || ""}`.toLowerCase().includes(where))) return false;
    if (skip !== "types" && types.size && !types.has(j.work_type)) return false;
    if (skip !== "places" && places.size && !places.has(j.remote || "")) return false;
    if (skip !== "pay" && pay.size && !PAY.some(([k, , f]) => pay.has(k) && f(j))) return false;
    if (skip !== "hours" && hours.size && !HOURS.some(([k, , f]) => hours.has(k) && f(j))) return false;
    if (skip !== "sen" && sen.size && !sen.has(j.seniority || "")) return false;
    if (skip !== "fns" && fns.size && !fns.has(j.function || "")) return false;
    return true;
  };
  const list = useMemo(() => rows.filter((j) => passes(j)), [rows, q, place, types, places, pay, hours, sen, fns]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = (skip: string, test: (j: JobRow) => boolean) => rows.filter((j) => passes(j, skip) && test(j)).length;

  const save = async (id: number, next: boolean) => {
    if (!signedIn) { window.location.href = `/login?next=/opportunities`; return; }
    const n = new Set(saved); if (next) n.add(id); else n.delete(id); setSaved(n);
    const r = await fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, save: next }) });
    if (!r.ok) setNote("Couldn't save that. Try again.");
  };

  const summary = [types.size ? [...types].map((t) => TYPE_LABEL[t]).join(", ") : "", places.size ? [...places].map((p) => PLACES.find(([k]) => k === p)?.[1]).join(", ") : "", pay.size ? [...pay].map((p) => PAY.find(([k]) => k === p)?.[1]).join(", ") : ""].filter(Boolean).join(" · ");
  const chip = (on: boolean) => `px-[14px] py-[8px] rounded-full text-[13.5px] font-semibold border transition-colors ${on ? "bg-ink text-white border-ink" : "bg-white border-hair hover:border-ink"}`;
  const Side = ({ title, items, set, setter, skip }: { title: string; items: [string, string, (j: JobRow) => boolean][]; set: Set<string>; setter: (s: Set<string>) => void; skip: string }) => (
    <div className="mb-6">
      <div className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2">{title}</div>
      {items.map(([k, label, f]) => (
        <label key={k} className="flex items-center gap-[10px] py-[5px] text-[14px] cursor-pointer">
          <input type="checkbox" checked={set.has(k)} onChange={() => toggle(set, setter, k)} className="accent-[#7C1226]" /><span className="flex-1">{label}</span><span className="text-[12px] text-ink/50 tabular-nums">{count(skip, f)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <BrandShell source="opportunities">
      <section className="bg-blue">
        <div className={`${WRAP} py-[clamp(36px,5vw,64px)]`}>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] uppercase text-dred"><span className="inline-flex w-[26px] h-[26px] rounded-full bg-dred text-white items-center justify-center font-lora text-[15px] leading-none" aria-hidden>$</span>Opportunities</div>
              <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,5vw,50px)] mt-2">Find your next opportunity. However you work.</h1>
            </div>
            <p className="text-[14.5px] leading-[1.5] text-ink/75 md:max-w-[300px] md:text-right">Explore curated full-time, fractional, consulting, project, and advisory opportunities from companies looking for experienced professionals.</p>
          </div>
          <div className="mt-7 bg-white rounded-[14px] border border-hair p-[6px] grid md:grid-cols-[1.4fr_1fr_auto] gap-[6px]">
            <input value={q} onChange={(e) => { setQ(e.target.value); setShown(20); }} placeholder="Role, company or skill" className="px-5 py-[13px] text-[15px] rounded-[10px] focus:outline-none focus:bg-beige" />
            <input value={place} onChange={(e) => { setPlace(e.target.value); setShown(20); }} placeholder="Remote or city" className="px-5 py-[13px] text-[15px] rounded-[10px] md:border-l border-hair focus:outline-none focus:bg-beige" />
            <button type="button" className="px-7 py-[13px] rounded-[10px] bg-ink text-white text-[13px] font-bold tracking-[0.08em] uppercase">Search</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {WORK_TYPES.map((t) => <button key={t} type="button" onClick={() => toggle(types, setTypes, t)} className={chip(types.has(t))}>{TYPE_LABEL[t]}</button>)}
            <span className="w-px h-6 bg-ink/15 mx-1 hidden sm:block" />
            {PLACES.map(([k, l]) => <button key={k} type="button" onClick={() => toggle(places, setPlaces, k)} className={chip(places.has(k))}>{l}</button>)}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className={`${WRAP} py-10 grid lg:grid-cols-[220px_1fr] gap-10`}>
          <aside className="hidden lg:block">
            <div className="bg-dred text-white rounded-[12px] p-5 mb-7">
              <div className="font-lora text-[20px] leading-[1.15]">Hiring? Tell us about the role.</div>
              <p className="text-[13px] text-white/80 mt-2 leading-[1.5]">Send us the listing and we&apos;ll put it in front of the right people.</p>
              <a href="mailto:hello@marquee.bio?subject=A%20role%20for%20Marquee%20Opportunities" className="inline-block mt-4 text-[12px] font-bold tracking-[0.08em] uppercase bg-white text-dred rounded-full px-4 py-[9px]">Send a role</a>
            </div>
            <Side title="Compensation" items={PAY} set={pay} setter={setPay} skip="pay" />
            <Side title="Hours per week" items={HOURS} set={hours} setter={setHours} skip="hours" />
            <Side title="Seniority" items={SENIORITY.filter((s) => s !== "other").map((s) => [s, SENIORITY_LABEL[s], (j: JobRow) => j.seniority === s] as [string, string, (j: JobRow) => boolean])} set={sen} setter={setSen} skip="sen" />
            <Side title="Function" items={FUNCTIONS.filter((f) => f !== "other").map((f) => [f, FUNCTION_LABEL[f], (j: JobRow) => j.function === f] as [string, string, (j: JobRow) => boolean])} set={fns} setter={setFns} skip="fns" />
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[14px]">
              <div><b>{list.length} {list.length === 1 ? "opportunity" : "opportunities"}</b>{summary && <span className="text-ink/60"> · {summary}</span>}</div>
              <div className="text-ink/60">Sort: <b className="text-ink">Newest</b></div>
            </div>
            {note && <div className="text-[13px] text-dred mb-3">{note}</div>}
            {!loaded && <div className="text-[14px] text-ink/60">Loading…</div>}
            {loaded && list.length === 0 && <div className="bg-white border border-hair rounded-[14px] p-8 text-[15px] text-ink/70">{rows.length ? "Nothing matches those filters yet." : "The first opportunities are on their way."}</div>}
            <div className="grid gap-3">
              {list.slice(0, shown).map((j) => <JobCard key={j.id} j={j} saved={saved.has(j.id)} onSave={save} />)}
            </div>
            {list.length > shown && <div className="text-center mt-6"><button type="button" onClick={() => setShown(shown + 20)} className="text-[12.5px] font-bold tracking-[0.08em] uppercase border border-ink rounded-full px-5 py-[10px] hover:bg-ink hover:text-white transition-colors">Load more</button></div>}
            {!signedIn && loaded && rows.length > 0 && <p className="text-[13.5px] text-ink/60 mt-8">Save opportunities and get found for the next one: <Link href="/join?src=opportunities" className="underline underline-offset-2 text-ink hover:text-dred">claim your Marquee</Link>.</p>}
          </div>
        </div>
      </section>
    </BrandShell>
  );
}
