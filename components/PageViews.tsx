"use client";
// Tells Marquee a page was opened, once per page. No cookies. Signed-in members are noted so /admin can show usage.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function PageViews() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    (async () => {
      try {
        let member = "";
        try { const { data } = await createBrowserSupabase().auth.getSession(); member = data.session?.user?.id || ""; } catch { /* signed out */ }
        const body = JSON.stringify({ path, ref: document.referrer, member });
        if (!navigator.sendBeacon?.("/api/pv", new Blob([body], { type: "application/json" }))) await fetch("/api/pv", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      } catch { /* never break a page */ }
    })();
  }, [path]);
  return null;
}
