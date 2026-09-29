"use client";
// Straight after paying: create the account that the membership belongs to.
// The email is the one used for payment; it can't be changed here.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";

type Paid = { email: string; plan: string; hasAccount: boolean; claimed: boolean };

export default function Welcome() {
  const [sessionId, setSessionId] = useState("");
  const [paid, setPaid] = useState<Paid | null>(null);
  const [missing, setMissing] = useState(false);
  const [f, setF] = useState({ first: "", last: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id") || "";
    setSessionId(id);
    if (!id) { setMissing(true); return; }
    fetch(`/api/membership/session?session_id=${encodeURIComponent(id)}`).then(async (r) => { if (!r.ok) { setMissing(true); return; } setPaid(await r.json()); }).catch(() => setMissing(true));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/membership/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, first_name: f.first, last_name: f.last, password: f.password }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "We couldn't create your account. Please try again."); setBusy(false); return; }
      if (j.existing) { setAttached(true); setBusy(false); return; }
      const { error } = await createBrowserSupabase().auth.signInWithPassword({ email: j.email, password: f.password });
      window.location.href = error ? "/login?next=/build-preview" : "/build-preview";
    } catch { setErr("We couldn't reach Marquee. Please try again."); setBusy(false); }
  };
  // the membership belongs to an email that already has an account: add it, then sign in
  const addToExisting = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/membership/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId }) });
      const j = await r.json();
      if (!r.ok) setErr(j.error || "We couldn't add your membership. Please try again."); else setAttached(true);
    } catch { setErr("We couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };

  const field = "w-full rounded-[8px] border-[1.5px] border-hair bg-white px-4 py-[12px] text-[15px] focus:outline-none focus:border-ink";
  const label = "block text-[13px] font-semibold mb-[6px]";
  return (
    <main className="min-h-screen bg-beige font-inter text-ink px-5 py-10">
      <div className="max-w-[520px] mx-auto">
        <Link href="/" className="block text-[16.5px] font-medium tracking-[0.26em] mb-10">MARQUEE</Link>
        {missing ? (
          <>
            <h1 className="font-lora font-normal leading-[1.1] text-[32px]">We couldn&apos;t find that payment.</h1>
            <p className="text-[15.5px] leading-[1.6] mt-4">If you just paid, open the link in your welcome email. If you haven&apos;t joined yet, you can start here.</p>
            <Link href="/join" className="inline-block mt-6 px-6 py-[13px] text-[15px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors">Become a Founding Member</Link>
          </>
        ) : !paid ? <p className="text-[15px] text-ink/70">Confirming your payment…</p> : attached || (paid.claimed && paid.hasAccount) ? (
          <>
            <h1 className="font-lora font-normal leading-[1.1] text-[32px]">Your membership is set up.</h1>
            <p className="text-[15.5px] leading-[1.6] mt-4">Founding Member, {paid.plan}, on the account for <strong>{paid.email}</strong>. Sign in to start your profile.</p>
            <Link href="/login?next=/build-preview" className="inline-block mt-6 px-6 py-[13px] text-[15px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors">Sign in</Link>
          </>
        ) : paid.hasAccount ? (
          <>
            <h1 className="font-lora font-normal leading-[1.1] text-[32px]">Payment received. Welcome.</h1>
            <p className="text-[15.5px] leading-[1.6] mt-4">You already have a Marquee account for <strong>{paid.email}</strong>. We&apos;ll add your Founding Member membership ({paid.plan}) to it.</p>
            <button onClick={addToExisting} disabled={busy} className="mt-6 px-6 py-[13px] text-[15px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Adding…" : "Add it to my account"}</button>
            {err && <p className="text-[13px] text-dred mt-3" role="alert">{err}</p>}
          </>
        ) : (
          <>
            <span className="inline-block text-[11.5px] font-bold tracking-[0.16em] uppercase px-[13px] py-[7px] rounded-full bg-dred text-white">Founding Member · {paid.plan}</span>
            <h1 className="font-lora font-normal leading-[1.1] text-[clamp(28px,6vw,38px)] mt-5">Payment received. Now create your account.</h1>
            <form onSubmit={create} className="bg-white border border-hair rounded-[10px] p-6 mt-7" noValidate>
              <div className="mb-4"><div className={label}>Email</div><div className="text-[15px]">{paid.email}</div><div className="text-[12.5px] text-ink/60 mt-1">The email you paid with. You&apos;ll sign in with it.</div></div>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div><label htmlFor="w-first" className={label}>First name</label><input id="w-first" autoComplete="given-name" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} className={field} /></div>
                <div><label htmlFor="w-last" className={label}>Last name</label><input id="w-last" autoComplete="family-name" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} className={field} /></div>
              </div>
              <div><label htmlFor="w-pass" className={label}>Choose a password</label><input id="w-pass" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={field} /><div className="text-[12.5px] text-ink/60 mt-1">At least 8 characters.</div></div>
              {err && <p className="text-[13px] text-dred mt-3" role="alert">{err}</p>}
              <button type="submit" disabled={busy} className="block w-full mt-5 px-6 py-[14px] text-[15.5px] rounded-full font-semibold bg-red text-white hover:bg-dred transition-colors disabled:opacity-50">{busy ? "Creating your account…" : "Create account and start my profile"}</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
