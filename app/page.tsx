"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WaitlistModal from "@/components/WaitlistModal";
import { IconInstagram } from "@/components/icons";

// ── shared class tokens (v7) ──
const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const SECTION = "py-[clamp(32px,6vw,104px)]";
const H1 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6.6vw,74px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(23px,4vw,42px)]";
const H3 = "font-lora font-normal leading-[1.15] text-[clamp(18px,3vw,27px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";
const SCRIPT = "font-script leading-none text-[clamp(23px,5vw,44px)]";
const LEDE = "text-[clamp(15px,2vw,18px)] leading-[1.55]";
const BTN = "inline-block px-6 py-[13px] rounded-full text-[15px] font-semibold text-center border-[1.5px] border-transparent transition-colors";

const QUOTES: [string, string][] = [
  ["I pivoted my career, but my resume and LinkedIn were stuck in my past role—they didn't reflect my real capabilities. I was getting screened out by AI filters and missing opportunities. My Marquee bio finally shows who I am, and I'm excited to share it.", "The career pivot"],
  ["I'm a full-time executive, but I have expertise and a perspective that goes beyond my job title. I'm not looking for a new role, but I am open to advisory work, 1:1 calls, and growing my newsletter. LinkedIn gives me no space to showcase how I work outside my day job, and Marquee gives me a place for all of it.", "The full-time executive"],
  ["I run a portfolio career with fractional work, advisory, and projects. Resumes and LinkedIn profiles are outdated and don't represent what I can do. I want to share my impact, how I work, and my rates up front so people know what I offer and what it costs. Right now, I'm paying $400+ a year for other tools and getting no traffic to my site.", "The portfolio career"],
  ["I have a long career in software sales, but I keep getting screened out by ATS algorithms. I want a profile that demonstrates my unique capabilities on a platform focused on human discovery so I can stand out.", "The job seeker"],
  ["I'm an entrepreneur with multiple streams—advisory, workshops, and project work. Creators have had link-in-bio checkout tools for years, and I needed that exact same capability for my professional services. Marquee gives me one link where clients can see my rates and pay me directly.", "The entrepreneur"],
];

const PILLARS = [
  { h: "Identity", lead: "Who you are, beyond the resume and chronological work history.", body: "Marquee captures the full story—your experience, your impact, skills, superpowers, values, and the way you lead.", li: ["Skills & superpowers", "Real-world impact", "How you lead & what you value", "What you're building next", "What you're open to"] },
  { h: "Discovery", lead: "Found for who you are today, not where you worked yesterday.", body: "Marquee handles discovery differently—focusing on your skills, how you choose to engage, whether you're open right now, and direct requests that put you first.", li: ["Searchable by skill & expertise", "Searchable by how you engage", "Searchable by availability", "No feed, no InMail, no spam", "Every request reaches you first"] },
  { h: "Opportunity", lead: "Monetize your expertise.", body: "Every way to work with you on a single page, complete with your rates, so you can earn income from your expertise.", li: ["Consulting, advisory, & fractional roles", "Speaking & office hours", "Digital products, workshops, & courses", "Your custom storefront", "Your terms, your rates"] },
];

const STEPS = [
  ["01", "Import your resume", "We parse your work history into a clean starting structure so you aren't building from scratch."],
  ["02", "Build your profile", "Answer targeted questions about your experience, how you lead, and your impact."],
  ["03", "Build your brand", "Add your media, products, the ways people can work with you, and your rates."],
  ["04", "Share one link", "Put marquee.bio/yourname in your bios and email signature so people can find you, hire you, and book your time."],
];

