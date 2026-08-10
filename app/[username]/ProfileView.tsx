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
import type { Profile, Engagement, MediaItem, ProjectCase, Role } from "@/lib/profile-types";

/* ─────────────── icons (ported from marquee-app/src/icons.tsx) ─────────────── */
const P: Record<string, string> = {
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  star: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/>',
  "trending-up": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  zap: '<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>',
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
type PageKey = "profile" | "experience" | "how-i-work" | "media" | "portfolio" | "project" | "bio";

interface Store {
  profile: Profile;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  page: PageKey;
  goto: (p: PageKey, projectId?: string) => void;
  projectId: string | null;
  editing: boolean;
  setEditing: (b: boolean) => void;
}
const StoreCtx = createContext<Store | null>(null);
const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
};

/* ─────────────── Company tiles: default green; a real uploaded logo overrides ─────────────── */
const TILE_DEFAULT: [string, string] = ["#C9E9B8", "#254B18"]; // soft green / deep green letters
function tileStyle(_letter?: string): CSSProperties {
  const [background, color] = TILE_DEFAULT;
  return { background, color };
}
function LogoTile({ cls, letter, logoUrl }: { cls: string; letter: string; logoUrl?: string }) {
  if (logoUrl) return (
    <div className={cls} style={{ padding: 0, overflow: "hidden", background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return <div className={cls} style={tileStyle(letter)}>{letter}</div>;
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
  const slug = (profile.name.split(" ")[0] || "").toLowerCase();
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

/* ─────────────── engagement flow ─────────────── */
const SLOTS = [["Thu Jul 17", "10:00"], ["Thu Jul 17", "2:30"], ["Fri Jul 18", "11:00"], ["Mon Jul 21", "9:30"], ["Mon Jul 21", "4:00"], ["Tue Jul 22", "1:00"]];

function EngageFlow({ e, name, back }: { e: Engagement; name: string; back?: () => void }) {
  const setModal = useModal();
  const [slot, setSlot] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  if (done) return (
    <div className="done2"><div className="ic2"><Icon name="check" /></div>
      <div className="t">{e.flow === "book" ? "Session requested" : "Message sent"}</div>
      <div className="p">{e.flow === "book"
        ? `${name} will confirm your session shortly — check your inbox for the invite.`
        : `This goes straight to ${name}. You’ll hear back within a couple of business days.`}</div>
      <button className="msub" style={{ marginTop: 22 }} onClick={() => setModal(null)}>Done</button>
    </div>
  );
  return (
    <>
      <ModalHead icon={e.icon} title={e.title} sub={e.rateDisplay === "show" ? e.price : "Contact for rate"} onClose={() => setModal(null)} />
      {back && <button className="ww-back" onClick={back}><Icon name="arrow-left" /> All ways to work</button>}
      <p className="lead">{e.blurb}</p>
      {e.flow === "book" ? (
        <>
          <span className="flbl">Choose a time (ET)</span>
          <div className="slots">
            {SLOTS.map((s, i) => (
              <div key={i} className={"slot" + (slot === i ? " sel" : "")} onClick={() => setSlot(i)}>
                <div className="d">{s[0]}</div><div className="t">{s[1]}</div>
              </div>
            ))}
          </div>
          <span className="flbl">What do you want to cover?</span>
          <textarea className="fta" placeholder="e.g. Our self-serve funnel stalls at activation." />
          <button className="msub" onClick={() => setDone(true)}>
            {e.rateDisplay === "show" ? `Confirm & pay ${e.price.replace("/ hr", "").trim()}` : "Request session"}
          </button>
        </>
      ) : (
        <>
          <span className="flbl">Your name</span><input className="fin" placeholder="Full name" />
          <span className="flbl">Email</span><input className="fin" placeholder="you@company.com" />
          <span className="flbl">A little context</span>
          <textarea className="fta" placeholder="Company, stage, and what you need…" />
          <button className="msub" onClick={() => setDone(true)}>
            {e.flow === "proposal" ? "Send request" : e.flow === "availability" ? "Check availability" : "Send message"}
          </button>
        </>
      )}
    </>
  );
}

function useWorkWith() {
  const setModal = useModal();
  const { profile } = useStore();
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
                <span className="ww-price">{e.rateDisplay === "show" ? e.price : "Contact"}</span></div>
              <div className="ww-desc">{e.blurb}</div>
            </div>
          ))}
        </div>
      </>
    ),
  });
  return openGrid;
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
        <div className="brand">MARQUEE <span className="spk"><Icon name="sparkle" /></span></div>
        <div className="search" style={{ cursor: "pointer" }} onClick={() => toast("Search is coming soon")}><Icon name="search" style={{ width: 15, height: 15 }} /> Search people, companies, skills… <span className="kbd">⌘K</span></div>
        <div className="top-r">
          <button className="btn pur" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => setEditing(true)}>Edit profile</button>
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
  const anchors: [string, PageKey][] = [["Profile", "profile"], ["Experience", "experience"], ["How I Work", "how-i-work"], ["Media", "media"]];
  return (
    <header className="pubbar public-only">
      <div className="pubbar-in">
        <div className="brand">MARQUEE <span className="spk"><Icon name="sparkle" /></span></div>
        <nav className="anchors">{anchors.map(([l, p]) => <a key={p} style={{ cursor: "pointer" }} onClick={() => goto(p)}>{l}</a>)}</nav>
        <button className="pub-share" onClick={copyLink}><Icon name="link" style={{ width: 14, height: 14 }} /> Share</button>
        <button className="pub-cta" onClick={openWorkWith}>Work with {profile.name.split(" ")[0] || profile.name} <Icon name="arrow-right" style={{ width: 14, height: 14 }} /></button>
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
    ["trending-up", "Impact", "experience"], ["zap", "Superpowers", "how-i-work"], ["compass", "Leadership", "how-i-work"],
    ["heart", "Values", "how-i-work"], ["grid", "Skills", "how-i-work"], ["play-circle", "Media", "media"],
    ["cap", "Education", "experience"], ["file", "Bio", "bio"],
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
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => setEditing(true)}><Icon name="settings" />Profile settings</div>
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => toast("Privacy controls coming soon")}><Icon name="lock" />Privacy</div>
      <div className="nav-item" style={{ cursor: "pointer" }} onClick={() => toast("Analytics coming soon")}><Icon name="chart" />Analytics</div>
      <div className="strength">
        <div className="ring">
          <svg width="76" height="76"><circle cx="38" cy="38" r="32" fill="none" stroke="#E9E6DF" strokeWidth="7" /><circle cx="38" cy="38" r="32" fill="none" stroke="#2E2C28" strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset} transform="rotate(-90 38 38)" /></svg>
          <div className="num">{pct}%</div>
        </div>
        <p>{pct >= 100 ? "Your profile looks complete. Keep it fresh." : "Fill in more sections to strengthen your profile."}</p>
        <span className="improve" style={{ cursor: "pointer" }} onClick={() => setEditing(true)}>Improve profile <Icon name="arrow-right" style={{ width: 14, height: 14 }} /></span>
      </div>
      <button className="sbtn primary" onClick={openWorkWith}><Icon name="calendar" style={{ width: 15, height: 15 }} /> Work with {profile.name.split(" ")[0] || profile.name}</button>
      <div className="sbtn soft" style={{ cursor: "pointer" }} onClick={() => toast("Recruiters can now reach you through your profile")}><span className="lead"><Icon name="send" style={{ width: 15, height: 15, color: "var(--pur)" }} /> Recruiter outreach</span><span className="sub">I&apos;m open to opportunities</span></div>
      <button className="sbtn ghost" onClick={copyLink}><Icon name="link" style={{ width: 15, height: 15 }} /> Share my profile</button>
    </aside>
  );
}

