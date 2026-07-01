import BrandShell from "@/components/BrandShell";
import Link from "next/link";

export const metadata = { title: "Pricing · Marquee" };

const INCLUDED = [
  "Your full personal brand profile — Experience, Leadership, Values, Impact, Skills, Story",
  "Your own marquee.bio/username URL",
  "AI-generated career narrative from your Assessment",
  "Edit any section anytime — always yours to change",
  "Profile views counter — see who's paying attention",
  "Inbound contact — people can reach you through your Marquee",
  "Custom themes — light, dark, indigo, warm",
  "Priority beta access as new features roll out",
];

export default function PricingPage() {
  return (
    <BrandShell source="pricing">
      {/* Hero */}
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Pricing
      </span>
      <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl text-brand-ink leading-[1.02] mt-3 max-w-4xl tracking-[-0.01em]">
        One price. Everything in.
      </h1>
      <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        No tiers, no upsells. Get your full personal brand platform for less than the cost
        of a coffee a month.
      </p>

      {/* Main pricing card */}
      <div className="mt-16 grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
        {/* Left: the price */}
        <div className="bg-brand-lavender/40 rounded-3xl p-10 md:p-12 lg:sticky lg:top-8">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
            Marquee
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-canela text-7xl md:text-8xl text-brand-ink leading-none">
              $46
            </span>
            <span className="text-brand-ink/60 text-lg">/ year</span>
          </div>
          <p className="text-sm text-brand-ink/60 mt-3">
            About $3.83/month. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="block text-center mt-8 px-6 py-3.5 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/"
            className="block text-center mt-3 px-6 py-3.5 rounded-full border-2 border-brand-ink text-brand-ink font-medium hover:bg-brand-ink hover:text-white transition-colors"
          >
            Join the Waitlist
          </Link>
          <p className="text-xs text-brand-ink/50 text-center mt-4">
            Have a beta code? Use it at checkout — it&apos;s on us.
          </p>
        </div>

        {/* Right: what's included */}
        <div className="bg-white rounded-3xl p-10 md:p-12 border border-brand-stone">
          <h2 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight">
            What&apos;s included
          </h2>
          <ul className="mt-8 space-y-4">
            {INCLUDED.map((f) => (
              <li key={f} className="flex items-start gap-3 text-brand-ink">
                <div className="shrink-0 w-6 h-6 rounded-full bg-brand-green flex items-center justify-center mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="#111111"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-brand-ink/85 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparison strip */}
      <div className="mt-24 pt-16 border-t border-brand-stone">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          For context
        </span>
        <h2 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight mt-3 max-w-3xl">
          $46 a year is less than most professionals spend on…
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { thing: "One resume review", price: "$150–$400" },
            { thing: "One LinkedIn Premium month", price: "$40" },
            { thing: "One month of a career coach", price: "$300+" },
          ].map((c) => (
            <div key={c.thing} className="bg-white rounded-2xl p-6 border border-brand-stone">
              <div className="font-canela text-2xl text-brand-ink">{c.price}</div>
              <div className="text-sm text-brand-ink/60 mt-2">{c.thing}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-brand-ink/60 mt-6 italic max-w-2xl">
          Marquee runs for a full year on less than what most people pay for one resume rewrite.
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-24 pt-16 border-t border-brand-stone">
        <h2 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight max-w-3xl">
          Pricing questions.
        </h2>
        <div className="mt-10 space-y-6 max-w-3xl">
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel from your dashboard in one click. Your profile stays live until the end of your billing year.",
            },
            {
              q: "What happens to my profile if I cancel?",
              a: "Your marquee.bio/username stays reserved for you. Your data is preserved — you can restart your subscription anytime and pick up exactly where you left off.",
            },
            {
              q: "Do you offer team or agency pricing?",
              a: "Not yet — Marquee is designed as a personal-brand platform for individual professionals. Reach out if you have a specific use case; we're listening.",
            },
          ].map((f) => (
            <div key={f.q}>
              <h3 className="font-canela text-xl text-brand-ink">{f.q}</h3>
              <p className="text-brand-ink/70 mt-2 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </BrandShell>
  );
}
