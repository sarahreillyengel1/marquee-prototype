// MARQUEE BRAND TOKENS — LOCKED 2026-05-31
//
// Source of truth for the visual system. Update this file ONLY when the
// brand guide changes. All Tailwind/CSS values should reference these.
//
// Apply progression:
//   Phase 1 — Landing page rebuild (uses these tokens for the first time)
//   Phase 2 — Re-skin every existing screen (signup, onboarding, profile, dashboard) using these tokens
//
// Not yet applied to globals.css / tailwind.config.ts — those are still
// running the old DM Sans + cream/lavender-mid palette until the rollout begins.

// ────────────────────────────────────────────────────────────
// COLOR SYSTEM
// ────────────────────────────────────────────────────────────

// From BRAND.md (Brand Essentials). Source of truth. Square 0px, white backgrounds.
export const colors = {
  // Foundation
  ink: "#111111",
  paper: "#FFFFFF",
  white: "#F7F7F8",
  stone: "#E6E2D0",
  taupe: "#DBCDC4",
  // Brand
  crimson: "#B21E2F",
  wine: "#670821",
  purple: "#C7B5EE",
  sky: "#C0DDFB",
  blue: "#1F3BC4",
  // Accent
  citron: "#D6E27B",
  blush: "#F8C3FF",
  sage: "#73926A",
  mint: "#B9E3A5",
  orange: "#FF5436",
  // Legacy aliases → new hexes (keep existing references working)
  lavender: "#C7B5EE",
  vermillion: "#FF5436",
  softGreen: "#B9E3A5",
} as const;

// ────────────────────────────────────────────────────────────
// PILL SEMANTICS — work status uses meaningful color mapping
// ────────────────────────────────────────────────────────────

export const pillColors: Record<string, { bg: string; text: string; border: string }> = {
  advisory:    { bg: colors.lavender,  text: colors.ink, border: colors.lavender },
  fractional:  { bg: colors.sky,       text: colors.ink, border: colors.sky },
  project:     { bg: colors.softGreen, text: colors.ink, border: colors.softGreen },
  fulltime:    { bg: colors.citron,    text: colors.ink, border: colors.citron },
  neutral:     { bg: colors.stone,     text: colors.ink, border: colors.stone },
};

// ────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ────────────────────────────────────────────────────────────

export const fonts = {
  // Editorial / Display / Names — Canela Regular (PAID font — license pending)
  // Fallback chain until Canela files arrive: Fraunces is the closest free match.
  display: {
    family: "Canela, Fraunces, Georgia, serif",
    weights: { regular: 400 },
    cssVar: "--font-canela",
  },

  // UI / Navigation / Body — Inter (free, Google Fonts)
  body: {
    family: "Inter, system-ui, -apple-system, sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    cssVar: "--font-inter",
  },

  // Handwritten — "Be known. Not filtered." signature element
  // Specific Google Font TBD — pending approval
  script: {
    family: "TBD-Caveat-or-similar",
    cssVar: "--font-script",
  },

  // Wordmark — for the "MARQUEE" logo in tracking
  wordmark: {
    family: "Inter",
    weight: 500,
    tracking: "0.25em", // +250 tracking from brand guide
  },
} as const;

// ────────────────────────────────────────────────────────────
// LOGOS & BRAND MARKS
// ────────────────────────────────────────────────────────────

export const marks = {
  primaryWordmark: "MARQUEE",      // Inter Medium, tracking +250
  editorialWordmark: "marquee",    // Canela Regular, lowercase
  appIcon: "m",                    // Canela Regular on ink background

  // Geometric M — solid lavender M shape; usage: behind portraits, hero bg, social cards, section backdrops
  // Signal M — dotted/pixel M pattern; usage: decorative signal, loading states, brand texture, small UI accents
  // Both available in: lavender, ink (black), vermillion, sky (blue variants in brand guide)
};

// ────────────────────────────────────────────────────────────
// BUTTONS
// ────────────────────────────────────────────────────────────

export const buttons = {
  primary: {
    bg: colors.ink,
    text: "#FFFFFF",
    radius: "9999px", // full pill
  },
  secondary: {
    bg: "transparent",
    text: colors.ink,
    border: colors.ink,
    radius: "9999px",
  },
  textLink: {
    text: colors.ink,
    underlineOnHover: true,
    arrowOnHover: "→",
  },
};

// ────────────────────────────────────────────────────────────
// ICONOGRAPHY
// ────────────────────────────────────────────────────────────

export const iconStyle = {
  stroke: 2,            // 2px stroke
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  // Container: soft-green circle background, dark icon centered
  containerBg: colors.softGreen,
  iconColor: colors.ink,
};

// Reserved icon names from brand guide section 05
// No source SVGs provided — must be drawn as inline SVG when needed.
export const iconNames = [
  "be-seen",        // eye — product icon
  "tell-your-story", // sparkle — product icon
  "connections",    // people — product icon
  "control",        // lock — product icon
  "assessment",     // clipboard — assessment icon
  "discovery",      // light bulb — assessment icon
  "blueprint",      // flag — assessment icon
] as const;

// ────────────────────────────────────────────────────────────
// PROGRESS / FEEDBACK
// ────────────────────────────────────────────────────────────

export const progress = {
  trackColor: colors.stone,
  fillColor: colors.softGreen,
  textStyle: "Step {n} of {total}",
};

// ────────────────────────────────────────────────────────────
// LEGACY → BRAND MIGRATION MAP
// (Used during reskin rollout — phase 2)
// ────────────────────────────────────────────────────────────

export const legacyToBrand = {
  // CSS variables in globals.css that need updating
  "--cream":   colors.paper,        // #F5F0E8 → #F7F6F2
  "--ink":     colors.ink,          // #111010 → #111111
  "--lav":     colors.lavender,     // #C4B5FD → #C7B5FF
  "--mint":    colors.softGreen,    // #6EE7B7 → #B9E3A5
  "--coral":   colors.vermillion,   // #FB7185 → #FF5A36
  "--navy":    colors.sky,          // #1E3A5F → #A8CFFF (note: drops dark navy entirely)

  // Tailwind font families
  fontSerif:   fonts.display.family,
  fontSans:    fonts.body.family,
  fontMono:    fonts.body.family,   // mono killed long ago; alias to Inter
};
