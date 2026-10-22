"use client";
// marquee.bio/opportunities: the board. Search, work-type and place chips, sidebar filters with counts. No account needed to browse.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import JobCard, { type JobRow } from "./JobCard";
import { shortLocation } from "@/lib/opportunities-display";
import { WORK_TYPES, TYPE_LABEL, FUNCTIONS, FUNCTION_LABEL, SENIORITY, SENIORITY_LABEL } from "@/lib/opportunities";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const PLACES: [string, string][] = [["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"]];
const top = (j: JobRow) => j.pay_max || j.pay_min || 0;
const PAY: [string, string, (j: JobRow) => boolean][] = [
  ["h100", "$100+ an hour", (j) => j.pay_per === "hour" && top(j) >= 100],
  ["h150", "$150+ an hour", (j) => j.pay_per === "hour" && top(j) >= 150],
  ["h200", "$200+ an hour", (j) => j.pay_per === "hour" && top(j) >= 200],
  ["m5", "$5K+ a month", (j) => j.pay_per === "month" && top(j) >= 5000],
  ["m10", "$10K+ a month", (j) => j.pay_per === "month" && top(j) >= 10000],
  ["y100", "$100K+ a year", (j) => j.pay_per === "year" && top(j) >= 100000],
  ["y150", "$150K+ a year", (j) => j.pay_per === "year" && top(j) >= 150000],
  ["y200", "$200K+ a year", (j) => j.pay_per === "year" && top(j) >= 200000],
];
const HOURS: [string, string, (j: JobRow) => boolean][] = [
  ["u10", "Under 10 a week", (j) => !!j.hours_per_week && j.hours_per_week < 10],
  ["10-20", "10–20 a week", (j) => !!j.hours_per_week && j.hours_per_week >= 10 && j.hours_per_week <= 20],
  ["20-40", "20–40 a week", (j) => !!j.hours_per_week && j.hours_per_week > 20 && j.hours_per_week <= 40],
  ["ft", "Full-time", (j) => j.work_type === "full-time"],
];
/** Location options come from the roles on the board: the remote kinds first, then the cities that appear. */
const locationItems = (rows: JobRow[]): [string, string, (j: JobRow) => boolean][] => {
  const fixed: [string, string, (j: JobRow) => boolean][] = [
    ["us-remote", "US · Remote", (j) => shortLocation(j.location) === "US · Remote" || (j.remote === "remote" && !j.location)],
    ["global-remote", "Global · Remote", (j) => shortLocation(j.location) === "Global · Remote"],
    ["hybrid", "Hybrid", (j) => j.remote === "hybrid"],
    ["onsite", "On-site", (j) => j.remote === "onsite"],
  ];
  const counts = new Map<string, number>();
  for (const j of rows) { const l = shortLocation(j.location); if (l && !/remote/i.test(l)) counts.set(l, (counts.get(l) || 0) + 1); }
  const cities = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([l]) => [`city:${l}`, l, (j: JobRow) => shortLocation(j.location) === l] as [string, string, (j: JobRow) => boolean]);
  return [...fixed, ...cities];
};

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
  const [locs, setLocs] = useState<Set<string>>(new Set());
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
    if (skip !== "locs" && locs.size && !LOCS.some(([k, , f]) => locs.has(k) && f(j))) return false;
    return true;
  };
  const LOCS = useMemo(() => locationItems(rows), [rows]);
  const list = useMemo(() => rows.filter((j) => passes(j)), [rows, q, place, types, places, pay, hours, sen, fns, locs]); // eslint-disable-line react-hooks/exhaustive-deps
  const featured = useMemo(() => list.filter((j) => j.featured), [list]);
  const rest = useMemo(() => list.filter((j) => !j.featured), [list]);
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
      {items.filter(([, , f]) => !rows.length || set.size || rows.some(f)).map(([k, label, f]) => (
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
            <div className="md:max-w-[300px] md:text-right"><p className="text-[14.5px] leading-[1.5] text-ink/75">Explore curated full-time, fractional, consulting, project, and advisory opportunities from companies looking for experienced professionals.</p><Link href="/opportunities/post" className="lg:hidden inline-block mt-3 text-[12.5px] font-semibold underline underline-offset-2 hover:text-dred">Hiring? Post an opportunity</Link></div>
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
        <div className={`${WRAP} py-10 grid lg:grid-cols-[250px_1fr] gap-10`}>
          <aside className="hidden lg:block">
            <div className="bg-dred text-white rounded-[12px] p-5 mb-7">
              <div className="font-lora text-[20px] leading-[1.15]">Hiring? Post an opportunity.</div>
              <p className="text-[13px] text-white/80 mt-2 leading-[1.5]">Free during the beta. We review every one before it goes live.</p>
              <Link href="/opportunities/post" className="block w-full text-center whitespace-nowrap mt-4 text-[11.5px] font-bold tracking-[0.06em] uppercase bg-white text-dred rounded-full px-3 py-[10px] hover:bg-beige transition-colors">Post an opportunity</Link>
            </div>
            <Side title="Location" items={LOCS} set={locs} setter={setLocs} skip="locs" />
            <Side title="Pay" items={PAY} set={pay} setter={setPay} skip="pay" />
            <Side title="Hours" items={HOURS} set={hours} setter={setHours} skip="hours" />
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
            {featured.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-3 mb-3"><span className="text-[11px] font-bold tracking-[0.16em] uppercase bg-dred text-white rounded-full px-[10px] py-[4px]">Featured</span><span className="text-[13.5px] text-ink">Roles the Marquee team is highlighting this week.</span></div>
                <div className="grid gap-3 p-3 rounded-[18px] bg-[#EDE7FF]">{featured.map((j) => <JobCard key={j.id} j={j} saved={saved.has(j.id)} onSave={save} />)}</div>
              </section>
            )}
            <div className="grid gap-3">
              {rest.slice(0, shown).map((j, i) => (
                <div key={j.id} className="contents">
                  <JobCard j={j} saved={saved.has(j.id)} onSave={save} />
                  {i === 2 && !signedIn && <PromoCard />}
                </div>
              ))}
            </div>
            {rest.length > shown && <div className="text-center mt-6"><button type="button" onClick={() => setShown(shown + 20)} className="text-[12.5px] font-bold tracking-[0.08em] uppercase border border-ink rounded-full px-5 py-[10px] hover:bg-ink hover:text-white transition-colors">Load more</button></div>}
            {!signedIn && loaded && rows.length > 0 && <PromoBand />}
          </div>
        </div>
      </section>
    </BrandShell>
  );
}

