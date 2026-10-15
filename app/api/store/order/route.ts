import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { originOf } from "@/lib/booking-server";
import { deliveryFor, orderByToken, orderMoney, secretsOf } from "@/lib/orders";

// GET /api/store/order?o=<token> -> the buyer's own order: what they bought and how to get it.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("o") || "";
  const db = createServerSupabase();
  const o = await orderByToken(db, token);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ready = o.status === "paid" || o.status === "free";
  const delivery = ready ? deliveryFor(originOf(req), o, await secretsOf(db, o.owner_id, o.product_id)) : null;
  return NextResponse.json({ status: o.status, product: o.product_title, kind: o.product_kind, username: o.username, buyerEmail: o.buyer_email, paid: o.price_cents > 0 ? orderMoney(o.price_cents) : null, delivery });
}
