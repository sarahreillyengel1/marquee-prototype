// Tags a person puts on each company in their timeline: up to 3 industries and 1 stage or type.
// They are searchable, so someone can find "Growth-stage fintech operators".
//
// Not every employer is a startup. A law firm is a "Professional firm", a hospital is usually
// "Nonprofit" or "Private company" with the industry Healthcare, a city office is "Government".
export const COMPANY_STAGES = [
  // startups, by funding stage
  "Pre-seed", "Seed", "Series A", "Series B", "Growth", "Bootstrapped",
  // established organisations, by type
  "Private company", "Public company", "Professional firm", "Nonprofit", "Government", "University",
];
export const COMPANY_INDUSTRY_MAX = 3;
// Suggestions only — people can type their own.
export const INDUSTRY_SUGGESTIONS = [
  "SaaS", "Fintech", "Healthcare", "Consumer", "Marketplaces", "AI", "Media", "E-commerce",
  "Creator economy", "Retail", "CPG", "Beauty & wellness", "Fashion", "Education", "Climate",
  "Real estate", "Hospitality", "Professional services", "Legal", "Consulting", "Agency",
  "Financial services", "Government", "Nonprofit", "Small business",
];
// What a project entry is, so clients and accelerators read differently from jobs.
export const PROJECT_TYPES = ["Client", "Accelerator", "Program", "Project"];
