"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { builderToProfile, type BuilderSnapshot } from "@/lib/builder-to-profile";
import { ProfileView } from "@/app/[username]/ProfileView";
import type { Profile } from "@/lib/profile-types";

// Live draft preview: renders the current builder draft through the same
// mapper Publish uses, so you see exactly how your profile will look before
// pushing changes live. Reads only your own draft (RLS-scoped).
export default function DraftPreview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const supabase = createBrowserSupabase();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: draft } = await supabase.from("builder_drafts").select("data").eq("user_id", user.id).maybeSingle();
      const d = draft?.data as BuilderSnapshot | undefined;
      if (!d || !Object.keys(d).length) { setErr("Nothing to preview yet — add some content in the builder first."); return; }
      const { data: pub } = await supabase.from("published_profiles").select("username").eq("user_id", user.id).maybeSingle();
      setProfile(builderToProfile(d, pub?.username || "preview"));
    })();
  }, []);

  if (err) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-inter text-brand-ink">
      <p className="text-[15px] text-[#57524c]">{err}</p>
      <a href="/build-preview" className="font-sans bg-brand-ink text-white text-[13px] font-medium py-[10px] px-5">← Back to editing</a>
    </div>
  );
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#73926A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 py-3 px-5 bg-brand-ink text-white font-inter text-[13px]">
        <span><b>Preview</b> — how visitors see your profile · reflects your latest saved edits</span>
        <a href="/build-preview" className="font-sans font-medium underline whitespace-nowrap">← Back to editing</a>
      </div>
      <ProfileView profile={profile} view="public" />
    </>
  );
}
