"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WaitlistModal from "@/components/WaitlistModal";
import Pricing from "@/components/Pricing";
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
const BTN = "inline-block px-5 py-[10px] text-[13.5px] sm:px-6 sm:py-[13px] sm:text-[15px] rounded-full font-semibold text-center border-[1.5px] border-transparent transition-colors";

const FOR = [
  { h: "I\u2019m a founder or entrepreneur.", body: "Build your professional presence and manage your businesses and brands, each with its own Marquee." },
  { h: "I\u2019m a fractional leader, consultant, or freelancer.", body: "Showcase your work, services, rates, and availability so clients can hire or book you directly." },
  { h: "I\u2019m building my professional brand.", body: "Bring your experience, expertise, content, newsletter, podcast, affiliate links, and products together." },
  { h: "I\u2019m a coach, advisor, or expert.", body: "Offer sessions, advisory services, workshops, and programs with direct bookings and payments." },
];

const QUOTES: [string, string][] = [
  ["I pivoted my career, but my resume and LinkedIn were stuck in my past role—they didn't reflect my real capabilities. I was getting screened out by AI filters and missing opportunities. My Marquee bio finally shows who I am, and I'm excited to share it.", "The career pivot"],
  ["I'm a full-time executive, but I have expertise and a perspective that goes beyond my job title. I'm not looking for a new role, but I am open to advisory work, 1:1 calls, and growing my newsletter. LinkedIn gives me no space to showcase how I work outside my day job, and Marquee gives me a place for all of it.", "The full-time executive"],
  ["I run a portfolio career with fractional work, advisory, and projects. Resumes and LinkedIn profiles are outdated and don't represent what I can do. I want to share my impact, how I work, and my rates up front so people know what I offer and what it costs. Right now, I'm paying $400+ a year for other tools and getting no traffic to my site.", "The portfolio career"],
  ["I have a long career in software sales, but I keep getting screened out by ATS algorithms. I want a profile that demonstrates my unique capabilities on a platform focused on human discovery so I can stand out.", "The job seeker"],
  ["I'm an entrepreneur with multiple streams—advisory, workshops, and project work. Creators have had link-in-bio checkout tools for years, and I needed that exact same capability for my professional services. Marquee gives me one link where clients can see my rates and pay me directly.", "The entrepreneur"],
];

const STEPS = [
  ["Scan what you already have.", "Marquee scans your website, resume, LinkedIn, podcast and media, and helps you populate your pages and links."],
  ["Build your bio.", "Answer specific questions about your work history, professional skills, leadership and impact."],
  ["Build your storefront.", "Add the ways people can work with you, your rates and availability, and the products you sell."],
  ["Share your links.", "Put marquee.bio/yourname in your bios, your signature and everywhere you show up."],
  ["Get booked, hired and paid.", "Bookings, requests and sales come straight to you, with the payments handled."],
];



