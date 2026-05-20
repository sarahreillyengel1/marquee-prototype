import Link from "next/link";
import DemoModalButton from "@/components/DemoModalButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <h1 className="font-sans font-bold text-2xl text-ink">marquee</h1>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray hover:text-ink transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-pill btn-primary text-sm px-6 py-2.5 inline-block"
          >
            Claim Your Marquee
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-sans font-bold text-5xl md:text-7xl lg:text-[80px] leading-[1.05] text-ink mb-6">
              Your Work
              <br />
              Deserves the Spotlight.
            </h2>
            <p className="text-gray text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              The resume is dead. Marquee is what replaces it — a rich,
              shareable professional profile built around who you actually are
              when you work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="btn-pill btn-primary text-center text-lg px-10 py-4"
              >
                Claim Your Marquee
              </Link>
              <DemoModalButton />
            </div>
          </div>

          {/* Profile card preview */}
          <div className="card p-8 max-w-sm mx-auto md:mx-0 md:ml-auto shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray-2">
                Marquee · No. 0001
              </span>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray-2">
                Brooklyn, NY
              </span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-lav-lt flex items-center justify-center shrink-0">
                <span className="text-lav-dk text-xl font-sans font-bold">MO</span>
              </div>
              <div>
                <h3 className="font-sans font-bold text-2xl leading-tight">Maya Okonkwo</h3>
                <p className="text-gray text-xs mt-0.5">
                  Head of Product Marketing · Meridian Health
                </p>
              </div>
            </div>
            <div className="border-l-2 border-lav-mid pl-4 mb-5">
              <p className="font-sans text-ink text-sm leading-relaxed">
                &ldquo;The best product marketers aren&apos;t good writers — they&apos;re good listeners who happen to write things down.&rdquo;
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {["Early-stage PMM", "Category narrative", "B2B SaaS"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-sans bg-lav-lt text-lav-dk rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {["E", "L", "V", "I", "I", "S"].map((letter, i) => (
                <span
                  key={i}
                  className="w-8 h-8 flex items-center justify-center font-sans font-bold text-sm bg-cream rounded-full text-gray"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three-step strip */}
      <section className="bg-white border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Upload your resume",
                desc: "AI reads it in seconds. Your work history, skills, and career arc — extracted automatically.",
              },
              {
                step: "02",
                title: "Answer what matters",
                desc: "~15 minutes of questions that go deeper than any resume ever could. Values, impact, leadership, insights.",
              },
              {
                step: "03",
                title: "Share your Marquee",
                desc: "A rich, public profile at marquee.bio/you. Replace the resume forever.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <span className="font-sans text-xs text-lav-mid">{step}</span>
                <h3 className="font-sans font-bold text-xl mt-2 mb-3">{title}</h3>
                <p className="text-gray text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <p className="font-sans text-sm font-bold uppercase tracking-[0.15em] mb-4">
          <span className="text-lav-dk">Be Known.</span>
          <span className="text-ink"> Not Filtered.</span>
        </p>
        <h2 className="font-sans font-bold text-4xl md:text-5xl mb-8">
          Ready to build yours?
        </h2>
        <Link
          href="/signup"
          className="btn-pill btn-primary text-lg px-12 py-4 inline-block"
        >
          Claim Your Marquee →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-sans font-bold text-lg text-ink">marquee</span>
          <span className="text-gray text-xs font-sans">
            © 2026 Marquee · marquee.bio
          </span>
        </div>
      </footer>
    </div>
  );
}
