# Builder + Profile — feedback log (Sarah, first real build-through)

Captured from testing the full build→publish loop. Grouped for execution.

### Progress (Sep 4)
- ✅ Edit loop: preview pane removed, "Edit" everywhere → builder, no dead ends (was #4, #12)
- ✅ Overview (160-char) now shows in hero (was #2)
- ✅ Open-To: expand ≠ include; explicit "Show on my profile" toggle (was #3, part of #5)
- ✅ Photo upload: bio photo + media covers via `avatars` bucket (was #1)
- ✅ Container craft: Featured Experience cards clamp to 3-line teasers (uniform, no wall); full text on Experience page with line breaks preserved; metric-less roles no longer show an orphan icon (was #9)
- ✅ Work-With-Me copy/booking: "Send request" across the board; advisory=send request only; coaching=book+send request; speaking dropped length/available-date (was #7 + offer fixes)
- ✅ Ongoing-management UX: persistent Back/Next per step; claim-once (publish→Update, no re-asking username); draft Preview route /build-preview/preview

### Sept 28 — launch-readiness day
- ✅ Fresh-account E2E (signup → code → builder → publish → profile) PASSES on a real new user: no seed leak, empty sections hidden, links absolute, only included offers, request form (no fake slots), rate shown
- ✅ Onboarding entry fixed: new users start at Resume + welcome tour (was landing on step 11/Media); returning users go straight to About You; "Step 0" → 1-based counter
- ✅ Field labels linked to inputs (a11y)
- ✅ Builder polish: "Save and exit" works (saves → your profile/dashboard); dead "Request a testimonial" + fake logo-upload removed for beta; rail progress is real
- ✅ Blocker fixes deployed: inquiryEmail at publish (Send request works) · no fake booking without a scheduling link · Share copies the real slug · draft-load can't wipe a draft · stock-photo "sarah" demo unregistered
- ✅ Pre-share fixes: link normalization (https://) · hero location · media shown once (4 featured)
- ✅ Spec items (D): Superpowers on home · Leadership MBTI/Enneagram/years/team + archetype descriptions carried · featured stars honored for experience/media/values/store · all 12 values carried ("View all") · no empty cards on sub-pages when hidden
- ✅ Signup pricing corrected: $29/mo · $299/yr
- ✅ Auth/onboarding hardening (Sept 28): one-click sign-in links handled site-wide (AuthLinkHandler; explicit setSession since the PKCE client rejects hash links) · "Forgot password?" + /reset-password flow · signup validates the beta code BEFORE creating an account (bots can no longer mint accounts) · 6 dotted-gmail bot accounts deleted · Sarah's profile + draft migrated from test@marquee.bio to sarah@campsix.co · Supabase Site URL fixed to marquee.bio (was localhost:3000 — every auth email was landing on a dead page)
- ⏳ Awaiting Sarah: custom booking for Oct 1? · billing at beta? · Resend email? · Expertise consolidation before/after Oct 1? · Highlights keep/drop · Codex loop? · values presets (later)

### Approved queue (Sarah, Sep 8) — in order
1. ✅ Quick wins: Back/Next · claim-once · edit/preview UX
2. ✅ Deep skills library: dead search box wired → 337-skill catalog dropdown (name + category), custom add, Enter-to-add; grouped by the catalog's 8 categories; sliders + ★ kept
3. ✅ Industries: preset chips + free-add, capped at 12, custom chips removable
4. ✅ Per-section "I don't want this": per-step Show/Hide toggle → mapper blanks hidden sections → profile reflows (no empty holes)
5. ✅ Keyword fields → tag-chip editor; aggregated into profile.searchTags (offer keywords + industries + skills + values) for future directory search
6. ✅ Store: product Link field (Amazon/Gumroad/etc.) + Store now renders on the profile (new StoreItem type + mapper + ProfileView section + CSS)
- ✅ Archetypes swapped to the confirmed set: Builder · Fixer · Scaler · Operator · Strategist · Coach · Connector · Visionary
- ✅ Reach module: new "Reach" builder step (8 platforms · handle/followers/engagement/link each) + audience demographics (age/gender/geo); renders as a Reach section (total-followers headline + per-platform tiles + demographics); type-aware via data presence; hideable; "Build media kit →" jumps to the Reach step. FOLLOW-UP: full rate card (deliverables + prices) not yet built.
- Values: expand presets toward ~50 (Sarah to supply additional values later; NO custom add-your-own)
- ✅ Cal.com wired: builder field (Cal.com link) in Work With Me → mapped to profile.calLink → the "Book instantly" flow opens the person's Cal.com scheduling (link-out; inline embed is a later upgrade)
- Archetypes: current build-preview set is STALE. Latest set (from onboard/elviis + profile render): Builder · Fixer · Scaler · Operator · Strategist · Coach · Connector · Visionary — awaiting Sarah's confirm before swapping

## A. Blocking bugs (profile isn't usable/accurate without these)
1. **Photo upload doesn't work** — profile/bio photo AND media cover photos. Needs Supabase Storage wiring (avatar + media covers). Currently placeholder boxes.
2. **Profile overview (160-char "Current focus") doesn't appear** on the published profile. The builder captures it; the mapper/renderer drops it. Must surface it.
3. **"Open To" shows offers not opted into** — Fractional Role + Coaching appear though she didn't add them. Mapper or toggle bug. (Only `added` offers should show.)
4. **Editing doesn't work** — (pin down: editing on the published profile vs. in the builder). The builder is the editor now; the published page's inline "edit" is legacy. Make the edit path clear + working.

## B. Control / customization (core to "it represents them")
5. **Per-item show/hide checkboxes** — for every "Open To" item (and generally, each thing that displays) so the person chooses exactly what appears.
6. **Hideable sections** — not all sections apply to everyone (cf. Michaela's custom single-page). Need per-section show/hide, and a design that RESTRUCTURES cleanly when sections are off (no empty holes).
7. **Skills** — resume gave a limited set; need a **deep skills library** (searchable catalog, current one is too small). Keep the proficiency sliders. Let the user **select which skills to feature** on the profile.
8. **"Open To" fields need revisiting** — the per-offer detail fields need rework.

## C. Design / UX craft (must be intuitive + delightful)
9. **Container sizing / truncation** — sections overflow; e.g. the Experience "Featured" card dumps the full bullet wall. "View more" should truncate long content; nothing should look like an unbounded text block.
10. **Experience page + "How I Work" page design is not good** — needs a real design pass.
11. **Commerce / Store** — where is it on the profile + where's its editing surface? (She won't add products now, but the path must exist.)
12. **Editing feels low UI/UX** — the whole editing experience needs to feel high-craft and intuitive.
13. **Guided tour "Next" button overlaps text** (z-index/position) — got in the way; she dismissed the tour, then used Save-and-exit + left nav. Fix the tour overlay; make skipping graceful.

## Overarching
> "The whole design feels not intuitive. People have to LOVE it — it represents them."

Bar: this is someone's professional identity. Every section must feel considered, editable in place, and customizable (show/hide, feature, reorder) — matching PROFILE-ARCHITECTURE.md's promise (edit anytime · choose Highlights · feature within modules · hide/show · reorder).
