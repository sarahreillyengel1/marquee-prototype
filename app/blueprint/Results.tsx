"use client";

import { useState } from "react";
import type { BlueprintResult } from "@/lib/blueprint/engine";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-poppins text-[11px] font-medium uppercase tracking-[0.16em] text-brand-wine mb-4">
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="border border-brand-stone bg-white p-6">{children}</div>;
}

export default function Results({
  result,
  onRestart,
  shareId,
}: {
  result: BlueprintResult;
  onRestart?: () => void;
  shareId?: string | null;
}) {
  const r = result;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!shareId) return;
    const url = `${window.location.origin}/blueprint/${shareId}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-[860px] mx-auto py-6 md:py-10">
      {/* hero */}
      <Eyebrow>Your Career Blueprint</Eyebrow>
      <h1 className="font-poppins font-semibold text-5xl md:text-6xl text-brand-ink leading-[1.04] tracking-[-0.01em]">
        {r.headline}
      </h1>
      <p className="font-inter text-lg text-brand-ink/75 mt-5 leading-relaxed">{r.portrait}</p>

      {/* superpowers */}
      {r.superpowers?.length ? (
        <section className="mt-12">
          <Eyebrow>Your superpowers</Eyebrow>
          <div className="flex flex-wrap gap-2.5">
            {r.superpowers.map((s, i) => (
              <span key={i} title={s.evidence} className="border border-brand-stone bg-white px-4 py-2.5 font-poppins font-semibold text-sm text-brand-ink">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* income paths */}
      {r.income_paths?.length ? (
        <section className="mt-12">
          <Eyebrow>Income paths</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {r.income_paths.map((p, i) => (
              <Card key={i}>
                <div className="font-poppins font-semibold text-xl text-brand-ink">{p.name}</div>
                <div className="font-poppins font-semibold text-brand-wine mt-1">
                  {p.pay_range} <span className="font-inter font-normal text-xs text-brand-ink/45">· estimate</span>
                </div>
                <p className="font-inter text-sm text-brand-ink/70 mt-3 leading-relaxed">{p.description}</p>
                <p className="font-inter text-sm text-brand-ink/70 mt-2 leading-relaxed"><span className="text-brand-ink font-medium">Why it fits: </span>{p.fit_reasoning}</p>
                {p.roles?.length ? <p className="font-inter text-sm text-brand-ink/60 mt-3"><span className="font-medium text-brand-ink/80">Roles: </span>{p.roles.join(" · ")}</p> : null}
                {p.where_to_look?.length ? <p className="font-inter text-sm text-brand-ink/60 mt-1"><span className="font-medium text-brand-ink/80">Where to look: </span>{p.where_to_look.join(" · ")}</p> : null}
                <div className="mt-4 pt-4 border-t border-brand-stone">
                  <div className="font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-brand-ink/45">The leap · {p.time_to_revenue}</div>
                  <p className="font-inter text-sm text-brand-ink mt-1 leading-relaxed">{p.the_leap}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* 30-day plan */}
      {r.action_plan?.length ? (
        <section className="mt-12">
          <Eyebrow>Your 30-day plan</Eyebrow>
          <div className="flex flex-col gap-3">
            {r.action_plan.map((w, i) => (
              <Card key={i}>
                <div className="flex gap-4">
                  <div className="shrink-0 font-poppins font-semibold text-2xl text-brand-wine leading-none w-14">W{w.week}</div>
                  <div className="min-w-0">
                    <div className="font-poppins font-semibold text-brand-ink">{w.title}</div>
                    <p className="font-inter text-sm text-brand-ink/75 mt-1 leading-relaxed">{w.action}</p>
                    <p className="font-inter text-sm text-brand-ink/55 mt-2 leading-relaxed">{w.why}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 font-inter text-xs text-brand-ink/60">
                      {w.tools?.length ? <span><span className="text-brand-ink/80 font-medium">Tools:</span> {w.tools.join(", ")}</span> : null}
                      {w.success_metric ? <span><span className="text-brand-ink/80 font-medium">Done when:</span> {w.success_metric}</span> : null}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* blockers */}
      {r.blockers?.length ? (
        <section className="mt-12">
          <Eyebrow>What&apos;s in your way</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {r.blockers.map((b, i) => (
              <Card key={i}>
                <div className="font-poppins font-semibold text-brand-ink">{b.name}</div>
                <p className="font-inter text-sm text-brand-ink/70 mt-2 leading-relaxed">{b.solution}</p>
                {b.quick_win ? <p className="font-inter text-sm text-brand-ink/70 mt-2 leading-relaxed"><span className="text-brand-wine font-medium">48-hour win: </span>{b.quick_win}</p> : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* quick wins */}
      {r.quick_wins?.length ? (
        <section className="mt-12">
          <Eyebrow>Quick wins to test</Eyebrow>
          <div className="flex flex-col gap-3">
            {r.quick_wins.map((q, i) => (
              <Card key={i}>
                <div className="font-poppins font-semibold text-brand-ink">{q.idea}</div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 font-inter text-sm text-brand-ink/60">
                  {q.time_estimate ? <span><span className="text-brand-ink/80 font-medium">Time:</span> {q.time_estimate}</span> : null}
                  {q.validation_question ? <span><span className="text-brand-ink/80 font-medium">Did it work?</span> {q.validation_question}</span> : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* dimensions */}
      {r.dimensions?.length ? (
        <section className="mt-12">
          <Eyebrow>Where you lean</Eyebrow>
          <Card>
            <div className="flex flex-col gap-5">
              {r.dimensions.map((d, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-poppins font-semibold text-sm text-brand-ink">{d.name}</span>
                    <span className="font-poppins text-sm text-brand-wine">{d.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-stone mt-2 overflow-hidden">
                    <div className="h-full bg-brand-wine" style={{ width: `${Math.max(0, Math.min(100, d.score))}%` }} />
                  </div>
                  <p className="font-inter text-xs text-brand-ink/55 mt-1.5 leading-relaxed">{d.reasoning}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      {/* playbooks */}
      {r.playbooks?.length ? (
        <section className="mt-12">
          <Eyebrow>Playbooks to study</Eyebrow>
          <div className="flex flex-col gap-3">
            {r.playbooks.map((p, i) => (
              <Card key={i}>
                <div className="font-poppins font-semibold text-brand-ink">{p.name}</div>
                <p className="font-inter text-sm text-brand-ink/60 mt-1 leading-relaxed">{p.career_path}</p>
                <p className="font-inter text-sm text-brand-ink mt-2 leading-relaxed"><span className="text-brand-wine font-medium">Your move: </span>{p.steal_this}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* resources */}
      {r.resources ? (
        <section className="mt-12">
          <Eyebrow>Recommended resources</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ["People to follow", r.resources.people],
              ["Communities", r.resources.communities],
              ["Courses", r.resources.courses],
              ["Books", r.resources.books],
              ["Podcasts", r.resources.podcasts],
            ] as const).filter(([, list]) => list?.length).map(([label, list]) => (
              <Card key={label}>
                <div className="font-poppins text-[11px] font-medium uppercase tracking-[0.14em] text-brand-ink/45 mb-3">{label}</div>
                <ul className="flex flex-col gap-1.5">
                  {list.map((item, i) => (
                    <li key={i} className="font-inter text-sm text-brand-ink/80 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* what to showcase on Marquee — the bridge to the product */}
      {r.marquee_showcase?.length ? (
        <section className="mt-12">
          <Eyebrow>Show this on your Marquee</Eyebrow>
          <div className="flex flex-col gap-3">
            {r.marquee_showcase.map((m, i) => (
              <div key={i} className="border-l-2 border-brand-wine bg-white border border-brand-stone p-5">
                <div className="font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-brand-wine mb-1.5">{m.feature}</div>
                <p className="font-inter text-sm text-brand-ink/80 leading-relaxed">{m.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* convert CTA */}
      <section className="mt-14 border border-brand-stone bg-brand-white p-7 md:p-8 text-center">
        <div className="font-poppins font-semibold text-2xl text-brand-ink">Make it real on Marquee.</div>
        <p className="font-inter text-brand-ink/70 mt-2 leading-relaxed max-w-lg mx-auto">
          Turn this Blueprint into a profile that gets you known — your work, your way to work with you, all on one link.
        </p>
        <a href="/signup" className="inline-block mt-6 bg-brand-ink text-white font-poppins font-semibold px-8 py-3.5 hover:bg-black transition-colors">
          Build your Marquee →
        </a>
      </section>

      <div className="mt-8 flex items-center justify-center gap-6">
        {shareId ? (
          <button onClick={copyLink} className="font-inter text-sm text-brand-ink/60 hover:text-brand-ink transition-colors">
            {copied ? "Link copied ✓" : "Copy a link to these results"}
          </button>
        ) : null}
        {onRestart ? (
          <button onClick={onRestart} className="font-inter text-sm text-brand-ink/50 hover:text-brand-ink transition-colors">
            Start over
          </button>
        ) : null}
      </div>
    </div>
  );
}
