"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import OnboardShell from "@/components/OnboardShell";

const WORK_TYPES = [
  { value: "Full-time", color: "bg-brand-citron", border: "border-brand-citron" },
  { value: "Fractional", color: "bg-brand-sky", border: "border-brand-sky" },
  { value: "Both", color: "bg-brand-green", border: "border-brand-green" },
  { value: "Exploring", color: "bg-brand-stone", border: "border-brand-stone" },
];
const WORK_STATUSES = ["Open now", "Open to the right thing", "Not actively looking"];
const WORK_ENVS = ["Remote", "Hybrid", "In-person", "Flexible"];

export default function OnboardBasicsPage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [workType, setWorkType] = useState("");
  const [workStatus, setWorkStatus] = useState("");
  const [workEnv, setWorkEnv] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [salaryMin, setSalaryMin] = useState(100);
  const [salaryMax, setSalaryMax] = useState(250);
  const [rateMin, setRateMin] = useState(100);
  const [rateMax, setRateMax] = useState(300);
  const [showComp, setShowComp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  useEffect(() => {
    const resumeData = localStorage.getItem("marquee_resume");
    if (resumeData) {
      try {
        const parsed = JSON.parse(resumeData);
        if (parsed.full_name) setName(parsed.full_name);
        if (parsed.location) setLocation(parsed.location);
      } catch {
        // ignore
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setName((current) => {
        if (current) return current;
        const meta = user.user_metadata as { full_name?: string } | undefined;
        return meta?.full_name?.trim() || "";
      });
    });
  }, [supabase]);

  const saveField = async (key: string, value: unknown) => {
    if (!userId) return;
    await fetch("/api/save-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, answers: { [key]: value } }),
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    let avatarUrl = null;
    if (avatarFile && userId) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrl;
    }

    await fetch("/api/save-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        answers: {
          name,
          location,
          dob,
          avatar_url: avatarUrl,
          work_type: workType,
          work_status: workStatus,
          work_env: workEnv,
          hours_per_week:
            workType === "Fractional" || workType === "Both" ? hoursPerWeek : null,
          salary_min: showComp ? salaryMin * 1000 : null,
          salary_max: showComp ? salaryMax * 1000 : null,
          rate_min: showComp ? rateMin : null,
          rate_max: showComp ? rateMax : null,
        },
      }),
    });

    const username = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const supabaseServer = createBrowserSupabase();
    await supabaseServer.from("profiles_meta").update({ username }).eq("id", userId);

    router.push("/onboard/elviis");
  };

  const showHours = workType === "Fractional" || workType === "Both";

  return (
    <OnboardShell step="basics">
      <div className="w-full max-w-2xl mt-8 md:mt-12">
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
          Step 2
        </span>
        <h1 className="font-canela text-4xl md:text-5xl text-brand-ink leading-[1.05] mt-2 tracking-[-0.01em]">
          Hi{name ? ` ${name.split(" ")[0]}` : ""}, a few basics.
        </h1>
        <p className="text-brand-ink/70 mt-4 leading-relaxed">
          Everything here can be changed later. Auto-saves as you go.
        </p>

        {/* Identity */}
        <section className="mt-12">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-5">
            Identity
          </h2>
          <div className="space-y-5">
            <Field label="Full name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => saveField("name", name)}
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => saveField("location", location)}
                placeholder="City, State"
                className={inputClass}
              />
            </Field>
            <Field label="Date of birth" hint="Internal only — never displayed publicly.">
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  saveField("dob", e.target.value);
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Profile photo">
              <div className="flex items-center gap-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-brand-stone hover:border-brand-ink transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-white shrink-0"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-brand-ink/40 text-2xl">+</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-brand-ink/60 leading-relaxed">
                  Optional but encouraged.<br />Square photos work best.
                </p>
              </div>
            </Field>
          </div>
        </section>

        {/* Work Setup */}
        <section className="mt-14">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-5">
            Work setup
          </h2>
          <div className="space-y-8">
            <div>
              <label className={labelClass}>Work type</label>
              <div className="grid grid-cols-2 gap-3">
                {WORK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setWorkType(t.value);
                      saveField("work_type", t.value);
                    }}
                    className={`p-4 rounded-2xl text-left text-sm font-medium border-2 transition-all ${
                      workType === t.value
                        ? `${t.color} ${t.border} text-brand-ink`
                        : "bg-white border-brand-stone text-brand-ink/70 hover:border-brand-ink"
                    }`}
                  >
                    {t.value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Work status</label>
              <div className="flex flex-wrap gap-2">
                {WORK_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setWorkStatus(status);
                      saveField("work_status", status);
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      workStatus === status
                        ? "bg-brand-ink text-white border-brand-ink"
                        : "bg-white border-brand-stone text-brand-ink/70 hover:border-brand-ink"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Work environment</label>
              <div className="flex flex-wrap gap-2">
                {WORK_ENVS.map((env) => (
                  <button
                    key={env}
                    onClick={() => {
                      const next = workEnv.includes(env)
                        ? workEnv.filter((e) => e !== env)
                        : [...workEnv, env];
                      setWorkEnv(next);
                      saveField("work_env", next);
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      workEnv.includes(env)
                        ? "bg-brand-lavender border-brand-lavender text-brand-ink"
                        : "bg-white border-brand-stone text-brand-ink/70 hover:border-brand-ink"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {showHours && (
              <div>
                <label className={labelClass}>
                  Hours available per week
                  <span className="ml-2 font-canela text-brand-ink text-lg">
                    {hoursPerWeek}
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={hoursPerWeek}
                  onChange={(e) => {
                    setHoursPerWeek(Number(e.target.value));
                    saveField("hours_per_week", Number(e.target.value));
                  }}
                  className="w-full accent-brand-ink"
                />
                <div className="flex justify-between text-xs text-brand-ink/50 mt-1">
                  <span>5 hrs</span>
                  <span>40 hrs</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Compensation */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
              Compensation
            </h2>
            <button
              onClick={() => setShowComp(!showComp)}
              className="text-xs text-brand-ink/60 hover:text-brand-ink transition-colors underline"
            >
              {showComp ? "Prefer not to say" : "Show compensation"}
            </button>
          </div>

          {showComp && (
            <div className="space-y-8">
              <p className="text-xs text-brand-ink/60 leading-relaxed">
                Stored but not displayed publicly. Visible to verified recruiters only.
              </p>
              <div>
                <label className={labelClass}>
                  Salary range
                  <span className="ml-2 font-canela text-brand-ink text-lg">
                    ${salaryMin}K – ${salaryMax}K
                    {salaryMax >= 500 ? "+" : ""}
                  </span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min={40}
                    max={500}
                    step={10}
                    value={salaryMin}
                    onChange={(e) =>
                      setSalaryMin(Math.min(Number(e.target.value), salaryMax - 10))
                    }
                    className="flex-1 accent-brand-ink"
                  />
                  <input
                    type="range"
                    min={40}
                    max={500}
                    step={10}
                    value={salaryMax}
                    onChange={(e) =>
                      setSalaryMax(Math.max(Number(e.target.value), salaryMin + 10))
                    }
                    className="flex-1 accent-brand-ink"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Hourly rate
                  <span className="ml-2 font-canela text-brand-ink text-lg">
                    ${rateMin}/hr – ${rateMax}
                    {rateMax >= 500 ? "+" : ""}/hr
                  </span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={rateMin}
                    onChange={(e) =>
                      setRateMin(Math.min(Number(e.target.value), rateMax - 25))
                    }
                    className="flex-1 accent-brand-ink"
                  />
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={rateMax}
                    onChange={(e) =>
                      setRateMax(Math.max(Number(e.target.value), rateMin + 25))
                    }
                    className="flex-1 accent-brand-ink"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="w-full mt-14 px-8 py-4 rounded-full bg-brand-ink text-white text-lg font-medium hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving…" : "Start my Marquee →"}
        </button>
      </div>
    </OnboardShell>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-brand-stone bg-white text-brand-ink focus:outline-none focus:border-brand-ink transition-colors";

const labelClass =
  "block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-3";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-brand-ink/50 mt-1.5">{hint}</p>}
    </div>
  );
}
