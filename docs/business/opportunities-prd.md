# Marquee Opportunities — PRD

**Status, Oct 21 2026.** Sarah's decision: Phase 1 is curation only. Sarah pastes links, confirms the fields, tags the type of work and publishes. The public page shows each listing with "Apply on company site." No employer invites, no claims, no Apply with Marquee, no automated sourcing in Phase 1. Those sections below are kept for later phases. Fractional sources are the first research priority, delivered as a document, not integrations.

**Scope note, Oct 21 2026 (Sarah):** not only executives. Roles for people with 5+ years of experience, including social media, paid ads, content, UI/UX design, accounting and the like. Fractional and startup roles first.

**Phase 1 build (about ten days):**
1. Tables and the admin page: paste a link, confirm fields, tag, publish, feature, pause, close.
2. marquee.bio/opportunities: search; filters for type of work, function, location and remote; newest; featured; source and last-verified line; Apply on company site. No account needed to browse.
3. Save and share for members, sign-up attribution, a weekly check that each link still opens.
4. `docs/business/fractional-sources.md`: the source feasibility matrix.

---

# Marquee Opportunities Engine
## Updated Product Requirements Document
**Phase 1: Curated Opportunities, Professional Acquisition & Employer Activation**

### 1. Product objective

Build an automated sourcing, curation, and publishing system within Marquee that maintains approximately **250 active, high-quality professional opportunities** at any given time.

The objective is not to aggregate the largest number of jobs. It is to identify the most relevant opportunities for Marquee's professional community and use them to accelerate professional acquisition, engagement, employer adoption, and ultimately transactions.

Marquee already enables professionals to showcase their work, experience, skills, accomplishments, leadership, services, media, and products. Opportunities add another reason to join, maintain, and share a Marquee.

**Core principle: Marquee is a professional identity, discovery, and monetization platform—not a job board.**

The Opportunities Engine must support three outcomes:

1. **Professional value:** Give professionals access to a selective collection of relevant work opportunities, independent of Marquee's future discovery marketplace.
2. **Professional acquisition:** Attract new members who create a Marquee, apply for opportunities, and continue using their profile for other ways of working and earning.
3. **Employer activation:** Introduce companies to Marquee, enable native applications, and establish the foundation for professional search, shortlists, invitations, and hiring.

The product must reuse Marquee's existing profiles, accounts, authentication, and data architecture.

---

### 2. Curation strategy and scope

**Published collection target: approximately 250 active opportunities.**

The sourcing engine may discover substantially more opportunities internally, but only those meeting Marquee's standards should be published.

Prioritize:

- Fractional executive and leadership roles
- Consulting and project-based opportunities
- Interim leadership
- Advisory and board opportunities
- Full-time leadership and experienced operator roles
- Selected senior individual contributor positions in high-demand disciplines

Initial functions include marketing, growth, revenue, partnerships, operations, product, technology, AI, finance, people, and strategy.

Initial company focus includes startups, venture-backed businesses, emerging technology companies, and established businesses seeking experienced professional expertise.

Avoid low-quality, generic, junior, commission-only, unverifiable, or misleading listings.

**Do not establish rigid quotas by category.** Use actual opportunity quality and relevance to determine the published mix.

A smaller collection of verified, compelling opportunities is preferable to filling the collection with weaker listings simply to reach 250.

---

### 3. Source strategy — prioritize value, not source count

This is the highest-priority research and engineering workstream.

The system should identify and maintain a **small portfolio of high-performing sources**, selected based on their ability to consistently produce relevant opportunities.

Do not build integrations simply because a source has a large job inventory.

#### Source evaluation criteria

Evaluate each source against:

| Criterion | Weight |
|---|---:|
| Relevance to Marquee's target professionals | 25% |
| Fractional, consulting, advisory, and leadership coverage | 20% |
| Quality and credibility of employers | 15% |
| Freshness and verification reliability | 15% |
| Access, permissions, and integration feasibility | 10% |
| Employer relationship potential | 10% |
| Unique opportunities not already sourced elsewhere | 5% |

Score each source from 0–100.

Volume is a diagnostic metric, not a standalone reason to prioritize a source.

Track both the number of discovered opportunities and the number that qualify for publication.

**A source generating 10 relevant, verified opportunities may be more valuable than one generating 1,000 largely irrelevant listings.**

### 4. Priority source categories

#### Priority A — High-value venture-backed company hiring feeds

Identify a targeted group of venture-backed companies with a strong likelihood of hiring experienced operators and leaders.

Use selected VC portfolios as a way to identify companies, not as a mandate to integrate every portfolio job board.

Initial VC ecosystems to evaluate:

