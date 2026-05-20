"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import Link from "next/link";
import type { SkillEntry, ElviisPlusItem } from "@/types";
import ContactModal from "@/components/ContactModal";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ProfileRecord {
  [key: string]: any;
}

interface ProfileState {
  profile: ProfileRecord;
  workHistory: ProfileRecord[];
  skills: SkillEntry[];
  answers: ProfileRecord;
}

const ARCHETYPE_LABELS: Record<string, string> = {
  builder: "The Builder",
  fixer: "The Fixer",
  scaler: "The Scaler",
  operator: "The Operator",
  strategist: "The Strategist",
  coach: "The Coach",
  connector: "The Connector",
  visionary: "The Visionary",
};

// Format a "YYYY-MM" or "Present" string to "Mon YYYY"
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  if (/^present$/i.test(value)) return "Present";
  const match = value.match(/^(\d{4})-(\d{1,2})/);
  if (!match) return value;
  const year = match[1];
  const month = parseInt(match[2], 10);
  if (month >= 1 && month <= 12) return `${MONTH_NAMES[month - 1]} ${year}`;
  return value;
}

// Format a salary range like 180000-240000 to "$180K – $240K"
function formatSalary(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((max || min) as number);
}

// Inline social icons — generic glyphs, no brand logos
function SocialIcon({ kind }: { kind: string }) {
  const stroke = "currentColor";
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };
  switch (kind.toLowerCase()) {
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="3" stroke={stroke} strokeWidth="1.6" />
          <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M17 17v-4a2 2 0 0 0-2-2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "twitter":
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "website":
    case "site":
    case "url":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case "email":
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth="1.6" />
          <path d="M3 7l9 7 9-7" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
  }
}

