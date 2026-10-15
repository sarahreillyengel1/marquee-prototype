"use client";
// A member's own numbers: who is visiting, what they look at, what has been booked, what has sold, and who the customers are.
import { useEffect, useState } from "react";
import Link from "next/link";
import { SalesPanel } from "@/app/build-preview/SalesPanel";

type Count = { name: string; n: number };
type Data = { published: boolean; username?: string; visits?: { total: number; last30: number; people30: number; byDay: { date: string; n: number }[]; pages: Count[]; sources: Count[]; devices: Count[]; countries: Count[] }; bookings?: { total: number; upcoming: number; requests: number; paid: string; people: number } };

const card = "bg-white border border-[#E1DED7] p-[18px]";
const label = "font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-2";
const big = "font-lora text-[34px] leading-none";

function Bars({ days }: { days: { date: string; n: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.n));
  return (
    <div className="flex items-end gap-[3px] h-[72px]" aria-label="Visits per day, last 30 days">
      {days.map((d) => <div key={d.date} title={`${d.date}: ${d.n}`} className="flex-1 bg-[#670821]" style={{ height: `${Math.max(2, (d.n / max) * 100)}%`, opacity: d.n ? 1 : 0.18 }} />)}
    </div>
  );
}
function List({ title, rows, empty }: { title: string; rows: Count[]; empty: string }) {
  const total = rows.reduce((n, r) => n + r.n, 0) || 1;
  return (
    <div className={card}>
      <div className={label}>{title}</div>
      {rows.length === 0 ? <div className="text-[13.5px] text-[#7d7a74]">{empty}</div> : (
        <div className="space-y-[7px]">
          {rows.slice(0, 8).map((r) => (
            <div key={r.name} className="text-[13.5px]">
              <div className="flex justify-between gap-3"><span className="truncate">{r.name}</span><span className="text-[#7d7a74] tabular-nums">{r.n}</span></div>
              <div className="h-[3px] bg-[#F1EEE8] mt-[3px]"><div className="h-full bg-[#670821]" style={{ width: `${(r.n / total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/analytics").then(async (r) => { if (r.status === 401) { window.location.href = "/login?next=/analytics"; return; } const j = await r.json(); if (!r.ok) setErr(j.error || "Couldn't load."); else setD(j); }).catch(() => setErr("Couldn't load."));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-brand-ink font-inter">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E1DED7] bg-white">
        <span className="font-sans text-[13px] font-medium tracking-[0.26em]">MARQUEE</span>
        <div className="flex items-center gap-4 text-[13px]">
          {d?.username && <Link href={`/${d.username}`} className="text-[#7d7a74] hover:text-brand-ink">View profile</Link>}
          <Link href="/build-preview" className="font-sans font-semibold bg-brand-ink text-white py-[8px] px-[14px] hover:bg-[#670821]">Edit profile</Link>
        </div>
      </div>
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-2">Analytics</div>
        <h1 className="font-lora text-[36px] leading-[1.05] mb-2">Your numbers.</h1>
        <p className="text-[14.5px] text-[#7d7a74] mb-8">Visits, bookings, sales and customers for your Marquee. Only you can see this.</p>

        {err && <div className={card}>{err}</div>}
        {!d && !err && <div className="text-[14px] text-[#7d7a74]">Loading…</div>}
        {d && !d.published && <div className={card}><p className="text-[15px]">Publish your profile first, then your numbers show up here.</p><Link href="/build-preview" className="inline-block mt-3 font-sans text-[13px] font-semibold underline">Open the builder</Link></div>}

        {d?.published && d.visits && d.bookings && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className={card}><div className={label}>Visits, last 30 days</div><div className={big}>{d.visits.last30.toLocaleString()}</div><div className="text-[12.5px] text-[#7d7a74] mt-1">{d.visits.people30.toLocaleString()} people · {d.visits.total.toLocaleString()} all time</div></div>
              <div className={card}><div className={label}>Bookings</div><div className={big}>{d.bookings.total}</div><div className="text-[12.5px] text-[#7d7a74] mt-1">{d.bookings.upcoming} upcoming · {d.bookings.requests} requests</div></div>
              <div className={card}><div className={label}>Booked, paid</div><div className={big}>{d.bookings.paid}</div><div className="text-[12.5px] text-[#7d7a74] mt-1">{d.bookings.people} {d.bookings.people === 1 ? "person" : "people"}</div></div>
              <div className={card}><div className={label}>Your link</div><div className="font-sans text-[15px] font-semibold break-all">marquee.bio/{d.username}</div><div className="text-[12.5px] text-[#7d7a74] mt-1">and /links for your bio</div></div>
            </div>
            <div className={`${card} mb-3`}><div className={label}>Visits per day, last 30 days</div><Bars days={d.visits.byDay} /></div>
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              <List title="What they looked at" rows={d.visits.pages} empty="No visits in the last 30 days." />
              <List title="Where they came from" rows={d.visits.sources} empty="No visits in the last 30 days." />
              <List title="Phone or computer" rows={d.visits.devices} empty="No visits in the last 30 days." />
              <List title="Countries" rows={d.visits.countries} empty="No visits in the last 30 days." />
            </div>
            <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-3">Sales and customers</div>
            <SalesPanel />
          </>
        )}
      </div>
    </div>
  );
}
