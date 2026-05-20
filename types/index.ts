export interface WorkHistoryItem {
  id?: string;
  role_title: string;
  company: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  bullets: string[];
  sector: string;
  stage: string;
  ai_narrative?: string;
  defining_text?: string;
  display_order?: number;
}

export interface EducationItem {
  institution: string;
  degree: string;
  graduation_year: number | null;
}

export interface ResumeParseResult {
  full_name: string;
  location: string;
  current_title: string;
  current_company: string;
  email: string | null;
  linkedin_url: string | null;
  years_experience: number;
  career_themes: string[];
  career_assessment: string;
  work_history: WorkHistoryItem[];
  education: EducationItem[];
  skills_extracted: string[];
}

export interface SkillEntry {
  skill_name: string;
  proficiency: number; // 1-5
  category: string;
}

export interface ImpactHighlight {
  headline: string;
  context: string;
  story: string;
}

export interface ColleagueQuote {
  text: string;
  name: string;
  relationship: string;
}

export interface TransformationalRole {
  role_id: string;
  defining_text: string;
}

export interface ElviisPlusItem {
  module_type:
    | "newsletter"
    | "projects"
    | "portfolio"
    | "publications"
    | "speaking"
    | "media"
    | "community";
  title: string;
  description?: string;
  url?: string;
  file_url?: string;
  context?: string;
  year?: number;
}

export interface IntakeAnswers {
  // Experience
  e_now?: string;
  e_next?: string;
  e_transformational?: TransformationalRole[];
  e_through_line?: string;

  // Leadership
  l_style?: string;
  l_archetypes?: { primary: string; secondary?: string };
  l_years?: number;
  l_team_size?: number;
  l_belief?: string;
  l_mbti?: string;
  l_enneagram?: string;

  // Values
  v_values?: string[];
  v_needs?: string[];
  v_culture?: string;

  // Impact
  impact_highlights?: ImpactHighlight[];

  // Insights
  ii_wish?: string;
  ii_bring?: string;
  ii_changed?: string;
  ii_field?: string;
  ii_quotes?: ColleagueQuote[];

  // Skills
  skills?: SkillEntry[];

  // ELVIIS+
  elviis_plus?: ElviisPlusItem[];

  // Work Preferences
  wp_locations?: string[];
  wp_availability?: string;
  wp_hours?: number;
  wp_rate?: number;
}

export interface GeneratedProfile {
  headline: string;
  career_arc: string;
  pull_quote: string;
  leadership_summary: string;
  experience_narratives: {
    company: string;
    role: string;
    narrative: string;
  }[];
  insights_summary: string;
  skills_featured: string[];
}

export interface ProfileData {
  id: string;
  user_id: string;
  username: string;
  name: string;
  location: string;
  avatar_url: string | null;
  work_type: string;
  work_status: string;
  work_env: string[];
  hours_per_week: number | null;
  ai_headline: string;
  ai_career_arc: string;
  ai_pull_quote: string;
  ai_leadership_summary: string;
  ai_insights_summary: string;
  theme: "light" | "dark" | "indigo" | "warm";
  social_links: Record<string, string> | null;
  elviis_plus: ElviisPlusItem[] | null;
  generated_at: string;
}

export type SkillCategory =
  | "Leadership & Management"
  | "Marketing & GTM"
  | "Product & Design"
  | "Engineering & Technical"
  | "Finance & Operations"
  | "Data & Analytics"
  | "Creative"
  | "Other";
