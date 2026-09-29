// ─────────────────────────────────────────────────────────────
// Demo profiles served directly by slug (marquee.bio/<slug>), bypassing Supabase.
// These are the profile-type system's showcase — one shared layout + hide-empty +
// per-type section selection. Ported from the prototype (marquee-app/src/data/profile.ts).
// Real member profiles still come from the DB via lib/profile-mapper.ts; this file is
// only the hardcoded demo set. Keyed by slug in DEMO_PROFILES at the bottom.
// ─────────────────────────────────────────────────────────────
import type { Profile } from './profile-types'

// ── Professional (standalone) — Katie. Get-hired: experience, impact, skills, education. ──
const katie: Profile = {
  name: 'Katie Carlin',
  headline: 'Marketing & Operations',
  location: 'Chicago, IL',
  available: true,
  availableLabel: 'Open to full-time roles',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80&auto=format&fit=crop',
  tagline: 'Ten years turning messy launches into repeatable growth.',
  slug: 'katie',
  tags: ['Go-to-Market', 'Lifecycle Marketing', 'Ops', 'Analytics', 'Team Building'],
  types: { primary: 'professional' },
  enabledSections: ['media', 'experience', 'impact', 'skills', 'testimonials', 'education'],
  actions: [
    { type: 'Contact', label: 'Contact me', destination: 'mailto:katie@example.com' },
    { type: 'Connect', label: 'LinkedIn', destination: 'https://linkedin.com/in/katiecarlin' },
    { type: 'Read', label: 'Résumé', destination: 'https://example.com/resume.pdf' },
    { type: 'View', label: 'Flagship project', destination: 'https://example.com' },
  ],
  bioShort: 'Marketing and ops leader who turns fuzzy launches into repeatable growth systems. Looking for my next full-time role.',
  bioLong: [
    'Ten years across B2B SaaS marketing and operations — the person teams call when a launch is a mess and needs to become a machine.',
    'I care most about the systems behind the numbers: the lifecycle flows, the reporting, the handoffs that let a small team punch above its weight.',
  ],
  bookedFor: [],
  highlights: [],
  testimonial: { quote: 'Katie is the person you want owning a launch — calm, organized, and relentless about the result.', who: 'Priya N. · VP Marketing, Brightline' },
  socials: [
    { kind: 'linkedin', url: 'https://linkedin.com/in/katiecarlin', visible: true },
    { kind: 'website', url: 'https://example.com', visible: true },
  ],
  openTo: [{ key: 'fulltime', label: 'Open to work', note: 'Full-time · hybrid or remote', visible: true }],
  engagements: [
    { key: 'fulltime', icon: 'building', title: 'Full-time roles', price: 'Open', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'Open to marketing / ops leadership roles.' },
  ],
  stats: [],
  activeProjects: [],
  roles: [
    { id: 'k1', company: 'Brightline', logoLetter: 'B', role: 'Senior Marketing Manager', dates: '2021 – Present', blurb: 'Own lifecycle + growth for a B2B SaaS platform.', metrics: [{ value: '2.4x', label: 'Pipeline' }] },
    { id: 'k2', company: 'Cadence', logoLetter: 'C', role: 'Marketing Manager', dates: '2018 – 2021', blurb: 'Built the demand-gen engine from scratch.', metrics: [{ value: '3x', label: 'Leads' }] },
    { id: 'k3', company: 'Northstar', logoLetter: 'N', role: 'Marketing Associate', dates: '2015 – 2018', blurb: 'Ran campaigns and events across the funnel.', metrics: [] },
  ],
  impact: [
    { value: '2.4x', label: 'Pipeline growth', sub: 'in 18 months at Brightline' },
    { value: '40%', label: 'Lower CAC', sub: 'via lifecycle automation' },
    { value: '3x', label: 'Qualified leads', sub: 'rebuilt demand gen at Cadence' },
  ],
  leadership: [],
  leadershipBelief: '',
  values: [],
  superpowers: [],
  skills: [
    { name: 'Lifecycle Marketing', score: 30 }, { name: 'Demand Generation', score: 26 },
    { name: 'Marketing Ops', score: 24 }, { name: 'Analytics', score: 20 },
    { name: 'Campaign Management', score: 18 }, { name: 'Copywriting', score: 14 },
  ],
  media: [],
  portfolio: [],
  education: [
    { id: 'ke1', short: 'BBA', title: 'University of Illinois', sub: 'Marketing · 2015' },
    { id: 'ke2', short: 'Cert', title: 'HubSpot Inbound', sub: 'Certified', verified: true },
  ],
  sections: { impact: true, superpowers: false, media: false, education: true, activeProjects: false, portfolio: false },
}

