// The Spotlight page, drawn from published items, section by section. Empty sections don't show.
import Link from "next/link";
import { BE_KNOWN_URL, eventDay, eventWhen, ago, type SpotlightItem } from "@/lib/spotlight";
import FeaturedFeed from "./FeaturedFeed";
import EventList from "./EventList";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
const EYEBROW = "text-[11px] font-bold tracking-[0.16em] uppercase";
const H2 = "font-lora font-normal tracking-[-0.01em] leading-[1] text-[clamp(40px,6vw,72px)]";
const BTN = "inline-flex items-center gap-2 font-inter font-semibold text-[14px] px-5 py-[12px] transition-colors";

/** Colour block used when an item has no picture, by kind. */
export const tone = (kind: string | null | undefined) => /article|interview|essay/i.test(kind || "") ? "bg-purple" : /education|workshop|cohort|guide|course/i.test(kind || "") ? "bg-blue" : "bg-beige";

function Thumb({ item, className = "" }: { item: SpotlightItem; className?: string }) {
  return item.image_url
    ? <img src={item.image_url} alt="" className={`object-cover ${className}`} />
    : <div className={`${tone(item.kind)} ${className}`} aria-hidden />;
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap border-b-2 border-ink pb-4 mb-2">
      <h2 className={H2}>{title}</h2>
      {sub && <p className="text-[15px] leading-[1.5] text-ink/75 max-w-[360px] mb-2">{sub}</p>}
    </div>
  );
}

const ext = (url: string | null) => (url && !url.startsWith("/") ? "_blank" : undefined);

