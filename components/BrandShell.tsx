"use client";

import { useState } from "react";
import Link from "next/link";
import WaitlistModal from "@/components/WaitlistModal";
import { IconLinkedIn, IconX, IconInstagram } from "@/components/icons";

// Shared shell for the marketing pages — matches the landing page nav + footer.
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
      {/* Nav — matches landing */}
      <nav className="px-8 md:px-16 py-6 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <Link href="/" className="wordmark text-lg text-brand-ink">
          MARQUEE
        </Link>
        <div className="hidden md:flex items-center gap-16">
          <Link href="/product" className="text-sm text-brand-ink hover:opacity-60 transition-opacity">
            Product
          </Link>
          <Link href="/pricing" className="text-sm text-brand-ink hover:opacity-60 transition-opacity">
            Pricing
          </Link>
          <Link href="/resources" className="text-sm text-brand-ink hover:opacity-60 transition-opacity">
            Resources
          </Link>
          <Link href="/about" className="text-sm text-brand-ink hover:opacity-60 transition-opacity">
            About
          </Link>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-full bg-brand-ink text-white text-sm font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Join the Waitlist
        </button>
      </nav>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 pt-4 md:pt-8 pb-16 md:pb-24">
        {children}
      </main>

      {/* Footer — matches landing */}
      <footer className="bg-brand-ink text-white px-8 md:px-16 py-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="wordmark text-lg">MARQUEE</div>
            <p className="text-sm text-white/70 mt-3 max-w-xs">
              Personal brand platform for professionals.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                <IconLinkedIn className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                <IconX className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                <IconInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>
          <FooterCol title="Product" links={[
            { label: "How It Works", href: "/product" },
            { label: "Pricing", href: "/pricing" },
            { label: "Career Assessment", href: "/assessment" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/about" },
          ]} />
          <FooterCol title="Resources" links={[
            { label: "FAQ", href: "/resources" },
            { label: "Help Center", href: "/resources" },
          ]} />
        </div>
        <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>© 2026 Marquee</span>
          <Link href="/signup" className="hover:text-white transition-colors">
            Have a beta code? Sign in →
          </Link>
        </div>
      </footer>

      <WaitlistModal open={open} onClose={() => setOpen(false)} source={source} />
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
