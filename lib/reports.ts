// Free reports (PDF) offered on marquee.bio. One entry per report.
// TO PUBLISH A REPORT: drop the PDF at public/<pdf> and set ready to true.
export const REPORTS = {
  "expertise-worth": {
    title: "What is your expertise worth?",
    pdf: "/reports/what-is-your-expertise-worth.pdf",
    ready: false,
    page: "/expertise-worth",
  },
} as const;
