"use client";
// After buying (or picking up a free product): what you got and how to get it. Reached from Stripe's
// success page or the link in the delivery email. Stripe's confirmation can take a few seconds to
// reach us, so this page keeps checking until the order shows as paid.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Order = { status: string; product: string; kind: string | null; username: string; buyerEmail: string; paid: string | null; delivery: null | { kind: "file" | "link" | "workshop" | "none"; downloadUrl?: string; url?: string; when?: string; meetingLink?: string } };

export default function Thanks() {
  const { username } = useParams() as { username: string };
  const [o, setO] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);
  const [tries, setTries] = useState(0);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("o") || "";
    let live = true;
    fetch(`/api/store/order?o=${encodeURIComponent(token)}`).then(async (r) => { if (!live) return; if (!r.ok) { setMissing(true); return; } setO(await r.json()); }).catch(() => live && setMissing(true));
    return () => { live = false; };
  }, [tries]);
  useEffect(() => { if (o && o.status === "pending_payment" && tries < 10) { const t = setTimeout(() => setTries((n) => n + 1), 2000); return () => clearTimeout(t); } }, [o, tries]);

  const box = "min-h-screen bg-[#F7F6F2] text-brand-ink font-inter flex items-center justify-center px-5 py-16";
  const btn = "inline-block bg-brand-ink text-white font-sans text-[14px] font-semibold py-[12px] px-[20px] hover:bg-[#670821]";
  if (missing) return <div className={box}><div className="max-w-[440px]"><p className="font-lora text-[26px] mb-2">We couldn&rsquo;t find that order.</p><p className="text-[15px] text-[#6E6A62]">Check the link in your email, or <Link href={`/${username}`} className="underline">go back to the shop</Link>.</p></div></div>;
  if (!o) return <div className={box}><p className="text-[15px] text-[#6E6A62]">One moment…</p></div>;
  const ready = o.status === "paid" || o.status === "free";
  const d = o.delivery;
  return (
    <div className={box}>
      <div className="w-full max-w-[480px]">
        <div className="font-sans text-[13px] font-medium tracking-[0.26em] mb-8">MARQUEE</div>
        {!ready && o.status === "pending_payment" && (<><p className="font-lora text-[28px] leading-[1.1] mb-3">Confirming your payment…</p><p className="text-[15px] text-[#6E6A62]">This usually takes a few seconds.{tries >= 10 ? " If this keeps spinning, check your email: your receipt and download will arrive there." : ""}</p></>)}
        {!ready && o.status !== "pending_payment" && (<><p className="font-lora text-[28px] leading-[1.1] mb-3">This order was {o.status === "refunded" ? "refunded" : "not completed"}.</p><p className="text-[15px] text-[#6E6A62]"><Link href={`/${username}#shop`} className="underline">Back to the shop</Link></p></>)}
        {ready && (
          <>
            <p className="font-lora text-[30px] leading-[1.1] mb-3">Thank you.</p>
            <div className="bg-white border border-[#E1DED7] p-5 mb-5 text-[15px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6A62] mb-1">{o.paid ? "You bought" : "You picked up"}</div>
              <div className="font-semibold">{o.product}</div>
              {o.paid && <div className="text-[#6E6A62] mt-1">{o.paid}, paid.</div>}
            </div>
            {d?.kind === "file" && d.downloadUrl && <a className={btn} href={d.downloadUrl}>Download</a>}
            {d?.kind === "link" && d.url && <a className={btn} href={d.url} target="_blank" rel="noopener">Open it</a>}
            {d?.kind === "workshop" && (
              <div className="bg-white border border-[#E1DED7] p-5 mb-5 text-[15px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6A62] mb-1">When</div><div className="mb-3">{d.when || "Details to follow by email."}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6A62] mb-1">Where</div><div>{d.meetingLink ? <a href={d.meetingLink} className="underline" target="_blank" rel="noopener">{d.meetingLink}</a> : "The link will be emailed before it starts."}</div>
                {d.downloadUrl && <a className={`${btn} mt-4`} href={d.downloadUrl}>Download the materials</a>}
              </div>
            )}
            <p className="text-[14px] text-[#6E6A62] mt-5">We also sent this to <b>{o.buyerEmail}</b>. <Link href={`/${username}`} className="underline">Back to {username}&rsquo;s page</Link>.</p>
          </>
        )}
      </div>
    </div>
  );
}
