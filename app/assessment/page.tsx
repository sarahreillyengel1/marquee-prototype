import BrandShell from "@/components/BrandShell";
import Link from "next/link";

export const metadata = { title: "Passion Career Assessment · Marquee" };

export default function AssessmentPage() {
  return (
    <BrandShell source="assessment">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Free Assessment
      </span>
      <h1 className="font-canela text-5xl md:text-6xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
        The Passion Career Assessment.
      </h1>
      <p className="text-lg text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        35 insightful questions to map your unique passions, values, and strengths — and
        translate what you love into a clear 30-Day Blueprint.
      </p>

      <div className="mt-12 p-10 bg-brand-lavender/30 rounded-3xl max-w-2xl">
        <h3 className="font-canela text-2xl text-brand-ink">Coming soon.</h3>
        <p className="text-brand-ink/70 mt-3 leading-relaxed">
          We&apos;re putting the finishing touches on the assessment experience. Add yourself
          to the waitlist and we&apos;ll send it the moment it&apos;s ready.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-7 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Join the Waitlist
        </Link>
      </div>
    </BrandShell>
  );
}
