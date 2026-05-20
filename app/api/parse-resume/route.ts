import { callClaude, parseJSON } from "@/lib/claude";
import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { ResumeParseResult } from "@/types";
// pdf-parse v1 has a quirk where importing the package root triggers a test-file
// read at module init. Importing the lib entrypoint directly skips that.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer
) => Promise<{ text: string }>;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const pastedText = formData.get("text") as string | null;
  const userId = formData.get("userId") as string;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let resumeText = "";

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (file.name.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdfParse(buffer);
      resumeText = parsed.text;
    } else {
      resumeText = buffer.toString("utf-8");
    }
  } else if (pastedText) {
    resumeText = pastedText;
  } else {
    return NextResponse.json({ error: "No resume provided" }, { status: 400 });
  }

  if (!resumeText.trim()) {
    return NextResponse.json({ error: "Resume appears empty" }, { status: 400 });
  }

  const prompt = `You are parsing a professional resume. Extract and return ONLY valid JSON — no preamble, no markdown fences.

Return this exact structure:
{
  "full_name": "string",
  "location": "city, state or country",
  "current_title": "most recent job title",
  "current_company": "most recent company",
  "email": "if present, else null",
  "linkedin_url": "if present, else null",
  "years_experience": number,
  "career_themes": ["3-5 short theme tags, e.g. 'Early startup hire', 'B2B SaaS operator', 'People leader 8+ years'"],
  "career_assessment": "2-3 sentences in second person ('You've spent...') describing the through-line of this person's career. Specific, not generic.",
  "work_history": [
    {
      "role_title": "string",
      "company": "string",
      "start_date": "YYYY-MM or 'Present'",
      "end_date": "YYYY-MM or 'Present'",
      "is_current": boolean,
      "bullets": ["original bullet strings from resume"],
      "sector": "inferred sector e.g. B2B SaaS, Consumer, HealthTech, FinTech, Creator Economy, Agency, etc.",
      "stage": "inferred stage e.g. Seed, Series A, Series B, Growth, Enterprise, Public"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "graduation_year": number or null
    }
  ],
  "skills_extracted": ["array of skills mentioned or inferred from resume, up to 30"]
}

Resume text:
${resumeText}`;

  try {
    const raw = await callClaude(prompt);
    const parsed = await parseJSON<ResumeParseResult>(raw);

    // Store in Supabase
    const supabase = createServerSupabase();
    await supabase.from("resume_data").upsert(
      {
        user_id: userId,
        raw_text: resumeText,
        parsed: parsed as unknown as Record<string, unknown>,
      },
      { onConflict: "user_id" }
    );

    // Store work history entries
    if (parsed.work_history?.length) {
      // Delete existing
      await supabase.from("work_history").delete().eq("user_id", userId);

      const workEntries = parsed.work_history.map((w, i) => ({
        user_id: userId,
        company: w.company,
        role_title: w.role_title,
        start_date: w.start_date,
        end_date: w.end_date,
        is_current: w.is_current,
        sector: w.sector,
        stage: w.stage,
        original_bullets: w.bullets,
        display_order: i,
      }));

      await supabase.from("work_history").insert(workEntries);
    }

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("Resume parse error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
