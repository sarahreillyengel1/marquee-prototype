"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEMES = [
  { key: "light", label: "Light", preview: "bg-brand-paper", ring: "ring-brand-ink" },
  { key: "dark", label: "Dark", preview: "bg-brand-ink", ring: "ring-brand-lavender" },
  { key: "indigo", label: "Indigo", preview: "bg-brand-lavender", ring: "ring-brand-ink" },
  { key: "warm", label: "Warm", preview: "bg-brand-vermillion/20", ring: "ring-brand-ink" },
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
  const [copied, setCopied] = useState(false);
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
        supabase.from("generated_profiles").select("*").eq("user_id", user.id).single(),
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("generated_profiles").update({ theme }).eq("user_id", user.id);
    setProfile({ ...profile, theme });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`marquee.bio/${profile.username as string}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !profile) {
    return (
      <div className="brand-body min-h-screen font-inter flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const username = profile.username as string;
  const unreadCount = contacts.filter((c) => !c.read_at).length;

  return (
    <div className="brand-body min-h-screen font-inter">
      {/* Top bar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="wordmark text-lg text-brand-ink">
          MARQUEE
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-brand-ink/60 hover:text-brand-ink transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 pb-24">
        <div className="mt-6 mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
            Dashboard
          </span>
          <h1 className="font-canela text-4xl md:text-5xl text-brand-ink leading-tight mt-2 tracking-[-0.01em]">
            Your Marquee
          </h1>
          <p className="text-brand-ink/70 mt-3">
            Manage your profile, change your theme, or share your link.
          </p>
        </div>

        {/* Profile link */}
        <div className="bg-white rounded-2xl p-6 mb-4 border border-brand-stone">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-3">
            Your profile link
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-canela text-xl md:text-2xl text-brand-ink flex-1 min-w-0">
              marquee.bio/{username}
            </span>
            <button
              onClick={copyLink}
              className="px-5 py-2.5 rounded-full bg-brand-ink text-white text-sm font-medium hover:bg-brand-ink/90 transition-colors"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link
              href={`/${username}`}
              className="px-5 py-2.5 rounded-full border border-brand-ink text-brand-ink text-sm font-medium hover:bg-brand-ink hover:text-white transition-colors"
            >
              View profile
            </Link>
          </div>
        </div>

        {/* Inbox */}
        <div className="bg-white rounded-2xl p-6 mb-4 border border-brand-stone">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
              Inbox{contacts.length > 0 ? ` · ${contacts.length}` : ""}
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-lavender text-brand-ink px-2.5 py-1 rounded-full border border-brand-lavender">
                {unreadCount} new
              </span>
            )}
          </div>
          {contacts.length === 0 ? (
            <p className="text-sm text-brand-ink/60">
              No messages yet. When someone reaches out through your Marquee, you&apos;ll
              see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => {
                const isUnread = !c.read_at;
                const isExpanded = expandedContact === c.id;
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl transition-colors border ${
                      isUnread
                        ? "border-brand-lavender bg-brand-lavender/15"
                        : "border-brand-stone"
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(c.id, isUnread)}
                      className="w-full text-left p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-brand-ink shrink-0" />
                          )}
                          <span className="font-semibold text-brand-ink truncate">
                            {c.sender_name}
                          </span>
                          {c.sender_company && (
                            <span className="text-xs text-brand-ink/60 truncate">
                              · {c.sender_company}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider font-semibold bg-brand-green text-brand-ink px-2 py-0.5 rounded-full shrink-0">
                            {INTENT_LABELS[c.intent] || c.intent}
                          </span>
                        </div>
                        <p className="text-sm text-brand-ink/70 truncate">{c.message}</p>
                      </div>
                      <span className="text-xs text-brand-ink/50 shrink-0">
                        {new Date(c.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-brand-stone/70 pt-3 space-y-3">
                        <p className="text-sm whitespace-pre-wrap text-brand-ink">
                          {c.message}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <a
                            href={`mailto:${c.sender_email}?subject=Re: your Marquee message`}
                            className="px-4 py-2 rounded-full bg-brand-ink text-white text-xs font-medium hover:bg-brand-ink/90 transition-colors"
                          >
                            Reply via email
                          </a>
                          <button
                            onClick={() => archiveContact(c.id)}
                            className="px-4 py-2 rounded-full border border-brand-stone text-brand-ink/70 text-xs font-medium hover:border-brand-ink hover:text-brand-ink transition-colors"
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
        <div className="bg-white rounded-2xl p-6 mb-4 border border-brand-stone">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-4">
            Profile theme
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => handleThemeChange(t.key)}
                className={`p-4 rounded-xl text-center transition-all ${t.preview} ${
                  profile.theme === t.key
                    ? `ring-2 ring-offset-2 ${t.ring}`
                    : "hover:ring-1 hover:ring-brand-stone"
                }`}
              >
                <span className={`text-xs font-medium ${t.key === "dark" ? "text-white" : "text-brand-ink"}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-2xl p-6 mb-4 border border-brand-stone">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-ink/60 mb-4">
            Profile details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-ink/60">Name</span>
              <span className="text-brand-ink font-medium">{profile.name as string}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-ink/60 shrink-0">Headline</span>
              <span className="text-right text-brand-ink truncate">
                {profile.ai_headline as string}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-ink/60">Generated</span>
              <span className="text-brand-ink">
                {new Date(profile.generated_at as string).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/${username}`}
            className="bg-white rounded-2xl p-5 border border-brand-stone hover:border-brand-ink transition-colors text-center font-medium text-brand-ink"
          >
            Edit your profile →
          </Link>
          <Link
            href="/onboard/elviis"
            className="bg-white rounded-2xl p-5 border border-brand-stone hover:border-brand-ink transition-colors text-center font-medium text-brand-ink/70 hover:text-brand-ink"
          >
            Retake questionnaire
          </Link>
        </div>
      </main>
    </div>
  );
}
