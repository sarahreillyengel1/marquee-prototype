"use client";
// marquee.bio/business/join: create a business account. Work email only. Same look as /join and /login.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function BusinessJoinPage() { return <Suspense fallback={null}><BusinessJoin /></Suspense>; }

function BusinessJoin() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/opportunities/post";
  const [f, setF] = useState({ name: "", company: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedInAs, setSignedInAs] = useState("");
  const supabase = createBrowserSupabase();
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setSignedInAs(data.user?.email || "")); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    const r = await fetch("/api/business/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setError(j.error || "Something went wrong. Try again."); setBusy(false); return; }
    const { error: signIn } = await supabase.auth.signInWithPassword({ email: f.email.trim().toLowerCase(), password: f.password });
    if (signIn) { setError("Your account was created. Sign in to continue."); setBusy(false); return; }
    router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/opportunities/post");
  };

  const input = "w-full rounded-full border-[1.5px] border-hair bg-white px-5 py-[12px] text-[15px] focus:outline-none focus:border-ink";
  const label = "block text-[11px] font-semibold tracking-[0.18em] uppercase text-ink/60 mb-[6px]";

  return (
    <main className="min-h-screen bg-beige font-inter text-ink px-5 py-10">
      <div className="max-w-[560px] mx-auto">
        <Link href="/" className="block text-[16.5px] font-medium tracking-[0.26em] mb-10">MARQUEE</Link>
        <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred">For businesses</div>
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(30px,6vw,46px)] mt-3">Create a business account.</h1>
        <p className="text-[16px] leading-[1.55] mt-4">Post opportunities to experienced professionals. Free during the beta. Use your work email.</p>

        {signedInAs && (
          <div className="mt-6 bg-white border border-hair px-4 py-3 text-[13.5px] leading-[1.55]">
            This browser is signed in as <b>{signedInAs}</b>. <Link href="/opportunities/post" className="underline underline-offset-2 hover:text-dred">Continue as {signedInAs}</Link>, or <button type="button" onClick={async () => { await supabase.auth.signOut(); setSignedInAs(""); }} className="underline underline-offset-2 hover:text-dred">sign out</button> to make a new account.
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="b-name" className={label}>Your name</label><input id="b-name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" className={input} /></div>
            <div><label htmlFor="b-company" className={label}>Company</label><input id="b-company" required value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" className={input} /></div>
          </div>
          <div><label htmlFor="b-email" className={label}>Work email</label><input id="b-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" placeholder="you@yourcompany.com" className={input} /></div>
          <div><label htmlFor="b-password" className={label}>Password</label><input id="b-password" type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" className={input} /><p className="text-[12.5px] text-ink/60 mt-[6px]">At least 8 characters.</p></div>
          {error && <p className="text-[13px] leading-[1.5] text-dred" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="block w-full !mt-6 px-6 py-[15px] text-[16px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button>
          <p className="text-[12.5px] leading-[1.55] text-ink/60 !mt-4">By creating an account you agree to the <Link href="/terms" className="underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.</p>
        </form>

        <p className="text-[13px] mt-10 text-center">Already have an account? <Link href="/login?next=/business/opportunities" className="underline underline-offset-2 hover:text-dred">Sign in</Link></p>
        <p className="text-[13px] mt-2 text-center text-ink/60">Looking to build your own Marquee? <Link href="/join" className="underline underline-offset-2 hover:text-dred">Join as a professional</Link></p>
      </div>
    </main>
  );
}
