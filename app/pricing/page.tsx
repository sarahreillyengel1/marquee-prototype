import BrandShell from "@/components/BrandShell";
import Link from "next/link";

export const metadata = { title: "Pricing · Marquee" };

const FEATURES = [
  "Your full ELVISS profile — Experience, Leadership, Values, Impact, Skills, Story",
  "Your own marquee.bio/username URL",
  "Edit any section anytime",
  "Profile views counter",
  "Inbound contact — people can reach you through your Marquee",
];

export default function PricingPage() {
  return (
    <BrandShell source="pricing">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Pricing
      </span>
      <h1 className="font-canela text-5xl md:text-6xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
        One price. Everything in.
      </h1>
      <p className="text-lg text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        No tiers, no upsells. Get your full personal brand platform for less than the cost
        of a coffee a month.
      </p>

      <div className="mt-16 max-w-md bg-white rounded-3xl p-10 border border-brand-stone">
        <div className="flex items-baseline gap-2">
          <span className="font-canela text-6xl text-brand-ink">$46</span>
          <span className="text-brand-ink/60">/ year</span>
        </div>
        <p className="text-sm text-brand-ink/60 mt-2">Cancel anytime.</p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-brand-ink">
              <span className="text-brand-green mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="block text-center mt-8 px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Get started
        </Link>
        <p className="text-xs text-brand-ink/50 text-center mt-3">
          Have a beta code? Use it at checkout — it&apos;s on us.
        </p>
      </div>
    </BrandShell>
  );
}