// ── Entrepreneur / Creator — Sarah. Ventures + content + storefront. ──
const sarah: Profile = {
  name: 'Sarah Reilly Engel',
  headline: 'Founder, Marquee · Fractional GTM',
  location: 'Westport, CT · Remote',
  available: true,
  availableLabel: 'Building Marquee · open to advisory',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&q=80&auto=format&fit=crop',
  tagline: 'Building Marquee. Writing BeKnown. Advising founders.',
  slug: 'sarah',
  tags: ['Go-to-Market', 'Brand', 'AI', 'Fractional', 'Community'],
  types: { primary: 'entrepreneur', secondary: 'creator' },
  enabledSections: ['media', 'experience', 'skills', 'testimonials', 'education'],
  actions: [
    { type: 'Book', label: 'Book fractional', destination: 'https://cal.com/sarah' },
    { type: 'Join', label: 'Join Marquee', destination: 'https://marquee.bio' },
    { type: 'Read', label: 'Read BeKnown', destination: 'https://beknownweekly.substack.com' },
    { type: 'Support', label: 'My nonprofit', destination: 'https://example.org' },
  ],
  bioShort: 'Founder of Marquee, a personal brand platform. Fractional GTM leader, writer of the BeKnown newsletter, and a builder of communities.',
  bioLong: [
    'I build brands, companies, and the systems behind growth — most recently my own company, Marquee, a personal brand platform for how people work today.',
    'Alongside it I run fractional GTM engagements, write the BeKnown newsletter, and back a nonprofit I care about.',
  ],
  bookedFor: [],
  highlights: [],
  testimonial: { quote: 'Sarah sees the category before anyone else and builds the story to match.', who: 'A founder she advised' },
  socials: [
    { kind: 'linkedin', url: 'https://linkedin.com', visible: true },
    { kind: 'x', url: 'https://x.com', visible: true },
    { kind: 'website', url: 'https://marquee.bio', visible: true },
  ],
  openTo: [
    { key: 'fractional', label: 'Fractional GTM', note: 'Monthly retainer', visible: true },
    { key: 'advisory', label: 'Advisory', note: '1:1 sessions', visible: true },
  ],
  engagements: [
    { key: 'fractional', icon: 'briefcase', title: 'Fractional GTM', price: 'Inquire', rateDisplay: 'show', visible: true, flow: 'proposal', blurb: 'Embedded GTM leadership a few days a month.' },
    { key: 'advisory', icon: 'compass', title: 'Advisory', price: 'Inquire', rateDisplay: 'show', visible: true, flow: 'book', blurb: 'Focused 1:1 sessions on positioning and growth.' },
  ],
  stats: [],
  activeProjects: [],
  roles: [
    { id: 's1', company: 'Marquee', logoLetter: 'M', role: 'Founder & CEO', dates: '2025 – Present', badge: 'Building', blurb: 'The personal brand platform for how people work today.', metrics: [] },
    { id: 's2', company: 'CampSix', logoLetter: 'C', role: 'Founder', dates: '2019 – Present', blurb: 'Go-to-market advisory for founders and teams.', metrics: [] },
    { id: 's3', company: 'BeKnown', logoLetter: 'B', role: 'Writer', dates: '2023 – Present', blurb: 'A weekly newsletter on personal brand and career.', metrics: [{ value: '12k', label: 'Readers' }] },
  ],
  impact: [],
  leadership: [],
  leadershipBelief: '',
  values: [],
  superpowers: [],
  skills: [
    { name: 'Go-to-Market Strategy', score: 32 }, { name: 'Brand & Positioning', score: 28 },
    { name: 'Community Building', score: 22 }, { name: 'AI Products', score: 18 }, { name: 'Content & Writing', score: 16 },
  ],
  media: [
    { id: 'sm1', type: 'Newsletter', title: 'BeKnown — this week', bg: '#C9DDF7', darkText: true, url: 'https://beknownweekly.substack.com', source: 'Read on Substack' },
    { id: 'sm2', type: 'Podcast', title: 'Building Marquee in public', bg: '#CBD8C0', darkText: true, play: true, url: 'https://open.spotify.com', source: 'Listen' },
    { id: 'sm3', type: 'Press', title: 'The future of professional identity', bg: '#F0D3BE', darkText: true, url: 'https://forbes.com', source: 'Read' },
  ],
  portfolio: [],
  education: [{ id: 'se1', short: 'BA', title: 'Boston College', sub: 'Communications' }],
  sections: { impact: false, superpowers: false, media: true, education: true, activeProjects: false, portfolio: false },
}

