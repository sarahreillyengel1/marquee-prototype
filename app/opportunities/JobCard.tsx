"use client";
// One opportunity on the board. Sky blue leads; wine, lavender and vermillion are the small accents.
// Layout: initials | title + company | a fixed right column (pay, time) so nothing ever wraps under anything. Tags below.
import Link from "next/link";
import { TYPE_LABEL, FUNCTION_LABEL } from "@/lib/opportunities";
import { initials, titleCase, cap, cardPay, placeTags } from "@/lib/opportunities-display";
export { initials, titleCase, cap, cardPay, shortLocation, placeTags, whereLabel, timeLabel } from "@/lib/opportunities-display";

export type JobRow = {
  id: number; slug: string; title: string; company: string; company_url: string | null; company_blurb: string | null;
  work_type: string; function: string | null; seniority: string | null; location: string | null; remote: string | null;
  pay_min: number | null; pay_max: number | null; pay_per: string | null; pay_note: string | null;
  hours_per_week: number | null; start_text: string | null; length_text: string | null; skills: string[];
  source: string | null; featured: boolean; published_at: string | null; last_checked_at: string | null; deadline: string | null; require_marquee?: string | null;
};

const TAG = "text-[13px] font-semibold rounded-full px-[12px] py-[5px] whitespace-nowrap";

export default function JobCard({ j, saved, onSave }: { j: JobRow; saved?: boolean; onSave?: (id: number, next: boolean) => void }) {
  const pay = cardPay(j);
  const fn = j.function ? FUNCTION_LABEL[j.function] : "";
  const skills = j.skills.map(titleCase).filter((s) => s.toLowerCase() !== fn.toLowerCase() && s.length <= 30).slice(0, 3);
  const place = placeTags(j);
  const facts: [string, string][] = [
    ["Type", TYPE_LABEL[j.work_type] || j.work_type],
    ["Hours", j.hours_per_week ? `${j.hours_per_week} a week` : j.work_type === "full-time" ? "Full-time" : "Not listed"],
    ["Location", place.join(" · ") || "Not listed"],
    j.start_text ? ["Start", cap(j.start_text)] : ["Length", j.length_text ? cap(j.length_text) : j.work_type === "full-time" ? "Ongoing" : "Not listed"],
  ];
  return (
    <article className="bg-white border border-hair rounded-[14px] p-5 sm:p-6 grid grid-cols-[46px_1fr] sm:grid-cols-[46px_1fr_200px] gap-x-4 sm:gap-x-5 gap-y-4 items-start">
      <div className="w-[46px] h-[46px] rounded-[10px] bg-blue text-ink font-semibold text-[14px] flex items-center justify-center">{initials(j.company)}</div>
      <div className="min-w-0">
        <h3 className="text-[18px] font-semibold leading-[1.25]">
          <Link href={`/opportunities/${j.slug}`} className="hover:text-dred">{j.title}</Link>
          {j.featured && <span className="inline-block align-middle ml-2 text-[10px] font-bold tracking-[0.12em] uppercase bg-dred text-white rounded-full px-[8px] py-[3px]">Featured</span>}
          {j.require_marquee === "yes" && <span className="inline-block align-middle ml-2 text-[10px] font-bold tracking-[0.12em] uppercase bg-dred text-white rounded-full px-[8px] py-[3px]">Marquee required</span>}
        </h3>
        <div className="text-[14.5px] text-ink mt-[4px] truncate">{j.company}</div>
      </div>
      <div className="col-start-2 sm:col-start-3 sm:text-right">
        <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink">Pay</div>
        {pay ? <div className="font-semibold text-[20px] leading-none text-dred tabular-nums whitespace-nowrap overflow-hidden text-ellipsis mt-[4px]" title={pay}>{pay}</div> : <div className="text-[14px] font-semibold text-ink leading-none mt-[6px]">Not listed</div>}
      </div>
      <div style={{ gridColumn: "2 / -1" }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-hair pt-3">
        {facts.map(([k, v]) => <div key={k} className="min-w-0"><div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink">{k}</div><div className="text-[14px] font-semibold text-ink mt-[3px] whitespace-nowrap overflow-hidden text-ellipsis" title={v}>{v}</div></div>)}
      </div>
      <div style={{ gridColumn: "2 / -1" }} className="flex flex-wrap items-center gap-2">
        {fn && <span className={`${TAG} bg-[#EDE7FF] text-ink`}>{fn}</span>}
        {skills.map((s) => <span key={s} className={`${TAG} bg-beige text-ink`}>{s}</span>)}
        <span className="ml-auto flex items-center gap-2">
          {onSave && <button type="button" onClick={() => onSave(j.id, !saved)} aria-label={saved ? "Unsave" : "Save"} className={`w-[34px] h-[34px] rounded-full border flex items-center justify-center transition-colors ${saved ? "bg-ink text-white border-ink" : "border-hair text-ink hover:border-ink"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
          </button>}
          <Link href={`/opportunities/${j.slug}`} className="text-[12.5px] font-semibold tracking-[0.06em] uppercase border border-ink rounded-full px-[14px] py-[7px] hover:bg-ink hover:text-white transition-colors whitespace-nowrap">View</Link>
        </span>
      </div>
    </article>
  );
}
