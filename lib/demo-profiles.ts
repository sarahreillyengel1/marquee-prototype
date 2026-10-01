// ─────────────────────────────────────────────────────────────
// Demo profiles served directly by slug (marquee.bio/<slug>), bypassing Supabase.
// These are the profile-type system's showcase — one shared layout + hide-empty +
// per-type section selection. Ported from the prototype (marquee-app/src/data/profile.ts).
// Real member profiles still come from the DB via lib/profile-mapper.ts; this file is
// only the hardcoded demo set. Keyed by slug in DEMO_PROFILES at the bottom.
// ─────────────────────────────────────────────────────────────
import type { Profile } from './profile-types'

// ── SAMPLE — Professional (standalone) — Morgan, an invented person. Get-hired: experience, impact, skills, education. ──
const morgan: Profile = {
  name: 'Morgan Ellis',
  sample: true,
  headline: 'Marketing & Operations',
  location: 'Chicago, IL',
  available: true,
  availableLabel: 'Open to full-time roles',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80&auto=format&fit=crop',
  tagline: 'Ten years turning messy launches into repeatable growth.',
  slug: 'morgan',
  tags: ['Go-to-Market', 'Lifecycle Marketing', 'Ops', 'Analytics', 'Team Building'],
  types: { primary: 'professional' },
  enabledSections: ['media', 'experience', 'impact', 'skills', 'testimonials', 'education'],
  actions: [
    { type: 'Contact', label: 'Contact me', destination: 'mailto:morgan@example.com' },
    { type: 'Connect', label: 'LinkedIn', destination: 'https://linkedin.com' },
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
  testimonial: { quote: 'Morgan is the person you want owning a launch — calm, organized, and relentless about the result.', who: 'Priya N. · VP Marketing, Brightline' },
  socials: [
    { kind: 'linkedin', url: 'https://linkedin.com', visible: true },
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
  ownMediaColors: true, // her tiles were coloured by hand
  foundingMember: true, // granted by Sarah, 2026-09-29
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

// ── SAMPLE — Maren Voss. An invented person: no real individual, company or publication.
//    Built to show a full profile: media, press, case studies, a shop, booking and offers.
//    `sample: true` puts a "Sample profile" banner on the page so nobody takes it for real. ──
const G = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`
const maren: Profile = {
  name: 'Maren Voss',
  headline: 'Brand Strategist · Author · Host of The Signal',
  location: 'Austin, TX',
  available: true,
  availableLabel: 'Taking two fractional engagements a year',
  verified: true,
  foundingMember: true,
  sample: true,
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&auto=format&fit=crop',
  photoPos: { x: 50, y: 20 },
  tagline: 'Writing my second book on how small brands earn attention without buying it, and taking on two fractional CMO engagements a year.',
  look: 'classic',
  previous: ['Halden & Co.', 'Northwind Goods', 'Lumen Labs', 'Fieldnote'],
  slug: 'marenvoss',
  tags: ['Brand strategy', 'Positioning', 'Storytelling', 'Community-led growth', 'Founder brand'],
  types: { primary: 'entrepreneur', secondary: 'creator' },
  actions: [
    { type: 'Book', label: 'Office hours', destination: 'contact' },
    { type: 'Read', label: 'The Quiet Brand', destination: 'shop', internal: true },
    { type: 'Listen', label: 'The Signal podcast', destination: 'media', internal: true },
    { type: 'Explore', label: 'Case studies', destination: 'portfolio', internal: true },
  ],
  bioShort: 'Author of The Quiet Brand\nHost of The Signal, 140 episodes\nFractional CMO for consumer brands',
  bioLong: [
    'Maren Voss has spent fifteen years helping consumer brands say one clear thing and mean it. She started in agency strategy, moved in-house to lead brand at two venture-backed companies, and now works independently with founders who are past product-market fit and stuck on the story.',
    'Her first book, The Quiet Brand, argues that most companies are over-explained and under-understood. It grew out of her weekly newsletter and became the basis for her workshops and her podcast, The Signal, where she interviews operators about the decisions behind brands people actually remember.',
    'She takes two fractional CMO engagements a year, runs a small number of brand sprints, and speaks at company offsites and industry events. She sits on two advisory boards and mentors first-time founders through an early-stage program.',
    'Outside of work she is rebuilding a 1960s house in Austin and learning, slowly, to throw pottery.',
  ],
  bookedFor: [],
  highlights: [],
  testimonial: { quote: 'Maren found the sentence we had been circling for two years. Everything we shipped after that got easier: the site, the deck, the hiring.', who: 'A founder she worked with, Series B consumer brand' },
  quote: { text: 'A brand is not what you say about yourself. It is what people can repeat about you when you are not in the room.', who: 'Maren Voss' },
  socials: [
    { kind: 'linkedin', url: 'https://linkedin.com', visible: true },
    { kind: 'instagram', url: 'https://instagram.com', visible: true },
    { kind: 'website', url: 'https://marquee.bio/marenvoss', visible: true },
  ],
  openTo: [
    { key: 'advisory', label: 'Office Hours', note: '30 or 60 minutes', visible: true },
    { key: 'fractional', label: 'Fractional CMO', note: '3–6 months', visible: true },
    { key: 'speaking', label: 'Speaking', note: 'Keynotes & offsites', visible: true },
  ],
  engagements: [
    { key: 'advisory', icon: 'compass', title: 'Office Hours', price: '$400 per session', rateDisplay: 'show', visible: true, flow: 'message', blurb: 'One focused hour on your positioning, your story or a launch you are about to make.', topics: ['Positioning', 'Messaging', 'Launch plans', 'Founder brand', 'Naming'], topicsLabel: 'What I can help with', sessions: [{ minutes: 30, priceCents: 20000 }, { minutes: 60, priceCents: 40000 }] },
    { key: 'fractional', icon: 'briefcase', title: 'Fractional CMO', price: '$12000 per month', rateDisplay: 'show', visible: true, flow: 'proposal', blurb: 'Two days a week inside your team, for a season. I take two of these a year.', topics: ['CMO', 'Head of Brand', 'Interim VP Marketing'], topicsLabel: 'Roles I take' },
    { key: 'project', icon: 'file', title: 'Brand Sprint', price: '$18000 per project', rateDisplay: 'show', visible: true, flow: 'proposal', blurb: 'Three weeks from muddle to a positioning line, a message map and a homepage draft.', topics: ['Repositioning', 'New category story', 'Pre-raise narrative'], topicsLabel: 'Types of projects' },
    { key: 'speaking', icon: 'play-circle', title: 'Speaking', price: 'By event', rateDisplay: 'contact', visible: true, flow: 'availability', blurb: 'Keynotes and working sessions for offsites, conferences and founder programs.', topics: ['The Quiet Brand', 'Earning attention', 'Founder as brand', 'Story for sales teams'], topicsLabel: 'Topics I speak on' },
    { key: 'board', icon: 'compass', title: 'Advisory Board', price: 'Request', rateDisplay: 'contact', visible: true, flow: 'message', blurb: 'A small number of advisory seats with consumer and creator-economy companies.', topics: ['Consumer', 'Creator economy', 'Retail', 'Wellness'], topicsLabel: 'Industries I advise in' },
  ],
  stats: [],
  activeProjects: [],
  roles: [
    { id: 'mv1', featured: true, company: 'Voss & Field', logoLetter: 'V', role: 'Founder & Principal', dates: '2021 – Present', blurb: 'Independent brand practice: fractional CMO work, brand sprints, workshops and speaking.', highlights: ['Led positioning for 30+ consumer and creator-economy brands', 'Two fractional CMO engagements a year, each with a full team handover', 'Built The Signal podcast to 140 episodes and a weekly newsletter of 48,000 readers'], metrics: [{ value: '30+', label: 'brands repositioned' }], industries: ['Consumer', 'Creator economy'] },
    { id: 'mv2', featured: true, company: 'Halden & Co.', logoLetter: 'H', role: 'VP Brand', dates: '2017 – 2021', blurb: 'Led brand, content and community through two funding rounds and a move into retail.', highlights: ['Rebuilt the brand story ahead of the Series B', 'Launched a community program that grew to 60,000 members', 'Took the brand into 400 retail doors'], metrics: [{ value: '4x', label: 'revenue in three years' }], industries: ['Consumer', 'Retail'] },
    { id: 'mv3', featured: true, company: 'Northwind Goods', logoLetter: 'N', role: 'Director of Brand Strategy', dates: '2013 – 2017', blurb: 'First brand hire. Built the function, the voice and the launch playbook.', highlights: ['Named and launched three product lines', 'Wrote the voice guide still used across the company', 'Hired and led a team of nine'], metrics: [{ value: '9', label: 'person team built' }], industries: ['E-commerce', 'Consumer'] },
    { id: 'mv4', company: 'Lumen Labs', logoLetter: 'L', role: 'Senior Strategist', dates: '2010 – 2013', blurb: 'Agency strategy for consumer and hospitality clients.', industries: ['Agency'] },
    { id: 'mv5', company: 'Fieldnote', logoLetter: 'F', role: 'Associate Strategist', dates: '2008 – 2010', blurb: 'Research and messaging for early-stage clients.', industries: ['Agency'] },
    { id: 'mv6', company: 'Tidewater Coffee', logoLetter: 'T', role: 'Advisory Board', dates: '2023 – Present', label: 'Advisor', blurb: 'Brand and retail expansion.', industries: ['Consumer'] },
    { id: 'mv7', company: 'Common Thread Collective', logoLetter: 'C', role: 'Board Member', dates: '2022 – Present', label: 'Board', blurb: 'Non-profit supporting first-time founders in the creative industries.', industries: ['Non-profit'] },
    { id: 'mv8', kind: 'project', label: 'Client', company: 'Ostrea', logoLetter: 'O', role: 'Repositioning ahead of a raise', dates: '2025', blurb: 'From "sustainable seafood" to a single line the whole team could say.', metrics: [{ value: '$14M Series A closed', label: '' }], industries: ['Food & beverage'] },
    { id: 'mv9', kind: 'project', label: 'Client', company: 'Bramble Skincare', logoLetter: 'B', role: 'Fractional CMO', dates: '2024', blurb: 'Six months rebuilding brand, lifecycle and the creator program.', metrics: [{ value: '62% repeat purchase', label: '' }], industries: ['Beauty & wellness'] },
    { id: 'mv10', kind: 'project', label: 'Program', company: 'First Chapter Founders', logoLetter: 'F', role: 'Mentor, brand track', dates: '2022 – Present', blurb: 'Three cohorts a year of first-time founders.', metrics: [{ value: '90 founders mentored', label: '' }], industries: ['Education'] },
    { id: 'mv11', kind: 'project', label: 'Project', company: 'The Signal Live', logoLetter: 'S', role: 'Creator and host', dates: '2024', blurb: 'A four-city live recording tour of the podcast.', metrics: [{ value: '2,400 tickets', label: '' }], industries: ['Media'] },
  ],
  impact: [
    { value: '', label: '$40M+ raised by clients after repositioning', sub: 'Across nine companies between 2021 and 2025' },
    { value: '', label: '4x revenue in three years at Halden & Co.', sub: 'Brand, community and the move into retail' },
    { value: '', label: '48,000 weekly newsletter readers', sub: 'Grown without paid acquisition' },
    { value: '', label: '140 episodes of The Signal', sub: 'Interviews with operators behind brands people remember' },
  ],
  leadership: [
    { title: 'The Strategist', blurb: 'Sees the shape of the problem before the team starts solving it.', icon: 'compass' },
    { title: 'The Storyteller', blurb: 'Gets a room to agree on one sentence, then builds everything from it.', icon: 'book' },
    { title: 'The Coach', blurb: 'Leaves a team more capable than she found it.', icon: 'users' },
  ],
  leadershipBelief: 'Clarity is kindness. A team that can say what it does in one line makes better decisions everywhere else.',
  leadershipMeta: { mbti: 'ENFJ', enneagram: '3w2 · Achiever', yearsLeading: '12', largestTeam: '24' },
  values: [
    { name: 'Clarity', blurb: '', color: '#EAF1E6', icon: 'check', featured: true }, { name: 'Craft', blurb: '', color: '#EAF1E6', icon: 'check', featured: true },
    { name: 'Candor', blurb: '', color: '#EAF1E6', icon: 'check', featured: true }, { name: 'Curiosity', blurb: '', color: '#EAF1E6', icon: 'check', featured: true },
    { name: 'Generosity', blurb: '', color: '#EAF1E6', icon: 'check', featured: true }, { name: 'Ownership', blurb: '', color: '#EAF1E6', icon: 'check', featured: true },
    { name: 'Patience', blurb: '', color: '#EAF1E6', icon: 'check' }, { name: 'Simplicity', blurb: '', color: '#EAF1E6', icon: 'check' }, { name: 'Ethics', blurb: '', color: '#EAF1E6', icon: 'check' },
  ],
  superpowers: [
    { title: 'I find the one sentence a company has been circling for years.', blurb: 'Most teams already know what makes them different. They have just never said it plainly. I listen until I can.', icon: 'zap' },
    { title: 'I turn a founder’s story into the company’s sales tool.', blurb: 'The reason you started is usually the best pitch you have. I make it usable by the whole team.', icon: 'zap' },
    { title: 'I build audiences that show up without being paid to.', blurb: 'Newsletter, podcast, community: I have built each one from zero and can tell you which your brand actually needs.', icon: 'zap' },
  ],
  skills: [
    { name: 'Brand strategy', score: 100, featured: true }, { name: 'Positioning', score: 100, featured: true }, { name: 'Messaging', score: 100, featured: true },
    { name: 'Storytelling', score: 100, featured: true }, { name: 'Content strategy', score: 100, featured: true }, { name: 'Community building', score: 80, featured: true },
    { name: 'Workshop facilitation', score: 100, featured: true }, { name: 'Public speaking', score: 80, featured: true },
    { name: 'Go-to-market', score: 80 }, { name: 'Lifecycle marketing', score: 55 }, { name: 'Creator partnerships', score: 80 }, { name: 'Podcasting', score: 80 },
  ],
  media: [
    { id: 'mm1', featured: true, type: 'Press', title: 'The strategist teaching brands to say less', sub: 'Profile', bg: '#111111', source: 'The Brand Ledger' },
    { id: 'mm2', featured: true, type: 'Podcast', title: 'The Signal · Ep. 140: What your customers repeat', sub: 'Host', bg: '#C7B5FF', darkText: true, play: true, source: 'The Signal' },
    { id: 'mm3', featured: true, type: 'Speaking', title: 'Keynote: The Quiet Brand', sub: 'Main stage, 1,800 attendees', bg: '#670821', source: 'Northlight Summit 2025' },
    { id: 'mm4', featured: true, type: 'Portfolio', title: 'Case study: Ostrea, from category to one line', sub: 'Repositioning', bg: '#E9E6DF', darkText: true, internal: 'portfolio' },
    { id: 'mm5', type: 'Press', title: 'Why the best brands are getting quieter', sub: 'Feature', bg: '#E9E6DF', darkText: true, source: 'Founders Weekly' },
    { id: 'mm6', type: 'Press', title: '25 operators shaping consumer brands', sub: 'List', bg: '#111111', source: 'The Operator Review' },
    { id: 'mm7', type: 'Press', title: 'Q&A: Maren Voss on the one-sentence test', sub: 'Interview', bg: '#C7B5FF', darkText: true, source: 'Retail Dispatch' },
    { id: 'mm8', type: 'Press', title: 'Book review: The Quiet Brand', sub: 'Review', bg: '#670821', source: 'The Brand Ledger' },
    { id: 'mm9', type: 'Podcast', title: 'How a founder story becomes a sales tool', sub: 'Guest', bg: '#E9E6DF', darkText: true, play: true, source: 'Built to Last' },
    { id: 'mm10', type: 'Podcast', title: 'Community before campaigns', sub: 'Guest', bg: '#111111', play: true, source: 'The Second Act' },
    { id: 'mm11', type: 'Speaking', title: 'Workshop: Your brand in one sentence', sub: 'Half-day working session', bg: '#C7B5FF', darkText: true, source: 'First Chapter Founders' },
    { id: 'mm12', type: 'Speaking', title: 'Panel: Earning attention in a paid world', sub: 'Moderator', bg: '#E9E6DF', darkText: true, source: 'Consumer Forum Austin' },
    { id: 'mm13', type: 'Newsletter', title: 'The Margin · weekly notes on brand', sub: '48,000 readers', bg: '#670821', source: 'The Margin' },
    { id: 'mm14', type: 'Portfolio', title: 'Case study: Bramble Skincare, six months as CMO', sub: 'Fractional', bg: '#111111', internal: 'portfolio' },
    { id: 'mm15', type: 'Portfolio', title: 'Case study: Halden & Co. goes to retail', sub: 'In-house', bg: '#C7B5FF', darkText: true, internal: 'portfolio' },
  ],
  portfolio: [
    { id: 'pc1', title: 'Ostrea: from a category to one line', type: 'Repositioning', subtitle: 'A sustainable seafood company that needed a story investors could repeat.', image: G('#111111', '#670821'), image2: G('#670821', '#C7B5FF'),
      metrics: [{ value: '$14M', label: 'Series A closed' }, { value: '3 weeks', label: 'Sprint length' }, { value: '1', label: 'Sentence everyone uses' }],
      body: ['Ostrea came to the sprint describing themselves five different ways, depending on who was in the room. Every version was true. None of them was memorable.', 'We spent the first week listening: to the founders, to twelve customers, to the two investors who had passed. The pattern was clear. People did not remember "sustainable." They remembered that the oysters arrived the day they were harvested.', 'The new line led with that. The deck, the site and the sales script were rebuilt around it in the remaining two weeks, and the team closed their round four months later.'] },
    { id: 'pc2', title: 'Bramble Skincare: six months as CMO', type: 'Fractional CMO', subtitle: 'Rebuilding brand, lifecycle and the creator program for a growing skincare label.', image: G('#C7B5FF', '#E9E6DF'), image2: G('#E9E6DF', '#670821'),
      metrics: [{ value: '62%', label: 'Repeat purchase' }, { value: '2.1x', label: 'Email revenue' }, { value: '40', label: 'Creators in program' }],
      body: ['Bramble had strong products and a brand that looked like everyone else in the category. Acquisition costs were rising and repeat purchase was flat.', 'Over six months I rewrote the brand story around the founder’s background as a formulator, rebuilt the post-purchase emails, and replaced one-off influencer deals with a standing creator program.', 'I hired and handed over to a full-time head of brand in month five, and stayed on for a month of overlap.'] },
    { id: 'pc3', title: 'Halden & Co.: taking a direct brand into retail', type: 'In-house', subtitle: 'Four years leading brand through two rounds and 400 retail doors.', image: G('#670821', '#111111'), image2: G('#111111', '#C7B5FF'),
      metrics: [{ value: '4x', label: 'Revenue in three years' }, { value: '400', label: 'Retail doors' }, { value: '60k', label: 'Community members' }],
      body: ['Halden was a direct-to-consumer brand with a loyal audience and no presence on a shelf. Retail buyers liked the product and did not understand the brand.', 'We rebuilt the story for a shopper with four seconds, not four minutes, and launched a community program that gave the retail team real customers to point to.', 'The brand entered 400 doors over eighteen months without discounting its direct business.'] },
  ],
  store: [
    { id: 'ms1', featured: true, kind: 'Book', title: 'The Quiet Brand', blurb: 'Why the companies people remember say less, and how to become one.', price: '24' },
    { id: 'ms2', featured: true, kind: 'Course', title: 'Positioning in a Week', blurb: 'Five recorded sessions and a workbook. The sprint, on your own time.', price: '349' },
    { id: 'ms3', featured: true, kind: 'Template', title: 'The Message Map', blurb: 'The one-page template I use with every client.', price: '29' },
    { id: 'ms4', kind: 'Guide', title: 'The One-Sentence Test', blurb: 'A short guide to finding the line your team can repeat.', price: '0' },
    { id: 'ms5', kind: 'Download', title: 'Founder Story Worksheet', blurb: 'Twelve questions that turn your origin into a pitch.', price: '15' },
    { id: 'ms6', kind: 'Course', title: 'Workshop: Your Brand in One Sentence', blurb: 'A live half-day session for teams of up to 20.', price: '4500' },
  ],
  reach: [
    { platform: 'Newsletter', handle: 'The Margin', followers: '48,000', engagement: '54% open rate' },
    { platform: 'Podcast', handle: 'The Signal', followers: '31,000', engagement: 'monthly listeners' },
    { platform: 'LinkedIn', handle: 'marenvoss', followers: '62,000' },
    { platform: 'Instagram', handle: '@marenvoss', followers: '18,500' },
  ],
  audience: { age: '28–45', gender: '64% women', geo: 'US, UK, Canada' },
  education: [
    { id: 'me1', short: 'MBA', title: 'A state university business school', sub: 'Marketing · 2012' },
    { id: 'me2', short: 'BA', title: 'A liberal arts college', sub: 'English Literature · 2008' },
    { id: 'me3', short: 'Cert', title: 'Workshop Facilitation', sub: 'Certificate' },
  ],
  sections: { impact: true, superpowers: true, media: true, education: true, activeProjects: false, portfolio: true },
}

// Slug → demo profile. app/[username]/page.tsx serves these directly (no DB fetch).
// NOTE: the `sarah` fixture is intentionally NOT registered — marquee.bio/sarah must never
// serve a stock-photo stand-in for the real Sarah (her live profile is /sarahreillyengel).
export const DEMO_PROFILES: Record<string, Profile> = {
  morgan, michaela, michaelareilly: michaela,
  marenvoss: maren, sample: maren,
}
