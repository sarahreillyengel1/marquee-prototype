"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

// Finishes sign-in from any Supabase auth link (magic link / recovery) on whatever page it
// lands. The browser client is PKCE-configured and silently rejects implicit "#access_token"
// links, so we read the tokens from the URL ourselves and set the session explicitly, then
// send the person straight into the builder. Renders nothing.
export function AuthLinkHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/reset-password")) return; // that page handles its own link
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw.includes("access_token=")) return;
    // Password-recovery links: hand off to the reset page (hash intact) so they can choose a new password.
    if (new URLSearchParams(raw).get("type") === "recovery") { window.location.replace("/reset-password" + window.location.hash); return; }
    const p = new URLSearchParams(raw);
    const access_token = p.get("access_token");
    const refresh_token = p.get("refresh_token");
    if (!access_token || !refresh_token) return;
    const supabase = createBrowserSupabase();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) { console.error("auth link sign-in failed:", error.message); return; }
      window.history.replaceState(null, "", window.location.pathname);
      window.location.replace("/build-preview");
    });
  }, []);
  return null;
}