- Y Combinator
- First Round Capital
- Primary Venture Partners
- General Catalyst
- Bessemer Venture Partners
- Andreessen Horowitz
- Initialized Capital
- Connecticut Innovations
- Selected funds focused on AI, SaaS, fintech, healthcare, and consumer technology

Research and rank these ecosystems based on the actual quality of relevant openings.

Do not assume that a prominent VC produces better opportunities for Marquee.

For selected companies, identify the official careers page and underlying ATS.

**Primary technical integrations:**

- Greenhouse public job-posting feeds
- Lever public postings feeds
- Ashby public job-posting feeds

These are the first adapters to evaluate and implement.

The source system must work company by company, using verified ATS identifiers.

Requirements:

- Discover active company openings.
- Identify seniority, function, location, compensation, and employment type.
- Preserve the original employer application URL.
- Detect new, updated, and closed opportunities.
- Deduplicate listings appearing through multiple sources.
- Refresh automatically.
- Record source health and verification dates.

Start with a curated company list rather than monitoring thousands of companies indiscriminately.

#### Priority B — Fractional and consulting opportunity sources

Fractional opportunities require a dedicated sourcing strategy.

Evaluate a small number of high-quality fractional platforms, specialist recruiters, and direct employer sources.

Initial research candidates:

- Go Fractional
- Fractional Jobs
- Fractional Pulse
- Specialist fractional executive recruiters
- Boutique consulting and executive talent firms
- VC talent partners
- Founder communities that publish genuine hiring needs

For each source, establish whether it provides original employer listings, aggregated listings, exclusive opportunities, or a managed staffing service.

Do not automatically republish competitor-exclusive opportunities or assume that publicly visible listings are licensed for syndication.

Prioritize direct employer relationships, authorized feeds, and partnerships where possible.

**Fractional detection requirements:**

Search beyond the word "fractional."

Include:

- Part-time executive
- Interim leadership
- Embedded operator
- Contract executive
- Strategic consultant
- Project-based leadership
- Retainer engagement
- Temporary functional leader

Use job descriptions and actual engagement terms to distinguish fractional leadership from ordinary contract employment.

The engine should identify relevant opportunities that generic job board filters often miss.

#### Priority C — Direct employer submissions

Enable businesses to submit opportunities directly to Marquee.

This should be included in Phase 1.

Support:

- Full-time
- Fractional
- Consulting
- Advisory
- Interim
- Project-based

Employers should be able to submit a role through a simple form without adopting a complete hiring platform.

Required information:

- Company
- Verified employer contact
- Role title
- Description
- Work type
- Requirements
- Skills
- Location
- Compensation or budget, when available
- Hours and duration, where relevant
- Application deadline
- Application destination

Employers may choose:

**Apply externally:** Link to their existing hiring process.

**Apply with Marquee:** Accept applications using Marquee professional profiles.

Native Marquee applications require verified employer authorization.

#### Priority D — Member and network referrals

Allow Marquee professionals, advisors, and partners to recommend opportunities.

Submissions should enter the same review and verification workflow as other sources.

Prioritize opportunities with a direct employer relationship or a credible introduction.

This source may initially have low volume but high relationship value.

---

### 5. Source feasibility research — required before scaling

Engineering must produce a source feasibility matrix before building broad integrations.

For each candidate source, document:

- Source name and category
- Actual relevant opportunities found in a defined sampling period
- Fractional/consulting coverage
- Employer quality
- Duplicate overlap with existing sources
- Public feed or API availability
- Technical access method
- Terms and republication permissions
- Verification method
- Refresh reliability
- Potential employer relationship
- Implementation complexity
- Source value score

**Research deliverable:** Recommend the smallest combination of sources likely to sustain approximately 250 relevant active opportunities.

Do not predetermine the number of sources required.

Test the initial source mix, measure the number of publishable opportunities, and expand only when a coverage gap is demonstrated.

Where automated access or republication is not permitted, pursue authorized feeds, syndication, direct employer submissions, or manual sourcing.

---

### 6. Automated sourcing and classification

Build a modular workflow:

**Discover → Import → Normalize → Classify → Verify → Score → Review → Publish → Refresh**

Each imported opportunity should contain:

- Canonical opportunity ID
- Employer name and website
- Role title
- Opportunity category
- Function
- Seniority
- Skills
- Industry
- Location and remote eligibility
- Compensation or budget
- Hours and duration, if available
- Description
- Requirements
- Original source
- Original application URL
- Date discovered
- Date last verified
- Application method
- Publication status

Use deterministic rules and AI classification to identify relevant roles.

AI must not invent compensation, employer details, requirements, or engagement terms.

Unknown information must remain unknown.

### 7. Opportunity quality scoring

Score individual opportunities separately from source quality.

Suggested criteria:

