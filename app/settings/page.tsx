"use client";
// marquee.bio/settings: the account. Page name, your name, email, password, membership and billing, sign out.
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";

const card = "bg-white border border-[#E1DED7] p-[22px]";
const label = "font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E6A62] mb-2";
const inp = "w-full font-inter text-[14.5px] py-[10px] px-[12px] border border-[#E1DED7] bg-white focus:outline-none focus:border-brand-ink";
const btn = "font-sans text-[13px] font-semibold border border-[#E1DED7] bg-white py-[9px] px-[14px] hover:border-brand-ink disabled:opacity-50";
const dark = "font-sans text-[13px] font-semibold text-white bg-[#670821] py-[9px] px-[15px] hover:bg-[#4E0619] disabled:opacity-50";
const PLAN_LABEL: Record<string, string> = { founding_monthly: "Founding Member, $20 a month", founding_yearly: "Founding Member, $200 a year", founding_comped: "Founding Member, invited with a code, no charge", pro_monthly: "Pro, $29 a month", pro_yearly: "Pro, $279 a year" };

export default function Settings() {
  const supabase = createBrowserSupabase();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [published, setPublished] = useState(false);
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("member");
  const [newEmail, setNewEmail] = useState("");
  const [pw1, setPw1] = useState(""); const [pw2, setPw2] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const say = (k: string, v: string) => setNote((n) => ({ ...n, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/settings"; return; }
      setEmail(user.email || ""); setNewEmail(user.email || "");
      setName(user.user_metadata?.full_name || [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") || "");
      setPlan(user.app_metadata?.plan || ""); setStatus(user.app_metadata?.subscription_status || ""); setAccount(user.app_metadata?.account || "member");
      const { data: pub } = await supabase.from("published_profiles").select("username").eq("user_id", user.id).maybeSingle();
      if (pub?.username) { setUsername(pub.username); setPublished(true); }
      else { const { data: meta } = await supabase.from("profiles_meta").select("username").eq("id", user.id).maybeSingle(); if (meta?.username) setUsername(meta.username); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveUsername = async () => {
    setBusy("username"); say("username", "");
    const r = await fetch("/api/settings/username", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    const j = await r.json().catch(() => ({}));
    setBusy(""); say("username", r.ok ? `Saved. Your page is marquee.bio/${j.username}.` : j.error || "Couldn't save.");
    if (r.ok) setUsername(j.username);
  };
  const saveName = async () => {
    setBusy("name"); say("name", "");
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim(), first_name: name.trim().split(/\s+/)[0] } });
    setBusy(""); say("name", error ? "Couldn't save." : "Saved. The name on your public page is set in the builder.");
  };
  const saveEmail = async () => {
    setBusy("email"); say("email", "");
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
    setBusy(""); say("email", error ? error.message : `We sent a confirmation to ${newEmail.trim()}. The change happens when you click it.`);
  };
  const savePassword = async () => {
    say("password", "");
    if (pw1.length < 8) { say("password", "Use at least 8 characters."); return; }
    if (pw1 !== pw2) { say("password", "The two passwords don't match."); return; }
    setBusy("password");
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(""); setPw1(""); setPw2(""); say("password", error ? error.message : "Password changed.");
  };
  const billing = async () => {
    setBusy("billing"); say("billing", "");
    const r = await fetch("/api/settings/billing", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (r.ok && j.url) window.location.href = j.url; else say("billing", j.error || "Couldn't open billing.");
  };
  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-brand-ink font-inter">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E1DED7] bg-white">
        <Link href="/" className="font-sans text-[13px] font-medium tracking-[0.26em]">MARQUEE</Link>
        <div className="flex items-center gap-4 text-[13px]">
          {username && published && <Link href={`/${username}`} className="text-[#7d7a74] hover:text-brand-ink">View profile</Link>}
          {account === "business" ? <Link href="/business/opportunities" className="font-sans font-semibold bg-brand-ink text-white py-[8px] px-[14px] hover:bg-[#670821]">Your opportunities</Link> : <Link href="/build-preview" className="font-sans font-semibold bg-brand-ink text-white py-[8px] px-[14px] hover:bg-[#670821]">Edit profile</Link>}
        </div>
      </div>
      <div className="max-w-[760px] mx-auto px-5 py-10 space-y-4">
        <div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#670821] mb-2">Settings</div>
          <h1 className="font-lora text-[36px] leading-[1.05] mb-2">Your account.</h1>
          <p className="text-[14.5px] text-[#7d7a74] mb-4">Your page name, your name, email, password and membership. Only you can see this.</p>
        </div>

        {account !== "business" && (
          <div className={card}>
            <div className={label}>Page name</div>
            <div className="flex items-center gap-2"><span className="text-[14.5px] text-[#6E6A62] whitespace-nowrap">marquee.bio/</span><input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className={inp} placeholder="yourname" /><button type="button" onClick={saveUsername} disabled={busy === "username" || !username} className={dark}>Save</button></div>
            <p className="text-[12.5px] text-[#7d7a74] mt-2">Letters, numbers and dashes. If you change it, links to the old name stop working.</p>
            {note.username && <p className="text-[13px] mt-2">{note.username}</p>}
          </div>
        )}

        <div className={card}>
          <div className={label}>Your name</div>
          <div className="flex items-center gap-2"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /><button type="button" onClick={saveName} disabled={busy === "name"} className={dark}>Save</button></div>
          {note.name && <p className="text-[13px] mt-2">{note.name}</p>}
        </div>

        <div className={card}>
          <div className={label}>Email</div>
          <div className="flex items-center gap-2"><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inp} /><button type="button" onClick={saveEmail} disabled={busy === "email" || newEmail.trim().toLowerCase() === email} className={dark}>Change</button></div>
          <p className="text-[12.5px] text-[#7d7a74] mt-2">You sign in with this address. A new address has to be confirmed by email before it takes over.</p>
          {note.email && <p className="text-[13px] mt-2">{note.email}</p>}
        </div>

        <div className={card}>
          <div className={label}>Password</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="New password" autoComplete="new-password" className={inp} />
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Again" autoComplete="new-password" className={inp} />
          </div>
          <div className="mt-3"><button type="button" onClick={savePassword} disabled={busy === "password" || !pw1} className={dark}>Change password</button></div>
          {note.password && <p className="text-[13px] mt-2">{note.password}</p>}
        </div>

        {account !== "business" && (
          <div className={card}>
            <div className={label}>Membership</div>
            <div className="text-[15px] font-semibold">{PLAN_LABEL[plan] || (plan ? plan : "No membership on this account")}</div>
            {status && <div className="text-[12.5px] text-[#7d7a74] mt-1">Status: {status}</div>}
            {plan && plan !== "founding_comped" && <div className="mt-3 flex items-center gap-3"><button type="button" onClick={billing} disabled={busy === "billing"} className={btn}>{busy === "billing" ? "Opening…" : "Manage billing"}</button><span className="text-[12.5px] text-[#7d7a74]">Card, receipts, and cancelling. Opens Stripe.</span></div>}
            {plan === "founding_comped" && <p className="text-[12.5px] text-[#7d7a74] mt-2">Nothing to bill. Your Founding Member pricing is ready when the beta ends.</p>}
            {note.billing && <p className="text-[13px] mt-2">{note.billing}</p>}
          </div>
        )}

        <div className={card}>
          <div className={label}>Sign out</div>
          <div className="flex items-center gap-3"><button type="button" onClick={signOut} className={btn}>Sign out of this browser</button><span className="text-[12.5px] text-[#7d7a74]">Signed in as {email}</span></div>
        </div>
        <p className="text-[12.5px] text-[#7d7a74]">To close your account, email <a href="mailto:hello@marquee.bio" className="underline">hello@marquee.bio</a>.</p>
      </div>
    </div>
  );
}
