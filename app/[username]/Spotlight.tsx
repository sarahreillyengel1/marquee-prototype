"use client";
// Spotlight — the short, phone-first version of a profile (the link people put in an
// Instagram or TikTok bio). The person chooses which buttons show and in what order;
// everything else comes from the profile. Colours follow the profile's look.

import type { CSSProperties } from "react";
import type { Profile, SpotlightLink } from "@/lib/profile-types";
import { Icon, photoStyle, socialIcon } from "./ProfileView";
import "./profile-design.css";

const TYPE_ICON: Record<string, string> = { Contact: "handshake", Hire: "handshake", Partner: "handshake", Book: "calendar", Read: "news", Listen: "play-circle", Watch: "play-circle", Learn: "book", Explore: "compass", Shop: "bag", Buy: "bag", Invest: "rocket", Follow: "users", Join: "users", Attend: "calendar", Sponsor: "star", Apply: "send", Donate: "heart" };

/** Buttons to show when the person hasn't set any up: their CTAs, then Work with me and the shop. */
export function defaultSpotlightLinks(p: Profile): SpotlightLink[] {
  const out: SpotlightLink[] = (p.actions || []).map((a) => ({
    icon: TYPE_ICON[a.type] || "link", title: a.label, sub: a.type,
    dest: a.internal ? a.destination : a.destination === "contact" ? "contact" : "link",
    url: !a.internal && a.destination !== "contact" ? a.destination : undefined,
  }));
  const has = (d: string) => out.some((l) => l.dest === d);
  if (p.engagements.some((e) => e.visible) && !has("contact") && !has("work-with-me")) out.push({ icon: "grid", title: "Work with me", dest: "work-with-me" });
  if ((p.store || []).length && !has("shop")) out.push({ icon: "bag", title: "Shop my store", dest: "shop" });
  return out;
}

export function Spotlight({ profile, preview }: { profile: Profile; preview?: boolean }) {
  const sp = profile.spotlight;
  const links = sp?.links?.length ? sp.links : defaultSpotlightLinks(profile);
  const full = `/${profile.slug}/full`;
  const hrefOf = (l: SpotlightLink) => l.dest === "link" ? l.url || "#" : l.dest === "contact" || l.dest === "work-with-me" ? `${full}#work-with-me` : l.dest === "bio" ? `${full}#experience` : l.dest === "profile" ? full : `${full}#${l.dest}`;
  const stop = preview ? (e: React.MouseEvent) => e.preventDefault() : undefined;
  const socials = sp?.socials === false ? [] : profile.socials.filter((x) => x.visible && x.url);
  const pages: [string, string, string][] = [["user", "Profile", full]];
  if (profile.roles.length) pages.push(["briefcase", "Experience", `${full}#experience`]);
  if (profile.media.length) pages.push(["play-circle", "Media", `${full}#media`]);
  if ((profile.store || []).length) pages.push(["bag", "Shop", `${full}#shop`]);
  if (profile.engagements.some((e) => e.visible)) pages.push(["grid", "Services", `${full}#work-with-me`]);
  return (
    <div className="mq-root spot" data-look={profile.look || undefined} style={preview ? { minHeight: 0 } : undefined}>
      <div className="spot-in">
        {profile.photoUrl
          ? <div className="spot-ph"><img src={profile.photoUrl} alt={profile.name} style={photoStyle(profile.photoPos, profile.photoZoom)} /></div>
          : <div className="spot-ph spot-ini" aria-hidden>{profile.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")}</div>}
        <h1 className="spot-name">{profile.name}</h1>
        {profile.headline && <div className="spot-title">{profile.headline}</div>}
        {sp?.location !== false && profile.location && <div className="spot-loc"><Icon name="pin" style={{ width: 14, height: 14 }} /> {profile.location}</div>}
        {socials.length > 0 && <div className="spot-soc">{socials.map((x) => <a key={x.kind} href={x.url} target="_blank" rel="noopener" aria-label={x.kind} onClick={stop}><Icon name={socialIcon[x.kind]} /></a>)}</div>}

        <div className="spot-links">
          {links.map((l, i) => (
            <a key={i} className={"spot-link" + (l.highlight ? " hi" : "")} href={hrefOf(l)} target={l.dest === "link" ? "_blank" : undefined} rel={l.dest === "link" ? "noopener" : undefined} onClick={stop}>
              <span className="spot-ic"><Icon name={l.icon || "link"} /></span>
              <span className="spot-tx"><span className="t">{l.title}</span>{l.sub && <span className="s">{l.sub}</span>}</span>
              <Icon name="arrow-up-right" style={{ width: 16, height: 16, flex: "0 0 16px" } as CSSProperties} />
            </a>
          ))}
        </div>

        {sp?.pages !== false && pages.length > 1 && (
          <div className="spot-pages" style={{ "--n": pages.length } as CSSProperties}>
            {pages.map(([ic, label, href]) => <a key={label} href={href} onClick={stop}><Icon name={ic} /><span>{label}</span></a>)}
          </div>
        )}
        <a className="spot-full" href={full} onClick={stop}>See full profile →</a>
        <a className="spot-brand" href="https://marquee.bio" onClick={stop}>MARQUEE.BIO<span>claim yours</span></a>
      </div>
    </div>
  );
}
