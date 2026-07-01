"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import OnboardShell from "@/components/OnboardShell";
import { GeometricM } from "@/components/icons";

const MESSAGES = [
  "Reading your story…",
  "Building your career arc…",
  "Writing your profile…",
  "Finding your through-line…",
  "Almost there…",
  "Your Marquee is live.",
];

export default function GeneratingPage() {
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const started = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 8));
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function generate() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        return;
      }

      try {
        const res = await fetch("/api/generate-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Generation failed");
        }

        const { username } = await res.json();
        setProgress(100);
        setMessageIdx(MESSAGES.length - 1);
        setTimeout(() => router.push(`/${username}`), 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    generate();
  }, [supabase, router]);

  return (
    <OnboardShell step="generating">
      <div className="w-full max-w-lg text-center mt-16 md:mt-24 relative">
        {/* Decorative geometric M pulsing behind the text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 animate-pulse">
          <GeometricM className="w-64 h-64" color="#C7B5FF" />
        </div>

        <div className="relative z-10">
          {error ? (
            <div>
              <div className="text-sm bg-brand-vermillion/10 text-brand-vermillion rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 block">
                Step 4 · Building
              </span>
              <h1 className="font-canela text-3xl md:text-4xl text-brand-ink leading-tight mt-3 mb-10">
                {MESSAGES[messageIdx]}
              </h1>

              {/* Progress bar — matches assessment cards */}
              <div className="w-64 mx-auto">
                <div className="h-1 w-full bg-brand-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-green rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mt-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-lavender animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </OnboardShell>
  );
}
