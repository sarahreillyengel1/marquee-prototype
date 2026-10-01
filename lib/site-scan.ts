// Site scan — reads a person's own website and finds their media: press, talks, podcasts,
// writing, videos, portfolio. It only ever returns links that are really on the site.
// Nothing is added to a profile by the scan itself; the person picks from what it found.
//
// Safety: the address is checked before every request (and after every redirect) so the
// scan can only reach public websites, never this server's own network.

import dns from "node:dns/promises";
import net from "node:net";
import { callClaude, parseJSON } from "@/lib/claude";

export const SCAN_KINDS = ["Press", "Talk", "Podcast", "Writing", "Portfolio", "Video"] as const;
/** What a shop scan sorts products into. Matches the kinds in the builder's Shop step. */
export const SHOP_KINDS = ["Template", "Guide", "Course", "Ebook", "Book", "Download"] as const;
export type ScanMode = "media" | "shop";
export type ScanKind = (typeof SCAN_KINDS)[number] | (typeof SHOP_KINDS)[number];
export interface ScanItem { kind: ScanKind; title: string; outlet: string; url: string; foundOn: string; /** the title was worked out from the web address, so the person should check it */ check?: boolean }
export interface ScanResult { site: string; siteTitle: string; pages: string[]; items: ScanItem[]; socials: Partial<Record<"linkedin" | "instagram" | "x" | "tiktok" | "youtube" | "substack", string>> }

const MAX_PAGES = 8, MAX_BYTES = 1_500_000, TIMEOUT_MS = 9000, MAX_LINKS = 260, MAX_ITEMS = 40;
const UA = "MarqueeSiteScan/1.0 (+https://marquee.bio)";

