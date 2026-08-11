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

const ACCENTS = ["#F8563A", "#7C1226"]; // red / wine — rotating card accents for dynamic brand color
const TINTS = ["#C9DDF7", "#CBBCF0", "#F6F2EC", "#FBEAED"]; // blue / purple / beige / wine-tint

function searchUrl(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(name)}`;
}

// Every resource / tool is a link. If the model didn't give a URL, fall back to a
// search so nothing is ever un-clickable.
function ResLink({ item }: { item: { name: string; url?: string } }) {
  return (
    <a href={item.url || searchUrl(item.name)} target="_blank" rel="noopener"
      className="font-inter text-sm text-ink/85 leading-relaxed underline decoration-hair underline-offset-2 hover:text-dred hover:decoration-dred transition-colors">
      {item.name}
    </a>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="border border-hair bg-white p-6" style={accent ? { borderTop: `3px solid ${accent}` } : undefined}>
      {children}
    </div>
  );
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
      <div className="h-1 w-16 bg-red mt-6" />
      <p className="font-inter text-lg text-ink/85 mt-5 leading-relaxed">{r.portrait}</p>

      {/* superpowers */}
      {r.superpowers?.length ? (
        <section className="mt-12">
          <Eyebrow>Your superpowers</Eyebrow>
          <div className="flex flex-wrap gap-2.5">
            {r.superpowers.map((s, i) => (
              <span key={i} title={s.evidence} className="px-4 py-2.5 font-sans font-semibold text-sm text-ink border border-black/5"
                style={{ background: TINTS[i % TINTS.length] }}>
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
              <Card key={i} accent={ACCENTS[i % ACCENTS.length]}>
                <div className="font-lora font-normal text-xl text-ink">{p.name}</div>
                <div className="font-sans font-semibold text-dred mt-1">
                  {p.pay_range} <span className="font-inter font-normal text-xs text-ink/60">· estimate</span>
                </div>
                <p className="font-inter text-sm text-ink/70 mt-3 leading-relaxed">{p.description}</p>
                <p className="font-inter text-sm text-ink/70 mt-2 leading-relaxed"><span className="text-ink font-medium">Why it fits: </span>{p.fit_reasoning}</p>
                {p.roles?.length ? <p className="font-inter text-sm text-ink/60 mt-3"><span className="font-medium text-ink/80">Roles: </span>{p.roles.join(" · ")}</p> : null}
                {p.where_to_look?.length ? <p className="font-inter text-sm text-ink/60 mt-1"><span className="font-medium text-ink/80">Where to look: </span>{p.where_to_look.join(" · ")}</p> : null}
                <div className="mt-4 pt-4 border-t border-hair">
                  <div className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ink/60">The leap · {p.time_to_revenue}</div>
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
                    <p className="font-inter text-sm text-ink/70 mt-2 leading-relaxed">{w.why}</p>
                    {w.tools?.length ? (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 font-inter text-xs text-ink/75">
                        <span className="text-ink/80 font-medium">Tools:</span>
                        {w.tools.map((t, ti) => (
                          <span key={ti}>
                            <a href={t.url || searchUrl(t.name)} target="_blank" rel="noopener" className="underline decoration-hair underline-offset-2 hover:text-dred hover:decoration-dred transition-colors">{t.name}</a>
                            {ti < w.tools.length - 1 ? <span className="text-ink/40"> · </span> : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {w.success_metric ? (
                      <div className="mt-2 font-inter text-xs text-ink/75"><span className="text-ink/80 font-medium">Success:</span> {w.success_metric}</div>
                    ) : null}
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
          <Eyebrow>Your blockers &amp; how to clear them</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {r.blockers.map((b, i) => (
              <Card key={i} accent={ACCENTS[(i + 1) % ACCENTS.length]}>
                <div className="font-sans font-semibold text-ink">{b.name}</div>
                <p className="font-inter text-sm text-ink/80 mt-2 leading-relaxed">{b.solution}</p>
                {b.first_step ? <p className="font-inter text-sm text-ink/80 mt-2 leading-relaxed"><span className="text-dred font-medium">Start here: </span>{b.first_step}</p> : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* dimensions */}
      {r.dimensions?.length ? (
        <section className="mt-12">
          <Eyebrow>How you&apos;re wired</Eyebrow>
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
                  <p className="font-inter text-xs text-ink/70 mt-1.5 leading-relaxed">{d.reasoning}</p>
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
            ] as const).filter(([, list]) => list?.length).map(([label, list], ci) => (
              <Card key={label} accent={ACCENTS[ci % ACCENTS.length]}>
                <div className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink/60 mb-3">{label}</div>
                <ul className="flex flex-col gap-2">
                  {list.map((item, i) => (
                    <li key={i} className="flex gap-2"><span className="text-dred">→</span><ResLink item={item} /></li>
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
              <div key={i} className="bg-beige border border-hair p-5" style={{ borderLeft: "3px solid #F8563A" }}>
                <div className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-dred mb-1.5">{m.feature}</div>
                <p className="font-inter text-sm text-ink/85 leading-relaxed">{m.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* convert CTA — bold wine brand moment */}
      <section className="mt-14 bg-dred p-8 md:p-10 text-center">
        <div className="font-lora font-normal text-2xl md:text-3xl text-white">Make it real on Marquee.</div>
        <p className="font-inter text-white/80 mt-3 leading-relaxed max-w-lg mx-auto">
          Turn this Blueprint into a profile that gets you known — your work, and every way to work with you, on one link.
        </p>
        <a href="/signup" className="inline-block mt-6 bg-white text-dred font-sans font-semibold px-8 py-3.5 hover:bg-beige transition-colors">
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