/* Marquee for professionals, on the board. One the size of a listing, one band under the list. */
function PromoCard() {
  return (
    <aside className="bg-[#EDE7FF] rounded-[14px] p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
      <div>
        <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-dred">Marquee for professionals</div>
        <h3 className="font-lora text-[24px] leading-[1.12] mt-2">Get found for roles like these.</h3>
        <p className="text-[14.5px] leading-[1.55] text-ink mt-2 max-w-[560px]">One link with your experience, skills, rates and availability. Companies on Marquee can ask for it when you apply. Founding Member pricing during the beta.</p>
      </div>
      <Link href="/join?src=opportunities" className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-6 py-[13px] hover:bg-red transition-colors whitespace-nowrap">Claim your Marquee</Link>
    </aside>
  );
}
function PromoBand() {
  return (
    <aside className="mt-8 bg-dred text-white rounded-[14px] p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-5 items-center">
      <div>
        <h3 className="font-lora text-[clamp(24px,3vw,32px)] leading-[1.1]">Get hired. Get booked. Sell your products. Get paid.</h3>
        <p className="text-[15px] leading-[1.55] text-white/90 mt-2 max-w-[600px]">Build your Marquee once: profile, services, booking and store in one link. Save roles here, apply with your Marquee, and get discovered by the companies posting them.</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <Link href="/join?src=opportunities" className="inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-white text-dred rounded-full px-6 py-[13px] hover:bg-beige transition-colors whitespace-nowrap">Claim your Marquee</Link>
        <span className="text-[13px] text-white/80">Founding Members: $20 a month or $200 a year.</span>
      </div>
    </aside>
  );
}
