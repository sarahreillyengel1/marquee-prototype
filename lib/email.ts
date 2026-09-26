// Transactional email via the Resend REST API (no SDK dependency — plain fetch).
//
// This is INERT until RESEND_API_KEY is set in the environment. Before it can send to
// real applicants you also need a VERIFIED sending domain in Resend (e.g. marquee.bio),
// otherwise Resend only allows sending to the account owner's own address.
//
// Env:
//   RESEND_API_KEY        — required to send (without it, sends are skipped silently)
//   WAITLIST_FROM_EMAIL   — optional, defaults to "Marquee <hello@marquee.bio>"

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = process.env.WAITLIST_FROM_EMAIL || "Marquee <hello@marquee.bio>";

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true as const }; // not configured yet
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", res.status, await res.text());
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("Resend send error:", err);
    return { ok: false as const };
  }
}

// Confirmation to the person who just applied — "your request is being reviewed".
export async function sendWaitlistConfirmation(to: string, firstName?: string | null) {
  const name = firstName?.trim() || "there";
  const html = `
  <div style="margin:0;padding:0;background:#F7F6F2;">
    <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:Helvetica,Arial,sans-serif;color:#111111;">
      <div style="font-size:15px;font-weight:600;letter-spacing:0.25em;color:#111111;margin-bottom:32px;">MARQUEE</div>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">Hi ${name},</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">Thanks for requesting early access to Marquee. <strong>Your request is being reviewed.</strong></p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">We're opening the beta to a small group at a time. If you're a fit, we'll be in touch with an invitation to build your Marquee.</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 28px;">— The Marquee team</p>
      <hr style="border:none;border-top:1px solid #E9E6DF;margin:0 0 16px;" />
      <p style="font-size:12px;line-height:1.5;color:#7d7a74;margin:0;">Marquee · <a href="https://marquee.bio" style="color:#7d7a74;">marquee.bio</a></p>
    </div>
  </div>`;
  return sendEmail(to, "We received your Marquee request", html);
}

// Optional heads-up to the team that a new application arrived.
export async function sendWaitlistNotification(applicant: {
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  linkedin_url?: string | null;
}) {
  const to = process.env.WAITLIST_NOTIFY_EMAIL;
  if (!to) return { skipped: true as const }; // no notify address configured
  const fullName = [applicant.first_name, applicant.last_name].filter(Boolean).join(" ") || "(no name)";
  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;color:#111111;font-size:15px;line-height:1.6;">
    <p><strong>New Marquee application</strong></p>
    <p>Name: ${fullName}<br/>
    Email: <a href="mailto:${applicant.email}">${applicant.email}</a><br/>
    LinkedIn: ${applicant.linkedin_url ? `<a href="${applicant.linkedin_url}">${applicant.linkedin_url}</a>` : "—"}</p>
    <p>Review in Supabase → waitlist (status = pending).</p>
  </div>`;
  return sendEmail(to, `New Marquee application: ${fullName}`, html);
}

// "Work with me" inquiry from a public profile → emailed to the profile owner.
// reply_to is set to the sender so the owner can just hit reply.
export async function sendContactNotification(to: string, opts: {
  profileName: string;
  username: string;
  senderName: string;
  senderEmail: string;
  intent?: string | null;
  message: string;
}) {
  const { profileName, username, senderName, senderEmail, intent, message } = opts;
  const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="margin:0;padding:0;background:#F7F6F2;">
    <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:Helvetica,Arial,sans-serif;color:#111111;">
      <div style="font-size:15px;font-weight:600;letter-spacing:0.25em;color:#111111;margin-bottom:28px;">MARQUEE</div>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">Hi ${esc(profileName.split(" ")[0] || profileName)},</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 20px;"><strong>${esc(senderName)}</strong> sent an inquiry through your Marquee profile${intent ? ` about <strong>${esc(intent)}</strong>` : ""}.</p>
      <div style="background:#FFFFFF;border:1px solid #E9E6DF;padding:18px 20px;margin:0 0 20px;">
        <p style="font-size:14px;line-height:1.6;margin:0 0 10px;color:#6E6A62;">From</p>
        <p style="font-size:15px;line-height:1.5;margin:0 0 14px;">${esc(senderName)} · <a href="mailto:${esc(senderEmail)}" style="color:#111111;">${esc(senderEmail)}</a></p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 10px;color:#6E6A62;">Message</p>
        <p style="font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${esc(message)}</p>
      </div>
      <p style="font-size:15px;line-height:1.5;margin:0 0 24px;">Just reply to this email to respond to ${esc(senderName)} directly.</p>
      <hr style="border:none;border-top:1px solid #E9E6DF;margin:0 0 16px;" />
      <p style="font-size:12px;line-height:1.5;color:#7d7a74;margin:0;">Sent from your profile at <a href="https://marquee.bio/${esc(username)}" style="color:#7d7a74;">marquee.bio/${esc(username)}</a></p>
    </div>
  </div>`;
  return sendEmail(to, `New inquiry from ${senderName} · your Marquee profile`, html, senderEmail);
}