// ── Creator / Entrepreneur — Rebecca. Brand, community, store — not work history. ──
const rebecca: Profile = {
  name: 'Rebecca Minkoff',
  headline: 'Designer · Founder',
  location: 'New York, NY',
  available: true,
  availableLabel: 'Partnerships & speaking',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format&fit=crop',
  tagline: 'Building brands and the community behind female founders.',
  slug: 'rebecca',
  tags: ['Fashion', 'Retail', 'Community', 'Podcasting', 'Investing'],
  types: { primary: 'creator', secondary: 'entrepreneur' },
  enabledSections: ['media', 'experience', 'education'],
  actions: [
    { type: 'Shop', label: 'Latest RM collection', destination: 'https://rebeccaminkoff.com' },
    { type: 'Join', label: 'Join FFC', destination: 'https://femalefoundercollective.com' },
    { type: 'Buy', label: 'Buy the book', destination: 'https://amazon.com' },
    { type: 'Listen', label: 'Latest podcast', destination: 'https://open.spotify.com' },
  ],
  bioShort: 'Designer, founder, and host — building brands and the Female Founder Collective.',
  bioLong: [
    'I started my label at eighteen and have spent two decades building brand, retail, and community.',
    'Today that means the Rebecca Minkoff brand, the Female Founder Collective, my podcast, and the writing that ties it together.',
  ],
  bookedFor: [],
  highlights: [],
  socials: [
    { kind: 'instagram', url: 'https://instagram.com', visible: true },
    { kind: 'tiktok', url: 'https://tiktok.com', visible: true },
    { kind: 'website', url: 'https://rebeccaminkoff.com', visible: true },
  ],
  openTo: [
    { key: 'project', label: 'Partnerships', note: 'Brand & product', visible: true },
    { key: 'speaking', label: 'Speaking', note: 'Keynotes & panels', visible: true },
  ],
  engagements: [
    { key: 'project', icon: 'file', title: 'Partnerships', price: 'Inquire', rateDisplay: 'show', visible: true, flow: 'proposal', blurb: 'Brand and product collaborations.' },
    { key: 'speaking', icon: 'play-circle', title: 'Speaking', price: 'By event', rateDisplay: 'contact', visible: true, flow: 'availability', blurb: 'Keynotes and panels on entrepreneurship and brand.' },
  ],
  stats: [],
  activeProjects: [],
  roles: [
    { id: 'r1', company: 'Rebecca Minkoff', logoLetter: 'R', role: 'Founder & Creative Director', dates: '2005 – Present', blurb: 'Global accessories and apparel brand.', metrics: [] },
    { id: 'r2', company: 'Female Founder Collective', logoLetter: 'F', role: 'Co-Founder', dates: '2018 – Present', blurb: 'A network supporting women-owned businesses.', metrics: [{ value: '400k+', label: 'Members' }] },
    { id: 'r3', company: 'Superwomen', logoLetter: 'S', role: 'Host', dates: '2019 – Present', blurb: 'A podcast on building and leading.', metrics: [] },
  ],
  impact: [],
  leadership: [],
  leadershipBelief: '',
  values: [],
  superpowers: [],
  skills: [],
  media: [
    { id: 'rm1', type: 'Podcast', title: 'Superwomen — this week', bg: '#F0D3BE', darkText: true, play: true, url: 'https://open.spotify.com', source: 'Listen' },
    { id: 'rm2', type: 'Newsletter', title: 'The FFC newsletter', bg: '#C9DDF7', darkText: true, url: 'https://femalefoundercollective.com', source: 'Read' },
    { id: 'rm3', type: 'Press', title: 'Forbes: Rebuilding a brand', bg: '#CBD8C0', darkText: true, url: 'https://forbes.com', source: 'Read on Forbes' },
  ],
  portfolio: [],
  education: [{ id: 're1', short: '—', title: 'Self-taught', sub: 'Started her label at 18' }],
  sections: { impact: false, superpowers: false, media: true, education: true, activeProjects: false, portfolio: false },
}

