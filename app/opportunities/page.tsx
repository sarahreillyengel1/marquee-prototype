// marquee.bio/opportunities: the board, server-rendered so every listing is in the HTML. Filters run in the browser (Board.tsx).
import type { Metadata } from "next";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import Board from "./Board";
import { COLLECTIONS } from "@/lib/opportunity-collections";
import { loadPublished, loadViewer } from "@/lib/opportunities-server";
import type { JobRow } from "./JobCard";

export const dynamic = "force-dynamic";
const TITLE = "Fractional, Consulting & Executive Opportunities | Marquee";
const DESC = "Explore curated full-time, fractional, consulting, advisory, and project opportunities for experienced professionals. Find your next opportunity on Marquee.";
export const metadata: Metadata = { title: TITLE, description: DESC, alternates: { canonical: "https://marquee.bio/opportunities" }, openGraph: { title: TITLE, description: DESC, url: "https://marquee.bio/opportunities" } };

const FAQ: [string, string][] = [
  ["Where can I find fractional executive opportunities?", "Marquee curates fractional, consulting, advisory, project, and full-time opportunities for experienced professionals. Explore opportunities across leadership, operations, marketing, finance, technology, and other functions."],
  ["Who are these opportunities for?", "Professionals with five or more years of experience, from senior individual contributors to C-suite, in the US. Every role links to the company's own application."],
  ["How often is the board updated?", "New roles are added every week from companies' own career pages and open job feeds, and every link is checked weekly."],
];

export default async function OpportunitiesPage() {
  const [rows, viewer] = await Promise.all([loadPublished(), loadViewer()]);
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <BrandShell source="opportunities">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Board initialRows={rows as JobRow[]} initialSaved={viewer.saved} initialSignedIn={viewer.signedIn} hero={{ title: "Find your next opportunity.", intro: "Explore curated full-time, fractional, consulting, project, and advisory opportunities from companies looking for experienced professionals." }}>
        <section className="mt-10">
          <h2 className="font-lora text-[26px] leading-[1.1]">Browse by the way you work</h2>
          <div className="flex flex-wrap gap-2 mt-4">{COLLECTIONS.map((c) => <Link key={c.key} href={`/opportunities/${c.key}`} className="text-[13.5px] font-semibold border border-ink rounded-full px-4 py-[8px] hover:bg-ink hover:text-white transition-colors">{c.h1.replace(/\.$/, "")}</Link>)}</div>
          {FAQ.map(([q, a]) => <div key={q} className="mt-6"><h3 className="font-semibold text-[16px]">{q}</h3><p className="text-[15px] leading-[1.6] text-ink mt-1 max-w-[70ch]">{a}</p></div>)}
        </section>
      </Board>
    </BrandShell>
  );
}
