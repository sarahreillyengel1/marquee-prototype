"use client";
// Sign in. Same look as /join: beige page, wordmark, Lora heading, pill inputs, vermillion button.

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  // someone is already signed in on this browser: say who, so nobody lands inside another person's account
  const [signedInAs, setSignedInAs] = useState("");

  async function sendReset() {
    setError(""); setResetMsg("");
    if (!email.trim()) { setError("Enter your email above first, then click Forgot password."); return; }
    const r = await fetch("/api/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
    if (!r.ok) setError((await r.json().catch(() => ({}))).error || "Something went wrong. Please try again.");
    else setResetMsg("Check your email — if that address has an account, we sent a link to set a new password.");
  }
  const router = useRouter();
  const supabase = createBrowserSupabase();
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setSignedInAs(data.user?.email || "")); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const signOutFirst = async () => { await supabase.auth.signOut(); setSignedInAs(""); };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    // Return the user to where they were headed (e.g. /build-preview), else the builder.
    const next = new URLSearchParams(window.location.search).get("next");
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/build-preview";
    router.push(dest);
  }

  const input = "w-full rounded-full border-[1.5px] border-hair bg-white px-5 py-[12px] text-[15px] focus:outline-none focus:border-ink";
  const label = "block text-[11px] font-semibold tracking-[0.18em] uppercase text-ink/60 mb-[6px]";

  return (
    <main className="min-h-screen bg-beige font-inter text-ink px-5 py-10">
      <div className="max-w-[560px] mx-auto">
        <Link href="/" className="block text-[16.5px] font-medium tracking-[0.26em] mb-10">MARQUEE</Link>
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)]">Welcome back.</h1>
        <p className="text-[16px] leading-[1.55] mt-4">Log in to your Marquee.</p>

        {signedInAs && (
          <div className="mt-6 bg-white border border-hair px-4 py-3 text-[13.5px] leading-[1.55]">
            This browser is signed in as <b>{signedInAs}</b>. <Link href="/build-preview" className="underline underline-offset-2 hover:text-dred">Continue as {signedInAs}</Link>, or <button type="button" onClick={signOutFirst} className="underline underline-offset-2 hover:text-dred">sign out</button> to use a different account.
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <div><label htmlFor="login-email" className={label}>Email</label><input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} /></div>
          <div><label htmlFor="login-password" className={label}>Password</label><input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={input} /></div>
          {error && <p className="text-[13px] leading-[1.5] text-dred" role="alert">{error}</p>}
          {resetMsg && <p className="text-[13px] leading-[1.5] text-ink" role="status">{resetMsg}</p>}
          <button type="submit" disabled={loading} className="block w-full !mt-6 px-6 py-[15px] text-[16px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{loading ? "Logging in…" : "Log in"}</button>
          <p className="text-[13.5px] text-center !mt-5"><button type="button" onClick={sendReset} className="underline underline-offset-2 hover:text-dred">Forgot password?</button></p>
        </form>

        <p className="text-[13px] mt-10 text-center">Not a member yet? <Link href="/join" className="underline underline-offset-2 hover:text-dred">Join Marquee</Link></p>
      </div>
    </main>
  );
}
