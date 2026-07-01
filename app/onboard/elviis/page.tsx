"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type {
  TransformationalRole,
  ImpactHighlight,
  ColleagueQuote,
  SkillEntry,
  ElviisPlusItem,
  WorkHistoryItem,
} from "@/types";

// ── Question definitions ──────────────────────────────────────────

interface Question {
  key: string;
  section: string;
  sectionName: string;
  sectionDesc: string;
  headline: string;
  why: string;
  type:
    | "text"
    | "multi-select-cards"
    | "range"
    | "dropdown"
    | "rank-values"
    | "multi-select-pills"
    | "impact-cards"
    | "quote-cards"
    | "skill-editor"
    | "elviis-plus"
    | "work-history-select"
    | "archetype-select"
    | "work-prefs";
  placeholder?: string;
  maxLength?: number;
  options?: { value: string; label: string; desc?: string }[];
  maxSelect?: number;
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
}

const VALUES_LIST = [
  "Accountability", "Integrity", "Transparency", "Directness", "Humility",
  "Self-awareness", "Resilience", "Curiosity", "Excellence", "Innovation",
  "Impact", "Respect", "Drive", "Autonomy", "Collaboration", "Creativity",
  "Growth", "Inclusion", "Purpose", "Quality", "Speed", "Stability",
];

const NEEDS_OPTIONS = [
  { value: "matter", label: "I matter", desc: "My work has purpose and meaning" },
  { value: "respected", label: "I'm respected", desc: "I'm trusted, heard, and treated fairly" },
  { value: "contribute", label: "I contribute", desc: "My work is recognized and valued" },
  { value: "belong", label: "I belong", desc: "I feel part of a team with shared values" },
  { value: "enabled", label: "I'm enabled", desc: "I have tools and support to do my best" },
  { value: "growing", label: "I'm growing", desc: "I'm learning and being challenged" },
  { value: "autonomous", label: "I'm autonomous", desc: "I own my work without micromanagement" },
  { value: "challenged", label: "I'm challenged", desc: "The work pushes me to be better" },
];

const ARCHETYPES = [
  { value: "builder", label: "The Builder", desc: "0→1, creation under ambiguity" },
  { value: "fixer", label: "The Fixer", desc: "Diagnose, stabilize, turn around" },
  { value: "scaler", label: "The Scaler", desc: "Takes what works and multiplies it" },
  { value: "operator", label: "The Operator", desc: "Systems, process, execution excellence" },
  { value: "strategist", label: "The Strategist", desc: "Big picture, long arc, systems thinker" },
  { value: "coach", label: "The Coach", desc: "Grows people, builds culture, develops talent" },
  { value: "connector", label: "The Connector", desc: "Networks, partnerships, bridges worlds" },
  { value: "visionary", label: "The Visionary", desc: "Sees what others don't, pulls people forward" },
];

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
  "I don't know",
];

const ENNEAGRAM_TYPES = [
  "1 — The Reformer", "2 — The Helper", "3 — The Achiever",
  "4 — The Individualist", "5 — The Investigator", "6 — The Loyalist",
  "7 — The Enthusiast", "8 — The Challenger", "9 — The Peacemaker",
  "I don't know",
];

