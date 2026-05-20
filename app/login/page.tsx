"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

    // Check if profile exists → go to profile, else resume onboarding
    const { data: profile } = await supabase
      .from("generated_profiles")
      .select("username")
      .single();

    if (profile?.username) {
      router.push(`/${profile.username}`);
    } else {
      router.push("/onboard/resume");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8">
          <h1 className="font-sans font-bold text-3xl text-ink">marquee</h1>
        </Link>

        <div className="card p-8">
          <h2 className="font-sans font-bold text-2xl mb-2">Welcome back</h2>
          <p className="text-gray text-sm mb-6">Log in to your Marquee.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink focus:outline-none focus:border-lav-mid transition-colors"
              />
            </div>

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
              {loading ? "Logging in..." : "Log in →"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-lav-dk underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
