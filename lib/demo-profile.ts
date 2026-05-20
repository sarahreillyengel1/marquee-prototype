// Hardcoded demo profile served at marquee.bio/demo
// Used for landing page preview + "See a profile" demo modal.
// No DB dependency — renders identically to a real generated profile.

export const DEMO_PROFILE = {
  profile: {
    id: "demo",
    user_id: "demo",
    username: "demo",
    name: "Maya Okonkwo",
    location: "Brooklyn, NY",
    // Tasteful, professional placeholder portrait — easy to swap with a real upload
    avatar_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&q=85",
    work_type: "Fractional",
    work_status: "Open to the right thing",
    work_env: ["Remote", "Hybrid"],
    hours_per_week: 20,
    salary_min: null,
    salary_max: null,
    rate_min: 150,
    rate_max: 250,
    rate_private: false,
    current_title: "Head of Product Marketing",
    current_company: "Meridian Health",
    years_experience: 12,
    years_leading: 8,
    ai_headline:
      "Product marketing operator who turns early traction into category narrative — most recently at a Series C vertical SaaS.",
    ai_career_arc:
      "I've spent a decade turning ambiguous early-stage products into stories buyers actually understand. Started in agency strategy at Ogilvy, became the first marketing hire at a YC Series A fintech, built the product marketing function at Brex from zero to seven, then scaled the PMM org at Lattice through 4× ARR growth. Most recently I led GTM for Meridian Health through their $45M Series C. The through-line isn't a title — it's the moment a company stops describing what it does and starts owning what it stands for. That's the work I keep getting called back to.",
    ai_pull_quote:
      "I wish more people knew that the best product marketers aren't good writers — they're good listeners who happen to write things down.",
    ai_leadership_summary:
      "I lead as a Builder first, Coach second. I'm at my best setting direction inside ambiguity — deciding what the story is before anyone else can tell me it's wrong — and I measure my leadership by how quickly the people around me stop needing me. I've managed teams of up to fourteen across marketing, content, and design, and the work I'm proudest of is the three direct reports who now lead marketing functions of their own at other companies.",
    ai_insights_summary:
      "Most product marketers overweight frameworks and underweight field time. The real leverage isn't in messaging houses — it's in sitting on twenty sales calls in a row until you can finish the buyer's sentence. I changed my mind about positioning being an art; it's a forensic exercise, and the companies that treat it that way win.",
    theme: "light",
    social_links: {
      linkedin: "https://linkedin.com/in/mayaokonkwo",
      twitter: "https://twitter.com/mayaokonkwo",
      website: "https://mayaokonkwo.com",
      email: "hello@mayaokonkwo.com",
    },
    elviis_plus: [
      {
        module_type: "newsletter",
        title: "The Narrative Brief",
        description:
          "Weekly notes on product marketing, positioning, and the art of going to market before you're ready. ~6K subscribers.",
        url: "https://narrativebrief.substack.com",
      },
      {
        module_type: "speaking",
        title: "SaaStr Annual 2025",
        context: "Panel — The 0-to-1 PMM Playbook",
        year: 2025,
        url: "https://saastr.com/annual",
      },
      {
        module_type: "speaking",
        title: "Product Marketing Summit",
        context: "Keynote — Why Category Design Isn't Positioning",
        year: 2024,
      },
      {
        module_type: "publications",
        title: "Why Most Positioning Work Fails Before It Starts",
        context: "First Round Review",
        year: 2024,
        url: "https://review.firstround.com",
      },
      {
        module_type: "publications",
        title: "The PMM Org That Actually Scales",
        context: "Reforge Blog",
        year: 2023,
        url: "https://reforge.com/blog",
      },
      {
        module_type: "media",
        title: "Lenny's Podcast — Episode 142",
        context: "On building a PMM function from scratch at Brex",
        year: 2024,
        url: "https://www.lennysnewsletter.com/podcast",
      },
      {
        module_type: "media",
        title: "The Marketing Operators Podcast",
        context: "On winning positioning workshops",
        year: 2024,
        url: "https://marketingoperatorspodcast.com/episodes/maya-okonkwo",
      },
      {
        module_type: "case_study",
        title: "Meridian Health Series C Narrative",
        context: "The positioning work behind the $45M raise",
        description:
          "Walks through the discovery process, the customer interviews, the messaging tests, and the narrative that ultimately anchored the round.",
        url: "https://mayaokonkwo.com/case-studies/meridian-series-c",
        year: 2024,
      },
      {
        module_type: "portfolio",
        title: "Positioning Workshop Deck",
        context: "The exact deck I use in 90-minute positioning workshops",
        description:
          "Open-source deck used with founders and PMM teams. Covers the 4-question diagnostic, customer-language extraction, and the why-now sharpening exercise.",
        url: "https://mayaokonkwo.com/portfolio/positioning-workshop",
        year: 2024,
      },
      {
        module_type: "portfolio",
        title: "PMM Operating System — Lattice",
        context: "The internal docs and operating rhythm I built at Lattice",
        description:
          "Compiled hiring rubrics, sprint cadence, competitive-intel SLAs, and product-launch frameworks. Lattice still runs on most of it. Available on request.",
        year: 2022,
      },
      {
        module_type: "advisory",
        title: "Advisor",
        context: "Three early-stage B2B SaaS startups (Series A–B)",
        description: "Quarterly positioning and GTM advisory work.",
      },
      {
        module_type: "service",
        title: "Mentor — On Deck Marketing Fellowship",
        context: "2023 – Present",
        description: "Mentoring 4 PMM/marketing leaders per cohort since 2023.",
      },
      {
        module_type: "projects",
        title: "The PMM Stack — open-source resource library",
        description:
          "300+ curated frameworks, examples, and templates for product marketers. ~12K monthly visits.",
        url: "https://pmmstack.com",
      },
    ],
    generated_at: new Date().toISOString(),
  },
  workHistory: [
    {
      id: "wh1",
      role_title: "Head of Product Marketing",
      company: "Meridian Health",
      start_date: "2022-03",
      end_date: "Present",
      is_current: true,
      sector: "HealthTech",
      stage: "Series C",
      original_bullets: [
        "Built the product marketing function from zero — hired and developed a team of 9 across PMM, content, and growth marketing",
        "Led positioning work that anchored the $45M Series C narrative; the category framing was cited in the lead investor's public memo",
        "Grew inbound MQLs 3.4× (120→410/month) and improved MQL→SQL conversion 2.1× over 14 months",
        "Shipped the company-wide rebrand from 'workflow tool' to 'care operations platform'",
        "Co-designed the enterprise sales playbook that closed 7 of the top 10 target accounts",
      ],
      ai_narrative:
        "Joined as the first marketing hire post-Series B. Built the PMM function from scratch, led the positioning work that anchored the Series C narrative, and grew inbound pipeline 3.4× in 14 months. Shipped the rebrand that repositioned Meridian from 'workflow tool' to 'care operations platform.' Now leading a team of 9 across PMM, content, and growth.",
      defining_text: "First time owning a category narrative end-to-end.",
      display_order: 0,
    },
    {
      id: "wh2",
      role_title: "Director, Product Marketing",
      company: "Lattice",
      start_date: "2020-01",
      end_date: "2022-02",
      is_current: false,
      sector: "B2B SaaS",
      stage: "Series E",
      original_bullets: [
        "Scaled the PMM team from 2 to 7 through a period of 4× ARR growth",
        "Owned messaging and GTM for the Performance product line; three direct reports now lead marketing at Notion, Vanta, and Census",
        "Launched three major product lines including the manager experience overhaul that became Lattice's flagship product",
        "Ran competitive intel function — every enterprise deal >$100K used a custom battlecard within 48 hours of request",
        "Co-led the brand refresh that took Lattice from 'HR tool' to 'people success platform'",
      ],
      ai_narrative:
        "Owned messaging and GTM for the Performance product line during a period of 4× ARR growth. Launched three major product lines, built the PMM team from two to seven, and ran the competitive intelligence function that informed every enterprise deal over $100K. Co-led the brand refresh that took Lattice from 'HR tool' to 'people success platform.'",
      display_order: 1,
    },
    {
      id: "wh3",
      role_title: "Senior Product Marketing Manager",
      company: "Brex",
      start_date: "2018-06",
      end_date: "2019-12",
      is_current: false,
      sector: "FinTech",
      stage: "Series B",
      original_bullets: [
        "First PMM hire — built the function end-to-end (messaging, sales enablement, competitive intel, launch playbook)",
        "Owned Brex Cash launch: 40K activated accounts in 90 days, 2× plan; $1.2M attached revenue in Q1",
        "Wrote the positioning that carried Brex from 'startup credit card' to 'full financial platform'",
        "Designed the sales enablement program that scaled the AE team from 12 to 40",
      ],
      ai_narrative:
        "First PMM hire. Stood up the function end-to-end, launched Brex Cash to 40K customers in the first 90 days, and wrote the positioning that carried Brex from 'startup card' to 'full financial platform.' Built the early sales enablement program and the competitive intel team that became standard at every fintech afterward.",
      defining_text:
        "Taught me that PMM is category design when you're early enough.",
      display_order: 2,
    },
    {
      id: "wh4",
      role_title: "Product Marketing Manager",
      company: "Asana",
      start_date: "2016-08",
      end_date: "2018-05",
      is_current: false,
      sector: "B2B SaaS",
      stage: "Pre-IPO",
      original_bullets: [],
      ai_narrative:
        "Owned the Asana Premium tier launch and led product marketing for the enterprise upmarket motion. Shipped the messaging refresh behind the move from 'task manager' to 'work graph,' which became the foundation Asana later took public.",
      display_order: 3,
    },
    {
      id: "wh5",
      role_title: "Brand Strategist",
      company: "Ogilvy",
      start_date: "2013-08",
      end_date: "2016-07",
      is_current: false,
      sector: "Agency",
      stage: "Enterprise",
      original_bullets: [],
      ai_narrative:
        "Three years of brand strategy work across F500 accounts — IBM, Nestlé, American Express. Learned story architecture before I learned software. Left when I realized the best positioning work wasn't happening in agencies anymore — it was happening at growth-stage startups with real product to back the story up.",
      display_order: 4,
    },
  ],
  skills: [
    // Expert (5) — featured prominently, max 5
    { skill_name: "Positioning", proficiency: 5, category: "Marketing & GTM" },
    { skill_name: "Product Marketing", proficiency: 5, category: "Marketing & GTM" },
    { skill_name: "GTM Strategy", proficiency: 5, category: "Marketing & GTM" },
    { skill_name: "Messaging", proficiency: 5, category: "Marketing & GTM" },
    { skill_name: "Brand Strategy", proficiency: 5, category: "Creative" },

    // Advanced (4)
    { skill_name: "Competitive Intelligence", proficiency: 4, category: "Marketing & GTM" },
    { skill_name: "Customer Research", proficiency: 4, category: "Marketing & GTM" },
    { skill_name: "Content Marketing", proficiency: 4, category: "Marketing & GTM" },
    { skill_name: "Product Launches", proficiency: 4, category: "Marketing & GTM" },
    { skill_name: "Sales Enablement", proficiency: 4, category: "Marketing & GTM" },
    { skill_name: "Team Management", proficiency: 4, category: "Leadership & Management" },
    { skill_name: "Hiring", proficiency: 4, category: "Leadership & Management" },
    { skill_name: "Executive Communication", proficiency: 4, category: "Leadership & Management" },
    { skill_name: "Coaching", proficiency: 4, category: "Leadership & Management" },
    { skill_name: "Copywriting", proficiency: 4, category: "Creative" },
    { skill_name: "Category Design", proficiency: 4, category: "Marketing & GTM" },

    // Proficient (3)
    { skill_name: "Customer Discovery", proficiency: 3, category: "Product & Design" },
    { skill_name: "Demand Generation", proficiency: 3, category: "Marketing & GTM" },
    { skill_name: "Change Management", proficiency: 3, category: "Leadership & Management" },
    { skill_name: "Performance Management", proficiency: 3, category: "Leadership & Management" },
    { skill_name: "Organizational Design", proficiency: 3, category: "Leadership & Management" },
    { skill_name: "A/B Testing", proficiency: 3, category: "Product & Design" },
    { skill_name: "Pricing", proficiency: 3, category: "Marketing & GTM" },
    { skill_name: "Public Speaking", proficiency: 3, category: "Creative" },

    // Working knowledge (2)
    { skill_name: "SQL", proficiency: 2, category: "Data & Analytics" },
    { skill_name: "Figma", proficiency: 2, category: "Product & Design" },
    { skill_name: "Notion", proficiency: 2, category: "Other" },

    // Foundational (1)
    { skill_name: "Python", proficiency: 1, category: "Engineering & Technical" },
    { skill_name: "Webflow", proficiency: 1, category: "Engineering & Technical" },
  ],
  answers: {
    career_themes: [
      "Early-stage PMM hire",
      "Category narrative specialist",
      "Builder → Coach operator",
      "B2B SaaS + FinTech veteran",
      "People leader 8+ years",
    ],
    e_now:
      "Leading product marketing at Meridian Health through our Series C, rebuilding the team for the next phase of growth — getting us from $20M to $80M ARR.",
    e_next:
      "A VP of Marketing role at a Series B/C company where positioning is the unlock — somewhere the product works but the story hasn't caught up. Ideally healthcare, fintech, or vertical SaaS where the buyer journey is long and the narrative actually moves the deal.",
    e_through_line:
      "People call me when the product is working but no one can explain why it matters. I excavate the story that's already in the company and give it back to them in a way they can actually use.",
    l_style:
      "Direct, calm, high-context. I give the why, trust the how, and show up when things get hard. I'd rather be respected than liked, but my best teams are both. I run on truth-telling and I expect it back.",
    l_archetypes: { primary: "builder", secondary: "coach" },
    l_years: 8,
    l_team_size: 14,
    l_belief:
      "Most people think leadership is about clarity. I think it's about tolerating ambiguity longer than everyone else in the room — long enough for the real answer to show up instead of the obvious one.",
    l_mbti: "INTJ",
    l_enneagram: "5 — The Investigator",
    v_values: [
      "Directness",
      "Curiosity",
      "Impact",
      "Accountability",
      "Growth",
    ],
    v_needs: ["I'm autonomous", "I'm challenged", "I matter"],
    v_culture:
      "I do my best work where hard conversations happen early, where the bar is set by the quality of the question and not the title of the person asking, and where it's safe to be wrong out loud.",
    wp_availability: "Within 30 days",
    wp_hours: 20,
    impact_highlights: [
      {
        headline: "Grew inbound pipeline 3.4× in 14 months",
        context: "Meridian Health, 2023",
        story:
          "Rebuilt the entire top-of-funnel narrative from product features to a problem-first category story. Inbound MQLs went from 120/mo to 410/mo, with a 2.1× improvement in MQL→SQL conversion. Closed-won grew 2.8× over the same period.",
      },
      {
        headline: "Anchored the $45M Series C narrative",
        context: "Meridian Health, 2024",
        story:
          "Led the positioning work that moved Meridian from 'healthcare workflow tool' to 'care operations platform.' Became the narrative the CEO used in every investor meeting. The lead investor cited the category framing in their public memo.",
      },
      {
        headline: "Launched Brex Cash to 40K customers in 90 days",
        context: "Brex, 2019",
        story:
          "First PMM at Brex. Owned the launch end-to-end — messaging, sales enablement, comms, paid, product marketing site, partner co-marketing. Hit 40K activated accounts in the first quarter, 2× plan. Generated $1.2M in attached revenue in Q1.",
      },
      {
        headline: "Built the Lattice PMM team from 2 to 7",
        context: "Lattice, 2020–2022",
        story:
          "Scaled the function through 4× ARR growth. Hired and developed three direct reports who now lead marketing functions of their own at Notion, Vanta, and Census. Designed the PMM operating system Lattice still uses today.",
      },
    ],
    ii_wish:
      "I wish more people knew that the best product marketers aren't good writers — they're good listeners who happen to write things down.",
    ii_bring:
      "I walk into my first week already knowing what the buyer thinks, because I've spent 30 hours watching Gong calls before my start date. That's the work that never shows up in a job description but it's the difference between PMM that sounds smart and PMM that closes deals.",
    ii_changed:
      "I used to believe positioning was creative work. Now I think it's a forensic exercise — you're not inventing a story, you're excavating one. The companies that try to invent a story almost always lose; the ones that find the one already there almost always win.",
    ii_field:
      "Most people in product marketing think their job is to make the product sound better. It's actually to make the buyer sound more precise about their own problem. Get that right and the product sells itself.",
    ii_quotes: [
      {
        text:
          "Maya ran the best positioning workshop I've ever been in. Three hours and we had the pitch we'd been trying to write for nine months. She did in an afternoon what two agencies couldn't do in a quarter.",
        name: "Sarah K.",
        relationship: "CEO, Meridian Health",
      },
      {
        text:
          "She's the reason three of us now run marketing somewhere else. Nobody taught me more about the craft — or about how to talk to a CEO without flinching.",
        name: "Jordan M.",
        relationship: "Direct report at Lattice, 2020–2022 · now VP Marketing at Census",
      },
      {
        text:
          "Working with Maya is what I imagine working with a really good editor must be like. You hand her something messy and she hands back exactly what you were trying to say in the first place.",
        name: "Henrik T.",
        relationship: "Product Lead at Brex, 2019",
      },
    ],
  },
};
