// The five collection pages under /opportunities: a search-friendly entry for each kind of work.
// Copy here is member-facing: Sarah approves it word for word before it changes.
export type CollectionRow = { title: string; company: string; company_blurb: string | null; work_type: string; location: string | null; remote: string | null; source: string | null; seniority: string | null };
export type Collection = { key: string; title: string; h1: string; intro: string; description: string; presetTypes: string[]; match: (r: CollectionRow) => boolean; faq: [string, string][] };
const t = (r: CollectionRow) => `${r.title} ${r.company_blurb || ""}`.toLowerCase();
export const COLLECTIONS: Collection[] = [
  { key: "fractional", title: "Fractional Executive Opportunities | Marquee", h1: "Fractional opportunities.", intro: "Fractional CMO, CFO, COO and other part-time leadership roles at companies that want senior experience without a full-time hire. Curated for experienced professionals.",
    description: "Fractional CMO, CFO, COO and other part-time executive roles, curated for experienced professionals. Find your next fractional opportunity on Marquee.",
    presetTypes: ["fractional"], match: (r) => r.work_type === "fractional" || /fractional/.test(t(r)),
    faq: [["What is a fractional executive role?", "A senior leadership role, usually 10 to 25 hours a week, where you lead a function for a company without joining full time. Most are paid monthly, some hourly."], ["How do I find fractional work?", "Companies post fractional roles on their own careers pages and on boards like this one. Marquee gathers the US ones here, with a link to apply on the company's site."]] },
  { key: "consulting", title: "Consulting & Project Opportunities | Marquee", h1: "Consulting and project opportunities.", intro: "Contract, project and interim roles where a company needs a defined piece of senior work done: a launch, a rebuild, a season of cover.",
    description: "Contract, project and interim roles for experienced consultants and operators. Find your next consulting opportunity on Marquee.",
    presetTypes: ["contract", "project", "interim"], match: (r) => ["contract", "project", "interim"].includes(r.work_type) || /consult/.test(t(r)),
    faq: [["What kinds of consulting roles are here?", "Fixed-scope projects, contracts with a set length, and interim leadership. Agencies, startups and established companies post them."], ["Are these roles remote?", "Many are. Each listing shows the place, and the Remote filter narrows the list."]] },
  { key: "advisory", title: "Advisory & Board Opportunities | Marquee", h1: "Advisory and board opportunities.", intro: "Advisory seats, board roles and part-time advisor engagements for people with operating experience to share.",
    description: "Advisory board seats and advisor roles for experienced executives. Find your next advisory opportunity on Marquee.",
    presetTypes: ["advisory", "board"], match: (r) => ["advisory", "board"].includes(r.work_type) || /advis|board member|board seat/.test(t(r)),
    faq: [["How are advisory roles paid?", "Usually a small monthly retainer, equity, or both. The listing says what the company offers when it states it."], ["Who posts advisory roles?", "Mostly startups between seed and Series B that want a specific kind of experience around the table."]] },
  { key: "remote", title: "Remote Opportunities for Experienced Professionals | Marquee", h1: "Remote opportunities.", intro: "Full-time, fractional and project roles you can do from anywhere in the US, from companies that hire remotely on purpose.",
    description: "Remote full-time, fractional, consulting and advisory roles for experienced professionals in the US. Find your next remote opportunity on Marquee.",
    presetTypes: [], match: (r) => r.remote === "remote" || /remote|anywhere/i.test(r.location || ""),
    faq: [["Are these roles open to anyone in the US?", "Each listing says. US · Remote means anywhere in the US. Global · Remote means the company hires in other countries too."], ["Do remote roles pay less?", "Not on this board. Pay is shown as the company states it, and the Pay filter sorts by range."]] },
  { key: "startups", title: "Startup Leadership Opportunities | Marquee", h1: "Startup opportunities.", intro: "Leadership and senior roles at seed to growth-stage startups: founding hires, heads of function, and the fractional and advisory roles that sit around them.",
    description: "Senior and leadership roles at startups, from founding hires to fractional and advisory work. Find your next startup opportunity on Marquee.",
    presetTypes: [], match: (r) => /startup|seed|series [a-c]|y combinator|\byc\b|venture|founding/.test(t(r)) || r.source === "workatastartup.com",
    faq: [["What stage are these startups?", "Mostly seed to Series B. Many come from Y Combinator companies and venture-backed teams hiring their first senior people."], ["Do startup roles include equity?", "Often. When the posting states equity, the listing carries it in the pay note."]] },
];
export const collection = (key: string) => COLLECTIONS.find((c) => c.key === key);
