// ─────────────────────────────────────────────────────────────
// Maps the live API payload ({ profile, workHistory, skills, answers })
// into the finished design's `Profile` view-model (lib/profile-types.ts).
//
// The `profile` row is a generated_profiles record (beta columns), workHistory
// is work_history rows, skills is skills rows (skill_name/proficiency/category),
// and answers is the raw intake_answers.answers jsonb.
//
// Everything here is defensive: any missing/empty source falls back to a safe
// empty default so the UI never crashes. Fields with no source yet are marked
// with `// TODO(beta): source not collected yet`.
// ─────────────────────────────────────────────────────────────

import type {
  Profile,
  Engagement,
  EngagementKey,
  OpenToItem,
  Social,
  Role,
  ActiveProject,
  MediaItem,
  ProjectCase,
  Skill,
  Value,
  Superpower,
  SectionVisibility,
} from './profile-types'

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRec = Record<string, any>

export interface MapperInput {
  profile: AnyRec
  workHistory: AnyRec[]
  skills: AnyRec[]
  answers: AnyRec
}

/* ── helpers ─────────────────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtDate(value: unknown): string {
  if (!value) return ''
  const s = String(value)
  if (/^present$/i.test(s)) return 'Present'
  const m = s.match(/^(\d{4})-(\d{1,2})/)
  if (!m) return s
  const month = parseInt(m[2], 10)
  if (month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${m[1]}`
  return s
}

function firstLetter(s: unknown): string {
  const str = (s == null ? '' : String(s)).trim()
  return str ? str[0].toUpperCase() : '·'
}

// Coerce a jsonb value that might be string[] | {text|value|title}[] into string[]
function toStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((item) => {
      if (item == null) return ''
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        const o = item as AnyRec
        return String(o.text ?? o.value ?? o.title ?? o.label ?? o.headline ?? '')
      }
      return String(item)
    })
    .filter(Boolean)
}

// Coerce jsonb [{value,label}] metric chips
function toMetrics(v: unknown): { value: string; label: string }[] {
  if (!Array.isArray(v)) return []
  return v
    .map((m) => {
      if (m && typeof m === 'object') {
        const o = m as AnyRec
        return { value: String(o.value ?? ''), label: String(o.label ?? '') }
      }
      return { value: String(m ?? ''), label: '' }
    })
    .filter((m) => m.value || m.label)
}

// Pull a short metric-looking token out of free text (e.g. "3.2x", "$20M", "34%")
function extractMetric(text: string): string {
  const m = text.match(/(\$?\d[\d.,]*\s*(?:x|%|k|m|bn|\+)?)/i)
  return m ? m[1].trim() : ''
}

function engagementIcon(title: string, provided?: unknown): string {
  if (provided && typeof provided === 'string') return provided
  const t = title.toLowerCase()
  if (/advis/.test(t)) return 'compass'
  if (/fractional/.test(t)) return 'briefcase'
  if (/project/.test(t)) return 'file'
  if (/speak|talk|workshop/.test(t)) return 'play-circle'
  if (/board/.test(t)) return 'users'
  if (/full.?time|employ|operat|role/.test(t)) return 'building'
  if (/coach|mentor/.test(t)) return 'sprout'
  if (/invest|angel/.test(t)) return 'trending-up'
  return 'calendar'
}

const FLOWS = new Set(['book', 'proposal', 'availability', 'message'])
function coerceFlow(v: unknown): Engagement['flow'] {
  return FLOWS.has(v as string) ? (v as Engagement['flow']) : 'message'
}

const VALUE_COLORS = ['var(--lav)', 'var(--sky)', 'var(--green2)', '#D9CEF7']
const VALUE_ICONS = ['compass', 'heart', 'flag', 'shield', 'zap', 'trending-up']
const MEDIA_BGS = ['#C7B5FF', '#A8CFFF', '#E9E6DF', '#B9E3A5', '#5B43C9', '#FF5A36', '#241F1A']
const LIGHT_BGS = new Set(['#C7B5FF', '#A8CFFF', '#E9E6DF', '#B9E3A5'])

const MEDIA_TYPES = ['Project', 'Podcast', 'Newsletter', 'Press', 'Speaking', 'Board', 'Portfolio']
function normalizeMediaType(v: unknown): MediaItem['type'] {
  if (typeof v === 'string') {
    const cap = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    if (MEDIA_TYPES.includes(cap)) return cap as MediaItem['type']
    if (/publication|writ|blog/i.test(v)) return 'Press'
    if (/community/i.test(v)) return 'Board'
  }
  return 'Project'
}

/* ── main ────────────────────────────────────────────── */

