"use client";
// The Featured feed with its filter tabs. Items arrive already published and in order.
import { useState } from "react";

export type FeedItem = { id: number; kind: string; title: string; blurb: string | null; url: string | null; image_url: string | null; when: string };
const TABS: [string, string][] = [["all", "All"], ["Opportunity", "Opportunities"], ["Event", "Events"], ["Education", "Education"], ["Article", "Articles"]];
const tone = (k: string) => /article|interview|essay/i.test(k) ? "bg-purple" : /education|workshop|cohort|guide|course/i.test(k) ? "bg-blue" : "bg-beige";

export default function FeaturedFeed({ items }: { items: FeedItem[] }) {
  const [tab, setTab] = useState("all");
  const [shown, setShown] = useState(6);
  const present = new Set(items.map((i) => i.kind));
  const tabs = TABS.filter(([k]) => k === "all" || present.has(k));
  const list = items.filter((i) => tab === "all" || i.kind === tab);
  return (
    <div>
      {tabs.length > 2 && (
        <div className="flex flex-wrap border border-ink mb-2 w-fit max-w-full">
          {tabs.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setShown(6); }} className={`text-[11px] font-bold tracking-[0.14em] uppercase px-3 sm:px-4 py-[10px] border-r border-b sm:border-b-0 border-ink last:border-r-0 ${tab === k ? "bg-ink text-white" : "hover:bg-beige"}`}>{l}</button>)}
        </div>
      )}
      <ul>
        {list.slice(0, shown).map((i) => (
          <li key={i.id} className="grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[140px_minmax(0,1fr)] gap-4 sm:gap-5 py-6 border-b border-ink/80">
            {i.image_url ? <img src={i.image_url} alt="" className="w-full aspect-[4/3] object-cover" /> : <div className={`w-full aspect-[4/3] ${tone(i.kind)}`} aria-hidden />}
            <div>
              <div className="flex items-center gap-3 text-[11px]"><span className="font-bold tracking-[0.14em] uppercase text-dred">{i.kind}</span><span className="text-ink/55">{i.when}</span></div>
              <a href={i.url || "#"} target={i.url && !i.url.startsWith("/") ? "_blank" : undefined} rel="noopener" className="font-lora text-[clamp(21px,2.4vw,28px)] leading-[1.15] mt-2 block hover:underline">{i.title}</a>
              {i.blurb && <p className="text-[14px] leading-[1.5] text-ink/70 mt-2">{i.blurb}</p>}
            </div>
          </li>
        ))}
      </ul>
      {list.length > shown && <button onClick={() => setShown((n) => n + 6)} className="w-full py-4 text-[11px] font-bold tracking-[0.14em] uppercase hover:text-dred">Load more ↓</button>}
    </div>
  );
}
