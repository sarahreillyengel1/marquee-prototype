"use client";
// One job on the board. Sky blue leads; wine, lavender and vermillion are the small accents.
import Link from "next/link";
import { TYPE_LABEL, FUNCTION_LABEL, REMOTE_LABEL, payLabel, timeAgo } from "@/lib/opportunities";

export type JobRow = {
  id: number; slug: string; title: string; company: string; company_url: string | null; company_blurb: string | null;
  work_type: string; function: string | null; seniority: string | null; location: string | null; remote: string | null;
  pay_min: number | null; pay_max: number | null; pay_per: string | null; pay_note: string | null;
  hours_per_week: number | null; start_text: string | null; length_text: string | null; skills: string[];
  source: string | null; featured: boolean; published_at: string | null; last_checked_at: string | null; deadline: string | null; require_marquee?: string | null;
};

export const initials = (company: string) => company.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
export const whereLabel = (j: Pick<JobRow, "location" | "remote">) => { const r = j.remote && j.remote !== "unknown" ? REMOTE_LABEL[j.remote] : ""; return [j.location, r && !(j.location || "").toLowerCase().includes(r.toLowerCase()) ? r : ""].filter(Boolean).join(" · "); };
export const timeLabel = (j: Pick<JobRow, "hours_per_week" | "start_text" | "length_text" | "work_type">) => {
  const bits = [j.hours_per_week ? `${j.hours_per_week} hrs a week` : "", j.length_text || "", j.start_text ? `Starts ${j.start_text}` : ""].filter(Boolean);
  if (!bits.length && j.work_type === "full-time") return "Full-time";
  return bits.slice(0, 2).join(" · ");
};

export default function JobCard({ j, saved, onSave }: { j: JobRow; saved?: boolean; onSave?: (id: number, next: boolean) => void }) {
  const pay = payLabel(j);
  return (
    <article className="bg-white border border-hair rounded-[14px] p-5 sm:p-6 flex gap-4 sm:gap-5 items-start">
      <div className="shrink-0 w-[46px] h-[46px] rounded-[10px] bg-blue text-ink font-semibold text-[14px] flex items-center justify-center">{initials(j.company)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
          <div className="min-w-0">
            <h3 className="text-[17.5px] font-semibold leading-[1.25] flex flex-wrap items-center gap-2">
              <Link href={`/opportunities/${j.slug}`} className="hover:text-dred">{j.title}</Link>
              {j.featured && <span className="inline-block text-[10px] font-bold tracking-[0.12em] uppercase bg-dred text-white rounded-full px-[8px] py-[3px]">Featured</span>}
            </h3>
            <div className="text-[14px] text-ink/70 mt-[3px]">{j.company}{whereLabel(j) ? ` · ${whereLabel(j)}` : ""}</div>
          </div>
          <div className="text-right shrink-0">
            {pay && <div className="font-lora text-[22px] leading-none text-dred">{pay}</div>}
            <div className="text-[12.5px] text-ink/65 mt-[6px]">{timeLabel(j)}</div>
            <div className="text-[12px] text-ink/50 mt-[2px]">{timeAgo(j.published_at)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[12px] font-semibold bg-[#EDE7FF] text-ink rounded-full px-[10px] py-[4px]">{TYPE_LABEL[j.work_type] || j.work_type}</span>
          {j.function && <span className="text-[12px] font-semibold bg-beige text-ink rounded-full px-[10px] py-[4px]">{FUNCTION_LABEL[j.function]}</span>}
          {j.require_marquee === "yes" && <span className="text-[12px] font-semibold bg-dred text-white rounded-full px-[10px] py-[4px]">Marquee required</span>}
          {j.skills.slice(0, 2).map((s) => <span key={s} className="text-[12px] bg-beige text-ink/80 rounded-full px-[10px] py-[4px]">{s}</span>)}
          <span className="ml-auto flex items-center gap-2">
            {onSave && <button type="button" onClick={() => onSave(j.id, !saved)} aria-label={saved ? "Unsave" : "Save"} className={`w-[34px] h-[34px] rounded-full border flex items-center justify-center transition-colors ${saved ? "bg-ink text-white border-ink" : "border-hair text-ink hover:border-ink"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
            </button>}
            <Link href={`/opportunities/${j.slug}`} className="text-[12.5px] font-semibold tracking-[0.06em] uppercase border border-ink rounded-full px-[14px] py-[7px] hover:bg-ink hover:text-white transition-colors">View</Link>
          </span>
        </div>
      </div>
    </article>
  );
}
