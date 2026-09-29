"use client";
// The visitor's own page for one booking: what, when, where, and a way to cancel.
// Reached from the link in their confirmation email, or straight after paying.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Booking = { status: string; offer: string; with: string; username: string; visitorName: string; when: string; meetingLink: string; paid: string; canCancel: boolean; refundIfCancelled: boolean; freeCancelHours: number };

export default function ManageBooking() {
  const { token } = useParams() as { token: string };
  const [justPaid, setJustPaid] = useState(false);
  useEffect(() => { setJustPaid(new URLSearchParams(window.location.search).get("booked") === "1"); }, []);
  const [b, setB] = useState<Booking | null>(null);
  const [missing, setMissing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let live = true;
    fetch(`/api/booking/manage?token=${encodeURIComponent(token)}`).then(async (r) => { if (!live) return; if (!r.ok) { setMissing(true); return; } setB(await r.json()); }).catch(() => live && setMissing(true));
    return () => { live = false; };
  }, [token, tries]);
  // straight after paying, Stripe's confirmation can take a few seconds to reach us
  useEffect(() => {
    if (b?.status !== "pending_payment" || tries >= 8) return;
    const t = setTimeout(() => setTries((n) => n + 1), 2500);
    return () => clearTimeout(t);
  }, [b, tries]);

  const cancel = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/booking/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const j = await r.json();
      if (!r.ok) setMsg(j.error || "Couldn't cancel. Please try again.");
      else { setMsg(j.refunded ? `Cancelled. ${j.refunded} is being refunded to your card.` : "Cancelled."); setConfirming(false); setTries((n) => n + 1); }
    } catch { setMsg("Couldn't reach Marquee. Please try again."); }
    setBusy(false);
  };

  const label = "font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6A62] mb-1";
  return (
    <main className="min-h-screen bg-brand-paper font-inter text-brand-ink px-5 py-10">
      <div className="max-w-[520px] mx-auto">
        <Link href="/" className="wordmark block mb-10">MARQUEE</Link>
        {missing ? (
          <>
            <h1 className="font-lora text-[32px] leading-[1.1] mb-3">We can&apos;t find that booking.</h1>
            <p className="text-[15px] text-[#3a352f] leading-[1.6]">The link may be incomplete. Open it again from your confirmation email.</p>
          </>
        ) : !b ? <p className="text-[15px] text-[#6E6A62]">Loading your booking…</p> : (
          <>
            <h1 className="font-lora text-[32px] leading-[1.1] mb-3">
              {b.status === "confirmed" ? (justPaid ? "Payment received. You're booked." : "Your booking") : b.status === "pending_payment" ? "Confirming your payment…" : "This booking was cancelled."}
            </h1>
            {b.status === "pending_payment" && <p className="text-[15px] text-[#3a352f] leading-[1.6] mb-6">{tries >= 8 ? "This is taking longer than usual. If you paid, your confirmation email will arrive shortly." : "This takes a few seconds."}</p>}
            <div className="bg-white border border-[#E9E6DF] p-6 mt-6">
              <div className={label}>Session</div><div className="text-[16px] mb-4">{b.offer} with {b.with}</div>
              <div className={label}>When</div><div className="text-[16px] mb-4">{b.when}</div>
              {b.meetingLink && (<><div className={label}>Where</div><div className="text-[16px] mb-4 break-all"><a href={b.meetingLink} className="underline underline-offset-2">{b.meetingLink}</a></div></>)}
              {b.paid && (<><div className={label}>Paid</div><div className="text-[16px] mb-1">{b.paid}</div></>)}
            </div>
            {msg && <p className="text-[14.5px] mt-4" role="status">{msg}</p>}
            {b.canCancel && !confirming && <button onClick={() => setConfirming(true)} className="mt-6 font-sans text-[13.5px] font-semibold underline underline-offset-4">Cancel this booking</button>}
            {b.canCancel && confirming && (
              <div className="mt-6 border border-[#E9E6DF] bg-white p-5">
                <p className="text-[15px] leading-[1.55] mb-4">
                  {b.paid ? (b.refundIfCancelled ? `Cancel and refund ${b.paid}?` : `This session starts in less than ${b.freeCancelHours} hours, so it can't be refunded. Cancel anyway?`) : "Cancel this booking?"} {b.with} will be told by email.
                </p>
                <div className="flex gap-3">
                  <button onClick={cancel} disabled={busy} className="bg-brand-ink text-white font-sans text-[13.5px] font-semibold py-[11px] px-[18px] disabled:opacity-50">{busy ? "Cancelling…" : "Yes, cancel"}</button>
                  <button onClick={() => setConfirming(false)} className="border border-[#E1DED7] bg-white font-sans text-[13.5px] font-semibold py-[11px] px-[18px]">Keep it</button>
                </div>
              </div>
            )}
            <p className="mt-10 text-[13px] text-[#6E6A62]"><Link href={`/${b.username}`} className="underline underline-offset-2">Back to {b.with}&apos;s profile</Link></p>
          </>
        )}
      </div>
    </main>
  );
}
