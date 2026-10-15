"use client";
// The Buy button on a product that sells through Marquee. Paid: straight to Stripe's checkout page.
// Free: a two-field form (name, email) so the download can be emailed, then the thank-you page.
import { useState } from "react";
import type { StoreItem } from "@/lib/profile-types";

export function buyLabel(p: StoreItem) {
  const n = Number(String(p.price || "").replace(/[^0-9.]/g, "")) || 0;
  return n === 0 ? "Get it free" : `Buy · $${n.toLocaleString("en-US")}`;
}

export function BuyButton({ username, product, className, preview, children }: { username: string; product: StoreItem; className: string; preview?: boolean; children?: React.ReactNode }) {
  const free = (Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0) === 0;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const go = async (extra?: { name: string; email: string }) => {
    if (preview) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/store/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, productId: product.id, ...(extra || {}) }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "Please try again."); setBusy(false); return; }
      window.location.href = j.checkoutUrl || j.thanksUrl;
    } catch { setErr("Please try again."); setBusy(false); }
  };

  if (free && open) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); go({ name, email }); }} className="buy-free">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoComplete="name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" required autoComplete="email" inputMode="email" />
        {err && <div className="buy-err">{err}</div>}
        <button type="submit" className={className} disabled={busy}>{busy ? "Sending…" : "Send it to me"}</button>
      </form>
    );
  }
  return (
    <>
      <button type="button" className={className} disabled={busy} onClick={() => (free ? setOpen(true) : go())}>{children ?? buyLabel(product)}</button>
      {err && <div className="buy-err">{err}</div>}
    </>
  );
}
