// ─────────────────────────────────────────────────────────────────────────
// CAREER BLUEPRINT — canonical question spec.
//
// SOURCE OF TRUTH: Sarah's reference build (career_blueprint_final_1.html).
// Prompts + option descriptions are HERS, verbatim — do NOT paraphrase or
// shorten. One question per screen, grouped by `cat` (category) label.
//
// Structural changes layered on top of the reference (Sarah, 5 Aug 2026):
//   • years-exp  → slider (was free text)
//   • industry   → picklist / select (was free text)
//   • q2 interests → expanded list (REVIEW: pruning overlaps with Sarah)
//   • prof-id    → the 7 PROFILE_TYPES, self-select, pick 2 (supersedes the
//                  reference's old 8-option "identify professionally" — this
//                  was our deliberate redesign; confirm if you want otherwise)
// ─────────────────────────────────────────────────────────────────────────

// ── PROFILE TYPES ──────────────────────────────────────────────────────────
// Self-selected (NOT AI-diagnosed). Suggested to pick 2; Professional may
// stand alone. Drives the researched output. "Student" is not a type.
export type ProfileTypeId =
  | "professional" | "executive" | "entrepreneur" | "coach"
  | "creator" | "creative" | "investor";

export interface ProfileType {
  id: ProfileTypeId;
  label: string;
  oneLiner: string; // shown as the option description
  standalone?: boolean;
}

export const PROFILE_TYPES: ProfileType[] = [
  { id: "professional", label: "Professional", standalone: true, oneLiner: "You want to get hired or grow in your field, and show what you're capable of — beyond a LinkedIn page." },
  { id: "executive", label: "Executive", oneLiner: "You lead through teams and organizations: strategy, scale, and the people who deliver it." },
  { id: "entrepreneur", label: "Entrepreneur", oneLiner: "You build businesses and own the upside — you'd rather make the thing than manage it." },
  { id: "coach", label: "Coach", oneLiner: "You grow other people — advising, teaching, and guiding them through change." },
  { id: "creator", label: "Creator", oneLiner: "You build an audience and monetize your name: content, a following, a platform that's yours." },
  { id: "creative", label: "Creative", oneLiner: "You're a maker — design, writing, art, film — and the craft itself is the product." },
  { id: "investor", label: "Investor", oneLiner: "You put capital to work — angel, fund, board, or advisor — and back other people's bets." },
];

// ── QUESTIONS ────────────────────────────────────────────────────────────────
export type QType =
  | "text" | "single" | "multi" | "slider" | "select"
  | "profiletype" | "peoplelist" | "matrix";

export type QOption = string | { label: string; desc?: string };

export interface BlueprintQuestion {
  id: string;
  cat: string; // category label shown in the meta row
  type: QType;
  prompt: string; // Sarah's wording — verbatim
  maxSelect?: number;
  options?: QOption[];
  matrixRows?: string[];
  matrixHeader?: string; // left-column header for matrices
  // slider config
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  researchTrigger?: "people" | "companies";
}

// Industry picklist (q: industry). DRAFT — for Sarah's review.
export const INDUSTRIES: string[] = [
  "Technology / Software", "Financial Services", "Healthcare", "Media & Entertainment",
  "Retail & E-commerce", "Consumer Goods", "Education", "Real Estate",
  "Manufacturing & Industrial", "Professional Services / Consulting", "Marketing & Advertising",
  "Legal", "Government / Public Sector", "Nonprofit / Social Impact", "Hospitality & Travel",
  "Energy & Climate", "Construction", "Fashion & Beauty", "Food & Beverage", "Sports", "Other",
];

