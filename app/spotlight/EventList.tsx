"use client";
// Upcoming events with an In person / Online filter.
import { useState } from "react";

export type EventRow = { id: number; title: string; kind: string | null; place: string | null; price: string | null; url: string | null; cta: string | null; month: string; day: string; when: string };
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1] text-[clamp(40px,6vw,72px)]";

export default function EventList({ events }: { events: EventRow[] }) {
  const [tab, setTab] = useState("all");
  const online = (e: EventRow) => /online|virtual|zoom/i.test(`${e.kind} ${e.place}`);
  const list = events.filter((e) => tab === "all" || (tab === "online" ? online(e) : !online(e)));
  const both = events.some(online) && events.some((e) => !online(e));
  return (
    <div>
      <div className="flex items-end justify-between gap-6 flex-wrap border-b-2 border-ink pb-4">
        <h2 className={H2}>Events</h2>
        {both && (
          <div className="inline-flex border border-ink mb-1">
            {[["all", "All"], ["person", "In person"], ["online", "Online"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-[9px] border-r border-ink last:border-r-0 ${tab === k ? "bg-ink text-white" : "hover:bg-beige"}`}>{l}</button>)}
          </div>
        )}
      </div>
      <ul>
        {list.map((e) => (
          <li key={e.id} className="grid grid-cols-[64px_1fr] md:grid-cols-[64px_1fr_auto] gap-x-6 gap-y-3 items-center py-6 border-b border-hair">
            <div className="text-center leading-none"><div className="text-[11px] font-bold tracking-[0.14em] uppercase text-dred">{e.month}</div><div className="font-lora text-[40px] mt-1">{e.day}</div></div>
            <div>
              <div className="flex gap-2 flex-wrap mb-2">
                {e.kind && <span className="text-[10.5px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] bg-ink text-white">{e.kind}</span>}
                {e.price && <span className="text-[10.5px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] bg-beige">{e.price}</span>}
              </div>
              <a href={e.url || "#"} target="_blank" rel="noopener" className="font-lora text-[clamp(22px,2.6vw,30px)] leading-[1.15] hover:underline">{e.title}</a>
              <div className="text-[13.5px] text-ink/65 mt-1">{[e.when, e.place].filter(Boolean).join(" · ")}</div>
            </div>
            {e.url && <a href={e.url} target="_blank" rel="noopener" className="col-start-2 md:col-start-3 justify-self-start md:justify-self-end inline-flex items-center gap-2 font-inter font-semibold text-[13px] px-4 py-[10px] bg-dred text-white hover:bg-red">{e.cta || "RSVP"}</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}
