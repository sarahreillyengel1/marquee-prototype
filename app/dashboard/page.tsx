"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEMES = [
  { key: "light", label: "Light", preview: "bg-cream" },
  { key: "dark", label: "Dark", preview: "bg-navy" },
  { key: "indigo", label: "Indigo", preview: "bg-lav-lt" },
  { key: "warm", label: "Warm", preview: "bg-coral-lt" },
];

interface ContactRequest {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_company: string | null;
  intent: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

const INTENT_LABELS: Record<string, string> = {
  hiring: "Hiring",
  project: "Project",
  speaking: "Speaking",
  collab: "Collab",
  other: "Other",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const supabase = createBrowserSupabase();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: profileData }, { data: contactData }] = await Promise.all([
        supabase
          .from("generated_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("contact_requests")
          .select("*")
          .eq("profile_user_id", user.id)
          .is("archived_at", null)
          .order("created_at", { ascending: false }),
      ]);

      if (!profileData) {
        router.push("/onboard/resume");
        return;
      }

      setProfile(profileData);
      setContacts(contactData || []);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const markRead = async (id: string) => {
    await supabase
      .from("contact_requests")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, read_at: new Date().toISOString() } : c))
    );
  };

  const archiveContact = async (id: string) => {
    await supabase
      .from("contact_requests")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleExpand = (id: string, isUnread: boolean) => {
    if (expandedContact === id) {
      setExpandedContact(null);
    } else {
      setExpandedContact(id);
      if (isUnread) markRead(id);
    }
  };

  const handleThemeChange = async (theme: string) => {
    if (!profile) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("generated_profiles")
      .update({ theme })
      .eq("user_id", user.id);

    setProfile({ ...profile, theme });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lav-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const username = profile.username as string;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-sans font-bold text-2xl">marquee</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray hover:text-ink"
          >
            Log out
          </button>
        </div>

        <h2 className="font-sans font-bold text-4xl mb-2">Your Marquee</h2>
        <p className="text-gray mb-8">
          Manage your profile, change your theme, or share your link.
        </p>

        {/* Profile link */}
        <div className="card p-6 mb-6">
          <h3 className="section-label mb-2">Your profile link</h3>
          <div className="flex items-center gap-3">
            <span className="font-sans text-lg flex-1">
              marquee.bio/{username}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`marquee.bio/${username}`);
              }}
              className="btn-pill btn-primary text-sm px-5 py-2"
            >
              Copy link
            </button>
            <Link
              href={`/${username}`}
              className="btn-pill btn-secondary text-sm px-5 py-2 inline-block"
            >
              View profile
            </Link>
          </div>
        </div>

        {/* Inbox */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-label">
              Inbox{contacts.length > 0 ? ` · ${contacts.length}` : ""}
            </h3>
            {contacts.filter((c) => !c.read_at).length > 0 && (
              <span className="text-xs font-bold uppercase tracking-wider bg-lav-dk text-white px-2 py-1 rounded-full">
                {contacts.filter((c) => !c.read_at).length} new
              </span>
            )}
          </div>
          {contacts.length === 0 ? (
            <p className="text-sm text-gray">
              No messages yet. When someone reaches out through your Marquee, you&apos;ll see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => {
                const isUnread = !c.read_at;
                const isExpanded = expandedContact === c.id;
                return (
                  <div
                    key={c.id}
                    className={`border rounded-lg transition-colors ${
                      isUnread ? "border-lav-mid bg-lav-lt/40" : "border-border"
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(c.id, isUnread)}
                      className="w-full text-left p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-lav-dk shrink-0" />
                          )}
                          <span className="font-sans font-semibold truncate">
                            {c.sender_name}
                          </span>
                          {c.sender_company && (
                            <span className="text-xs text-gray-2 truncate">
                              · {c.sender_company}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-cream text-gray px-2 py-0.5 rounded-full shrink-0">
                            {INTENT_LABELS[c.intent] || c.intent}
                          </span>
                        </div>
                        <p className="text-sm text-gray truncate">{c.message}</p>
                      </div>
                      <span className="text-xs text-gray-2 shrink-0">
                        {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{c.message}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <a
                            href={`mailto:${c.sender_email}?subject=Re: your Marquee message`}
                            className="btn-pill btn-primary text-xs px-4 py-2"
                          >
                            Reply via email
                          </a>
                          <button
                            onClick={() => archiveContact(c.id)}
                            className="btn-pill btn-secondary text-xs px-4 py-2"
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme selector */}
        <div className="card p-6 mb-6">
          <h3 className="section-label mb-4">Profile theme</h3>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => handleThemeChange(t.key)}
                className={`p-4 rounded-xl text-center transition-all ${t.preview} ${
                  profile.theme === t.key
                    ? "ring-2 ring-lav-dk"
                    : "hover:ring-1 hover:ring-border"
                }`}
              >
                <span className="text-xs font-sans">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="card p-6 mb-6">
          <h3 className="section-label mb-4">Profile details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray">Name</span>
              <span>{profile.name as string}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray">Headline</span>
              <span className="text-right max-w-xs truncate">
                {profile.ai_headline as string}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray">Generated</span>
              <span>
                {new Date(
                  profile.generated_at as string
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/${username}`}
            className="block card p-4 text-center hover:border-lav-mid transition-colors"
          >
            Edit your profile inline →
          </Link>
          <Link
            href="/onboard/elviis"
            className="block card p-4 text-center text-gray hover:border-lav-mid transition-colors"
          >
            Retake ELVIIS questionnaire
          </Link>
        </div>
      </div>
    </div>
  );
}
