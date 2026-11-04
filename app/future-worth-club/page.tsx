import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import { DM_Serif_Display, Jost, Pinyon_Script } from "next/font/google";
import ApplyForm from "./ApplyForm";

export const metadata = {
  title: "Future Worth Club · Marquee",
  description: "A club for people thinking bigger about their careers, money, and what's possible next. Content, community and events, powered by Marquee. Apply to join.",
};

// Future Worth Club type (Sarah's brand sheet, 2 Nov 2026): DM Serif Display for display, Jost 300/400 for text with wide-tracked caps, one script word, never a line.
// Colour (Sarah, 2 Nov 2026): Club Green #1E3A2C is the prominent colour (hero, Join, section headings); Marquee home page wine `dred` is the three Content / Community / Events cards, never text (Sarah, 2 Nov 2026), beige `beige`, white, orange `red` on buttons only.
const display = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--fw-display" });
const jost = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--fw-text" });
const script = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--fw-script" });

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const DISPLAY = "font-[family-name:var(--fw-display)] font-normal tracking-[-0.005em] leading-[1.04]";
const CAPS = "font-[family-name:var(--fw-text)] font-normal uppercase tracking-[0.3em]";
const SCRIPT = "font-[family-name:var(--fw-script)] font-normal";
const BTN = "inline-block px-7 py-[14px] rounded-full text-[13px] font-medium uppercase tracking-[0.18em] text-center transition-colors";

// Copy approved by Sarah word for word, 2 Nov 2026.
const PILLARS = [
  {
    eyebrow: "Content",
    h: "Good ideas are worth sharing.",
    body: ["Future Worth is our home for conversations about money, careers, entrepreneurship, AI, leadership, and what our expertise is worth. Essays, interviews, news, and perspectives on the changing world of work.", "Podcast coming soon."],
    li: ["Original essays", "Member stories and interviews", "News and opportunities", "Podcast coming soon"],
    href: "/spotlight", label: "Read Future Worth",
  },
  {
    eyebrow: "Community",
    h: "Good company changes everything.",
    body: ["A private space to connect with people who bring experience, perspective, and generosity to the table. Share what you’re working on, ask questions, exchange ideas, make introductions, and discover opportunities through people you trust."],
    li: ["Meaningful connections", "Ideas and advice", "Introductions and opportunities"],
    href: "#apply", label: "Join the Club",
  },
  {
    eyebrow: "Events",
    h: "Better conversations happen together.",
    body: ["From intimate dinners and supper clubs to working sessions and conversations with people shaping the future of work. Our events bring interesting people together to exchange ideas, learn something new, and build relationships that continue beyond the room."],
    li: ["Supper clubs and dinners", "Expert conversations", "Working sessions and gatherings"],
    href: "#apply", label: "Join the Club",
  },
];

const WHO = [
  "Professionals, founders, entrepreneurs, and leaders with 8+ years of professional experience.",
  "People building careers, businesses, ideas, and new sources of income.",
  "Those who value thoughtful conversations, meaningful relationships, and helping others succeed.",
  "Members who contribute, connect, and participate.",
];