/* ── only public web addresses ── */
function privateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:") && privateIp(v.slice(7));
}
export async function safeUrl(raw: string): Promise<URL> {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`); } catch { throw new Error("That doesn't look like a website address."); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Only web addresses can be scanned.");
  if (u.port && u.port !== "80" && u.port !== "443") throw new Error("That address can't be scanned.");
  if (u.username || u.password) throw new Error("That address can't be scanned.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") || /(^|\.)(localhost|local|internal|test)$/i.test(host)) throw new Error("That address can't be scanned.");
  const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true }).catch(() => [])).map((x) => x.address);
  if (!ips.length) throw new Error("We couldn't find that website.");
  if (ips.some(privateIp)) throw new Error("That address can't be scanned.");
  return u;
}

export async function getPage(start: string, maxBytes = MAX_BYTES, accept: RegExp = /html/i): Promise<{ url: string; html: string } | null> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    const u = await safeUrl(url);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(u, { redirect: "manual", signal: ctl.signal, headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/rss+xml,application/atom+xml,application/xml,text/xml" } });
      if (res.status >= 300 && res.status < 400) { const next = res.headers.get("location"); if (!next) return null; url = new URL(next, u).toString(); continue; }
      if (!res.ok || !accept.test(res.headers.get("content-type") || "")) return null;
      const reader = res.body?.getReader(); if (!reader) return null;
      const chunks: Uint8Array[] = []; let size = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; chunks.push(value); if (size > maxBytes) { await reader.cancel(); break; } }
      return { url: u.toString(), html: Buffer.concat(chunks).toString("utf8") };
    } catch { return null; } finally { clearTimeout(timer); }
  }
  return null;
}

/* ── reading the page ── */
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
const decode = (s: string) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10) || 32) : ENT[e.toLowerCase()] ?? m);
const text = (html: string) => decode(html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag: string, name: string) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")); return m ? decode(m[2] ?? m[3] ?? m[4] ?? "") : ""; };

type Link = { url: string; text: string; ctx: string; page: string };
export function linksOf(html: string, pageUrl: string): Link[] {
  const body = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ");
  const out: Link[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const href = attr(" " + m[1], "href");
    if (!href || /^(#|mailto:|tel:|javascript:|sms:)/i.test(href)) continue;
    let abs: URL; try { abs = new URL(href, pageUrl); } catch { continue; }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
    abs.hash = "";
    const raw = text(m[2]) || attr(" " + m[1], "aria-label") || attr(" " + m[1], "title") || attr(m[2], "alt");
    const label = FILE_NAME.test(raw.trim()) ? "" : raw; // a logo's file name is not a title
    // the words just before the link usually name the thing ("Episode 12 … Listen")
    // (a slice can start halfway through a tag, so drop anything before the first complete one)
    const ctx = text(body.slice(Math.max(0, m.index - 600), m.index).replace(/^[^<]*>/, "")).slice(-170);
    out.push({ url: abs.toString(), text: label.slice(0, 160), ctx, page: pageUrl });
  }
  return out;
}

const SOCIAL: [keyof ScanResult["socials"], RegExp][] = [["linkedin", /linkedin\.com\/(in|company)\//i], ["instagram", /instagram\.com\/[^/?#]+/i], ["x", /(^|\.)(twitter|x)\.com\/[^/?#]+/i], ["tiktok", /tiktok\.com\/@/i], ["youtube", /youtube\.com\/(@|c\/|channel\/|user\/)/i], ["substack", /[a-z0-9-]+\.substack\.com\/?$/i]];
const JUNK = /(\/(privacy|terms|cookie|login|signin|sign-in|signup|register|cart|checkout|account|wp-admin|wp-login|feed|tag|category|author)(\/|$|\?))|(\.(pdf|jpg|jpeg|png|gif|webp|zip|css|js)(\?|$))|(share(r)?\.php|\/intent\/tweet|\/sharing\/|pinterest\.com\/pin\/create)/i;
const WORTH_A_LOOK = /(press|media|speak|talk|keynote|podcast|episode|writing|article|essay|blog|post|news|book|appearance|interview|feature|portfolio|work|project|case|video|watch|listen|newsletter|resource|about)/i;
// pages likely to list things for sale
const WORTH_A_LOOK_SHOP = /(shop|store|product|buy|course|class|workshop|template|guide|toolkit|kit|ebook|book|download|resource|digital|membership|program|offer|gumroad|teachable|kajabi|podia|thinkific|maven|stan\.store|lemonsqueezy|etsy|amazon)/i;
const FILE_NAME = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
// link text that names the action, not the piece
const GENERIC = /^((read|listen|watch|view|see|get|buy|order)( (it|more|now))?( (on|at|in) .{2,40})?|read more|read the (article|story|post)|listen|listen now|watch|watch now|view|view more|learn more|more|here|click here|link|see more|details|buy|buy now|order|get it|subscribe|play|episode|article|post|posts|popular posts|blog|press|media|podcast|video|videos|website|home)\.?$/i;

/** The real title and outlet of a piece, read from the page it links to. */
async function titleOf(url: string): Promise<{ title: string; outlet: string } | null> {
  const page = await getPage(url, 350_000);
  if (!page) return null;
  const head = page.html.slice(0, 350_000);
  const meta = (key: string) => { const m = head.match(new RegExp(`<meta[^>]+(?:property|name)\\s*=\\s*["']${key}["'][^>]*>`, "i")); return m ? attr(" " + m[0].slice(5), "content").replace(/\s+/g, " ").trim() : ""; };
  let outlet = meta("og:site_name") || meta("application-name");
  let title = meta("og:title") || meta("twitter:title") || text(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const plain = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const host = plain(new URL(page.url).hostname.replace(/^www\./, "").replace(/\.[a-z.]+$/, ""));
  // a long site name is usually "Name - strapline": keep the name
  if (outlet.length > 40) outlet = outlet.split(/\s[|–—-]\s/)[0].trim();
  // "Piece title | Outlet" and "Piece title Outlet - strapline" → "Piece title"
  if (outlet.length >= 4) { const at = title.toLowerCase().lastIndexOf(outlet.toLowerCase().slice(0, 24)); if (at > 8) title = title.slice(0, at); }
  // "Piece title – Site" where Site is the site's own name → "Piece title"
  const parts = title.split(/\s[|–—-]\s/);
  if (parts.length > 1) { const last = plain(parts[parts.length - 1]); if (last.length >= 3 && (host.includes(last) || last.includes(host))) { if (!outlet) outlet = parts[parts.length - 1].trim(); title = parts.slice(0, -1).join(" – "); } }
  // "Site.com: Piece title" → "Piece title"
  title = title.replace(/^[a-z0-9-]+\.(com|org|net|co|io)\s*:\s*/i, "").replace(/[\s|–—\-:·]+$/, "").replace(/\s+/g, " ").trim();
  return title ? { title: title.slice(0, 140), outlet: outlet.slice(0, 80) } : null;
}
// When a piece can't be opened (some sites block readers), its address usually still spells out the title.
function titleFromAddress(url: string): string {
  const last = decodeURIComponent(new URL(url).pathname).split("/").filter(Boolean).pop() || "";
  const words = last.replace(/\.(html?|php|aspx?)$/i, "").replace(/[-_]+/g, " ").replace(/\s[0-9a-f]{8,}$/i, "").replace(/\s+/g, " ").trim();
  if (words.split(" ").length < 3 || words.length < 12) return "";
  return words[0].toUpperCase() + words.slice(1);
}
const domainName = (url: string) => { const h = new URL(url).hostname.replace(/^www\./, ""); return h; };
const sameSite = (a: string, b: string) => new URL(a).hostname.replace(/^www\./, "") === new URL(b).hostname.replace(/^www\./, "");

/* ── RSS / Atom feeds ──
   Substack, Medium and most blogs draw their post list with scripts, so the page itself holds
   no post links. Their feed does, with real titles, so posts are read from there. */
function feedUrlOf(html: string, base: string): string | null {
  const tag = html.match(/<link[^>]+type\s*=\s*["']application\/(rss|atom)\+xml["'][^>]*>/i)?.[0];
  const href = tag ? attr(tag, "href") : "";
  try {
    if (href) return new URL(href, base).toString();
    const host = new URL(base).hostname;
    if (/\.substack\.com$/i.test(host) || /medium\.com$/i.test(host)) return new URL("/feed", base).toString();
  } catch { /* no feed */ }
  return null;
}
type FeedItem = { title: string; url: string; audio: boolean };
function parseFeed(xml: string): FeedItem[] {
  const out: FeedItem[] = [];
  const clean = (t: string) => text(t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).slice(0, 140);
  for (const m of xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)) {
    const block = m[0];
    const title = clean(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    let url = clean(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "");
    if (!url) { const l = block.match(/<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i); url = l ? l[1] : ""; }
    if (!title || !/^https?:\/\//i.test(url)) continue;
    out.push({ title, url, audio: /<enclosure[^>]+type\s*=\s*["']audio\//i.test(block) });
    if (out.length >= 20) break;
  }
  return out;
}

/** Scan a website and return the media (or, in shop mode, the products) found on it. */
export async function scanSite(raw: string, mode: ScanMode = "media"): Promise<ScanResult> {
  const shop = mode === "shop";
  const home = await getPage((await safeUrl(raw)).toString());
  if (!home) throw new Error("We couldn't open that website. Check the address and try again.");
  const siteTitle = text(home.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").slice(0, 120);
  const first = linksOf(home.html, home.url);

  // follow the site's own pages that are likely to list media
  const seen = new Set([home.url.replace(/\/$/, "")]);
  const more = first.filter((l) => sameSite(l.url, home.url) && !JUNK.test(l.url) && (shop ? WORTH_A_LOOK_SHOP : WORTH_A_LOOK).test(l.url + " " + l.text))
    .map((l) => l.url).filter((u) => { const k = u.replace(/\/$/, ""); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, MAX_PAGES - 1);
  const fetched = [home, ...(await Promise.all(more.map((u) => getPage(u)))).filter((p): p is { url: string; html: string } => !!p)];
  const pages = fetched.filter((p, i) => fetched.findIndex((x) => x.url.replace(/\/$/, "") === p.url.replace(/\/$/, "")) === i);

  const socials: ScanResult["socials"] = {};
  const byUrl = new Map<string, Link>();
  for (const p of pages) for (const l of p === home ? first : linksOf(p.html, p.url)) {
    const social = SOCIAL.find(([, re]) => re.test(l.url));
    if (social) { if (!socials[social[0]]) socials[social[0]] = l.url; continue; }
    if (JUNK.test(l.url)) continue;
    const key = l.url.replace(/\/$/, "");
    if (pages.some((x) => x.url.replace(/\/$/, "") === key)) continue; // the listing pages themselves are not media
    const had = byUrl.get(key);
    if (!had || (l.text.length > had.text.length && l.text.length < 140)) byUrl.set(key, l);
  }
  // posts from the site's feed (Substack, Medium, blogs) — titles come from the feed itself
  const fromFeed: ScanItem[] = [];
  if (!shop) {
    const feedUrl = feedUrlOf(home.html, home.url);
    const feed = feedUrl ? await getPage(feedUrl, 800_000, /xml|rss|atom/i).catch(() => null) : null;
    if (feed && /<(rss|feed|rdf:RDF)\b/i.test(feed.html)) {
      const outlet = siteTitle.split(/\s[|·–-]\s/)[0].trim().slice(0, 60) || domainName(home.url);
      for (const f of parseFeed(feed.html)) {
        byUrl.delete(f.url.replace(/\/$/, ""));
        fromFeed.push({ kind: f.audio ? "Podcast" : "Writing", title: f.title, outlet, url: f.url, foundOn: feedUrl! });
      }
    }
  }
  const links = Array.from(byUrl.values()).filter((l) => (l.text + l.ctx).trim().length > 3).slice(0, MAX_LINKS);
  if (!links.length) return { site: home.url, siteTitle, pages: pages.map((p) => p.url), items: fromFeed, socials };

  const list = links.map((l, n) => `${n} | ${l.text || "(no link text)"} | ${l.url} | before: ${l.ctx.slice(-110)}`).join("\n");
  const prompt = shop ? `You are reading links taken from one person's own website (${home.url}, "${siteTitle}").
Pick the ones that lead to a specific PRODUCT this person sells or gives away: a book (their own, on Amazon or elsewhere), a course or class, a template, a guide or toolkit, an ebook, a workshop, or a digital download. Product pages on other stores count (Amazon, Gumroad, Teachable, Kajabi, Podia, Thinkific, Maven, Etsy, Shopify, Lemon Squeezy, Stan).

Judge each link mainly by its ADDRESS and the words before it. The link text is often only "Buy", "Get it", a logo, or empty, and that is fine: the real title is read from the page afterwards.

Skip: articles, podcasts, talks, press, videos and other media; navigation, contact, cart and checkout pages, a whole shop's front page or category listing, social profiles, sign-ups, and anything not sold or made by this person.

For each one you keep, return:
- "n": the number at the start of its line
- "kind": exactly one of ${SHOP_KINDS.map((k) => `"${k}"`).join(", ")}  (Book = a printed or Kindle book; Ebook = a PDF or digital book; Download = any other digital file)

Return ONLY a JSON array, no other text. Example: [{"n":4,"kind":"Course"},{"n":9,"kind":"Book"}]

LINKS (number | link text | address | words before the link):
${list}` : `You are reading links taken from one person's own website (${home.url}, "${siteTitle}").
Pick the ones that lead to this person's MEDIA: a specific piece of press coverage about them, a specific talk or speaking event, a specific podcast episode or show they host or appear on, a specific piece of their writing (article, essay, newsletter issue, book), a specific video, or a specific portfolio or case-study piece.

Judge each link mainly by its ADDRESS and the words before it. The link text is often only "Read more", "Listen", a logo, or empty, and that is fine: the real title is read from the page afterwards. An address that clearly points to one article, episode, talk or video should be kept.

Skip: navigation, contact, shop or cart, home or about pages, lists and archives ("all posts", "blog", a profile page such as medium.com/@name), tags and categories, social profiles, sign-ups, and links that have nothing to do with this person's own work.

For each one you keep, return:
- "n": the number at the start of its line
- "kind": exactly one of ${SCAN_KINDS.map((k) => `"${k}"`).join(", ")}  (Talk = speaking or events; Writing = articles, essays, newsletters, books)

Return ONLY a JSON array, no other text. Example: [{"n":4,"kind":"Podcast"},{"n":9,"kind":"Press"}]

LINKS (number | link text | address | words before the link):
${list}`;

  let picked: { n: number; kind: string }[] = [];
  try {
    const reply = await callClaude(prompt, "reader").catch(() => callClaude(prompt, "haiku"));
    // the answer is the JSON array, wherever it sits in the reply
    const from = reply.indexOf("["), to = reply.lastIndexOf("]");
    const out = from >= 0 && to > from ? await parseJSON<unknown>(reply.slice(from, to + 1)) : [];
    if (Array.isArray(out)) picked = out as typeof picked;
  } catch { picked = []; }

  // Every title is read from the piece itself. If the page can't be opened, the site's own link
  // text is used, as long as it names the piece. Nothing is ever made up.
  const chosen: { l: Link; kind: ScanKind }[] = []; const used = new Set<string>();
  for (const p of picked) {
    const l = links[Number(p?.n)]; const kind = (shop ? SHOP_KINDS : SCAN_KINDS).find((k) => k === p?.kind);
    if (!l || !kind || used.has(l.url)) continue;
    used.add(l.url); chosen.push({ l, kind });
    if (chosen.length >= MAX_ITEMS) break;
  }
  const read = await Promise.all(chosen.map((c) => titleOf(c.l.url).catch(() => null)));
  const items: ScanItem[] = [...fromFeed];
  chosen.forEach((c, i) => {
    if (items.some((x) => x.url.replace(/\/$/, "") === c.l.url.replace(/\/$/, ""))) return;
    const own = c.l.text.replace(/\s+/g, " ").trim();
    const ownOk = own.length >= 6 && !GENERIC.test(own);
    const found = read[i];
    // a page whose title is just the outlet's name ("Medium", "YouTube") told us nothing
    const foundOk = !!found && found.title.length >= 6 && !GENERIC.test(found.title) && found.title.toLowerCase() !== (found.outlet || "").toLowerCase();
    const guess = foundOk || ownOk ? "" : titleFromAddress(c.l.url);
    const title = foundOk ? found!.title : ownOk ? own.slice(0, 140) : guess;
    if (!title) return;
    const external = !sameSite(c.l.url, home.url);
    items.push({ kind: c.kind, title, outlet: found?.outlet || (external ? domainName(c.l.url) : ""), url: c.l.url, foundOn: c.l.page, ...(guess ? { check: true } : {}) });
  });
  return { site: home.url, siteTitle, pages: pages.map((p) => p.url), items, socials };
}

/* ── A person's site as plain text ──
   For people who have no resume: the home page plus the pages most likely to describe them
   (about, bio, work, experience) are read and handed to the same reader the resume goes through. */
const ABOUT_PAGE = /(about|bio|story|me|who|work|experience|career|background|now|resume|cv)/i;
export async function siteText(raw: string, maxChars = 14_000): Promise<{ site: string; siteTitle: string; pages: string[]; text: string }> {
  const home = await getPage((await safeUrl(raw)).toString());
  if (!home) throw new Error("We couldn't open that website. Check the address and try again.");
  const siteTitle = text(home.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").slice(0, 120);
  const seen = new Set([home.url.replace(/\/$/, "")]);
  const more = linksOf(home.html, home.url).filter((l) => sameSite(l.url, home.url) && !JUNK.test(l.url) && ABOUT_PAGE.test(l.url + " " + l.text))
    .map((l) => l.url).filter((u) => { const k = u.replace(/\/$/, ""); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
  const pages = [home, ...(await Promise.all(more.map((u) => getPage(u)))).filter((p): p is { url: string; html: string } => !!p)];
  // main content only: drop navigation, headers, footers and menus
  const body = (html: string) => text(html.replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " "));
  let out = "";
  for (const p of pages) { const t = body(p.html); if (t.length > 80) out += `\n\n[${p.url}]\n${t}`; if (out.length > maxChars) break; }
  return { site: home.url, siteTitle, pages: pages.map((p) => p.url), text: out.trim().slice(0, maxChars) };
}