- Fit for Marquee's professional audience
- Seniority and expertise requirements
- Opportunity quality
- Employer credibility
- Compensation transparency
- Role specificity
- Freshness
- Source reliability
- Confidence that the role is active

The scoring system should support configurable thresholds and human overrides.

**Phase 1 requires human approval before publishing externally sourced opportunities.**

Automated publishing may be enabled later for trusted, authorized sources that consistently meet quality standards.

---

### 8. Verification, freshness, and deduplication

The published collection must remain current.

Requirements:

- Verify the original listing exists.
- Verify the application destination.
- Detect removed or closed opportunities.
- Track last verification.
- Flag stale or uncertain listings.
- Deduplicate by source ID, URL, employer, role, and location.
- Preserve source attribution.
- Automatically archive confirmed closed listings.
- Prevent temporary API errors from being treated as confirmed closures.

Maintain an internal reserve of approved or near-qualified opportunities to replace closed listings.

Do not publish lower-quality opportunities merely to maintain the 250 target.

---

### 9. Internal publishing dashboard

Build a lightweight Marquee administrator dashboard.

The dashboard must support:

- Reviewing newly discovered opportunities
- Filtering by source, category, quality score, and status
- Viewing original employer listings
- Editing classification and normalized details
- Approving and publishing
- Rejecting and archiving
- Featuring selected opportunities
- Monitoring stale listings
- Viewing source performance
- Triggering source refreshes
- Managing employer-submitted opportunities

Track how many opportunities each source contributes to the published collection.

Allow administrators to identify sources producing low-quality, duplicate, or stale opportunities and deprioritize them.

The dashboard should make maintaining the curated collection efficient for a small team.

---

### 10. Public Opportunities experience

Create an Opportunities section integrated into Marquee.

The experience should feel like a curated professional resource, not a conventional mass-market job board.

Provide:

- Search
- Opportunity-type filters
- Function filters
- Location and remote filters
- Compensation filters where available
- Newest opportunities
- Featured opportunities
- Clear employer information
- Source attribution
- Last verified date
- Save opportunities for signed-in members

Every opportunity should clearly identify the application method.

**Curated external opportunities**

Button: **Apply on company site**

The professional is directed to the original employer's application.

Marquee must not imply an employer partnership or that a Marquee profile will be accepted unless authorized.

**Marquee-enabled opportunities**

Button: **Apply with Marquee**

The professional applies using their existing Marquee identity.

Do not require an account to browse external opportunities.

---

### 11. Apply with Marquee — Phase 1 requirement

Native applications must be part of the initial growth product, not deferred to a later phase.

A professional's Marquee is their application identity.

Reuse existing professional data, including relevant:

- Experience
- Skills
- Accomplishments and impact
- Featured work and projects
- Leadership
- Bio
- Services and work preferences
- Media and portfolio

Allow employers to add role-specific questions and requirements.

**Existing Marquee member flow:**

1. Open opportunity.
2. Select Apply with Marquee.
3. Review profile being shared.
4. Complete additional questions.
5. Submit.
6. Receive confirmation.

**New professional flow:**

1. Open opportunity.
2. Select Apply with Marquee.
3. Create an account.
4. Import a resume or create a basic Marquee.
5. Answer required questions.
6. Submit.
7. Continue enriching their Marquee after applying.

Do not require completion of the full professional onboarding process before application submission.

Applications must be delivered to an authorized employer account or verified employer contact through a secure workflow.

Store an application snapshot and candidate consent.

---

### 12. Employer activation and discovery

Phase 1 should include a lightweight employer experience.

Businesses must be able to:

- Submit opportunities
- Verify ownership of a listing
- Activate Apply with Marquee
- Add application questions
- Receive applications
- View submitted Marquee profiles
- Contact applicants
- Share opportunity links

Employers should not need to implement a new ATS or migrate their existing recruiting workflow.

The system should track employer relationships and outreach.

For curated external roles, administrators should be able to invite employers to activate Marquee applications.

Do not activate native applications without employer approval.

**Professional discovery pilot**

Support a limited, consent-based workflow where Marquee administrators can introduce relevant professionals to participating businesses.

Advanced self-service professional search, AI ranking, shortlists, and invitation management are later-stage capabilities.

---

### 13. Professional acquisition and distribution

Opportunities must function as a measurable acquisition channel for Marquee.

Support:

- Public, shareable opportunity URLs
- Search-engine-indexable pages where appropriate
- Social sharing
- Curated weekly opportunity collections
- Email distribution
- Employer sharing of native Marquee listings
- Registration attribution
- Profile creation tracking
- Application tracking
- Returning professional engagement

Use Marquee's existing account and profile system.

Do not create separate candidate accounts.

Do not make professional subscription payment a prerequisite for applying to an opportunity.

