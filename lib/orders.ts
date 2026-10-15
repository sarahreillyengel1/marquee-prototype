// Server-only helpers for selling products: what a product is, what the buyer gets, and the order rows.
// What a buyer receives (a file, a hidden link, a meeting link) never sits in the public profile; it is
// read from the member's builder draft at delivery time, so a member can fix a link without republishing.
import { createServerSupabase } from "@/lib/supabase";
import { feeCents, money } from "@/lib/booking";
import type { Profile, StoreItem } from "@/lib/profile-types";

export type Db = ReturnType<typeof createServerSupabase>;
export const PRODUCTS_BUCKET = "products";

export interface OrderRow {
  id: string; created_at: string; username: string; owner_id: string;
  product_id: string; product_title: string; product_kind: string | null;
  buyer_name: string | null; buyer_email: string; price_cents: number; fee_cents: number; currency: string;
  status: "pending_payment" | "paid" | "free" | "refunded" | "cancelled";
  stripe_session_id: string | null; stripe_payment_intent: string | null;
  delivered_at: string | null; refunded_at: string | null; access_token: string;
}

/** The private half of a product, from the member's draft: the file, the hidden link, the meeting link. */
export interface ProductSecrets { file?: string; fileName?: string; deliverUrl?: string; meetingLink?: string; eventLabel?: string }

export const priceCentsOf = (p: StoreItem) => { const n = Number(String(p.price ?? "").replace(/[^0-9.]/g, "")); return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0; };

/** The public product on a published profile, by id. Only products set to sell on Marquee count. */
export function productOf(profile: Profile, productId: string) {
  const p = (profile.store || []).find((x) => x.id === productId);
  return p && p.sell === "marquee" ? p : null;
}

/** The deliverable for one product, from the owner's builder draft. */
export async function secretsOf(db: Db, ownerId: string, productId: string): Promise<ProductSecrets> {
  const { data } = await db.from("builder_drafts").select("data").eq("user_id", ownerId).maybeSingle();
  const list = ((data?.data as { products?: (ProductSecrets & { id?: string })[] } | null)?.products) || [];
  const p = list.find((x) => x.id === productId);
  return p ? { file: p.file, fileName: p.fileName, deliverUrl: p.deliverUrl, meetingLink: p.meetingLink, eventLabel: p.eventLabel } : {};
}

export async function orderByToken(db: Db, token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const { data } = await db.from("orders").select("*").eq("access_token", token).maybeSingle();
  return (data as OrderRow | null) || null;
}

/** A link to the file that works for a short while. Null when the product has no file. */
export async function fileLinkFor(db: Db, s: ProductSecrets, minutes = 15) {
  if (!s.file) return null;
  const { data } = await db.storage.from(PRODUCTS_BUCKET).createSignedUrl(s.file, minutes * 60, s.fileName ? { download: s.fileName } : undefined);
  return data?.signedUrl || null;
}

/** What to tell the buyer, in words and links, once an order is paid or free. */
export function deliveryFor(origin: string, o: OrderRow, s: ProductSecrets) {
  const out: { kind: "file" | "link" | "workshop" | "none"; downloadUrl?: string; url?: string; when?: string; meetingLink?: string } = { kind: "none" };
  if (s.file) { out.kind = "file"; out.downloadUrl = `${origin}/api/store/download/${o.access_token}`; }
  else if (s.deliverUrl) { out.kind = "link"; out.url = s.deliverUrl; }
  if ((o.product_kind || "").toLowerCase() === "workshop") { out.kind = "workshop"; out.when = s.eventLabel; out.meetingLink = s.meetingLink; if (s.file) out.downloadUrl = `${origin}/api/store/download/${o.access_token}`; }
  return out;
}

export const orderFee = feeCents;
export const orderMoney = money;
