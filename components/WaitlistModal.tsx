"use client";

import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  source?: string;
}

export default function WaitlistModal({ open, onClose, source = "landing" }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [role, setRole] = useState("");
  const [trap, setTrap] = useState(""); // hidden field; real people never fill it in
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName, linkedin, role, source, website_url: trap }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Couldn't save your spot");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your spot");
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-inter"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md p-8 md:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-brand-green flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-inter font-bold tracking-tight text-3xl mb-2 text-brand-ink">Request received.</h3>
            <p className="text-brand-ink/70 mb-6">
              We&apos;re opening the beta to a small group at a time. If you&apos;re a fit, we&apos;ll email you an invitation.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="font-inter font-bold tracking-tight text-3xl text-brand-ink mb-2">Apply for early access</h3>
              <p className="text-sm text-brand-ink/70 leading-relaxed">
                Our limited beta is opening soon. We&apos;re inviting a small group of professionals to help shape Marquee from the beginning. Apply below to request an invitation.
              </p>
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-dred mt-3">Beta officially starts 10/1</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <input type="text" name="website_url" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-brand-ink/60 mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white focus:outline-none focus:border-brand-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-brand-ink/60 mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white focus:outline-none focus:border-brand-ink transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-brand-ink/60 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white focus:outline-none focus:border-brand-ink transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-brand-ink/60 mb-1.5">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  required
                  placeholder="linkedin.com/in/you"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white focus:outline-none focus:border-brand-ink transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-brand-ink/60 mb-1.5">I am a…</label>
                <div className="flex gap-2">
                  {["Professional", "Recruiter", "Both"].map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-2.5 px-2 rounded-xl border text-sm font-medium transition-colors ${role === r ? "border-red bg-red/[0.06] text-red" : "border-brand-stone text-brand-ink/70 hover:border-brand-ink"}`}>{r}</button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-brand-vermillion text-sm bg-brand-vermillion/10 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 rounded-full bg-red text-white font-semibold hover:bg-dred transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Request early access"}
              </button>

              <p className="text-xs text-brand-ink/50 text-center">
                Have a beta code?{" "}
                <a href="/signup" className="underline hover:text-brand-ink">
                  Sign in here →
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
