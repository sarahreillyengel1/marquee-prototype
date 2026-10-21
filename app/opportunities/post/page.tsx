"use client";
// marquee.bio/opportunities/post: a business posts a role. Paste the listing -> check the fields -> review -> post.
// It lands as a draft; Sarah reviews before it goes live. ?id=<n> edits one of theirs.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BrandShell from "@/components/BrandShell";
import { WORK_TYPES, TYPE_LABEL, FUNCTIONS, FUNCTION_LABEL, SENIORITY, SENIORITY_LABEL, REMOTE, REMOTE_LABEL, PAY_PER, REQUIRE_LABEL, payLabel, type Opportunity } from "@/lib/opportunities";

const WRAP = "max-w-[1240px] mx-auto px-[clamp(20px,5vw,80px)]";
type Draft = { id?: number; title: string; company: string; company_url: string; company_blurb: string; work_type: string; function: string; seniority: string; location: string; remote: string; pay_min: number | null; pay_max: number | null; pay_per: string; pay_note: string; hours_per_week: number | null; start_text: string; length_text: string; description: string; responsibilities: string[]; requirements: string[]; skills: string[]; apply_url: string; deadline: string; require_marquee: string; status?: string };
const EMPTY: Draft = { title: "", company: "", company_url: "", company_blurb: "", work_type: "full-time", function: "other", seniority: "other", location: "", remote: "unknown", pay_min: null, pay_max: null, pay_per: "", pay_note: "", hours_per_week: null, start_text: "", length_text: "", description: "", responsibilities: [], requirements: [], skills: [], apply_url: "", deadline: "", require_marquee: "optional" };
const STEPS = ["The listing", "The details", "Review"];

export default function PostPage() { return <Suspense fallback={null}><Post /></Suspense>; }

