import { callClaude, parseJSON } from "@/lib/claude";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { GeneratedProfile } from "@/types";

export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  // Fetch all data
  const [
    { data: intake },
    { data: resumeData },
    { data: workHistory },
    { data: skills },
    { data: profileMeta },
  ] = await Promise.all([
    supabase.from("intake_answers").select("answers").eq("user_id", userId).single(),
    supabase.from("resume_data").select("parsed").eq("user_id", userId).single(),
    supabase.from("work_history").select("*").eq("user_id", userId).order("display_order"),
    supabase.from("skills").select("*").eq("user_id", userId),
    supabase.from("profiles_meta").select("username").eq("id", userId).single(),
  ]);

  const answers = intake?.answers || {};
  const parsed = resumeData?.parsed || {};

  // Format work history for prompt
  const workHistoryText = (workHistory || [])
    .map(
      (w: Record<string, unknown>) =>
        `${w.role_title} at ${w.company} (${w.start_date} – ${w.end_date}) [${w.sector}, ${w.stage}]\nBullets: ${JSON.stringify(w.original_bullets)}`
    )
    .join("\n\n");

  // Format skills
  const profLabels = ["", "Foundational", "Working Knowledge", "Proficient", "Advanced", "Expert"];
  const skillsText = (answers.skills || skills || [])
    .map((s: Record<string, unknown>) => `${s.skill_name} (${profLabels[s.proficiency as number] || "Proficient"})`)
    .join(", ");

  // Format impact highlights
  const impactText = (answers.impact_highlights || [])
    .map(
      (h: Record<string, unknown>) =>
        `${h.headline} — ${h.context}: ${h.story}`
    )
    .join("\n");

  // Format transformational roles
  const transformationalText = (answers.e_transformational || [])
    .map((t: Record<string, unknown>) => `${t.role_id}: ${t.defining_text}`)
    .join("; ");

  const prompt = `You are generating a Marquee professional profile. Marquee replaces the resume. Your output must be so good that someone who reads it would never want to send a resume again.

Return ONLY valid JSON. No preamble. No markdown fences. No explanation.

{
  "headline": "1-sentence positioning statement, max 120 chars. NOT a job title. Something that says what they actually do and why it matters. Use their own language.",
  "career_arc": "3-4 sentences, first person, about the through-line of this person's career. Specific to them, not generic. Uses concrete companies and outcomes. Reads like a human wrote it.",
  "pull_quote": "Their answer to 'what do you wish people knew' — keep their exact voice and phrasing. If they gave something quotable, use it. Max 200 chars.",
  "leadership_summary": "1 paragraph, confident, specific. References their archetype(s), their actual stated style, their leadership depth. No clichés. No 'passionate', 'results-driven', 'thought leader'.",
  "experience_narratives": [
    {
      "company": "company name from work history",
      "role": "role title",
      "narrative": "2-3 sentences that rewrite the bullets into a story. What was the situation, what did they do, what changed. Numbers if available."
    }
  ],
  "insights_summary": "2-3 sentences synthesizing their POV from the Insights section. Should sound like something only this person could say.",
  "skills_featured": ["top 5 skills to feature prominently — derived from their Expert ratings OR inferred from their answers if no explicit ratings"]
}

USER DATA:
Name: ${answers.name || parsed.full_name || "Unknown"}
Current situation: ${answers.e_now || "Not provided"}
Ideal next role: ${answers.e_next || "Not provided"}
Through-line: ${answers.e_through_line || "Not provided"}
Transformational roles: ${transformationalText || "Not provided"}
Leadership style: ${answers.l_style || "Not provided"}
Leadership archetypes: ${JSON.stringify(answers.l_archetypes) || "Not provided"}
Leadership belief: ${answers.l_belief || "Not provided"}
Years leading: ${answers.l_years || "Not provided"}, largest team: ${answers.l_team_size || "Not provided"}
Values (ranked): ${JSON.stringify(answers.v_values) || "Not provided"}
What they need: ${JSON.stringify(answers.v_needs) || "Not provided"}
Culture: ${answers.v_culture || "Not provided"}
Impact highlights: ${impactText || "Not provided"}
Wish people knew: ${answers.ii_wish || "Not provided"}
Brings to work: ${answers.ii_bring || "Not provided"}
Changed mind about: ${answers.ii_changed || "Not provided"}
Field insight: ${answers.ii_field || "Not provided"}
Work history: ${workHistoryText || "Not provided"}
Career themes: ${JSON.stringify(parsed.career_themes) || "Not provided"}
Career assessment: ${parsed.career_assessment || "Not provided"}
Skills: ${skillsText || "Not provided"}`;

  try {
    const raw = await callClaude(prompt);
    const generated = await parseJSON<GeneratedProfile>(raw);

    const username = profileMeta?.username || userId.slice(0, 8);

    // Save generated profile
    await supabase.from("generated_profiles").upsert(
      {
        user_id: userId,
        username,
        name: answers.name || parsed.full_name,
        location: answers.location || parsed.location,
        dob: answers.dob || null,
        avatar_url: answers.avatar_url || null,
        work_type: answers.work_type,
        work_status: answers.work_status,
        work_env: answers.work_env || [],
        hours_per_week: answers.hours_per_week,
        salary_min: answers.salary_min,
        salary_max: answers.salary_max,
        rate_min: answers.rate_min,
        rate_max: answers.rate_max,
        ai_headline: generated.headline,
        ai_career_arc: generated.career_arc,
        ai_pull_quote: generated.pull_quote,
        ai_leadership_summary: generated.leadership_summary,
        ai_insights_summary: generated.insights_summary,
        theme: "light",
        elviis_plus: answers.elviis_plus || [],
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Save experience narratives to work_history
    if (generated.experience_narratives) {
      for (const narrative of generated.experience_narratives) {
        await supabase
          .from("work_history")
          .update({ ai_narrative: narrative.narrative })
          .eq("user_id", userId)
          .eq("company", narrative.company);
      }
    }

    // Save skills if from intake
    if (answers.skills?.length) {
      await supabase.from("skills").delete().eq("user_id", userId);
      await supabase.from("skills").insert(
        answers.skills.map((s: Record<string, unknown>) => ({
          user_id: userId,
          skill_name: s.skill_name,
          proficiency: s.proficiency,
          category: s.category,
        }))
      );
    }

    // Mark intake complete
    await supabase
      .from("intake_answers")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", userId);

    return NextResponse.json({ username, profile: generated });
  } catch (error) {
    console.error("Generate profile error:", error);
    return NextResponse.json(
      { error: "Failed to generate profile" },
      { status: 500 }
    );
  }
}
