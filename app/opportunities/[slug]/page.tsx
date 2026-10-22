// marquee.bio/opportunities/<slug>: one listing. Public and shareable; search engines may index it.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandShell from "@/components/BrandShell";
import { createServerSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/booking-server";
import { TYPE_LABEL, FUNCTION_LABEL, SENIORITY_LABEL, type Opportunity } from "@/lib/opportunities";
import { initials, whereLabel, titleCase, cardPay } from "@/lib/opportunities-display";
import JobActions from "./JobActions";

export const dynamic = "force-dynamic";
const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";

async function load(slug: string) {
  const db = createServerSupabase();
  const { data } = await db.from("opportunities").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as Opportunity | null) || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const j = await load(params.slug);
  if (!j) return { title: "Job not found · Marquee" };
  const pay = cardPay(j);
  return { title: `${j.title} at ${j.company} · Marquee Opportunities`, description: `${TYPE_LABEL[j.work_type] || j.work_type}${whereLabel(j) ? ` · ${whereLabel(j)}` : ""}${pay ? ` · ${pay}` : ""}. ${(j.description || "").slice(0, 150)}` };
}

export default async function JobPage({ params }: { params: { slug: string } }) {
  const j = await load(params.slug);
  if (!j) notFound();
  const me = await currentUserId();
  let saved = false;
  if (me) { const { data } = await createServerSupabase().from("saved_opportunities").select("opportunity_id").eq("user_id", me).eq("opportunity_id", j.id).maybeSingle(); saved = !!data; }
  const { data: others } = await createServerSupabase().from("opportunities").select("id,slug,title").eq("status", "published").eq("company", j.company).neq("id", j.id).limit(5);
  const pay = cardPay(j) || "Rate not listed";
  const facts: [string, string][] = [["Pay", pay], ["Hours", j.hours_per_week ? `${j.hours_per_week} a week` : ""], ["Start", j.start_text || ""], ["Length", j.length_text || ""]].filter(([, v]) => v) as [string, string][];
  const Label = ({ children }: { children: React.ReactNode }) => <div className="text-[11px] font-bold tracking-[0.14em] uppercase mb-3">{children}</div>;

  return (
    <BrandShell source="job">
      <section className="bg-blue">
        <div className={`${WRAP} py-[clamp(28px,4vw,44px)]`}>
          <Link href="/opportunities" className="text-[13.5px] font-semibold hover:text-dred">&larr; Back to opportunities</Link>
          <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 md:gap-7 items-start mt-5">
            <div className="w-[56px] h-[56px] rounded-[12px] bg-white text-ink font-semibold text-[17px] flex items-center justify-center">{initials(j.company)}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2"><span className="text-[12px] font-semibold bg-[#EDE7FF] text-ink rounded-full px-[10px] py-[4px]">{TYPE_LABEL[j.work_type] || j.work_type}</span>{j.featured && <span className="text-[12px] font-semibold bg-dred text-white rounded-full px-[10px] py-[4px]">Featured</span>}{j.require_marquee === "yes" && <span className="text-[12px] font-semibold bg-dred text-white rounded-full px-[10px] py-[4px]">Marquee required</span>}</div>
              <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.08] text-[clamp(28px,4vw,42px)] mt-2">{j.title}</h1>
              <div className="text-[15px] text-ink/75 mt-2">{j.company}{whereLabel(j) ? ` · ${whereLabel(j)}` : ""}</div>
              {facts.length > 0 && <div className="flex flex-wrap gap-x-8 gap-y-3 mt-5">{facts.map(([k, v]) => <div key={k}><div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink/60">{k}</div><div className="text-[15px] font-semibold mt-[2px]">{v}</div></div>)}</div>}
            </div>
            <JobActions id={j.id} slug={j.slug} title={j.title} company={j.company} applyUrl={j.apply_url} saved={saved} signedIn={!!me} requireMarquee={j.require_marquee === "yes"} />
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className={`${WRAP} py-10 grid lg:grid-cols-[1fr_320px] gap-12`}>
          <div className="max-w-[680px]">
            {j.description && <><Label>About the role</Label><p className="text-[15.5px] leading-[1.65] whitespace-pre-line">{j.description}</p></>}
            {j.responsibilities.length > 0 && <div className="mt-8"><Label>What you&apos;ll do</Label><ul className="space-y-2">{j.responsibilities.map((r) => <li key={r} className="flex gap-3 text-[15px] leading-[1.55]"><span className="text-dred mt-[2px]">&bull;</span>{r}</li>)}</ul></div>}
            {j.requirements.length > 0 && <div className="mt-8"><Label>What they&apos;re looking for</Label><ul className="space-y-2">{j.requirements.map((r) => <li key={r} className="flex gap-3 text-[15px] leading-[1.55]"><span className="text-dred mt-[2px]">&bull;</span>{r}</li>)}</ul></div>}
            {j.skills.length > 0 && <div className="mt-8"><Label>Skills</Label><div className="flex flex-wrap gap-2">{j.skills.map((s) => <span key={s} className="text-[13px] font-medium bg-beige rounded-full px-[12px] py-[5px]">{titleCase(s)}</span>)}</div></div>}
            <p className="text-[12.5px] text-ink/50 mt-10">{j.source ? `Found on ${j.source}. ` : ""}{j.last_checked_at ? `Link checked ${new Date(j.last_checked_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. ` : ""}Marquee links to the company&apos;s own application. We are not the employer.</p>
          </div>
          <aside className="space-y-4">
            <div className="bg-[#EDE7FF] rounded-[14px] p-6">
              <div className="font-semibold text-[15.5px]">{j.require_marquee === "yes" ? "This role asks for your Marquee." : "Be the one they find next."}</div>
              <p className="text-[14px] leading-[1.55] text-ink/80 mt-2">{j.require_marquee === "yes" ? "The company asks for your Marquee link when you apply. It shows your experience, skills, rates and availability in one place." : "A Marquee shows your experience, skills, rates and availability in one link, so the next role finds you."}</p>
              <Link href={`/join?src=opportunities-${j.slug}`} className="inline-block mt-4 text-[12px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-4 py-[10px]">Claim your Marquee</Link>
            </div>
            <div className="bg-white border border-hair rounded-[14px] p-6">
              <div className="flex items-start gap-3"><div className="shrink-0 w-[40px] h-[40px] rounded-[10px] bg-blue text-ink font-semibold text-[13px] flex items-center justify-center">{initials(j.company)}</div><div className="min-w-0"><div className="font-semibold text-[15px]">{j.company_url ? <a href={j.company_url} target="_blank" rel="noopener" className="hover:text-dred">{j.company}</a> : j.company}</div>{j.company_blurb && <div className="text-[13px] text-ink/75 leading-[1.5] mt-[2px]">{j.company_blurb}</div>}</div></div>
              {j.function && <div className="text-[13px] text-ink mt-4">{FUNCTION_LABEL[j.function]}{j.seniority && j.seniority !== "other" ? ` · ${SENIORITY_LABEL[j.seniority]}` : ""}</div>}
              {others && others.length > 0 && <div className="text-[13px] mt-3">{others.length} other open {others.length === 1 ? "role" : "roles"} on Marquee: {others.map((o, i) => <span key={o.id}>{i > 0 ? ", " : ""}<Link href={`/opportunities/${o.slug}`} className="underline underline-offset-2 hover:text-dred">{o.title}</Link></span>)}</div>}
            </div>
          </aside>
        </div>
      </section>
    </BrandShell>
  );
}
