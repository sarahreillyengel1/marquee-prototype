// ─────────────────────────────────────────────────────────────
// Marquee profile view-model (the "target" shape the ported design renders).
// Copied verbatim from the finished design source (marquee-app/src/data/types.ts)
// so the Next app has no dependency on that repo. Do NOT import from marquee-app.
// The live DB data is mapped into this shape by lib/profile-mapper.ts.
// ─────────────────────────────────────────────────────────────

export type RateDisplay = 'show' | 'contact' // "contact for rate" instead of a number

export type EngagementKey =
  | 'advisory' | 'fractional' | 'project' | 'speaking' | 'board' | 'fulltime'

export interface Engagement {
  key: EngagementKey
  icon: string
  title: string
  /** shown when rateDisplay === 'show' */
  price: string
  /** owner can switch any engagement to "Contact for rate" */
  rateDisplay: RateDisplay
  blurb: string
  /** owner can hide an engagement entirely (e.g. not open to Fractional) */
  visible: boolean
  /** which flow the CTA opens */
  flow: 'book' | 'proposal' | 'availability' | 'message'
}

export interface OpenToItem {
  key: EngagementKey
  label: string
  note: string
  visible: boolean
}

export interface Social {
  kind: 'linkedin' | 'instagram' | 'x' | 'tiktok' | 'website'
  url: string
  visible: boolean
}

export interface Role {
  id: string
  company: string
  logoLetter: string
  /** Owner-uploaded company logo. When set, the tile shows this image instead of
   *  the pastel monogram. Falls back to logoLetter. */
  logoUrl?: string
  role: string
  dates: string
  badge?: string
  verified?: boolean
  blurb?: string
  /** Accomplishment bullets shown on the Experience page (full-resume detail). */
  highlights?: string[]
  metrics?: { value: string; label: string }[]
}

export interface ProjectCase {
  id: string
  title: string
  type: string
  subtitle: string
  /** gradient/imagery for the portfolio tile + project page hero */
  image: string
  image2?: string
  metrics: { value: string; label: string }[]
  body: string[] // paragraphs
}

export interface ActiveProject {
  id: string
  name: string
  role: string
  blurb: string
  url: string // links out
  logoLetter: string
  /** Owner-uploaded company logo. When set, the tile shows this image instead of
   *  the pastel monogram. Falls back to logoLetter. */
  logoUrl?: string
  /** Shown in the "Currently" group on the Experience page. */
  dates?: string
  highlights?: string[]
}

export interface MediaItem {
  id: string
  type: 'Project' | 'Podcast' | 'Newsletter' | 'Press' | 'Speaking' | 'Board' | 'Portfolio'
  title: string
  sub?: string
  bg: string
  darkText?: boolean
  play?: boolean
  /** external link OR internal route (e.g. 'portfolio') */
  url?: string
  internal?: string
  source?: string
}

export interface Skill { name: string; score: number }
export interface Value { name: string; blurb: string; color: string; icon: string }
export interface LeadershipTrait { title: string; blurb: string; icon: string }
export interface Superpower { title: string; blurb: string; icon: string }
export interface Credential { id: string; short: string; title: string; sub: string; verified?: boolean }

export interface SectionVisibility {
  // Owner can hide any section — e.g. someone early-career with no impact yet
  impact: boolean
  superpowers: boolean
  media: boolean
  education: boolean
  activeProjects: boolean
  portfolio: boolean
}

export interface Profile {
  name: string
  headline: string
  location: string
  available: boolean
  availableLabel: string
  verified: boolean
  photoUrl: string
  tagline: string
  slug: string
  tags: string[]
  bioShort: string
  bioLong: string[]
  bookedFor: string[]
  highlights: string[]
  rating?: { stars: number; count: number; label: string }
  testimonial?: { quote: string; who: string }

  socials: Social[]
  openTo: OpenToItem[]
  engagements: Engagement[]

  stats: { value: string; label: string; goto: string }[]
  activeProjects: ActiveProject[]
  roles: Role[]                 // Experience (career + impact live together)
  impact: { value: string; label: string; sub: string }[]
  leadership: LeadershipTrait[]
  leadershipBelief: string
  values: Value[]
  superpowers: Superpower[]
  skills: Skill[]
  media: MediaItem[]
  portfolio: ProjectCase[]
  education: Credential[]

  sections: SectionVisibility
}
