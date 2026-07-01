"use client";

import Link from "next/link";

// Shared shell for onboarding screens.
// Progress dots reflect which step of the onboarding flow the user is on.
type Step = "resume" | "basics" | "elviis" | "generating";

const STEPS: { key: Step; label: string }[] = [
  { key: "resume", label: "Resume" },
  { key: "basics", label: "Basics" },
  { key: "elviis", label: "Assessment" },
  { key: "generating", label: "Building" },
];

export default function OnboardShell({
  children,
  step,
  showProgress = true,
}: {
  children: React.ReactNode;
  step: Step;
  showProgress?: boolean;
}) {
  const activeIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="brand-body min-h-screen font-inter flex flex-col">
      {/* Top bar — wordmark + progress dots */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <Link href="/" className="wordmark text-lg text-brand-ink">
          MARQUEE
        </Link>
        {showProgress && (
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      i <= activeIdx ? "bg-brand-ink" : "bg-brand-stone"
                    }`}
                  />
                  <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-semibold ${
                      i === activeIdx
                        ? "text-brand-ink"
                        : "text-brand-ink/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 h-px ${
                      i < activeIdx ? "bg-brand-ink" : "bg-brand-stone"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 flex items-start justify-center px-4 md:px-8 pb-16">
        {children}
      </main>
    </div>
  );
}
