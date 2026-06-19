"use client";

import { useState } from "react";
import Link from "next/link";
import WaitlistModal from "@/components/WaitlistModal";

// Shared shell for placeholder marketing pages — keeps nav + footer consistent.
export default function BrandShell({
  children,
  source = "page",
}: {
  children: React.ReactNode;
  source?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="brand-body min-h-screen font-inter flex flex-col">
      <nav className="px-8 md:px-16 py-6 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <Link href="/" className="wordmark text-lg text-brand-ink">
          MARQUEE
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <Link href="/product" className="text-sm text-brand-ink hover:opacity-60">
            Product
          </Link>
          <Link href="/pricing" className="text-sm text-brand-ink hover:opacity-60">
            Pricing
          </Link>
          <Link href="/resources" className="text-sm text-brand-ink hover:opacity-60">
            Resources
          </Link>
          <Link href="/about" className="text-sm text-brand-ink hover:opacity-60">
            About
          </Link>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-full bg-brand-ink text-white text-sm font-medium hover:bg-brand-ink/90"
        >
          Join the Waitlist
        </button>
      </nav>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 py-16 md:py-24">
        {children}
      </main>

      <footer className="bg-brand-ink text-white px-8 md:px-16 py-10 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="wordmark text-base">MARQUEE</div>
          <Link href="/signup" className="text-white/60 hover:text-white">
            Have a beta code? Sign in →
          </Link>
        </div>
      </footer>

      <WaitlistModal open={open} onClose={() => setOpen(false)} source={source} />
    </div>
  );
}
