"use client";
// "Find my media" — scans the person's own website for press, talks, podcasts, writing,
// videos and portfolio pieces, then lets them tick the ones to add. Nothing is added
// until they choose it.

import { useState } from "react";

type Item = { kind: string; title: string; outlet: string; url: string; foundOn: string; check?: boolean };
type Found = { site: string; siteTitle: string; pages: string[]; items: Item[]; socials: Record<string, string> };
export type NewMedia = { kind: string; title: string; outlet: string; url: string; featured: boolean };

const SOCIAL_LABEL: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", x: "X", tiktok: "TikTok", youtube: "YouTube", substack: "Substack" };
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const same = (a: string, b: string) => a.replace(/\/$/, "").toLowerCase() === b.replace(/\/$/, "").toLowerCase();

export function SiteScan({ website, have, emptySocials, onAdd, onSocials }: {
  website: string;                      // from About You, as a starting point
  have: string[];                       // links already in the person's media
  emptySocials: string[];               // social links the person hasn't filled in
  onAdd: (items: NewMedia[]) => void;
  onSocials: (found: Record<string, string>) => void;
}) {
  const [url, setUrl] = useState(website);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState(0);
  const [socialsAdded, setSocialsAdded] = useState(false);

  const scan = async () => {
    setErr(""); setFound(null); setAdded(0); setSocialsAdded(false);
    if (!url.trim()) { setErr("Add your website address first."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/scan-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "We couldn't read that website. Please try again."); return; }
      setFound(j);
      // everything new starts ticked; things already in your media are left out
      setOn(Object.fromEntries((j.items as Item[]).filter((i) => !have.some((h) => same(h, i.url))).map((i) => [i.url, true])));
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    finally { setBusy(false); }
  };

  const fresh = (found?.items || []).filter((i) => !have.some((h) => same(h, i.url)));
  const already = (found?.items.length || 0) - fresh.length;
  const picked = fresh.filter((i) => on[i.url]);
  const kinds = Array.from(new Set(fresh.map((i) => i.kind)));
  const newSocials = Object.entries(found?.socials || {}).filter(([k]) => emptySocials.includes(k));
  const add = () => { onAdd(picked.map((i) => ({ kind: i.kind, title: i.title, outlet: i.outlet, url: i.url, featured: false }))); setAdded(picked.length); setOn({}); };

  return (
    <div className="border border-[#E1DED7] bg-[#FFFFFF] p-[18px] mb-6 max-w-[980px]">
      <div className="font-sans text-[14px] font-semibold mb-1">Find my media</div>
      <p className="text-[13px] text-[#7d7a74] leading-[1.5] mb-3">Enter your website and we&apos;ll look for your press, talks, podcasts, writing and videos. You choose what gets added.</p>
      <div className="flex gap-[8px]">
        <label htmlFor="scan-url" className="sr-only">Your website</label>
        <input id="scan-url" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !busy) scan(); }} placeholder="yoursite.com" className="flex-1 min-w-0 font-inter text-[13.5px] py-[9px] px-[11px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink" />
        <button onClick={scan} disabled={busy} className="bg-brand-ink text-white font-sans text-[13px] font-semibold py-[9px] px-[16px] whitespace-nowrap disabled:opacity-50">{busy ? "Reading your site…" : found ? "Scan again" : "Scan my site"}</button>
      </div>
      {busy && <p className="text-[12.5px] text-[#7d7a74] mt-2" role="status">This takes up to half a minute.</p>}
      {err && <p className="text-[12.5px] text-[#AB0000] mt-2" role="alert">{err}</p>}

      {found && !busy && (
        <div className="mt-4">
          {fresh.length === 0 ? (
            <p className="text-[13px] text-[#3a352f] leading-[1.5]">{already > 0 ? `We found ${already} ${already === 1 ? "piece" : "pieces"}, and ${already === 1 ? "it is" : "they are all"} already in your media.` : `We read ${found.pages.length} ${found.pages.length === 1 ? "page" : "pages"} on ${host(found.site)} and didn't find media links. You can add pieces by hand below.`}</p>
          ) : added > 0 ? (
            <p className="text-[13px] text-[#3a352f] leading-[1.5]" role="status">Added {added} {added === 1 ? "piece" : "pieces"} to your media below. Check each title, then star your best.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div className="font-sans text-[13px] font-semibold">Found {fresh.length} on {host(found.site)}{already > 0 ? `, plus ${already} you already have` : ""}</div>
                <div className="flex gap-[12px] font-sans text-[12px]">
                  <button onClick={() => setOn(Object.fromEntries(fresh.map((i) => [i.url, true])))} className="underline underline-offset-2 text-[#7d7a74] hover:text-brand-ink">Select all</button>
                  <button onClick={() => setOn({})} className="underline underline-offset-2 text-[#7d7a74] hover:text-brand-ink">Select none</button>
                </div>
              </div>
              {kinds.length > 1 && <div className="flex flex-wrap gap-[6px] mb-2">{kinds.map((k) => { const group = fresh.filter((i) => i.kind === k); const all = group.every((i) => on[i.url]); return <button key={k} aria-pressed={all} onClick={() => setOn((c) => ({ ...c, ...Object.fromEntries(group.map((i) => [i.url, !all])) }))} className={`font-sans text-[12px] py-[4px] px-[10px] border ${all ? "border-brand-ink bg-[#F1EEE8]" : "border-[#E1DED7] bg-white text-[#7d7a74]"}`}>{k} · {group.length}</button>; })}</div>}
              <div className="border border-[#E1DED7] bg-white max-h-[340px] overflow-y-auto">
                {fresh.map((i) => (
                  <label key={i.url} className="flex items-start gap-[10px] py-[10px] px-[12px] border-b border-[#F1EEE8] last:border-b-0 cursor-pointer hover:bg-[#FFFFFF]">
                    <input type="checkbox" checked={!!on[i.url]} onChange={() => setOn((c) => ({ ...c, [i.url]: !c[i.url] }))} className="mt-[3px]" />
                    <span className="min-w-0">
                      <span className="block font-sans text-[13.5px] font-semibold leading-snug">{i.title}</span>
                      <span className="block text-[12px] text-[#7d7a74] truncate">{i.kind}{i.outlet ? ` · ${i.outlet}` : ""} · {host(i.url)}</span>
                      {i.check && <span className="block text-[12px] text-[#AB0000]">We couldn&apos;t open this page, so the title comes from its web address. Check it after adding.</span>}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-[12px] mt-3">
                <button onClick={add} disabled={picked.length === 0} className="bg-brand-ink text-white font-sans text-[13px] font-semibold py-[9px] px-[16px] disabled:opacity-40">Add {picked.length} to my media</button>
                <span className="text-[12px] text-[#7d7a74]">You can edit or remove anything after.</span>
              </div>
            </>
          )}
          {newSocials.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#ECEAE4] flex flex-wrap items-center gap-[10px]">
              {socialsAdded
                ? <span className="text-[12.5px] text-[#3a352f]" role="status">Added. You&apos;ll find {newSocials.length === 1 ? "it" : "them"} under Links in About You, and as {newSocials.length === 1 ? "an icon" : "icons"} in your profile header.</span>
                : <><span className="text-[12.5px] text-[#3a352f] leading-[1.5]">Your site links to your {newSocials.map(([k]) => SOCIAL_LABEL[k] || k).join(" and ")}, and {newSocials.length === 1 ? "it isn't" : "they aren't"} in your profile links yet. This isn&apos;t media: it adds the {newSocials.length === 1 ? "icon" : "icons"} to your profile header.</span><button onClick={() => { onSocials(Object.fromEntries(newSocials)); setSocialsAdded(true); }} className="font-sans text-[12.5px] font-semibold underline underline-offset-2 whitespace-nowrap">Add to my profile links</button></>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
