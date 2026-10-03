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

export const emailReady = () => !!process.env.RESEND_API_KEY;

type Attachment = { filename: string; content: string; content_type?: string }; // content is base64

async function sendEmail(to: string, subject: string, html: string, replyTo?: string, attachments?: Attachment[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true as const }; // not configured yet
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}), ...(attachments?.length ? { attachments } : {}) }),
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


/* ─────────────── Booking and request emails ───────────────
   Every email goes to BOTH sides: the visitor gets a confirmation, the profile owner gets
   the same facts with the visitor's details. Bookings carry a calendar invite (.ics) that
   works in Google, Outlook and Apple Calendar without anyone connecting a calendar.
   Copy is plain on purpose; the final wording and design are Sarah's to set in Resend. */

const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const row = (label: string, value: string) => value ? `<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6E6A62;margin:0 0 3px;">${esc(label)}</p><p style="font-size:15px;line-height:1.5;margin:0 0 14px;">${value}</p>` : "";
const button = (href: string, label: string) => `<a href="${esc(href)}" style="display:inline-block;background:#111111;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;">${esc(label)}</a>`;
const shell = (body: string, foot: string) => `
  <div style="margin:0;padding:0;background:#F7F6F2;">
    <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:Helvetica,Arial,sans-serif;color:#111111;">
      <div style="font-size:15px;font-weight:600;letter-spacing:0.25em;color:#111111;margin-bottom:28px;">MARQUEE</div>
      ${body}
      <hr style="border:none;border-top:1px solid #E9E6DF;margin:26px 0 16px;" />
      <p style="font-size:12px;line-height:1.5;color:#7d7a74;margin:0;">${foot}</p>
    </div>
  </div>`;
const p = (html: string) => `<p style="font-size:16px;line-height:1.5;margin:0 0 16px;">${html}</p>`;
const card = (html: string) => `<div style="background:#FFFFFF;border:1px solid #E9E6DF;padding:18px 20px 6px;margin:0 0 20px;">${html}</div>`;

export interface BookingMail {
  ownerName: string; ownerEmail: string; username: string;
  visitorName: string; visitorEmail: string; visitorNote?: string | null;
  offerTitle: string;
  whenForVisitor: string;   // in the visitor's timezone
  whenForOwner: string;     // in the owner's timezone
  meetingLink?: string;
  paid?: string;            // "$150" when the visitor paid
  manageUrl: string;        // visitor's link to cancel
  ics: string;              // calendar invite
}
const invite = (ics: string, name = "invite.ics"): Attachment[] => [{ filename: name, content: Buffer.from(ics, "utf8").toString("base64"), content_type: "text/calendar; charset=utf-8; method=REQUEST" }];
const first = (n: string) => { const f = (n || "").trim().split(/\s+/)[0] || n; return f ? f[0].toUpperCase() + f.slice(1) : f; }; // "sarah" -> "Sarah"

/** Booking confirmed — one email to the visitor, one to the owner. */
export async function sendBookingConfirmed(m: BookingMail) {
  const join = m.meetingLink ? row("Where", `<a href="${esc(m.meetingLink)}" style="color:#111111;">${esc(m.meetingLink)}</a>`) : row("Where", `${esc(first(m.ownerName))} will send the call link.`);
  const toVisitor = shell(
    p(`Hi ${esc(first(m.visitorName))},`) + p(`You're booked with <strong>${esc(m.ownerName)}</strong>.`) +
    card(row("Session", esc(m.offerTitle)) + row("When", esc(m.whenForVisitor)) + join + (m.paid ? row("Paid", esc(m.paid)) : "")) +
    p("The calendar invite is attached. Need to change plans? Use the link below.") + button(m.manageUrl, "Manage booking"),
    `Booked through <a href="https://marquee.bio/${esc(m.username)}" style="color:#7d7a74;">marquee.bio/${esc(m.username)}</a>`);
  const toOwner = shell(
    p(`Hi ${esc(first(m.ownerName))},`) + p(`<strong>${esc(m.visitorName)}</strong> booked a session with you.`) +
    card(row("Session", esc(m.offerTitle)) + row("When", esc(m.whenForOwner)) + row("With", `${esc(m.visitorName)} · <a href="mailto:${esc(m.visitorEmail)}" style="color:#111111;">${esc(m.visitorEmail)}</a>`) + (m.visitorNote ? row("What they want to cover", esc(m.visitorNote).replace(/\n/g, "<br />")) : "") + join + (m.paid ? row("Paid", esc(m.paid)) : "")) +
    p("The calendar invite is attached. Reply to this email to reach them directly."),
    `From your profile at <a href="https://marquee.bio/${esc(m.username)}" style="color:#7d7a74;">marquee.bio/${esc(m.username)}</a>`);
  const [a, b] = await Promise.all([
    sendEmail(m.visitorEmail, `Booked: ${m.offerTitle} with ${m.ownerName}`, toVisitor, m.ownerEmail, invite(m.ics)),
    sendEmail(m.ownerEmail, `New booking: ${m.visitorName} · ${m.offerTitle}`, toOwner, m.visitorEmail, invite(m.ics)),
  ]);
  return { visitor: a, owner: b };
}

