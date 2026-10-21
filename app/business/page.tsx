// marquee.bio/business: the page for companies. Post an opportunity, free during the beta. Sarah reviews every one.
import type { Metadata } from "next";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";

export const metadata: Metadata = { title: "Marquee for businesses — Post an opportunity", description: "Reach experienced professionals who work full-time, fractional, advisory and project. Post an opportunity on Marquee, free during the beta." };

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const SECTION = "py-[clamp(32px,6vw,96px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(23px,4vw,42px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";
const BTN = "inline-block px-6 py-[13px] text-[15px] rounded-full font-semibold text-center border-[1.5px] border-transparent transition-colors";

const WHY: [string, string][] = [
  ["Superpowers over resumes", "Surface proven execution speed, practical expertise, and core strengths."],
  ["Driven by forward-looking signals", "Traditional platforms focus on past job titles. Marquee shows active goals, real-time bandwidth, and current focus areas."],
  ["Flexible work formats", "Connect with top talent for fractional leadership, project work, advisory roles, speaking engagements, content partnerships, and board seats."],
  ["Cultural alignment first", "Filter by leadership style, public presence, and shared core values to ensure lasting, high-impact partnerships."],
  ["Direct contact with upfront insights", "View rates, explicit availability, and preferred engagement formats so you can reach out directly."],
];
const STEPS: [string, string][] = [
  ["Create a business account", "Your name, your company and your work email. Free during the beta."],
  ["Post the opportunity", "Paste the listing link and we fill in the details. You check them, then post."],
  ["We review it", "Every opportunity is checked before it goes live, usually within a day."],
  ["Meet the right people", "Your role sits in front of experienced professionals, with a link to apply on your site."],
];

export default function BusinessPage() {
  return (
    <BrandShell source="business">
      <section className="bg-blue">
        <div className={`${WRAP} ${SECTION} grid md:grid-cols-[1.1fr_.9fr] gap-[clamp(30px,5vw,64px)] items-center`}>
          <div>
            <div className={EYEBROW}>For businesses</div>
            <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.04] text-[clamp(32px,5.5vw,58px)] mt-4">Hire the whole professional.</h1>
            <p className="text-[clamp(15px,2vw,18px)] leading-[1.55] mt-5 max-w-[560px]">Post full-time, fractional, advisory and project roles to experienced professionals who show their work, their rates and their availability in one place.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/opportunities/post" className={`${BTN} bg-dred text-white hover:bg-red`}>Post an opportunity</Link>
              <Link href="/opportunities" className={`${BTN} !border-ink text-ink hover:bg-ink hover:text-white`}>See the board</Link>
            </div>
            <p className="text-[13.5px] text-ink/70 mt-4">Free during the beta. Up to two open opportunities per company.</p>
          </div>
          <div className="bg-white rounded-[16px] border border-hair p-6 sm:p-8">
            <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/60">How it works</div>
            <ol className="mt-4 space-y-4">
              {STEPS.map(([t, s], i) => (
                <li key={t} className="flex gap-4"><span className="shrink-0 w-[30px] h-[30px] rounded-full bg-dred text-white text-[13px] font-bold flex items-center justify-center">{i + 1}</span><div><b className="block text-[15.5px]">{t}</b><span className="text-[14px] leading-[1.5] text-ink/75">{s}</span></div></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className={`${WRAP} ${SECTION} grid md:grid-cols-[.9fr_1.1fr] gap-[clamp(30px,5vw,64px)] items-start`}>
          <div>
            <div className={EYEBROW}>Why Marquee</div>
            <h2 className={`${H2} mt-4`}>Discover the human beyond the title.</h2>
            <p className="text-[clamp(15px,2vw,18px)] leading-[1.55] mt-4">Search by skills, superpowers, core values, leadership style, industry experience and impact.</p>
          </div>
          <div>
            {WHY.map(([b, s]) => (
              <div key={b} className="py-[18px] border-b border-hair last:border-0">
                <b className="block text-[16.5px] mb-[5px]">{b}</b>
                <span className="text-[15px] leading-[1.55]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dred text-white">
        <div className={`${WRAP} py-[clamp(40px,6vw,80px)] text-center`}>
          <h2 className={`${H2} max-w-[760px] mx-auto`}>Your next hire is already on Marquee.</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/business/join" className={`${BTN} bg-white text-dred hover:bg-beige`}>Create a business account</Link>
            <Link href="/opportunities/post" className={`${BTN} !border-white text-white hover:bg-white hover:text-dred`}>Post an opportunity</Link>
          </div>
          <p className="text-[13.5px] text-white/80 mt-5">Already have one? <Link href="/login?next=/business/opportunities" className="underline underline-offset-2">Sign in</Link></p>
        </div>
      </section>
    </BrandShell>
  );
}
