"use client";

import { useState } from "react";
import type { BlueprintResult } from "@/lib/blueprint/engine";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-dred mb-4">
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="border border-hair bg-white p-6">{children}</div>;
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
      <h1 className="font-lora font-normal text-5xl md:text-6xl text-ink leading-[1.04] tracking-[-0.01em]">
        {r.headline}
      </h1>
      <p className="font-inter text-lg text-ink/75 mt-5 leading-relaxed">{r.portrait}</p>

      {/* superpowers */}
      {r.superpowers?.length ? (
        <section className="mt-12">
          <Eyebrow>Your superpowers</Eyebrow>
          <div className="flex flex-wrap gap-2.5">
            {r.superpowers.map((s, i) => (
              <span key={i} title={s.evidence} className="border border-hair bg-white px-4 py-2.5 font-sans font-semibold text-sm text-ink">
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
                <div className="font-lora font-normal text-xl text-ink">{p.name}</div>
                <div className="font-sans font-semibold text-dred mt-1">
                  {p.pay_range} <span className="font-inter font-normal text-xs text-ink/45">· estimate</span>
                </div>
                <p className="font-inter text-sm text-ink/70 mt-3 leading-relaxed">{p.description}</p>
                <p className="font-inter text-sm text-ink/70 mt-2 leading-relaxed"><span className="text-ink font-medium">Why it fits: </span>{p.fit_reasoning}</p>
                {p.roles?.length ? <p className="font-inter text-sm text-ink/60 mt-3"><span className="font-medium text-ink/80">Roles: </span>{p.roles.join(" · ")}</p> : null}
                {p.where_to_look?.length ? <p className="font-inter text-sm text-ink/60 mt-1"><span className="font-medium text-ink/80">Where to look: </span>{p.where_to_look.join(" · ")}</p> : null}
                <div className="mt-4 pt-4 border-t border-hair">
                  <div className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink/45">The leap · {p.time_to_revenue}</div>
                  <p className="font-inter text-sm text-ink mt-1 leading-relaxed">{p.the_leap}</p>
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
                  <div className="shrink-0 font-lora font-normal text-2xl text-dred leading-none w-14">W{w.week}</div>
                  <div className="min-w-0">
                    <div className="font-sans font-semibold text-ink">{w.title}</div>
                    <p className="font-inter text-sm text-ink/75 mt-1 leading-relaxed">{w.action}</p>
                    <p className="font-inter text-sm text-ink/55 mt-2 leading-relaxed">{w.why}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 font-inter text-xs text-ink/60">
                      {w.tools?.length ? <span><span className="text-ink/80 font-medium">Tools:</span> {w.tools.join(", ")}</span> : null}
                      {w.success_metric ? <span><span className="text-ink/80 font-medium">Done when:</span> {w.success_metric}</span> : null}
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
                <div className="font-sans font-semibold text-ink">{b.name}</div>
                <p className="font-inter text-sm text-ink/70 mt-2 leading-relaxed">{b.solution}</p>
                {b.quick_win ? <p className="font-inter text-sm text-ink/70 mt-2 leading-relaxed"><span className="text-dred font-medium">48-hour win: </span>{b.quick_win}</p> : null}
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
                <div className="font-sans font-semibold text-ink">{q.idea}</div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 font-inter text-sm text-ink/60">
                  {q.time_estimate ? <span><span className="text-ink/80 font-medium">Time:</span> {q.time_estimate}</span> : null}
                  {q.validation_question ? <span><span className="text-ink/80 font-medium">Did it work?</span> {q.validation_question}</span> : null}
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
                    <span className="font-sans font-semibold text-sm text-ink">{d.name}</span>
                    <span className="font-sans text-sm text-dred">{d.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-beige mt-2 overflow-hidden">
                    <div className="h-full bg-dred" style={{ width: `${Math.max(0, Math.min(100, d.score))}%` }} />
                  </div>
                  <p className="font-inter text-xs text-ink/55 mt-1.5 leading-relaxed">{d.reasoning}</p>
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
                <div className="font-sans font-semibold text-ink">{p.name}</div>
                <p className="font-inter text-sm text-ink/60 mt-1 leading-relaxed">{p.career_path}</p>
                <p className="font-inter text-sm text-ink mt-2 leading-relaxed"><span className="text-dred font-medium">Your move: </span>{p.steal_this}</p>
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
                <div className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45 mb-3">{label}</div>
                <ul className="flex flex-col gap-1.5">
                  {list.map((item, i) => (
                    <li key={i} className="font-inter text-sm text-ink/80 leading-relaxed">{item}</li>
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
              <div key={i} className="border-l-2 border-dred bg-white border border-hair p-5">
                <div className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-dred mb-1.5">{m.feature}</div>
                <p className="font-inter text-sm text-ink/80 leading-relaxed">{m.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* convert CTA */}
      <section className="mt-14 border border-hair bg-white p-7 md:p-8 text-center">
        <div className="font-lora font-normal text-2xl text-ink">Make it real on Marquee.</div>
        <p className="font-inter text-ink/70 mt-2 leading-relaxed max-w-lg mx-auto">
          Turn this Blueprint into a profile that gets you known — your work, your way to work with you, all on one link.
        </p>
        <a href="/signup" className="inline-block mt-6 bg-ink text-white font-sans font-semibold px-8 py-3.5 hover:bg-black transition-colors">
          Build your Marquee →
        </a>
      </section>

      <div className="mt-8 flex items-center justify-center gap-6">
        {shareId ? (
          <button onClick={copyLink} className="font-inter text-sm text-ink/60 hover:text-ink transition-colors">
            {copied ? "Link copied ✓" : "Copy a link to these results"}
          </button>
        ) : null}
        {onRestart ? (
          <button onClick={onRestart} className="font-inter text-sm text-ink/50 hover:text-ink transition-colors">
            Start over
          </button>
        ) : null}
      </div>
    </div>
  );
}