const MATRIX: [string, string, boolean[]][] = [
  ["Fractional leadership", "Monthly retainer", [true, true, false, false]],
  ["Advisory", "Hourly or retainer", [true, true, true, false]],
  ["Consulting & projects", "Per project", [true, true, false, false]],
  ["Speaking", "Per engagement", [true, true, false, true]],
  ["Office hours", "Per session", [true, false, true, false]],
  ["Board seats", "Terms by conversation", [false, true, false, false]],
  ["Courses", "One-time", [true, false, true, true]],
  ["Workshops", "Per group or seat", [true, true, true, false]],
  ["Digital products", "Ebooks, templates, tools", [true, false, true, true]],
  ["Membership", "Recurring", [true, false, false, true]],
  ["Your storefront", "Everything in one place", [true, false, true, true]],
];

const STATS = [
  ["75%", "of resumes are never seen by a person.", "Resume.org"],
  ["85%", "of employers have adopted skills-based hiring.", "2025"],
  ["93%", "of talent professionals say assessing skills is crucial.", "LinkedIn"],
  ["77%", "of recruiters rely on LinkedIn, where discovery stops at a job title.", "Jobvite"],
  ["50%", "of professionals will have portfolio careers by 2030.", "OECD"],
  ["1 in 3", "working Americans now have a side hustle.", "MarketWatch"],
];

const BIZ = [
  ["Superpowers over resumes", "Surface proven execution speed, practical expertise, and core strengths."],
  ["Driven by forward-looking signals", "Traditional platforms focus on past job titles. Marquee shows active goals, real-time bandwidth, and current focus areas."],
  ["Flexible work formats", "Connect with top talent for fractional leadership, project work, advisory roles, speaking engagements, content partnerships, and board seats."],
  ["Cultural alignment first", "Filter by leadership style, public presence, and shared core values to ensure lasting, high-impact partnerships."],
  ["Direct contact with upfront insights", "View rates, explicit availability, and preferred engagement formats so you can reach out directly."],
];

const FAQS = [
  ["Is this a replacement for LinkedIn?", "No. LinkedIn is where your network lives, and it does that well. Marquee is where your work lives: what you do, how you work, what you charge, and how someone books you. Most people keep both and put their Marquee link in their LinkedIn bio."],
  ["Who is Marquee for?", "Anyone whose value does not fit on one line. Fractional executives, consultants, coaches, advisors, founders, creators, and people in full-time roles who also advise, speak, teach, or sell. If you earn from more than one thing, or you plan to, this was built for you."],
  ["Who can see my profile?", "You decide. The Career Blueprint produces two things: a private read only you see, including your constraints and what you need to earn, and a public profile with what you choose to show. Nothing moves from one to the other without you."],
  ["When is it live?", "The Career Blueprint is live now and free. Profiles are open to a small invited group today, with public access later this year. Request early access and we will come back to you with a date."],
];

