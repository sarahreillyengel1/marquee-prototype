import BrandShell from "@/components/BrandShell";

export const metadata = { title: "About · Marquee" };

export default function AboutPage() {
  return (
    <BrandShell source="about">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        About
      </span>
      <h1 className="font-canela text-5xl md:text-6xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
        We&apos;re building the platform we wished existed.
      </h1>
      <p className="text-lg text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Resumes flatten people. LinkedIn rewards performance over substance. We started
        Marquee because we believe your work — and the story behind it — deserves a place
        of its own.
      </p>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="font-canela text-2xl text-brand-ink">Our thesis</h3>
          <p className="text-brand-ink/70 mt-3 leading-relaxed">
            The resume is dead. What replaces it isn&apos;t another list of jobs — it&apos;s
            a rich, shareable profile built around who you actually are when you work. Marquee
            captures the through-line that follows you across companies and titles.
          </p>
        </div>
        <div>
          <h3 className="font-canela text-2xl text-brand-ink">Be known. Not filtered.</h3>
          <p className="text-brand-ink/70 mt-3 leading-relaxed">
            We don&apos;t rank you against keywords. We don&apos;t reduce you to a job title.
            We help you show up the way you actually want to be seen — by humans, not algorithms.
          </p>
        </div>
      </div>

      <p className="text-sm text-brand-ink/40 mt-20 italic">
        Team page, story, and press coming soon.
      </p>
    </BrandShell>
  );
}
