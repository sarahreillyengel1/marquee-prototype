"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WaitlistModal from "@/components/WaitlistModal";
import {
  IconBeSeen,
  IconTellYourStory,
  IconConnections,
  IconControl,
  IconAssessment,
  IconDiscovery,
  IconBlueprint,
  IconLinkedIn,
  IconX,
  IconInstagram,
  GeometricM,
} from "@/components/icons";

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="brand-body min-h-screen font-inter">
      {/* ── NAV ── */}
      <nav className="px-8 md:px-16 py-6 flex items-center justify-between max-w-[1400px] mx-auto">
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
          onClick={() => setWaitlistOpen(true)}
          className="px-6 py-3 rounded-full bg-brand-ink text-white text-sm font-medium hover:bg-brand-ink/90 transition-colors"
        >
          Join the Waitlist
        </button>
      </nav>

      {/* ── HERO (white bg) ── */}
      <section className="bg-white">
        <div className="px-8 md:px-16 pt-4 max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-0 items-end relative">
            {/* Left: copy. */}
            <div className="order-2 md:order-1 pb-12 md:pb-20 pr-0 md:pr-8">
              <h1 className="font-canela text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-brand-ink tracking-[-0.02em]">
                Your work<br />
                deserves the<br />
                spotlight.
              </h1>
              <p className="text-base md:text-lg text-brand-ink/70 leading-relaxed mt-7 max-w-md">
                Marquee is the first personal brand platform for your professional story.
              </p>
              <button
                onClick={() => setWaitlistOpen(true)}
                className="mt-9 px-8 py-3.5 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
              >
                Join the Waitlist
              </button>
            </div>

            {/* Right column — square aspect. M + photo treated as one graphic:
                same overflow-hidden container, same absolute fill, share the exact
                same bottom edge. Container fills full grid column width. */}
            <div
              className="order-1 md:order-2 relative aspect-square w-full block"
              style={{ overflow: "hidden", border: 0, outline: 0, lineHeight: 0 }}
            >
              <GeometricM
                className="absolute inset-0 w-full h-full"
                color="#C7B5FF"
              />
              <Image
                src="/images/marquee-hero.png"
                alt="Marquee — professional"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "center -8%", border: 0, display: "block" }}
                priority
              />
            </div>

            {/* Script — positioned at grid level, over the M's left side */}
            <div
              className="absolute z-20 pointer-events-none hidden md:block"
              style={{ left: "44%", bottom: "30%", transform: "rotate(-6deg)" }}
            >
              <p
                className="font-caveat text-5xl lg:text-6xl leading-[0.95] whitespace-nowrap"
                style={{ color: "#7C3AED" }}
              >
                <span className="block">Be known.</span>
                <span className="block ml-3">Not filtered.</span>
              </p>
              <svg
                width="280"
                height="18"
                viewBox="0 0 280 18"
                fill="none"
                className="ml-4 mt-1"
              >
                <path
                  d="M5 11 Q 75 3, 140 9 T 275 7"
                  stroke="#7C3AED"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR HUMANS ── */}
      <section className="px-8 md:px-16 py-16 md:py-20 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="font-canela text-4xl md:text-5xl leading-[1.05] text-brand-ink tracking-[-0.01em]">
              Built for Humans
            </h2>
            <div className="mt-8 space-y-5 max-w-md text-base text-brand-ink/80 leading-relaxed">
              <p>
                Let&apos;s be honest: traditional resumes are quickly becoming a relic of the past, and existing professional networks often feel more like performance than substance. Neither captures who you are, how you lead, or the story behind your work.
              </p>
              <p>
                Marquee helps you create a dynamic, shareable profile that showcases your experience, leadership, values, impact, skills, and story—all in one place.
              </p>
            </div>
          </div>

          {/* 2x2 feature grid — vertically centered with the left column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            <FeatureCard
              icon={<IconBeSeen className="w-7 h-7" />}
              title="Be Seen For Your Work"
              body="Showcase what you do and the impact you make."
            />
            <FeatureCard
              icon={<IconTellYourStory className="w-7 h-7" />}
              title="Tell Your Story"
              body="Go beyond job titles and create a richer professional narrative."
            />
            <FeatureCard
              icon={<IconConnections className="w-7 h-7" />}
              title="Build Meaningful Connections"
              body="Connect through shared interests, values, and expertise."
            />
            <FeatureCard
              icon={<IconControl className="w-7 h-7" />}
              title="You're In Control"
              body="Choose what you share and who can see it."
            />
          </div>
        </div>
      </section>

      {/* ── PASSION CAREER ASSESSMENT ── */}
      <section className="bg-brand-lavender/30 px-8 md:px-16 py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="font-canela text-4xl md:text-5xl leading-[1.05] text-brand-ink tracking-[-0.01em]">
              Take the Passion<br />
              Career Assessment
            </h2>
            <p className="font-caveat text-2xl md:text-3xl mt-3 leading-snug" style={{ color: "#7C3AED" }}>
              and receive your 30-Day Blueprint
              <svg
                width="280"
                height="12"
                viewBox="0 0 280 12"
                fill="none"
                className="mt-0.5"
              >
                <path
                  d="M5 7 Q 70 2, 140 6 T 275 5"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
            <div className="mt-8 space-y-4 max-w-md text-base text-brand-ink/80 leading-relaxed">
              <p>Most career advice starts with the job. This starts with you.</p>
              <p>
                Uncover your purpose, skills, goals, and values, and we&apos;ll translate what you love into a clear direction and a plan.
              </p>
            </div>
            <Link
              href="/assessment"
              className="inline-block mt-10 px-8 py-3.5 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors"
            >
              Take the Free Assessment
            </Link>
          </div>

          {/* 3-step cards — wider grid, evenly spaced */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StepCard
              icon={<IconAssessment className="w-6 h-6" />}
              title="Start the Assessment"
              body="35 insightful questions designed to map your unique passions, values, and strengths."
              progress={1}
            />
            <StepCard
              icon={<IconDiscovery className="w-6 h-6" />}
              title="The Discovery"
              body="Uncover your true purpose, drivers, and goals."
              progress={2}
            />
            <StepCard
              icon={<IconBlueprint className="w-6 h-6" />}
              title="Your 30-Day Blueprint"
              body="A personalized roadmap highlighting your unique opportunities, complete with a practical 30-day action plan."
              progress={3}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
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
            { label: "Contact", href: "/contact" },
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

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} source="landing" />
    </div>
  );
}

/* ── Sub-components ── */

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-5 items-start">
      <div className="shrink-0 w-14 h-14 rounded-full bg-brand-green flex items-center justify-center text-brand-ink mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-canela text-xl text-brand-ink leading-tight mb-2 min-h-[3rem]">
          {title}
        </h3>
        <p className="text-sm text-brand-ink/70 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function StepCard({
  icon,
  title,
  body,
  progress,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  progress: 1 | 2 | 3;
}) {
  return (
    <div className="bg-white rounded-2xl p-7 flex flex-col min-h-[320px]">
      <div className="w-11 h-11 rounded-full bg-brand-lavender/40 flex items-center justify-center text-brand-ink mb-6">
        {icon}
      </div>
      <h3 className="font-canela text-2xl text-brand-ink leading-tight mb-3">
        {title}
      </h3>
      <p className="text-sm text-brand-ink/70 leading-relaxed flex-1">{body}</p>
      <div className="mt-6">
        <div className="h-1 w-full bg-brand-stone rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-green rounded-full transition-all"
            style={{ width: `${(progress / 3) * 100}%` }}
          />
        </div>
        <span className="block mt-2 text-xs text-brand-ink/60">
          Step {progress} of 3
        </span>
      </div>
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