/** Booking cancelled — both sides are told, and the invite is withdrawn. */
export async function sendBookingCancelled(m: BookingMail & { cancelledBy: "visitor" | "owner"; refunded?: string }) {
  const who = m.cancelledBy === "visitor" ? m.visitorName : m.ownerName;
  const facts = card(row("Session", esc(m.offerTitle)) + row("Was", esc(m.whenForVisitor)) + (m.refunded ? row("Refunded", esc(m.refunded)) : ""));
  const factsOwner = card(row("Session", esc(m.offerTitle)) + row("Was", esc(m.whenForOwner)) + row("With", esc(m.visitorName)) + (m.refunded ? row("Refunded", esc(m.refunded)) : ""));
  const cancel = [{ ...invite(m.ics, "cancelled.ics")[0], content_type: "text/calendar; charset=utf-8; method=CANCEL" }];
  const [a, b] = await Promise.all([
    sendEmail(m.visitorEmail, `Cancelled: ${m.offerTitle} with ${m.ownerName}`, shell(p(`Hi ${esc(first(m.visitorName))},`) + p(`This session was cancelled by ${esc(who)}.`) + facts + button(`https://marquee.bio/${m.username}`, "Book another time"), "Sent by Marquee"), m.ownerEmail, cancel),
    sendEmail(m.ownerEmail, `Cancelled: ${m.visitorName} · ${m.offerTitle}`, shell(p(`Hi ${esc(first(m.ownerName))},`) + p(`This session was cancelled by ${esc(who)}. The time is open again.`) + factsOwner, "Sent by Marquee"), m.visitorEmail, cancel),
  ]);
  return { visitor: a, owner: b };
}

/** Reminder the day before — both sides. */
export async function sendBookingReminder(m: BookingMail) {
  const join = m.meetingLink ? row("Where", `<a href="${esc(m.meetingLink)}" style="color:#111111;">${esc(m.meetingLink)}</a>`) : "";
  const [a, b] = await Promise.all([
    sendEmail(m.visitorEmail, `Reminder: ${m.offerTitle} with ${m.ownerName}`, shell(p(`Hi ${esc(first(m.visitorName))},`) + p(`Your session with <strong>${esc(m.ownerName)}</strong> is coming up.`) + card(row("When", esc(m.whenForVisitor)) + join) + button(m.manageUrl, "Manage booking"), "Sent by Marquee"), m.ownerEmail),
    sendEmail(m.ownerEmail, `Reminder: ${m.visitorName} · ${m.offerTitle}`, shell(p(`Hi ${esc(first(m.ownerName))},`) + p(`Your session with <strong>${esc(m.visitorName)}</strong> is coming up.`) + card(row("When", esc(m.whenForOwner)) + join), "Sent by Marquee"), m.visitorEmail),
  ]);
  return { visitor: a, owner: b };
}

