// One collection page: its own heading and intro, the matching roles, and a short FAQ. Server-rendered.
import type { Metadata } from "next";
import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import Board from "./Board";
import { COLLECTIONS, collection } from "@/lib/opportunity-collections";
import { loadPublished, loadViewer } from "@/lib/opportunities-server";
import type { JobRow } from "./JobCard";

export const collectionMetadata = (key: string): Metadata => {
  const c = collection(key)!;
  return { title: c.title, description: c.description, alternates: { canonical: `https://marquee.bio/opportunities/${c.key}` }, openGraph: { title: c.title, description: c.description, url: `https://marquee.bio/opportunities/${c.key}` } };
};

export async function CollectionPage({ keyName }: { keyName: string }) {
  const c = collection(keyName)!;
  const [all, viewer] = await Promise.all([loadPublished(), loadViewer()]);
  const rows = (all as JobRow[]).filter((r) => c.match(r));
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <BrandShell source="opportunities">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Board initialRows={rows} initialSaved={viewer.saved} initialSignedIn={viewer.signedIn} hero={{ title: c.h1, intro: c.intro, eyebrow: "Opportunities" }}>
        <section className="mt-10">
          <h2 className="font-lora text-[26px] leading-[1.1]">Questions about {c.h1.replace(/\.$/, "").toLowerCase()}</h2>
          {c.faq.map(([q, a]) => <div key={q} className="mt-5"><h3 className="font-semibold text-[16px]">{q}</h3><p className="text-[15px] leading-[1.6] text-ink mt-1 max-w-[70ch]">{a}</p></div>)}
          <p className="text-[14px] mt-6 text-ink">More ways in: {COLLECTIONS.filter((x) => x.key !== c.key).map((x, i) => <span key={x.key}>{i > 0 ? " · " : ""}<Link href={`/opportunities/${x.key}`} className="underline underline-offset-2 hover:text-dred">{x.h1.replace(/\.$/, "")}</Link></span>)} · <Link href="/opportunities" className="underline underline-offset-2 hover:text-dred">All opportunities</Link></p>
        </section>
      </Board>
    </BrandShell>
  );
}
