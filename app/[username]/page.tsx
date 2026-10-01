"use client";
// marquee.bio/<name> — the full profile, or the short Spotlight page on phones when the person chose that.
import { ProfileLoader } from "./ProfileLoader";

export default function ProfilePage() {
  return <ProfileLoader mode="auto" />;
}
