import BrandShell from "@/components/BrandShell";
import Link from "next/link";
import { EFFECTIVE, type LegalBlock, type LegalSection } from "@/lib/legal";

// "**Label.** rest" → bold label, then the rest
function Text({ s }: { s: string }) {
  const m = s.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
  return m ? <><strong className="font-semibold text-ink">{m[1]}</strong> {m[2]}</> : <>{s}</>;
}

function Blocks({ body }: { body: LegalBlock[] }) {
  return (
    <>
      {body.map((b, i) => Array.isArray(b)
        ? <ul key={i} className="list-disc pl-5 space-y-[10px] mt-4">{b.map((li, j) => <li key={j}><Text s={li} /></li>)}</ul>
        : typeof b === "object"
          ? <div key={i} className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-[14.5px]"><tbody>{b.table.map((row, r) => <tr key={r}>{row.map((cell, c) => r === 0 ? <th key={c} className="text-left font-semibold text-ink border-b border-ink/60 py-2 pr-4 align-top">{cell}</th> : <td key={c} className="border-b border-hair py-2 pr-4 align-top"><Text s={cell} /></td>)}</tr>)}</tbody></table></div>
          : <p key={i} className="mt-4"><Text s={b} /></p>)}
    </>
  );
}

export default function LegalPage({ title, intro, sections, other }: { title: string; intro: LegalBlock[]; sections: LegalSection[]; other: { label: string; href: string } }) {
  return (
    <BrandShell source="legal">
      <article className="max-w-[760px] mx-auto px-[clamp(20px,5vw,40px)] py-[clamp(44px,6vw,84px)] text-[15.5px] leading-[1.65] text-ink/80">
        <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred">Legal</div>
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.08] text-[clamp(30px,5vw,48px)] text-ink mt-3">{title}</h1>
        <p className="mt-4 text-[13.5px] text-ink/60">Effective {EFFECTIVE} · See also our <Link href={other.href} className="underline underline-offset-2 hover:text-dred">{other.label}</Link></p>
        <div className="mt-6"><Blocks body={intro} /></div>
        {sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-lora font-normal text-[22px] leading-[1.25] text-ink">{s.h}</h2>
            <Blocks body={s.body} />
          </section>
        ))}
      </article>
    </BrandShell>
  );
}
