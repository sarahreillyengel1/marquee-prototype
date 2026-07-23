# Marquee Brand Essentials

**Canonical brand spec** — from the official Brand Essentials guide. Source of truth for all UI. Supersedes older brand notes in lib/brand.ts and the questionnaire mocks.

Tagline: **Be known. Not filtered.** · Line: *Your work. Deserves the spotlight.*

## Logo system
- **THE logo (live marquee.bio, authoritative):** `MARQUEE` — UPPERCASE, **Inter, font-weight 500, letter-spacing 0.25em**, ink. **NO mark/icon next to it, anywhere.** This is the `.wordmark` class in app/globals.css. Use this everywhere (nav, questionnaire rail, dashboard).
- Editorial wordmark `marquee` (lowercase, Canela) — expressive contexts only.
- App icon `m` in a wine tile.
- The Brand Essentials guide shows a Geometric M / Signal M mark + a Canela wordmark — **these are NOT the current logo and are not used next to the wordmark.** The live Inter wordmark wins. (If/when Sarah supplies approved M-mark master files, revisit — never recreate them.)

## Color palette (digital hex)
**Foundation:** Paper `#FFFFFF` · White `#F7F7F8` · Ink `#111111` · Stone `#E6E2D0` · Warm Taupe `#DBCDC4`
**Brand:** Crimson `#B21E2F` · **Wine `#670821`** (hero brand color) · Purple `#C7B5EE` · Sky `#C0DDFB` · Blue `#1F3BC4`
**Accent:** Citron `#D6E27B` · Blush `#F8C3FF` · Sage `#73926A` · Mint `#B9E3A5` · Orange `#FF5436`
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
