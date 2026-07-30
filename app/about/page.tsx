import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import { SignalM } from "@/components/icons";

export const metadata = { title: "About · Marquee" };

const H1 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(40px,5.6vw,74px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(31px,3.7vw,50px)]";
const H3 = "font-lora font-normal leading-[1.15] text-[clamp(20px,1.7vw,25px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";

const PRINCIPLES = [
  { title: "Depth over performance", body: "Networks reward posting. Resumes reward keywords. Marquee rewards depth — the through-line that follows you across companies and titles." },
  { title: "You own the story", body: "We help you excavate the narrative that's already there. Every word on your Marquee is yours to keep, edit, or delete. We don't rank you against anyone." },
  { title: "Human, not algorithmic", body: "No feeds. No filters that reduce you to keywords. Marquee is designed to be read by humans deciding whether they'd want to work with you." },
  { title: "Slow and considered", body: "The Career Blueprint takes real time because your answers matter. The AI writes with care because your voice matters. We're not optimizing for engagement — we're optimizing for accuracy." },
];

export default function AboutPage() {
  return (
    <BrandShell source="about">
      {/* Hero */}
      <div className={EYEBROW}>About</div>
      <h1 className={`${H1} mt-3 max-w-4xl`}>We&apos;re building the platform we wished existed.</h1>
      <p className="text-[clamp(17px,1.35vw,21px)] leading-[1.55] mt-6 max-w-2xl">
        Resumes flatten people. LinkedIn rewards performance over substance. We started Marquee because we believe your work — and the story behind it — deserves a place of its own.
      </p>

      {/* Thesis */}
      <div className="mt-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <div className={EYEBROW}>Our thesis</div>
          <h2 className={`${H2} mt-3`}>The resume is dead.</h2>
          <div className="mt-6 space-y-4 text-[15.5px] leading-[1.6] text-ink/80">
            <p>What replaces it isn&apos;t another list of jobs — it&apos;s a rich, shareable profile built around who you actually are when you work. Marquee captures the through-line that follows you across companies and titles.</p>
            <p>We don&apos;t compete with LinkedIn. We do something LinkedIn can&apos;t: give you a home for the story behind your work, on the URL that&apos;s actually yours.</p>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <SignalM className="w-64 md:w-80" color="#CBBCF0" />
        </div>
      </div>

      {/* Pull quote */}
      <div className="mt-24 py-16 bg-beige border border-beigeLine rounded-[10px] px-10 md:px-16">
        <p className="font-script text-[clamp(34px,4.5vw,58px)] leading-tight text-center max-w-3xl mx-auto text-dred">
          Be known. Not filtered.
        </p>
      </div>

      {/* Principles */}
      <div className="mt-24 pt-16 border-t border-hair">
        <div className={EYEBROW}>What we believe</div>
        <h2 className={`${H2} mt-3 max-w-3xl`}>Four principles we build by.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 mt-14">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title}>
              <span className="font-lora text-[30px] text-dred">0{i + 1}</span>
              <h3 className={`${H3} mt-2`}>{p.title}</h3>
              <p className="text-[15px] text-ink/75 mt-3 leading-[1.6]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-24 bg-dred text-white rounded-[10px] p-12 md:p-16">
        <h2 className={`${H2} max-w-2xl`}>Have thoughts, questions, or a story to share?</h2>
        <p className="text-white/80 mt-4 max-w-xl text-[16px] leading-[1.6]">We read every message. Feedback from our beta users is quite literally the product roadmap.</p>
        <a href="mailto:hello@marquee.bio" className="inline-block mt-8 px-7 py-[15px] rounded-full bg-white text-dred font-semibold hover:bg-white/90 transition-colors">hello@marquee.bio</a>
        <p className="text-[13px] text-white/60 mt-6">
          Or <Link href="/" className="underline hover:text-white">request an invitation</Link> if you&apos;re ready to build your Marquee.
        </p>
      </div>
    </BrandShell>
  );
}