const FAQS = [
  ["Is this a replacement for LinkedIn?", "No. LinkedIn is where your network lives, and it does that well. Marquee is where your work lives: what you do, how you work, what you charge, and how someone books you. Most people keep both and put their Marquee link in their LinkedIn bio."],
  ["Who is Marquee for?", "Anyone whose value does not fit on one line. Fractional executives, consultants, coaches, advisors, founders, creators, and people in full-time roles who also advise, speak, write or sell."],
  ["Do I need an invite code?", "Yes, during the beta. Request one on the join page and we send it within a day. It gives you your first month free."],
  ["What does it cost after the beta?", "Founding Members keep $20 a month or $200 a year for as long as their membership is active. Marquee Pro will be $29 a month or $279 a year."],
  ["Can I take bookings and sell products?", "Yes. Set your rates and availability, and sell workshops, courses, downloads and events from your storefront. Today there is no Marquee fee on bookings or sales. You pay only the card processing cost."],
  ["What do analytics include?", "Visits to your pages over the last 30 days, how many people that was, where they came from, what they looked at, phone or computer, and country. Plus every booking, sale and customer, with the amounts."],
  ["Can I have a page for my business too?", "Yes. Each business gets its own address under your account."],
  ["Who can see my profile?", "Anyone with your link. Everything you publish is public, and anything you hide stays off the page while still counting for search. Nothing is shown until you press Publish."],
  ["Can I cancel?", "Yes, any time, from your account. Your membership stays active until the end of the period you have paid for, and your pages stay up until then. If you come back later, the Founding Member price will no longer be available."],
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
          <div className="flex gap-3 sm:gap-5 items-center">
            <Link href="/spotlight" className="px-4 sm:px-5 py-[9px] rounded-full border border-ink text-[13.5px] font-semibold whitespace-nowrap hover:bg-ink hover:text-white transition-colors"><span className="sm:hidden">Spotlight</span><span className="hidden sm:inline">Read Spotlight</span></Link>
            <Link href="/login" className="hidden sm:inline text-[13.5px] font-semibold whitespace-nowrap hover:text-dred transition-colors">Sign in</Link>
            <Link href="/join" className={`${BTN} bg-dred text-white hover:bg-red !px-4 sm:!px-5 !py-[10px] !text-[13.5px] whitespace-nowrap`}><span className="sm:hidden">Sign up</span><span className="hidden sm:inline">Sign Up Now</span></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO (white) ── */}
      <section className={`${SECTION} pt-[clamp(48px,6vw,86px)]`}>
        <div className={`${WRAP} grid md:grid-cols-[1.1fr_.9fr] gap-[clamp(30px,5vw,72px)] items-center`}>
          <div>
            <h1 className={H1}>One place for every way you work and earn.</h1>
            <p className="text-[clamp(17px,2.2vw,22px)] font-semibold leading-[1.4] mt-[18px] max-w-[600px]">Your professional profile, link-in-bio, and storefront.</p>
            <p className={`${LEDE} mt-4 max-w-[600px]`}>Showcase your work, skills, and expertise. Offer services, get hired, book clients, and sell products&mdash;all from your Marquee.</p>
            <div className="flex flex-col items-start sm:flex-row sm:flex-wrap sm:items-center gap-4 mt-8">
              <Link href="/join" className={`${BTN} bg-red text-white hover:bg-dred`}>Claim Yours &rarr;</Link>
              <span className="text-[16px]"><b>marquee.bio/</b><span className="text-ink/50">yourname</span></span>
            </div>
          </div>
          <div className="hidden md:block">
            <HeroVisual />
          </div>
          <div className="md:hidden mt-4">
            <HeroVisualMobile />
          </div>
        </div>
      </section>

      {/* ── WHO IT IS FOR (white): pick yourself ── */}
      <section id="for" className={`${SECTION} bg-beige`}>
        <div className={WRAP}>
          <h2 className={`${H2} max-w-[900px]`}>Who it&apos;s for.</h2>
          <p className={`${LEDE} mt-4 max-w-[720px]`}>For professionals who want to bring together all the ways they work, offer services, and monetize their expertise.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {FOR.map((f) => (
              <div key={f.h} className="bg-[#EDE7FF] rounded-[12px] p-[clamp(20px,2vw,28px)] min-h-[210px] flex flex-col justify-between">
                <div className="font-lora font-normal leading-[1.12] text-[clamp(22px,1.8vw,26px)]">{f.h}</div>
                <div className="text-[14px] leading-[1.55] mt-5 text-ink/85">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET (white): four stacking cards ── */}
      <section id="what" className={SECTION}>
        <div className={WRAP}>
          <h2 className={`${H2} max-w-[980px]`}>What you get.</h2>
          <p className={`${LEDE} mt-4 max-w-[720px]`}>From your professional profile to your digital storefront. More ways to work. More opportunities.</p>
          <Showcase />
        </div>
      </section>

      {/* ── INSIDE (wine): everything a Marquee holds ── */}
      <section id="inside" className={`${SECTION} bg-dred text-white`}>
        <div className={WRAP}>
          <h2 className={`${H2} max-w-[900px]`}>Our features.</h2>
          <p className={`${LEDE} mt-4 max-w-[720px] text-white/85`}>Everything you need to showcase your experience, get booked, and get paid. All in one place.</p>
          <Inside />
        </div>
      </section>

      {/* ── HOW IT WORKS (blue) ── */}
      <section id="how" className={`${SECTION} bg-[#EDE7FF]`}>
        <div className={WRAP}>
          <h2 className={H2}>How it works.</h2>
          <p className={`${LEDE} mt-4 max-w-[720px]`}>From your existing content to a personalized Marquee, ready to share in just a few simple steps.</p>
          <ol className="grid md:grid-cols-5 gap-3 mt-10">
            {STEPS.map(([h, b], i) => (
              <li key={h} className="relative bg-white rounded-[14px] p-[22px] md:p-[24px]">
                {i < STEPS.length - 1 && <span aria-hidden className="hidden md:block absolute -right-[14px] top-[24px] z-10 text-[18px] leading-none text-ink/35">&rarr;</span>}
                <h3 className="font-lora font-normal leading-[1.15] text-[clamp(20px,1.6vw,23px)]">{h}</h3>
                <p className="text-[14px] leading-[1.55] mt-3 text-ink/80">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── PRICING (beige) ── */}
      <section id="pricing" className={SECTION}>
        <div className={`${WRAP} text-center`}>
          <h2 className={H2}>Beta pricing.</h2>
          <p className={`${LEDE} mt-4 max-w-[760px] mx-auto`}>Join now as a Founding Member for $20/month, and keep that price for as long as your membership is active.</p>
          <Pricing mode="home" />
          <p className="text-[14px] text-ink/70 mt-7">When the beta closes, Marquee Pro will be $29/month or $279/year. <Link href="/pricing" className="underline underline-offset-2 text-ink hover:text-dred">See full pricing &rarr;</Link></p>
        </div>
      </section>

      {/* ── COMPARED (beige): Marquee next to what people use today ── */}
      <section id="compare" className={`${SECTION} bg-beige`}>
        <div className={WRAP}>
          <div className="text-center">
            <h2 className={`${H2} max-w-[900px] mx-auto`}>The all-in-one business hub for professionals.</h2>
            <p className={`${LEDE} mt-4 max-w-[760px] mx-auto`}>Bring together everything you need to showcase your expertise, work with clients, and sell your products and services.</p>
          </div>
          <Compare />
        </div>
      </section>

      {/* ── FAQ (white) ── */}
      <section className="py-[clamp(32px,5vw,68px)]">
        <div className={WRAP}>
          <div className={EYEBROW}>FAQ</div>
          <Faq />
        </div>
      </section>

      {/* ── CLOSING CTA (wine) ── */}
      <section id="apply" className={`${SECTION} bg-dred text-white`}>
        <div className={`${WRAP} text-center`}>
          <h2 className={H2}>Claim your Marquee.</h2>
          <div className={`${SCRIPT} mt-5`}>marquee.bio/yourname</div>
          <div className="mt-8"><Link href="/join" className={`${BTN} bg-red text-white hover:bg-white hover:text-dred`}>Sign Up Now</Link></div>
        </div>
      </section>

      {/* ── FOOTER (white) ── */}
      <footer className="bg-white text-ink border-t border-hair pt-14 pb-6">
        <div className={WRAP}>
          <div className="grid sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="text-[16.5px] font-medium tracking-[0.26em] mb-[14px]">MARQUEE</div>
              <p className="text-[14.5px] text-ink max-w-[300px]">The all-in-one business hub for professionals.</p>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.instagram.com/marquee.bio/" target="_blank" rel="noopener" aria-label="Instagram" className="w-[38px] h-[38px] rounded-full border border-hair hover:bg-ink hover:text-white hover:border-ink transition-colors flex items-center justify-center text-ink">
                  <IconInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink mb-[14px]">Product</h4>
              <ul className="space-y-[9px] text-[14.5px] text-ink">
                <li><a href="#for" className="hover:text-dred">Who it&apos;s for</a></li>
                <li><a href="#what" className="hover:text-dred">What you get</a></li>
                <li><a href="#inside" className="hover:text-dred">Features</a></li>
                <li><a href="#how" className="hover:text-dred">How it works</a></li>
                <li><Link href="/pricing" className="hover:text-dred">Pricing</Link></li>
                <li><Link href="/blueprint" className="hover:text-dred">Career Blueprint</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink mb-[14px]">Company</h4>
              <ul className="space-y-[9px] text-[14.5px] text-ink">
                <li><Link href="/spotlight" className="hover:text-dred">Spotlight</Link></li>
                <li><Link href="/about" className="hover:text-dred">About</Link></li>
                <li><a href="https://beknownweekly.substack.com/" target="_blank" rel="noopener" className="hover:text-dred">Newsletter</a></li>
                <li><a href="mailto:hello@marquee.bio" className="hover:text-dred">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex justify-between flex-wrap gap-[14px] text-[13px] text-ink">
            <div>© 2026 Marquee Identity, Inc.</div>
            <div><Link href="/privacy" className="hover:text-dred">Privacy</Link> &nbsp;·&nbsp; <Link href="/terms" className="hover:text-dred">Terms</Link> &nbsp;·&nbsp; <Link href="/login" className="hover:text-dred">Sign in</Link></div>
          </div>
        </div>
      </footer>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} source={waitlistSource} />
    </div>
  );
}

// Hero phone frame. If NEXT_PUBLIC_PROFILE_EMBED_URL is set (deployed profile app, or
// localhost in dev), iframe the REAL profile; otherwise render a prod-safe self-contained mock.
/* The four things you get: four cards that stack as you scroll, one word each, in brand colour. */
const BLOCKS = [
  { word: "Your profile", h: "Your Complete Professional Profile", body: "Bring together all of your professional experience, skills, clients, projects, portfolio, and media in a profile that reflects everything you know and have to offer." },
  { word: "Your services", h: "Every Way to Work With You", body: "From consulting and freelance projects to fractional roles, advisory, speaking, coaching, and 1:1 sessions. Present your services, rates, and availability, and let clients hire or book you directly." },
  { word: "Your storefront", h: "Your Storefront", body: "Sell events, courses, workshops, subscriptions, digital products, and more through a personalized storefront with integrated payments." },
  { word: "Your opportunities", h: "Professional Discovery", soon: true, body: "Get found, hired, and booked through the first professional intelligence platform powered by a comprehensive graph of experience, skills, expertise, services, and rates." },
];
function Showcase() {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-10">
      {BLOCKS.map((b, i) => (
        <div key={b.word} className="bg-beige border border-beigeLine rounded-[14px] px-[clamp(22px,3vw,40px)] py-[clamp(24px,2.6vw,34px)] min-h-[250px] flex flex-col justify-between">
          <div className="font-lora leading-[1] tracking-[-0.02em] text-[clamp(34px,3.6vw,52px)] text-ink">{b.word}.</div>
          <div className="mt-6">
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-dred mb-2">{i + 1} &middot; {b.h}</div>
            <p className="text-[15px] leading-[1.6] text-ink/85 max-w-[56ch]">{b.body}</p>
            {b.soon && <span className="inline-block mt-4 text-[10px] font-bold tracking-[0.14em] uppercase bg-[#C7B5FF] text-ink rounded-full px-[9px] py-[4px]">Discovery coming soon</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Everything inside a Marquee: ten things, with a small line drawing each. Longer ones sit beside longer ones so the rows stay level. */
const ICON: Record<string, string> = {
  profile: "M4 4h16v16H4z M9 13a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M7 20c1-3 9-3 10 0",
  portfolio: "M3 7h18v13H3z M8 7V4h8v3 M3 13h18",
  services: "M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4 M9 15l2 2 4-4",
  storefront: "M3 9l2-5h14l2 5 M3 9v11h18V9 M9 20v-6h6v6",
  media: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M6 11a6 6 0 0 0 12 0 M12 17v4 M9 21h6",
  links: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5",
  testimonials: "M4 4h16v12H8l-4 4z M9 9l2 2 4-4",
  analytics: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  brands: "M3 7h18v13H3z M9 7V4h6v3 M3 12h18 M12 10v4",
  design: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 3 0 3-2a9 9 0 0 0-5-11z M8 10h.01 M12 7h.01 M16 10h.01",
};
const FEATURES = [
  { i: "profile", h: "A complete professional profile", body: "Showcase your career experience, skills, leadership, impact, and expertise in a profile built for AI-powered professional discovery." },
  { i: "services", h: "Services & expert sessions", body: "Offer consulting, advisory, expert calls, coaching, speaking, and other professional engagements. Set rates and availability for direct bookings." },
  { i: "links", h: "Links & social channels", body: "Drive traffic to your website, business, newsletter, social accounts, affiliate pages, and other destinations." },
  { i: "brands", h: "Manage your brands & businesses", body: "Create and manage multiple Marquees for yourself, your businesses, and your brands—all from one account." },
  { i: "testimonials", h: "Testimonials & recommendations", body: "Share client testimonials, professional recommendations, and endorsements to build credibility." },
  { i: "analytics", h: "Analytics & business insights", body: "Track visitors, contacts, bookings, purchases, customers, sales, and revenue." },
  { i: "portfolio", h: "Portfolio & featured work", body: "Showcase clients, projects, case studies, and examples of your work." },
  { i: "storefront", h: "Your storefront", body: "Sell digital products, workshops, courses, events, and subscriptions." },
  { i: "media", h: "Media & features", body: "Feature articles, podcasts, interviews, videos, press, and other media." },
  { i: "design", h: "Your brand, your design", body: "Customize the look and feel of your Marquee to reflect your personal or business brand.", tag: "Coming soon" },
];
function Inside() {
  return (
    <div className="grid md:grid-cols-2 gap-x-[clamp(28px,5vw,80px)] gap-y-2 mt-10">
      {FEATURES.map((f) => (
        <div key={f.h} className="flex gap-5 py-6">
          <span className="shrink-0 w-[48px] h-[48px] rounded-full bg-white text-dred flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[f.i]} /></svg>
          </span>
          <div>
            <h3 className="font-lora font-normal leading-[1.15] text-[clamp(21px,1.8vw,26px)]">{f.h}</h3>
            <p className="text-[15px] leading-[1.6] mt-2 opacity-85 max-w-[46ch]">{f.body}</p>
            {f.tag && <span className="inline-block mt-3 text-[10.5px] font-bold tracking-[0.14em] uppercase bg-[#C7B5FF] text-ink rounded-full px-[10px] py-[5px]">{f.tag}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Why Marquee: the separate tools people pay for today, and the one place that replaces them. */
const TOOLS = [["Linktree", "Links & social channels", "/images/tools/linktree.svg", "#111111"], ["Calendly", "Scheduling & bookings", "/images/tools/calendly.svg", "#006BFF"], ["intro.co", "Paid expert sessions", "", "#111111"], ["Squarespace", "Website & portfolio", "/images/tools/squarespace.svg", "#111111"], ["Shopify", "Storefront & commerce", "/images/tools/shopify.svg", "#96BF48"]];
function Compare() {
  return (
    <div className="mt-10 max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {TOOLS.map(([n, d, src, color]) => (
          <div key={n} className="bg-white border border-beigeLine rounded-[14px] px-4 py-4 md:py-6 flex md:block items-center gap-4 text-left md:text-center">
            <span className="inline-flex h-[40px] w-[40px] md:w-auto shrink-0 items-center justify-center">
              {src ? <span className="block w-[34px] h-[34px]" style={{ backgroundColor: color, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskPosition: "center", maskPosition: "center" }} aria-hidden />
                   : <span className="font-sans font-bold text-[15px] md:text-[22px] tracking-[-0.02em]">intro</span>}
            </span>
            <div><div className="font-semibold text-[15.5px] md:mt-3">{src ? n : <><span className="md:hidden">intro.co</span><span className="hidden md:inline">&nbsp;</span></>}</div>
            <div className="text-[13px] leading-[1.4] text-ink/65 mt-0 md:mt-1">{d}</div></div>
          </div>
        ))}
      </div>
      <svg aria-hidden viewBox="0 0 1000 90" className="hidden md:block w-full h-[90px]" fill="none" stroke="#111111" strokeWidth="1.5">
        <path d="M100 0 C100 50 500 30 500 84" /><path d="M300 0 C300 50 500 30 500 84" /><path d="M500 0 V84" /><path d="M700 0 C700 50 500 30 500 84" /><path d="M900 0 C900 50 500 30 500 84" />
        <circle cx="500" cy="84" r="5" fill="#111111" stroke="none" />
      </svg>
      <div className="md:hidden w-px h-10 bg-ink mx-auto" />
      <div className="bg-dred text-white rounded-[999px] px-[clamp(28px,4vw,56px)] py-[20px] text-center md:mt-0 w-fit mx-auto">
        <div className="font-sans font-medium tracking-[0.3em] text-[clamp(18px,2vw,26px)] leading-none">MARQUEE</div>
      </div>
    </div>
  );
}

/* The hero example on a phone: the links page in a phone, two activity cards. */
function HeroVisualMobile() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT((x) => x + 1), 3200); return () => clearInterval(id); }, []);
  const n = HERO_ACTIONS.length;
  const slots = [HERO_ACTIONS[t % n], HERO_ACTIONS[(t + 3) % n]];
  const card = "absolute whitespace-nowrap bg-white border border-beigeLine rounded-[10px] shadow-[0_14px_34px_rgba(17,17,17,0.12)] px-3 py-2 text-[11.5px] leading-[1.35] hv-swap";
  const tag = "block text-[9.5px] font-bold tracking-[0.12em] uppercase text-dred mb-[1px]";
  return (
    <div className="relative w-full max-w-[360px] mx-auto aspect-[360/440]">
      <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-[52%] aspect-[9/17.4] rounded-[26px] border-[5px] border-ink bg-white overflow-hidden shadow-[0_22px_50px_rgba(17,17,17,0.18)]">
        <Image src="/images/home/links.jpg" alt="A Marquee as a link in bio on a phone" width={600} height={1170} className="absolute inset-0 w-full h-full object-cover object-top" priority />
      </div>
      <div key={`a-${t}`} className={`${card} left-0 top-[52%]`}><span className={tag}>{slots[0][0]}</span>{slots[0][1]}</div>
      <div key={`b-${t}`} className={`${card} right-0 bottom-[10%]`}><span className={tag}>{slots[1][0]}</span>{slots[1][1]}</div>
    </div>
  );
}

/* The FAQ: every answer closed, four questions shown, the rest behind one link. */
function Faq() {
  const [all, setAll] = useState(false);
  const shown = all ? FAQS : FAQS.slice(0, 2);
  return (
    <div className="mt-6 max-w-[900px]">
      {shown.map(([q, a]) => (
        <details key={q} className="border-b border-hair py-[18px] group">
          <summary className="text-[18px] font-semibold cursor-pointer list-none flex justify-between gap-5 [&::-webkit-details-marker]:hidden">
            {q}<span className="text-red text-[24px] leading-none group-open:hidden">+</span><span className="text-red text-[24px] leading-none hidden group-open:inline">&ndash;</span>
          </summary>
          <p className="mt-3 max-w-[760px] text-[15px] leading-[1.6]">{a}</p>
        </details>
      ))}
      {!all && <button type="button" onClick={() => setAll(true)} className="mt-5 font-semibold text-[14.5px] underline underline-offset-4 hover:text-dred">More questions &darr;</button>}
    </div>
  );
}

/* The hero example: a real profile on a computer, its links page on a phone, and what happens on it. The cards turn through real kinds of activity. */
const HERO_ACTIONS: [string, string][] = [
  ["New opportunity", "Fractional CMO \u00b7 6-month engagement"],
  ["New booking", "60-min Strategy Session \u00b7 $150 \u00b7 Dec 1, 12:00 PM ET"],
  ["New sale", "Leadership workshop $499"],
  ["New request", "Speaking Engagement $1000"],
  ["New opportunity", "Advisory Board Invitation"],
  ["Booked", "1:1 Call \u00b7 $150 \u00b7 Nov 14, 3:00 PM ET"],
];
function HeroVisual() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT((x) => x + 1), 3200); return () => clearInterval(id); }, []);
  const n = HERO_ACTIONS.length;
  const slots = [HERO_ACTIONS[t % n], HERO_ACTIONS[(t + 1) % n], HERO_ACTIONS[(t + 2) % n], HERO_ACTIONS[(t + 3) % n], HERO_ACTIONS[(t + 4) % n]];
  const card = "absolute whitespace-nowrap bg-white border border-beigeLine rounded-[10px] shadow-[0_14px_34px_rgba(17,17,17,0.12)] px-4 py-[10px] text-[12px] leading-[1.35] hv-card";
  const tag = "block text-[10px] font-bold tracking-[0.12em] uppercase text-dred mb-[2px]";
  const pos = ["left-[0%] top-[0%]", "left-[-2%] top-[40%]", "right-[-2%] top-[17%]", "left-[2%] bottom-[0%]", "right-[-3%] top-[60%]"];
  return (
    <div className="relative w-full max-w-[760px] mx-auto aspect-[760/660] hero-visual">
      <div className="absolute left-0 top-[64px] w-[84%] rounded-[10px] border border-beigeLine shadow-[0_26px_60px_rgba(17,17,17,0.14)] overflow-hidden bg-white hv-desk">
        <Image src="/images/home/profile.jpg" alt="A Marquee profile on a computer" width={1400} height={1029} className="w-full h-auto block" priority />
      </div>
      <div className="absolute right-0 bottom-[24px] w-[28%] aspect-[9/17.4] rounded-[28px] border-[6px] border-ink bg-white overflow-hidden shadow-[0_26px_60px_rgba(17,17,17,0.18)] hv-phone">
        <Image src="/images/home/links.jpg" alt="The same Marquee as a link in bio on a phone" width={600} height={1170} className="absolute inset-0 w-full h-full object-cover object-top" priority />
      </div>
      {slots.map(([k, v], i) => (
        <div key={`${i}-${t}`} className={`${card} ${pos[i]} hv-swap`}><span className={tag}>{k}</span>{v}</div>
      ))}
    </div>
  );
}