const QUESTIONS: Question[] = [
  // ── Section E: Experience ──
  {
    key: "e_now", section: "E", sectionName: "Experience",
    sectionDesc: "Career arc, trajectory, transformational roles, and the through-line that follows someone across companies and titles.",
    headline: "What are you doing right now?",
    why: "Sets the context for the entire profile. The AI uses this to anchor your headline and career arc.",
    type: "text", placeholder: "Right now I'm...", maxLength: 280,
  },
  {
    key: "e_next", section: "E", sectionName: "Experience",
    sectionDesc: "",
    headline: "What is your ideal next role?",
    why: "Trajectory matters as much as history. Tells companies where you're going, not just where you've been.",
    type: "text", placeholder: "Ideally, I'm looking for...", maxLength: 280,
  },
  {
    key: "e_transformational", section: "E", sectionName: "Experience",
    sectionDesc: "",
    headline: "What roles have been most transformational?",
    why: "Not the most prestigious — the most formative. Surfaces the experiences that actually shaped who you are.",
    type: "work-history-select",
  },
  {
    key: "e_through_line", section: "E", sectionName: "Experience",
    sectionDesc: "",
    headline: "What problem do you keep getting called to solve?",
    why: "The through-line question. The answer reveals more about someone's professional identity than any title.",
    type: "text", placeholder: "People keep calling me when...", maxLength: 280,
  },
  // ── Section L: Leadership ──
  {
    key: "l_style", section: "L", sectionName: "Leadership",
    sectionDesc: "How you lead, how you're wired, and what kind of environment brings out your best.",
    headline: "How would you describe your leadership style?",
    why: "Not a buzzword — a real description. The AI uses this to write your leadership narrative.",
    type: "text", placeholder: "My leadership style is...", maxLength: 280,
  },
  {
    key: "l_archetypes", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "What kind of leader archetype are you?",
    why: "Helps companies understand your leadership mode before the first conversation.",
    type: "archetype-select",
  },
  {
    key: "l_years", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "How many years have you led teams?",
    why: "",
    type: "range", min: 0, max: 25, step: 1,
  },
  {
    key: "l_team_size", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "What's the largest team you've directly managed?",
    why: "",
    type: "range", min: 1, max: 200, step: 1,
  },
  {
    key: "l_belief", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "What's one thing you believe about leadership that most people get wrong?",
    why: "Intellectual honesty about leadership is rare and memorable.",
    type: "text", placeholder: "Most people think leadership is about... but I think...", maxLength: 240,
  },
  {
    key: "l_mbti", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "MBTI type",
    why: "",
    type: "dropdown", options: MBTI_TYPES.map((t) => ({ value: t, label: t })), optional: true,
  },
  {
    key: "l_enneagram", section: "L", sectionName: "Leadership",
    sectionDesc: "",
    headline: "Enneagram type",
    why: "",
    type: "dropdown", options: ENNEAGRAM_TYPES.map((t) => ({ value: t, label: t })), optional: true,
  },
  // ── Section V: Values ──
  {
    key: "v_values", section: "V", sectionName: "Values",
    sectionDesc: "What you stand for and what you need to feel at work.",
    headline: "Rank your top 5 values",
    why: "Everyone claims the same values. Ranking forces honesty.",
    type: "rank-values",
  },
  {
    key: "v_needs", section: "V", sectionName: "Values",
    sectionDesc: "",
    headline: "What do you need to feel good at work?",
    why: "Surfaces the invisible requirements that determine whether someone thrives or leaves.",
    type: "multi-select-cards", options: NEEDS_OPTIONS, maxSelect: 3,
  },
  {
    key: "v_culture", section: "V", sectionName: "Values",
    sectionDesc: "",
    headline: "Describe your ideal work culture in one sentence",
    why: "",
    type: "text", placeholder: "I do my best work when...", maxLength: 200, optional: true,
  },
  // ── Section I (Impact) ──
  {
    key: "impact_highlights", section: "I₁", sectionName: "Impact",
    sectionDesc: "Career highlights — not job responsibilities. What changed because you were there.",
    headline: "Add up to 4 career highlights",
    why: "Not job descriptions — moments where something measurably changed because you were in the room.",
    type: "impact-cards",
  },
  // ── Section I (Insights) ──
  {
    key: "ii_wish", section: "I₂", sectionName: "Insights",
    sectionDesc: "Your professional point of view. What you know, what you believe, and what others say about working with you.",
    headline: "What do you wish more people knew about you professionally?",
    why: "This becomes the pull quote at the top of your profile. The most human question.",
    type: "text", placeholder: "I wish more people knew that I...", maxLength: 240,
  },
  {
    key: "ii_bring", section: "I₂", sectionName: "Insights",
    sectionDesc: "",
    headline: "What do you bring to your work that never shows up in a job description?",
    why: "The invisible value. The thing that follows someone everywhere but gets no credit.",
    type: "text", placeholder: "The thing I bring that doesn't fit in a JD...", maxLength: 240,
  },
  {
    key: "ii_changed", section: "I₂", sectionName: "Insights",
    sectionDesc: "",
    headline: "What have you completely changed your mind about?",
    why: "Intellectual honesty is rare. Impossible to fake. Impossible to get from a resume.",
    type: "text", placeholder: "I used to believe... Now I know...", maxLength: 280,
  },
  {
    key: "ii_field", section: "I₂", sectionName: "Insights",
    sectionDesc: "",
    headline: "What do most people in your field get wrong?",
    why: "The expertise signal. Requires genuine depth to answer well.",
    type: "text", placeholder: "Most people in my field think... but actually...", maxLength: 300,
  },
  {
    key: "ii_quotes", section: "I₂", sectionName: "Insights",
    sectionDesc: "",
    headline: "Add 2–3 quotes from people you've worked with",
    why: "Not a formal reference — something someone said that stuck.",
    type: "quote-cards", optional: true,
  },
  // ── Section S: Skills ──
  {
    key: "skills", section: "S", sectionName: "Skills",
    sectionDesc: "Tiered capability map. Up to 50 skills. Depth over keywords.",
    headline: "Your skills",
    why: "Pre-populated from your resume. Add, remove, rate.",
    type: "skill-editor",
  },
  // ── Section +: ELVIIS+ ──
  {
    key: "elviis_plus", section: "+", sectionName: "ELVIIS+",
    sectionDesc: "Your work extends beyond job titles. Optional. Add anything that tells your story.",
    headline: "Want to go further?",
    why: "Add anything else that belongs on your Marquee.",
    type: "elviis-plus", optional: true,
  },
  // ── Work Preferences ──
  {
    key: "work_prefs", section: "WP", sectionName: "Work Preferences",
    sectionDesc: "Final details before we generate your profile.",
    headline: "A few final details",
    why: "",
    type: "work-prefs",
  },
];

