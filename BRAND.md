# Marquee Brand Essentials

**Canonical brand spec** — from the official Brand Essentials guide. Source of truth for all UI. Supersedes older brand notes in lib/brand.ts and the questionnaire mocks.

Tagline: **Be known. Not filtered.** · Line: *Your work. Deserves the spotlight.*

## Logo system
- **THE logo (live marquee.bio, authoritative):** `MARQUEE` — UPPERCASE, **Inter, font-weight 500, letter-spacing 0.25em**, ink. **NO mark/icon next to it, anywhere.** This is the `.wordmark` class in app/globals.css. Use this everywhere (nav, questionnaire rail, dashboard).
- Editorial wordmark `marquee` (lowercase, Canela) — expressive contexts only.
- App icon `m` in a wine tile.
- The Brand Essentials guide shows a Geometric M / Signal M mark + a Canela wordmark — **these are NOT the current logo and are not used next to the wordmark.** The live Inter wordmark wins. (If/when Sarah supplies approved M-mark master files, revisit — never recreate them.)

## Color palette (digital hex) — CONFIRMED BY SARAH, 2026-09-28
**This table is the single source of truth.** It supersedes every other list (the May 2024 Design Language sheet, the GTM brand guide, `tailwind.config.ts`, `profile-design.css`). **Softer versions are allowed** (Sarah, 2026-09-28: "i don't mind softer versions btw, but this is it") — a lighter or quieter tint of one of these twelve is fine for backgrounds, tiles, borders and hover states. A new hue that is not a tint of one of these is not; ask first.

| Name | Hex | Role |
|---|---|---|
| Ink | `#111111` | Text |
| Paper | `#F7F6F2` | Background |
| Lavender | `#C7B5FF` | Signature |
| Vermillion | `#FF5A36` | Primary CTA |
| Crimson | `#AB0000` | Deep accent |
| Wine | `#670821` | Editorial dark |
| Sky | `#A8CFFF` | Secondary |
| Powder | `#C0DDFB` | Soft blue |
| Sage | `#73926A` | Muted green |
| Peach | `#EED0BF` | Peach |
| Stone | `#E9E6DF` | Neutral |
| Citron | `#D6E27B` | Highlight |

**Known drift in the code (not yet corrected — needs Sarah's go):** the live site uses Wine `#7C1226`, red `#F8563A`, purple `#CBBCF0`, blue `#C9DDF7`, beige `#F6F2EC`.

### Profile looks (colour only — layout, type and spacing are identical)
- **Classic** — black and white, beige (Stone) buttons, one soft colour (Powder), and a light touch of Wine (title line, action labels).
- **Warm** — what marquee.bio/michaelareilly looks like today: Paper, Sage accent, Sky button, Peach / Powder / Stone tints.
- **Mono** — monochromatic in Stone only, light to dark. No hue choice (Sarah, 2026-09-28).
- **Bold** — black, white, Lavender and Wine, in large blocks. No dark outlines: lines stay soft Stone in every look.

*(Use CMYK/Pantone for print.)*

## Typography
- **Canela** — Display / Editorial: storytelling, headlines, quotes, editorial moments. *(Paid; Fraunces is the free stand-in until Canela files land in public/fonts.)*
- **Poppins** — UI Headlines / Caps: UI, navigation, labels, short headlines.
- **Inter** — Body / Long-form: body copy, descriptions, long content.

### Type hierarchy
- Display heading — Canela 72/80
- H1 — Poppins Semibold 40/48
- H2 — Poppins Medium 28/36
- H3 — Poppins Medium 20/28
- UI label — Poppins Medium 12/16 (caps)
- Body — Inter Regular 16/26

## Rules
- **Square 0px corners** everywhere (cards, chips, buttons, panels). Circles only for true dots/avatars.
- Wine is the hero brand color; each color has one job; saturated color in large blocks.
- Do not render the logo lowercase for the primary wordmark; do not tint the marks off-palette.

## Codification status (to do)
- [ ] Update `lib/brand.ts` colors to the exact hexes above (currently old palette).
- [ ] Load fonts in `app/layout.tsx`: Poppins + Inter (Google), Canela (self-host in public/fonts when licensed; Fraunces stand-in now).
- [ ] Add a `<Logo>` component (primary MARQUEE wordmark + editorial + app icon + M-mark slots).
- [ ] Get the approved M-mark master assets from Sarah → public/images.