function Post() {
  const params = useSearchParams();
  const editId = Number(params.get("id") || 0) || 0;
  const [auth, setAuth] = useState<"loading" | "out" | "member" | "business">("loading");
  const [company, setCompany] = useState("");
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [mode, setMode] = useState<"link" | "text">("link");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [d, setD] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Opportunity | null>(null);

  useEffect(() => {
    fetch("/api/business/opportunities").then(async (r) => {
      if (r.status === 401) { setAuth("out"); return; }
      const j = await r.json().catch(() => ({}));
      setAuth(j.account === "business" ? "business" : "member"); setCompany(j.company || "");
      if (editId) {
        const row = (j.rows || []).find((x: Opportunity) => x.id === editId);
        if (row) { setD({ ...EMPTY, ...row, pay_per: row.pay_per || "", deadline: row.deadline || "", function: row.function || "other", seniority: row.seniority || "other", remote: row.remote || "unknown", require_marquee: row.require_marquee || "optional" }); setStep(1); }
      } else if (j.company) setD((c) => ({ ...c, company: j.company }));
    }).catch(() => setAuth("out"));
  }, [editId]);

  const set = (patch: Partial<Draft>) => setD((c) => ({ ...c, ...patch }));
  const scan = async () => {
    setError(""); setScanning(true);
    const r = await fetch("/api/business/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "extract", url: mode === "link" ? url : "", text: mode === "text" ? text : "" }) });
    const j = await r.json().catch(() => ({}));
    setScanning(false);
    if (!r.ok) { setError(j.error || "We couldn't read that."); return; }
    const f = j.fields;
    setFound(f.found || []);
    setD({ ...EMPTY, ...f, company: f.company || company, pay_per: f.pay_per || "", apply_url: f.apply_url || (mode === "link" ? url : ""), require_marquee: "optional" });
    setStep(1);
  };
  const toReview = () => {
    setError("");
    if (!d.title.trim()) { setError("Add the role title."); return; }
    if (!d.company.trim()) { setError("Add your company."); return; }
    if (!/^https?:\/\//i.test(d.apply_url.trim())) { setError("Add the link where people apply, starting with https://."); return; }
    setStep(2);
  };
  const post = async () => {
    setBusy(true); setError("");
    const r = await fetch("/api/business/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", row: d }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(j.error || "Couldn't post it. Try again."); return; }
    setDone(j.row); setStep(3);
  };

  const input = "w-full rounded-[10px] border-[1.5px] border-hair bg-white px-4 py-[11px] text-[15px] focus:outline-none focus:border-ink";
  const label = "block text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/60 mb-[6px]";
  const chip = (on: boolean) => `px-[14px] py-[8px] rounded-full text-[13.5px] font-semibold border transition-colors ${on ? "bg-ink text-white border-ink" : "bg-white border-hair hover:border-ink"}`;
  const primary = "inline-block text-[12.5px] font-bold tracking-[0.08em] uppercase bg-dred text-white rounded-full px-6 py-[13px] hover:bg-red transition-colors disabled:opacity-50";
  const quiet = "text-[13.5px] font-semibold underline underline-offset-2 hover:text-dred";
  const Tag = ({ k }: { k: string }) => (found.includes(k) ? <span className="ml-2 align-middle inline-block text-[9.5px] font-bold tracking-[0.1em] uppercase bg-[#EDE7FF] text-ink px-[7px] py-[2px] rounded-full">From the listing</span> : null);
  const lines = (v: string[]) => v.join("\n");
  const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <BrandShell source="post">
      <section className="bg-blue"><div className={`${WRAP} py-[clamp(28px,4vw,44px)]`}>
        <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-dred">For businesses</div>
        <h1 className="font-lora font-normal tracking-[-0.01em] leading-[1.06] text-[clamp(28px,4.5vw,44px)] mt-2">{editId ? "Edit your opportunity." : "Post an opportunity."}</h1>
        <p className="text-[14.5px] text-ink/75 mt-2 max-w-[640px]">Paste the listing and we fill in the details. You check them, then post. Every opportunity is reviewed before it goes live, usually within a day. Free during the beta.</p>
        {auth === "business" && step < 3 && (
          <ol className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[12.5px] font-semibold">
            {STEPS.map((s, i) => <li key={s} className={`flex items-center gap-2 ${i === step ? "text-ink" : "text-ink/45"}`}><span className={`w-[22px] h-[22px] rounded-full text-[11px] flex items-center justify-center ${i <= step ? "bg-dred text-white" : "bg-white text-ink/50"}`}>{i + 1}</span>{s}</li>)}
          </ol>
        )}
      </div></section>

      <section className="bg-paper"><div className={`${WRAP} py-10`}>
        {auth === "loading" && <div className="text-[14px] text-ink/60">Loading…</div>}

        {auth === "out" && (
          <div className="max-w-[640px] bg-white border border-hair rounded-[14px] p-6 sm:p-8">
            <h2 className="font-lora text-[26px] leading-[1.1]">First, a business account.</h2>
            <p className="text-[15px] leading-[1.55] mt-3 text-ink/80">Posting is for companies. Create a free business account with your work email, then post the role. It takes a minute.</p>
            <div className="flex flex-wrap items-center gap-4 mt-6"><Link href="/business/join?next=/opportunities/post" className={primary}>Create a business account</Link><Link href="/login?next=/opportunities/post" className={quiet}>Sign in</Link></div>
          </div>
        )}

        {auth === "member" && (
          <div className="max-w-[640px] bg-white border border-hair rounded-[14px] p-6 sm:p-8">
            <h2 className="font-lora text-[26px] leading-[1.1]">Posting needs a business account.</h2>
            <p className="text-[15px] leading-[1.55] mt-3 text-ink/80">You&rsquo;re signed in as a Marquee member. To post a role, create a business account with your work email. Your Marquee stays as it is.</p>
            <div className="flex flex-wrap items-center gap-4 mt-6"><Link href="/business/join?next=/opportunities/post" className={primary}>Create a business account</Link><Link href="/opportunities" className={quiet}>Back to the board</Link></div>
          </div>
        )}

        {auth === "business" && step === 0 && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="bg-white border border-hair rounded-[14px] p-6 sm:p-8">
              <h2 className="font-lora text-[26px] leading-[1.1]">Start from your listing.</h2>
              <p className="text-[14.5px] text-ink/75 mt-2">Paste the link to the role on your site or job board, or paste the text. We only use what the listing says.</p>
              <div className="flex gap-2 mt-5">{(["link", "text"] as const).map((m) => <button key={m} type="button" onClick={() => setMode(m)} className={chip(mode === m)}>{m === "link" ? "Paste a link" : "Paste the text"}</button>)}</div>
              {mode === "link"
                ? <div className="mt-4"><label className={label}>Listing link</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={input} /></div>
                : <div className="mt-4"><label className={label}>The listing</label><textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Paste the whole job description here" className={input} /></div>}
              {error && <p className="text-[13px] text-dred mt-3" role="alert">{error}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-5">
                <button type="button" onClick={scan} disabled={scanning || (mode === "link" ? !url.trim() : !text.trim())} className={primary}>{scanning ? "Reading…" : "Continue"}</button>
                <button type="button" onClick={() => { setD({ ...EMPTY, company, apply_url: url }); setFound([]); setStep(1); }} className={quiet}>Fill it in by hand instead</button>
              </div>
            </div>
            <div className="bg-[#EDE7FF] rounded-[14px] p-5 text-[13.5px] leading-[1.55]"><b>What we fill in.</b> Title, company, type of work, place, pay, hours, start, length, the description, responsibilities and requirements. Anything the listing does not say stays empty for you to add. Pay is never guessed.</div>
          </div>
        )}

        {auth === "business" && step === 1 && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="bg-white border border-hair rounded-[14px] p-6 sm:p-8 space-y-6">
              <div><h2 className="font-lora text-[26px] leading-[1.1]">Check the details.</h2><p className="text-[14px] text-ink/70 mt-1">Edit anything. Fields marked From the listing came from what you pasted.</p></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={label}>Role title<Tag k="title" /></label><input value={d.title} onChange={(e) => set({ title: e.target.value })} className={input} /></div>
                <div><label className={label}>Company<Tag k="company" /></label><input value={d.company} onChange={(e) => set({ company: e.target.value })} className={input} /></div>
                <div><label className={label}>Company site</label><input value={d.company_url} onChange={(e) => set({ company_url: e.target.value })} placeholder="https://…" className={input} /></div>
                <div><label className={label}>One line about the company</label><input value={d.company_blurb} onChange={(e) => set({ company_blurb: e.target.value })} className={input} /></div>
              </div>
              <div><label className={label}>Type of work<Tag k="work_type" /></label><div className="flex flex-wrap gap-2">{WORK_TYPES.map((t) => <button key={t} type="button" onClick={() => set({ work_type: t })} className={chip(d.work_type === t)}>{TYPE_LABEL[t]}</button>)}</div></div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-4">
                <div><label className={label}>Location<Tag k="location" /></label><input value={d.location} onChange={(e) => set({ location: e.target.value })} placeholder="New York, US, Europe…" className={input} /></div>
                <div><label className={label}>Place</label><div className="flex gap-2">{REMOTE.filter((r) => r !== "unknown").map((r) => <button key={r} type="button" onClick={() => set({ remote: d.remote === r ? "unknown" : r })} className={chip(d.remote === r)}>{REMOTE_LABEL[r]}</button>)}</div></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={label}>Function</label><select value={d.function} onChange={(e) => set({ function: e.target.value })} className={input}>{FUNCTIONS.map((f) => <option key={f} value={f}>{FUNCTION_LABEL[f]}</option>)}</select></div>
                <div><label className={label}>Seniority</label><select value={d.seniority} onChange={(e) => set({ seniority: e.target.value })} className={input}>{SENIORITY.map((s) => <option key={s} value={s}>{SENIORITY_LABEL[s]}</option>)}</select></div>
              </div>
              <div>
                <div className="font-lora text-[20px] mb-3">Pay and time</div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><label className={label}>Pay from<Tag k="pay" /></label><input inputMode="numeric" value={d.pay_min ?? ""} onChange={(e) => set({ pay_min: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} placeholder="8000" className={input} /></div>
                  <div><label className={label}>Pay to</label><input inputMode="numeric" value={d.pay_max ?? ""} onChange={(e) => set({ pay_max: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} placeholder="10000" className={input} /></div>
                  <div><label className={label}>Per</label><select value={d.pay_per} onChange={(e) => set({ pay_per: e.target.value })} className={input}><option value="">—</option>{PAY_PER.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}</select></div>
                  <div><label className={label}>Pay note</label><input value={d.pay_note} onChange={(e) => set({ pay_note: e.target.value })} placeholder="+ equity, DOE…" className={input} /></div>
                  <div><label className={label}>Hours per week<Tag k="hours_per_week" /></label><input inputMode="numeric" value={d.hours_per_week ?? ""} onChange={(e) => set({ hours_per_week: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, "")) || null : null })} className={input} /></div>
                  <div><label className={label}>Start<Tag k="start_text" /></label><input value={d.start_text} onChange={(e) => set({ start_text: e.target.value })} placeholder="November" className={input} /></div>
                  <div><label className={label}>Length<Tag k="length_text" /></label><input value={d.length_text} onChange={(e) => set({ length_text: e.target.value })} placeholder="6 months, renewable" className={input} /></div>
                  <div><label className={label}>Deadline</label><input type="date" value={d.deadline} onChange={(e) => set({ deadline: e.target.value })} className={input} /></div>
                </div>
              </div>
              <div><label className={label}>About the role<Tag k="description" /></label><textarea value={d.description} onChange={(e) => set({ description: e.target.value })} rows={6} className={input} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={label}>What they&rsquo;ll do, one per line<Tag k="responsibilities" /></label><textarea value={lines(d.responsibilities)} onChange={(e) => set({ responsibilities: fromLines(e.target.value) })} rows={6} className={input} /></div>
                <div><label className={label}>What you&rsquo;re looking for, one per line<Tag k="requirements" /></label><textarea value={lines(d.requirements)} onChange={(e) => set({ requirements: fromLines(e.target.value) })} rows={6} className={input} /></div>
              </div>
              <div><label className={label}>Skills, comma separated</label><input value={d.skills.join(", ")} onChange={(e) => set({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={input} /></div>
              <div><label className={label}>Where people apply</label><input value={d.apply_url} onChange={(e) => set({ apply_url: e.target.value })} placeholder="https://…" className={input} /><p className="text-[12.5px] text-ink/60 mt-[6px]">The Apply button on Marquee opens this link.</p></div>
              <div className="bg-[#EDE7FF] rounded-[12px] p-5">
                <div className="font-semibold text-[15.5px]">Require a Marquee to apply?</div>
                <p className="text-[13.5px] text-ink/75 mt-1 leading-[1.5]">A Marquee shows a person&rsquo;s work, rates and availability in one link.</p>
                <div className="flex gap-2 mt-3">{(["yes", "optional"] as const).map((v) => <button key={v} type="button" onClick={() => set({ require_marquee: v })} className={chip(d.require_marquee === v)}>{v === "yes" ? "Yes" : "Optional"}</button>)}</div>
                <p className="text-[12.5px] text-ink/60 mt-3">{d.require_marquee === "yes" ? "The listing will say a Marquee is required and ask for the link." : "The listing will say a Marquee is welcome but not required."}</p>
              </div>
              {error && <p className="text-[13px] text-dred" role="alert">{error}</p>}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-hair"><button type="button" onClick={toReview} className={primary}>Review</button>{!editId && <button type="button" onClick={() => setStep(0)} className={quiet}>Back</button>}</div>
            </div>
            <Preview d={d} />
          </div>
        )}

        {auth === "business" && step === 2 && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="bg-white border border-hair rounded-[14px] p-6 sm:p-8">
              <h2 className="font-lora text-[26px] leading-[1.1]">Review and post.</h2>
              <div className="mt-5 space-y-5 text-[15px] leading-[1.6]">
                <div><div className={label}>Role</div>{d.title} at {d.company}{d.location ? ` · ${d.location}` : ""}{d.remote !== "unknown" ? ` · ${REMOTE_LABEL[d.remote]}` : ""}</div>
                <div><div className={label}>Type</div>{TYPE_LABEL[d.work_type]}{d.function !== "other" ? ` · ${FUNCTION_LABEL[d.function]}` : ""}{d.seniority !== "other" ? ` · ${SENIORITY_LABEL[d.seniority]}` : ""}</div>
                <div><div className={label}>Pay and time</div>{[payLabel({ pay_min: d.pay_min, pay_max: d.pay_max, pay_per: d.pay_per || null, pay_note: d.pay_note || null }), d.hours_per_week ? `${d.hours_per_week} hrs a week` : "", d.start_text ? `Starts ${d.start_text}` : "", d.length_text].filter(Boolean).join(" · ") || "Not stated"}</div>
                {d.description && <div><div className={label}>About the role</div><p className="whitespace-pre-line">{d.description}</p></div>}
                {d.responsibilities.length > 0 && <div><div className={label}>What they&rsquo;ll do</div><ul className="list-disc pl-5">{d.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></div>}
                {d.requirements.length > 0 && <div><div className={label}>What you&rsquo;re looking for</div><ul className="list-disc pl-5">{d.requirements.map((r) => <li key={r}>{r}</li>)}</ul></div>}
                <div><div className={label}>Apply</div><a href={d.apply_url} target="_blank" rel="noopener" className="underline underline-offset-2 break-all">{d.apply_url}</a></div>
                <div><div className={label}>Marquee</div>{REQUIRE_LABEL[d.require_marquee]}</div>
              </div>
              {error && <p className="text-[13px] text-dred mt-4" role="alert">{error}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-hair"><button type="button" onClick={post} disabled={busy} className={primary}>{busy ? "Posting…" : editId ? "Save changes" : "Post it"}</button><button type="button" onClick={() => setStep(1)} className={quiet}>Edit</button></div>
              <p className="text-[12.5px] text-ink/60 mt-4">{editId ? "Changes to a live opportunity show right away. We take a look at every edit." : "We review every opportunity before it goes live, usually within a day. You'll get an email when it's up."}</p>
            </div>
            <Preview d={d} />
          </div>
        )}

        {auth === "business" && step === 3 && done && (
          <div className="max-w-[640px] bg-white border border-hair rounded-[14px] p-6 sm:p-8">
            <h2 className="font-lora text-[28px] leading-[1.1]">{editId ? "Saved." : "Thanks. It's with us."}</h2>
            <p className="text-[15px] leading-[1.6] mt-3 text-ink/80">{editId ? "Your changes are saved." : <><b>{done.title}</b> is in review. We check every opportunity before it goes live, usually within a day, and we&rsquo;ll email you when it&rsquo;s up.</>}</p>
            <div className="flex flex-wrap items-center gap-4 mt-6"><Link href="/business/opportunities" className={primary}>Your opportunities</Link>{!editId && <button type="button" onClick={() => { setD({ ...EMPTY, company }); setFound([]); setUrl(""); setText(""); setDone(null); setStep(0); }} className={quiet}>Post another</button>}</div>
          </div>
        )}
      </div></section>
    </BrandShell>
  );
}

function Preview({ d }: { d: Draft }) {
  const pay = payLabel({ pay_min: d.pay_min, pay_max: d.pay_max, pay_per: d.pay_per || null, pay_note: d.pay_note || null });
  return (
    <div className="lg:sticky lg:top-6">
      <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/60 mb-2">How it will look</div>
      <div className="bg-white border border-hair rounded-[14px] p-5">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-blue font-semibold text-[13px] flex items-center justify-center">{(d.company || "?").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}</div>
        <div className="font-semibold text-[16px] mt-3">{d.title || "Role title"}</div>
        <div className="text-[13px] text-ink/65">{d.company || "Company"}{d.location ? ` · ${d.location}` : ""}{d.remote !== "unknown" ? ` · ${REMOTE_LABEL[d.remote]}` : ""}</div>
        <div className="mt-3 flex flex-wrap gap-2"><span className="text-[11.5px] font-semibold bg-[#EDE7FF] rounded-full px-[9px] py-[3px]">{TYPE_LABEL[d.work_type]}</span>{d.require_marquee === "yes" && <span className="text-[11.5px] font-semibold bg-dred text-white rounded-full px-[9px] py-[3px]">Marquee required</span>}</div>
        {pay && <div className="font-semibold text-[20px] text-dred tabular-nums mt-3">{pay}</div>}
        <div className="text-[12.5px] text-ink/65 mt-1">{[d.hours_per_week ? `${d.hours_per_week} hrs a week` : "", d.length_text].filter(Boolean).join(" · ")}</div>
        <div className="mt-4 inline-block text-[11px] font-bold tracking-[0.08em] uppercase bg-red text-white rounded-full px-4 py-[9px]">Apply on company site</div>
      </div>
    </div>
  );
}
