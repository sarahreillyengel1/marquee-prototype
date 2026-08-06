"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";
import { mapToProfile, type MapperInput } from "@/lib/profile-mapper";
import { DEMO_PROFILES } from "@/lib/demo-profiles";
import { ProfileView } from "./ProfileView";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const demo = DEMO_PROFILES[username]; // hardcoded showcase profiles — no DB fetch
  const [data, setData] = useState<MapperInput | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function load() {
      if (demo) { setLoading(false); return; } // demo profiles skip the DB entirely
      const res = await fetch(`/api/profile/${username}`);
      if (res.ok) {
        const profileData = (await res.json()) as MapperInput;
        setData(profileData);

        // Check if current user owns this profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const owner = !!user && profileData.profile?.user_id === user.id;
        if (owner) {
          setIsOwner(true);
        }

        // Log a view for non-owner visits only. Dedupe per browser session so
        // a refresh or React strict-mode double-run doesn't double-count.
        if (!owner && username !== "demo") {
          const seenKey = `mv_viewed_${username}`;
          if (!sessionStorage.getItem(seenKey)) {
            sessionStorage.setItem(seenKey, "1");
            fetch(`/api/profile/${username}/view`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ referrer: document.referrer || null }),
            }).catch(() => {});
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [username, supabase, demo]);

  if (demo) {
    return <ProfileView profile={demo} view="public" />;
  }

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

  const mapped = mapToProfile(data);

  return <ProfileView profile={mapped} view={isOwner ? "owner" : "public"} />;
}