/** "Send request" — the owner gets the request (reply goes to the visitor); the visitor gets a copy. */
export async function sendRequestEmails(m: { ownerName: string; ownerEmail: string; username: string; visitorName: string; visitorEmail: string; offerTitle: string; message: string }) {
  const msg = esc(m.message).replace(/\n/g, "<br />");
  const [a, b] = await Promise.all([
    sendEmail(m.ownerEmail, `New request: ${m.visitorName} · ${m.offerTitle}`, shell(p(`Hi ${esc(first(m.ownerName))},`) + p(`<strong>${esc(m.visitorName)}</strong> sent you a request.`) + card(row("About", esc(m.offerTitle)) + row("From", `${esc(m.visitorName)} · <a href="mailto:${esc(m.visitorEmail)}" style="color:#111111;">${esc(m.visitorEmail)}</a>`) + row("Message", msg)) + p("Reply to this email to answer them directly."), `From your profile at <a href="https://marquee.bio/${esc(m.username)}" style="color:#7d7a74;">marquee.bio/${esc(m.username)}</a>`), m.visitorEmail),
    sendEmail(m.visitorEmail, `Your request to ${m.ownerName} was sent`, shell(p(`Hi ${esc(first(m.visitorName))},`) + p(`Your request went to <strong>${esc(m.ownerName)}</strong>. They will reply to you by email.`) + card(row("About", esc(m.offerTitle)) + row("Your message", msg)), "Sent by Marquee"), m.ownerEmail),
  ]);
  return { owner: a, visitor: b };
}


/* ─────────────── Pricing page emails ─────────────── */

/** "Remind Me" — confirms we have their email and says what happens next. */
export async function sendReminderConfirmation(to: string, about: "pro" | "founding") {
  const body = about === "pro"
    ? p("You asked us to remind you when <strong>Marquee Pro</strong> opens.") + p("We will email you on December 1 with your link to join.") + p("Want in sooner? Founding Member sign-up is open now. Access is limited.") + button("https://marquee.bio/join", "Become a Founding Member")
    : p("You asked about <strong>Founding Member</strong> sign-up.") + p("We will email you the moment it opens, with your link to join.");
  return sendEmail(to, about === "pro" ? "We'll remind you when Marquee Pro opens" : "We'll tell you when Founding Member sign-up opens", shell(p("Hi there,") + body, "Sent by Marquee"));
}

/* ─────────────── Welcome ───────────────
   One welcome email, the same words for everyone who joins the beta, from Sarah.
   Paid: sent when the payment lands; the button finishes setting up the account.
   Invite code: sent when the account is created; the button opens the builder.
   The wording is Sarah's. Change it only on her say-so. */

// The footer on emails to members: who we are and where to find us. No address, no "why you got this" line (Sarah, 2 Oct 2026).
const memberFoot = `Marquee Identity, Inc. &middot; <a href="https://marquee.bio" style="color:#7d7a74;">marquee.bio</a> &middot; <a href="https://www.instagram.com/marquee.bio/" style="color:#7d7a74;">Instagram</a> &middot; <a href="mailto:hello@marquee.bio" style="color:#7d7a74;">hello@marquee.bio</a>`;
const preheader = (t: string) => `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(t)}</div>`;
const wineButton = (href: string, label: string) => `<a href="${esc(href)}" style="display:inline-block;background:#670821;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;">${esc(label)} &rarr;</a>`;