Marquee's existing subscription, bookings, services, and storefront capabilities remain independent of the Opportunities product.

---

### 14. Technical architecture

Build within Marquee's existing infrastructure:

- Next.js
- React
- TypeScript
- Tailwind
- Supabase / PostgreSQL
- Existing authentication and Row Level Security
- Vercel
- Existing AI integrations

Recommended services:

- Source registry
- Company registry
- ATS adapters
- Ingestion scheduler
- Normalization service
- Classification and scoring
- Deduplication
- Verification
- Publishing workflow
- Public Opportunities API
- Employer submissions
- Native applications
- Analytics

Reuse existing user, professional profile, and account identifiers.

Suggested database entities:

- `opportunity_sources`
- `source_sync_runs`
- `companies`
- `company_ats_identifiers`
- `opportunities`
- `opportunity_source_records`
- `opportunity_verifications`
- `opportunity_publications`
- `employer_accounts`
- `employer_listing_claims`
- `opportunity_applications`
- `application_answers`
- `saved_opportunities`
- `employer_outreach`
- `opportunity_audit_logs`

Apply appropriate access controls to unpublished listings, employer information, applicant data, and internal operations.

Use idempotent ingestion, source-specific rate limiting, retries, error logs, and monitoring.

---

### 15. Phase 1 — Growth and fundraising MVP

**Objective:** Demonstrate that curated opportunities can attract professionals, activate employers, and generate real applications through Marquee.

Proposed implementation and validation window: 30–45 days, subject to engineering assessment.

#### Required deliverables

**A. High-value sourcing**

- Source feasibility and ranking
- Selected company and VC portfolio directory
- Initial ATS integrations
- Fractional sourcing workflow
- Scheduled discovery and refresh
- Classification, verification, and deduplication

**B. Curated publishing**

- Internal approval dashboard
- Approximately 250 relevant active opportunities, subject to verified supply
- Public Opportunities pages
- Search and essential filters
- Source attribution
- Automatic expiration management

**C. Professional acquisition**

- Integration with existing Marquee profiles
- Shareable opportunity pages
- Registration attribution
- Basic saved opportunities
- Opportunity-driven profile creation

**D. Employer activation**

- Employer submission form
- Employer verification
- Apply with Marquee
- Custom application questions
- Secure application delivery and review
- Basic employer engagement tracking

**E. Fundraising analytics**

Track:

- Active published opportunities
- Qualified opportunities by source
- Fractional and consulting coverage
- Source verification success
- Professional registrations from opportunities
- Profiles published
- Applications submitted
- Participating employers
- Native Marquee opportunities
- Employers reviewing applicants
- Interviews and engagements, when confirmed
- Professional subscription and commerce activity separately

#### Proposed validation targets

| Metric | Initial target |
|---|---:|
| Active curated opportunities | ~250 |
| Employer partners accepting Marquee applications | 10 |
| Native Marquee opportunities | 15–25 |
| Native applications submitted | 50+ |
| Businesses reviewing applicants | 5+ |
| Qualified introductions or interviews | 10+ |

These are proposed experiments, not guaranteed outcomes or forecasts.

Report actual results, conversion rates, and the time required to achieve them.

The published opportunity count is a product coverage metric, not the principal measure of traction.

---

### 16. Phase 2 — Scale and professional discovery

After validating the initial acquisition and application flows, expand selectively.

Potential capabilities:

- More high-performing sources
- Personalized opportunity recommendations
- Opportunity alerts
- AI matching to Marquee professional profiles
- Employer professional search
- Saved professional lists
- Invitations to apply
- Candidate communications
- Employer collaboration
- Advanced application management
- Direct booking and engagement workflows

Expand sourcing only when there is demonstrated demand for additional functions, industries, locations, or opportunity types.

Do not increase job volume as an objective in itself.

---

### 17. Success criteria and product principles

The Phase 1 system is successful when Marquee can:

1. Sustain a high-quality collection of approximately 250 active opportunities without manually researching every listing.
2. Identify which sources produce the most relevant and actionable opportunities.
3. Maintain accurate, verified listings with manageable administrative effort.
4. Acquire professionals who create and use their Marquee profiles.
5. Enable participating employers to accept and review Marquee applications.
6. Demonstrate measurable professional and employer engagement.
7. Generate credible evidence of professional adoption, business demand, and network activity for fundraising.

**Final product principle**

Marquee Opportunities is not designed to compete with the largest job boards on inventory.

It is a curated professional opportunity experience that supports Marquee's broader mission: helping professionals be known, find opportunities, and earn from their knowledge, skills, and expertise.

The sourcing engine should be selective, efficient, and continuously improving.

The long-term value comes from connecting those opportunities to Marquee's professional profiles, discovery capabilities, employer relationships, and transactions.