// ── Executive / Entrepreneur — Brendan. Ventures + credibility + 1:1s. ──
const brendan: Profile = {
  name: 'Brendan Reilly',
  headline: 'Founder & CTO, TYTL.ai',
  location: 'San Francisco, CA',
  available: true,
  availableLabel: 'Building TYTL · open to 1:1s',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&auto=format&fit=crop',
  tagline: 'Building AI teamwork. Author on AI ethics.',
  slug: 'brendan',
  tags: ['AI', 'Data', 'Product', 'Leadership', 'Ethics'],
  types: { primary: 'executive', secondary: 'entrepreneur' },
  enabledSections: ['media', 'experience', 'impact', 'skills', 'testimonials', 'education'],
  actions: [
    { type: 'Read', label: 'TYTL press release', destination: 'https://tytl.ai' },
    { type: 'Book', label: 'Book AI teamwork', destination: 'https://tytl.ai/demo' },
    { type: 'Book', label: 'Book a 1:1', destination: 'https://cal.com/brendan' },
    { type: 'Buy', label: 'Buy the AI book', destination: 'https://amazon.com' },
  ],
  bioShort: 'Founder and CTO of TYTL.ai, building AI teamwork tools. Author on AI ethics; advises teams on shipping AI responsibly.',
  bioLong: [
    'I build AI products and the teams behind them — currently TYTL.ai, tools for AI teamwork, and before that Aiworkforce.',
    'I wrote a book on AI ethics because the hard part isn’t the model, it’s shipping it responsibly.',
  ],
  bookedFor: [],
  highlights: [],
  testimonial: { quote: 'Brendan ships thoughtful AI faster than anyone — and makes the ethics part real, not a checkbox.', who: 'Dana K. · Head of Product, Aiworkforce' },
  socials: [
    { kind: 'linkedin', url: 'https://linkedin.com', visible: true },
    { kind: 'x', url: 'https://x.com', visible: true },
    { kind: 'website', url: 'https://tytl.ai', visible: true },
  ],
  openTo: [
    { key: 'advisory', label: '1:1 expert call', note: 'AI & data', visible: true },
    { key: 'board', label: 'Board / Advisor', note: 'AI startups', visible: true },
    { key: 'speaking', label: 'Speaking', note: 'AI & ethics', visible: true },
  ],
  engagements: [
    { key: 'advisory', icon: 'compass', title: '1:1 expert call', price: 'Inquire', rateDisplay: 'show', visible: true, flow: 'book', blurb: 'A focused session on AI, data, or product.' },
    { key: 'board', icon: 'users', title: 'Board / Advisor', price: 'Inquire', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'Advisory for AI startups.' },
    { key: 'speaking', icon: 'play-circle', title: 'Speaking', price: 'By event', rateDisplay: 'contact', visible: true, flow: 'availability', blurb: 'Talks on AI teamwork and ethics.' },
  ],
  stats: [],
  activeProjects: [],
  roles: [
    { id: 'mk1', company: 'TYTL.ai', logoLetter: 'T', role: 'Founder & CTO', dates: '2023 – Present', badge: 'Building', blurb: 'AI teamwork tools for modern teams.', metrics: [] },
    { id: 'mk2', company: 'Aiworkforce', logoLetter: 'A', role: 'Co-Founder', dates: '2021 – Present', blurb: 'AI-powered workforce platform.', metrics: [{ value: '50k+', label: 'Users' }] },
    { id: 'mk3', company: 'Meridian', logoLetter: 'M', role: 'VP Engineering', dates: '2016 – 2021', blurb: 'Led the data + ML organization.', metrics: [] },
  ],
  impact: [
    { value: '50k+', label: 'Users on Aiworkforce', sub: 'built 0 to 1' },
    { value: '1', label: 'Book on AI ethics', sub: 'published 2024' },
  ],
  leadership: [],
  leadershipBelief: '',
  values: [],
  superpowers: [],
  skills: [
    { name: 'AI / ML', score: 32 }, { name: 'Data Platforms', score: 26 },
    { name: 'Product Engineering', score: 22 }, { name: 'AI Ethics', score: 18 }, { name: 'Team Leadership', score: 16 },
  ],
  media: [
    { id: 'mm1', type: 'Press', title: 'TYTL.ai launches AI teamwork', bg: '#C9DDF7', darkText: true, url: 'https://techcrunch.com', source: 'TechCrunch' },
    { id: 'mm2', type: 'Portfolio', title: 'The AI Ethics Playbook (book)', bg: '#141210', url: 'https://amazon.com', source: 'Amazon' },
    { id: 'mm3', type: 'Speaking', title: 'Shipping AI responsibly', bg: '#CBD8C0', darkText: true, play: true, url: 'https://youtube.com', source: 'Watch' },
  ],
  portfolio: [],
  education: [
    { id: 'me1', short: 'MS', title: 'Stanford', sub: 'Computer Science' },
    { id: 'me2', short: 'BS', title: 'MIT', sub: 'EECS' },
  ],
  sections: { impact: true, superpowers: false, media: true, education: true, activeProjects: false, portfolio: false },
}

