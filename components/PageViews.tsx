"use client";
// Tells Marquee a page was opened, once per page, and only after the visitor does something a person does:
// moves the mouse, scrolls, touches the screen or presses a key. A crawler that renders the page and leaves is not counted.
// No cookies. Signed-in members are noted so /admin can show usage.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

const SIGNALS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

export default function PageViews() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return; // a browser driven by automation
    let sent = false;
    const off = () => SIGNALS.forEach((e) => window.removeEventListener(e, send));
    async function send() {
      if (sent) return;
      sent = true;
      off();
      try {
        let member = "";
        try { const { data } = await createBrowserSupabase().auth.getSession(); member = data.session?.user?.id || ""; } catch { /* signed out */ }
        const body = JSON.stringify({ path, ref: document.referrer, member });
        if (!navigator.sendBeacon?.("/api/pv", new Blob([body], { type: "application/json" }))) await fetch("/api/pv", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      } catch { /* never break a page */ }
    }
    SIGNALS.forEach((e) => window.addEventListener(e, send, { passive: true }));
    return off;
  }, [path]);
  return null;
}
