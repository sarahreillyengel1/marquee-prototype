import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "About · Marquee" };

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const H1 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(28px,6vw,66px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.08] text-[clamp(22px,4.5vw,44px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";

const PRINCIPLES = [
  ["You are more than your job title.", "Resumes and LinkedIn force professionals into chronological timelines and past job titles. Marquee gives you a space to showcase your superpowers, real-world impact, and how you work today."],
  ["Discovery is broken.", "Traditional platforms bury you in a sea of millions, using algorithms that miss true expertise and forcing people to act like content creators just to get noticed. Marquee creates a high-intent discovery space focused on real capability."],
  ["Your identity belongs to you.", "Your professional identity should be unified, not fragmented across half a dozen tools and platforms. Marquee gives you one link to share anywhere — a space where you own your complete story."],
  ["Hiring should be human.", "Resumes get filtered by AI, reducing talented professionals to keywords. Marquee bypasses the application process entirely, giving decision-makers full visibility into your capabilities and real-time availability so they can contact you directly."],
  ["Income from your experience.", "Modern professionals often do more than their 9-to-5. They advise, consult, speak, coach, build, invest, and sell digital products. Marquee makes it easy to showcase how people can work with you and create new opportunities to earn income from your expertise."],
];

const LETTER = [
  "Across my 30-year career — leading go-to-market and operations at venture-backed startups like Salesforce, LTK, and Hello Alice, and founding my own influencer marketing agency and consulting company — I learned early on that a static resume could never capture what someone is capable of, or how they operate.",
  "Spending a decade in the creator economy revealed a fundamental truth: visibility is currency. Creators have an entire ecosystem designed to monetize their identity, build an audience, and capture opportunity. High-value professionals deserve that same modern infrastructure.",
  "Career growth isn't one-dimensional. Professionals today lead core teams, advise companies, launch podcasts, serve on boards, and build side projects — often while excelling in their primary roles. Yet traditional platforms only show past titles. They fail to communicate your current skills, your real-time availability, or how to work with you today.",
  "I searched for a dedicated space designed for high-value professional identity, but couldn't find one. So, I built Marquee.",
  "Marquee provides executives, operators, independent talent, and rising leaders with a unified, self-owned space to showcase their complete story, signal real-time bandwidth, package their expertise, and open doors to direct collaboration.",
  "I'm making Marquee the new standard for talent. I invite you to build your story here — and please reach out directly as you do. I want to hear from you as we build this together.",
];

export default function AboutPage() {
  return (
    <BrandShell source="about">
      {/* Hero (white) */}
      <section className="py-[clamp(48px,6vw,88px)]">
        <div className={`${WRAP} max-w-[900px]`}>
          <div className={EYEBROW}>About</div>
          <h1 className={`${H1} mt-4`}>Meet the platform redefining professional identity.</h1>
          <p className="text-[clamp(15px,2vw,20px)] leading-[1.55] mt-6 max-w-[760px]">
            Marquee was built to solve a simple truth: high-value professionals deserve a single, self-owned space to tell their full career story, showcase how they work, monetize their expertise, and get discovered by the right people.
          </p>
        </div>
      </section>

      {/* Tagline moment — between hero and founder note */}
      <section className="pb-[clamp(28px,5vw,56px)]">
        <div className={`${WRAP} flex items-center gap-6 justify-center`}>
          <span className="hidden sm:block h-px flex-1 max-w-[130px] bg-hair" />
          <p className="font-script text-[clamp(34px,5.5vw,64px)] leading-tight text-dred text-center">Be known. Not filtered.</p>
          <span className="hidden sm:block h-px flex-1 max-w-[130px] bg-hair" />
        </div>
      </section>

      {/* A Note From Our Founder (beige, full-bleed) */}
      <section className="bg-beige py-[clamp(48px,6vw,88px)]">
        <div className={`${WRAP} grid md:grid-cols-[.85fr_1.15fr] gap-[clamp(28px,5vw,64px)] items-start`}>
          <div>
            <div className="relative w-full max-w-[380px] aspect-[4/5] overflow-hidden">
              <Image src="/images/sarah-founder.jpg" alt="Sarah Reilly Engel, Founder & CEO of Marquee" fill className="object-cover" sizes="(min-width:768px) 380px, 100vw" priority />
            </div>
          </div>
          <div>
            <div className={EYEBROW}>A note from our founder</div>
            <h2 className={`${H2} mt-3`}>Hi, I&apos;m Sarah.</h2>
            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.65] text-ink/85 max-w-[640px]">
              {LETTER.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-7">
              <div className="font-lora text-[20px] leading-tight">Sarah Reilly Engel</div>
              <div className="text-[13px] text-dred font-semibold tracking-[0.02em] mt-1">Founder &amp; CEO, Marquee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Guiding Principles (white) */}
      <section className="py-[clamp(48px,6vw,88px)]">
        <div className={WRAP}>
          <div className={EYEBROW}>Our guiding principles</div>
          <div className="grid md:grid-cols-2 gap-x-14 gap-y-11 mt-10">
            {PRINCIPLES.map(([t, b], i) => (
              <div key={t} className="flex gap-5">
                <span className="font-lora text-[30px] text-dred leading-none shrink-0">{i + 1}</span>
                <div>
                  <h3 className="font-lora text-[clamp(19px,1.7vw,24px)] leading-[1.2]">{t}</h3>
                  <p className="text-[15px] text-ink/75 mt-2 leading-[1.6]">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (dark red, full-bleed) */}
      <section className="bg-dred text-white py-[clamp(44px,6vw,80px)]">
        <div className={`${WRAP} text-center`}>
          <h2 className={`${H2} max-w-[760px] mx-auto`}>Build your story on Marquee.</h2>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link href="/join" className="inline-block px-6 py-[13px] rounded-full text-[15px] font-semibold bg-white text-dred">Sign Up Now</Link>
            <a href="https://beknownweekly.substack.com/" target="_blank" rel="noopener" className="inline-block px-6 py-[13px] rounded-full text-[15px] font-semibold border-[1.5px] border-white/70 text-white">Subscribe to the newsletter</a>
          </div>
        </div>
      </section>
    </BrandShell>
  );
}