async function sendWelcome(to: string, firstName: string, buildUrl: string) {
  const name = first(firstName || "");
  const html = `
  <div style="margin:0;padding:0;background:#F7F6F2;">${preheader("Your Marquee is ready.")}
    <div style="max-width:560px;margin:0 auto;padding:36px 20px 40px;font-family:Helvetica,Arial,sans-serif;color:#111111;">
      <div style="font-size:15px;font-weight:600;letter-spacing:0.25em;color:#111111;margin:0 8px 22px;">MARQUEE</div>
      <div style="background:#670821;padding:38px 32px 34px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.05;color:#FFFFFF;margin:0;">Welcome.</div>
      </div>
      <div style="background:#FFFFFF;border:1px solid #E9E6DF;border-top:none;padding:30px 32px 30px;">
        ${p(`Hi ${name ? esc(name) : "there"},`)}
        ${p("Welcome to Marquee. We&rsquo;re so happy to have you join us as a Founding Member.")}
        ${p("We created Marquee to help professionals capture the value of their knowledge and expertise &mdash; and turn it into more ways to be discovered, hired, booked and paid.")}
        <div style="margin:24px 0 28px;">${wineButton(buildUrl, "Build your Marquee")}</div>
        ${p("Once you&rsquo;re verified, we&rsquo;ll send you a Getting Started Guide with everything you need to get set up.")}
        ${p("As you build and explore, hit reply anytime with feedback, ideas or questions. Your input will help shape Marquee from the beginning.")}
        <p style="font-size:16px;line-height:1.5;margin:22px 0 0;">Sarah</p>
        <p style="font-size:13.5px;line-height:1.5;margin:2px 0 0;color:#6E6A62;">Founder &amp; CEO, Marquee</p>
      </div>
      <p style="font-size:12px;line-height:1.6;color:#7d7a74;margin:18px 8px 0;">${memberFoot}</p>
    </div>
  </div>`;
  return sendEmail(to, "Welcome to Marquee", html, "sarah@marquee.bio");
}

/** Paid: the payment has landed. The button finishes setting up the account, then opens the builder. */
export async function sendMembershipWelcome(to: string, _plan: string, finishUrl: string, firstName = "") {
  return sendWelcome(to, firstName, finishUrl);
}

/** Invite code: the account now exists. */
export async function sendBetaWelcome(to: string, firstName: string) {
  return sendWelcome(to, firstName, "https://marquee.bio/build-preview");
}

/** Sent when the Marquee team has checked a new member: the Getting Started guide. */
export async function sendGettingStarted(to: string, firstName: string) {
  const name = first(firstName || "");
  return sendEmail(to, "Your Marquee Getting Started Guide", shell(
    (name ? p(`${esc(name)},`) : "") +
    p("Your account has been verified and your Getting Started Guide is ready.") +
    p("Inside, you&rsquo;ll find everything you need to build your profile and get the most out of Marquee.") +
    `<div style="margin:22px 0 24px;">${wineButton("https://marquee.bio/getting-started.pdf", "Open the guide")}</div>` +
    p("I&rsquo;ll also reach out shortly to offer some one-on-one help getting your Marquee set up. In the meantime, feel free to jump in and start exploring.") +
    `<p style="font-size:16px;line-height:1.5;margin:22px 0 0;">Sarah</p><p style="font-size:13.5px;line-height:1.5;margin:2px 0 0;color:#6E6A62;">Founder &amp; CEO, Marquee</p>`, memberFoot), "sarah@marquee.bio");
}

/** Forgot password: the link to choose a new one. */
export async function sendPasswordReset(to: string, link: string) {
  return sendEmail(to, "Reset your Marquee password", shell(
    `<p style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;margin:0 0 16px;">Reset your Marquee password</p>` +
    p("We received a request to reset the password for your Marquee account.") +
    `<div style="margin:22px 0 24px;">${button(link, "Reset my password")}</div>` +
    `<p style="font-size:14px;line-height:1.55;margin:0;color:#6E6A62;">This link can only be used once and expires in one hour. If you didn&rsquo;t request a password reset, you can ignore this email.</p>`, memberFoot));
}


/* ─────────────── Beta contact form ─────────────── */

/** A member's note from inside the product, sent to the Marquee team. Reply goes to the member. */
export async function sendBetaFeedback(m: { kind: string; message: string; page?: string; name: string; email: string; founding: boolean }) {
  const to = process.env.BETA_INBOX || "sarah@marquee.bio";
  const who = m.name ? `${m.name} (${m.email})` : m.email;
  return sendEmail(to, `[Marquee beta] ${m.kind} · ${m.name || m.email}`, shell(
    p(`<strong>${esc(m.kind)}</strong> from ${esc(who)}${m.founding ? " · Founding Member" : ""}`) +
    card(row("Message", esc(m.message).replace(/\n/g, "<br />")) + (m.page ? row("Sent from", esc(m.page)) : "")) +
    p("Reply to this email to answer them directly."), "Sent from the beta contact form"), m.email);
}
