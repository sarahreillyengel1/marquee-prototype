import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import {
  IconAssessment,
  IconDiscovery,
  IconBlueprint,
  IconTellYourStory,
} from "@/components/icons";

export const metadata = { title: "Resources · Marquee" };

const CATEGORIES = [
  {
    icon: <IconAssessment className="w-6 h-6" />,
    title: "Getting started",
    body: "From beta code to your first profile in under 20 minutes.",
  },
  {
    icon: <IconTellYourStory className="w-6 h-6" />,
    title: "Sharing your Marquee",
    body: "Where to put your link — and what to say when you share it.",
  },
  {
    icon: <IconDiscovery className="w-6 h-6" />,
    title: "Editing your profile",
    body: "Inline editing, dashboard, themes, and how to keep your Marquee fresh.",
  },
  {
    icon: <IconBlueprint className="w-6 h-6" />,
    title: "Inbound contact",
    body: "How recruiters and collaborators can reach you safely.",
  },
];

const FAQS = [
  {
    q: "What is Marquee?",
    a: "Marquee is a personal brand platform for professionals — a dynamic, shareable profile that replaces the resume. Instead of a static list of jobs, you get a rich narrative built around who you actually are when you work.",
  },
  {
    q: "How is Marquee different from LinkedIn?",
    a: "LinkedIn is a professional network optimized for connections and job discovery. Marquee is a personal brand platform optimized for depth: it captures your through-line, values, leadership style, and the story behind your work — the parts a job title doesn't tell.",
  },
  {
    q: "How long does the Assessment take?",
    a: "The Passion Career Assessment is 35 questions and takes most people about 15–20 minutes. You can save your progress and finish later.",
  },
  {
    q: "Do I have to use my real name?",
    a: "You can use any name and any username. Your marquee.bio/username URL is entirely yours to define.",
  },
  {
    q: "Can I make my profile private?",
    a: "Beta profiles are public by default. Privacy controls (private, unlisted, gated) are on the roadmap.",
  },
  {
    q: "Who owns my data?",
    a: "You do. Every answer you give in the Assessment, every section of your Marquee, every image you upload — it's yours. Export or delete anytime.",
  },
];

export default function ResourcesPage() {
  return (
    <BrandShell source="resources">
      {/* Hero */}
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Resources
      </span>
      <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl text-brand-ink leading-[1.02] mt-3 max-w-4xl tracking-[-0.01em]">
        Help, guides, and how-tos.
      </h1>
      <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Everything you need to get the most out of your Marquee. Drop us a note if you
        have a question we haven&apos;t answered yet.
      </p>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {CATEGORIES.map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-2xl p-8 border border-brand-stone hover:border-brand-ink transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-brand-ink shrink-0">
                {c.icon}
              </div>
              <h3 className="font-canela text-2xl text-brand-ink leading-tight">
                {c.title}
              </h3>
            </div>
            <p className="text-brand-ink/70 leading-relaxed">{c.body}</p>
            <span className="inline-block mt-4 text-sm font-medium text-brand-ink group-hover:underline">
              Read guide →
            </span>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-24 pt-16 border-t border-brand-stone">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          FAQ
        </span>
        <h2 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
          Frequently asked.
        </h2>
        <div className="mt-12 space-y-8 max-w-3xl">
          {FAQS.map((f) => (
            <div key={f.q} className="pb-8 border-b border-brand-stone last:border-b-0">
              <h3 className="font-canela text-2xl text-brand-ink leading-snug">{f.q}</h3>
              <p className="text-brand-ink/75 mt-3 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-24 bg-brand-lavender/30 rounded-3xl p-12 md:p-16">
        <h2 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight max-w-2xl">
          Still have a question?
        </h2>
        <p className="text-brand-ink/70 mt-4 max-w-xl">
          We read every message. Send us yours and we&apos;ll get back to you within a day.
        </p>
        <Link
          href="/about"
          className="inline-block mt-8 px-8 py-3.5 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Contact us
        </Link>
      </div>
    </BrandShell>
  );
}