export default function SpotlightView({ items, today }: { items: SpotlightItem[]; today: string }) {
  const by = (t: SpotlightItem["type"]) => items.filter((i) => i.type === t);
  const hero = by("hero")[0] || null;
  const news = by("news").slice(0, 3);
  const featured = by("featured");
  const opps = by("opportunity");
  const now = Date.now();
  const events = by("event").filter((i) => i.starts_at && new Date(i.starts_at).getTime() > now - 864e5).sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
  const edu = by("education");
  const communities = by("community");
  const empty = items.length === 0;

  return (
    <div className="bg-brand-paper text-ink font-inter">
      <header className={`${WRAP} pt-10 pb-6 text-center`}>
        <div className="text-[12px] text-ink/60 mb-3">{today}</div>
        <h1 className="font-lora font-normal tracking-[-0.02em] leading-[0.95] text-[clamp(56px,10vw,120px)]">Spotlight</h1>
        <p className="text-[15.5px] leading-[1.5] text-ink/75 max-w-[460px] mx-auto mt-4">The news, ideas and tools for professionals building careers across more than one thing.</p>
        <nav className="flex justify-center gap-x-6 gap-y-2 flex-wrap mt-8 border-t border-b border-hair py-3 text-[12px] font-bold tracking-[0.14em] uppercase">
          {news.length > 0 && <a href="#news" className="hover:text-dred">News</a>}
          {featured.length > 0 && <a href="#featured" className="hover:text-dred">Featured</a>}
          {events.length > 0 && <a href="#events" className="hover:text-dred">Events</a>}
          {opps.length > 0 && <a href="#opportunities" className="hover:text-dred">Opportunities</a>}
          {edu.length > 0 && <a href="#education" className="hover:text-dred">Education</a>}
          {communities.length > 0 && <a href="#communities" className="hover:text-dred">Communities</a>}
          <a href="#weekly" className="hover:text-dred">Be Known Weekly</a>
        </nav>
      </header>

      {empty && (
        <section className={`${WRAP} py-16 text-center`}>
          <p className="font-lora text-[26px] leading-[1.2]">The first edition is on its way.</p>
          <p className="text-[15px] text-ink/70 mt-3">Subscribe to Be Known Weekly and we&apos;ll tell you when it&apos;s up.</p>
          <a href={BE_KNOWN_URL} target="_blank" rel="noopener" className={`${BTN} bg-dred text-white hover:bg-red mt-6`}>Subscribe →</a>
        </section>
      )}

      {hero && (
        <section className={`${WRAP} pb-14`}>
          <div className="grid md:grid-cols-[1fr_1.15fr] bg-dred text-white">
            <Thumb item={hero} className="w-full h-full min-h-[280px]" />
            <div className="p-[clamp(28px,4vw,56px)] flex flex-col justify-center">
              <div className={`${EYEBROW} text-white/70`}>Featured {(hero.kind || "article").toLowerCase()}</div>
              <h2 className="font-lora font-normal tracking-[-0.01em] leading-[1.02] text-[clamp(34px,4.6vw,60px)] mt-4">{hero.title}</h2>
              {hero.blurb && <p className="text-[16px] leading-[1.55] text-white/85 mt-5 max-w-[520px]">{hero.blurb}</p>}
              <div className="flex items-center justify-between gap-4 flex-wrap mt-8 pt-5 border-t border-white/25">
                <span className="text-[13px] text-white/75">{[hero.org && `By ${hero.org}`, hero.detail].filter(Boolean).join(" · ")}</span>
                {hero.url && <a href={hero.url} target={ext(hero.url)} rel="noopener" className="text-[14px] font-semibold hover:underline">{hero.cta || "Read the article"} →</a>}
              </div>
            </div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section id="news" className={`${WRAP} pb-16 scroll-mt-20`}>
          <SectionHead title="News" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {news.map((n) => (
              <a key={n.id} href={n.url || "#"} target={ext(n.url)} rel="noopener" className="group block">
                <Thumb item={n} className="w-full aspect-[4/3]" />
                <div className={`${EYEBROW} text-dred mt-4`}>{n.kind || "News"}</div>
                <h3 className="font-lora text-[22px] leading-[1.2] mt-2 group-hover:underline">{n.title}</h3>
                {n.blurb && <p className="text-[14px] leading-[1.5] text-ink/70 mt-2">{n.blurb}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section id="featured" className={`${WRAP} pb-16 scroll-mt-20`}>
          <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
            <div>
              <h2 className={`${H2} mb-6`}>Featured</h2>
              <FeaturedFeed items={featured.map((i) => ({ id: i.id, kind: i.kind || "Article", title: i.title, blurb: i.blurb, url: i.url, image_url: i.image_url, when: ago(i.created_at) }))} />
            </div>
            <aside className="space-y-5 md:sticky md:top-24">
              <div className="bg-ink text-white">
                <div className="bg-purple aspect-[4/3]" aria-hidden />
                <div className="p-7">
                  <div className={`${EYEBROW} text-brand-lavender`}>Marquee · Private beta</div>
                  <h3 className="font-lora text-[32px] leading-[1.05] mt-3">Your work, on <em>one link.</em></h3>
                  <p className="text-[14px] leading-[1.5] text-white/80 mt-3">Story, experience, rates, availability and a storefront at marquee.bio/yourname.</p>
                  <Link href="/join" className={`${BTN} bg-red text-white hover:bg-dred mt-5`}>Sign up for Marquee →</Link>
                </div>
              </div>
              <div className="bg-dred text-white p-7">
                <div className={`${EYEBROW} text-white/70`}>In your inbox</div>
                <h3 className="font-lora text-[30px] leading-[1.05] mt-3">Be Known <em>Weekly</em></h3>
                <p className="text-[14px] leading-[1.5] text-white/85 mt-3">The week&apos;s best opportunities, events and ideas. Every Friday.</p>
                <a href={BE_KNOWN_URL} target="_blank" rel="noopener" className={`${BTN} bg-white text-dred hover:bg-beige mt-5`}>Subscribe →</a>
              </div>
            </aside>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section id="events" className={`${WRAP} pb-16 scroll-mt-20`}>
          <EventList events={events.map((e) => ({ id: e.id, title: e.title, kind: e.kind, place: e.place, price: e.price, url: e.url, cta: e.cta, ...eventDay(String(e.starts_at)), when: eventWhen(String(e.starts_at)) }))} />
        </section>
      )}

      {opps.length > 0 && (
        <section id="opportunities" className={`${WRAP} pb-16 scroll-mt-20`}>
          <SectionHead title="Opportunities" sub="Board, advisory, fractional and project work. Hand-picked every week." />
          <ul>
            {opps.map((o) => (
              <li key={o.id} className="grid md:grid-cols-[120px_minmax(0,1fr)_260px] gap-x-6 gap-y-1 items-center py-6 border-b border-hair">
                <span className={`${EYEBROW} text-dred`}>{o.kind || "Opportunity"}</span>
                <a href={o.url || "#"} target={ext(o.url)} rel="noopener" className="font-lora text-[clamp(22px,2.6vw,30px)] leading-[1.15] hover:underline">{o.title}</a>
                <span className="text-[13.5px] leading-[1.45] md:text-right"><span className="font-semibold block">{o.org}</span><span className="text-ink/65">{o.detail}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {edu.length > 0 && (
        <section id="education" className={`${WRAP} pb-16 scroll-mt-20`}>
          <SectionHead title="Education" sub="Workshops, cohorts and guides on pricing, positioning and the next chapter." />
          <ol>
            {edu.map((e, i) => (
              <li key={e.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-x-5 items-center py-6 border-b border-hair">
                <span className="font-lora text-[26px] text-ink/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className={`${EYEBROW} text-dred block mb-1`}>{e.kind || "Education"}</span>
                  <a href={e.url || "#"} target={ext(e.url)} rel="noopener" className="font-lora text-[clamp(22px,2.6vw,30px)] leading-[1.15] hover:underline">{e.title}</a>
                </span>
                <span className="text-[13.5px] text-ink/65 text-right">{[e.detail, e.price].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {communities.length > 0 && (
        <section id="communities" className={`${WRAP} pb-16 scroll-mt-20`}>
          <div className="flex items-end justify-between gap-6 flex-wrap border-b-2 border-ink pb-3 mb-6">
            <h2 className="font-lora font-normal tracking-[-0.01em] leading-[1] text-[clamp(30px,4vw,44px)]">Communities</h2>
            <p className="text-[14px] text-ink/75 mb-1">Groups worth joining.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {communities.map((c) => (
              <a key={c.id} href={c.url || "#"} target={ext(c.url)} rel="noopener" className="group bg-white border border-hair p-5 hover:border-ink transition-colors">
                {c.kind && <div className={`${EYEBROW} text-dred`}>{c.kind}</div>}
                <h3 className="font-lora text-[20px] leading-[1.2] mt-2 group-hover:underline">{c.title}</h3>
                {c.blurb && <p className="text-[13.5px] leading-[1.5] text-ink/70 mt-2">{c.blurb}</p>}
                <div className="text-[13px] font-semibold mt-4">{c.cta || "Join"} →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section id="weekly" className="bg-ink text-white scroll-mt-20">
        <div className={`${WRAP} py-[clamp(48px,7vw,88px)] grid md:grid-cols-[1fr_auto] gap-8 items-center`}>
          <div>
            <div className={`${EYEBROW} text-brand-lavender`}>Every Friday</div>
            <h2 className="font-lora font-normal leading-[1] text-[clamp(40px,6vw,72px)] mt-3">Be Known <em>Weekly</em></h2>
            <p className="text-[16px] leading-[1.55] text-white/80 mt-4 max-w-[520px]">Stay in the know on Marquee news, featured stories, new opportunities and upcoming events.</p>
          </div>
          <a href={BE_KNOWN_URL} target="_blank" rel="noopener" className={`${BTN} bg-red text-white hover:bg-dred !px-7 !py-4 !text-[16px]`}>Subscribe →</a>
        </div>
      </section>
    </div>
  );
}
