"use client";
// Tells Marquee a page was opened, once per page. No cookies.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageViews() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    try {
      const body = JSON.stringify({ path, ref: document.referrer });
      if (!navigator.sendBeacon?.("/api/pv", new Blob([body], { type: "application/json" }))) fetch("/api/pv", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => null);
    } catch { /* never break a page */ }
  }, [path]);
  return null;
}
