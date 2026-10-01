"use client";
// marquee.bio/<name>/links — always the short, phone-first page (the link for a social bio).
import { ProfileLoader } from "../ProfileLoader";

export default function LinksPage() {
  return <ProfileLoader mode="spotlight" />;
}
