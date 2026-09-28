"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";

// Landing page for password-recovery links. The link carries a session in the URL hash;
// we set it explicitly (the PKCE-configured client won't pick it up on its own), then let
// the person choose a new password and send them into the builder.
export default function ResetPasswordPage() {
  const [ready, setReady] = useState<"loading" | "ok" | "invalid">("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    (async () => {
      const raw = window.location.hash.replace(/^#/, "");
      const p = new URLSearchParams(raw);
      const access_token = p.get("access_token");
      const refresh_token = p.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        window.history.replaceState(null, "", window.location.pathname);
        setReady(error ? "invalid" : "ok");
        return;
      }
      // No tokens in the URL — maybe already signed in (e.g. arrived via the handler).
      const { data } = await supabase.auth.getSession();
      setReady(data.session ? "ok" : "invalid");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("Those passwords don't match."); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { setError(error.message); return; }
    window.location.replace("/build-preview");
  }

  return (
    <div className="brand-body min-h-screen font-inter flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-brand-ink/10 p-8">
        <h1 className="font-sans text-2xl font-semibold text-brand-ink mb-1">Set a new password</h1>
        {ready === "loading" && <p className="text-brand-ink/60 text-sm">One moment…</p>}
        {ready === "invalid" && (
          <div className="text-sm text-brand-ink/70 space-y-3">
            <p>This link is invalid or has expired.</p>
            <p><Link href="/login" className="underline">Back to log in</Link> and click “Forgot password?” to get a fresh one.</p>
          </div>
        )}
        {ready === "ok" && (
          <form onSubmit={save} className="space-y-4 mt-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold tracking-wide text-brand-ink/70 mb-1">NEW PASSWORD</label>
              <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" className="w-full px-4 py-3 rounded-lg border border-brand-ink/15 focus:outline-none focus:border-brand-ink" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold tracking-wide text-brand-ink/70 mb-1">CONFIRM</label>
              <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Same again" className="w-full px-4 py-3 rounded-lg border border-brand-ink/15 focus:outline-none focus:border-brand-ink" />
            </div>
            {error && <div className="text-sm bg-brand-vermillion/10 text-brand-vermillion rounded-lg px-4 py-3">{error}</div>}
            <button type="submit" disabled={saving} className="w-full px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save and continue →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
