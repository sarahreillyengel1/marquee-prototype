import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import {
  IconBeSeen,
  IconTellYourStory,
  IconConnections,
  IconControl,
  IconAssessment,
  IconDiscovery,
  IconBlueprint,
} from "@/components/icons";

export const metadata = { title: "Product · Marquee" };

const STEPS = [
  {
    num: "01",
    icon: <IconAssessment className="w-6 h-6" />,
    title: "Take the assessment",
    body: "35 insightful questions designed to surface your purpose, values, strengths, and the through-line that follows you across every role you've had.",
  },
  {
    num: "02",
    icon: <IconDiscovery className="w-6 h-6" />,
    title: "Build your Marquee",
    body: "AI translates your story into a rich, shareable profile at marquee.bio/yourname. Every section is editable — you stay in control of your narrative.",
  },
  {
    num: "03",
    icon: <IconBlueprint className="w-6 h-6" />,
    title: "Share it everywhere",
    body: "Replace the resume. Replace the awkward introduction. Lead every interaction with the version of you that you actually want to be seen.",
  },
];

const FEATURES = [
  { icon: <IconBeSeen className="w-7 h-7" />, title: "Be Seen For Your Work", body: "Showcase what you do and the impact you make." },
  { icon: <IconTellYourStory className="w-7 h-7" />, title: "Tell Your Story", body: "Go beyond job titles and create a richer professional narrative." },
  { icon: <IconConnections className="w-7 h-7" />, title: "Build Meaningful Connections", body: "Connect through shared interests, values, and expertise." },
  { icon: <IconControl className="w-7 h-7" />, title: "You're In Control", body: "Choose what you share and who can see it." },
];

export default function ProductPage() {
  return (
    <BrandShell source="product">
      {/* Hero */}
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Product
      </span>
      <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl text-brand-ink leading-[1.02] mt-3 max-w-4xl tracking-[-0.01em]">
        How Marquee works.
      </h1>
      <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Take the Passion Career Assessment, build your personal brand profile, share your
        Marquee — and let your work do the talking.
      </p>

      {/* 3-step visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        {STEPS.map((s) => (
          <div key={s.num} className="relative">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-brand-ink shrink-0">
                {s.icon}
              </div>
              <span className="font-canela text-3xl text-brand-lavender">{s.num}</span>
            </div>
            <h3 className="font-canela text-2xl text-brand-ink leading-tight">{s.title}</h3>
            <p className="text-brand-ink/70 mt-3 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-24 md:mt-32 pt-16 border-t border-brand-stone">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          What&apos;s inside
        </span>
        <h2 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
          Every profile, built for humans.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-14 max-w-4xl">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-5 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full bg-brand-green flex items-center justify-center text-brand-ink mt-1">
                {f.icon}
              </div>
              <div>
                <h3 className="font-canela text-xl text-brand-ink leading-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-brand-ink/70 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 bg-brand-lavender/30 rounded-3xl p-12 md:p-16">
        <h2 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight max-w-2xl">
          Ready to be known — not filtered?
        </h2>
        <p className="text-brand-ink/70 mt-4 max-w-xl">
          Join the waitlist. We&apos;ll email you the moment a spot opens.
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
