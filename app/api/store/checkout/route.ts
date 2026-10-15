import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { ownerOf, originOf, settingsOf, validEmail } from "@/lib/booking-server";
import { deliveryFor, orderFee, productOf, priceCentsOf, secretsOf, type OrderRow } from "@/lib/orders";
import { sendOrderDelivered, sendSaleNotice } from "@/lib/email";
import { stripe, stripeReady } from "@/lib/stripe";
import { looksLikeSpam } from "@/lib/spam";

// POST /api/store/checkout { username, productId, name?, email? }
//   free product  -> needs name + email; delivers by email at once      -> { ok, free: true, thanksUrl }
//   paid product  -> Stripe's checkout page collects name, email, card  -> { ok, checkoutUrl }
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (looksLikeSpam(req, body.website_url)) return NextResponse.json({ error: "Please try again." }, { status: 400 });
  const username = String(body.username || "").trim().toLowerCase();
  const productId = String(body.productId || "").trim();
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
  if (!username || !productId) return NextResponse.json({ error: "That product isn't available." }, { status: 400 });

  const db = createServerSupabase();
  const owner = await ownerOf(db, username);
  const product = owner && productOf(owner.profile, productId);
  if (!owner || !product) return NextResponse.json({ error: "That product isn't available." }, { status: 404 });

  const price = priceCentsOf(product);
  const origin = originOf(req);

  if (price === 0) {
    if (!name || !validEmail(email)) return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });
    const { data: row, error } = await db.from("orders").insert({
      username, owner_id: owner.ownerId, product_id: product.id, product_title: product.title, product_kind: product.kind,
      buyer_name: name, buyer_email: email, price_cents: 0, fee_cents: 0, status: "free", delivered_at: new Date().toISOString(),
    }).select("*").single();
    if (error || !row) return NextResponse.json({ error: error?.message.includes("orders") ? "Selling isn't switched on yet." : "Couldn't save your order. Please try again." }, { status: 500 });
    const o = row as OrderRow;
    const secrets = await secretsOf(db, owner.ownerId, product.id);
    await sendOrderDelivered({ ownerName: owner.name, ownerEmail: owner.email, username, buyerName: name, buyerEmail: email, productTitle: product.title, paid: null, delivery: deliveryFor(origin, o, secrets), thanksUrl: `${origin}/${username}/thanks?o=${o.access_token}` });
    await sendSaleNotice({ ownerName: owner.name, ownerEmail: owner.email, username, buyerName: name, buyerEmail: email, productTitle: product.title, paid: null, salesUrl: `${origin}/build-preview` });
    return NextResponse.json({ ok: true, free: true, thanksUrl: `/${username}/thanks?o=${o.access_token}` });
  }

  const s = await settingsOf(db, owner.ownerId);
  if (!stripeReady() || !s.stripeReady || !s.stripeAccount) return NextResponse.json({ error: `${owner.name.split(" ")[0]} hasn't switched on payments yet.` }, { status: 409 });

  const fee = orderFee(price);
  const { data: row, error } = await db.from("orders").insert({
    username, owner_id: owner.ownerId, product_id: product.id, product_title: product.title, product_kind: product.kind,
    buyer_name: name || null, buyer_email: email || "pending@marquee.bio", price_cents: price, fee_cents: fee, status: "pending_payment",
  }).select("*").single();
  if (error || !row) return NextResponse.json({ error: error?.message.includes("orders") ? "Selling isn't switched on yet." : "Couldn't start the order. Please try again." }, { status: 500 });
  const o = row as OrderRow;

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      ...(validEmail(email) ? { customer_email: email } : {}),
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: price, product_data: { name: product.title, description: `${product.kind} by ${owner.name}`.slice(0, 200), ...(product.image ? { images: [product.image] } : {}) } } }],
      payment_intent_data: { application_fee_amount: fee, transfer_data: { destination: s.stripeAccount }, metadata: { order_id: o.id } },
      metadata: { order_id: o.id, kind: "order" }, expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${origin}/${username}/thanks?o=${o.access_token}`, cancel_url: `${origin}/${username}#shop`,
    });
    await db.from("orders").update({ stripe_session_id: session.id }).eq("id", o.id);
    return NextResponse.json({ ok: true, checkoutUrl: session.url });
  } catch (e) {
    console.error("Store checkout error:", e);
    await db.from("orders").delete().eq("id", o.id);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }
}
