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