/* ─────────────── shared blocks ─────────────── */
function BlockHead({ title, sub, link, onLink }: { title: string; sub?: string; link?: string; onLink?: () => void }) {
  return (
    <div className="bhead">
      <span className="btitle">{title}</span>{sub && <span className="bsub">{sub}</span>}
      {link && <span className="blink" onClick={onLink}>{link} <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>}
    </div>
  );
}
function Skills() {
  const { profile } = useStore();
  if (profile.skills.length === 0) return null;
  const max = Math.max(...profile.skills.map((s) => s.score));
  return <div className="skfull">{profile.skills.map((s) => (
    <div key={s.name} className="skl"><div className="sklt"><b>{s.name}</b><span>{s.score}</span></div>
      <div className="sklbar"><div className="sklf" style={{ width: `${Math.round((s.score / max) * 100)}%` }} /></div></div>
  ))}</div>;
}

/* ─────────────── pages ─────────────── */
function Hero() {
  const { profile, goto } = useStore();
  const first = profile.name.split(" ")[0] || profile.name;
  const [n1, ...rest] = profile.name.split(" ");
  const openWorkWith = useWorkWith();
  const [showAllTags, setShowAllTags] = useState(false);
  const openTo = profile.openTo.filter((o) => o.visible);
  const rate = (key: string) => {
    const e = profile.engagements.find((x) => x.key === key);
    const o = profile.openTo.find((x) => x.key === key);
    if (!o) return "";
    return e && e.rateDisplay === "contact" ? "Contact for rate" : o.note;
  };
  return (
    <section className="card hero">
      <div className="hero-l">
        <h1 className="name">{n1}<br />{rest.join(" ")}</h1>
        <div className="role">{profile.headline}</div>
        <p className="bio">{profile.bioShort}</p>
        <div className="tags">
          {(showAllTags ? profile.tags : profile.tags.slice(0, 4)).map((t) => <span key={t} className="tag">{t}</span>)}
          {!showAllTags && profile.tags.length > 4 && <span className="tag more" style={{ cursor: "pointer" }} onClick={() => setShowAllTags(true)}>+{profile.tags.length - 4} more</span>}
        </div>
        <div className="hero-acts">
          <button className="btn line" onClick={() => goto("bio")}><Icon name="book" style={{ width: 15, height: 15 }} /> Read full bio</button>
          <button className="btn pur" onClick={openWorkWith}>Work with {first} <Icon name="chevron-down" style={{ width: 15, height: 15 }} /></button>
        </div>
        <div className="socials">
          {profile.socials.filter((s) => s.visible).map((s) => (
            <a key={s.kind} className="soc" href={s.url} target="_blank" rel="noopener"><Icon name={socialIcon[s.kind]} /></a>
          ))}
        </div>
      </div>
      <div className="hero-mid">
        <div className="hero-photo">
          {profile.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.photoUrl} alt={profile.name} referrerPolicy="no-referrer" />
            : <div className="photo-empty"><div className="pe-ic"><Icon name="camera" /></div><div className="pe-t">Add your photo</div></div>}
        </div>
        <div className="photo-cap">
          {profile.available && <div className="pc-avail"><span className="d" /> {profile.availableLabel}</div>}
          {profile.verified && <span className="vpill"><Icon name="check" /> Verified</span>}
        </div>
      </div>
      <div className="opento">
        <h4>Open to</h4>
        {openTo.map((o) => {
          const e = profile.engagements.find((x) => x.key === o.key);
          return (
            <div key={o.key} className="otr" onClick={openWorkWith}>
              <div className="oti"><Icon name={e ? e.icon : "calendar"} /></div>
              <div><div className="ott">{o.label}</div><div className="ots">{rate(o.key)}</div></div>
            </div>
          );
        })}
        <span className="otv" onClick={openWorkWith}>Work with {first} <Icon name="arrow-right" style={{ width: 14, height: 14 }} /></span>
      </div>
    </section>
  );
}