export const QUESTIONS: BlueprintQuestion[] = [
  { id: "years-exp", cat: "Profile", type: "slider", prompt: "How many years of professional experience do you have?", min: 0, max: 40, step: 1, unit: "years" },
  { id: "job-title", cat: "Profile", type: "text", prompt: "What's your current job title?" },
  { id: "industry", cat: "Profile", type: "select", prompt: "What industry are you in?", options: INDUSTRIES },

  // prof-id → the 7 profile types (self-select, pick 2). oneLiner = description.
  { id: "prof-id", cat: "Profile", type: "profiletype", maxSelect: 2, prompt: "How do you identify professionally today?" },

  { id: "q1", cat: "Goals", type: "multi", maxSelect: 3, prompt: "What are you looking to do in your career?", options: [
    { label: "Get hired", desc: "Find a new full-time role." },
    { label: "Grow my career", desc: "Advance where I am or move into leadership." },
    { label: "Increase my visibility", desc: "Become better known for my expertise and attract more opportunities." },
    { label: "Monetize my expertise", desc: "Generate income through consulting, advisory, speaking, content, or other opportunities." },
    { label: "Build a business", desc: "Start and scale a business of my own." },
    { label: "Change direction", desc: "Explore a new path, industry, or chapter." },
  ]},

  // REVIEW: interests — reference's 12 + Sarah's additions. Prune overlaps together.
  { id: "q2", cat: "Identity", type: "multi", maxSelect: 5, prompt: "What are you genuinely into?", options: [
    "Tech, AI & Innovation", "Real Estate, Property & Investing", "Architecture & Spatial Design",
    "Art, Design & Aesthetics", "Business & Entrepreneurship", "Writing, Content & Media",
    "Health, Wellness & Psychology", "Money, Investing & Finance", "Science & Discovery",
    "Education & Mentorship", "Food, Cooking & Hospitality", "Sports, Fitness & Adventure",
    // Sarah's additions (5 Aug):
    "Fashion & Beauty", "Outdoors & Nature", "Gardening", "Mindset & Personal Growth",
    "Gaming", "Climate & Sustainability", "Government & Policy", "Legal", "Entertainment", "Healthcare",
  ]},

  { id: "q3", cat: "Identity", type: "text", prompt: "What did you love doing as a kid, before you had to care about money or job titles?" },
  { id: "q4", cat: "Identity", type: "text", prompt: "What do your closest friends or colleagues tell you that you should be doing for a living?" },
  { id: "q5", cat: "Identity", type: "text", prompt: "What do people consistently thank you for the most — inside and outside of your day job?" },
  { id: "q6", cat: "Identity", type: "text", prompt: "What's something you built, designed, or solved that you didn't get proper credit for?" },
  { id: "q7", cat: "Identity", type: "text", prompt: "If your social media feed and podcast history could speak, what single topic dominates your private attention?" },
  { id: "q8", cat: "Identity", type: "text", prompt: "What problems are you exceptionally good at solving?" },

  { id: "q10", cat: "Strengths", type: "multi", maxSelect: 5, prompt: "What kind of work are you naturally drawn to?", options: [
    { label: "Research & analysis", desc: "Research, analytics, forecasting, uncovering insights" },
    { label: "Engineering & technology", desc: "Software development, AI, automation, technical architecture" },
    { label: "Design & creative", desc: "Graphic design, UX/UI, interiors, branding, visual design" },
    { label: "Building & innovating", desc: "Creating new products, services, businesses, or ideas" },
    { label: "Writing & positioning", desc: "Writing, messaging, positioning ideas, simplifying complex concepts" },
    { label: "Strategy & planning", desc: "Connecting ideas, solving business challenges, planning what comes next" },
    { label: "Leadership & management", desc: "Making decisions, developing people, setting direction, leading teams" },
    { label: "Coaching & advising", desc: "Mentoring, teaching, guiding people or organizations" },
    { label: "Project management & operations", desc: "Running projects, improving processes, organizing work, driving execution" },
    { label: "Sales, investing & dealmaking", desc: "Selling, fundraising, investing, partnerships, closing deals" },
    { label: "Brand building & content", desc: "Creating content, growing an audience, building a personal or company brand" },
  ]},

  { id: "q11", cat: "Strengths", type: "multi", maxSelect: 3, prompt: "Which of these are you?", options: [
    { label: "I start things from scratch", desc: "The Visionary who thrives on a blank canvas" },
    { label: "I make what exists better", desc: "The Optimizer who polishes and refines" },
    { label: "I connect people and ideas", desc: "The Bridge who spots hidden patterns" },
    { label: "I go deep and master one thing", desc: "The Craftsman who hates surface knowledge" },
    { label: "I fix what's broken", desc: "The Troubleshooter who restores order" },
    { label: "I scale what works", desc: "The Builder who turns wins into systems" },
  ]},

  { id: "q12", cat: "Strengths", type: "text", prompt: "What expertise could someone hire you for today?" },
  { id: "q13", cat: "Strengths", type: "text", prompt: "What's one achievement that best showcases your strengths?" },
  { id: "q14", cat: "Strengths", type: "text", prompt: "What kind of work energizes you so much that you lose track of time?" },
  { id: "q15", cat: "Strengths", type: "text", prompt: "Of all the roles you've played, which specific task would you gladly do for free?" },

  { id: "q17", cat: "Strengths", type: "multi", maxSelect: 3, prompt: "How do you actually like to get good at something?", options: [
    { label: "By diving in and doing it", desc: "Learning through hands-on experience" },
    { label: "By experimenting", desc: "Testing ideas, trying different approaches, learning as you go" },
    { label: "By watching experts", desc: "Observing how others work and modeling what they do" },
    { label: "Through coaching or mentorship", desc: "Learning from feedback, guidance, and accountability" },
    { label: "By reading and researching", desc: "Books, articles, case studies, and deep learning" },
    { label: "Through courses and structured learning", desc: "Classes, certifications, workshops, and training" },
    { label: "By collaborating with others", desc: "Brainstorming, asking questions, and learning together" },
    { label: "By teaching others", desc: "Explaining ideas, mentoring, and sharing knowledge" },
  ]},


  { id: "q19", cat: "Profile", type: "single", prompt: "What kind of visibility do you want in your career?", options: [
    { label: "Public thought leader", desc: "I want to build a public profile through speaking, writing, or content." },
    { label: "Industry expert", desc: "I want to be well known and respected within my field." },
    { label: "Known by the right people", desc: "I don't need a large audience. I want recruiters, clients, collaborators, or decision-makers to know my work." },
    { label: "Private leader", desc: "I prefer to make an impact behind the scenes rather than build a public profile." },
  ]},

  { id: "q20", cat: "Reality", type: "multi", maxSelect: 2, prompt: "What professional standard are you known for championing at work?", options: [
    { label: "Efficiency & Logic", desc: "Solving problems with speed and common sense." },
    { label: "Quality & Craftsmanship", desc: "Taking pride in doing things exceptionally well." },
    { label: "Integrity & Fairness", desc: "Doing what's right, even when it's difficult." },
    { label: "Ownership & Autonomy", desc: "Empowering people to take ownership and do their best work." },
    { label: "Truth & Objectivity", desc: "Making decisions based on facts, not assumptions." },
    { label: "People & Empathy", desc: "Building trust and putting people first." },
  ]},

  { id: "q21", cat: "Reality", type: "multi", maxSelect: 3, prompt: "What have been your biggest friction points at work?", options: [
    { label: "Weak leadership", desc: "No clear direction, support, or accountability." },
    { label: "Lack of autonomy", desc: "Micromanagement, unnecessary approvals, or a lack of trust." },
    { label: "Corporate bureaucracy", desc: "Too many meetings, slow decisions, and unnecessary red tape." },
    { label: "Misaligned values", desc: "A culture that didn't reflect what mattered to me." },
    { label: "Limited opportunity", desc: "No room to grow, advance, or increase my income." },
    { label: "Lack of flexibility", desc: "Rigid schedules, location requirements, or poor work-life balance." },
  ]},

  { id: "q22", cat: "Reality", type: "text", prompt: "What's one thing you'll never accept again in your career?" },
  { id: "q23", cat: "Reality", type: "text", prompt: "If you could overthrow one broken status quo in your industry, what would it be?" },

  { id: "q24", cat: "Reality", type: "multi", maxSelect: 5, prompt: "What must be true for you to thrive at work?", options: [
    { label: "Flexibility & freedom", desc: "Control over when, where, and how I work." },
    { label: "High earning potential", desc: "Strong opportunities to grow my income." },
    { label: "Ownership & independence", desc: "The freedom to make decisions and own my work." },
    { label: "Learning & growth", desc: "Continuous learning, new challenges, and personal growth." },
    { label: "Recognition & appreciation", desc: "Feeling valued for the work I do." },
    { label: "Collaborative teamwork", desc: "Working with people I trust and enjoy." },
    { label: "Mission & impact", desc: "Doing meaningful work that aligns with my values." },
  ]},

  { id: "q25", cat: "Reality", type: "single", prompt: "When it comes to money, what's true for you right now?", options: [
    { label: "I need to make more", desc: "Financial pressure is high, and increasing my income is my top priority." },
    { label: "Big money goals", desc: "I'm pursuing significant wealth, building multiple income streams, and scaling." },
    { label: "Money is fine, I want meaning", desc: "I'm financially secure and focused on purpose, fulfillment, and impact." },
    { label: "The money's great, but I'm burned out", desc: "I'm earning well, but the work is no longer sustainable." },
  ]},

  { id: "risk", cat: "Reality", type: "single", prompt: "How much risk are you willing to take in your career right now?", options: [
    "I need stability and predictable income.",
    "I'm open to calculated risks.",
    "I'm ready to make a significant change.",
    "I'm optimizing for long-term upside over short-term certainty.",
  ] },

  { id: "q26", cat: "Reality", type: "multi", maxSelect: 4, prompt: "What's standing in the way between you and your career goals?", options: [
    { label: "Financial constraints", desc: "I need a steady paycheck or have financial obligations." },
    { label: "Too many priorities", desc: "My time and attention are stretched too thin." },
    { label: "Fear & self-doubt", desc: "Fear of failure, uncertainty, or imposter syndrome." },
    { label: "Lack of clarity", desc: "I'm not sure what the right next step is." },
    { label: "Not knowing where to start", desc: "I know what I want, but I'm unsure how to make it happen." },
    { label: "Lack of network or connections", desc: "I don't have the right relationships or access to opportunities." },
  ]},


  { id: "q29", cat: "Vision", type: "multi", maxSelect: 4, prompt: "What are you watching others do that makes you think 'I wish that was me'?", options: [
    { label: "Built a personal brand as an expert", desc: "Became known and respected for their expertise in a field." },
    { label: "Started and scaled a successful business", desc: "Created and grew a company that's thriving." },
    { label: "Left a traditional job for freedom", desc: "Chose flexibility, autonomy, and control over their work." },
    { label: "Made significant income doing their own thing", desc: "Created substantial wealth through consulting, digital products, or entrepreneurship." },
    { label: "Became a public thought leader", desc: "Built an audience and influence through content or speaking." },
    { label: "Transitioned into their dream career", desc: "Made a successful pivot to work they're passionate about." },
    { label: "Built something meaningful that makes a difference", desc: "Created work with real impact and purpose." },
    { label: "Balanced work with a great life", desc: "Has success AND time freedom, family, and well-being." },
  ]},

  { id: "q30", cat: "Vision", type: "text", prompt: "If you were guaranteed 100% success and knew you couldn't fail, what would you go after?" },
  { id: "q31", cat: "Vision", type: "text", prompt: "Name 3 to 5 dream jobs or businesses that would embody your core beliefs. Dream big." },

  // Options aligned to Marquee's canonical archetype set (build-preview / recruiter ARCHETYPES).
  { id: "q32", cat: "Vision", type: "multi", maxSelect: 3, prompt: "Which career archetypes do you identify with most?", options: [
    { label: "The Strategist", desc: "You provide vision, strategic direction, and outside-the-box thinking, like a chess player." },
    { label: "The Change Catalyst", desc: "You thrive in messy situations you can fix, but get bored when things are calm." },
    { label: "The Transactor", desc: "You thrive on negotiations and deal-making, skilled at spotting and tackling new opportunities." },
    { label: "The Builder", desc: "You dream of creating something and have the talent and determination to make your dreams come true." },
    { label: "The Innovator", desc: "You are a creative idea generator with a great capacity to solve extremely difficult problems." },
    { label: "The Processor", desc: "You like organizations to run smoothly, like a well-oiled machine, and set up structures and systems." },
    { label: "The Coach", desc: "You know how to get the best out of people and create a high-performance culture." },
    { label: "The Communicator", desc: "You are a great influence and significantly impact people and your surroundings." },
  ]},

  { id: "q34", cat: "Vision", type: "multi", maxSelect: 4, prompt: "When you look at your future, what are you trying to build?", options: [
    { label: "Time abundance", desc: "Freedom over my schedule and how I spend my time." },
    { label: "Peace of mind", desc: "Less stress, more balance, and sustainable success." },
    { label: "Success, wealth & recognition", desc: "Reaching my full potential and being recognized for my work." },
    { label: "A slower, more intentional life", desc: "A life where work supports what matters most." },
    { label: "Freedom to choose", desc: "The ability to decide what I work on, who I work with, and how I live." },
    { label: "A meaningful legacy", desc: "Building something that makes a lasting difference." },
  ]},

  { id: "admire", cat: "Inspiration", type: "peoplelist", maxSelect: 3, researchTrigger: "people", prompt: "Whose career do you admire? (Select up to three people.)" },

  { id: "want-from-career", cat: "Inspiration", type: "multi", maxSelect: 5, prompt: "What income and opportunity paths appeal to you?", options: [
    "Get paid for advisory or consulting work", "Build and sell courses or educational products", "Start a services-based business",
    "Get paid speaking engagements", "Create premium content (Substack, newsletter, etc.)", "Build digital products or tools",
    "Lead a community or membership", "Become an industry expert or thought leader", "Get board or council roles",
    "Build multiple income streams", "Land fractional/part-time leadership roles", "Create content that generates passive income",
  ]},

  { id: "exceptional-at", cat: "Strengths", type: "text", prompt: "What are you already exceptional at? Your superpowers. (List up to seven.)" },
  { id: "growth-skills", cat: "Growth", type: "text", prompt: "What skills are you looking to acquire? (List up to five.)" },

  { id: "work-with-you", cat: "Opportunities", type: "matrix", matrixHeader: "Opportunity", prompt: "How can people work with you today? What would you like to add in the future?", matrixRows: [
    "Full-time role", "Fractional work", "Consulting", "Project work", "Advisory", "Board roles", "Speaking",
    "Coaching", "Workshops", "Content partnerships", "Digital products", "Courses", "Community/Membership",
  ]},


  { id: "discovery", cat: "Visibility", type: "matrix", matrixHeader: "Discovery Channel", prompt: "How do people discover you today? How would you like them to?", matrixRows: [
    "My website", "AI search", "Word of mouth referrals", "Speaking engagements", "My writing or content",
    "My personal brand on social media", "My work and portfolio", "Search engines", "Media coverage",
    "Recommendations", "LinkedIn", "Other professional communities",
  ]},

  { id: "loc", cat: "Final", type: "text", prompt: "Where are you based?" },
];

export const QUESTION_COUNT = QUESTIONS.length; // 43

// Intro / "what you'll get" — verbatim from Sarah's reference.
export const INTRO = {
  title: "The Career Blueprint",
  subtitle: "Design a career that fits who you are—and the life you want to build.",
  body:
    "Most people never intentionally design their careers. This Blueprint helps you uncover your strengths, identify your best opportunities, and create a clear plan to build a career with more purpose, income, and freedom.",
  eyebrow: "What you'll get",
  items: [
    { icon: "📍", title: "Your Career Blueprint", desc: "A personalized roadmap based on your strengths, goals, and work style." },
    { icon: "🛠️", title: "Your Strengths & Superpowers", desc: "The skills, experiences, and strengths that create your greatest value." },
    { icon: "💼", title: "Career & Income Opportunities", desc: "Tailored recommendations for roles, industries, and ways to earn—including consulting, advisory, speaking, leadership, entrepreneurship, and more." },
    { icon: "📅", title: "A 30-Day Action Plan", desc: "Clear next steps, tools, and resources to help you move forward." },
    { icon: "📚", title: "Recommended Resources", desc: "Books, podcasts, communities, and people to help accelerate your journey." },
  ],
} as const;
