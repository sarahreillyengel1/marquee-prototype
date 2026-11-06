import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import DownloadForm from "./DownloadForm";
import { REPORTS, NEWSLETTER_URL } from "@/lib/reports";
import { CoinStack, Coin } from "./Money";

// marquee.bio/expertise-worth: the landing page for The Future Worth Report 2026, "What is your expertise worth?" (PDF).
// Visitors leave a first name and email, the lead is saved (waitlist table, source "report-expertise-worth"),
// and they get the PDF. Until the file is in place the same form puts them on the list for when it is out.
// The PDF path and the ready switch live in lib/reports.ts.
const R = REPORTS["expertise-worth"];

export const metadata = {
  title: "The Future Worth Report 2026 · What is your expertise worth? · Marquee",
  description: "The changing economics of work are redefining what our expertise is worth. The Future Worth Report 2026, free, powered by Marquee.",
};

// Copy approved by Sarah word for word, 6 Nov 2026. Colors are the confirmed brand palette in BRAND.md, not the home page tokens.

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";

export default function ExpertiseWorthPage() {
  return (
    <BrandShell source="expertise-worth">
      <div className="font-inter text-[#111111] bg-[#F7F6F2]">

        {/* Hero (blue): words left, coins + form right */}
        <section className="bg-[#C0DDFB] py-[clamp(44px,6vw,88px)] overflow-hidden">
          <div className={`${WRAP} grid md:grid-cols-[1.1fr_1fr] gap-[clamp(32px,5vw,72px)] items-start`}>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-[8px] rounded-full bg-[#F7F6F2] border-[1.5px] border-[#111111] text-[12px] font-bold tracking-[0.1em] uppercase"><span aria-hidden>💰</span>Free report</div>
              <div className="font-script text-[clamp(30px,4vw,48px)] leading-[1.05] mt-6 text-[#670821]">The Future Worth Report 2026</div>
              <div className="text-[12px] font-bold tracking-[0.22em] uppercase text-[#111111]/60 mt-2">Powered by Marquee</div>
              <h1 className="font-lora font-normal leading-[1.02] tracking-[-0.01em] text-[clamp(44px,7vw,92px)] mt-6">What is your expertise worth?</h1>
              <p className="text-[clamp(16px,1.7vw,18.5px)] leading-[1.55] mt-6 max-w-[580px]">
                The changing economics of work are redefining what our expertise is worth. More professionals are building non-linear careers, creating income streams beyond a single employer, and starting businesses. The Future Worth report brings together research and data on the changing value of experience, the impact of AI on employment, the rise of independent work and entrepreneurship, and the expanding ways we work and earn.
              </p>
              <CoinStack className="md:hidden w-[160px] h-[160px] mt-8" />
            </div>
            <div className="relative md:pt-[220px]">
              <CoinStack className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[270px] h-[270px] rotate-[6deg] drop-shadow-[0_14px_0_rgba(17,16,16,0.12)]" />
              <DownloadForm ready={R.ready} pdf={R.pdf} />
            </div>
          </div>
        </section>

        {/* Future Worth (wine) */}
        <section className="bg-[#670821] text-white py-[clamp(44px,6vw,88px)]">
          <div className={`${WRAP} md:grid md:grid-cols-[auto_1fr] gap-[clamp(28px,4vw,56px)] items-center`}>
            <Coin className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] -rotate-[10deg]" />
            <div className="mt-6 md:mt-0">
              <div className="font-script text-[clamp(28px,3.4vw,40px)] leading-none">Future Worth</div>
              <p className="font-lora font-normal leading-[1.2] text-[clamp(22px,3vw,36px)] mt-4 max-w-[760px]">Future Worth is a newsletter, podcast and club about careers, money and what expertise is worth.</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-7">
                <a href={NEWSLETTER_URL} target="_blank" rel="noopener" className="inline-block px-6 py-[13px] rounded-full bg-[#FF5A36] text-white text-[14px] font-semibold whitespace-nowrap hover:bg-white hover:text-[#670821] transition-colors">Subscribe to Future Worth</a>
                <span className="text-white/40 hidden sm:inline">&middot;</span>
                <Link href="/future-worth-club" className="text-[15px] font-semibold underline underline-offset-4 decoration-1 hover:text-[#FF5A36] transition-colors">Apply to the Future Worth Club</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BrandShell>
  );
}
