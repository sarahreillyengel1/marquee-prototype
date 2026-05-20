"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      // Sign up with Supabase Auth (name goes into user metadata for /onboard/basics pre-fill)
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

      // Redeem beta code
      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: betaCode,
          userId: authData.user.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Ensure we have an active session (signUp returns no session when email
      // confirmation is required; we just auto-confirmed the email on redeem).
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Account exists, code redeemed, email confirmed — but session failed.
        // Send to login so they can sign in manually.
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

      // Create Stripe checkout session
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8">
          <h1 className="font-sans font-bold text-3xl text-ink">marquee</h1>
        </Link>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("beta")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              mode === "beta"
                ? "bg-ink text-white"
                : "bg-white border border-border text-gray"
            }`}
          >
            I have a beta code
          </button>
          <button
            onClick={() => setMode("paid")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              mode === "paid"
                ? "bg-ink text-white"
                : "bg-white border border-border text-gray"
            }`}
          >
            Subscribe · $46/year
          </button>
        </div>

        {mode === "paid" && (
          <div className="card p-6 mb-4 bg-lav-lt border-lav-mid">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-sans font-bold text-2xl">Marquee</span>
              <span className="font-sans font-bold text-2xl">
                $46<span className="text-base text-gray font-normal">/year</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider font-bold text-ink mb-3">
              What&apos;s included
            </p>
            <ul className="space-y-2 text-sm text-ink">
              {[
                "Your full ELVIIS profile — Experience, Leadership, Values, Impact, Insights, Skills",
                "Your own marquee.bio/username URL",
                "Edit any section anytime",
                "Profile views counter",
                "Inbound contact — people can reach you through your Marquee",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-lav-dk mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card p-8">
          <h2 className="font-sans font-bold text-2xl mb-2">Claim your Marquee</h2>
          <p className="text-gray text-sm mb-6">
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
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
                placeholder="8+ characters"
              />
            </div>

            {mode === "beta" && (
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                  Beta invite code
                </label>
                <input
                  type="text"
                  required
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink font-sans tracking-widest focus:outline-none focus:border-lav-mid transition-colors"
                  placeholder="XXXX-XXXX"
                />
              </div>
            )}

            {error && (
              <div className="text-coral text-sm bg-coral-lt rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-pill btn-primary text-center disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : mode === "beta"
                  ? "Create my Marquee →"
                  : "Continue to checkout →"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-lav-dk underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