// ── Creator / Coach — Michaela. Podcast + 1:1s + retreats. Media-led, no work history. ──
const michaela: Profile = {
  name: 'Michaela Reilly',
  headline: 'Psychedelic Facilitator · Educator · Advocate · Podcast Host',
  location: 'Boston, MA',
  available: true,
  availableLabel: 'Booking sessions & retreats',
  verified: true,
  photoUrl: '/images/michaela.jpg', // Michaela's real photo (cropped, border removed)
  tagline: 'Discover true freedom.',
  focusLabel: '', // her line is a motto, not a "Currently" statement
  look: 'warm',
  slug: 'michaelareilly',
  tags: ['Internal Family Systems', 'Psychedelic Integration', 'Art Therapy', 'Somatics', 'Non Duality', 'Retreats', 'Podcast Host', 'Speaker'],
  types: { primary: 'creator', secondary: 'coach' },
  enabledSections: ['media', 'testimonials', 'education'],
  actions: [
    { type: 'Contact', label: 'Get in touch', destination: 'contact' },
    { type: 'Listen', label: 'The Psychedelic Mom', destination: 'https://www.thepsychedelicmom.com/podcast' },
    { type: 'Attend', label: 'Join a retreat', destination: 'https://www.thepsychedelicmom.com/waitlist' },
    { type: 'Explore', label: 'Services', destination: 'https://www.thepsychedelicmom.com/services' },
  ],
  bioShort:
    'My own deep journey led me through psychedelics, non-dual pointings, and eventually into supporting others in returning to their true, unconditioned nature.',
  bioLong: [
    'I work with individuals, groups, and organizations as a psychedelic facilitator, retreat leader, speaker, and advocate. I hold space for both psychedelic retreats and creative art retreats, using a blend of ceremonial work, parts work, somatic inquiry, non-dual pointings, and art as a path to awakening.',
    'I\'m also the host of the Psychedelic Mom Podcast, where I explore the journey of deconditioning and discovering uncaused peace.',
  ],
  bookedFor: ['Integration sessions', 'Retreats', 'Speaking', 'Consulting'],
  highlights: [
    '100+ episodes · The Psychedelic Mom, ranked top 3% globally',
    'Invited to the Mystic Summit at Necker Island — one of 20 psychedelic leaders',
    'Founder, Psychedelic Integration Community of Boston · Creator of The Luminous Path Method',
  ],
  rating: { stars: 5, count: 100, label: 'Top 3% podcast globally' },
  testimonial: {
    quote: 'Through my work facilitating healing with ancient medicines, I have witnessed what was once thought to be unbeatable begin to transform—in Google executives seeking clarity, peace negotiators carrying the weight of conflict, Buddhist monks deepening their practice, and communities left behind. I believe we are in a global mental health crisis that collaboration, personalized support, and earth medicines can heal.',
    who: 'Michaela Reilly',
  },
  socials: [
    { kind: 'instagram', url: 'https://www.instagram.com/thepsychedelicmom', visible: true },
    { kind: 'website', url: 'https://www.thepsychedelicmom.com', visible: true },
  ],
  openTo: [
    { key: 'advisory', label: 'Integration Sessions', note: '1:1 · virtual', visible: true },
    { key: 'project', label: 'Retreats', note: 'Small groups · seasonal', visible: true },
    { key: 'speaking', label: 'Speaking', note: 'Talks & workshops', visible: true },
  ],
  // Request-only for this profile — no rates shown, no booking (flow: message).
  engagements: [
    { key: 'advisory', icon: 'compass', title: 'Integration Sessions', price: 'Request', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'A grounded 1:1 to integrate your experience into daily life.' },
    { key: 'project', icon: 'file', title: 'Retreats', price: 'Request', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'Small-group seasonal retreats — ceremony, breathwork, and rest.' },
    { key: 'speaking', icon: 'play-circle', title: 'Speaking', price: 'Request', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'Talks and workshops on motherhood, medicine, and integration.' },
  ],
  singlePage: true,
  beta: true,
  inquiryEmail: 'michaelacarlin@thepsychedelicmom.com',
  stats: [],
  activeProjects: [],
  roles: [],
  impact: [],
  leadership: [],
  leadershipBelief: '',
  values: [],
  superpowers: [],
  skills: [],
  media: [
    { id: 's1', type: 'Podcast', title: 'The Psychedelic Mom — latest episodes', bg: '#CBD8C0', image: '/images/mich-media1.jpg', darkText: true, play: true, url: 'https://www.thepsychedelicmom.com/podcast', source: 'Listen' },
    { id: 's2', type: 'Podcast', title: 'A Traditional Mom Tries Non-Traditional Therapies', bg: '#C9DDF7', image: '/images/mich-media2.jpg', darkText: true, play: true, url: 'https://podcasts.apple.com/us/podcast/a-traditional-mom-tries-non-traditional-therapies/id1565522799?i=1000638222404', source: 'Apple Podcasts' },
    { id: 's3', type: 'Speaking', title: 'On family awakening & healing — The Revelation Project', bg: '#F0D3BE', image: '/images/mich-media3.jpg', darkText: true, play: true, url: 'https://revelationproject.fireside.fm/175', source: 'Listen' },
    { id: 's4', type: 'Video', title: 'YouTube — talks, practices & teachings', bg: '#B9CBB2', darkText: true, url: 'https://www.youtube.com/channel/UCOi4nhUhdZRyAN60V-Gh_OA', source: 'Watch on YouTube' },
    { id: 's5', type: 'Podcast', title: 'Psychedelics: All We’ve Uncovered & Where We’re Headed', bg: '#D9E3EC', darkText: true, play: true, url: 'https://www.thepsychedelicmom.com/podcast/episode119', source: 'Episode 119' },
  ],
  portfolio: [],
  education: [
    { id: 'c1', short: 'PF', title: 'Psychedelic Facilitation', sub: 'Synthesis Institute' },
    { id: 'c2', short: 'MP', title: 'Medicine Painting Facilitator', sub: 'Shiloh Sophia' },
    { id: 'c3', short: 'IS', title: 'Psychedelic Integration Specialist', sub: 'Being True to You' },
    { id: 'c4', short: 'SD', title: 'Certificate in Spiritual Direction', sub: 'Still Harbor' },
    { id: 'c5', short: 'RK', title: 'Reiki Practitioner', sub: '' },
    { id: 'c6', short: 'BW', title: 'Breathwork Facilitator', sub: '' },
    { id: 'c7', short: 'TM', title: 'Transcendental Meditation Teacher', sub: '' },
    { id: 'me4', short: 'BA', title: 'Boston College', sub: 'BA, Communications' },
  ],
  sections: { impact: false, superpowers: false, media: true, education: true, activeProjects: false, portfolio: false },
}

// Slug → demo profile. app/[username]/page.tsx serves these directly (no DB fetch).
// NOTE: the `sarah` fixture is intentionally NOT registered — marquee.bio/sarah must never
// serve a stock-photo stand-in for the real Sarah (her live profile is /sarahreillyengel).
export const DEMO_PROFILES: Record<string, Profile> = {
  katie, rebecca, brendan, michaela, michaelareilly: michaela,
}