// ── Section intro data ──
const SECTION_INTROS: Record<string, { letter: string; name: string; desc: string }> = {
  E: { letter: "E", name: "Experience", desc: "Career arc, trajectory, and the through-line" },
  L: { letter: "L", name: "Leadership", desc: "How you lead and what environment brings out your best" },
  V: { letter: "V", name: "Values", desc: "What you stand for and what you need" },
  "I₁": { letter: "I", name: "Impact", desc: "What changed because you were there" },
  "I₂": { letter: "I", name: "Insights", desc: "Your professional point of view" },
  S: { letter: "S", name: "Skills", desc: "Tiered capability map" },
  "+": { letter: "+", name: "ELVIIS+", desc: "Beyond job titles" },
  WP: { letter: "→", name: "Work Preferences", desc: "Final details" },
};

// ── Main Component ──────────────────────────────────────────────

export default function ElviisPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [showSectionIntro, setShowSectionIntro] = useState(true);
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const supabase = createBrowserSupabase();

  useEffect(() => {
    const resumeData = localStorage.getItem("marquee_resume");
    if (resumeData) {
      try {
        const parsed = JSON.parse(resumeData);
        if (parsed.work_history) setWorkHistory(parsed.work_history);
        if (parsed.skills_extracted) setResumeSkills(parsed.skills_extracted);
      } catch { /* ignore */ }
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  const question = QUESTIONS[currentQ];
  const totalQuestions = QUESTIONS.length;

  // Check if we need a section intro
  const prevSection = currentQ > 0 ? QUESTIONS[currentQ - 1].section : null;
  const needsIntro = question.section !== prevSection;

  const saveAnswer = useCallback(
    async (key: string, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      if (!userId) return;
      await fetch("/api/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers: { [key]: value } }),
      });
    },
    [userId]
  );

  const goNext = () => {
    if (currentQ < totalQuestions - 1) {
      const nextQ = currentQ + 1;
      const nextSection = QUESTIONS[nextQ].section;
      setShowSectionIntro(nextSection !== question.section);
      setCurrentQ(nextQ);
    } else {
      router.push("/onboard/generating");
    }
  };

  const goBack = () => {
    if (currentQ > 0) {
      setShowSectionIntro(false);
      setCurrentQ(currentQ - 1);
    }
  };

  // Section intro screen
  if (showSectionIntro && needsIntro && SECTION_INTROS[question.section]) {
    const intro = SECTION_INTROS[question.section];
    return (
      <div className="brand-body min-h-screen font-inter flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-brand-lavender/40 flex items-center justify-center mx-auto mb-6">
            <span className="font-semibold text-3xl text-brand-ink">{intro.letter}</span>
          </div>
          <h2 className="font-semibold text-4xl mb-3">{intro.name}</h2>
          <p className="text-brand-ink/70 text-lg mb-8">{intro.desc}</p>
          <button
            onClick={() => setShowSectionIntro(false)}
            className="px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors px-8 py-3"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const currentAnswer = answers[question.key];

  // Get section index for progress
  const sections = Array.from(new Set(QUESTIONS.map((q) => q.section)));
  const sectionIdx = sections.indexOf(question.section) + 1;
  const sectionQuestions = QUESTIONS.filter((q) => q.section === question.section);
  const questionInSection = sectionQuestions.indexOf(question) + 1;

  return (
    <div className="brand-body min-h-screen font-inter flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between text-xs font-sans text-brand-ink/60 mb-2">
          <span>
            Section {sectionIdx} of {sections.length} · Question{" "}
            {questionInSection} of {sectionQuestions.length}
          </span>
          <span className="px-2 py-1 rounded bg-brand-lavender/40 text-brand-ink text-xs font-sans">
            {question.section}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <h2 className="font-canela text-3xl md:text-4xl mb-3">
            {question.headline}
          </h2>
          {question.why && (
            <p className="text-brand-ink/70 text-sm mb-8">{question.why}</p>
          )}

          {/* Render input based on type */}
          <QuestionInput
            question={question}
            value={currentAnswer}
            onChange={(val) => saveAnswer(question.key, val)}
            workHistory={workHistory}
            resumeSkills={resumeSkills}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex items-center justify-between border-t border-brand-stone">
        <button
          onClick={goBack}
          disabled={currentQ === 0}
          className="text-sm text-brand-ink/70 hover:text-brand-ink disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          {question.optional && (
            <button onClick={goNext} className="text-sm text-brand-ink/70 hover:text-brand-ink">
              Skip
            </button>
          )}
          <button onClick={goNext} className="px-6 py-3 rounded-full bg-brand-ink text-white font-medium hover:bg-brand-ink/90 transition-colors text-sm px-6 py-2.5">
            {currentQ === totalQuestions - 1 ? "Generate my Marquee →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Input Components ──────────────────────────────────

function QuestionInput({
  question,
  value,
  onChange,
  workHistory,
  resumeSkills,
}: {
  question: Question;
  value: unknown;
  onChange: (val: unknown) => void;
  workHistory: WorkHistoryItem[];
  resumeSkills: string[];
}) {
  switch (question.type) {
    case "text":
      return (
        <TextInput
          value={(value as string) || ""}
          onChange={onChange}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
        />
      );
    case "range":
      return (
        <RangeInput
          value={(value as number) ?? question.min ?? 0}
          onChange={onChange}
          min={question.min ?? 0}
          max={question.max ?? 100}
          step={question.step ?? 1}
        />
      );
    case "dropdown":
      return (
        <DropdownInput
          value={(value as string) || ""}
          onChange={onChange}
          options={question.options || []}
        />
      );
    case "multi-select-cards":
      return (
        <MultiSelectCards
          value={(value as string[]) || []}
          onChange={onChange}
          options={question.options || []}
          maxSelect={question.maxSelect}
        />
      );
    case "rank-values":
      return (
        <RankValues value={(value as string[]) || []} onChange={onChange} />
      );
    case "multi-select-pills":
      return (
        <MultiSelectCards
          value={(value as string[]) || []}
          onChange={onChange}
          options={question.options || []}
          maxSelect={question.maxSelect}
        />
      );
    case "archetype-select":
      return (
        <ArchetypeSelect
          value={(value as { primary: string; secondary?: string }) || { primary: "" }}
          onChange={onChange}
        />
      );
    case "work-history-select":
      return (
        <WorkHistorySelect
          value={(value as TransformationalRole[]) || []}
          onChange={onChange}
          workHistory={workHistory}
        />
      );
    case "impact-cards":
      return (
        <ImpactCards
          value={(value as ImpactHighlight[]) || []}
          onChange={onChange}
        />
      );
    case "quote-cards":
      return (
        <QuoteCards
          value={(value as ColleagueQuote[]) || []}
          onChange={onChange}
        />
      );
    case "skill-editor":
      return (
        <SkillEditor
          value={(value as SkillEntry[]) || []}
          onChange={onChange}
          resumeSkills={resumeSkills}
        />
      );
    case "elviis-plus":
      return (
        <ElviisPlus
          value={(value as ElviisPlusItem[]) || []}
          onChange={onChange}
        />
      );
    case "work-prefs":
      return <WorkPrefs value={value as Record<string, unknown>} onChange={onChange} />;
    default:
      return null;
  }
}

// ── Individual Input Components ──

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors resize-none text-lg"
      />
      {maxLength && (
        <p className="text-xs text-brand-ink/60 text-right mt-1">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

function RangeInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="text-4xl font-semibold text-center mb-6">
        {value}
        {value >= max ? "+" : ""}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-lav-mid"
      />
      <div className="flex justify-between text-xs text-brand-ink/60 mt-2">
        <span>{min}</span>
        <span>{max}+</span>
      </div>
    </div>
  );
}

function DropdownInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function MultiSelectCards({
  value,
  onChange,
  options,
  maxSelect,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string; desc?: string }[];
  maxSelect?: number;
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else if (!maxSelect || value.length < maxSelect) {
      onChange([...value, v]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => toggle(o.value)}
          className={`card p-4 text-left transition-all ${
            value.includes(o.value)
              ? "border-brand-ink bg-brand-lavender/40"
              : "hover:border-lav"
          }`}
        >
          <span className="font-medium text-sm">{o.label}</span>
          {o.desc && (
            <span className="block text-xs text-brand-ink/70 mt-1">{o.desc}</span>
          )}
        </button>
      ))}
      {maxSelect && (
        <p className="col-span-full text-xs text-brand-ink/60">
          Pick up to {maxSelect}
        </p>
      )}
    </div>
  );
}

function RankValues({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(value);

  const toggle = (v: string) => {
    let next: string[];
    if (selected.includes(v)) {
      next = selected.filter((x) => x !== v);
    } else if (selected.length < 5) {
      next = [...selected, v];
    } else {
      return;
    }
    setSelected(next);
    onChange(next);
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...selected];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setSelected(next);
    onChange(next);
  };

  return (
    <div>
      {/* Selected values — ranked */}
      {selected.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-sans text-brand-ink/60 uppercase tracking-wider mb-2">
            Your ranking
          </p>
          <div className="space-y-2">
            {selected.map((v, i) => (
              <div
                key={v}
                className="card px-4 py-3 flex items-center gap-3 border-brand-ink bg-brand-lavender/40"
              >
                <span className="font-sans text-xs text-brand-ink w-6">
                  {i + 1}.
                </span>
                <span className="flex-1 text-sm font-medium">{v}</span>
                <button
                  onClick={() => moveUp(i)}
                  className="text-brand-ink/70 hover:text-brand-ink text-xs"
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  onClick={() => toggle(v)}
                  className="text-brand-ink/70 hover:text-brand-vermillion text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available values */}
      <p className="text-xs font-sans text-brand-ink/60 uppercase tracking-wider mb-2">
        {selected.length < 5
          ? `Pick ${5 - selected.length} more`
          : "Drag to reorder"}
      </p>
      <div className="flex flex-wrap gap-2">
        {VALUES_LIST.filter((v) => !selected.includes(v)).map((v) => (
          <button
            key={v}
            onClick={() => toggle(v)}
            disabled={selected.length >= 5}
            className="px-3 py-1.5 rounded-full text-sm bg-white border border-brand-stone text-brand-ink/70 hover:border-brand-ink hover:text-brand-ink transition-all disabled:opacity-40"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArchetypeSelect({
  value,
  onChange,
}: {
  value: { primary: string; secondary?: string };
  onChange: (v: { primary: string; secondary?: string }) => void;
}) {
  const selectArchetype = (arch: string) => {
    if (value.primary === arch) {
      onChange({ primary: "", secondary: value.secondary });
    } else if (value.secondary === arch) {
      onChange({ primary: value.primary, secondary: undefined });
    } else if (!value.primary) {
      onChange({ primary: arch, secondary: value.secondary });
    } else if (!value.secondary) {
      onChange({ primary: value.primary, secondary: arch });
    } else {
      onChange({ primary: value.primary, secondary: arch });
    }
  };

  return (
    <div>
      <p className="text-xs text-brand-ink/60 mb-4">
        Select 1 primary{value.primary ? " ✓" : ""}, 1 secondary optional
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARCHETYPES.map((a) => {
          const isPrimary = value.primary === a.value;
          const isSecondary = value.secondary === a.value;
          return (
            <button
              key={a.value}
              onClick={() => selectArchetype(a.value)}
              className={`card p-4 text-left transition-all ${
                isPrimary
                  ? "border-lav-dk bg-brand-lavender/40 ring-2 ring-lav-dk"
                  : isSecondary
                    ? "border-brand-ink bg-brand-lavender/40"
                    : "hover:border-lav"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{a.label}</span>
                {isPrimary && (
                  <span className="text-xs bg-lav-dk text-white px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
                {isSecondary && (
                  <span className="text-xs bg-brand-lavender text-white px-2 py-0.5 rounded-full">
                    Secondary
                  </span>
                )}
              </div>
              <span className="block text-xs text-brand-ink/70 mt-1">{a.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkHistorySelect({
  value,
  onChange,
  workHistory,
}: {
  value: TransformationalRole[];
  onChange: (v: TransformationalRole[]) => void;
  workHistory: WorkHistoryItem[];
}) {
  const toggleRole = (roleId: string) => {
    const exists = value.find((v) => v.role_id === roleId);
    if (exists) {
      onChange(value.filter((v) => v.role_id !== roleId));
    } else if (value.length < 3) {
      onChange([...value, { role_id: roleId, defining_text: "" }]);
    }
  };

  const updateDefining = (roleId: string, text: string) => {
    onChange(
      value.map((v) => (v.role_id === roleId ? { ...v, defining_text: text } : v))
    );
  };

  if (!workHistory.length) {
    return (
      <p className="text-brand-ink/70">
        No work history found. You can skip this question.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-brand-ink/60">Select 1–3 roles</p>
      {workHistory.map((w, i) => {
        const roleId = `${w.company}-${i}`;
        const selected = value.find((v) => v.role_id === roleId);
        return (
          <div key={roleId}>
            <button
              onClick={() => toggleRole(roleId)}
              className={`w-full card p-4 text-left transition-all ${
                selected ? "border-brand-ink bg-brand-lavender/40" : "hover:border-lav"
              }`}
            >
              <span className="font-medium text-sm">{w.role_title}</span>
              <span className="block text-xs text-brand-ink/70">
                {w.company} · {w.start_date} – {w.end_date}
              </span>
            </button>
            {selected && (
              <input
                type="text"
                placeholder="What made this one defining?"
                maxLength={150}
                value={selected.defining_text}
                onChange={(e) => updateDefining(roleId, e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImpactCards({
  value,
  onChange,
}: {
  value: ImpactHighlight[];
  onChange: (v: ImpactHighlight[]) => void;
}) {
  const addCard = () => {
    if (value.length < 4) {
      onChange([...value, { headline: "", context: "", story: "" }]);
    }
  };

  const update = (i: number, field: keyof ImpactHighlight, text: string) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: text };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      {value.map((item, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-sans text-brand-ink/60">
              Highlight {i + 1}
            </span>
            <button onClick={() => remove(i)} className="text-xs text-brand-ink/70 hover:text-brand-vermillion">
              Remove
            </button>
          </div>
          <input
            type="text"
            placeholder="Headline — e.g. 'Scaled pipeline 3× in 9 months'"
            maxLength={80}
            value={item.headline}
            onChange={(e) => update(i, "headline", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
          />
          <input
            type="text"
            placeholder="Company/context — e.g. 'Meridian Health, 2024'"
            maxLength={60}
            value={item.context}
            onChange={(e) => update(i, "context", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
          />
          <textarea
            placeholder="What you did, what changed, why it mattered."
            maxLength={300}
            value={item.story}
            onChange={(e) => update(i, "story", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink resize-none"
          />
        </div>
      ))}
      {value.length < 4 && (
        <button
          onClick={addCard}
          className="w-full card p-4 text-center text-sm text-brand-ink/70 hover:text-brand-ink hover:border-brand-ink transition-all border-dashed border-2"
        >
          + Add highlight
        </button>
      )}
    </div>
  );
}

function QuoteCards({
  value,
  onChange,
}: {
  value: ColleagueQuote[];
  onChange: (v: ColleagueQuote[]) => void;
}) {
  const addQuote = () => {
    if (value.length < 3) {
      onChange([...value, { text: "", name: "", relationship: "" }]);
    }
  };

  const update = (i: number, field: keyof ColleagueQuote, text: string) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: text };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      {value.map((item, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-sans text-brand-ink/60">Quote {i + 1}</span>
            <button onClick={() => remove(i)} className="text-xs text-brand-ink/70 hover:text-brand-vermillion">
              Remove
            </button>
          </div>
          <textarea
            placeholder="What they said..."
            maxLength={200}
            value={item.text}
            onChange={(e) => update(i, "text", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={item.name}
              onChange={(e) => update(i, "name", e.target.value)}
              className="px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={item.relationship}
              onChange={(e) => update(i, "relationship", e.target.value)}
              className="px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
            />
          </div>
        </div>
      ))}
      {value.length < 3 && (
        <button
          onClick={addQuote}
          className="w-full card p-4 text-center text-sm text-brand-ink/70 hover:text-brand-ink hover:border-brand-ink transition-all border-dashed border-2"
        >
          + Add quote
        </button>
      )}
    </div>
  );
}

function SkillEditor({
  value,
  onChange,
  resumeSkills,
}: {
  value: SkillEntry[];
  onChange: (v: SkillEntry[]) => void;
  resumeSkills: string[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const proficiencyLabels = [
    "",
    "Foundational",
    "Working Knowledge",
    "Proficient",
    "Advanced",
    "Expert",
  ];

  // Initialize from resume skills if empty
  useEffect(() => {
    if (value.length === 0 && resumeSkills.length > 0) {
      const initial = resumeSkills.map((s) => ({
        skill_name: s,
        proficiency: 3,
        category: "Other",
      }));
      onChange(initial);
    }
  }, [resumeSkills, value.length, onChange]);

  const addSkill = (name: string) => {
    if (value.length >= 50) return;
    if (value.find((s) => s.skill_name.toLowerCase() === name.toLowerCase())) return;
    onChange([...value, { skill_name: name, proficiency: 3, category: "Other" }]);
    setSearchTerm("");
  };

  const updateProficiency = (i: number, prof: number) => {
    // Max 5 expert ratings
    if (prof === 5 && value.filter((s) => s.proficiency === 5).length >= 5) {
      const existing = value[i];
      if (existing.proficiency !== 5) return;
    }
    const next = [...value];
    next[i] = { ...next[i], proficiency: prof };
    onChange(next);
  };

  const removeSkill = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      {/* Add skill */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search or type a skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm.trim()) {
              addSkill(searchTerm.trim());
            }
          }}
          className="w-full px-4 py-3 rounded-xl border border-brand-stone bg-white focus:outline-none focus:border-brand-ink"
        />
        <p className="text-xs text-brand-ink/60 mt-1">
          {value.length}/50 skills · Press Enter to add · Max 5 Expert ratings
        </p>
      </div>

      {/* Skills list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {value.map((skill, i) => (
          <div key={i} className="card px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium flex-1 truncate">
              {skill.skill_name}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => updateProficiency(i, level)}
                  title={proficiencyLabels[level]}
                  className={`w-6 h-6 rounded text-xs transition-all ${
                    skill.proficiency >= level
                      ? level === 5
                        ? "bg-lav-dk text-white"
                        : "bg-brand-lavender text-white"
                      : "bg-brand-paper text-brand-ink/60"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={() => removeSkill(i)}
              className="text-brand-ink/70 hover:text-brand-vermillion text-xs ml-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElviisPlus({
  value,
  onChange,
}: {
  value: ElviisPlusItem[];
  onChange: (v: ElviisPlusItem[]) => void;
}) {
  const MODULES = [
    { type: "newsletter" as const, label: "Newsletter / Blog", icon: "📝" },
    { type: "projects" as const, label: "Projects", icon: "🔨" },
    { type: "portfolio" as const, label: "Portfolio", icon: "💼" },
    { type: "publications" as const, label: "Publications & Writing", icon: "📚" },
    { type: "speaking" as const, label: "Speaking & Events", icon: "🎤" },
    { type: "media" as const, label: "Media & Press", icon: "📰" },
    { type: "community" as const, label: "Community & Boards", icon: "🤝" },
  ];

  const addItem = (moduleType: ElviisPlusItem["module_type"]) => {
    onChange([
      ...value,
      { module_type: moduleType, title: "", description: "", url: "" },
    ]);
  };

  const update = (i: number, field: string, text: string) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: text };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <p className="text-brand-ink/70 text-sm mb-6">
        Add anything else that tells your story. Each takes ~30 seconds.
      </p>

      {/* Existing items */}
      {value.map((item, i) => (
        <div key={i} className="card p-4 mb-3 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-sans text-brand-ink/60 capitalize">
              {item.module_type}
            </span>
            <button onClick={() => remove(i)} className="text-xs text-brand-ink/70 hover:text-brand-vermillion">
              Remove
            </button>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={item.title}
            onChange={(e) => update(i, "title", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
          />
          <input
            type="text"
            placeholder="Description"
            value={item.description || ""}
            onChange={(e) => update(i, "description", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={item.url || ""}
            onChange={(e) => update(i, "url", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-stone bg-white text-sm focus:outline-none focus:border-brand-ink"
          />
        </div>
      ))}

      {/* Module buttons */}
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((m) => (
          <button
            key={m.type}
            onClick={() => addItem(m.type)}
            className="card p-4 text-left hover:border-brand-ink transition-all"
          >
            <span className="text-xl mb-1 block">{m.icon}</span>
            <span className="text-sm font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkPrefs({
  value,
  onChange,
}: {
  value: Record<string, unknown> | undefined;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const state = value || {};

  const update = (key: string, val: unknown) => {
    onChange({ ...state, [key]: val });
  };

  const locations = state.wp_locations as string[] || [];
  const LOCATION_OPTIONS = [
    "Fully remote",
    "Remote-first with occasional onsite",
    "Hybrid",
    "In-person preferred",
  ];
  const AVAILABILITY_OPTIONS = [
    "Immediately",
    "Within 30 days",
    "Within 60–90 days",
    "Just exploring",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-brand-ink/60 mb-3">
          Where can you work?
        </label>
        <div className="flex flex-wrap gap-2">
          {LOCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                const next = locations.includes(opt)
                  ? locations.filter((l) => l !== opt)
                  : [...locations, opt];
                update("wp_locations", next);
              }}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                locations.includes(opt)
                  ? "bg-ink text-white"
                  : "bg-white border border-brand-stone text-brand-ink/70 hover:border-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-brand-ink/60 mb-3">
          When are you available?
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => update("wp_availability", opt)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                state.wp_availability === opt
                  ? "bg-ink text-white"
                  : "bg-white border border-brand-stone text-brand-ink/70 hover:border-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
