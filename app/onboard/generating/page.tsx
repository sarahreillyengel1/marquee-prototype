"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const MESSAGES = [
  "Reading your story...",
  "Building your career arc...",
  "Writing your profile...",
  "Finding your through-line...",
  "Almost there...",
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
    // Rotate messages
    const interval = setInterval(() => {
      setMessageIdx((prev) => {
        if (prev < MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 1400);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

        // Brief pause to show completion
        setTimeout(() => {
          router.push(`/${username}`);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    generate();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-sans font-bold text-3xl text-ink mb-12">marquee</h1>

        {error ? (
          <div>
            <div className="text-coral text-sm bg-coral-lt rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-pill btn-primary"
            >
              Try again
            </button>
          </div>
        ) : (
          <div>
            {/* Rotating message */}
            <p
              key={messageIdx}
              className="text-xl text-gray font-medium mb-8 animate-pulse"
            >
              {MESSAGES[messageIdx]}
            </p>

            {/* Progress bar */}
            <div className="w-64 mx-auto progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Subtle dots */}
            <div className="flex justify-center gap-1 mt-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-lav-mid animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
