import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import ApplyForm from "./ApplyForm";
import { DM_Serif_Display, Jost, Pinyon_Script } from "next/font/google";
import { Badge, Essay, People, Glasses } from "./Art";

export const metadata = {
  title: "Future Worth Club · Marquee",
  description: "A club for people thinking bigger about their careers, money, and what's possible next. Content, community and events, powered by Marquee. Apply to join.",
};

// Future Worth Club brand sheet (Sarah, 6 Nov 2026):
//   Colour: Club Green #1E3A2C primary · Oxblood #670821 evening · Ink #22293B text · Cream #F2ECDF paper · Sky Blue #A8CFFF foil · Marigold #EDBB2D poster · Orange #FF5436 poster · Blush #E8A595 soft (not used: Sarah, 6 Nov)
//   Type: DM Serif Display for display (italic for one word) · Jost 300/400 for text, caps always tracked wide · accent script for one word, never a line.
// Design (7 Nov): one color per section, never more than two on a screen. Green hero · Cream intro · Sky Blue with cream cards · Oxblood join. Orange on buttons. Sarah, 7 Nov: three colors a screen was "way too colorful"; green, cream and orange alone was too few.
const display = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--fw-display" });
const jost = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--fw-text" });
const script = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--fw-script" });

const GREEN = "#1E3A2C", OXBLOOD = "#670821", INK = "#22293B", CREAM = "#F2ECDF", SKY = "#A8CFFF", ORANGE = "#FF5436";
const WRAP = "max-w-[1280px] mx-auto px-[clamp(20px,5vw,72px)]";
const DISPLAY = "font-[family-name:var(--fw-display)] font-normal tracking-[-0.01em] leading-[1.0]";
const CAPS = "font-[family-name:var(--fw-text)] font-normal uppercase tracking-[0.3em] text-[12px]";
const SCRIPT = "font-[family-name:var(--fw-script)] font-normal";
const BTN = "inline-block px-7 py-[15px] rounded-full text-[13px] font-medium uppercase tracking-[0.18em] text-center transition-colors";
const ICONS = [Essay, People, Glasses];

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
      <div className={`${display.variable} ${jost.variable} ${script.variable} font-[family-name:var(--fw-text)] text-[#22293B] bg-[#F2ECDF]`}>

        {/* Hero (Club Green): huge headline, Marigold badge */}
        <section className="text-[#F2ECDF] pt-[clamp(44px,6vw,88px)] pb-[clamp(44px,6vw,80px)] overflow-hidden" style={{ background: GREEN }}>
          <div className={`${WRAP} grid md:grid-cols-[1.2fr_.8fr] gap-[clamp(28px,4vw,56px)] items-center`}>
            <div>
              <div className={`inline-flex items-center px-4 py-[9px] rounded-full border-[1.5px] border-[#F2ECDF] text-[#F2ECDF] ${CAPS} !tracking-[0.22em] !text-[11px]`}>Future Worth Club</div>
              <h1 className={`${DISPLAY} mt-7 text-[clamp(50px,8.4vw,120px)]`}>
                What is your<br />
                <em className="italic">future</em> worth?
              </h1>
              <p className="text-[clamp(17px,1.9vw,21px)] leading-[1.5] mt-7 max-w-[600px] font-light">
                A club for people thinking bigger about their careers, money, and what&rsquo;s possible next. Bringing together experienced professionals, entrepreneurs, and leaders to exchange ideas, build meaningful connections, and create new opportunities.
              </p>
              <div className="flex flex-wrap gap-3 mt-9">
                <a href="#apply" className={`${BTN} bg-[#FF5436] text-white hover:bg-[#F2ECDF] hover:text-[#1E3A2C]`}>Join the Club</a>
                <a href="#what" className={`${BTN} border-[1.5px] border-[#F2ECDF] text-[#F2ECDF] hover:bg-[#F2ECDF] hover:text-[#1E3A2C]`}>Explore the Club</a>
              </div>
            </div>
            <Badge className="w-[240px] h-[268px] mx-auto md:mx-0 md:w-[clamp(280px,30vw,400px)] md:h-[clamp(312px,33.5vw,447px)] md:justify-self-end rotate-[-6deg] drop-shadow-[0_18px_0_rgba(0,0,0,.18)]" />
          </div>
        </section>

        {/* What is Future Worth Club? (Cream) */}
        <section id="what" className="py-[clamp(56px,7vw,112px)] scroll-mt-16" style={{ background: CREAM }}>
          <div className={WRAP}>
            <div className={CAPS} style={{ color: GREEN }}>What is Future Worth Club?</div>
            <h2 className={`${DISPLAY} mt-5 text-[clamp(40px,6.2vw,88px)] max-w-[1050px]`} style={{ color: GREEN }}>
              The future is worth more <span className={`${SCRIPT} font-normal tracking-normal text-[1.25em] leading-none`}>together.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-x-[clamp(28px,5vw,72px)] gap-y-5 mt-[clamp(28px,4vw,52px)] text-[clamp(17px,1.7vw,20px)] leading-[1.6] font-light max-w-[1100px]">
              <p>The way we work, build careers, and earn is changing. Future Worth Club brings together people who want to be part of that conversation and help shape what comes next.</p>
              <p>Through our community, content, and events, we connect people, perspectives, and opportunities. Expect meaningful introductions, honest conversations about money and work, fresh ideas, and access to people who have experience worth sharing.</p>
            </div>
            <p className={`${CAPS} mt-[clamp(28px,3vw,40px)]`} style={{ color: GREEN }}>A curated community, built for meaningful connections.</p>
          </div>
        </section>

        {/* Content · Community · Events: cream cards on Sky Blue */}
        <section className="py-[clamp(48px,6vw,88px)] border-y-[3px] border-[#22293B]" style={{ background: SKY, color: INK }}>
          <div className={`${WRAP} grid md:grid-cols-3 gap-[18px]`}>
            {PILLARS.map((p, i) => {
              const Icon = ICONS[i];
              return (
                <div key={p.eyebrow} className="p-[clamp(26px,3vw,40px)] flex flex-col border-[3px] border-[#22293B]" style={{ background: CREAM }}>
                  <div className="flex items-start justify-between" style={{ color: GREEN }}>
                    <span className={`${DISPLAY} italic text-[clamp(60px,5.6vw,88px)] leading-[.85]`}>0{i + 1}</span>
                    <Icon className="w-[60px] h-[60px]" />
                  </div>
                  <div className={`${CAPS} mt-8`} style={{ color: GREEN }}>{p.eyebrow}</div>
                  <h3 className={`${DISPLAY} mt-3 text-[clamp(28px,2.6vw,36px)]`} style={{ color: GREEN }}>{p.h}</h3>
                  {p.body.map((b) => <p key={b} className="text-[15.5px] leading-[1.6] mt-4 font-light">{b}</p>)}
                  <ul className="mt-6 flex-1">
                    {p.li.map((l) => (
                      <li key={l} className="text-[15px] py-[10px] flex gap-[12px] items-start border-t border-[#22293B]/25">
                        <span className="mt-[8px] w-[7px] h-[7px] rounded-full shrink-0" style={{ background: ORANGE }} />{l}
                      </li>
                    ))}
                  </ul>
                  {p.href.startsWith("#")
                    ? <a href={p.href} className={`${BTN} mt-8 self-start bg-[#FF5436] text-white hover:bg-[#1E3A2C]`}>{p.label}</a>
                    : <Link href={p.href} className={`${BTN} mt-8 self-start bg-[#FF5436] text-white hover:bg-[#1E3A2C]`}>{p.label}</Link>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Join the Club (Oxblood, the evening color) */}
        <section className="text-[#F2ECDF] py-[clamp(56px,7vw,104px)]" style={{ background: OXBLOOD }}>
          <div className={`${WRAP} grid md:grid-cols-[1fr_1.1fr] gap-[clamp(28px,5vw,72px)] items-start`}>
            <div>
              <div className={`${CAPS} text-[#F2ECDF]/70`}>Join the Club</div>
              <h2 className={`${DISPLAY} mt-5 text-[clamp(40px,5.4vw,76px)]`}>Your seat at the table.</h2>
              <p className="text-[clamp(16.5px,1.8vw,19px)] leading-[1.55] mt-6 max-w-[520px] font-light">
                We&rsquo;re bringing together people with different experiences, perspectives, and ideas, connected by a shared interest in the future of work, money, and opportunity.
              </p>
              {/* DRAFT (4 Nov 2026): says what "Join the Club" is. Sarah: "join the club (is the slack group)". Awaiting her word-for-word OK. */}
              <p className="text-[clamp(16.5px,1.8vw,19px)] leading-[1.55] mt-4 max-w-[520px] font-light">
                Joining the Club means joining our private Slack group, where the conversation happens every day.
              </p>
              {/* DRAFT (4 Nov 2026): Sarah: "access is free". Awaiting her word-for-word OK. */}
              <div className={`${CAPS} mt-10 text-[#F2ECDF]/70`}>Who it&rsquo;s for</div>
              <ol className="mt-2 max-w-[520px]">
                {WHO.map((w, i) => (
                  <li key={w} className="grid grid-cols-[44px_1fr] gap-3 items-baseline py-[13px] border-t border-[#F2ECDF]/25">
                    <span className={`${DISPLAY} italic text-[26px] leading-none text-[#F2ECDF]/70`}>0{i + 1}</span>
                    <span className="text-[16px] leading-[1.5] font-light">{w}</span>
                  </li>
                ))}
              </ol>
              <ul className={`${CAPS} mt-9 !text-[11px] space-y-[6px] text-[#F2ECDF]/70`}>
                <li>Access is free</li><li>Membership is curated</li><li>Applications are reviewed</li>
              </ul>
            </div>
            <ApplyForm />
          </div>
        </section>

        {/* Footer line (Cream) */}
        <section className="py-[clamp(36px,4vw,56px)] text-center border-t-[3px] border-[#22293B]" style={{ background: CREAM }}>
          <div className={CAPS} style={{ color: GREEN }}>Future Worth Club &middot; Est. 2026 &middot; Powered by Marquee</div>
        </section>
      </div>
    </BrandShell>
  );
}
