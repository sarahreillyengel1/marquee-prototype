"use client";

import { useState } from "react";
import Link from "next/link";
import WaitlistModal from "@/components/WaitlistModal";
import { IconInstagram } from "@/components/icons";

// Shared shell for the marketing pages — matches the v7 homepage nav + footer.
export default function BrandShell({
  children,
  source = "page",
}: {
  children: React.ReactNode;
  source?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-paper text-ink font-inter flex flex-col">
      {/* Nav — minimal, matches homepage */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-hair">
        <div className="max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)] py-[14px] flex items-center justify-between gap-4">
          <Link href="/" className="text-[16.5px] font-medium tracking-[0.26em]">MARQUEE</Link>
          <div className="flex gap-5 items-center">
            <Link href="/login" className="text-[13.5px] font-semibold whitespace-nowrap hover:text-dred transition-colors">Sign in</Link>
            <button onClick={() => setOpen(true)} className="px-5 py-[10px] rounded-full bg-red text-white text-[13.5px] font-semibold hover:bg-dred transition-colors whitespace-nowrap">Request early access</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer — ink, matches homepage */}
      <footer className="bg-white text-ink border-t border-hair pt-16 pb-9">
        <div className="max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]">
          <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="text-[16.5px] font-medium tracking-[0.26em] mb-[14px]">MARQUEE</div>
              <p className="text-[14.5px] text-ink/65 max-w-[300px]">The professional identity platform for human opportunity.</p>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.instagram.com/marquee.bio/" target="_blank" rel="noopener" aria-label="Instagram" className="w-[38px] h-[38px] rounded-full border border-hair hover:bg-ink hover:text-white hover:border-ink transition-colors flex items-center justify-center text-ink">
                  <IconInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
            <FooterCol title="Product" links={[
              { label: "What it is", href: "/#what" },
              { label: "How it works", href: "/#how" },
              { label: "Monetize", href: "/#earn" },
              { label: "Career Blueprint", href: "/#blueprint" },
              { label: "Pricing", href: "/#pricing" },
              { label: "For business", href: "/#business" },
            ]} />
            <FooterCol title="Company" links={[
              { label: "About", href: "/about" },
              { label: "Newsletter", href: "https://beknownweekly.substack.com/" },
              { label: "Contact", href: "mailto:hello@marquee.bio" },
            ]} />
          </div>
          <div className="mt-12 pt-[22px] border-t border-hair flex justify-between flex-wrap gap-[14px] text-[13px] text-ink/55">
            <span>© 2026 Marquee Identity, Inc.</span>
            <span><a href="#" className="hover:text-dred">Privacy</a> &nbsp;·&nbsp; <a href="#" className="hover:text-dred">Terms</a> &nbsp;·&nbsp; <Link href="/signup" className="hover:text-dred">Have a code? Sign in →</Link></span>
          </div>
        </div>
      </footer>

      <WaitlistModal open={open} onClose={() => setOpen(false)} source={source} />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink mb-[14px]">{title}</h4>
      <ul className="space-y-[9px]">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-[14.5px] text-ink/70 hover:text-dred transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
