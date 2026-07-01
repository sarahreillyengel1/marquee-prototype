"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignalM } from "@/components/icons";

const INCLUDED = [
  "Full personal brand profile — Experience, Leadership, Values, Impact, Skills, Story",
  "Your own marquee.bio/username URL",
  "Edit any section anytime",
  "Profile views counter",
  "Inbound contact from recruiters + collaborators",
];

export default function SignupPage() {
  const [mode, setMode] = useState<"beta" | "paid">("beta");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function handleBetaSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: betaCode, userId: authData.user.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        router.push("/login");
        return;
      }

      router.push("/onboard/resume");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handlePaidSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Signup failed.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: authData.user.id }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to create checkout session.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="brand-body min-h-screen font-inter flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative M in background */}
      <div className="absolute -top-16 -right-16 w-96 opacity-10 pointer-events-none hidden md:block">
        <SignalM className="w-full h-auto" color="#C7B5FF" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="block mb-10 text-center">
          <span className="wordmark text-xl text-brand-ink">MARQUEE</span>
        </Link>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-brand-stone/60 rounded-full">
          <button
            onClick={() => setMode("beta")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
              mode === "beta"
                ? "bg-brand-ink text-white"
                : "text-brand-ink/70 hover:text-brand-ink"
            }`}
          >
            I have a beta code
          </button>
          <button
            onClick={() => setMode("paid")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
              mode === "paid"
                ? "bg-brand-ink text-white"
                : "text-brand-ink/70 hover:text-brand-ink"
            }`}
          >
            $46/year
          </button>
        </div>

        {mode === "paid" && (
          <div className="mb-4 p-6 rounded-2xl bg-brand-lavender/40">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-canela text-2xl text-brand-ink">Marquee</span>
              <span className="font-canela text-3xl text-brand-ink">
                $46<span className="text-sm text-brand-ink/60 font-normal font-inter">/year</span>
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-3">
              Included
            </p>
            <ul className="space-y-2 text-sm text-brand-ink">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="shrink-0 w-4 h-4 rounded-full bg-brand-green flex items-center justify-center mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-5" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-brand-ink/85 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl p-8 border border-brand-stone">
          <h2 className="font-canela text-3xl text-brand-ink mb-2">
            Claim your Marquee
          </h2>
          <p className="text-brand-ink/60 text-sm mb-6">
            {mode === "beta"
              ? "Enter your beta invite code to get started."
              : "$46/year. Cancel anytime."}
          </p>

          <form
            onSubmit={mode === "beta" ? handleBetaSignup : handlePaidSignup}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                />
              </div>
            </div>

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
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                placeholder="8+ characters"
              />
            </div>

            {mode === "beta" && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
                  Beta invite code
                </label>
                <input
                  type="text"
                  required
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink tracking-widest focus:outline-none focus:border-brand-ink transition-colors"
                  placeholder="XXXX-XXXX"
                />
              </div>
            )}

            {error && (
              <div className="text-sm bg-brand-vermillion/10 text-brand-vermillion rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Creating…"
                : mode === "beta"
                  ? "Create my Marquee →"
                  : "Continue to checkout →"}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-ink/60 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-ink underline hover:no-underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
