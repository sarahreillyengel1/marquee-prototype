"use client";

import { useState, useCallback, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { ResumeParseResult } from "@/types";
import OnboardShell from "@/components/OnboardShell";

const LOADING_MESSAGES = [
  "Reading your resume…",
  "Extracting your work history…",
  "Identifying your career themes…",
  "Drafting your story…",
  "Almost there…",
];

export default function ResumeUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const router = useRouter();
  const supabase = createBrowserSupabase();

  const processResume = useCallback(
    async (formData: FormData) => {
      setLoading(true);
      setError("");
      setStatusIdx(0);
      setStatus("");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      formData.append("userId", user.id);

      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let message = `Parse failed (HTTP ${res.status})`;
          try {
            const body = JSON.parse(text);
            if (body?.error) message = body.error;
          } catch {
            if (text) message = text.slice(0, 200);
          }
          throw new Error(message);
        }

        const { parsed } = (await res.json()) as { parsed: ResumeParseResult };
        localStorage.setItem("marquee_resume", JSON.stringify(parsed));
        setStatus("Resume parsed. Redirecting…");
        router.push("/onboard/basics");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    },
    [supabase, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        processResume(formData);
      }
    },
    [processResume]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      processResume(formData);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    const formData = new FormData();
    formData.append("text", pastedText);
    processResume(formData);
  };

  return (
    <OnboardShell step="resume">
      <div className="w-full max-w-2xl mt-8 md:mt-16">
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          Step 1
        </span>
        <h1 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-2 tracking-[-0.01em]">
          Let&apos;s start with your resume.
        </h1>
        <p className="text-brand-ink/70 text-lg mt-4 max-w-lg leading-relaxed">
          We&apos;ll read it so you don&apos;t have to re-enter your work history.
        </p>

        {/* Mode toggle */}
        <div className="inline-flex p-1 mt-8 bg-brand-stone/60 rounded-full">
          <button
            onClick={() => setMode("upload")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "upload"
                ? "bg-brand-ink text-white"
                : "text-brand-ink/70 hover:text-brand-ink"
            }`}
          >
            Upload a file
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "paste"
                ? "bg-brand-ink text-white"
                : "text-brand-ink/70 hover:text-brand-ink"
            }`}
          >
            Paste text instead
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="bg-white rounded-2xl p-14 text-center border border-brand-stone">
              <div className="inline-block w-8 h-8 border-2 border-brand-ink border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-brand-ink text-lg">
                {status || LOADING_MESSAGES[statusIdx]}
              </p>
            </div>
          ) : mode === "upload" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-2xl p-14 text-center cursor-pointer transition-all border-2 border-dashed ${
                dragActive
                  ? "border-brand-ink bg-brand-lavender/30"
                  : "border-brand-stone bg-white hover:border-brand-ink"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-brand-green flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-brand-ink font-medium mb-1">
                Drop your resume here, or click to browse
              </p>
              <p className="text-brand-ink/60 text-sm">PDF, Word, or text file</p>
            </div>
          ) : (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your resume text here…"
                className="w-full h-64 px-4 py-3 rounded-2xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors resize-none text-sm leading-relaxed"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="mt-4 px-8 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
              >
                Parse my resume →
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm bg-brand-vermillion/10 text-brand-vermillion rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={() => router.push("/onboard/basics")}
            className="mt-6 text-brand-ink/60 text-sm hover:text-brand-ink transition-colors underline decoration-transparent hover:decoration-brand-ink"
          >
            Skip — I&apos;ll enter everything manually
          </button>
        </div>
      </div>
    </OnboardShell>
  );
}
