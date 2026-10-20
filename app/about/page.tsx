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
  ["Opportunity grows through connection.", "The best opportunities often come through relationships, referrals, and collaboration. Marquee makes it easier for professionals to find one another, share expertise, build partnerships, and create opportunities together."],
];

// "What Marquee is": moved here from the home page on Oct 19 2026, word for word.
const PILLARS = [
  { h: "Identity", lead: "Who you are, beyond the resume and chronological work history.", body: "Marquee captures the full story—your experience, your impact, skills, superpowers, values, and the way you lead.", li: ["Skills & superpowers", "Real-world impact", "How you lead & what you value", "What you're building next", "What you're open to"] },
  { h: "Discovery", lead: "Found for who you are today, not where you worked yesterday.", body: "Marquee handles discovery differently—focusing on your skills, how you choose to engage, whether you're open right now, and direct requests that put you first.", li: ["Searchable by skill & expertise", "Searchable by how you engage", "Searchable by availability", "No feed, no InMail, no spam", "Every request reaches you first"] },
  { h: "Opportunity", lead: "Monetize your expertise.", body: "Every way to work with you on a single page, complete with your rates, so you can earn income from your expertise.", li: ["Consulting, advisory, & fractional roles", "Speaking & office hours", "Digital products, workshops, & courses", "Your custom storefront", "Your terms, your rates"] },
];

// "Why now": moved here from the home page on Oct 20 2026, word for word.
const STATS = [
  ["75%", "of resumes are never seen by a person.", "Resume.org"],
  ["85%", "of employers have adopted skills-based hiring.", "2025"],
  ["93%", "of talent professionals say assessing skills is crucial.", "LinkedIn"],
  ["77%", "of recruiters rely on LinkedIn, where discovery stops at a job title.", "Jobvite"],
  ["50%", "of professionals will have portfolio careers by 2030.", "OECD"],
  ["1 in 3", "working Americans now have a side hustle.", "MarketWatch"],
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

      {/* A Note From Our Founder (beige, full-bleed) */}
      <section className="bg-dred text-white py-[clamp(48px,6vw,88px)]">
        <div className={`${WRAP} grid md:grid-cols-[.85fr_1.15fr] gap-[clamp(28px,5vw,64px)] items-start`}>
          <div>
            <div className="relative w-full max-w-[380px] aspect-[4/5] overflow-hidden">
              <Image src="/images/sarah-founder.jpg" alt="Sarah Reilly Engel, Founder & CEO of Marquee" fill className="object-cover" sizes="(min-width:768px) 380px, 100vw" priority />
            </div>
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-white/70">A note from our founder</div>
            <h2 className={`${H2} mt-3`}>Hi, I&apos;m Sarah.</h2>
            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.65] text-white max-w-[640px]">
              {LETTER.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-7">
              <div className="font-lora text-[20px] leading-tight">Sarah Reilly Engel</div>
              <div className="text-[13px] text-white/80 font-semibold tracking-[0.02em] mt-1">Founder &amp; CEO, Marquee</div>
            </div>
          </div>
        </div>
      </section>

      {/* What Marquee is (beige) */}
      <section className="bg-beige py-[clamp(48px,6vw,88px)]">
        <div className={WRAP}>
          <div className={EYEBROW}>What Marquee is</div>
          <h2 className={`${H2} mt-4 max-w-[980px]`}>Three elements of your career that have never lived in one place.</h2>
          <p className="text-[clamp(15px,2vw,18px)] leading-[1.55] mt-4 max-w-[840px]">On Marquee, they unite into a single profile so you can be known, get discovered and get paid.</p>
          <div className="grid md:grid-cols-3 gap-5 mt-11">
            {PILLARS.map((p) => (
              <div key={p.h} className="bg-beige border border-beigeLine rounded-[10px] p-[34px]">
                <h3 className="font-lora font-normal leading-[1.15] text-[clamp(18px,3vw,27px)] text-dred mb-3">{p.h}</h3>
                <p className="text-[15px] leading-[1.6]"><strong>{p.lead}</strong> {p.body}</p>
                <ul className="mt-[18px]">
                  {p.li.map((l) => (
                    <li key={l} className="text-[14.5px] py-[9px] border-b border-beigeLine last:border-0 flex gap-[10px] items-start">
                      <span className="w-[6px] h-[6px] rounded-full bg-red mt-2 shrink-0" />{l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now (white) */}
      <section className="py-[clamp(48px,6vw,88px)]">
        <div className={WRAP}>
          <div className={EYEBROW}>Why now</div>
          <h2 className={`${H2} mt-4 max-w-[1000px]`}>The rules of work are being rewritten. Humans need a modern professional identity platform.</h2>
          <p className="text-[clamp(15px,2vw,18px)] leading-[1.55] mt-5 max-w-[900px]">Somewhere between ATS filters, AI noise, LinkedIn cringe, and the fading corporate ladder, hiring got less human.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[18px] mt-10">
            {STATS.map(([v, l, s]) => (
              <div key={l} className="bg-beige border border-beigeLine rounded-[10px] p-[28px]">
                <div className="font-lora text-dred leading-none text-[clamp(25px,4vw,42px)]">{v}</div>
                <div className="text-[15px] leading-[1.5] mt-3">{l}</div>
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-dred/70 mt-3">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guiding Principles (beige) */}
      <section className="bg-beige py-[clamp(48px,6vw,88px)]">
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
          <h2 className={`${H2} max-w-[760px] mx-auto`}>Claim your Marquee.</h2>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link href="/join" className="inline-block px-6 py-[13px] rounded-full text-[15px] font-semibold bg-white text-dred">Claim Yours &rarr;</Link>
            <a href="https://beknownweekly.substack.com/" target="_blank" rel="noopener" className="inline-block px-6 py-[13px] rounded-full text-[15px] font-semibold border-[1.5px] border-white/70 text-white">Subscribe to the newsletter</a>
          </div>
        </div>
      </section>
    </BrandShell>
  );
}
