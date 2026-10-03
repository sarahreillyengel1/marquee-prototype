"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignalM } from "@/components/icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  async function sendReset() {
    setError(""); setResetMsg("");
    if (!email.trim()) { setError("Enter your email above first, then click Forgot password."); return; }
    const r = await fetch("/api/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
    if (!r.ok) setError((await r.json().catch(() => ({}))).error || "Something went wrong. Please try again.");
    else setResetMsg("Check your email — if that address has an account, we sent a link to set a new password.");
  }
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Return the user to where they were headed (e.g. /build-preview), else the builder.
    const next = new URLSearchParams(window.location.search).get("next");
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/build-preview";
    router.push(dest);
  }

  return (
    <div className="brand-body min-h-screen font-inter flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-96 opacity-10 pointer-events-none hidden md:block">
        <SignalM className="w-full h-auto" color="#C7B5FF" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="block mb-10 text-center">
          <span className="wordmark text-xl text-brand-ink">MARQUEE</span>
        </Link>

        <div className="bg-white rounded-2xl p-8 border border-brand-stone">
          <h2 className="font-inter font-bold tracking-tight text-3xl text-brand-ink mb-2">Welcome back</h2>
          <p className="text-brand-ink/60 text-sm mb-6">Log in to your Marquee.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm bg-brand-vermillion/10 text-brand-vermillion rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            {resetMsg && (
              <div className="text-sm bg-brand-sage/15 text-brand-ink rounded-lg px-4 py-3">
                {resetMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in →"}
            </button>
            <button type="button" onClick={sendReset} className="w-full text-sm text-brand-ink/60 hover:text-brand-ink pt-1">
              Forgot password?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