export default function HomePage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("homepage");
  const [q, setQ] = useState(0);

  const apply = (source: string) => { setWaitlistSource(source); setWaitlistOpen(true); };

  useEffect(() => {
    const t = setInterval(() => setQ((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, [q]);

  return (
    <div className="font-inter text-ink bg-paper">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-hair">
        <div className={`${WRAP} py-[14px] flex items-center justify-between gap-4`}>
          <Link href="/" className="text-[16.5px] font-medium tracking-[0.26em]">MARQUEE</Link>
          <div className="flex gap-5 items-center">
            <Link href="/login" className="text-[13.5px] font-semibold whitespace-nowrap hover:text-dred transition-colors">Sign in</Link>
            <button onClick={() => apply("nav")} className={`${BTN} bg-dred text-white hover:bg-red !px-5 !py-[10px] !text-[13.5px] whitespace-nowrap`}>Request early access</button>
          </div>
        </div>
      </nav>

      {/* ── HERO (white) ── */}
      <section className={`${SECTION} pt-[clamp(48px,6vw,86px)]`}>
        <div className={`${WRAP} grid md:grid-cols-[1.1fr_.9fr] gap-[clamp(30px,5vw,72px)] items-center`}>
          <div>
            <div className={EYEBROW}>The professional identity platform</div>
            <h1 className={`${H1} mt-[18px]`}>Your work deserves the spotlight.</h1>
            <div className={`${SCRIPT} text-dred my-[18px]`}>Be known. Not filtered.</div>
            <p className={`${LEDE} max-w-[560px]`}>Build your brand, share how you work, monetize your expertise, and be discovered by the right people. One profile. One link.</p>
            <div className="flex flex-col items-start sm:flex-row sm:flex-wrap sm:items-center gap-3 mt-8">
              <button onClick={() => apply("hero")} className={`${BTN} bg-red text-white hover:bg-dred`}>Request early access</button>
              <a href="#blueprint" className={`${BTN} !border-ink text-ink hover:bg-ink hover:text-white`}>Get Free Career Blueprint</a>
            </div>
            <p className="text-[13px] font-semibold text-dred mt-4">Beta opens September 1 — request early access to claim your spot.</p>
          </div>
          <div className="hidden md:flex justify-center">
            <PhonePreview />
          </div>
        </div>
      </section>

      {/* ── QUOTE ROTATOR (beige) ── */}
      <section className="bg-beige py-[clamp(44px,5vw,72px)]">
        <div className={`${WRAP} grid md:grid-cols-[200px_1fr] gap-[clamp(20px,4vw,50px)] items-center`}>
          <div className={EYEBROW}>Who we&apos;re<br />building for</div>
          <div>
            <div className="min-h-[190px] flex flex-col justify-center">
              <div className="font-lora text-[clamp(19px,1.75vw,25px)] leading-[1.42]">&ldquo;{QUOTES[q][0]}&rdquo;</div>
              <div className="text-[11.5px] font-bold tracking-[0.14em] uppercase text-dred mt-[18px]">{QUOTES[q][1]}</div>
            </div>
            <div className="flex gap-[10px] items-center mt-[22px]">
              <button onClick={() => setQ((i) => (i - 1 + QUOTES.length) % QUOTES.length)} aria-label="Previous" className="w-[38px] h-[38px] rounded-full border-[1.5px] border-dred text-dred text-[16px] hover:bg-dred hover:text-white transition-colors">←</button>
              <button onClick={() => setQ((i) => (i + 1) % QUOTES.length)} aria-label="Next" className="w-[38px] h-[38px] rounded-full border-[1.5px] border-dred text-dred text-[16px] hover:bg-dred hover:text-white transition-colors">→</button>
              <div className="flex gap-[7px] ml-2">
                {QUOTES.map((_, n) => <button key={n} onClick={() => setQ(n)} aria-label={`Quote ${n + 1}`} className={`w-[7px] h-[7px] rounded-full ${n === q ? "bg-dred" : "bg-dred/30"}`} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT MARQUEE IS (white) ── */}
      <section id="what" className={SECTION}>
        <div className={WRAP}>
          <div className={EYEBROW}>What Marquee is</div>
          <h2 className={`${H2} mt-4 max-w-[980px]`}>Three elements of your career that have never lived in one place.</h2>
          <p className={`${LEDE} mt-4 max-w-[840px]`}>On Marquee, they unite into a single profile so you can be known, get discovered and get paid.</p>
          <div className="grid md:grid-cols-3 gap-5 mt-11">
            {PILLARS.map((p) => (
              <div key={p.h} className="bg-beige border border-beigeLine rounded-[10px] p-[34px]">
                <h3 className={`${H3} text-dred mb-3`}>{p.h}</h3>
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

      {/* ── HOW IT WORKS (blue) ── */}
      <section id="how" className={`${SECTION} bg-blue`}>
        <div className={WRAP}>
          <div className={EYEBROW}>How it works</div>
          <h2 className={`${H2} mt-4`}>Four simple steps.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 mt-14">
            {STEPS.map(([n, h, b]) => (
              <div key={n}>
                <div className="font-lora text-[clamp(40px,4vw,52px)] text-dred leading-none">{n}</div>
                <h3 className="font-lora text-[22px] leading-[1.2] mt-4 mb-2">{h}</h3>
                <p className="text-[15px] leading-[1.6] text-ink/75">{b}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-dred">Your personalized professional link</div>
            <div className={`${SCRIPT} text-dred mt-2`}>marquee.bio/yourname</div>
          </div>
        </div>
      </section>

      {/* ── MONETIZE (white) ── */}
      <section id="earn" className={SECTION}>
        <div className={WRAP}>
          <div className={EYEBROW}>Monetize your expertise</div>
          <h2 className={`${H2} mt-4 max-w-[940px]`}>You&apos;ve built the expertise. Now turn it into income.</h2>
          <p className={`${LEDE} mt-4 max-w-[860px]`}>You already solve problems faster than most, lead rooms, and give high-value advice. Marquee lets you package that knowledge, set your rates, and sell your time or products in one place.</p>
          <div className="mt-[34px]">
            <table className="w-full border-collapse bg-white rounded-[10px] overflow-hidden table-fixed">
              <thead>
                <tr>
                  {["Ways to work with you", "Set a rate", "Request a proposal", "Book & pay here", "Link out"].map((h, i) => (
                    <th key={h} className={`font-bold tracking-[0.05em] md:tracking-[0.1em] uppercase text-dred text-[8.5px] md:text-[11.5px] leading-tight p-[7px_3px] md:p-[16px_10px] border-b-[1.5px] border-dred align-bottom ${i === 0 ? "text-left pl-[10px] md:pl-[22px] w-[34%]" : "text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(([label, sub, dots], r) => (
                  <tr key={label} className={r % 2 === 0 ? "bg-beige" : ""}>
                    <td className="p-[8px_4px] md:p-[14px_10px] pl-[10px] md:pl-[22px] text-left font-semibold text-[11.5px] md:text-[15px] leading-tight border-b border-beigeLine">
                      {label}<small className="block font-normal text-[9.5px] md:text-[12.5px] text-dred mt-[2px]">{sub}</small>
                    </td>
                    {dots.map((on, c) => (
                      <td key={c} className="p-[8px_3px] md:p-[14px_10px] text-center border-b border-beigeLine">
                        <span className={`inline-block w-2 h-2 md:w-3 md:h-3 rounded-full ${on ? "bg-red" : "border-[1.5px] border-beigeLine"}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CAREER BLUEPRINT (dark red) ── */}
      <section id="blueprint" className={`${SECTION} bg-dred text-white`}>
        <div className={`${WRAP} grid md:grid-cols-2 gap-[clamp(26px,4vw,58px)] items-center`}>
          <div>
            <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-white/80">The Career Blueprint</div>
            <h2 className={`${H2} mt-4`}>Most career advice starts with the job. This starts with you.</h2>
            <p className={`${LEDE} mt-6`}>When you&apos;ve been doing the same work for years, or you&apos;re making a career pivot, it&apos;s hard to see your own experience objectively. You&apos;re often too close to recognize what makes you valuable, where your greatest opportunities are, or how everything you&apos;ve built connects to what&apos;s next.</p>
            <p className={`${LEDE} mt-[14px]`}>Uncover your passions, purpose, and goals, then translate them into a clear direction and a plan.</p>
            <div className="mt-8"><a href="#apply" className={`${BTN} bg-white text-dred`}>Get Free Career Blueprint</a></div>
          </div>
          <div>
            {[["Step 1", "The Discovery", "35 guided questions designed to map your unique passions, values, and strengths."], ["Step 2", "The Assessment", "Analyzes your experience to identify patterns, surface key leverage, and clarify your core strengths."], ["Step 3", "Your 30-Day Blueprint", "A personalized roadmap with clear recommendations to strengthen your professional brand, increase your visibility, uncover new opportunities, and grow your income."]].map(([s, h, p]) => (
              <div key={s} className="bg-white text-ink rounded-[10px] p-[24px_26px] mb-[14px] last:mb-0 flex gap-[18px] items-start">
                <div className="w-[46px] h-[46px] rounded-[10px] bg-beige flex items-center justify-center shrink-0 text-dred font-lora text-[18px]">{s.split(" ")[1]}</div>
                <div>
                  <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-dred">{s}</div>
                  <h3 className="font-lora text-[22px] mt-1 mb-[7px]">{h}</h3>
                  <p className="text-[14.5px] leading-[1.55]">{p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOW (white) ── */}
      <section className={SECTION}>
        <div className={WRAP}>
          <div className={EYEBROW}>Why now</div>
          <h2 className={`${H2} mt-4 max-w-[1000px]`}>The rules of work are being rewritten. Humans need a modern professional identity platform.</h2>
          <p className={`${LEDE} mt-5 max-w-[900px]`}>Somewhere between ATS filters, AI noise, LinkedIn cringe, and the fading corporate ladder, hiring got less human.</p>
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

      {/* ── PRICING (beige) ── */}
      <section id="pricing" className={`${SECTION} bg-beige`}>
        <div className={`${WRAP} text-center`}>
          <div className={EYEBROW}>What it costs</div>
          <h2 className={`${H2} mt-4`}>Pricing.</h2>
          <div className="grid md:grid-cols-2 gap-[22px] mt-11 max-w-[880px] mx-auto">
            <div className="bg-dred text-white border border-dred rounded-[10px] p-[38px_34px] flex flex-col text-center">
              <h3 className={H3}>Career Blueprint</h3>
              <div className="font-lora text-[clamp(34px,5vw,50px)] mt-4 mb-1.5">Free</div>
              <ul className="list-none mt-[22px] mb-[30px] flex-1 text-left">
                {["Guided questionnaire to identify your purpose and strengths", "30-day personalized career roadmap", "Where your income opportunities are"].map((l) => <li key={l} className="text-[14.5px] py-[10px] border-b border-white/20 last:border-0">{l}</li>)}
              </ul>
              <a href="#blueprint" className={`${BTN} bg-white text-dred block w-full`}>Get Free Career Blueprint</a>
            </div>
            <div className="bg-white border border-hair rounded-[10px] p-[38px_34px] flex flex-col text-center">
              <h3 className={H3}>Professional</h3>
              <div className="font-lora text-[clamp(34px,5vw,50px)] mt-4 mb-1.5">$99<small className="font-inter text-[14px] text-dred"> / year</small></div>
              <ul className="list-none mt-[22px] mb-[30px] flex-1 text-left">
                {["Your own marquee.bio/username link", "Media, projects, and work highlights in one place", "Every way you work, with clear rates", "Inbound contact routing tied directly to your work style", "Storefront, booking, and payments"].map((l) => <li key={l} className="text-[14.5px] py-[10px] border-b border-hair last:border-0">{l}</li>)}
              </ul>
              <button onClick={() => apply("pricing")} className={`${BTN} bg-red text-white hover:bg-dred block w-full`}>Request early access</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESS (blue) ── */}
      <section id="business" className={`${SECTION} bg-blue`}>
        <div className={`${WRAP} grid md:grid-cols-[.9fr_1.1fr] gap-[clamp(30px,5vw,64px)] items-start`}>
          <div>
            <div className={EYEBROW}>For businesses &amp; recruiters</div>
            <h2 className={`${H2} mt-4`}>Discover the human beyond the title.</h2>
            <p className={`${LEDE} mt-4`}>Search by skills, superpowers, core values, leadership style, industry experience and impact.</p>
            <div className="mt-8"><button onClick={() => apply("business")} className={`${BTN} bg-dred text-white hover:bg-red`}>Join the waitlist</button></div>
          </div>
          <div>
            {BIZ.map(([b, s]) => (
              <div key={b} className="py-[18px] border-b border-hair last:border-0">
                <b className="block text-[16.5px] mb-[5px]">{b}</b>
                <span className="text-[15px] leading-[1.55]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROFESSIONAL STACK (white) ── */}
      <section className={SECTION}>
        <div className={`${WRAP} text-center`}>
          <div className={EYEBROW}>The professional stack</div>
          <h2 className={`${H2} mt-4 max-w-[960px] mx-auto`}>Your work lives everywhere. Your full story lives nowhere.</h2>
          <p className={`${LEDE} mt-[18px] max-w-[860px] mx-auto`}>Professionals are missing out on income, visibility, and high-impact opportunities because their identity is scattered across multiple tools. When the world only sees disconnected fragments of what you do, no single place captures your true capabilities, your full story, or how to work with you today.</p>
          <div className="mx-auto max-w-[720px] overflow-hidden mt-4" style={{ aspectRatio: "740 / 545" }}>
            <Image src="/images/marquee-stack-graphic.png" alt="A professional surrounded by the disconnected tools their identity is scattered across: LinkedIn, resume, personal website, newsletter, link in bio, portfolio, speaking, advisory, booking, products, projects, and media mentions." width={740} height={740} className="w-full h-auto block" priority />
          </div>
          <div className="text-[30px] text-dred leading-none mt-4 mb-6">↓</div>
          <button onClick={() => apply("stack")} className={`${BTN} bg-red text-white hover:bg-dred text-[17px] !px-[34px] !py-[18px]`}>Get one link for your professional story</button>
          <div className={`${SCRIPT} text-dred mt-5`}>marquee.bio/yourname</div>
        </div>
      </section>

      {/* ── FAQ (beige) ── */}
      <section className="py-[clamp(32px,5vw,68px)] bg-beige">
        <div className={WRAP}>
          <div className={EYEBROW}>FAQ</div>
          <div className="mt-6 max-w-[900px]">
            {FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0} className="border-b border-hair py-[18px] group">
                <summary className="text-[18px] font-semibold cursor-pointer list-none flex justify-between gap-5 [&::-webkit-details-marker]:hidden">
                  {q}<span className="text-red text-[24px] leading-none group-open:hidden">+</span><span className="text-red text-[24px] leading-none hidden group-open:inline">–</span>
                </summary>
                <p className="mt-3 max-w-[760px] text-[15px] leading-[1.6]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA (red) ── */}
      <section id="apply" className={`${SECTION} bg-red text-white`}>
        <div className={`${WRAP} text-center`}>
          <h2 className={`${H2} max-w-[940px] mx-auto`}>Your professional identity in one link.</h2>
          <div className={`${SCRIPT} mt-[18px]`}>marquee.bio/yourname</div>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={() => apply("closing")} className={`${BTN} bg-white text-dred`}>Request early access</button>
            <a href="#blueprint" className={`${BTN} !border-white/70 text-white`}>Get Free Career Blueprint</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER (white) ── */}
      <footer className="bg-white text-ink border-t border-hair pt-14 pb-6">
        <div className={WRAP}>
          <div className="grid sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="text-[16.5px] font-medium tracking-[0.26em] mb-[14px]">MARQUEE</div>
              <p className="text-[14.5px] text-ink max-w-[300px]">The professional identity platform for human opportunity.</p>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.instagram.com/marquee.bio/" target="_blank" rel="noopener" aria-label="Instagram" className="w-[38px] h-[38px] rounded-full border border-hair hover:bg-ink hover:text-white hover:border-ink transition-colors flex items-center justify-center text-ink">
                  <IconInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink mb-[14px]">Product</h4>
              <ul className="space-y-[9px] text-[14.5px] text-ink">
                <li><a href="#what" className="hover:text-dred">What it is</a></li>
                <li><a href="#how" className="hover:text-dred">How it works</a></li>
                <li><a href="#earn" className="hover:text-dred">Monetize your expertise</a></li>
                <li><a href="#blueprint" className="hover:text-dred">Career Blueprint</a></li>
                <li><a href="#pricing" className="hover:text-dred">Pricing</a></li>
                <li><a href="#business" className="hover:text-dred">For businesses &amp; recruiters</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink mb-[14px]">Company</h4>
              <ul className="space-y-[9px] text-[14.5px] text-ink">
                <li><Link href="/about" className="hover:text-dred">About</Link></li>
                <li><a href="https://beknownweekly.substack.com/" target="_blank" rel="noopener" className="hover:text-dred">Newsletter</a></li>
                <li><a href="mailto:hello@marquee.bio" className="hover:text-dred">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex justify-between flex-wrap gap-[14px] text-[13px] text-ink">
            <div>© 2026 Marquee</div>
            <div><a href="#" className="hover:text-dred">Privacy</a> &nbsp;·&nbsp; <a href="#" className="hover:text-dred">Terms</a> &nbsp;·&nbsp; <Link href="/signup" className="hover:text-dred">Have a code? Sign in →</Link></div>
          </div>
        </div>
      </footer>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} source={waitlistSource} />
    </div>
  );
}

// Hero phone frame. If NEXT_PUBLIC_PROFILE_EMBED_URL is set (deployed profile app, or
// localhost in dev), iframe the REAL profile; otherwise render a prod-safe self-contained mock.
function PhonePreview() {
  const src = process.env.NEXT_PUBLIC_PROFILE_EMBED_URL;
  return (
    <div className="relative w-[210px] sm:w-[248px] md:w-[278px] max-w-full aspect-[9/17.5] border-[9px] sm:border-[10px] border-ink rounded-[34px] sm:rounded-[40px] bg-white shadow-[0_26px_60px_rgba(17,17,17,0.16)] overflow-hidden mx-auto">
      <div className="absolute top-[12px] sm:top-[14px] left-1/2 -translate-x-1/2 w-[84px] sm:w-[104px] h-[20px] sm:h-[22px] bg-ink rounded-full z-20" />
      {src ? (
        <iframe src={src} title="Marquee profile preview" loading="lazy" tabIndex={-1} aria-hidden="true" className="w-full h-full border-0 block pointer-events-none select-none" />
      ) : (
        <div className="h-full overflow-y-auto overscroll-contain bg-white px-5 pt-12 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-[60px] h-[60px] rounded-full bg-beige border border-beigeLine mb-3" />
          <div className="font-lora text-[24px] leading-[1.05]">Lauren Ellis</div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-dred mt-2">Marketing &amp; Operations Leader</div>
          <div className="text-[12px] leading-[1.5] mt-2 text-ink/80">I help companies build what&apos;s next — from positioning to growth systems.</div>
          <div className="flex flex-wrap gap-[5px] mt-3">
            {["Go-to-Market", "Brand", "Growth"].map((t) => <span key={t} className="text-[10.5px] border border-beigeLine px-2 py-[3px]">{t}</span>)}
          </div>
          <button className="w-full mt-3 bg-red text-white text-[12.5px] font-semibold py-[9px] rounded-full">Work with Lauren</button>
          <div className="text-[9.5px] font-bold tracking-[0.1em] uppercase text-dred mt-5 mb-2">Featured</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-video bg-blue" /><div className="aspect-video bg-purple" />
            <div className="aspect-video bg-beige" /><div className="aspect-video bg-blue/60" />
          </div>
          <div className="text-[9.5px] font-bold tracking-[0.1em] uppercase text-dred mt-5 mb-1">Open to</div>
          {[["Advisory", "$300 / hr"], ["Fractional", "$8k / mo"], ["Speaking", "From $5k"]].map(([a, b]) => (
            <div key={a} className="flex justify-between items-center border-b border-beigeLine py-[9px] text-[12px]"><span className="font-medium">{a}</span><span className="text-dred">{b}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