// Lock icon for private rate
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="inline-block mr-1 -mt-0.5">
      <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const THEME_CLASSES: Record<string, { bg: string; text: string; accent: string; card: string }> = {
  light: { bg: "bg-cream", text: "text-ink", accent: "border-lav-mid", card: "bg-white" },
  dark: { bg: "bg-navy", text: "text-white", accent: "border-lav", card: "bg-navy-lt" },
  indigo: { bg: "bg-lav-lt", text: "text-ink", accent: "border-lav-dk", card: "bg-white" },
  warm: { bg: "bg-cream", text: "text-ink", accent: "border-coral", card: "bg-white" },
};

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<ProfileState | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("E");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [mediaSectionOpen, setMediaSectionOpen] = useState(true);
  const [mediaShowAll, setMediaShowAll] = useState(false);
  const [skillSort, setSkillSort] = useState<"level" | "category">("level");
  const [expandedMedia, setExpandedMedia] = useState<Set<number>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());
  const toggleMediaItem = (i: number) => {
    setExpandedMedia((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const toggleRole = (i: number) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/profile/${username}`);
      if (res.ok) {
        const profileData = await res.json();
        setData(profileData);

        // Check if current user owns this profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && profileData.profile.user_id === user.id) {
          setIsOwner(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [username, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lav-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-sans font-bold text-4xl mb-4">Profile not found</h1>
          <Link href="/" className="text-lav-dk underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const { profile, workHistory, skills, answers } = data;
  const theme = THEME_CLASSES[(profile.theme as string) || "light"];

  const copyLink = () => {
    navigator.clipboard.writeText(`marquee.bio/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save inline edit
  const saveField = async (field: string, value: string) => {
    setEditing(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("generated_profiles")
      .update({ [field]: value })
      .eq("user_id", user.id);

    setData({
      ...data,
      profile: { ...profile, [field]: value },
    });
  };

  // Editable text component
  const EditableText = ({
    field,
    value,
    className,
    tag: Tag = "p",
  }: {
    field: string;
    value: string;
    className?: string;
    tag?: "p" | "h2" | "h3" | "span";
  }) => {
    if (isOwner && editing === field) {
      return (
        <textarea
          defaultValue={value}
          autoFocus
          onBlur={(e) => saveField(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(null);
          }}
          className={`${className} w-full bg-lav-lt border border-lav-mid rounded-lg p-2 focus:outline-none resize-none`}
          rows={3}
        />
      );
    }
    return (
      <Tag
        className={`${className} ${isOwner ? "cursor-pointer hover:bg-lav-lt/50 rounded transition-colors" : ""}`}
        onClick={() => isOwner && setEditing(field)}
      >
        {value}
      </Tag>
    );
  };

  // Group skills by proficiency (no caps — unlimited 5s)
  const skillsByLevel: Record<number, typeof skills> = {
    5: skills.filter((s) => s.proficiency === 5),
    4: skills.filter((s) => s.proficiency === 4),
    3: skills.filter((s) => s.proficiency === 3),
    2: skills.filter((s) => s.proficiency === 2),
    1: skills.filter((s) => s.proficiency === 1),
  };

  // Color palette per category
  const CATEGORY_COLORS: Record<string, string> = {
    "Leadership & Management": "#A78BFA",  // lavender
    "Marketing & GTM": "#6EE7B7",          // mint
    "Product & Design": "#FB7185",         // coral
    "Engineering & Technical": "#1E3A5F",  // navy
    "Finance & Operations": "#7C3AED",     // dark lavender
    "Data & Analytics": "#0EA5E9",         // sky blue
    "Creative": "#F59E0B",                 // amber
    "Other": "#6B6560",                    // gray
  };
  const colorFor = (cat: string) => CATEGORY_COLORS[cat] || "#A09890";

  // Unique categories present, for legend
  const categoriesPresent = Array.from(new Set(skills.map((s) => s.category)));

  const levelLabels: Record<number, string> = {
    5: "Expert",
    4: "Advanced",
    3: "Proficient",
    2: "Working Knowledge",
    1: "Foundational",
  };

  const archetypes = answers.l_archetypes as { primary?: string; secondary?: string } | undefined;
  const values = answers.v_values as string[] | undefined;
  const needs = answers.v_needs as string[] | undefined;
  const impactHighlights = answers.impact_highlights as { headline: string; context: string; story: string }[] | undefined;
  const quotes = answers.ii_quotes as { text: string; name: string; relationship: string }[] | undefined;
  const elviisPlusItems = (profile.elviis_plus as ElviisPlusItem[]) || [];

  const TABS = [
    { key: "E", label: "Experience" },
    { key: "L", label: "Leadership" },
    { key: "V", label: "Values" },
    { key: "I", label: "Impact" },
    { key: "S", label: "Skills" },
    { key: "ST", label: "Story" },
    // ELVIIS+ is rendered as a sidebar (always visible) rather than a tab.
  ];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight">
          marquee
        </Link>
        <Link href="/signup" className="btn-pill btn-primary text-xs px-5 py-2">
          Claim your Marquee
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
        {/* Masthead — URL is the masthead identifier */}
        <div className="flex items-center justify-between mb-10 pb-3 border-b border-ink">
          <span className="text-xs uppercase tracking-[0.05em] font-bold text-ink">
            marquee.bio<span className="text-gray-2">/</span>{username}
          </span>
          <span className="text-xs uppercase tracking-[0.05em] font-bold text-ink">
            {profile.location as string}
          </span>
        </div>

        {/* BIO — two-column header */}
        <header className="mb-14 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-12">
          {/* LEFT: identity */}
          <div>
            <div className="flex items-start gap-6 mb-6">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url as string}
                  alt={profile.name as string}
                  className="w-24 h-24 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-lav-lt border border-lav-mid/40 flex items-center justify-center shrink-0">
                  <span className="font-sans font-bold text-3xl text-lav-dk">
                    {(profile.name as string)
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="font-sans font-medium text-3xl md:text-4xl leading-tight tracking-[-0.01em]">
                    {profile.name as string}
                  </h1>
                  {(profile.current_title || profile.current_company) && (
                    <p className="text-sm font-sans text-gray mt-1">
                      {profile.current_title as string}
                      {profile.current_title && profile.current_company && (
                        <span className="text-gray-2"> · </span>
                      )}
                      {profile.current_company as string}
                    </p>
                  )}
                </div>
                {!isOwner && (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="shrink-0 px-5 py-2 rounded-full border-2 border-ink text-ink font-sans font-bold text-sm hover:bg-ink hover:text-white transition-colors flex items-center gap-2 mt-1"
                  >
                    Get in touch
                    <span aria-hidden>→</span>
                  </button>
                )}
              </div>
            </div>

            <EditableText
              field="ai_headline"
              value={profile.ai_headline as string}
              className="text-lg md:text-xl text-ink leading-snug mb-4 max-w-2xl"
            />

            {/* Superpowers — promoted career themes */}
            {answers.career_themes && (answers.career_themes as string[]).length > 0 && (
              <div className="mb-6 max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-lav-dk block mb-2">
                  My Superpowers
                </span>
                <div className="flex flex-wrap gap-2">
                  {(answers.career_themes as string[]).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 text-sm font-sans font-medium bg-lav-lt text-lav-dk border border-lav-mid/40 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social icons */}
            {profile.social_links &&
              Object.keys(profile.social_links as Record<string, string>).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2 mr-1">
                    Find me
                  </span>
                  {Object.entries(profile.social_links as Record<string, string>).map(
                    ([label, url]) => (
                      <a
                        key={label}
                        href={label === "email" ? `mailto:${url}` : url}
                        target={label === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        title={label}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-gray hover:text-ink hover:border-ink transition-colors"
                      >
                        <SocialIcon kind={label} />
                      </a>
                    )
                  )}
                </div>
              )}
          </div>

          {/* RIGHT: work snapshot */}
          <aside className="card p-5 space-y-4 self-start">
            {(profile.years_experience || profile.years_leading || answers.l_years) && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2">
                  Experience
                </span>
                <p className="font-sans font-semibold mt-0.5">
                  {(profile.years_experience as number) || ""} years
                  {(profile.years_leading || answers.l_years) && (
                    <span className="text-gray font-normal text-sm">
                      {" · "}
                      {(profile.years_leading as number) || (answers.l_years as number)} Leadership
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2">
                Open to
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.work_type && (
                  <span className="px-2.5 py-0.5 text-[11px] font-sans bg-lav-lt text-lav-dk border border-lav-mid/40 rounded-full">
                    {profile.work_type as string}
                  </span>
                )}
                {(profile.work_env as string[])?.map((env) => (
                  <span
                    key={env}
                    className="px-2.5 py-0.5 text-[11px] font-sans bg-cream text-gray rounded-full border border-border"
                  >
                    {env}
                  </span>
                ))}
                {(profile.hours_per_week as number) && (
                  <span className="px-2.5 py-0.5 text-[11px] font-sans bg-cream text-gray rounded-full border border-border">
                    {profile.hours_per_week as number}+ hrs/wk
                  </span>
                )}
                {(answers.wp_hours as number) && !profile.hours_per_week && (
                  <span className="px-2.5 py-0.5 text-[11px] font-sans bg-cream text-gray rounded-full border border-border">
                    {answers.wp_hours as number}+ hrs/wk
                  </span>
                )}
                {answers.wp_availability ? (
                  <span className="px-2.5 py-0.5 text-[11px] font-sans bg-mint-lt text-mint-dk border border-mint/40 rounded-full">
                    {answers.wp_availability as string}
                  </span>
                ) : null}
              </div>
            </div>

            {(profile.salary_min ||
              profile.salary_max ||
              profile.rate_min ||
              profile.rate_max ||
              profile.rate_private) && (
              <div className="pt-3 border-t border-border">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2">
                  Rate
                </span>
                {profile.rate_private ? (
                  <p className="font-sans font-semibold mt-0.5 text-gray">
                    <LockIcon />
                    Private — ask
                  </p>
                ) : (
                  <p className="font-sans font-semibold mt-0.5">
                    {formatSalary(
                      profile.salary_min as number | null,
                      profile.salary_max as number | null
                    ) ||
                      formatSalary(
                        profile.rate_min as number | null,
                        profile.rate_max as number | null
                      )}
                    {(profile.rate_min || profile.rate_max) && !profile.salary_min && (
                      <span className="text-gray font-normal text-sm"> / hr</span>
                    )}
                  </p>
                )}
              </div>
            )}

          </aside>
        </header>

        {/* Pull Quote — clean, no floating mark */}
        {profile.ai_pull_quote && (
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-lav-dk block mb-3">
              What I wish people knew
            </span>
            <div className={`border-l-2 ${theme.accent} pl-6`}>
              <EditableText
                field="ai_pull_quote"
                value={profile.ai_pull_quote as string}
                className="font-sans font-medium text-lg md:text-xl leading-[1.5] text-ink"
                tag="p"
              />
            </div>
          </div>
        )}

        {/* About — distinct card before Work */}
        <div className="mb-12 card p-8 md:p-10 bg-white border-2 border-ink/10">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink mb-4">
            About
          </h3>
          {(() => {
            const text = (profile.ai_career_arc as string) || "";
            const long = text.length > 220;
            const display = aboutExpanded || !long ? text : text.slice(0, 220).trimEnd() + "…";
            return (
              <>
                <EditableText
                  field="ai_career_arc"
                  value={display}
                  className="text-lg md:text-xl leading-[1.5] text-ink"
                />
                {long && (
                  <button
                    onClick={() => setAboutExpanded((v) => !v)}
                    className="mt-3 text-sm font-bold text-lav-dk hover:underline"
                  >
                    {aboutExpanded ? "Show less" : "Read more →"}
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {/* WORK — section divider */}
        <div className="mt-16 mb-6 flex items-baseline justify-between border-b-2 border-ink pb-3">
          <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight">
            Work
          </h2>
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2">
            Experience · Leadership · Values · Impact · Skills · Story
          </span>
        </div>

        {/* ELVIIS Tabs — magazine section marks */}
        <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm border-b border-border mb-10 -mx-6 md:-mx-12 px-6 md:px-12">
          <div className="flex justify-between gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-3 md:px-5 py-4 text-sm whitespace-nowrap transition-all border-b-2 -mb-px ${
                    isActive
                      ? "border-ink text-ink"
                      : "border-transparent text-gray-2 hover:text-ink"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2.5 w-full">
                    <span
                      className={`w-7 h-7 rounded-full font-sans font-bold text-sm flex items-center justify-center transition-colors border ${
                        isActive
                          ? "bg-ink text-white border-ink"
                          : "bg-lav-lt text-lav-dk border-lav-mid/40"
                      }`}
                    >
                      {tab.key === "ST" ? "S" : tab.key}
                    </span>
                    <span className="hidden sm:inline font-sans text-xs uppercase tracking-wider">
                      {tab.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {/* Experience */}
          {activeTab === "E" && (
            <div>
              {/* Experience Highlights — quick snapshot row */}
              {workHistory.length > 0 && (
                <div className="mb-8">
                  <h3 className="section-label mb-4">Experience Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {workHistory.slice(0, 3).map((w, i) => {
                      const company = (w.company as string) || "";
                      const initial = company.trim().charAt(0).toUpperCase();
                      const palette = [
                        { bg: "bg-lav-lt", text: "text-lav-dk", border: "border-lav-mid/40" },
                        { bg: "bg-mint-lt", text: "text-mint-dk", border: "border-mint/40" },
                        { bg: "bg-coral-lt", text: "text-coral", border: "border-coral/40" },
                        { bg: "bg-navy-lt", text: "text-navy", border: "border-navy/30" },
                        { bg: "bg-cream", text: "text-gray", border: "border-border" },
                      ];
                      const c = palette[i % palette.length];
                      return (
                        <a
                          key={`hl-${i}`}
                          href={`#role-${i}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .getElementById(`role-${i}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="card p-3 flex items-center gap-3 hover:border-ink transition-colors"
                        >
                          <div
                            className={`${c.bg} ${c.text} border ${c.border} w-12 h-12 rounded-lg flex items-center justify-center font-sans font-bold text-lg shrink-0`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-sans font-bold text-sm leading-tight truncate">
                              {w.role_title as string}
                            </p>
                            <p className="text-xs text-gray truncate">{company}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full history with narratives */}
              <div className="space-y-6">
              {workHistory.map((w, i) => (
                <div id={`role-${i}`} key={i} className={`${theme.card} card p-6 scroll-mt-24`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-sans font-bold text-xl">
                        {w.role_title as string}
                      </h4>
                      <p className="text-gray text-sm">
                        {w.company as string}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-sans text-gray-2">
                        {formatDate(w.start_date as string)} – {formatDate(w.end_date as string)}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {w.sector && (
                          <span className="px-2 py-0.5 text-[10px] font-sans bg-cream text-gray rounded">
                            {w.sector as string}
                          </span>
                        )}
                        {w.stage && (
                          <span className="px-2 py-0.5 text-[10px] font-sans bg-cream text-gray rounded">
                            {w.stage as string}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {w.ai_narrative && (
                    <p className="text-sm leading-relaxed">
                      {w.ai_narrative as string}
                    </p>
                  )}
                  {(() => {
                    const bullets = (w.original_bullets as string[] | undefined) || [];
                    const defining = w.defining_text as string | undefined;
                    const hasExtra = bullets.length > 0 || !!defining;
                    if (!hasExtra) return null;
                    const isExpanded = expandedRoles.has(i);
                    return (
                      <>
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-border space-y-3">
                            {bullets.length > 0 && (
                              <div>
                                <h5 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2 mb-2">
                                  Highlights
                                </h5>
                                <ul className="space-y-1.5">
                                  {bullets.map((b, bi) => (
                                    <li key={bi} className="text-sm text-ink flex gap-2">
                                      <span className="text-lav-dk shrink-0">•</span>
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {defining && (
                              <div>
                                <h5 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2 mb-2">
                                  What made this defining
                                </h5>
                                <p className="text-sm italic text-ink">
                                  &ldquo;{defining}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => toggleRole(i)}
                          className="text-xs font-bold text-lav-dk hover:underline mt-3"
                        >
                          {isExpanded ? "Show less" : "See more →"}
                        </button>
                      </>
                    );
                  })()}
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Leadership */}
          {activeTab === "L" && (
            <div className="space-y-8">
              <p className="text-sm text-gray-2 italic">
                How I lead, how I&apos;m wired, and the environment that brings out my best work.
              </p>

              {/* Leadership summary — set the tone */}
              <EditableText
                field="ai_leadership_summary"
                value={profile.ai_leadership_summary as string}
                className="text-lg leading-relaxed"
              />

              {/* Archetype + stats — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {archetypes?.primary && (
                  <div className="card p-5 border-lav-dk bg-lav-lt md:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-lav-dk">
                      Primary Archetype
                    </span>
                    <h4 className="font-sans font-bold text-2xl mt-1">
                      {ARCHETYPE_LABELS[archetypes.primary] || archetypes.primary}
                    </h4>
                    {archetypes.secondary && (
                      <p className="text-sm text-gray mt-2">
                        Secondary: {ARCHETYPE_LABELS[archetypes.secondary] || archetypes.secondary}
                      </p>
                    )}
                  </div>
                )}
                <div className="card p-5 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-3">
                    {answers.l_years ? (
                      <div>
                        <span className="font-sans font-bold text-2xl block">
                          {answers.l_years as number}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-2">
                          Leadership
                        </span>
                      </div>
                    ) : null}
                    {answers.l_team_size ? (
                      <div>
                        <span className="font-sans font-bold text-2xl block">
                          {answers.l_team_size as number}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-2">
                          Max team
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {answers.l_belief && (
                <div>
                  <h3 className="section-label mb-3">
                    What most people get wrong about leadership
                  </h3>
                  <div className="border-l-2 border-lav-mid pl-6">
                    <p className="text-lg leading-relaxed">
                      &ldquo;{answers.l_belief as string}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Values */}
          {activeTab === "V" && (
            <div className="space-y-10">
              <p className="text-sm text-gray-2 italic">
                What I stand for, and what I need to feel to do my best work.
              </p>

              {values && values.length > 0 && (
                <div>
                  <h3 className="section-label mb-4">Top 5 values · in order</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {values.map((v, i) => (
                      <div
                        key={v}
                        className="card p-4 flex flex-col items-center text-center"
                      >
                        <span className="font-sans font-bold text-2xl text-lav-dk leading-none">
                          {i + 1}
                        </span>
                        <span className="font-sans font-bold mt-2">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {needs && needs.length > 0 && (
                <div>
                  <h3 className="section-label mb-4">What I need to thrive</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {needs.map((n) => (
                      <div
                        key={n}
                        className="card p-4 bg-lav-lt border-lav-mid/40"
                      >
                        <p className="font-sans font-semibold text-ink">{n}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {answers.v_culture && (
                <div>
                  <h3 className="section-label mb-3">Where I do my best work</h3>
                  <div className="border-l-2 border-lav-mid pl-6">
                    <p className="text-lg leading-relaxed">
                      &ldquo;{answers.v_culture as string}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact */}
          {/* Impact — career highlights + testimonials */}
          {activeTab === "I" && (
            <div className="space-y-10">
              <p className="text-sm text-gray-2 italic">
                Not job responsibilities — moments where something measurably changed. And what people who&apos;ve worked with me say.
              </p>

              <div>
                <h3 className="section-label mb-4">Career Highlights</h3>
                {impactHighlights && impactHighlights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {impactHighlights.map((h, i) => (
                      <div key={i} className="card p-6">
                        <h4 className="font-sans font-bold text-xl mb-1 leading-tight">
                          {h.headline}
                        </h4>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-2 mb-3">
                          {h.context}
                        </p>
                        <p className="text-sm leading-relaxed text-ink">{h.story}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray">No impact highlights added yet.</p>
                )}
              </div>

              {/* Testimonials — moved here from Insights */}
              {quotes && quotes.length > 0 && (
                <div>
                  <h3 className="section-label mb-4">Testimonials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quotes.map((q, i) => (
                      <div key={i} className="card p-6">
                        <p className="font-sans text-base leading-relaxed mb-3">
                          &ldquo;{q.text}&rdquo;
                        </p>
                        <p className="text-xs text-gray">
                          — <span className="font-semibold">{q.name}</span>{" "}
                          <span className="text-gray-2">· {q.relationship}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Story — narrative + insights */}
          {activeTab === "ST" && (
            <div className="space-y-10">
              <p className="text-sm text-gray-2 italic">
                The story behind the resume — what I keep getting called to do, what I bring that no JD captures, how I&apos;ve evolved, and what I see that others miss.
              </p>

              {answers.e_through_line && (
                <div>
                  <h3 className="section-label mb-3">
                    The through-line
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.e_through_line as string}
                  </p>
                </div>
              )}

              {answers.ii_bring && (
                <div>
                  <h3 className="section-label mb-3">
                    What I bring that doesn&apos;t fit a job description
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.ii_bring as string}
                  </p>
                </div>
              )}

              {answers.ii_changed && (
                <div>
                  <h3 className="section-label mb-3">
                    What I changed my mind about
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.ii_changed as string}
                  </p>
                </div>
              )}

              {answers.ii_field && (
                <div>
                  <h3 className="section-label mb-3">
                    What most people in my field get wrong
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.ii_field as string}
                  </p>
                </div>
              )}

              {answers.e_now && (
                <div>
                  <h3 className="section-label mb-3">
                    Where I am now
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.e_now as string}
                  </p>
                </div>
              )}

              {answers.e_next && (
                <div>
                  <h3 className="section-label mb-3">
                    What I&apos;m looking for next
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {answers.e_next as string}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Skills — all tiers visible, pills colored by category */}
          {activeTab === "S" && (
            <div className="space-y-10">
              <p className="text-sm text-gray-2 italic">
                What I&apos;m most expert at — across categories — and the full picture of what I can do.
              </p>

              {/* TOP SKILLS — Expert-level hero */}
              {skillsByLevel[5].length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-ink">
                      Top Skills
                      <span className="ml-2 text-gray-2">· Expert level</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {skillsByLevel[5].map((s, i) => (
                      <div
                        key={i}
                        style={{ background: "#111010" }}
                        className="rounded-xl p-4 text-white border border-ink hover:opacity-90 transition-opacity"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: colorFor(s.category) }}
                          />
                          <span className="text-[10px] uppercase tracking-wider font-bold text-white/60">
                            {s.category.split(" ")[0]}
                          </span>
                        </div>
                        <p className="font-sans font-bold text-base leading-tight text-white">
                          {s.skill_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort toggle + category legend */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2 mr-1">
                    Sort by
                  </span>
                  <button
                    onClick={() => setSkillSort("level")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      skillSort === "level"
                        ? "bg-ink text-white"
                        : "bg-white border border-border text-gray hover:border-ink hover:text-ink"
                    }`}
                  >
                    Level
                  </button>
                  <button
                    onClick={() => setSkillSort("category")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      skillSort === "category"
                        ? "bg-ink text-white"
                        : "bg-white border border-border text-gray hover:border-ink hover:text-ink"
                    }`}
                  >
                    Category
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {categoriesPresent.map((cat) => {
                    const count = skills.filter((s) => s.category === cat).length;
                    return (
                      <div key={cat} className="flex items-center gap-1.5 text-xs">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: colorFor(cat) }}
                        />
                        <span className="text-gray-2">
                          {cat.split(" ")[0]} <span className="text-gray-2/60">({count})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sorted skills list */}
              {skillSort === "level" ? (
                <div className="space-y-7">
                  {[5, 4, 3, 2, 1].map((lvl) => {
                    const levelSkills = skillsByLevel[lvl];
                    if (levelSkills.length === 0) return null;
                    return (
                      <div key={lvl}>
                        <div className="flex items-baseline gap-3 mb-3">
                          <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-ink">
                            {levelLabels[lvl]}
                          </h4>
                          <span className="text-xs text-gray-2 font-bold">
                            · {levelSkills.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {levelSkills.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border bg-white border-border text-ink"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: colorFor(s.category) }}
                                aria-hidden
                              />
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-7">
                  {categoriesPresent.map((cat) => {
                    const catSkills = skills
                      .filter((s) => s.category === cat)
                      .sort((a, b) => b.proficiency - a.proficiency);
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="flex items-baseline gap-3 mb-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: colorFor(cat) }}
                            aria-hidden
                          />
                          <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-ink">
                            {cat}
                          </h4>
                          <span className="text-xs text-gray-2 font-bold">
                            · {catSkills.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {catSkills.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border bg-white border-border text-ink"
                            >
                              {s.skill_name}
                              <span className="text-[10px] font-bold text-gray-2">
                                {levelLabels[s.proficiency]}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>


        {/* Edit button for owner */}
        {isOwner && (
          <div className="fixed top-6 right-6">
            <Link
              href="/dashboard"
              className="card px-4 py-2 text-sm font-medium hover:border-lav-mid transition-colors"
            >
              Dashboard
            </Link>
          </div>
        )}

        {/* MEDIA — first 3 visible, see-all toggle reveals the rest */}
        {elviisPlusItems.length > 0 && (
          <section className="mt-16">
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
              <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight">
                Media
              </h2>
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-2 hidden md:block">
                Writing · Speaking · Press · Projects · Portfolio
              </span>
            </div>

            <div className="flex justify-end mt-2 mb-6">
              <button
                onClick={() => setMediaSectionOpen((v) => !v)}
                className="text-sm leading-none text-gray hover:text-ink transition-colors"
                aria-label={mediaSectionOpen ? "Hide media" : "Show media"}
                aria-expanded={mediaSectionOpen}
              >
                {mediaSectionOpen ? "−" : "+"}
              </button>
            </div>

            {mediaSectionOpen && (
              <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(mediaShowAll ? elviisPlusItems : elviisPlusItems.slice(0, 3)).map(
                (item, i) => {
                  const isExpanded = expandedMedia.has(i);
                  const hasDescription = !!item.description;
                  return (
                    <div key={i} className="card p-5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-2">
                        {item.module_type.replace("_", " ")}
                      </span>
                      <h4 className="font-sans font-semibold mt-1 leading-snug">
                        {item.title}
                      </h4>
                      {item.context && (
                        <p className="text-xs text-gray mt-1">{item.context}</p>
                      )}
                      {hasDescription && (
                        <>
                          <p
                            className={`text-xs text-gray mt-2 leading-relaxed ${
                              isExpanded ? "" : "line-clamp-1"
                            }`}
                          >
                            {item.description}
                          </p>
                          <button
                            onClick={() => toggleMediaItem(i)}
                            className="text-xs font-bold text-lav-dk hover:underline mt-1"
                          >
                            {isExpanded ? "Less" : "See more +"}
                          </button>
                        </>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-lav-dk hover:underline mt-3 inline-block"
                        >
                          Visit →
                        </a>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {elviisPlusItems.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMediaShowAll((v) => !v)}
                  className="px-6 py-2.5 rounded-full border-2 border-ink text-ink font-sans font-bold text-sm hover:bg-ink hover:text-white transition-colors"
                >
                  {mediaShowAll
                    ? "Show less"
                    : `See all ${elviisPlusItems.length} →`}
                </button>
              </div>
            )}
              </>
            )}
          </section>
        )}

        {/* Footer — colophon style */}
        <footer className="mt-20 pt-10 border-t border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-sans font-bold text-2xl">marquee.bio/{username}</p>
              <p className="text-sm font-sans font-bold uppercase tracking-[0.15em] mt-2">
                <span className="text-lav-dk">Be Known.</span>
                <span className="text-ink"> Not Filtered.</span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isOwner && (
                <button
                  onClick={() => setContactOpen(true)}
                  className="btn-pill btn-secondary text-sm px-5 py-2.5"
                >
                  Get in touch
                </button>
              )}
              <button
                onClick={copyLink}
                className="btn-pill btn-secondary text-sm px-5 py-2.5"
              >
                {copied ? "Link copied" : "Copy link"}
              </button>
              <Link
                href="/signup"
                className="btn-pill btn-primary text-sm px-5 py-2.5"
              >
                Claim yours
              </Link>
            </div>
          </div>
        </footer>
      </div>


      {/* Contact modal */}
      <ContactModal
        username={username}
        recipientName={profile.name as string}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
