"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const WORK_TYPES = ["Full-time", "Fractional", "Both", "Exploring"];
const WORK_STATUSES = [
  "Open now",
  "Open to the right thing",
  "Not actively looking",
];
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
    // Load resume data to pre-fill
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

    // Get user + use auth metadata as a fallback when resume didn't surface a name
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      // Only use metadata name if the resume parse didn't already fill it
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
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Upload avatar if selected
    let avatarUrl = null;
    if (avatarFile && userId) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      await supabase.storage.from("avatars").upload(path, avatarFile, {
        upsert: true,
      });
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrl;
    }

    // Save all basics
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
            workType === "Fractional" || workType === "Both"
              ? hoursPerWeek
              : null,
          salary_min: showComp ? salaryMin * 1000 : null,
          salary_max: showComp ? salaryMax * 1000 : null,
          rate_min: showComp ? rateMin : null,
          rate_max: showComp ? rateMax : null,
        },
      }),
    });

    // Create username from name
    const username = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);

    // Save username to profiles_meta
    const supabaseServer = createBrowserSupabase();
    await supabaseServer
      .from("profiles_meta")
      .update({ username })
      .eq("id", userId);

    router.push("/onboard/elviis");
  };

  const showHours = workType === "Fractional" || workType === "Both";

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-sans font-bold text-lg text-ink mb-8">marquee</h1>

        <h2 className="font-sans font-bold text-3xl mb-2">
          Hi{name ? ` ${name.split(" ")[0]}` : ""}, let&apos;s get a few basics
          before we build your Marquee.
        </h2>
        <p className="text-gray mb-10">
          Everything here can be changed later.
        </p>

        {/* Identity */}
        <div className="mb-10">
          <h3 className="section-label mb-4">Identity</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => saveField("name", name)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-lav-mid transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => saveField("location", location)}
                placeholder="City, State"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-lav-mid transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Date of birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  saveField("dob", e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-lav-mid transition-colors"
              />
              <p className="text-xs text-gray-2 mt-1">
                Internal only — never displayed publicly.
              </p>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-1.5">
                Profile photo
              </label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-lav-mid transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-white"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-2 text-2xl">+</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-gray">
                  Optional but encouraged. Square works best.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Setup */}
        <div className="mb-10">
          <h3 className="section-label mb-4">Work setup</h3>

          <div className="space-y-6">
            {/* Work type - card select */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                Work type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {WORK_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setWorkType(type);
                      saveField("work_type", type);
                    }}
                    className={`card p-4 text-left text-sm font-medium transition-all ${
                      workType === type
                        ? "border-lav-mid bg-lav-lt text-ink"
                        : "hover:border-lav text-gray"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Work status - pills */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                Work status
              </label>
              <div className="flex flex-wrap gap-2">
                {WORK_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setWorkStatus(status);
                      saveField("work_status", status);
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      workStatus === status
                        ? "bg-ink text-white"
                        : "bg-white border border-border text-gray hover:border-ink"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Work environment - multi-select pills */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                Work environment
              </label>
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
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      workEnv.includes(env)
                        ? "bg-ink text-white"
                        : "bg-white border border-border text-gray hover:border-ink"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours per week (conditional) */}
            {showHours && (
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                  Hours available per week: {hoursPerWeek}
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
                  className="w-full accent-lav-mid"
                />
                <div className="flex justify-between text-xs text-gray-2 mt-1">
                  <span>5 hrs</span>
                  <span>40 hrs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compensation */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-label">Compensation</h3>
            <button
              onClick={() => setShowComp(!showComp)}
              className="text-xs text-gray hover:text-ink transition-colors"
            >
              {showComp ? "Prefer not to say" : "Show compensation"}
            </button>
          </div>

          {showComp && (
            <div className="space-y-6">
              <p className="text-xs text-gray">
                Visible to verified recruiters only in v2. Stored but not
                displayed publicly.
              </p>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                  Salary range: ${salaryMin}K – ${salaryMax}K
                  {salaryMax >= 500 ? "+" : ""}
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min={40}
                    max={500}
                    step={10}
                    value={salaryMin}
                    onChange={(e) =>
                      setSalaryMin(
                        Math.min(Number(e.target.value), salaryMax - 10)
                      )
                    }
                    className="flex-1 accent-lav-mid"
                  />
                  <input
                    type="range"
                    min={40}
                    max={500}
                    step={10}
                    value={salaryMax}
                    onChange={(e) =>
                      setSalaryMax(
                        Math.max(Number(e.target.value), salaryMin + 10)
                      )
                    }
                    className="flex-1 accent-lav-mid"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-2 mb-3">
                  Hourly rate: ${rateMin}/hr – ${rateMax}
                  {rateMax >= 500 ? "+" : ""}/hr
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={rateMin}
                    onChange={(e) =>
                      setRateMin(
                        Math.min(Number(e.target.value), rateMax - 25)
                      )
                    }
                    className="flex-1 accent-lav-mid"
                  />
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={rateMax}
                    onChange={(e) =>
                      setRateMax(
                        Math.max(Number(e.target.value), rateMin + 25)
                      )
                    }
                    className="flex-1 accent-lav-mid"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="w-full btn-pill btn-primary text-center text-lg py-4 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Start my Marquee →"}
        </button>
      </div>
    </div>
  );
}
