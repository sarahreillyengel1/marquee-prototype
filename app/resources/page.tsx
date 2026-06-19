import BrandShell from "@/components/BrandShell";

export const metadata = { title: "Resources · Marquee" };

export default function ResourcesPage() {
  return (
    <BrandShell source="resources">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/60">
        Resources
      </span>
      <h1 className="font-canela text-5xl md:text-6xl text-brand-ink leading-[1.05] mt-3 max-w-3xl">
        Help, FAQs, and how-tos.
      </h1>
      <p className="text-lg text-brand-ink/70 leading-relaxed mt-6 max-w-2xl">
        Everything you need to get the most out of your Marquee. We&apos;re building this
        out as we go — drop us a note if you have a question we haven&apos;t answered yet.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {[
          { title: "Getting started", body: "From beta code to your first profile in under 20 minutes." },
          { title: "Sharing your Marquee", body: "Where to put your link — and what to say when you share it." },
          { title: "Editing your profile", body: "Quick guide to inline editing and the dashboard." },
          { title: "Inbound contact", body: "How recruiters and collaborators can reach you safely." },
        ].map((r) => (
          <div key={r.title} className="bg-white rounded-2xl p-6 border border-brand-stone">
            <h3 className="font-canela text-xl text-brand-ink">{r.title}</h3>
            <p className="text-brand-ink/70 mt-2 leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-brand-ink/40 mt-20 italic">
        Full help center coming soon.
      </p>
    </BrandShell>
  );
}
