"use client";

import {
  Playfair_Display,
  DM_Sans,
  Inter,
  Inter_Tight,
  IBM_Plex_Sans,
  Manrope,
  Public_Sans,
  Plus_Jakarta_Sans,
  Work_Sans,
} from "next/font/google";

// Display — held constant so you can focus on body text
const display = Playfair_Display({ weight: "700", subsets: ["latin"] });

// Body candidates
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"] });
const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

const NAME = "Sarah Reilly Engel";
const HEADLINE =
  "I help early-stage B2C businesses build profitable growth systems from idea to $10M";
const PARAGRAPH =
  "I've spent a decade helping early-stage consumer brands find their growth wedge — from idea to $10M. Started in agency strategy, jumped into a Series A DTC role, then led growth for two consumer products through their break-out years. People call me when the product is working but no one can explain why it matters.";

interface BodyOptionProps {
  label: string;
  notes: string;
  bodyClass: string;
}

function BodySample({ label, notes, bodyClass }: BodyOptionProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-8 md:p-10 mb-6 shadow-sm">
      <div className="mb-6 pb-4 border-b border-border">
        <span
          className={`${bodyClass} text-xs font-semibold uppercase tracking-wider text-lav-dk`}
        >
          {label}
        </span>
        <p className={`${bodyClass} text-sm text-gray mt-1`}>{notes}</p>
      </div>

      {/* Masthead (locked — uppercase tracked sans in same font as body) */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <span className={`${bodyClass} text-[10px] uppercase tracking-[0.2em] text-gray-2 font-medium`}>
          Marquee · No. 2D8A
        </span>
        <span className={`${bodyClass} text-[10px] uppercase tracking-[0.2em] text-gray-2 font-medium`}>
          Brooklyn, NY
        </span>
      </div>

      {/* Name (locked — Playfair Bold) */}
      <h1 className={`${display.className} text-5xl leading-[0.95] tracking-tight mb-5`}>
        {NAME}
      </h1>

      {/* Headline — this is what changes */}
      <p className={`${bodyClass} text-xl md:text-2xl text-ink leading-snug mb-6 max-w-2xl`}>
        {HEADLINE}
      </p>

      {/* Section label */}
      <div className="mb-3">
        <span
          className={`${bodyClass} text-[11px] uppercase tracking-[0.15em] text-gray-2 font-semibold`}
        >
          Career Arc
        </span>
      </div>

      {/* Paragraph body */}
      <p className={`${bodyClass} text-base md:text-lg leading-[1.6] text-ink max-w-2xl`}>
        {PARAGRAPH}
      </p>

      {/* Small text + stat */}
      <div className="flex gap-3 mt-6">
        <div className="border border-border rounded-full px-3 py-1">
          <span className={`${bodyClass} text-xs text-gray font-medium`}>Full-time</span>
        </div>
        <div className="border border-border rounded-full px-3 py-1">
          <span className={`${bodyClass} text-xs text-gray font-medium`}>Open to right thing</span>
        </div>
        <div className="border border-border rounded-full px-3 py-1">
          <span className={`${bodyClass} text-xs text-gray font-medium`}>Remote</span>
        </div>
      </div>
    </div>
  );
}

export default function BodyTextPreview() {
  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <span className={`${dmSans.className} text-xs uppercase tracking-[0.3em] text-gray-2 mb-2 block`}>
          Body text preview
        </span>
        <h1 className={`${display.className} text-4xl md:text-5xl leading-tight mb-2`}>
          Pick a body font
        </h1>
        <p className={`${dmSans.className} text-gray text-base mb-8`}>
          Name display + masthead are locked. Each card swaps just the body sans —
          everything else (headline, paragraph, labels, badges) is in that same font.
        </p>

        <BodySample
          label="Option 1 — DM Sans (current)"
          notes="What you have now. Clean, neutral, slightly geometric. The one you said you liked."
          bodyClass={dmSans.className}
        />

        <BodySample
          label="Option 2 — IBM Plex Sans"
          notes="Bloomberg / financial feel. Slightly mechanical, very functional, lots of character at small sizes."
          bodyClass={plexSans.className}
        />

        <BodySample
          label="Option 3 — Inter"
          notes="The most-used sans on the web. Highly legible, totally neutral, slightly anonymous."
          bodyClass={inter.className}
        />

        <BodySample
          label="Option 4 — Inter Tight"
          notes="Inter's tighter cousin. Reads denser, more contemporary. Easy on long body paragraphs."
          bodyClass={interTight.className}
        />

        <BodySample
          label="Option 5 — Manrope"
          notes="Rounder, friendlier, warmer. Lower contrast — feels softer than Inter or DM Sans."
          bodyClass={manrope.className}
        />

        <BodySample
          label="Option 6 — Public Sans"
          notes="USWDS workhorse. Very neutral, slightly more humanist than Inter. Reads like a serious document."
          bodyClass={publicSans.className}
        />

        <BodySample
          label="Option 7 — Plus Jakarta Sans"
          notes="Geometric but warm. A little more personality than DM Sans, less than Manrope."
          bodyClass={jakarta.className}
        />

        <BodySample
          label="Option 8 — Work Sans"
          notes="Classic, slightly older feel. Very versatile, reads well at all sizes."
          bodyClass={workSans.className}
        />

        <div className={`${dmSans.className} text-sm text-gray-2 italic mt-8 text-center`}>
          Reply with a number and I&apos;ll lock it in everywhere.
        </div>
      </div>
    </div>
  );
}
