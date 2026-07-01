import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import { SignalM } from "@/components/icons";

export const metadata = { title: "About · Marquee" };

const PRINCIPLES = [
  {
    title: "Depth over performance",
    body: "Networks reward posting. Resumes reward keywords. Marquee rewards depth — the through-line that follows you across companies and titles.",
  },
  {
    title: "You own the story",
    body: "We help you excavate the narrative that's already there. Every word on your Marquee is yours to keep, edit, or delete. We don't rank you against anyone.",
  },
  {
    title: "Human, not algorithmic",
    body: "No feeds. No filters that reduce you to keywords. Marquee is designed to be read by humans deciding whether they'd want to work with you.",
  },
  {
    title: "Slow and considered",
    body: "The Assessment takes real time because your answers matter. The AI writes with care because your voice matters. We're not optimizing for engagement — we're optimizing for accuracy.",
  },
];

export default function AboutPage() {
  return (
    <BrandShell source="about">
      {/* Hero */}
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        About
      </span>
      <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl text-brand-ink leading-[1.02] mt-3 max-w-4xl tracking-[-0.01em]">
        We&apos;re building the platform we wished existed.
      </h1>
      <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Resumes flatten people. LinkedIn rewards performance over substance. We started
        Marquee because we believe your work — and the story behind it — deserves a place
        of its own.
      </p>

      {/* Thesis */}
      <div className="mt-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
            Our thesis
          </span>
          <h2 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-3">
            The resume is dead.
          </h2>
          <div className="mt-6 space-y-4 text-brand-ink/80 leading-relaxed">
            <p>
              What replaces it isn&apos;t another list of jobs — it&apos;s a rich,
              shareable profile built around who you actually are when you work. Marquee
              captures the through-line that follows you across companies and titles.
            </p>
            <p>
              We don&apos;t compete with LinkedIn. We do something LinkedIn can&apos;t:
              give you a home for the story behind your work, on the URL that&apos;s
              actually yours.
            </p>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <SignalM className="w-64 md:w-80" color="#C7B5FF" />
        </div>
      </div>

      {/* Pull quote */}
      <div className="mt-24 py-16 bg-brand-lavender/30 rounded-3xl px-10 md:px-16">
        <p
          className="font-caveat text-4xl md:text-5xl lg:text-6xl leading-tight text-center max-w-3xl mx-auto"
          style={{ color: "#7C3AED" }}
        >
          Be known. Not filtered.
        </p>
      </div>

      {/* Principles */}
      <div className="mt-24 pt-16 border-t border-brand-stone">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          What we believe
        </span>
        <h2 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
          Four principles we build by.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 mt-14">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title}>
              <span className="font-canela text-3xl text-brand-lavender">
                0{i + 1}
              </span>
              <h3 className="font-canela text-2xl text-brand-ink leading-tight mt-2">
                {p.title}
              </h3>
              <p className="text-brand-ink/70 mt-3 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-24 bg-brand-ink text-white rounded-3xl p-12 md:p-16">
        <h2 className="font-canela text-3xl md:text-4xl leading-tight max-w-2xl">
          Have thoughts, questions, or a story to share?
        </h2>
        <p className="text-white/70 mt-4 max-w-xl">
          We read every message. Feedback from our beta users is quite literally the
          product roadmap.
        </p>
        <a
          href="mailto:hello@marquee.bio"
          className="inline-block mt-8 px-8 py-3.5 rounded-full bg-white text-brand-ink font-medium hover:bg-white/90 transition-colors"
        >
          hello@marquee.bio
        </a>
        <p className="text-xs text-white/50 mt-6">
          Or{" "}
          <Link href="/" className="underline hover:text-white">
            join the waitlist
          </Link>{" "}
          if you&apos;re ready to build your Marquee.
        </p>
      </div>
    </BrandShell>
  );
}