export default function FutureWorthClubPage() {
  return (
    <BrandShell source="future-worth-club">
      <div className={`${display.variable} ${jost.variable} ${script.variable} font-[family-name:var(--fw-text)] bg-paper text-ink`}>

        {/* Hero (wine, full-bleed) */}
        <section className="bg-[#1E3A2C] text-white py-[clamp(56px,8vw,120px)]">
          <div className={`${WRAP} max-w-[1000px]`}>
            <div className={`${CAPS} text-[13px] leading-[1.9] text-white/90`}>Future<br />Worth<br />Club</div>
            <h1 className={`${DISPLAY} mt-8 text-[clamp(38px,7vw,84px)]`}>What is your future worth?</h1>
            <p className="text-[clamp(16px,2vw,21px)] leading-[1.55] mt-7 max-w-[720px] font-light">
              A club for people thinking bigger about their careers, money, and what&rsquo;s possible next. Bringing together experienced professionals, entrepreneurs, and leaders to exchange ideas, build meaningful connections, and create new opportunities.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <a href="#apply" className={`${BTN} bg-red text-white hover:bg-white hover:text-[#1E3A2C]`}>Join the Club</a>
              <a href="#what" className={`${BTN} border border-white/60 text-white hover:bg-white hover:text-[#1E3A2C]`}>Explore the Club</a>
            </div>
            <div className={`${CAPS} text-[12px] mt-14 text-white/70`}>Ideas &middot; Connections &middot; Opportunity</div>
          </div>
        </section>

        {/* What is Future Worth Club? (white) */}
        <section id="what" className="py-[clamp(48px,6vw,96px)] border-b border-hair scroll-mt-16">
          <div className={`${WRAP} grid md:grid-cols-[1fr_1.2fr] gap-[clamp(28px,5vw,72px)] items-start`}>
            <div>
              <div className={`${CAPS} text-[12px] text-[#1E3A2C]`}>What is Future Worth Club?</div>
              <h2 className={`${DISPLAY} mt-4 text-[clamp(28px,4.5vw,52px)] text-[#1E3A2C]`}>The future is worth more together.</h2>
              <div className={`${SCRIPT} text-[clamp(44px,6vw,72px)] leading-none text-[#1E3A2C] mt-5`}>Club</div>
            </div>
            <div className="space-y-5 text-[clamp(16px,1.6vw,18px)] leading-[1.65] max-w-[600px]">
              <p>The way we work, build careers, and earn is changing. Future Worth Club brings together people who want to be part of that conversation and help shape what comes next.</p>
              <p>Through our community, content, and events, we connect people, perspectives, and opportunities. Expect meaningful introductions, honest conversations about money and work, fresh ideas, and access to people who have experience worth sharing.</p>
              <p className={`${CAPS} text-[12px] text-[#1E3A2C] pt-2`}>A curated community, built for meaningful connections.</p>
            </div>
          </div>
        </section>

        {/* Content · Community · Events (beige, white cards) */}
        <section className="bg-beige py-[clamp(48px,6vw,96px)]">
          <div className={WRAP}>
            <div className={`${CAPS} text-[12px] text-[#1E3A2C]`}>Inside the Club</div>
            <h2 className={`${DISPLAY} mt-4 text-[clamp(28px,4.5vw,52px)] text-[#1E3A2C]`}>Content. Community. Events.</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-11">
              {PILLARS.map((p) => (
                <div key={p.eyebrow} className="bg-dred text-white rounded-[10px] p-[clamp(26px,3vw,38px)] flex flex-col">
                  <div className={`${CAPS} text-[11px] text-white/70`}>{p.eyebrow}</div>
                  <h3 className={`${DISPLAY} mt-4 text-[clamp(24px,2.6vw,34px)]`}>{p.h}</h3>
                  {p.body.map((b) => <p key={b} className="text-[15.5px] leading-[1.6] mt-4">{b}</p>)}
                  <ul className="mt-6 flex-1">
                    {p.li.map((l) => (
                      <li key={l} className="text-[14.5px] py-[10px] border-t border-white/20 flex gap-[12px] items-start">
                        <span className="mt-[8px] w-[6px] h-[6px] rounded-full bg-red shrink-0" />{l}
                      </li>
                    ))}
                  </ul>
                  {p.href.startsWith("#")
                    ? <a href={p.href} className={`${CAPS} text-[12px] mt-8 text-white underline underline-offset-[6px] decoration-1`}>{p.label}</a>
                    : <Link href={p.href} className={`${CAPS} text-[12px] mt-8 text-white underline underline-offset-[6px] decoration-1`}>{p.label}</Link>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join the Club (wine, full-bleed) */}
        <section className="bg-[#1E3A2C] text-white py-[clamp(48px,6vw,96px)]">
          <div className={`${WRAP} grid md:grid-cols-[1fr_1.1fr] gap-[clamp(28px,5vw,72px)] items-start`}>
            <div>
              <div className={`${CAPS} text-[12px] text-white/70`}>Join the Club</div>
              <h2 className={`${DISPLAY} mt-4 text-[clamp(28px,4.5vw,52px)]`}>Your seat at the table.</h2>
              <p className="text-[clamp(15.5px,1.8vw,18px)] leading-[1.55] mt-5 max-w-[520px] font-light">
                We&rsquo;re bringing together people with different experiences, perspectives, and ideas, connected by a shared interest in the future of work, money, and opportunity.
              </p>
              {/* DRAFT (4 Nov 2026): says what "Join the Club" is. Sarah: "join the club (is the slack group)". Awaiting her word-for-word OK. */}
              <p className="text-[clamp(15.5px,1.8vw,18px)] leading-[1.55] mt-4 max-w-[520px] font-light">
                Joining the Club means joining our private Slack group, where the conversation happens every day.
              </p>
              <div className={`${CAPS} text-[12px] mt-10 text-white/70`}>Who it&rsquo;s for</div>
              <ul className="mt-3 max-w-[520px]">
                {WHO.map((w) => (
                  <li key={w} className="text-[15.5px] leading-[1.55] py-[11px] border-t border-white/20 flex gap-[12px] items-start">
                    <span className="mt-[8px] w-[6px] h-[6px] rounded-full bg-red shrink-0" />{w}
                  </li>
                ))}
              </ul>
              {/* DRAFT (4 Nov 2026): Sarah: "access is free". Awaiting her word-for-word OK. */}
              <p className="text-[14px] text-white/75 mt-7 max-w-[520px]">Access is free. Membership is curated and applications are reviewed.</p>
            </div>
            <ApplyForm />
          </div>
        </section>

        {/* Footer line (white) */}
        <section className="py-[clamp(40px,5vw,72px)] text-center">
          <div className={`${CAPS} text-[12px] text-[#1E3A2C]`}>Future Worth Club &middot; Est. 2026 &middot; Powered by Marquee</div>
        </section>
      </div>
    </BrandShell>
  );
}
