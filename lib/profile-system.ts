// ── Profile-type system ──────────────────────────────────────────────
// The 7 Profile Types (NOT "archetypes" — archetypes = Builder/Operator/Strategist,
// a separate concept in How I Work). A member picks a PRIMARY (leads) and, unless
// primary is Professional, a SECONDARY. The combo is BACKGROUND ONLY — never shown on
// the profile. It only pre-checks the sections onboarding suggests you build; the
// person can add or hide anything. Output = one layout that hides whatever isn't used.
// Ported verbatim from marquee-app/src/data/profile-system.ts — keep in sync.

export type ProfileTypeKey =
  | 'professional' | 'executive' | 'entrepreneur' | 'coach' | 'creator' | 'creative' | 'investor'

export interface ProfileTypeDef {
  key: ProfileTypeKey
  label: string
  essence: string
  canSolo: boolean       // only Professional is true — everyone else must pair
  recommends: string[]   // signature sections this type adds, beyond the universals
}

// Recommended for (nearly) everyone. Section keys align with the profile data/renderer.
// workWithMe + bio live in/through the Hero; education is always rendered LAST.
export const UNIVERSAL_SECTIONS = [
  'hero', 'actions', 'workWithMe', 'media', 'skills', 'testimonials', 'bio',
] as const

export const PROFILE_TYPES: ProfileTypeDef[] = [
  { key: 'professional', label: 'Professional', essence: 'Craft & credibility. Looking to get hired.', canSolo: true,  recommends: ['experience', 'impact', 'superpowers', 'education'] },
  { key: 'executive',    label: 'Executive',    essence: 'Leadership & scale.',                         canSolo: false, recommends: ['experience', 'impact', 'leadership'] },
  { key: 'entrepreneur', label: 'Entrepreneur', essence: 'Builds ventures & products.',                 canSolo: false, recommends: ['store', 'experience'] },
  { key: 'coach',        label: 'Coach',        essence: 'Transformation, 1:1 & groups.',               canSolo: false, recommends: ['education'] },
  { key: 'creator',      label: 'Creator',      essence: 'Audience & body of work.',                    canSolo: false, recommends: [] },
  { key: 'creative',     label: 'Creative',     essence: 'Craft & portfolio — design, photo, art.',     canSolo: false, recommends: ['portfolio'] },
  { key: 'investor',     label: 'Investor',     essence: 'Thesis, portfolio, deals.',                   canSolo: false, recommends: ['experience', 'impact', 'portfolio'] },
]

const typeByKey = (k?: ProfileTypeKey) => PROFILE_TYPES.find((t) => t.key === k)

// The starting checklist for a combo = universals ∪ primary's ∪ secondary's signature sections.
// Everything else stays available to add; anything here can be turned off.
export function recommendedSections(primary: ProfileTypeKey, secondary?: ProfileTypeKey): string[] {
  const set = new Set<string>(UNIVERSAL_SECTIONS)
  typeByKey(primary)?.recommends.forEach((s) => set.add(s))
  typeByKey(secondary)?.recommends.forEach((s) => set.add(s))
  return Array.from(set)
}

// The sections the owner can turn on/off from the dashboard (home-page renderable ones).
// Hero, 4 Actions, Work With Me and the linked Bio are always on and not listed here.
export const SECTION_CATALOG: { key: string; label: string }[] = [
  { key: 'media', label: 'Media' },
  { key: 'experience', label: 'Experience' },
  { key: 'impact', label: 'Impact' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'values', label: 'Values' },
  { key: 'skills', label: 'Skills' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'activeProjects', label: 'Active Projects' },
  { key: 'education', label: 'Education & Certifications' }, // always renders last
]
export const ALL_SECTION_KEYS = SECTION_CATALOG.map((s) => s.key)

export const canSolo = (k: ProfileTypeKey): boolean => !!typeByKey(k)?.canSolo
export const isRecommended = (key: string, primary: ProfileTypeKey, secondary?: ProfileTypeKey): boolean =>
  recommendedSections(primary, secondary).includes(key)