export function mapToProfile({ profile, workHistory, skills, answers }: MapperInput): Profile {
  const p = profile || {}
  const wh = Array.isArray(workHistory) ? workHistory : []
  const sk = Array.isArray(skills) ? skills : []
  const a = answers || {}

  const name = String(p.name ?? '')

  /* engagements ← ways_to_work; openTo derived from visible engagements */
  const rawWays: AnyRec[] = Array.isArray(p.ways_to_work) ? p.ways_to_work : []
  const engagements: Engagement[] = rawWays.map((w, i) => {
    const title = String(w.title ?? 'Work together')
    const rateDisplay = w.rateDisplay === 'show' ? 'show' : 'contact'
    const price = String(w.price ?? (rateDisplay === 'show' ? 'Custom' : 'Contact for rate'))
    const key = String(w.key ?? w.id ?? `eng-${i}`) as EngagementKey
    return {
      key,
      icon: engagementIcon(title, w.icon),
      title,
      price,
      rateDisplay: rateDisplay as Engagement['rateDisplay'],
      blurb: String(w.blurb ?? ''),
      visible: w.visible !== false,
      flow: coerceFlow(w.flow),
    }
  })
  const openTo: OpenToItem[] = engagements
    .filter((e) => e.visible)
    .map((e) => ({
      key: e.key,
      label: e.title,
      note: e.rateDisplay === 'show' ? e.price : 'Contact for rate',
      visible: true,
    }))

  /* socials ← social_links (only non-empty, known kinds) */
  const sl: AnyRec = (p.social_links && typeof p.social_links === 'object') ? p.social_links : {}
  const socialSources: { kind: Social['kind']; url: unknown }[] = [
    { kind: 'linkedin', url: sl.linkedin },
    { kind: 'instagram', url: sl.instagram },
    { kind: 'x', url: sl.x ?? sl.twitter },
    { kind: 'tiktok', url: sl.tiktok },
    { kind: 'website', url: sl.website ?? sl.site ?? sl.url },
  ]
  const socials: Social[] = socialSources
    .filter((s) => s.url && String(s.url).trim())
    .map((s) => ({ kind: s.kind, url: String(s.url), visible: true }))

  /* roles ← workHistory */
  const roles: Role[] = wh.map((w, i) => {
    const company = String(w.company ?? '')
    const start = fmtDate(w.start_date)
    const end = w.is_current ? 'Present' : (fmtDate(w.end_date) || 'Present')
    const highlights = toStringList(w.highlights).length
      ? toStringList(w.highlights)
      : toStringList(w.original_bullets)
    return {
      id: String(w.id ?? `role-${i}`),
      company,
      logoLetter: firstLetter(company),
      logoUrl: w.logo_url ? String(w.logo_url) : undefined,
      role: String(w.role_title ?? ''),
      dates: start ? `${start} – ${end}` : end,
      badge: w.badge ? String(w.badge) : undefined,
      verified: !!w.verified,
      blurb: w.ai_narrative ? String(w.ai_narrative) : undefined,
      highlights: highlights.length ? highlights : undefined,
      metrics: toMetrics(w.metrics),
    }
  })

  /* activeProjects ← current work_history rows */
  const activeProjects: ActiveProject[] = wh
    .filter((w) => !!w.is_current)
    .map((w, i) => {
      const company = String(w.company ?? '')
      const highlights = toStringList(w.highlights).length
        ? toStringList(w.highlights)
        : toStringList(w.original_bullets)
      return {
        id: String(w.id ?? `active-${i}`),
        name: company,
        role: String(w.role_title ?? ''),
        blurb: String(w.ai_narrative ?? ''),
        url: '', // TODO(beta): per-role external URL not collected yet
        logoLetter: firstLetter(company),
        logoUrl: w.logo_url ? String(w.logo_url) : undefined,
        dates: fmtDate(w.start_date) ? `${fmtDate(w.start_date)} – Present` : 'Present',
        highlights: highlights.length ? highlights : undefined,
      }
    })

  /* skills ← skills rows, score = proficiency * 20 (1–5 → 20–100) */
  const mappedSkills: Skill[] = sk
    .map((s) => ({
      name: String(s.skill_name ?? s.name ?? ''),
      score: Math.max(1, Number(s.proficiency ?? 0)) * 20,
    }))
    .filter((s) => s.name)

  /* impact ← answers.impact_highlights (best-effort → {value,label,sub}) */
  // TODO(beta): impact_highlights has no structured numeric metric; value is
  // extracted from the text where possible, otherwise left blank.
  const impactSrc: AnyRec[] = Array.isArray(a.impact_highlights) ? a.impact_highlights : []
  const impact = impactSrc.map((h) => {
    const headline = String(h.headline ?? '')
    const story = String(h.story ?? '')
    return {
      value: extractMetric(headline) || extractMetric(story) || '',
      label: headline,
      sub: String(h.context ?? ''),
    }
  })

  /* superpowers ← superpowers column [{title,blurb,icon}] */
  const superSrc: AnyRec[] = Array.isArray(p.superpowers) ? p.superpowers : []
  const superpowers: Superpower[] = superSrc.map((s) => ({
    title: String(s.title ?? ''),
    blurb: String(s.blurb ?? ''),
    icon: typeof s.icon === 'string' && s.icon ? s.icon : 'zap',
  }))

  /* values ← answers.v_values (names only → best-effort Value) */
  // TODO(beta): value blurbs not collected; only the ordered value names exist.
  const valuesSrc = Array.isArray(a.v_values) ? (a.v_values as unknown[]) : []
  const values: Value[] = valuesSrc.map((v, i) => ({
    name: String(v ?? ''),
    blurb: '',
    color: VALUE_COLORS[i % VALUE_COLORS.length],
    icon: VALUE_ICONS[i % VALUE_ICONS.length],
  })).filter((v) => v.name)

  // leadership traits: no structured source in intake yet
  const leadership = [] as Profile['leadership'] // TODO(beta): leadership traits not collected yet
  const leadershipBelief = String(a.l_belief ?? '')

  /* media ← media column */
  const mediaSrc: AnyRec[] = Array.isArray(p.media) ? p.media : []
  const media: MediaItem[] = mediaSrc.map((m, i) => {
    const rawBg = m.bg ?? m.image
    const bg = typeof rawBg === 'string' && /^(#|rgb|linear|radial)/.test(rawBg)
      ? rawBg
      : MEDIA_BGS[i % MEDIA_BGS.length]
    return {
      id: String(m.id ?? `m-${i}`),
      type: normalizeMediaType(m.type ?? m.module_type),
      title: String(m.title ?? ''),
      sub: m.sub ? String(m.sub) : (m.context ? String(m.context) : undefined),
      bg,
      darkText: m.darkText != null ? !!m.darkText : LIGHT_BGS.has(bg),
      play: !!m.play,
      url: m.url ? String(m.url) : undefined,
      internal: m.internal ? String(m.internal) : undefined,
      source: m.source ? String(m.source) : undefined,
    }
  })

  /* portfolio ← portfolio column (guarantee ≥1 metric so tiles never crash) */
  const portfolioSrc: AnyRec[] = Array.isArray(p.portfolio) ? p.portfolio : []
  const portfolio: ProjectCase[] = portfolioSrc.map((c, i) => {
    const metrics = toMetrics(c.metrics)
    return {
      id: String(c.id ?? `case-${i}`),
      title: String(c.title ?? ''),
      type: String(c.type ?? ''),
      subtitle: String(c.subtitle ?? ''),
      image: typeof c.image === 'string' && c.image ? c.image : 'radial-gradient(120% 130% at 20% 12%, #D8D2C6, #2E2C28 52%, #141210)',
      image2: c.image2 ? String(c.image2) : undefined,
      metrics: metrics.length ? metrics : [{ value: '—', label: '' }],
      body: toStringList(c.body),
    }
  })

  /* bookedFor / highlights (best-effort from beta columns) */
  const bookedFor = (() => {
    if (Array.isArray(p.industries) && p.industries.length) return p.industries.map(String)
    if (Array.isArray(a.career_themes) && a.career_themes.length) return a.career_themes.map(String)
    return [] as string[]
  })()
  const careerHighlights = (() => {
    const fromTop = toStringList(p.top_highlights)
    if (fromTop.length) return fromTop
    return impact.map((im) => [im.value, im.label].filter(Boolean).join(' — ')).filter(Boolean)
  })()

  /* testimonial ← first of answers.ii_quotes */
  const quotes: AnyRec[] = Array.isArray(a.ii_quotes) ? a.ii_quotes : []
  const testimonial = quotes.length
    ? {
        quote: String(quotes[0].text ?? ''),
        who: [quotes[0].name, quotes[0].relationship].filter(Boolean).join(' · '),
      }
    : undefined

  /* bioLong ← career arc + leadership + insights */
  const bioLong = [p.ai_career_arc, p.ai_leadership_summary, p.ai_insights_summary]
    .filter(Boolean)
    .map(String)
  const bioShort = String(p.ai_pull_quote ?? bioLong[0] ?? '')

  /* stats — derive best-effort */
  const years = p.years_experience ?? a.l_years
  const stats: Profile['stats'] = []
  if (years) stats.push({ value: `${years}+`, label: 'Years', goto: '/experience' })
  if (impact.length) stats.push({ value: String(impact.length), label: 'Impact Stories', goto: '/experience' })
  if (superpowers.length) stats.push({ value: String(superpowers.length), label: 'Core Superpowers', goto: '/how-i-work' })

  /* sections — content presence, honoring explicit owner flags if present */
  const flags: AnyRec = (p.sections && typeof p.sections === 'object') ? p.sections : {}
  const show = (key: string, hasContent: boolean) => hasContent && flags[key] !== false
  const sections: SectionVisibility = {
    impact: show('impact', impact.length > 0),
    superpowers: show('superpowers', superpowers.length > 0),
    media: show('media', media.length > 0),
    education: show('education', false), // TODO(beta): education not collected yet
    activeProjects: show('activeProjects', activeProjects.length > 0),
    portfolio: show('portfolio', portfolio.length > 0),
  }

  return {
    name,
    headline: String(p.ai_headline ?? ''),
    location: String(p.location ?? ''),
    available: p.available !== false,
    availableLabel: String(p.available_label ?? 'Available for new opportunities'),
    verified: !!p.verified,
    photoUrl: p.avatar_url ? String(p.avatar_url) : '',
    tagline: String(p.tagline ?? ''),
    slug: name ? name.split(' ')[0].toLowerCase() : '',
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    bioShort,
    bioLong,
    bookedFor,
    highlights: careerHighlights,
    rating: undefined, // TODO(beta): ratings/sessions not collected yet
    testimonial,

    socials,
    openTo,
    engagements,

    stats,
    activeProjects,
    roles,
    impact,
    leadership,
    leadershipBelief,
    values,
    superpowers,
    skills: mappedSkills,
    media,
    portfolio,
    education: [], // TODO(beta): education & credentials not collected yet

    sections,
  }
}
