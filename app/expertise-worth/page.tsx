import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import DownloadForm from "./DownloadForm";
import { REPORTS } from "@/lib/reports";

// marquee.bio/expertise-worth: the landing page for the "What is your expertise worth?" report (PDF).
// Visitors leave a first name and email, the lead is saved (waitlist table, source "report-expertise-worth"),
// and they get the PDF. Until the file is in place the same form puts them on the list for when it is out.
// The PDF path and the ready switch live in lib/reports.ts.
const R = REPORTS["expertise-worth"];

export const metadata = {
  title: "What is your expertise worth? · Marquee",
  description: "A free Marquee report for experienced professionals on pricing your expertise. Download the PDF.",
};

// DRAFT COPY: not yet approved by Sarah word for word. Numbered in the 4 Nov 2026 hand-off for her to approve or rewrite.
const INSIDE = [
  "What experienced professionals charge for advisory, fractional and project work.",
  "How to put a number on your own expertise.",
  "Where the demand is, and how to be found for it on Marquee.",
];

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";

export default function ExpertiseWorthPage() {
  return (
    <BrandShell source="expertise-worth">
      <div className="font-inter text-ink bg-paper">

        {/* Hero: words left, form right */}
        <section className="py-[clamp(48px,7vw,104px)] border-b border-hair">
          <div className={`${WRAP} grid md:grid-cols-[1.15fr_1fr] gap-[clamp(32px,5vw,80px)] items-start`}>
            <div>
              <div className="text-[12px] font-bold tracking-[0.22em] uppercase text-dred">Free report</div>
              <h1 className="font-lora font-normal leading-[1.05] tracking-[-0.01em] text-[clamp(38px,6vw,76px)] mt-5">What is your expertise worth?</h1>
              <p className="text-[clamp(17px,2vw,21px)] leading-[1.5] mt-6 max-w-[560px]">
                A Marquee report for experienced professionals on pricing your expertise: what people charge, what the market pays, and how to set your own number.
              </p>
              <ul className="mt-9 max-w-[560px]">
                {INSIDE.map((l) => (
                  <li key={l} className="text-[16px] leading-[1.5] py-[12px] border-t border-hair flex gap-[14px] items-start">
                    <span className="mt-[9px] w-[7px] h-[7px] rounded-full bg-red shrink-0" />{l}
                  </li>
                ))}
              </ul>
            </div>
            <DownloadForm ready={R.ready} pdf={R.pdf} />
          </div>
        </section>

        {/* From Future Worth */}
        <section className="bg-beige py-[clamp(40px,5vw,72px)]">
          <div className={`${WRAP} md:flex items-end justify-between gap-10`}>
            <div className="max-w-[640px]">
              <div className="text-[12px] font-bold tracking-[0.22em] uppercase text-dred">Future Worth</div>
              <h2 className="font-lora font-normal leading-[1.1] text-[clamp(26px,3.4vw,40px)] mt-4">Conversations about money, careers, and what our expertise is worth.</h2>
              <p className="text-[16.5px] leading-[1.55] mt-4 text-ink/80">Future Worth is the content, community and events of Marquee. Essays, interviews, news, and a club for people thinking bigger about their careers.</p>
            </div>
            <Link href="/future-worth-club" className="inline-block mt-7 md:mt-0 px-6 py-[13px] rounded-full bg-ink text-white text-[13.5px] font-semibold whitespace-nowrap hover:bg-dred transition-colors">Explore Future Worth Club</Link>
          </div>
        </section>
      </div>
    </BrandShell>
  );
}
