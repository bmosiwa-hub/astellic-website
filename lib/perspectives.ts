// ─────────────────────────────────────────────────────────────────────────────
// Astellic Perspectives — our own analytical voice (the Insights "Our Analysis"
// platform). This is the single source of truth for Perspective metadata; it
// drives the Insights page list and the homepage teaser.
//
// TO ADD A NEW PERSPECTIVE (e.g. No. 02):
//   1. Add its PDF to /public/documents/ (e.g. Astellic_Perspectives_02_<slug>.pdf)
//   2. Prepend a new entry to PERSPECTIVES below (newest first)
//   3. Create its web page at app/insights/perspectives/<slug>/page.tsx
// The Insights list and the homepage teaser update automatically.
// ─────────────────────────────────────────────────────────────────────────────

export interface Perspective {
  no: string;        // "No. 01"
  slug: string;      // "rb-pea"  →  /insights/perspectives/rb-pea
  date: string;      // "October 2026"
  title: string;
  subtitle: string;
  author: string;
  summary: string;
  tags: string[];
  pdf: string;       // "/documents/..."
}

export const PERSPECTIVES: Perspective[] = [
  {
    no: "No. 01",
    slug: "rb-pea",
    date: "October 2026",
    title: "Results-Based Political Economy Analysis",
    subtitle: "From understanding power to navigating power for results.",
    author: "Dr. Benjamin Azariah Mosiwa",
    summary:
      "Political economy analysis usually explains power. This inaugural Perspective argues it should help you navigate it — toward specific results. It introduces Results-Based Political Economy Analysis (RB-PEA): an approach that makes the desired development result the unit of analysis, maps the political gates every results pathway must pass — Authorise, Deliver, Adopt, Sustain — and turns that reading into concrete entry points for action.",
    tags: ["Political Economy", "Implementation", "Framework"],
    pdf: "/documents/Astellic_Perspectives_01_RB-PEA.pdf",
  },
];

export function perspectiveHref(p: Perspective): string {
  return `/insights/perspectives/${p.slug}`;
}

/** Newest Perspective (list is maintained newest-first). */
export const LATEST_PERSPECTIVE = PERSPECTIVES[0];
