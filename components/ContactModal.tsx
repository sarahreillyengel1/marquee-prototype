"use client";

import { useEffect, useState } from "react";

interface Props {
  username: string;
  recipientName: string;
  open: boolean;
  onClose: () => void;
}

const INTENTS = [
  { value: "hiring", label: "Hiring" },
  { value: "project", label: "Project / Fractional" },
  { value: "speaking", label: "Speaking" },
  { value: "collab", label: "Collaboration" },
  { value: "other", label: "Other" },
];

export default function ContactModal({
  username,
  recipientName,
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [intent, setIntent] = useState("hiring");
  const [message, setMessage] = useState("");
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          sender_name: name,
          sender_email: email,
          sender_company: company,
          intent,
          message,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to send");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    }
    setSubmitting(false);
  };

  const firstName = recipientName.split(" ")[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-mint-lt flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-mint-dk">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-2xl mb-2">Message sent</h3>
            <p className="text-gray mb-6">
              {firstName} will see your note in their Marquee inbox.
            </p>
            <button
              onClick={onClose}
              className="btn-pill btn-primary px-8 py-3"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-2">
                    Get in touch
                  </span>
                  <h3 className="font-sans font-bold text-2xl mt-1">
                    Reach out to {firstName}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full hover:bg-cream transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-2 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={200}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:border-lav-mid"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-2 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={200}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:border-lav-mid"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-2 mb-1.5">
                  Company <span className="text-gray-2 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:border-lav-mid"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-2 mb-1.5">
                  What brings you here?
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIntent(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        intent === opt.value
                          ? "bg-ink text-white"
                          : "bg-white border border-border text-gray hover:border-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-2 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder={`Hi ${firstName}, I saw your Marquee and...`}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-lav-mid resize-none"
                />
                <p className="text-xs text-gray-2 mt-1">
                  {message.length} / 2000
                </p>
              </div>

              {error && (
                <div className="text-coral text-sm bg-coral-lt rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-pill btn-primary disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send message"}
              </button>

              <p className="text-xs text-gray-2 text-center">
                {firstName} will see your message in their Marquee inbox.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
