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

// "Subscribe to Future Worth" on the report page: the Future Worth Substack (Sarah, 6 Nov 2026).
export const NEWSLETTER_URL = "https://futureworth.substack.com/";
