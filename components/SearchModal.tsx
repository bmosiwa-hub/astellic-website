"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Content index ────────────────────────────────────────────────────────── */
interface SearchItem {
  title: string;
  href: string;
  category: string;
  desc: string;
  keywords?: string;
}

const INDEX: SearchItem[] = [
  /* Pages */
  { title: "Home",                href: "/",                        category: "Pages",          desc: "Astellic homepage — evidence, policy, delivery." },
  { title: "About Astellic",      href: "/about",                   category: "Pages",          desc: "Who we are, founding story, the problem we solve." },
  { title: "Vision & Mission",    href: "/about/vision-mission",    category: "Pages",          desc: "Our purpose, values, and what success looks like." },
  { title: "Our Team",            href: "/about/our-team",          category: "Pages",          desc: "Dr. Benjamin Mosiwa — career, publications, expertise." },
  { title: "Why Astellic",        href: "/why-astellic",            category: "Pages",          desc: "Competitive positioning, five operating principles, sectors served." },
  { title: "Our Approach",        href: "/approach",                category: "Pages",          desc: "6-stage value delivery model from evidence to impact." },
  { title: "Our Projects",        href: "/our-projects",            category: "Pages",          desc: "Case narratives, track record, capability demonstrated." },
  { title: "Insights",            href: "/insights",                category: "Pages",          desc: "Implementation briefs, MERL insights, policy commentary, perspectives." },
  { title: "Contact",             href: "/contact",                 category: "Pages",          desc: "Discuss an engagement, get in touch with Astellic." },
  { title: "Resources",           href: "/resources",               category: "Pages",          desc: "Tools, templates, guides, downloads." },

  /* Services — Pillar 01 */
  { title: "Evidence Generation & Verification",          href: "/what-we-do/evidence",                      category: "Services",       desc: "Astellic's analytical engine — research, evaluation, data quality." },
  { title: "Research & Analytics",                        href: "/what-we-do/evidence/research-analytics",   category: "Services",       desc: "Policy-relevant research, PEA, sector systems analysis, landscape assessments.", keywords: "political economy analysis research applied analytics" },
  { title: "Monitoring, Evaluation, Accountability & Learning (MEAL)", href: "/what-we-do/evidence/evaluation-learning",  category: "Services",       desc: "Third-party monitoring, independent verification & validation, evaluations, data quality assessments, and adaptive learning.", keywords: "MEAL MEL MERL third party monitoring TPM independent verification validation IV&V DQA data quality baseline midline endline process monitoring impact evaluation learning agenda accountability adaptive management" },
  { title: "Third-Party Monitoring (TPM)",                href: "/what-we-do/evidence/evaluation-learning",  category: "Methods",        desc: "Independent, on-the-ground verification that activities and outputs are delivered as reported.", keywords: "TPM third party monitoring independent verification remote monitoring assurance donor" },
  { title: "Data Quality & Research Integrity",           href: "/what-we-do/evidence/data-quality",         category: "Services",       desc: "DQA protocols, research integrity, ethics compliance, peer review.", keywords: "data quality audit DQA verification research integrity" },

  /* Services — Pillar 02 */
  { title: "Policy Development & Advisory",               href: "/what-we-do/policy",                        category: "Services",       desc: "Policy frameworks, strategy, guidelines, knowledge translation." },
  { title: "Strategy Development",                        href: "/what-we-do/policy/strategy-development",   category: "Services",       desc: "Actionable policy strategies grounded in evidence and context." },
  { title: "Systems Strengthening",                       href: "/what-we-do/policy/systems-strengthening",  category: "Services",       desc: "Institutional systems reform, governance strengthening, capacity." },
  { title: "Knowledge Translation",                       href: "/what-we-do/policy/knowledge-translation",  category: "Services",       desc: "Translating evidence into policy briefs, guidance, and advocacy." },

  /* Services — Pillar 03 */
  { title: "Policy, Systems Analysis & Implementation Support", href: "/what-we-do/implementation",                        category: "Services", desc: "Embedded implementation support, delivery diagnostics, adaptive systems." },
  { title: "Programme Design",                            href: "/what-we-do/implementation/programme-design",  category: "Services",     desc: "Theory of change, results frameworks, implementation-ready interventions.", keywords: "programme design theory of change results framework" },
  { title: "Adaptive Management",                         href: "/what-we-do/implementation/adaptive-management",category: "Services",    desc: "Real-time adaptation, course-correction, learning-driven execution." },
  { title: "Technical Assistance",                        href: "/what-we-do/implementation/technical-assistance",category: "Services",   desc: "Embedded advisory, capacity building, institutional support.", keywords: "technical assistance embedded advisory capacity" },

  /* Who We Serve */
  { title: "Institutions We Support",                     href: "/institutions-we-support",                          category: "Who We Serve", desc: "Donors, governments, development partners, corporations." },
  { title: "Donors & Governments",                        href: "/institutions-we-support/donors-and-governments",   category: "Who We Serve", desc: "Bilateral donors, multilateral funders, national governments.", keywords: "FCDO USAID World Bank WHO bilateral donor government" },
  { title: "Development Partners",                        href: "/institutions-we-support/development-partners",     category: "Who We Serve", desc: "UN agencies, INGOs, implementing organisations, NGOs." },
  { title: "Corporate Institutions",                      href: "/institutions-we-support/corporate-institutions",   category: "Who We Serve", desc: "Private sector ESG, CSR strategy, social investment measurement.", keywords: "ESG CSR corporate social investment impact measurement" },

  /* Thematic Areas */
  { title: "Thematic Areas",                              href: "/thematic-areas",             category: "Thematic Areas", desc: "Health, environmental sustainability, and social development — our three primary domains." },
  { title: "Health",                  href: "/thematic-areas/health",      category: "Thematic Areas", desc: "Primary health care, UHC financing, digital health, immunisation.", keywords: "health UHC health financing primary care digital health immunisation nutrition" },
  { title: "Environmental Sustainability",       href: "/thematic-areas/climate",     category: "Thematic Areas", desc: "Climate policy, agricultural systems, resilience, NDCs.", keywords: "climate agriculture sustainability resilience NDC adaptation environment" },
  { title: "Social Development",          href: "/thematic-areas/education",   category: "Thematic Areas", desc: "Education, social protection, skills development, human rights.", keywords: "education social protection TVET skills human rights gender" },

  /* Work With Us */
  { title: "Work With Us",        href: "/work-with-us",        category: "Work With Us", desc: "Career openings and opportunities at Astellic." },
  { title: "Join Our Roster",     href: "/join-our-roster",     category: "Work With Us", desc: "Associate and expert network — consultants and specialists.", keywords: "associate consultant roster expert network freelance" },
  { title: "Propose Partnership", href: "/propose-partnership", category: "Work With Us", desc: "Institutional partnerships and strategic alliances." },

  /* Methods / topics — keyword-heavy entries */
  { title: "Political Economy Analysis (PEA)",      href: "/what-we-do/evidence/research-analytics",  category: "Methods", desc: "Institutional incentive mapping, reform feasibility, stakeholder analysis." },
  { title: "Adaptive MEAL",                         href: "/what-we-do/evidence/evaluation-learning",  category: "Methods", desc: "Real-time monitoring, evaluation, research and learning system design." },
  { title: "Data Quality Audit (DQA)",              href: "/what-we-do/evidence/data-quality",         category: "Methods", desc: "Verification frameworks, reporting credibility, data governance." },
  { title: "Theory of Change",                      href: "/what-we-do/implementation/programme-design",category: "Methods", desc: "Logic models, results chains, impact pathways." },
  { title: "Impact Assessment",                     href: "/what-we-do/evidence/evaluation-learning",  category: "Methods", desc: "Formative, summative and impact evaluations." },
  { title: "Implementation Readiness Review",       href: "/what-we-do/implementation",                category: "Methods", desc: "Pre-launch diagnostic before programmes begin." },
  { title: "Health Financing Diagnostics",          href: "/thematic-areas/health",                    category: "Methods", desc: "UHC costing, public expenditure, health budget analysis." },
  { title: "ESG & Impact Measurement",              href: "/institutions-we-support/corporate-institutions", category: "Methods", desc: "Corporate social investment strategy and evidence systems." },
  { title: "Institutional Diagnostics",             href: "/what-we-do/evidence/research-analytics",  category: "Methods", desc: "Capacity gap analysis, organisational assessments, reform readiness." },

  /* People */
  { title: "Dr. Benjamin Azariah Mosiwa", href: "/about/our-team", category: "Team", desc: "Founder & CEO — systems strategist, health policy expert, evidence-to-delivery specialist.", keywords: "founder CEO Benjamin Mosiwa doctor health policy Malawi" },
];

