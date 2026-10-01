"use client";
// marquee.bio/<name>/full — always the full profile, on any screen.
import { ProfileLoader } from "../ProfileLoader";

export default function FullProfilePage() {
  return <ProfileLoader mode="full" />;
}
