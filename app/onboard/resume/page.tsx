"use client";

import { useState, useCallback, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { ResumeParseResult } from "@/types";

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

  // Rotate loading messages every 2.2s so it doesn't feel stuck
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
          // Read body once as text — could be JSON or an HTML error page
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

        // Store parsed data in localStorage for onboarding flow
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="font-sans font-bold text-3xl text-ink">marquee</h1>

        <div className="mt-8">
          <h2 className="font-sans font-bold text-4xl mb-3">
            Let&apos;s start with your resume.
          </h2>
          <p className="text-gray text-lg mb-8">
            We&apos;ll read it so you don&apos;t have to re-enter your work
            history.
          </p>

          {/* Mode toggle — segmented control */}
          <div className="inline-flex p-1 mb-6 bg-white border border-border rounded-full">
            <button
              onClick={() => setMode("upload")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "upload"
                  ? "bg-ink text-white"
                  : "text-gray hover:text-ink"
              }`}
            >
              Upload a file
            </button>
            <button
              onClick={() => setMode("paste")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "paste"
                  ? "bg-ink text-white"
                  : "text-gray hover:text-ink"
              }`}
            >
              Paste text instead
            </button>
          </div>

          {loading ? (
            <div className="card p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-lav-mid border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-ink text-lg transition-opacity">
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
              className={`card p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-lav-mid bg-lav-lt"
                  : "border-dashed border-2 border-border hover:border-lav-mid"
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
              <div className="text-4xl mb-4">📄</div>
              <p className="text-ink font-medium mb-2">
                Drop your resume here, or click to browse
              </p>
              <p className="text-gray text-sm">PDF, Word, or text file</p>
            </div>
          ) : (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-64 px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors resize-none font-sans text-sm"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="mt-4 btn-pill btn-primary disabled:opacity-50"
              >
                Parse my resume →
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 text-coral text-sm bg-coral-lt rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Skip option */}
          <button
            onClick={() => router.push("/onboard/basics")}
            className="mt-6 text-gray text-sm hover:text-ink transition-colors"
          >
            Skip — I&apos;ll enter everything manually
          </button>
        </div>
      </div>
    </div>
  );
}
