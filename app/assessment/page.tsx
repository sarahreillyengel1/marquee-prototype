import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import {
  IconAssessment,
  IconDiscovery,
  IconBlueprint,
  GeometricM,
} from "@/components/icons";

export const metadata = { title: "Passion Career Assessment · Marquee" };

const STEPS = [
  {
    icon: <IconAssessment className="w-6 h-6" />,
    title: "Start the Assessment",
    body: "35 insightful questions designed to map your unique passions, values, and strengths.",
    progress: 1,
  },
  {
    icon: <IconDiscovery className="w-6 h-6" />,
    title: "The Discovery",
    body: "Uncover your true purpose, drivers, and goals.",
    progress: 2,
  },
  {
    icon: <IconBlueprint className="w-6 h-6" />,
    title: "Your 30-Day Blueprint",
    body: "A personalized roadmap highlighting your unique opportunities, complete with a practical 30-day action plan.",
    progress: 3,
  },
];

export default function AssessmentPage() {
  return (
    <BrandShell source="assessment">
      {/* Hero with M backdrop */}
      <div className="relative">
        <div className="relative z-10">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
            Free Assessment
          </span>
          <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl text-brand-ink leading-[1.02] mt-3 max-w-3xl tracking-[-0.01em]">
            The Passion<br />Career Assessment.
          </h1>
          <p
            className="font-caveat text-3xl md:text-4xl mt-4 leading-snug"
            style={{ color: "#7C3AED" }}
          >
            and your 30-Day Blueprint
          </p>
          <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed mt-8 max-w-2xl">
            35 questions to map your unique passions, values, and strengths — and
            translate what you love into a clear direction and a plan.
          </p>
        </div>
        {/* M backdrop, decorative */}
        <div className="absolute -top-8 right-0 w-64 md:w-80 opacity-20 pointer-events-none hidden md:block">
          <GeometricM className="w-full h-auto" color="#C7B5FF" />
        </div>
      </div>

      {/* 3 step cards */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
        {STEPS.map((s) => (
          <div key={s.progress} className="bg-white rounded-2xl p-7 flex flex-col min-h-[320px]">
            <div className="w-11 h-11 rounded-full bg-brand-lavender/40 flex items-center justify-center text-brand-ink mb-6">
              {s.icon}
            </div>
            <h3 className="font-canela text-2xl text-brand-ink leading-tight mb-3">
              {s.title}
            </h3>
            <p className="text-sm text-brand-ink/70 leading-relaxed flex-1">{s.body}</p>
            <div className="mt-6">
              <div className="h-1 w-full bg-brand-stone rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-green rounded-full transition-all"
                  style={{ width: `${(s.progress / 3) * 100}%` }}
                />
              </div>
              <span className="block mt-2 text-xs text-brand-ink/60">
                Step {s.progress} of 3
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon CTA */}
      <div className="mt-24 bg-brand-lavender/30 rounded-3xl p-12 md:p-16">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          Coming soon
        </span>
        <h2 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
          We&apos;re putting the finishing touches on the Assessment.
        </h2>
        <p className="text-brand-ink/70 mt-6 max-w-2xl leading-relaxed">
          Add yourself to the waitlist and we&apos;ll email you the moment it&apos;s ready.
          Beta users get first access and lifetime free assessments.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-8 py-3.5 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Join the Waitlist
        </Link>
      </div>
    </BrandShell>
  );
}
