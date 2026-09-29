"use client";

// ─────────────────────────────────────────────────────────────
// Ported profile UI (owner + public views, all pages, Work-with modal).
// Kept as close as possible to the finished design source
// (marquee-app/src/App.tsx): same JSX, same className strings, same structure.
//
// Differences from the source, per the port brief:
//  - `useStore()` is backed by a LOCAL context fed by the `profile` prop and
//    local page/view state (no external store, no seed data).
//  - The owner Edit drawer + photo/logo upload wiring are dropped (later tasks);
//    the buttons remain but no-op.
//  - The Work-with modal is kept; its submit is a local no-op stub.
//  - The whole thing is wrapped in <div className="mq-root"> and the scoped
//    profile-design.css is imported here.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import "./profile-design.css";
import { ARCHETYPE_DESC } from "@/lib/archetypes";
import { DEMO_PROFILES } from "@/lib/demo-profiles";
import { BookingPicker, RequestForm, useSlots } from "./Booking";
import type { Profile, ProfileLook, Engagement, MediaItem, ProjectCase, Role } from "@/lib/profile-types";

/* ─────────────── icons (ported from marquee-app/src/icons.tsx) ─────────────── */
const P: Record<string, string> = {
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  star: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/>',
  "trending-up": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  zap: '<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>',
  bolt: '<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>',
  "badge-check": '<path d="M12 2.5l2.3 1.7 2.9-.1.9 2.7 2.3 1.7-.9 2.7.9 2.7-2.3 1.7-.9 2.7-2.9-.1L12 21.5l-2.3-1.7-2.9.1-.9-2.7-2.3-1.7.9-2.7-.9-2.7 2.3-1.7.9-2.7 2.9.1z"/><path d="M8.6 12.2l2.3 2.3 4.5-4.6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  "play-circle": '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  cap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.7l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx="1"/><rect x="12" y="8" width="3" height="10" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
  "panel-left": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  book: '<path d="M12 7v14"/><path d="M3 5h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v13h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3z"/>',
  building: '<path d="M4 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M14 22V12h4a2 2 0 0 1 2 2v8"/><path d="M8 8h.01M8 12h.01M8 16h.01"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  handshake: '<path d="M11 17l2.5 2.5a1.4 1.4 0 0 0 2-2"/><path d="M13.5 15l3 3a1.4 1.4 0 0 0 2-2l-4-4a2 2 0 0 0-2.8 0l-1.4 1.4a1.4 1.4 0 0 1-2 0l-.6-.6a1.4 1.4 0 0 1 0-2L13 8"/><path d="M18 12l3-3M6 12l-3-3M4 5l4 1 3 3"/>',
  sprout: '<path d="M7 20h10M12 20v-8"/><path d="M12 12a5 5 0 0 0-5-5H5v1a5 5 0 0 0 5 5h2"/><path d="M12 12a5 5 0 0 1 5-5h2v1a5 5 0 0 1-5 5h-2"/>',
  flag: '<path d="M4 21V4h13l-2 4 2 4H4"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/>',
  dollar: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  trophy: '<path d="M6 9a6 6 0 0 0 12 0V4H6z"/><path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3M9 21h6M12 15v6"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  "arrow-up-right": '<path d="M7 17L17 7"/><path d="M8 7h9v9"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
  "chevron-down": '<path d="M6 9l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8 7l1.5-2h5L16 7"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 6.6v.02M11.5 17v-4.1a2.2 2.2 0 0 1 4.4 0V17"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M17 7v.02"/>',
  xlogo: '<path d="M5 5l14 14M19 5L5 19"/>',
  tiktok: '<path d="M15 4v9.2a3.8 3.8 0 1 1-3.4-3.8"/><path d="M15 6.5a5 5 0 0 0 4 3.2"/>',
  pin: '<path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  "chevron-right": '<path d="M9 6l6 6-6 6"/>',
  globe2: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
};

function Icon({ name, className = "ic", fill = false, style }: { name: string; className?: string; fill?: boolean; style?: CSSProperties }) {
  return (
    <svg className={className + (fill ? " fill" : "")} viewBox="0 0 24 24" style={style}
      dangerouslySetInnerHTML={{ __html: P[name] || "" }} />
  );
}

const socialIcon: Record<string, string> = {
  linkedin: "linkedin", instagram: "instagram", x: "xlogo", tiktok: "tiktok", website: "globe2",
};

/* ─────────────── local store (replaces marquee-app/src/store.tsx) ─────────────── */
type ViewMode = "owner" | "public";
type PageKey = "profile" | "experience" | "work-with-me" | "media" | "shop" | "portfolio" | "project";

interface Store {
  profile: Profile;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  page: PageKey;
  goto: (p: PageKey, projectId?: string) => void;
  projectId: string | null;
  editing: boolean;
  setEditing: (b: boolean) => void;
  /** The Experience section a visitor asked for (e.g. "bio"), so it opens expanded. */
  section: string | null;
  setSection: (s: string | null) => void;
}
const StoreCtx = createContext<Store | null>(null);
const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
};

