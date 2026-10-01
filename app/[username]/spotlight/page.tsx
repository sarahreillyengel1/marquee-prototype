"use client";
// marquee.bio/<name>/spotlight — older address for marquee.bio/<name>/links; kept so shared links keep working.
import { ProfileLoader } from "../ProfileLoader";

export default function SpotlightPage() {
  return <ProfileLoader mode="spotlight" />;
}
