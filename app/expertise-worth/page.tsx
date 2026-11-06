import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import DownloadForm from "./DownloadForm";
import { REPORTS, NEWSLETTER_URL } from "@/lib/reports";

// marquee.bio/expertise-worth: the landing page for The Future Worth Report 2026, "What is your expertise worth?" (PDF).
// Visitors leave a first name and email, the lead is saved (waitlist table, source "report-expertise-worth"),
// and they get the PDF. Until the file is in place the same form puts them on the list for when it is out.
// The PDF path and the ready switch live in lib/reports.ts.
const R = REPORTS["expertise-worth"];

export const metadata = {
  title: "The Future Worth Report 2026 · What is your expertise worth? · Marquee",
  description: "What experienced professionals charge for advisory, fractional and project work, and how to price your own. Free report, powered by Marquee.",
};

// Copy approved by Sarah word for word, 6 Nov 2026.
const INSIDE = [
  "What people charge, by type of work",
  "How to set your own rate",
  "Where the demand is, and how to be found for it on Marquee",
];

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.22em] uppercase text-dred";

export default function ExpertiseWorthPage() {
  return (
    <BrandShell source="expertise-worth">
      <div className="font-inter text-ink bg-paper">

        {/* Hero: words left, form right */}
        <section className="py-[clamp(48px,7vw,104px)] border-b border-hair">
          <div className={`${WRAP} grid md:grid-cols-[1.15fr_1fr] gap-[clamp(32px,5vw,80px)] items-start`}>
            <div>
              <div className={EYEBROW}>Free report</div>
              <div className="font-lora text-[clamp(20px,2.2vw,26px)] leading-[1.2] mt-4">The Future Worth Report 2026</div>
              <div className="text-[13px] text-ink/60 mt-1">Powered by Marquee</div>
              <h1 className="font-lora font-normal leading-[1.05] tracking-[-0.01em] text-[clamp(38px,6vw,76px)] mt-7">What is your expertise worth?</h1>
              <p className="text-[clamp(17px,2vw,21px)] leading-[1.5] mt-6 max-w-[560px]">
                What experienced professionals charge for advisory, fractional and project work, and how to price your own.
              </p>
              <div id="inside" className={`${EYEBROW} mt-10 scroll-mt-24`}>Inside the report</div>
              <ul className="mt-3 max-w-[560px]">
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

        {/* Future Worth */}
        <section className="bg-beige py-[clamp(40px,5vw,72px)]">
          <div className={WRAP}>
            <div className={EYEBROW}>Future Worth</div>
            <p className="font-lora font-normal leading-[1.2] text-[clamp(22px,3vw,34px)] mt-4 max-w-[760px]">Future Worth is a newsletter, podcast and club about careers, money and what expertise is worth.</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-7">
              <a href={NEWSLETTER_URL} target="_blank" rel="noopener" className="inline-block px-6 py-[13px] rounded-full bg-ink text-white text-[13.5px] font-semibold whitespace-nowrap hover:bg-dred transition-colors">Subscribe to Future Worth</a>
              <span className="text-ink/40 hidden sm:inline">&middot;</span>
              <Link href="/future-worth-club" className="text-[14.5px] font-semibold underline underline-offset-4 decoration-1 hover:text-dred transition-colors">Apply to the Future Worth Club</Link>
            </div>
          </div>
        </section>
      </div>
    </BrandShell>
  );
}
