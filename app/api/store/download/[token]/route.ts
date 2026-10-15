import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { fileLinkFor, orderByToken, secretsOf } from "@/lib/orders";

// GET /api/store/download/<token> -> the product file, for a paid or free order. The link in the
// buyer's email keeps working; each visit hands out a fresh short-lived link to the private file.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = createServerSupabase();
  const o = await orderByToken(db, token);
  if (!o || !(o.status === "paid" || o.status === "free")) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = await fileLinkFor(db, await secretsOf(db, o.owner_id, o.product_id));
  if (!url) return NextResponse.json({ error: "This product has no file attached. Please email the seller." }, { status: 404 });
  return NextResponse.redirect(url, 302);
}
