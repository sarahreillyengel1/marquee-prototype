// Free reports (PDF) offered on marquee.bio. One entry per report.
// TO PUBLISH A REPORT: drop the PDF at public/<pdf> and set ready to true.
export const REPORTS = {
  "expertise-worth": {
    title: "The Future Worth Report 2026: What is your expertise worth?",
    pdf: "/reports/what-is-your-expertise-worth.pdf",
    ready: false,
    page: "/expertise-worth",
  },
} as const;

// "Subscribe to Future Worth" on the report page. Today the only newsletter sign-up is Be Known Weekly (same link as /spotlight).
export const NEWSLETTER_URL = "https://beknownweekly.substack.com/";
