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
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName, source }),
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
            <h3 className="font-canela text-3xl mb-2 text-brand-ink">You&apos;re on the list.</h3>
            <p className="text-brand-ink/70 mb-6">
              We&apos;ll be in touch as soon as your spot opens.
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
              <h3 className="font-canela text-3xl text-brand-ink mb-2">Join the Waitlist</h3>
              <p className="text-sm text-brand-ink/70">
                We&apos;ll email you the moment a spot opens.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
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

              {error && (
                <div className="text-brand-vermillion text-sm bg-brand-vermillion/10 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Joining…" : "Join the Waitlist"}
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
