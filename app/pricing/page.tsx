import BrandShell from "@/components/BrandShell";
import Pricing from "@/components/Pricing";

export const metadata = { title: "Pricing · Marquee" };

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1.08] text-[clamp(22px,4.5vw,44px)]";
const EYEBROW = "text-[12px] font-bold tracking-[0.18em] uppercase text-dred";
const LEDE = "text-[clamp(15px,2vw,18px)] leading-[1.55]";

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

export default function PricingPage() {
  return (
    <BrandShell source="pricing">
      <section className="bg-beige py-[clamp(48px,6vw,88px)]">
        <div className={`${WRAP} text-center`}>
          <div className={EYEBROW}>What it costs</div>
          <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(28px,6vw,66px)] mt-4">Pricing.</h1>
          <p className={`${LEDE} mt-4 max-w-[760px] mx-auto`}>Join now as a Founding Member for $20/month and keep that price for as long as your membership is active. When the beta closes, Marquee Pro will be $29/month or $279/year.</p>
          <Pricing mode="full" />
        </div>
      </section>
      {/* ── MONETIZE (white) ── */}
      <section id="earn" className="py-[clamp(48px,6vw,88px)]">
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

    </BrandShell>
  );
}