/* ── Simple relevance scoring ─────────────────────────────────────────────── */
function score(item: SearchItem, q: string): number {
  const query  = q.toLowerCase().trim();
  const title  = item.title.toLowerCase();
  const desc   = item.desc.toLowerCase();
  const keys   = (item.keywords ?? "").toLowerCase();
  const cat    = item.category.toLowerCase();

  if (title === query)                    return 100;
  if (title.startsWith(query))            return 80;
  if (title.includes(query))              return 60;
  if (keys.includes(query))              return 45;
  if (desc.includes(query))              return 30;
  if (cat.includes(query))               return 20;

  // Multi-word: all words must appear somewhere
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const haystack = `${title} ${desc} ${keys} ${cat}`;
    const allMatch = words.every((w) => haystack.includes(w));
    if (allMatch) return 15;
  }

  return 0;
}

function search(query: string): SearchItem[] {
  if (!query.trim()) return [];
  const scored = INDEX.map((item) => ({ item, s: score(item, query) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 9)
    .map(({ item }) => item);
  return scored;
}

/* ── Category colour map ──────────────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  Pages:          "bg-gray-100 text-gray-600",
  Services:       "bg-brand-navy/10 text-brand-navy",
  "Who We Serve": "bg-brand-teal/10 text-brand-teal",
  "Thematic Areas":"bg-brand-green/10 text-brand-green",
  Methods:        "bg-brand-gold/15 text-amber-700",
  "Work With Us": "bg-purple-50 text-purple-700",
  Team:           "bg-rose-50 text-rose-700",
  Insights:       "bg-sky-50 text-sky-700",
};

/* ── Popular shortcuts (shown when no query) ─────────────────────────────── */
const SHORTCUTS = [
  { label: "What we do",         href: "/what-we-do"                            },
  { label: "Our projects",       href: "/our-projects"                          },
  { label: "Health systems",     href: "/thematic-areas/health"                 },
  { label: "Adaptive MEAL",      href: "/what-we-do/evidence/evaluation-learning" },
  { label: "DQA",                href: "/what-we-do/evidence/data-quality"      },
  { label: "Get in touch",       href: "/contact"                               },
];

/* ── Modal ────────────────────────────────────────────────────────────────── */
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [active,  setActive]  = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLUListElement>(null);
  const router    = useRouter();

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  /* Search on every keystroke */
  useEffect(() => {
    const r = search(query);
    setResults(r);
    setActive(0);
  }, [query]);

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = query ? results : SHORTCUTS;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = items[active];
        if (target) { router.push(target.href); onClose(); }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [query, results, active, router, onClose],
  );

  /* Global Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Scroll active result into view */
  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const hasResults = results.length > 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Site search"
    >
      {/* Panel */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "72vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <svg className="w-5 h-5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, services, thematic areas, methods…"
            className="flex-1 text-brand-navy placeholder-gray-400 text-base outline-none bg-transparent"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200 shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results / shortcuts */}
        <div className="overflow-y-auto flex-1">
          {/* ── Search results ── */}
          {query && (
            <>
              {hasResults ? (
                <ul ref={listRef} className="py-2">
                  {results.map((item, i) => (
                    <li key={item.href + item.title}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                          i === active ? "bg-brand-light" : "hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => setActive(i)}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          i === active ? "bg-brand-navy" : "bg-gray-100"
                        }`}>
                          <svg className={`w-4 h-4 ${i === active ? "text-white" : "text-brand-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-brand-navy truncate">{item.title}</p>
                          <p className="text-xs text-brand-muted truncate mt-0.5">{item.desc}</p>
                        </div>

                        {/* Category badge */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          CAT_COLORS[item.category] ?? "bg-gray-100 text-gray-500"
                        }`}>
                          {item.category}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-brand-muted text-sm">No results for <span className="font-semibold text-brand-navy">&ldquo;{query}&rdquo;</span></p>
                  <p className="text-gray-400 text-xs mt-2">Try searching for a service, thematic area, or method.</p>
                </div>
              )}
            </>
          )}

          {/* ── Empty state: popular shortcuts ── */}
          {!query && (
            <div className="py-4">
              <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                Popular pages
              </p>
              <ul ref={listRef}>
                {SHORTCUTS.map((s, i) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                        i === active ? "bg-brand-light" : "hover:bg-gray-50"
                      }`}
                      onMouseEnter={() => setActive(i)}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        i === active ? "bg-brand-navy" : "bg-gray-100"
                      }`}>
                        <svg className={`w-3.5 h-3.5 ${i === active ? "text-white" : "text-brand-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-brand-navy">{s.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-2.5 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white border border-gray-200 rounded px-1 py-0.5">↑</kbd>
              <kbd className="font-mono bg-white border border-gray-200 rounded px-1 py-0.5">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
              close
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            <span className="text-brand-gold font-semibold">Astellic</span> site search
          </p>
        </div>
      </div>
    </div>
  );
}