/* ─────────────── Company tiles: default green; a real uploaded logo overrides ─────────────── */
function LogoTile({ cls, letter, logoUrl }: { cls: string; letter: string; logoUrl?: string }) {
  if (logoUrl) return (
    <div className={cls + " lt-logo"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt="" />
    </div>
  );
  return <div className={cls + " lt-mono"}>{(letter || "").trim().charAt(0).toUpperCase()}</div>;
}

/* ─────────────── modal plumbing ─────────────── */
type ModalContent = { node: ReactNode; size?: string } | null;
const ModalCtx = createContext<(c: ModalContent) => void>(() => {});
const useModal = () => useContext(ModalCtx);

/* ─────────────── toast + copy-link ─────────────── */
const ToastCtx = createContext<(msg: string) => void>(() => {});
const useToast = () => useContext(ToastCtx);
function useCopyLink() {
  const toast = useToast();
  const { profile } = useStore();
  // Always the profile's real slug — never derive from the first name (that pointed at a demo).
  const slug = profile.slug || (profile.name.split(" ")[0] || "").toLowerCase();
  return () => {
    const url = `https://marquee.bio/${slug}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast(`Link copied · marquee.bio/${slug}`)).catch(() => toast(`marquee.bio/${slug}`));
    } else {
      toast(`marquee.bio/${slug}`);
    }
  };
}

function Modal({ content, onClose }: { content: ModalContent; onClose: () => void }) {
  if (!content) return null;
  return (
    <div className="ov on" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"mdl" + (content.size ? " " + content.size : "")}>{content.node}</div>
    </div>
  );
}
function ModalHead({ icon, title, sub, onClose }: { icon: string; title: string; sub?: string; onClose: () => void }) {
  return (
    <div className="mh">
      <div className="mi2"><Icon name={icon} /></div>
      <div><div className="mt2">{title}</div>{sub && <div className="ms2">{sub}</div>}</div>
      <button className="mx" onClick={onClose}><Icon name="x" /></button>
    </div>
  );
}

// Profiles published before the fix can carry a doubled "$$" when the rate was typed with its own $.
const money = (p: string) => (p || "").replace(/^\${2,}/, "$");

/* ─────────────── engagement flow ─────────────── */
// One offer's pop-up. "Book" offers show the person's real open times; if they have none
// open (or haven't set hours), it becomes a request form. Never placeholder times.
function EngageFlow({ e, name, back }: { e: Engagement; name: string; back?: () => void }) {
  const setModal = useModal();
  const { profile } = useStore();
  const wantsBooking = e.flow === "book";
  const slots = useSlots(profile.slug, e.title, wantsBooking);
  const close = () => setModal(null);
  const bookable = wantsBooking && !!slots?.open;
  return (
    <>
      <ModalHead icon={e.icon} title={e.title} sub={e.rateDisplay === "show" ? money(e.price) : "Request"} onClose={close} />
      {back && <button className="ww-back" onClick={back}><Icon name="arrow-left" /> All ways to work</button>}
      {e.blurb && <p className="lead">{e.blurb}</p>}
      <Topics e={e} />
      {wantsBooking && !slots ? <p className="lead">Checking open times…</p>
        : bookable ? <BookingPicker username={profile.slug} offer={e.title} ownerFirst={name} slots={slots!} onClose={close} />
        : wantsBooking && profile.calLink ? (
          <>
            <p className="lead">Pick a time that works. You&apos;ll book straight on {name}&apos;s calendar.</p>
            <a className="msub" href={profile.calLink} target="_blank" rel="noopener" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Book a time →</a>
          </>
        ) : <RequestForm username={profile.slug} offer={e.title} ownerFirst={name} cta={e.flow === "availability" ? "Check availability" : "Send request"} onClose={close} />}
    </>
  );
}

// Opens one offer's request / booking form.
function useEngage() {
  const setModal = useModal();
  const { profile } = useStore();
  const first = profile.name.split(" ")[0] || profile.name;
  return (e: Engagement) => setModal({ node: <EngageFlow e={e} name={first} /> });
}

function useWorkWith() {
  const setModal = useModal();
  const { profile, goto } = useStore();
  const first = profile.name.split(" ")[0] || profile.name;
  const engagements = profile.engagements.filter((e) => e.visible);
  const openFlow = (e: Engagement) => setModal({ node: <EngageFlow e={e} name={first} back={openGrid} /> });
  const openGrid = () => setModal({
    size: "big",
    node: (
      <>
        <ModalHead icon="calendar" title={`Work with ${first}`} sub="Choose how you’d like to work together" onClose={() => setModal(null)} />
        <div className="ww-grid">
          {engagements.map((e) => (
            <div key={e.key} className="ww-card" onClick={() => openFlow(e)}>
              <div className="ww-top"><div className="ww-ic"><Icon name={e.icon} /></div><div className="ww-name">{e.title}</div>
                <span className="ww-price">{e.rateDisplay === "show" ? money(e.price) : "Contact"}</span></div>
              <div className="ww-desc">{e.blurb}</div>
            </div>
          ))}
        </div>
      </>
    ),
  });
  const openBeta = () => setModal({
    node: (
      <>
        <ModalHead icon="message" title={`Get in touch with ${first}`} sub="Marquee is in early beta" onClose={() => setModal(null)} />
        <p className="lead" style={{ marginBottom: 18 }}>Email {first} directly — this opens your mail app, pre-addressed to her.</p>
        <a
          className="msub"
          style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          href={`mailto:${profile.inquiryEmail}?subject=${encodeURIComponent("Inquiry via your Marquee profile")}`}
          onClick={() => setTimeout(() => setModal(null), 400)}
        >
          Email {first}
        </a>
      </>
    ),
  });
  if (profile.beta && profile.inquiryEmail) return openBeta;
  return profile.singlePage ? openGrid : () => goto("work-with-me");
}

/* ─────────────── chrome ─────────────── */
function OwnerTopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { profile, setEditing } = useStore();
  const toast = useToast();
  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <header className="topbar owner-only">
      <div className="topbar-in">
        <div className="hamb" style={{ cursor: "pointer" }} onClick={onToggleSidebar} title="Collapse menu"><Icon name="panel-left" /></div>
        <div className="brand">MARQUEE</div>
        <div className="search" style={{ cursor: "pointer" }} onClick={() => toast("Search is coming soon")}><Icon name="search" style={{ width: 15, height: 15 }} /> Search people, companies, skills… <span className="kbd">⌘K</span></div>
        <div className="top-r">
          <button className="btn pur" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => { window.location.href = "/build-preview"; }}>Edit profile</button>
          <span className="ibtn" style={{ cursor: "pointer" }} onClick={() => toast("You’re all caught up — no new notifications")}><Icon name="bell" /><span className="bdg" /></span>
          <span className="ibtn" style={{ cursor: "pointer" }} onClick={() => toast("No new messages")}><Icon name="message" /></span>
          <div className="tava" style={{ cursor: "pointer" }} onClick={() => toast("Account settings coming soon")}><div className="a">{initials}</div><Icon name="chevron-down" style={{ width: 15, height: 15, color: "var(--gray)" }} /></div>
        </div>
      </div>
    </header>
  );
}
function PublicBar() {
  const { goto, profile } = useStore();
  const openWorkWith = useWorkWith();
  const copyLink = useCopyLink();
  const tabs: [string, PageKey, boolean][] = [["Profile", "profile", true], ["Experience", "experience", true], ["Media", "media", profile.media.length > 0], ["Shop", "shop", (profile.store || []).length > 0], ["Work with Me", "work-with-me", profile.engagements.some((e) => e.visible)]];
  const anchors = profile.singlePage ? [] : tabs.filter((t) => t[2]);
  return (
    <header className="pubbar public-only">
      <div className="pubbar-in">
        <div className="brand">MARQUEE</div>
        <nav className="anchors">{anchors.map(([l, p]) => <a key={p} style={{ cursor: "pointer" }} onClick={() => goto(p)}>{l}</a>)}</nav>
        <button className="pub-share" onClick={copyLink}><Icon name="link" style={{ width: 14, height: 14 }} /> Share</button>
        <button className="pub-cta" onClick={openWorkWith}>Work with {profile.name.split(" ")[0] || profile.name}</button>
      </div>
    </header>
  );
}
function Sidebar() {
  const { goto, setEditing, profile } = useStore();
  const toast = useToast();
  const copyLink = useCopyLink();
  const openWorkWith = useWorkWith();
  const items: [string, string, PageKey | null][] = [
    ["user", "My Profile", "profile"], ["briefcase", "Experience", "experience"], ["star", "Featured Experience", "experience"],
    ["trending-up", "Impact", "experience"], ["zap", "Superpowers", "experience"], ["compass", "Leadership", "experience"],
    ["heart", "Values", "experience"], ["grid", "Skills", "experience"], ["play-circle", "Media", "media"],
    ["cap", "Education", "experience"], ["file", "Bio", "experience"],
  ];
  const checks = [!!profile.photoUrl, !!profile.bioShort, profile.bioLong.length > 0, profile.roles.length > 0, profile.skills.length > 0, profile.media.length > 0, profile.education.length > 0, profile.values.length > 0, profile.leadership.length > 0, profile.testimonial != null, profile.tags.length > 0, profile.engagements.some((e) => e.visible)];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const CIRC = 201;
  const offset = Math.round(CIRC * (1 - pct / 100));
  return (
    <aside className="side owner-only">
      <div className="nav-item active" onClick={() => goto("profile")}><Icon name="user" />My Profile</div>
      <div className="nav-lbl">Profile</div>
      {items.slice(1).map(([ic, label, p]) => (
        <div key={label} className="nav-item" style={{ cursor: "pointer" }} onClick={() => p && goto(p)}><Icon name={ic} />{label}</div>
      ))}
      <div className="nav-lbl">Settings</div>
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => { window.location.href = "/build-preview"; }}><Icon name="settings" />Profile settings</div>
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => toast("Privacy controls coming soon")}><Icon name="lock" />Privacy</div>
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => toast("Analytics coming soon")}><Icon name="chart" />Analytics</div>
      <div className="strength">
        <div className="ring">
          <svg width="76" height="76"><circle cx="38" cy="38" r="32" fill="none" stroke="#E9E6DF" strokeWidth="7" /><circle cx="38" cy="38" r="32" fill="none" stroke="#2E2C28" strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset} transform="rotate(-90 38 38)" /></svg>
          <div className="num">{pct}%</div>
        </div>
        <p>{pct >= 100 ? "Your profile looks complete. Keep it fresh." : "Fill in more sections to strengthen your profile."}</p>
        <span className="improve" style={{ cursor: "pointer" }} onClick={() => { window.location.href = "/build-preview"; }}>Improve profile <Icon name="arrow-right" style={{ width: 14, height: 14 }} /></span>
      </div>
      <button className="sbtn primary" onClick={openWorkWith}><Icon name="calendar" style={{ width: 15, height: 15 }} /> Work with {profile.name.split(" ")[0] || profile.name}</button>
      <button className="sbtn ghost" onClick={copyLink}><Icon name="link" style={{ width: 15, height: 15 }} /> Share my profile</button>
    </aside>
  );
}

/* ─────────────── shared blocks ─────────────── */
// Open the Experience page at one of its sections (skills, values, superpowers…).
function useGotoSection() {
  const { goto, setSection } = useStore();
  return (id: string) => {
    setSection(id);
    goto("experience");
    setTimeout(() => document.getElementById("x-" + id)?.scrollIntoView({ block: "start" }), 80);
  };
}

function BlockHead({ title, sub, link, onLink }: { title: string; sub?: string; link?: string; onLink?: () => void }) {
  return (
    <div className="bhead">
      <span className="btitle">{title}</span>{sub && <span className="bsub">{sub}</span>}
      {link && <span className="blink" onClick={onLink}>{link} <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>}
    </div>
  );
}
const SKILL_LEVEL: Record<number, [string, number]> = { 25: ["Foundational", 1], 55: ["Proficient", 2], 80: ["Advanced", 3], 100: ["Expert", 4] };

function Skills({ featured, limit = 8 }: { featured?: boolean; limit?: number } = {}) {
  const { profile } = useStore();
  const all = profile.skills;
  if (all.length === 0) return null;
  const starred = all.filter((s) => s.featured);
  const rest = all.filter((s) => !s.featured).sort((a, b) => b.score - a.score);
  const list = featured ? [...starred, ...rest].slice(0, limit) : all;
  // Builder profiles store one of four levels. Older demo profiles store free-form weights.
  const levels = all.every((s) => s.score in SKILL_LEVEL);
  const max = Math.max(...all.map((s) => s.score));
  return <div className="skfull">{list.map((s) => (
    <div key={s.name} className="skl"><div className="sklt"><b>{s.name}</b><span>{levels ? SKILL_LEVEL[s.score][0] : s.score}</span></div>
      {levels
        ? <div className="sklseg" role="img" aria-label={`${SKILL_LEVEL[s.score][0]}, level ${SKILL_LEVEL[s.score][1]} of 4`}>{[1, 2, 3, 4].map((n) => <i key={n} className={n <= SKILL_LEVEL[s.score][1] ? "on" : ""} />)}</div>
        : <div className="sklbar"><div className="sklf" style={{ width: `${Math.round((s.score / max) * 100)}%` }} /></div>}
    </div>
  ))}</div>;
}

/* ─────────────── pages ─────────────── */
// The header: text on the left, one card on the right (photo · Open to · Work with),
// and the "Previous" brand row along the bottom. The Actions row is NOT part of it.
// Shared with the builder's photo framer so what you drag is what the header shows.
const photoStyle = (pos?: { x: number; y: number }, zoom?: number): CSSProperties => {
  const at = `${pos?.x ?? 50}% ${pos?.y ?? 25}%`;
  return { objectPosition: at, transformOrigin: at, transform: zoom && zoom > 1 ? `scale(${zoom})` : undefined };
};
const nameSize = (n: string) => (n.length <= 12 ? 56 : n.length <= 22 ? 48 : 40);
const focusSize = (f: string) => (f.length <= 80 ? 24 : f.length <= 120 ? 21 : 19);

function Hero() {
  const { profile } = useStore();
  const first = profile.name.split(" ")[0] || profile.name;
  const openWorkWith = useWorkWith();
  const [showAllTags, setShowAllTags] = useState(false);
  // Founding Member is confirmed by the server from the person's membership, never from the profile itself
  // (showcase profiles are written in code, not by a member, so theirs is set there)
  const showcase = !!DEMO_PROFILES[profile.slug];
  const [founding, setFounding] = useState(showcase && !!profile.foundingMember);
  useEffect(() => {
    if (showcase) return;
    let live = true;
    fetch(`/api/member-badges?username=${encodeURIComponent(profile.slug)}`).then((r) => r.json()).then((j) => { if (live) setFounding(!!j.founding); }).catch(() => {});
    return () => { live = false; };
  }, [profile.slug, showcase]);
  const gotoSection = useGotoSection();
  const openTo = profile.openTo.filter((o) => o.visible).slice(0, 3);
  const rate = (key: string) => {
    const e = profile.engagements.find((x) => x.key === key);
    const o = profile.openTo.find((x) => x.key === key);
    if (!o) return "";
    return e && e.rateDisplay === "contact" ? "Request" : o.note;
  };
  const focusLabel = profile.focusLabel ?? "Currently";
  const previous = (profile.previous || []).slice(0, 8);
  const socials = profile.socials.filter((x) => x.visible);
  return (
    <section className="card hd">
      <div className="hd-grid">
        <div className="hd-l">
          <div className="hd-top">
          {(profile.verified || founding) && (
            <div className="hd-badges">
              {profile.verified && <span className="hd-ver"><Icon name="check" /> Verified</span>}
              {founding && <span className="hd-fm"><Icon name="star" /> Founding Member</span>}
            </div>
          )}
          {profile.available && profile.availableLabel && <div className="avail"><span className="d" />{profile.availableLabel}</div>}
          <h1 className="hd-name" style={{ "--name-size": `${nameSize(profile.name)}px` } as CSSProperties}>{profile.name}</h1>
          {profile.headline && <div className="hd-title">{profile.headline}</div>}
          {profile.bioShort && <p className="hd-facts">{profile.bioShort}</p>}
          {profile.tagline && (
            <>
              {focusLabel && <div className="hd-lbl">{focusLabel}</div>}
              <p className="hd-focus" style={{ "--focus-size": `${focusSize(profile.tagline)}px` } as CSSProperties}>{profile.tagline}</p>
            </>
          )}
          {profile.tags.length > 0 && (
            <>
              <div className="hd-lbl">Known for</div>
              <div className="hd-chips">
                {(showAllTags ? profile.tags : profile.tags.slice(0, 4)).map((t, i) => <span key={t} className={"hd-chip c" + ((i % 4) + 1)}>{t}</span>)}
                {profile.tags.length > 4 && <button type="button" className="hd-chip more" onClick={() => setShowAllTags((v) => !v)}>{showAllTags ? "Show fewer" : `+${profile.tags.length - 4} more`}</button>}
                {!profile.singlePage && profile.skills.length > 0 && <button type="button" className="hd-all" onClick={() => gotoSection("skills")}>See all skills <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></button>}
              </div>
            </>
          )}
          </div>
          <div className="hd-foot">
            {!profile.singlePage && profile.bioLong.length > 0 ? <button type="button" className="hd-btn" onClick={() => gotoSection("bio")}><Icon name="book" style={{ width: 16, height: 16 }} /> Read full bio</button> : <span />}
            <div className="hd-fr">
              {profile.location && <div className="hd-loc"><Icon name="pin" style={{ width: 15, height: 15 }} />{profile.location}</div>}
              {socials.length > 0 && (
                <div className="hd-soc">
                  {socials.map((x) => <a key={x.kind} href={x.url} target="_blank" rel="noopener" aria-label={x.kind}><Icon name={socialIcon[x.kind]} /></a>)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="hd-card">
          <div className="hd-ph">
            {profile.photoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={profile.photoUrl} alt={profile.name} referrerPolicy="no-referrer" style={photoStyle(profile.photoPos, profile.photoZoom)} />
              : <div className="photo-empty"><div className="pe-ic"><Icon name="camera" /></div><div className="pe-t">Add your photo</div></div>}
          </div>
          <div className="hd-ot">
            {openTo.length > 0 && <h4>Open to</h4>}
            {openTo.map((o) => {
              const e = profile.engagements.find((x) => x.key === o.key);
              return (
                <button type="button" key={o.key} className="hd-row" onClick={openWorkWith}>
                  <span className="hd-tile"><Icon name={e ? e.icon : "calendar"} /></span>
                  <span><span className="t">{o.label}</span>{rate(o.key) && <span className="n">{rate(o.key)}</span>}</span>
                  <span className="chev"><Icon name="chevron-right" /></span>
                </button>
              );
            })}
            <button type="button" className="hd-bar" onClick={openWorkWith}><span>Work with {first}</span><Icon name="arrow-right" /></button>
          </div>
        </div>
      </div>
      {previous.length > 0 && (
        <div className="hd-prev">
          <span className="k">Previous</span>
          {previous.map((b) => <span key={b} className="b">{b}</span>)}
        </div>
      )}
    </section>
  );
}

// The 4 owner-curated CTAs — a row directly below the hero, on every profile.
function Actions() {
  const { profile, goto } = useStore();
  const openWorkWith = useWorkWith();
  const acts = (profile.actions || []).slice(0, 4);
  if (!acts.length) return null;
  return (
    <section className="actions4 smt" style={{ "--n": acts.length } as CSSProperties}>
      {acts.map((a, i) => {
        const inner = (
          <>
            <span className="act-type">{a.type}</span>
            <span className="act-label">{a.label}</span>
            <span className="act-arw"><Icon name="arrow-up-right" style={{ width: 15, height: 15 }} /></span>
          </>
        );
        return a.destination === "contact"
          ? <div key={i} className="actcard" style={{ cursor: "pointer" }} onClick={openWorkWith}>{inner}</div>
          : a.internal
          ? <div key={i} className="actcard" onClick={() => goto(a.destination as PageKey)}>{inner}</div>
          : <a key={i} className="actcard" href={a.destination} target="_blank" rel="noopener">{inner}</a>;
      })}
    </section>
  );
}

// Featured Media — up to 3 large tiles directly below the Actions row.
function HeroMedia() {
  const { profile, goto } = useStore();
  const feat = profile.media.slice(0, 3);
  if (!feat.length) return null;
  if (profile.enabledSections && !profile.enabledSections.includes("media")) return null;
  return (
    <section className="smt">
      <BlockHead title="Featured Media" />
      <div className="stats3 heromedia" style={{ marginTop: 14 }}>
        {feat.map((m) => {
          const inner = (
            <>
              <div className="hm-shade" />
              <span className="hm-type">{m.type}</span>
              {m.play && <span className="hm-play">▶</span>}
              <div className="hm-meta">
                <div className="hm-title">{m.title}</div>
                {(m.source || m.sub) && <div className="hm-src">{m.source || m.sub} <Icon name="arrow-up-right" style={{ width: 12, height: 12 }} /></div>}
              </div>
            </>
          );
          const style: CSSProperties = m.image ? { backgroundImage: `url(${m.image})` } : { background: m.bg };
          return m.internal
            ? <div key={m.id} className="hmcard" style={style} onClick={() => goto(m.internal as PageKey)}>{inner}</div>
            : <a key={m.id} className="hmcard" style={style} href={m.url} target="_blank" rel="noopener">{inner}</a>;
        })}
      </div>
    </section>
  );
}

const starFirst = <T extends { featured?: boolean }>(xs: T[]) => [...xs].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
const parseFollowers = (s: string) => { const m = (s || "").trim().replace(/,/g, "").match(/([\d.]+)\s*([KkMm]?)/); if (!m) return 0; const mult = m[2].toLowerCase() === "m" ? 1e6 : m[2].toLowerCase() === "k" ? 1e3 : 1; return parseFloat(m[1]) * mult; };
const fmtFollowers = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : String(Math.round(n)));

// "Affirm" — signed-in people affirm a superpower; their faces show in the pill.
type Affirmer = { name: string; photoUrl?: string; slug?: string };
type AffirmData = { powers: Record<string, { count: number; people: Affirmer[] }>; mine: string[]; signedIn: boolean; isOwner: boolean; hasProfile: boolean };
const affirmCache = new Map<string, Promise<AffirmData>>();
const loadAffirm = (slug: string) => {
  if (!affirmCache.has(slug)) {
    affirmCache.set(slug, fetch(`/api/affirm?username=${encodeURIComponent(slug)}`).then((r) => r.json())
      .catch(() => ({ powers: {}, mine: [], signedIn: false, isOwner: false, hasProfile: false })));
  }
  return affirmCache.get(slug)!;
};
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Affirm({ slug, superpower }: { slug: string; superpower: string }) {
  const [count, setCount] = useState(0);
  const [people, setPeople] = useState<Affirmer[]>([]);
  const [mine, setMine] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    let live = true;
    loadAffirm(slug).then((j) => {
      if (!live) return;
      setCount(j.powers?.[superpower]?.count ?? 0); setPeople(j.powers?.[superpower]?.people ?? []);
      setMine((j.mine || []).includes(superpower)); setSignedIn(!!j.signedIn); setIsOwner(!!j.isOwner); setHasProfile(!!j.hasProfile);
    });
    return () => { live = false; };
  }, [slug, superpower]);
  const affirm = async () => {
    if (mine || busy) return;
    // Affirming is for Marquee members: a face and a name stand behind every affirmation.
    if (!signedIn) { window.location.href = `/signup?next=${encodeURIComponent(window.location.pathname)}`; return; }
    if (!hasProfile) { window.location.href = "/build-preview"; return; }
    setBusy(true);
    try {
      const r = await fetch("/api/affirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: slug, superpower }) });
      const j = await r.json();
      if (r.ok) { setMine(true); setCount(j.count ?? count + 1); setPeople(j.people ?? people); affirmCache.delete(slug); }
      else toast(j.error || "Couldn't save that just now.");
    } finally { setBusy(false); }
  };
  return (
    <div className="aff">
      {count > 0 && (
        <span className="aff-pill">
          <Icon name="badge-check" />
          <span className="aff-t">Affirmed by {count}</span>
          <span className="aff-faces">
            {people.map((p, i) => {
              const face = p.photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" />
                : p.name ? <span className="aff-in">{initials(p.name)}</span> : <Icon name="user" />;
              return p.slug
                ? <a key={i} className="aff-face" href={`/${p.slug}`} title={p.name}>{face}</a>
                : <span key={i} className="aff-face" title={p.name || "Marquee member"}>{face}</span>;
            })}
          </span>
        </span>
      )}
      {!isOwner && !mine && <button type="button" className="aff-btn" onClick={affirm} disabled={busy}>{!signedIn ? "Join to affirm" : hasProfile ? "Affirm" : "Publish your profile to affirm"}</button>}
      {mine && <span className="aff-done"><Icon name="check" /> You affirmed this</span>}
    </div>
  );
}

function ProfilePage() {
  const { profile, goto } = useStore();
  const gotoSection = useGotoSection();
  const s = profile.sections;
  const has = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;
  // a section shows only if the owner has it on (or hasn't customized) AND it has content
  const on = (k: string) => !profile.enabledSections || profile.enabledSections.includes(k);
  // Home shows featured picks. Timeline, Impact and Leadership live on the depth pages,
  // except on one-page profiles, which have no depth pages.
  const showLead = !!profile.singlePage && on("leadership") && has(profile.leadership);
  const showVals = on("values") && has(profile.values);
  const showSkills = on("skills") && has(profile.skills);
  return (
    <div className="page on">
      <Hero />
      <Actions />

      {on("activeProjects") && s.activeProjects && has(profile.activeProjects) && (
        <section className="smt">
          <BlockHead title="Active Projects" />
          <div className="pgrid">
            {profile.activeProjects.map((p) => (
              <a key={p.id} className="card proj" href={p.url} target="_blank" rel="noopener">
                <div className="ptop"><LogoTile cls="plogo" letter={p.logoLetter} logoUrl={p.logoUrl} /><div><div className="pname">{p.name}</div><div className="prole">{p.role}</div></div></div>
                <p>{p.blurb}</p><span className="plink">Visit site <Icon name="arrow-up-right" style={{ width: 13, height: 13 }} /></span>
              </a>
            ))}
          </div>
        </section>
      )}

      {on("experience") && has(profile.roles) && (
      <section className={profile.singlePage ? "ewrap smt" : "smt"}>
        {profile.singlePage && (
        <div className="card timeline">
          <BlockHead title="Experience" sub="Timeline" />
          {profile.roles.map((r, i) => <TimelineRow key={r.id} r={r} last={i === profile.roles.length - 1} />)}
          <span className="blink" style={{ marginLeft: 0, marginTop: 8 }} onClick={() => goto("experience")}>View full timeline <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>
        </div>
        )}
        <div className="card feat">
          <BlockHead title="Featured Experience" link={profile.singlePage ? undefined : "Full timeline"} onLink={() => goto("experience")} />
          <div className="fgrid">
            {starFirst(profile.roles).slice(0, 3).map((r) => (
              <div key={r.id} className="fc" onClick={() => goto("experience")}>
                <div className="fctop"><LogoTile cls="fclogo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="fcco">{r.company.toUpperCase()}</div><div className="fcrole">{r.role}</div></div></div>
                <div className="fbadges">{r.kind === "project" && <span className="fb ser">{r.label || "Project"}</span>}<span className="fb">{r.dates}</span>{r.badge && <span className="fb ser">{r.badge}</span>}</div>
                <p>{r.blurb}</p>
                <div className="fres">{r.metrics?.[0]?.value ? <span className="m"><Icon name="trending-up" />{r.metrics[0].value} <span className="u">{(r.metrics[0].label || "").toLowerCase()}</span></span> : <span />}<span className="go"><Icon name="arrow-up-right" style={{ width: 16, height: 16 }} /></span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {profile.singlePage && on("impact") && s.impact && has(profile.impact) && (
        <section className="smt">
          <BlockHead title="Impact" />
          <div className="card col"><ImpactList items={profile.impact} /></div>
        </section>
      )}

      {(showLead || showVals || showSkills) && (
      <section className="cols3 smt" style={{ "--cols": [showLead, showVals, showSkills].filter(Boolean).length } as CSSProperties}>
        {showLead && (
        <div className="card col">
          <BlockHead title="Leadership" />
          <div style={{ fontSize: 12, color: "var(--gray2)", margin: "0 0 16px" }}>How I lead and build teams</div>
          {profile.leadership.map((l) => (
            <div key={l.title} className="li"><div className="lici"><Icon name={l.icon} /></div><div><div className="lit">{l.title}</div><div className="lid">{l.blurb}</div></div></div>
          ))}
          {profile.leadershipMeta && (profile.leadershipMeta.mbti || profile.leadershipMeta.enneagram || profile.leadershipMeta.yearsLeading || profile.leadershipMeta.largestTeam) && (
            <div className="fbadges" style={{ marginTop: 4 }}>
              {profile.leadershipMeta.mbti && <span className="fb">{profile.leadershipMeta.mbti}</span>}
              {profile.leadershipMeta.enneagram && <span className="fb">Enneagram {profile.leadershipMeta.enneagram}</span>}
              {profile.leadershipMeta.yearsLeading && <span className="fb">{profile.leadershipMeta.yearsLeading} yrs leading</span>}
              {profile.leadershipMeta.largestTeam && <span className="fb">Largest team {profile.leadershipMeta.largestTeam}</span>}
            </div>
          )}
          <span className="blink" style={{ marginLeft: 0 }} onClick={() => gotoSection("leadership")}>View all leadership <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>
        </div>
        )}
        {showSkills && (
        <div className="card col">
          <BlockHead title="Featured Skills" link={profile.singlePage ? undefined : "See all skills"} onLink={() => gotoSection("skills")} />
          <Skills featured />
        </div>
        )}
        {showVals && (
        <div className="card col">
          <BlockHead title="Core Values" link={profile.singlePage ? undefined : "See all values"} onLink={() => gotoSection("values")} />
          <div className="vlist">
          {starFirst(profile.values).slice(0, 6).map((v) => (
            <div key={v.name} className="xtile"><div className="xtile-t">{v.name}</div>{v.blurb && <div className="xtile-d">{v.blurb}</div>}</div>
          ))}
          </div>
        </div>
        )}
      </section>
      )}

      {on("testimonials") && profile.testimonial && (
        <section className="smt">
          <BlockHead title={profile.testimonial.who === profile.name ? "Quote" : "Testimonials"} />
          <div className="card" style={{ padding: "34px 30px 30px", textAlign: "center" }}>
            <div aria-hidden style={{ fontFamily: "var(--font-canela), var(--font-lora), Georgia, serif", fontSize: 48, lineHeight: 0.6, color: "var(--bar)" }}>&ldquo;</div>
            <p style={{ fontFamily: "var(--font-canela), var(--font-lora), Georgia, serif", fontSize: 20, lineHeight: 1.55, color: "var(--ink)", margin: "12px auto 20px", maxWidth: 720 }}>{profile.testimonial.quote}</p>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray2)" }}>{profile.testimonial.who}</div>
          </div>
        </section>
      )}

      {on("superpowers") && has(profile.superpowers) && (
        <section className="smt">
          <BlockHead title="Superpowers" />
          <div className="card col">
            {profile.superpowers.slice(0, 3).map((sp) => <div key={sp.title} className="sp"><div className="sp-ic"><Icon name={sp.icon} /></div><div><div className="sp-t">{sp.title}</div><div className="sp-d">{sp.blurb}</div><Affirm slug={profile.slug} superpower={sp.title} /></div></div>)}
          </div>
        </section>
      )}

      {profile.singlePage && has(profile.bioLong) && (
        <section className="smt">
          <div className="card col">
            <BlockHead title="About" />
            <div className="aboutbio">{profile.bioLong.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
        </section>
      )}

      {profile.singlePage && has(profile.reach) && (() => {
        const total = fmtFollowers((profile.reach || []).reduce((a, p) => a + parseFollowers(p.followers), 0));
        const aud = profile.audience;
        return (
          <section className="smt">
            <BlockHead title="Reach" sub="Audience & platforms" />
            <div className="card reach-card">
              <div className="reach-total"><span className="reach-num">{total}</span><span className="reach-lbl">total followers</span></div>
              <div className="reach-grid">
                {profile.reach!.map((p) => {
                  const inner = <><div className="reach-plat">{p.platform}</div><div className="reach-f">{p.followers}</div>{p.handle && <div className="reach-h">{p.handle}</div>}{p.engagement && <div className="reach-eng">{p.engagement} eng.</div>}</>;
                  return p.url ? <a key={p.platform} className="reach-tile" href={p.url} target="_blank" rel="noopener">{inner}</a> : <div key={p.platform} className="reach-tile">{inner}</div>;
                })}
              </div>
              {aud && (aud.age || aud.gender || aud.geo) && (
                <div className="reach-aud">
                  {aud.age && <div><span className="reach-aud-l">Top age</span><span className="reach-aud-v">{aud.age}</span></div>}
                  {aud.gender && <div><span className="reach-aud-l">Audience</span><span className="reach-aud-v">{aud.gender}</span></div>}
                  {aud.geo && <div><span className="reach-aud-l">Top geos</span><span className="reach-aud-v">{aud.geo}</span></div>}
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {profile.singlePage && has(profile.store) && (
        <section className="smt">
          <BlockHead title="Store" sub="Work you can buy" />
          <div className="store-grid">
            {starFirst(profile.store!).map((p) => {
              const priceLabel = p.price ? (p.price === "0" ? "Free" : `$${p.price}`) : "";
              const inner = (
                <>
                  <div className="store-kind">{p.kind}</div>
                  <div className="store-title">{p.title}</div>
                  {p.blurb && <p className="store-blurb">{p.blurb}</p>}
                  <div className="store-foot"><span className="store-price">{priceLabel}</span>{p.url && <span className="store-go">View <Icon name="arrow-up-right" style={{ width: 13, height: 13 }} /></span>}</div>
                </>
              );
              return p.url
                ? <a key={p.id} className="store-card" href={p.url} target="_blank" rel="noopener">{inner}</a>
                : <div key={p.id} className="store-card">{inner}</div>;
            })}
          </div>
        </section>
      )}

      {on("media") && s.media && has(profile.media) && (
        <section className="smt">
          <BlockHead title="Featured Media" link={profile.singlePage ? undefined : "All media"} onLink={() => goto("media")} />
          <div className="mscroll">
            {starFirst(profile.media).slice(0, 4).map((m, i) => <MediaCard key={m.id} m={m} i={i} onInternal={() => goto("portfolio")} teaser />)}
          </div>
        </section>
      )}

      {profile.singlePage && on("education") && s.education && has(profile.education) && (
        <section className="smt">
          <BlockHead title="Education & Credentials" />
          <div className="edu-grid">
            {profile.education.map((c) => (
              <div key={c.id} className="card edu"><div className="edul">{c.short}</div><div className="edut">{c.title} {c.verified && <span className="vchk" style={{ width: 16, height: 16 }}><Icon name="check" /></span>}</div><div className="edus">{c.sub}</div></div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TimelineRow({ r, last }: { r: Role; last: boolean }) {
  return (
    <div className="tli" style={last ? { paddingBottom: 0 } : undefined}>
      <div className="tld">{r.dates}</div>
      <div className="tlb"><LogoTile cls="tllogo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="tlco">{r.company}</div><div className="tlr">{r.role}</div></div></div>
    </div>
  );
}

function MediaCard({ m, i = 0, onInternal, teaser }: { m: MediaItem; i?: number; onInternal: () => void; teaser?: boolean }) {
  const { profile } = useStore();
  const inner = (
    <>
      <div className="mt">{m.type.toUpperCase()}</div>
      <span className="ext"><Icon name={m.internal ? "arrow-right" : "arrow-up-right"} /></span>
      <div className="mti">{m.title}</div>
      {m.sub && <div className="ms">{m.sub}</div>}
      {!teaser && m.source && <div className="msrc">{m.source}</div>}
      {m.play && <div className="mplay"><Icon name="play" fill /></div>}
    </>
  );
  const own = !!profile.ownMediaColors;
  const style: CSSProperties | undefined = own ? { background: m.bg } : undefined;
  const cls = "mc" + (own ? (m.darkText ? " dk" : "") : ` look m${(i % 3) + 1}`);
  if (m.internal) return <div className={cls} style={style} onClick={onInternal}>{inner}</div>;
  return <a className={cls} style={style} href={m.url} target="_blank" rel="noopener">{inner}</a>;
}

function PageHead({ title, sub, backTo }: { title: string; sub?: string; backTo?: PageKey }) {
  const { goto } = useStore();
  return (
    <div className="pagehead">
      <button className="back" onClick={() => goto(backTo || "profile")}><Icon name="arrow-left" style={{ width: 14, height: 14 }} /> Back to {backTo || "profile"}</button>
      <h2>{title}</h2>{sub && <p>{sub}</p>}
    </div>
  );
}

// Impact is laid out like Superpowers: an icon tile, the result in bold, where it happened underneath.
function ImpactList({ items }: { items: Profile["impact"] }) {
  return (
    <div className="ximp">
      {items.map((im, i) => (
        <div key={i} className="sp">
          <div className="sp-ic"><Icon name="trending-up" /></div>
          <div>
            <div className="sp-t">{im.value ? `${im.value} ${im.label}` : im.label}</div>
            {im.sub && <div className="sp-d">{im.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// One section of the Experience page. Every section shows a first look at its content,
// can show everything ("Show all"), and can be folded away with the arrow.
function XSec({ id, title, total = 0, preview = 0, bare, more, children }: { id: string; title: string; total?: number; preview?: number; bare?: boolean; more?: string; children: (all: boolean) => ReactNode }) {
  const { section } = useStore();
  // a section asked for by name (Read full bio, See all skills…) arrives fully open
  const [all, setAll] = useState(section === id);
  const [folded, setFolded] = useState(false);
  useEffect(() => { if (section === id) { setAll(true); setFolded(false); } }, [section, id]);
  const hasMore = preview > 0 && total > preview;
  return (
    <section id={"x-" + id} className={"xsec" + (bare ? " bare" : " card") + (folded ? " folded" : "")}>
      <div className="xsec-h">
        <h3>{title}</h3>
        <div className="xsec-c">
          {hasMore && !folded && <button type="button" className="xsec-t" aria-expanded={all} onClick={() => setAll((v) => !v)}>{all ? "Show fewer" : (more || `Show all ${total}`)}</button>}
          <button type="button" className="xsec-f" aria-expanded={!folded} aria-label={(folded ? "Open " : "Close ") + title} onClick={() => setFolded((v) => !v)}><Icon name="chevron-down" style={{ width: 16, height: 16, transform: folded ? undefined : "rotate(180deg)" }} /></button>
        </div>
      </div>
      {!folded && children(all)}
    </section>
  );
}

const isDegree = (c: { title: string; sub?: string }) => /university|college|b\.s\.|b\.a\.|m\.s\.|m\.b\.a|ph\.?d/i.test(c.title + " " + (c.sub || ""));
const PLURAL: Record<string, string> = { Client: "Clients", Accelerator: "Accelerators", Program: "Programs", Project: "Projects" };

function ExperiencePage() {
  const { profile } = useStore();
  const meta = profile.leadershipMeta;
  const degrees = profile.education.filter(isDegree);
  const certs = profile.education.filter((c) => !isDegree(c));
  const jobs = profile.roles.filter((r) => r.kind !== "project");
  const projects = profile.roles.filter((r) => r.kind === "project");
  // "Clients & Accelerators", "Projects"… named after what the person actually added
  const kinds = Array.from(new Set(projects.map((p) => PLURAL[p.label || "Project"] || "Projects")));
  const projectsTitle = kinds.length > 1 ? `${kinds.slice(0, -1).join(", ")} & ${kinds[kinds.length - 1]}` : kinds[0] || "Projects";
  const allValues = starFirst(profile.values);
  return (
    <div className="page on">
      <PageHead title="Experience" />
      {profile.bioLong.length > 0 && (
        <XSec id="bio" title="Bio" total={profile.bioLong.length} preview={1} more="Read full bio">
          {(all) => <div className="xbio">{(all ? profile.bioLong : profile.bioLong.slice(0, 1)).map((p, i) => <p key={i}>{p}</p>)}</div>}
        </XSec>
      )}
      {profile.sections.impact && profile.impact.length > 0 && (
        <XSec id="impact" title="Impact" total={profile.impact.length} preview={4}>
          {(all) => <ImpactList items={all ? profile.impact : profile.impact.slice(0, 4)} />}
        </XSec>
      )}
      {profile.activeProjects && profile.activeProjects.length > 0 && (
        <XSec id="current" title="Currently" bare>
          {() => profile.activeProjects.map((p) => (
            <div key={p.id} className="card xrole">
              <div className="xrole-top"><LogoTile cls="xrole-logo" letter={p.logoLetter} logoUrl={p.logoUrl} /><div><div className="xrole-role">{p.role}</div><div className="xrole-co">{p.name}</div></div><div className="xrole-dates">{p.dates || "Present"}</div></div>
              {p.highlights
                ? <ul className="xbul">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
                : p.blurb && <p>{p.blurb}</p>}
            </div>
          ))}
        </XSec>
      )}

      {jobs.length > 0 && (
        <XSec id="roles" title="Roles" bare total={jobs.length} preview={3}>
          {(all) => (all ? jobs : jobs.slice(0, 3)).map((r) => (
            <div key={r.id} className="card xrole">
              <div className="xrole-top"><LogoTile cls="xrole-logo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="xrole-role">{r.role}</div><div className="xrole-co">{r.company}{r.badge ? ` · ${r.badge}` : ""}</div></div><div className="xrole-dates">{r.dates}</div></div>
              {r.highlights
                ? <ul className="xbul">{r.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
                : r.blurb && <p>{r.blurb}</p>}
              {r.metrics && r.metrics.length > 0 && <div className="xmetrics">{r.metrics.map((m, i) => <div key={i} className="xm"><div className="v">{m.value}</div><div className="l">{m.label}</div></div>)}</div>}
              {(r.stage || (r.industries && r.industries.length > 0)) && <div className="xtags">{r.stage && <span className="xtag st">{r.stage}</span>}{(r.industries || []).map((t) => <span key={t} className="xtag">{t}</span>)}</div>}
            </div>
          ))}
        </XSec>
      )}

      {projects.length > 0 && (
        <XSec id="projects" title={projectsTitle} total={projects.length} preview={4}>
          {(all) => (
            <div className="xprojs">
              {(all ? projects : projects.slice(0, 4)).map((r) => (
                <div key={r.id} className="xproj">
                  <div className="xproj-k">{r.label || "Project"}</div>
                  <div className="xproj-top"><LogoTile cls="xrole-logo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="xproj-t">{r.company}</div>{r.role && <div className="xproj-o">{r.role}</div>}</div></div>
                  {r.blurb && <p>{r.blurb}</p>}
                  {r.metrics && r.metrics.length > 0 && r.metrics[0].value && <div className="xproj-r">{r.metrics[0].value}</div>}
                  <div className="xproj-f">{r.dates && <span>{r.dates}</span>}{r.stage && <span>{r.stage}</span>}{(r.industries || []).map((t) => <span key={t}>{t}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </XSec>
      )}

      {profile.skills.length > 0 && (
        <XSec id="skills" title="Skills" total={profile.skills.length} preview={9}>
          {(all) => <Skills featured={!all} limit={9} />}
        </XSec>
      )}

      {profile.superpowers.length > 0 && (
        <XSec id="superpowers" title="Superpowers" total={profile.superpowers.length} preview={3}>
          {(all) => (all ? profile.superpowers : profile.superpowers.slice(0, 3)).map((sp) => <div key={sp.title} className="sp"><div className="sp-ic"><Icon name={sp.icon} /></div><div><div className="sp-t">{sp.title}</div><div className="sp-d">{sp.blurb}</div><Affirm slug={profile.slug} superpower={sp.title} /></div></div>)}
        </XSec>
      )}

      {profile.leadership.length > 0 && (
        <XSec id="leadership" title="Leadership">
          {() => (
            <>
              <div className="xlbl">Leadership archetypes</div>
              <div className="xlead">
                {profile.leadership.map((l) => { const d = ARCHETYPE_DESC[l.title] || l.blurb; return <div key={l.title} className="xtile"><div className="xtile-t">{l.title}</div>{d && <div className="xtile-d">{d}</div>}</div>; })}
              </div>
              {meta && (meta.mbti || meta.enneagram || meta.yearsLeading || meta.largestTeam) && (
                <div className="xfacts">
                  {meta.mbti && <div><span>MBTI</span><b>{meta.mbti}</b></div>}
                  {meta.enneagram && <div><span>Enneagram</span><b>{meta.enneagram}</b></div>}
                  {meta.yearsLeading && <div><span>Years leading</span><b>{meta.yearsLeading}</b></div>}
                  {meta.largestTeam && <div><span>Largest team</span><b>{meta.largestTeam}</b></div>}
                </div>
              )}
              {profile.leadershipBelief && <div className="belief">“{profile.leadershipBelief}”</div>}
            </>
          )}
        </XSec>
      )}

      {profile.values.length > 0 && (
        <XSec id="values" title="Values" total={profile.values.length} preview={6}>
          {(all) => (
            <div className="xvals">
              {(all ? allValues : allValues.slice(0, 6)).map((v) => <div key={v.name} className="xtile"><div className="xtile-t">{v.name}</div>{v.blurb && <div className="xtile-d">{v.blurb}</div>}</div>)}
            </div>
          )}
        </XSec>
      )}

      {profile.education.length > 0 && (
        <XSec id="education" title={certs.length ? "Education & Certifications" : "Education"}>
          {() => (
            <>
              {degrees.length > 0 && (
                <div className="xedu-list">
                  {degrees.map((c) => (
                    <div key={c.id} className="xedu-row"><LogoTile cls="xrole-logo" letter={c.short} /><div><div className="xedu-t">{c.title}</div><div className="xedu-s">{c.sub}</div></div></div>
                  ))}
                </div>
              )}
              {certs.length > 0 && <div className={"xcerts" + (degrees.length ? "" : " first")}><b>Certifications</b>{certs.map((c) => `${c.title}${c.sub && c.sub !== "Certification" ? ` — ${c.sub}` : ""}`).join(" · ")}</div>}
            </>
          )}
        </XSec>
      )}
    </div>
  );
}

const cents = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);

// What an offer covers, in the person's own words. On the offer card it shows the first
// three and opens for the rest; in the booking pop-up it is shown in full.
function Topics({ e, teaser }: { e: Engagement; teaser?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!e.topics?.length) return null;
  const SHOW = 3;
  const folded = !!teaser && !open && e.topics.length > SHOW;
  return (
    <div className="wwp-topics">
      <div className="wwp-tl">{e.topicsLabel || "Topics"}</div>
      <div className="wwp-tags">
        {(folded ? e.topics.slice(0, SHOW) : e.topics).map((t) => <span key={t}>{t}</span>)}
        {teaser && e.topics.length > SHOW && <button type="button" className="wwp-more" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "Show fewer" : `+${e.topics.length - SHOW} more`}</button>}
      </div>
    </div>
  );
}

function OfferCard({ e, onOpen }: { e: Engagement; onOpen: () => void }) {
  const { profile } = useStore();
  const slots = useSlots(profile.slug, e.title, e.flow === "book");
  const bookable = e.flow === "book" && (!!slots?.open || !!profile.calLink);
  const multi = (e.sessions?.length || 0) > 1;
  return (
    <div className="card wwp">
      <div className="wwp-top">
        <div className="ww-ic"><Icon name={e.icon} /></div>
        <div><h3 className="wwp-t">{e.title}</h3><div className="wwp-p">{multi && e.sessions![0].priceCents > 0 ? `From ${cents(e.sessions![0].priceCents)}` : e.rateDisplay === "show" ? money(e.price) : "By request"}</div></div>
      </div>
      {e.blurb && <p className="wwp-d">{e.blurb}</p>}
      {multi && <div className="wwp-len">{e.sessions!.map((x) => <span key={x.minutes}><b>{x.minutes} min</b>{x.priceCents > 0 ? ` ${cents(x.priceCents)}` : ""}</span>)}</div>}
      <Topics e={e} teaser />
      <button type="button" className="wwp-btn" onClick={onOpen}>{bookable ? "Book a time" : "Send request"} <Icon name="arrow-right" style={{ width: 15, height: 15 }} /></button>
    </div>
  );
}

// Work with Me — the person's offers, each with its own request or booking button.
function WorkWithPage() {
  const { profile } = useStore();
  const engage = useEngage();
  const offers = profile.engagements.filter((e) => e.visible);
  const total = fmtFollowers((profile.reach || []).reduce((a, p) => a + parseFollowers(p.followers), 0));
  const aud = profile.audience;
  return (
    <div className="page on">
      <PageHead title="Work with Me" />
      {offers.length > 0 && (
        <div className="wwp-grid">
          {offers.map((e) => <OfferCard key={e.key + e.title} e={e} onOpen={() => engage(e)} />)}
        </div>
      )}
      {profile.reach && profile.reach.length > 0 && (
        <section className="smt">
          <BlockHead title="Reach" sub="Audience & platforms" />
          <div className="card reach-card">
            <div className="reach-total"><span className="reach-num">{total}</span><span className="reach-lbl">total followers</span></div>
            <div className="reach-grid">
              {profile.reach.map((p) => {
                const inner = <><div className="reach-plat">{p.platform}</div><div className="reach-f">{p.followers}</div>{p.handle && <div className="reach-h">{p.handle}</div>}{p.engagement && <div className="reach-eng">{p.engagement} eng.</div>}</>;
                return p.url ? <a key={p.platform} className="reach-tile" href={p.url} target="_blank" rel="noopener">{inner}</a> : <div key={p.platform} className="reach-tile">{inner}</div>;
              })}
            </div>
            {aud && (aud.age || aud.gender || aud.geo) && (
              <div className="reach-aud">
                {aud.age && <div><span className="reach-aud-l">Top age</span><span className="reach-aud-v">{aud.age}</span></div>}
                {aud.gender && <div><span className="reach-aud-l">Audience</span><span className="reach-aud-v">{aud.gender}</span></div>}
                {aud.geo && <div><span className="reach-aud-l">Top geos</span><span className="reach-aud-v">{aud.geo}</span></div>}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function MediaPage() {
  const { profile, goto } = useStore();
  const types = ["All", "Project", "Podcast", "Newsletter", "Press", "Speaking", "Board", "Portfolio"];
  const [f, setF] = useState("All");
  const items = profile.media.filter((m) => f === "All" || m.type === f);
  return (
    <div className="page on">
      <PageHead title="Media" />
      <div className="mtabs">{types.map((t) => <div key={t} className={"mtab" + (t === f ? " on" : "")} onClick={() => setF(t)}>{t}</div>)}</div>
      <div className="mgrid">{items.map((m, i) => <MediaCard key={m.id} m={m} i={i} onInternal={() => goto("portfolio")} />)}</div>
    </div>
  );
}

function PortfolioPage() {
  const { profile, goto } = useStore();
  return (
    <div className="page on">
      <PageHead title="Portfolio" sub="Selected work — the launches, repositions, and systems behind the results. Open any one for the full story." backTo="media" />
      <div className="pfolio-grid">
        {profile.portfolio.map((c) => (
          <div key={c.id} className="pf" onClick={() => goto("project", c.id)}>
            <div className="img" style={{ background: c.image }}><div className="t">{c.title}</div></div>
            <div className="meta"><span className="ty">{c.type}</span><span className="m"><Icon name="trending-up" />{c.metrics[0]?.value} <span className="u">{c.metrics[0]?.label.toLowerCase()}</span></span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectPage() {
  const { profile, projectId, goto } = useStore();
  const c: ProjectCase | undefined = profile.portfolio.find((p) => p.id === projectId);
  const openWorkWith = useWorkWith();
  if (!c) return <div className="page on"><PageHead title="Project" backTo="portfolio" /></div>;
  return (
    <div className="page on">
      <div className="pagehead" style={{ marginBottom: 14 }}>
        <button className="back" onClick={() => goto("portfolio")}><Icon name="arrow-left" style={{ width: 14, height: 14 }} /> Back to portfolio</button>
      </div>
      <div className="proj-hero" style={{ background: c.image }}><div className="ph-in"><div className="ph-ty">{c.type}</div><div className="ph-t">{c.title}</div><div className="ph-s">{c.subtitle}</div></div></div>
      <div className="proj-body">
        <div className="proj-narr">
          {c.body.map((p, i) => <p key={i}>{p}</p>)}
          <div className="proj-gallery"><div className="g" style={{ background: c.image }} /><div className="g" style={{ background: c.image2 }} /></div>
        </div>
        <div className="proj-side">
          <div className="card" style={{ padding: 20, marginBottom: 14 }}>
            <div className="sec-label" style={{ marginTop: 0 }}>Results</div>
            {c.metrics.map((m, i) => <div key={i} className="mrow2"><span>{m.label}</span><span className="v">{m.value}</span></div>)}
          </div>
          <button className="msub" onClick={openWorkWith}>Work with {profile.name.split(" ")[0] || profile.name}</button>
        </div>
      </div>
    </div>
  );
}

// Shop — things the person sells. Each item links out to where it is sold.
function ShopPage() {
  const { profile } = useStore();
  const items = starFirst(profile.store || []);
  return (
    <div className="page on">
      <PageHead title="Shop" />
      <div className="store-grid">
        {items.map((p) => {
          const priceLabel = p.price ? (p.price === "0" ? "Free" : `$${p.price.replace(/^\$+/, "")}`) : "";
          const inner = (
            <>
              <div className="store-kind">{p.kind}</div>
              <div className="store-title">{p.title}</div>
              {p.blurb && <p className="store-blurb">{p.blurb}</p>}
              <div className="store-foot"><span className="store-price">{priceLabel}</span>{p.url && <span className="store-go">View <Icon name="arrow-up-right" style={{ width: 13, height: 13 }} /></span>}</div>
            </>
          );
          return p.url
            ? <a key={p.id} className="store-card" href={p.url} target="_blank" rel="noopener">{inner}</a>
            : <div key={p.id} className="store-card">{inner}</div>;
        })}
      </div>
    </div>
  );
}

/* ─────────────── public footer (visitor conversion) ─────────────── */
function PublicFooter() {
  // A profile is the member's surface — Marquee's presence is one discreet link out, nothing more.
  return (
    <footer className="pubfoot public-only">
      <a className="made" href="https://marquee.bio" target="_blank" rel="noopener">MARQUEE.BIO<span className="made-sub">claim yours</span></a>
    </footer>
  );
}

const LINKABLE: PageKey[] = ["profile", "experience", "media", "shop", "work-with-me"];

/* ─────────────── entry point ─────────────── */
export function ProfileView({ profile, view: initialView }: { profile: Profile; view: ViewMode }) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [page, setPage] = useState<PageKey>("profile");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<ModalContent>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setView(initialView); }, [initialView]);
  // open on the page named in the link (#experience, #media, #shop, #work-with-me)
  useEffect(() => {
    const open = () => {
      const h = window.location.hash.replace("#", "") as PageKey;
      if (LINKABLE.includes(h) && !profile.singlePage) setPage(h);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [profile.singlePage]);

  // Colour look. `?look=classic|warm|mono|bold` previews a look without publishing.
  const [lookPreview, setLookPreview] = useState<ProfileLook | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("look");
    if (q === "classic" || q === "warm" || q === "mono" || q === "bold") setLookPreview(q);
  }, []);
  const look: ProfileLook = lookPreview ?? profile.look ?? "warm";

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  const [section, setSection] = useState<string | null>(null);
  const goto = (p: PageKey, id?: string) => {
    setProjectId(id ?? null);
    // Older saved actions can still point at pages that have since moved onto Experience.
    const old = p as string;
    if (old === "bio") setSection("bio");
    const next = (old === "how-i-work" || old === "bio" ? "experience" : p) as PageKey;
    setPage(next);
    // each page has its own link, e.g. marquee.bio/name#experience
    if (typeof window !== "undefined" && LINKABLE.includes(next)) window.history.replaceState(null, "", next === "profile" ? window.location.pathname + window.location.search : `#${next}`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModal(null); setEditing(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const store: Store = { profile, view, setView, page, goto, projectId, editing, setEditing, section, setSection };

  const pages: Record<PageKey, ReactNode> = {
    profile: <ProfilePage />, experience: <ExperiencePage />, "work-with-me": <WorkWithPage />,
    media: <MediaPage />, shop: <ShopPage />, portfolio: <PortfolioPage />, project: <ProjectPage />,
  };

  return (
    <div className="mq-root" data-look={look}>
      <StoreCtx.Provider value={store}>
        <ModalCtx.Provider value={setModal}>
          <ToastCtx.Provider value={showToast}>
            <div className={"view-" + view}>
              {profile.beta && (
                <div style={{ background: "#73926A", color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: 13, fontWeight: 600 }}>
                  <span style={{ letterSpacing: ".16em", fontWeight: 800 }}>BETA</span> · an early Marquee profile ·{" "}
                  <a href="https://marquee.bio" target="_blank" rel="noopener" style={{ color: "#fff", textDecoration: "underline", fontWeight: 700 }}>Sign up for beta →</a>
                </div>
              )}
              {/* Owner-only: preview toggle. Public visitors never see this — their view is fixed by auth. */}
              {initialView === "owner" && (
                <div className="vswitch">
                  <span className="vlabel">VIEWING AS</span>
                  <button className={view === "owner" ? "on" : ""} onClick={() => setView("owner")}><Icon name="user" /> Owner</button>
                  <button className={view === "public" ? "on" : ""} onClick={() => setView("public")}><Icon name="globe" /> Public</button>
                </div>
              )}
              <OwnerTopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
              <PublicBar />
              <div className={"shell" + (collapsed ? " collapsed" : "")}>
                <Sidebar />
                <main className="main">{pages[page]}</main>
              </div>
              <PublicFooter />
              <Modal content={modal} onClose={() => setModal(null)} />
              <div className={"toast" + (toast ? " on" : "")}>{toast}</div>
            </div>
          </ToastCtx.Provider>
        </ModalCtx.Provider>
      </StoreCtx.Provider>
    </div>
  );
}