// The 4 owner-curated CTAs — a row directly below the hero, on every profile.
function Actions() {
  const { profile, goto } = useStore();
  const acts = (profile.actions || []).slice(0, 4);
  if (!acts.length) return null;
  return (
    <section className="actions4 smt">
      {acts.map((a, i) => {
        const inner = (
          <>
            <span className="act-type">{a.type}</span>
            <span className="act-label">{a.label}</span>
            <span className="act-arw"><Icon name="arrow-up-right" style={{ width: 15, height: 15 }} /></span>
          </>
        );
        return a.internal
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

function ProfilePage() {
  const { profile, goto } = useStore();
  const s = profile.sections;
  const has = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;
  // a section shows only if the owner has it on (or hasn't customized) AND it has content
  const on = (k: string) => !profile.enabledSections || profile.enabledSections.includes(k);
  return (
    <div className="page on">
      <Hero />
      <Actions />
      <HeroMedia />

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
      <section className="ewrap smt">
        <div className="card timeline">
          <BlockHead title="Experience" sub="Timeline" />
          {profile.roles.map((r, i) => <TimelineRow key={r.id} r={r} last={i === profile.roles.length - 1} />)}
          <span className="blink" style={{ marginLeft: 0, marginTop: 8 }} onClick={() => goto("experience")}>View full timeline <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>
        </div>
        <div className="card feat">
          <BlockHead title="Featured Experience" sub="My top 3 experiences" />
          <div className="fgrid">
            {profile.roles.slice(0, 3).map((r) => (
              <div key={r.id} className="fc" onClick={() => goto("experience")}>
                <div className="fctop"><LogoTile cls="fclogo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="fcco">{r.company.toUpperCase()}</div><div className="fcrole">{r.role}</div></div></div>
                <div className="fbadges"><span className="fb">{r.dates}</span>{r.badge && <span className="fb ser">{r.badge}</span>}</div>
                <p>{r.blurb}</p>
                <div className="fres"><span className="m"><Icon name="trending-up" />{r.metrics?.[0]?.value} <span className="u">{r.metrics?.[0]?.label.toLowerCase()}</span></span><span className="go"><Icon name="arrow-up-right" style={{ width: 16, height: 16 }} /></span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {on("impact") && s.impact && has(profile.impact) && (
        <section className="impact smt">
          <BlockHead title="Impact" link="View all impact stories" onLink={() => goto("experience")} />
          <div className="igrid">
            {profile.impact.map((im, i) => (
              <div key={i} className="imp"><div className="impi"><Icon name={["trending-up", "dollar", "trophy", "users"][i % 4]} /></div>
                <div><div className="impv">{im.value}</div><div className="impl">{im.label}</div><div className="imps">{im.sub}</div></div></div>
            ))}
          </div>
        </section>
      )}

      {((on("leadership") && has(profile.leadership)) || (on("values") && has(profile.values)) || (on("skills") && has(profile.skills))) && (
      <section className="cols3 smt">
        {on("leadership") && has(profile.leadership) && (
        <div className="card col">
          <BlockHead title="Leadership" />
          <div style={{ fontSize: 12, color: "var(--gray2)", margin: "0 0 16px" }}>How I lead and build teams</div>
          {profile.leadership.map((l) => (
            <div key={l.title} className="li"><div className="lici"><Icon name={l.icon} /></div><div><div className="lit">{l.title}</div><div className="lid">{l.blurb}</div></div></div>
          ))}
          <span className="blink" style={{ marginLeft: 0 }} onClick={() => goto("how-i-work")}>View all leadership <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>
        </div>
        )}
        {on("values") && has(profile.values) && (
        <div className="card col">
          <BlockHead title="Values" />
          <div style={{ fontSize: 12, color: "var(--gray2)", margin: "0 0 16px" }}>Principles that guide my work</div>
          {profile.values.slice(0, 4).map((v) => (
            <div key={v.name} className="li"><div className="vici" style={{ background: v.color }}><Icon name={v.icon} style={{ width: 16, height: 16 }} /></div><div><div className="lit">{v.name}</div><div className="lid">{v.blurb}</div></div></div>
          ))}
          <span className="blink" style={{ marginLeft: 0 }} onClick={() => goto("how-i-work")}>View all values <Icon name="arrow-right" style={{ width: 13, height: 13 }} /></span>
        </div>
        )}
        {on("skills") && has(profile.skills) && (
        <div className="card col">
          <BlockHead title="Skills" link="View all" onLink={() => goto("how-i-work")} />
          <div style={{ fontSize: 12, color: "var(--gray2)", margin: "0 0 16px" }}>What I bring to the table</div>
          <Skills />
        </div>
        )}
      </section>
      )}

      {on("media") && s.media && has(profile.media) && (
        <section className="smt">
          <BlockHead title="Media" link="View all media" onLink={() => goto("media")} />
          <div className="mscroll" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(184px,1fr))", gridAutoRows: "222px", gap: 14, overflow: "hidden", maxHeight: 222 }}>
            {profile.media.map((m) => <MediaCard key={m.id} m={m} onInternal={() => goto("portfolio")} teaser />)}
          </div>
        </section>
      )}

      {on("testimonials") && profile.testimonial && (
        <section className="smt">
          <BlockHead title="Testimonials" />
          <div className="card" style={{ padding: 22 }}>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink)", margin: "2px 0 12px", maxWidth: 720 }}>&ldquo;{profile.testimonial.quote}&rdquo;</p>
            <div style={{ fontSize: 13, color: "var(--gray)" }}>{profile.testimonial.who}</div>
          </div>
        </section>
      )}

      {on("education") && s.education && has(profile.education) && (
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

function MediaCard({ m, onInternal, teaser }: { m: MediaItem; onInternal: () => void; teaser?: boolean }) {
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
  const style: CSSProperties = { background: m.bg };
  if (m.internal) return <div className={"mc" + (m.darkText ? " dk" : "")} style={style} onClick={onInternal}>{inner}</div>;
  return <a className={"mc" + (m.darkText ? " dk" : "")} style={style} href={m.url} target="_blank" rel="noopener">{inner}</a>;
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

function ExperiencePage() {
  const { profile } = useStore();
  return (
    <div className="page on">
      <PageHead title="Experience" sub="The full arc — every role, what I owned, and the results that came out of it." />
      {profile.sections.impact && (
        <div className="impact smt" style={{ marginTop: 0, marginBottom: 18 }}>
          <BlockHead title="Impact at a glance" />
          <div className="igrid">
            {profile.impact.map((im, i) => (
              <div key={i} className="imp"><div className="impi"><Icon name={["trending-up", "dollar", "trophy", "users"][i % 4]} /></div>
                <div><div className="impv">{im.value}</div><div className="impl">{im.label}</div><div className="imps">{im.sub}</div></div></div>
            ))}
          </div>
        </div>
      )}
      {profile.activeProjects && profile.activeProjects.length > 0 && (
        <>
          <div className="xgroup-h">Currently</div>
          {profile.activeProjects.map((p) => (
            <div key={p.id} className="card xrole">
              <div className="xrole-top"><LogoTile cls="xrole-logo" letter={p.logoLetter} logoUrl={p.logoUrl} /><div><div className="xrole-role">{p.role}</div><div className="xrole-co">{p.name}</div></div><div className="xrole-dates">{p.dates || "Present"}</div></div>
              {p.highlights
                ? <ul className="xbul">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
                : p.blurb && <p>{p.blurb}</p>}
            </div>
          ))}
        </>
      )}

      <div className="xgroup-h gap">Experience</div>
      {profile.roles.map((r) => (
        <div key={r.id} className="card xrole">
          <div className="xrole-top"><LogoTile cls="xrole-logo" letter={r.logoLetter} logoUrl={r.logoUrl} /><div><div className="xrole-role">{r.role}</div><div className="xrole-co">{r.company}{r.badge ? ` · ${r.badge}` : ""}</div></div><div className="xrole-dates">{r.dates}</div></div>
          {r.highlights
            ? <ul className="xbul">{r.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
            : r.blurb && <p>{r.blurb}</p>}
          {r.metrics && r.metrics.length > 0 && <div className="xmetrics">{r.metrics.map((m, i) => <div key={i} className="xm"><div className="v">{m.value}</div><div className="l">{m.label}</div></div>)}</div>}
        </div>
      ))}

      {profile.education && profile.education.length > 0 && (
        <>
          <div className="xgroup-h gap">Education &amp; Certifications</div>
          <div className="card xrole">
            <div className="xedu-list">
              {profile.education.filter((c) => /university|college|b\.s\.|b\.a\.|m\.s\.|m\.b\.a|ph\.?d/i.test(c.title + " " + (c.sub || ""))).map((c) => (
                <div key={c.id} className="xedu-row"><LogoTile cls="xrole-logo" letter={c.short} /><div><div className="xedu-t">{c.title}</div><div className="xedu-s">{c.sub}</div></div></div>
              ))}
            </div>
            <div className="xcerts"><b>Certifications</b>{profile.education.filter((c) => !/university|college|b\.s\.|b\.a\.|m\.s\.|m\.b\.a|ph\.?d/i.test(c.title + " " + (c.sub || ""))).map((c) => `${c.title}${c.sub ? ` — ${c.sub}` : ""}`).join(" · ")}</div>
          </div>
        </>
      )}
    </div>
  );
}

function HowIWorkPage() {
  const { profile } = useStore();
  return (
    <div className="page on">
      <PageHead title="How I Work" sub="How I lead, what I stand for, what I’m great at, and the skills behind it — in one place." />
      <div className="card hw-sec">
        <div className="hw-title">Leadership</div><div className="hw-sub">How I lead and build teams</div>
        {profile.leadership.map((l) => <div key={l.title} className="sp"><div className="sp-ic"><Icon name={l.icon} /></div><div><div className="sp-t">{l.title}</div><div className="sp-d">{l.blurb}</div></div></div>)}
        {profile.leadershipBelief && <div className="belief">“{profile.leadershipBelief}”</div>}
      </div>
      <div className="card hw-sec">
        <div className="hw-title">Values</div><div className="hw-sub">Principles that guide my work</div>
        <div className="vgrid">{profile.values.map((v) => <div key={v.name} className="sp" style={{ border: "none", padding: 0 }}><div className="sp-ic" style={{ background: v.color }}><Icon name={v.icon} /></div><div><div className="sp-t">{v.name}</div><div className="sp-d">{v.blurb}</div></div></div>)}</div>
      </div>
      <div className="card hw-sec">
        <div className="hw-title">Superpowers</div><div className="hw-sub">The three things I’m known for</div>
        {profile.superpowers.map((sp) => <div key={sp.title} className="sp"><div className="sp-ic"><Icon name={sp.icon} /></div><div><div className="sp-t">{sp.title}</div><div className="sp-d">{sp.blurb}</div></div></div>)}
      </div>
      <div className="card hw-sec">
        <div className="hw-title">Skills</div><div className="hw-sub">The full capability map</div>
        <Skills />
      </div>
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
      <PageHead title="Media" sub="Talks, writing, press, and the things I’ve made — the fuller library." />
      <div className="mtabs">{types.map((t) => <div key={t} className={"mtab" + (t === f ? " on" : "")} onClick={() => setF(t)}>{t}</div>)}</div>
      <div className="mgrid">{items.map((m) => <MediaCard key={m.id} m={m} onInternal={() => goto("portfolio")} />)}</div>
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

function BioPage() {
  const { profile } = useStore();
  const openWorkWith = useWorkWith();
  const toast = useToast();
  const first = profile.name.split(" ")[0] || profile.name;
  return (
    <div className="page on">
      <PageHead title="About" />
      <div className="bio-wrap">
        <div className="bio-main">
          <div className="about-video" style={{ cursor: "pointer" }} onClick={() => toast("Intro video coming soon")}><div className="pc"><Icon name="play" fill /></div> Watch 60-second intro</div>
          <div className="case-body">{profile.bioLong.map((p, i) => <p key={i}>{p}</p>)}</div>
          {profile.bookedFor.length > 0 && (<>
            <div className="sec-label">What people book me for</div>
            <div className="bookedfor">{profile.bookedFor.map((b) => <span key={b} className="bf">{b}</span>)}</div>
          </>)}
          {profile.highlights.length > 0 && (<>
            <div className="sec-label">Career highlights</div>
            {profile.highlights.map((h, i) => <div key={i} className="about-hl"><span className="ck"><Icon name="check" /></span> {h}</div>)}
          </>)}
          {profile.testimonial && (<>
            <div className="sec-label">What people say</div>
            <div className="about-review"><p>“{profile.testimonial.quote}”</p><div className="who">{profile.testimonial.who}</div></div>
          </>)}
        </div>
        <aside className="bio-side">
          <div className="card bio-card">
            <div className="about-ava big">
              {profile.photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.photoUrl} alt="" referrerPolicy="no-referrer" />
                : <div className="photo-empty"><div className="pe-ic"><Icon name="camera" /></div></div>}
            </div>
            <div className="about-name">{profile.name} {profile.verified && <span className="vchk"><Icon name="check" /></span>}</div>
            <div className="about-role">{profile.headline}</div>
            {profile.rating && <div className="about-rating" style={{ margin: "10px 0 14px" }}><span className="stars">★★★★★</span> {profile.rating.stars}.0 · {profile.rating.count} sessions</div>}
            <div className="bio-facts">
              {profile.location && <div className="kv"><span>Based</span><b>{profile.location.split("·")[0].trim()}</b></div>}
              <div className="kv"><span>Responds</span><b>~1 business day</b></div>
            </div>
            <button className="msub" style={{ marginTop: 16 }} onClick={openWorkWith}>Work with {first}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─────────────── public footer (visitor conversion) ─────────────── */
function PublicFooter() {
  // A profile is the member's surface — Marquee's presence is one discreet link out, nothing more.
  return (
    <footer className="pubfoot public-only">
      <a className="made" href="https://marquee.bio" target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Made with <b>Marquee</b> <Icon name="arrow-up-right" style={{ width: 12, height: 12 }} /></a>
    </footer>
  );
}

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

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  const goto = (p: PageKey, id?: string) => {
    setProjectId(id ?? null);
    setPage(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModal(null); setEditing(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const store: Store = { profile, view, setView, page, goto, projectId, editing, setEditing };

  const pages: Record<PageKey, ReactNode> = {
    profile: <ProfilePage />, experience: <ExperiencePage />, "how-i-work": <HowIWorkPage />,
    media: <MediaPage />, portfolio: <PortfolioPage />, project: <ProjectPage />, bio: <BioPage />,
  };

  return (
    <div className="mq-root">
      <StoreCtx.Provider value={store}>
        <ModalCtx.Provider value={setModal}>
          <ToastCtx.Provider value={showToast}>
            <div className={"view-" + view}>
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
