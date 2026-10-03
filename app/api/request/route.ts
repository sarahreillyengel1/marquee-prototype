import { NextResponse } from "next/server";
import { looksLikeSpam } from "@/lib/spam";
import { createServerSupabase } from "@/lib/supabase";
import { DEMO_PROFILES } from "@/lib/demo-profiles";
import { ownerOf, validEmail } from "@/lib/booking-server";
import { emailReady, sendRequestEmails } from "@/lib/email";

// POST /api/request { username, offer, name, email, message }
// "Send request": recorded on Marquee, emailed to the profile owner (their reply goes straight
// to the visitor), with a copy to the visitor.
//   -> { ok: true, emailed: true }
//   -> { ok: false, fallback: "mailto:…" }  when email isn't switched on yet, so nothing is lost
export async function POST(req: Request) {
  if (looksLikeSpam(req)) return NextResponse.json({ ok: true, success: true }); // junk: answer as if it worked, do nothing
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const offer = String(body.offer || "General").trim().slice(0, 200);
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 4000);
  if (!username || !name || !validEmail(email) || !message) return NextResponse.json({ error: "Please add your name, a valid email, and a message." }, { status: 400 });

  const db = createServerSupabase();
  const demo = DEMO_PROFILES[username];
  const owner = demo ? { ownerId: "", username, name: demo.name, email: demo.inquiryEmail || "" } : await ownerOf(db, username);
  if (!owner || !owner.email) return NextResponse.json({ error: "This profile isn't accepting requests yet." }, { status: 404 });

  const mailto = `mailto:${owner.email}?subject=${encodeURIComponent(`Request from ${name}: ${offer}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
  if (owner.ownerId) {
    const { error } = await db.from("bookings").insert({ username, owner_id: owner.ownerId, kind: "request", status: "requested", offer_title: offer, visitor_name: name, visitor_email: email, visitor_note: message });
    if (error) console.error("Request save error:", error.message); // still try to deliver it
  }
  if (!emailReady()) return NextResponse.json({ ok: false, fallback: mailto });
  const sent = await sendRequestEmails({ ownerName: owner.name, ownerEmail: owner.email, username, visitorName: name, visitorEmail: email, offerTitle: offer, message });
  if (!("ok" in sent.owner) || !sent.owner.ok) return NextResponse.json({ ok: false, fallback: mailto });
  return NextResponse.json({ ok: true, emailed: true });
}
