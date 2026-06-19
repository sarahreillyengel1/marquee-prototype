import BrandShell from "@/components/BrandShell";

export const metadata = { title: "Product · Marquee" };

export default function ProductPage() {
  return (
    <BrandShell source="product">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Product
      </span>
      <h1 className="font-canela text-5xl md:text-6xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
        How Marquee works.
      </h1>
      <p className="text-lg text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Take the Passion Career Assessment, build your personal brand profile, share your
        Marquee — and let your work do the talking.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {[
          { num: "01", title: "Take the assessment", body: "35 questions designed to surface your purpose, values, strengths, and through-line." },
          { num: "02", title: "Build your Marquee", body: "AI translates your story into a rich, shareable profile at marquee.bio/yourname." },
          { num: "03", title: "Share it everywhere", body: "Replace the resume. Replace the awkward intro. Lead with who you actually are." },
        ].map((s) => (
          <div key={s.num}>
            <span className="font-canela text-3xl text-brand-lavender">{s.num}</span>
            <h3 className="font-canela text-2xl text-brand-ink mt-3">{s.title}</h3>
            <p className="text-brand-ink/70 mt-3 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-brand-ink/40 mt-20 italic">
        Detailed product walkthrough coming soon.
      </p>
    </BrandShell>
  );
}
