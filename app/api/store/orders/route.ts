import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId, ownerOf } from "@/lib/booking-server";
import { orderMoney, type OrderRow } from "@/lib/orders";
import { sendOrderRefunded } from "@/lib/email";
import { stripe, stripeReady } from "@/lib/stripe";

// Signed-in member only.
// GET  /api/store/orders            -> their sales, newest first, with totals
// POST /api/store/orders { id }     -> refund one paid order (money back to the buyer, Marquee's fee returned too)
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = createServerSupabase();
  const { data, error } = await db.from("orders").select("*").eq("owner_id", me).neq("status", "pending_payment").order("created_at", { ascending: false }).limit(1000);
  if (error) return NextResponse.json({ error: error.message.includes("orders") ? "Selling isn't switched on yet." : "Couldn't load sales." }, { status: 500 });
  const rows = (data || []) as OrderRow[];
  const paid = rows.filter((r) => r.status === "paid");
  const gross = paid.reduce((n, r) => n + r.price_cents, 0);
  const fees = paid.reduce((n, r) => n + r.fee_cents, 0);
  const customers = new Set(rows.map((r) => r.buyer_email.toLowerCase())).size;
  return NextResponse.json({ rows, totals: { sales: paid.length, free: rows.filter((r) => r.status === "free").length, refunded: rows.filter((r) => r.status === "refunded").length, gross: orderMoney(gross), earned: orderMoney(gross - fees), customers } });
}

export async function POST(req: Request) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await req.json().catch(() => ({})) as { id?: string };
  if (!id) return NextResponse.json({ error: "Which order?" }, { status: 400 });
  const db = createServerSupabase();
  const { data } = await db.from("orders").select("*").eq("id", id).eq("owner_id", me).maybeSingle();
  const o = data as OrderRow | null;
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (o.status !== "paid" || !o.stripe_payment_intent) return NextResponse.json({ error: "Only a paid order can be refunded." }, { status: 400 });
  if (!stripeReady()) return NextResponse.json({ error: "Payments aren't set up." }, { status: 503 });
  try { await stripe().refunds.create({ payment_intent: o.stripe_payment_intent, reverse_transfer: true, refund_application_fee: true }); }
  catch (e) { console.error("Refund failed:", e); return NextResponse.json({ error: "Stripe couldn't refund this one. Try again, or refund it from your Stripe dashboard." }, { status: 502 }); }
  await db.from("orders").update({ status: "refunded", refunded_at: new Date().toISOString() }).eq("id", o.id);
  const owner = await ownerOf(db, o.username);
  if (owner) sendOrderRefunded({ ownerName: owner.name, ownerEmail: owner.email, username: o.username, buyerName: o.buyer_name || "", buyerEmail: o.buyer_email, productTitle: o.product_title, paid: orderMoney(o.price_cents) }).catch(() => {});
  return NextResponse.json({ ok: true });
}
