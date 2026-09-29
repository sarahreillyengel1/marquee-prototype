# Marquee Profile — Pages & Onboarding Structure

**Status doc, updated Sept 28 2026 (header + looks + home-page pass).** Extends `PROFILE-ARCHITECTURE.md` (v2, the canonical spec) with everything decided and built since Michaela's profile. Where something is decided but not yet built, it is marked **PENDING** — nothing here claims more than what exists.

---

## 1. Principles (locked)

- **Home page = featured picks; depth lives on the dedicated pages.** The home page never dumps a full list (this is what made the Skills/Values/Leadership row lopsided).
- **One design, four colour looks.** The person picks **Classic · Warm · Mono · Bold** in the builder. Looks change colour only; layout, type and spacing are identical. Warm is the original Marquee look and the default for profiles published before looks existed. Colours come only from the palette in `BRAND.md`. Squared corners; Canela for display, Poppins for labels, Inter for body.
- **No invented content, ever.** The profile shows only what the person entered. No placeholder certs, colleges, quotes or stats.
- **No jargon** in profile copy or labels (e.g. no "strongest proofs").
- **The person controls what shows:** which keywords feature in the header, which items are featured within a section, which sections are hidden. Hidden sections reflow cleanly (no empty cards).
- **Type-aware:** creators/public figures get Reach (media kit); executives don't.

## 2. Site IA / navigation

**Decided and built (Sept 28):** `Profile · Experience · Media · Work with Me`. There is no "How I Work" page: everything about the person's work lives on **Experience**, and **Work with Me** is the services page. No descriptive sub-lines under page titles.

**Earlier plan, superseded:** `Profile · Expertise · Media · Store · Work with Me` (Store only when products exist; Reach lives under Work with Me / its own tab for creators).

**Currently live:** `Profile · Experience · How I Work · Media`. → **PENDING:** consolidate Experience + How I Work into **Expertise**; add Store and Work with Me as pages.

## 3. Page structure

### 3.1 Profile (home) — the cover
| # | Section | Rule | Status |
|---|---|---|---|
| 1 | **Header** | **Left:** name · title · quick facts (up to 3 short lines, no label) · **Currently** (serif statement, labelled) · **Known for** (4 keywords, then "+N more") · Read full bio · location · social links. **Right, one card:** photo · **Open to** (up to 3, each clickable) · "Work with {first name}". **Bottom of the header:** the **Previous** row — brands worked at or with, as text, up to 8, no rules around it. "Open to opportunities" stays a small text line above the name; Verified sits above it. | ✅ built Sept 28 · **keyword selection PENDING** (currently starred skills) · Verified needs the ID check (PENDING) |
| 1b | **Actions** | The 4 CTAs. **Not part of the header** — the first section below it. 1–4 tiles that stretch to fill the row. | ✅ |
| 2 | **Featured Experience** | Top 3 experience cards, 3-line teaser, "Full timeline →". The full timeline does **not** live on home. | ✅ starred roles first (Sept 28) |
| 3 | **Featured Skills · Values** | **8** featured skills (starred first, then the strongest of the rest) · the 4 featured values as tiles. The two cards sit side by side and fill to the same height. Title is "Featured Skills", never "Signature Skills". | ✅ (Sept 28) |
| 4 | **Featured Media** | Up to 4 starred items → "All media →" | ✅ shown once, 4 starred first (Sept 28) |
| 5 | **Education & Credentials** | School + certifications | ✅ |
| 6 | **Testimonial** | One featured quote | ✅ (spec says up to 2 featured — PENDING) |
| 7 | **Superpowers** | Top 3 (spec: standard module on the profile) | ✅ (Sept 28) |

**Home order (Sept 28):** Header → Actions → Featured Experience → Featured Skills + Values → Testimonial → Superpowers → Featured Media. **Media is last. Education is not on home** (it is on Experience). Home is featured items only. The header has a "See all skills" link after Known for.

**Experience page (Sept 28):** Impact → Roles (3, then "Show all") → Skills (8, then "Show all") → Superpowers → Leadership → Values (4, then "Show all") → Education. Long sections open and close; short ones just show.

**Work with Me page (Sept 28):** one card per offer with price and a Send request / Book a time button; Reach sits below for creators. The "how to work with me" copy is Sarah's to write — PENDING.

**Media tiles** rotate through the look's three tile colours (no per-type colours).

**Pages now:** `Profile · Experience · Media · Shop · Work with Me`. Shop appears only when products exist. There is no Bio page: the long bio is the first section of Experience. Experience order: Bio → Impact → Roles → Skills → Superpowers → Leadership → Values → Education. Each role carries up to 3 industries and 1 company stage (searchable). Impact uses the same row design as Superpowers. Only people with a published Marquee profile can affirm.

**Also Sept 28:** home shows 6 **Core Values** (serif names on tiles, no icons) · skills show the level name and a four-step bar · Impact is plain statements, no icons or colour band · company tiles are uploaded logos, or one letter when there is none · leadership archetypes carry definitions from `lib/archetypes.ts` · Enneagram supports wings · "Open to opportunities" is removed for now · the builder mirrors all of this.

**Affirm (Sept 28):** sign-in required; shown as a pill, "Affirmed by N" with up to 3 faces (the affirmer's own Marquee photo, or initials). The owner cannot affirm their own superpower.

**Header photo (Sept 28):** portrait frame (4:5). The person drags to reposition and can zoom, in the builder.

**Does not live on home** (it lives on the depth pages): the full Experience timeline, Impact, Leadership. One-page profiles (e.g. Michaela) have no depth pages, so they keep these on the single page.

**On home for now, until their own pages exist:** Reach and Store, at the bottom.

### 3.2 Expertise — the depth
Featured Experience (3 cards) → **Full timeline** → **Impact** → **Leadership** (3 archetypes with descriptions · MBTI · Enneagram · years leading · largest team · philosophy) → **Skills** (all, grouped by category, sage bars) → **Superpowers** (top 3) → **Values** (all 12).
**Status:** Experience/Impact/Skills/Superpowers/Values render across the current Experience + How-I-Work pages ✅. ✅ MBTI/Enneagram/years/team + archetype descriptions carried; values "View all" shows all 12 (Sept 28). **PENDING:** merge into one Expertise page (awaiting Sarah: before or after Oct 1).

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

**About You now holds every header field:** photo (drag to reposition, zoom) · name · city · headline · **Quick facts** (was "About") · **Currently** (was "Current focus", moved from Experience) · **Previous** (brands, up to 8) · **Look**.

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
