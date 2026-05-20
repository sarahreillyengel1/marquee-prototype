# Marquee

**Be Known. Not Filtered.**

Personal brand platform for professionals — a dynamic, AI-generated profile that replaces the resume. Live at **[marquee.bio](https://marquee.bio)**.

---

## Status

| | |
|---|---|
| **Started** | April 2026 |
| **Live URL** | https://marquee.bio |
| **Demo profile** | https://marquee.bio/demo |
| **Stage** | Beta (invite-only) |
| **Pricing** | $46/year |

## Tech stack

| Layer | Tech |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Hosting** | Vercel |
| **Database + Auth** | Supabase (project: `relopngviwtclcotyicb`) |
| **File storage** | Supabase Storage (avatars bucket) |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **Payments** | Stripe (not yet wired) |
| **Styling** | Tailwind 3.4 + DM Sans (no serif, no mono) |
| **PDF parsing** | pdf-parse 1.1.1 |
| **Domain** | marquee.bio (GoDaddy → Vercel DNS) |

## Local dev

```bash
cd ~/Desktop/ROO/marquee
npm run dev   # runs on port 3001 (3000 is reserved for Club Lucky)
```

`.env.local` (gitignored) holds all secrets. See `.env.local.example` for the keys you need.

## Repo structure

```
app/
  page.tsx                       — landing
  signup/  login/                — auth
  onboard/                       — resume upload → basics → ELVISS questionnaire → AI generation
  [username]/                    — public profile (the main thing)
  dashboard/                     — owner dashboard + contact inbox
  api/                           — server routes (parse-resume, generate-profile, etc.)
components/
  ContactModal.tsx               — "Get in touch" form
  DemoModalButton.tsx            — landing-page demo preview
lib/
  supabase.ts / supabase-server.ts   — Supabase clients
  claude.ts                          — Anthropic wrapper
  stripe.ts                          — Stripe helper (lazy init)
  demo-profile.ts                    — Maya Okonkwo demo data (served at /demo)
  skills-library.ts                  — 337 skills, 8 categories
  schema.sql + seed.sql              — Supabase tables, RLS, beta codes
  contacts-schema.sql                — contact_requests table + RLS
middleware.ts                    — auth gate for /onboard/* and /dashboard
types/index.ts                   — shared TypeScript types
```

## ELVISS framework

The questionnaire that powers each profile. 6 sections:

- **E** — Experience (career arc, transformational roles, through-line)
- **L** — Leadership (style, archetypes, belief, MBTI/Enneagram)
- **V** — Values (top-5 ranking, needs, culture)
- **I** — Impact (career highlights + testimonials)
- **S** — Skills (5-tier proficiency map, 50 max)
- **S** — Story (narrative, point-of-view, insights)

Plus **ELVISS+** modules (newsletter, podcasts, speaking, case studies, portfolio, projects, advisory, service).

## Beta access

20 single-use invite codes seeded. Currently 18 unused. See the `beta_codes` table in Supabase.

## Related projects (avoid confusion)

| Project | Folder | Domain | Vercel |
|---|---|---|---|
| **Marquee** (this) | `~/Desktop/ROO/marquee` | marquee.bio | `marquee` |
| **Club Lucky** | `~/clublucky` | (separate) | `clublucky` |

Both run on the same Vercel + Supabase account but **completely isolated**. Marquee dev server runs on port **3001** so it never collides with Club Lucky on 3000.

## Naming convention for standalone artifacts

Any standalone file outside `/app` (prototypes, mockups, exports, screenshots) follows:

```
[project]-[type]-[YYYY-MM-DD].ext
```

Examples: `marquee-prototype-2026-04-12.html`, `marquee-deck-2026-05-19.pdf`.

## Deploy

Git push to `main` → Vercel auto-deploys (once GitHub ↔ Vercel integration is connected).
Manual: `vercel deploy --prod` from the project root.
