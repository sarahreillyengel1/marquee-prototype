# Marquee Profile — Pages & Onboarding Structure

**Status doc, Sept 26 2026.** Extends `PROFILE-ARCHITECTURE.md` (v2, the canonical spec) with everything decided and built since Michaela's profile. Where something is decided but not yet built, it is marked **PENDING** — nothing here claims more than what exists.

---

## 1. Principles (locked)

- **Home page = featured picks; depth lives on the dedicated pages.** The home page never dumps a full list (this is what made the Skills/Values/Leadership row lopsided).
- **The design system does not change.** Stone paper, charcoal ink, soft-blue CTA, sage skill bars, squared corners, Canela/Lora + Inter. Structure and curation change; the look does not.
- **No invented content, ever.** The profile shows only what the person entered. No placeholder certs, colleges, quotes or stats.
- **No jargon** in profile copy or labels (e.g. no "strongest proofs").
- **The person controls what shows:** which keywords feature in the header, which items are featured within a section, which sections are hidden. Hidden sections reflow cleanly (no empty cards).
- **Type-aware:** creators/public figures get Reach (media kit); executives don't.

## 2. Site IA / navigation

**Decided:** `Profile · Expertise · Media · Store · Work with Me` (Store only when products exist; Reach lives under Work with Me / its own tab for creators).

**Currently live:** `Profile · Experience · How I Work · Media`. → **PENDING:** consolidate Experience + How I Work into **Expertise**; add Store and Work with Me as pages.

## 3. Page structure

### 3.1 Profile (home) — the cover
| # | Section | Rule | Status |
|---|---|---|---|
| 1 | **Hero** | Photo in its own box (never overlapped); "Open to opportunities" is a small green-dot **text line above the name** — **no pill on the photo**. Name · headline · **current focus** line · location · **featured keywords the person selects** · CTAs. Right: the **Open-to card**, each offer **clickable** into Work with Me. | Photo/name/headline/focus/keywords/CTAs ✅ · Open-to card ✅ · **keyword selection PENDING** (currently top-5 starred skills) · **location not rendered — PENDING** |
| 2 | **Featured Experience** | Top 3 experience cards, 3-line teaser, "Full timeline →" | ✅ (currently first 3 roles — **starring not carried yet, PENDING**) |
| 3 | **Signature Skills · Values** | ~6 featured skills (starred) · the 4 featured values | Skills ✅ (starred, falls back to top-by-score) · Values ✅ |
| 4 | **Featured Media** | Up to 4 starred items → "All media →" | Renders ✅ but **shows first 3 and appears twice on the page (HeroMedia + Media row) — PENDING fix**; starring not carried |
| 5 | **Education & Credentials** | School + certifications | ✅ |
| 6 | **Testimonial** | One featured quote | ✅ (spec says up to 2 featured — PENDING) |
| 7 | **Superpowers** | Top 3 (spec: standard module on the profile) | **Not rendered on home — PENDING** |

### 3.2 Expertise — the depth
Featured Experience (3 cards) → **Full timeline** → **Impact** → **Leadership** (3 archetypes with descriptions · MBTI · Enneagram · years leading · largest team · philosophy) → **Skills** (all, grouped by category, sage bars) → **Superpowers** (top 3) → **Values** (all 12).
**Status:** Experience/Impact/Skills/Superpowers/Values render across the current Experience + How-I-Work pages ✅. **PENDING:** merge into one Expertise page; carry MBTI/Enneagram/years/team into the profile (mapper drops them today); archetype descriptions (available in the builder, not shown); values "View all" currently shows only the featured 4.

### 3.3 Media
All items, filterable by type (Articles · Podcasts · Awards · Videos · Press · Portfolio · Case Studies · Resources). **Status:** ✅ (Video missing from the tab filter — minor PENDING).

### 3.4 Store
Dedicated page, only when products exist; each item **links out** (Amazon, Gumroad, own site). **Status:** products + link field ✅ and they render — but as a **home-page grid, not a page — PENDING** per spec.

### 3.5 Work with Me
Offers as cards. **Office Hours / Coaching → "Book a time" via CUSTOM native scheduling** (decided Sept 26: availability · time slots · booking · confirmations · in-app payment). The Cal.com link is only a stopgap until custom ships. **All other offers → "Send request."** Advisory = Send request only; Speaking has no length/date fields. Plus **Reach** for creators: total followers (auto-summed) · per-platform (handle, followers, engagement) · audience demographics.
**Status:** offers, copy, Reach ✅ · Cal.com stopgap ✅ · **custom booking + payments — PENDING (major build).** Rule (fixed Sept 26, pending deploy): without a scheduling link, "book" falls back to Send request — never placeholder time slots.

### 3.6 Bio
Short preview on the profile → "Read full bio" → dedicated Bio page. **Status:** ✅.

## 4. Onboarding / builder (`/build-preview`)

**Steps:** Resume → About You · Experience · Leadership · Impact · Skills · Superpowers · Values · Testimonials · Education → Work With Me · Media · **Reach** · Store · Long Bio.

**Built ✅:** resume upload/paste → parse → pre-fill · autosave (`builder_drafts`) · photo + media-cover upload · deep skills search (337-skill catalog + custom) · industries free-add (≤12) · per-step **Show/Hide** toggle · keyword tag chips (→ `searchTags`) · Cal.com link · Reach step · Store link field · **Back/Next** on every step · **Preview** (real renderer, your draft, unpublished) · **Publish → claim link once → "Update" thereafter** · login/auth redirects fixed.

**Edit loop:** "Edit profile" anywhere → the builder → Update. No dead ends.

**Publish safety (fixed Sept 26, pending deploy):** `inquiryEmail` set at publish so "Send request" works · a failed draft load never overwrites the saved draft · Share copies the real slug · the stock-photo "sarah" demo is unregistered.

**Builder PENDING:** "Save and exit" and "Request a testimonial" are dead controls · company-logo upload · rail progress is hardcoded · values expansion to ~50 presets (awaiting Sarah's list; no custom add).

## 5. What's blocking a clean public share (in priority order)

1. **Deploy the four Sept 26 blocker fixes** (contact email · no fake booking · Share link · draft-load safety) — coded, type-checked, **not yet deployed** (deploy was paused).
2. Hero: render **location**; hide the Open-to card when nothing is offered.
3. **Normalize links** — `linkedin.com/in/x` must become `https://…` (today it resolves relative to the profile and breaks).
4. **Media duplication** on the home page; show the 4 starred.
5. Carry **featured stars** (experience, media, store) into the profile; support 2 featured testimonials.
6. Superpowers on the home page; hidden sections leave no empty cards on sub-pages.
7. Expertise page consolidation (IA).

## 6. Open decisions for Sarah
- Keyword selection in the header: separate "featured keywords" picker, or keep = starred skills?
- Highlights strip (spec §14, 3 cross-profile items) — keep as a distinct block, or is Featured Experience enough?
- Store: dedicated page now, or leave on home until products exist?
- Values: send the additional presets to reach ~50.
