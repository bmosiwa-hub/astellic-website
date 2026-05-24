"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

type DomainId = "health" | "governance" | "education" | "climate";

interface ThematicArea {
  id:    DomainId;
  title: string;
  intro: string;
  img:   string;
  href:  string;
}

const THEMES: ThematicArea[] = [
  {
    id:    "health",
    title: "Health & Nutrition Systems",
    intro: "Astellic works across the full continuum of health systems — from research and policy design to programme delivery — helping governments, donors, and institutions strengthen health outcomes for African populations.",
    img:   "/images/thematic-health.jpg",
    href:  "/thematic-areas/health",
  },
  {
    id:    "governance",
    title: "Governance & Public Sector Reform",
    intro: "We support governance reforms that improve institutional performance, strengthen accountability systems, and build the public sector capacity needed for sustainable and equitable development.",
    img:   "/images/thematic-governance.jpg",
    href:  "/thematic-areas/governance",
  },
  {
    id:    "education",
    title: "Human Development & Social Systems",
    intro: "Our work in human development spans education, social protection, and inclusive growth — helping institutions design and deliver interventions that build human capital and strengthen resilient communities.",
    img:   "/images/thematic-education.jpg",
    href:  "/thematic-areas/education",
  },
  {
    id:    "climate",
    title: "Climate, Agriculture & Sustainability",
    intro: "We integrate climate science, sustainable agriculture, and environmental governance to help clients design programmes that advance development outcomes while protecting the ecological systems communities depend on.",
    img:   "/images/thematic-climate.jpg",
    href:  "/thematic-areas/climate",
  },
];

interface SubUnit {
  label:      string;
  href:       string;
  activities: Record<DomainId, string[]>;
}

interface Pillar {
  num:      string;
  label:    string;
  short:    string;
  href:     string;
  color:    string;
  bg:       string;
  dot:      string;
  subUnits: SubUnit[];
}

const PILLARS: Pillar[] = [
  {
    num:   "01",
    label: "Evidence Generation & Verification",
    short: "Evidence",
    href:  "/what-we-do/evidence",
    color: "border-brand-navy text-brand-navy",
    bg:    "bg-brand-navy",
    dot:   "bg-brand-navy",
    subUnits: [
      {
        label: "Research & Analytics",
        href:  "/what-we-do/evidence/research-analytics",
        activities: {
          health:     ["Public health research", "Health systems analysis", "Applied & mixed-methods research", "Landscape & needs assessments"],
          governance: ["Institutional & governance research", "Public sector analysis", "Political economy analysis", "Landscape assessments"],
          education:  ["Social sector research", "Human development analysis", "Applied social research", "Sector needs assessments"],
          climate:    ["Climate & environmental research", "Agricultural systems analysis", "Applied analytics & data analysis", "Landscape assessments"],
        },
      },
      {
        label: "Evaluation & Learning",
        href:  "/what-we-do/evidence/evaluation-learning",
        activities: {
          health:     ["Health programme evaluation", "MERL system design", "Impact assessment", "Adaptive learning systems"],
          governance: ["Governance programme evaluation", "MERL frameworks", "Institutional impact assessment", "Learning systems"],
          education:  ["Social programme evaluation", "MERL system design", "Impact assessment", "Adaptive learning systems"],
          climate:    ["Climate programme evaluation", "Environmental impact assessment", "MERL frameworks", "Learning systems"],
        },
      },
      {
        label: "Data Quality & Research Integrity",
        href:  "/what-we-do/evidence/data-quality",
        activities: {
          health:     ["Data quality assurance", "Research ethics compliance", "Evidence verification", "Internal peer review"],
          governance: ["Data integrity review", "Research ethics compliance", "Evidence verification", "Quality assurance"],
          education:  ["Data quality assurance", "Research ethics compliance", "Evidence verification", "Internal peer review"],
          climate:    ["Environmental data quality", "Research ethics compliance", "Evidence verification", "Quality control"],
        },
      },
    ],
  },
  {
    num:   "02",
    label: "Policy Development & Advisory",
    short: "Policy",
    href:  "/what-we-do/policy",
    color: "border-brand-teal text-brand-teal",
    bg:    "bg-brand-teal",
    dot:   "bg-brand-teal",
    subUnits: [
      {
        label: "Policy & Strategy Development",
        href:  "/what-we-do/policy/strategy-development",
        activities: {
          health:     ["Health policy development", "Sector strategy design", "Policy modelling & simulation", "Reform programme design", "Policy advisory"],
          governance: ["Public sector policy development", "Governance strategy", "Policy modelling & simulation", "Reform design", "Senior advisory"],
          education:  ["Social sector policy", "Education & social strategy", "Policy modelling & simulation", "Reform programme design", "Policy advisory"],
          climate:    ["Climate & sustainability policy", "Environmental strategy", "Policy modelling & simulation", "Reform programme design", "Policy advisory"],
        },
      },
      {
        label: "Systems Strengthening & Advisory",
        href:  "/what-we-do/policy/systems-strengthening",
        activities: {
          health:     ["Health systems strengthening", "Institutional capacity building", "Governance & accountability", "Embedded advisory"],
          governance: ["Public sector systems strengthening", "Institutional development", "Accountability frameworks", "Governance advisory"],
          education:  ["Social sector systems strengthening", "Institutional capacity", "Accountability frameworks", "Embedded advisory"],
          climate:    ["Environmental systems strengthening", "Institutional capacity", "Accountability frameworks", "Sustainability advisory"],
        },
      },
      {
        label: "Knowledge Translation & Strategic Communications",
        href:  "/what-we-do/policy/knowledge-translation",
        activities: {
          health:     ["Health policy briefs", "Strategic communications", "Stakeholder engagement", "Thought leadership"],
          governance: ["Governance policy briefs", "Reform communications", "Stakeholder engagement", "Thought leadership"],
          education:  ["Social sector policy briefs", "Strategic communications", "Stakeholder engagement", "Knowledge products"],
          climate:    ["Climate policy briefs", "Environmental communications", "Stakeholder engagement", "Thought leadership"],
        },
      },
    ],
  },
  {
    num:   "03",
    label: "Programme Design & Implementation",
    short: "Implementation",
    href:  "/what-we-do/implementation",
    color: "border-brand-green text-brand-green",
    bg:    "bg-brand-green",
    dot:   "bg-brand-green",
    subUnits: [
      {
        label: "Programme Design & Innovation",
        href:  "/what-we-do/implementation/programme-design",
        activities: {
          health:     ["Health programme architecture", "Theory of change development", "Intervention modelling & simulation", "Results framework design", "Financing architecture"],
          governance: ["Governance programme architecture", "Theory of change", "Intervention modelling & simulation", "Results frameworks", "Programme design"],
          education:  ["Social programme architecture", "Theory of change", "Intervention modelling & simulation", "Results framework design", "Programme design"],
          climate:    ["Climate programme architecture", "Theory of change", "Intervention modelling & simulation", "Results frameworks", "Financing architecture"],
        },
      },
      {
        label: "Technical Assistance & Institutional Development",
        href:  "/what-we-do/implementation/technical-assistance",
        activities: {
          health:     ["Embedded health TA", "Institutional development", "Capacity strengthening", "Professional training"],
          governance: ["Embedded governance TA", "Institutional development", "Capacity strengthening", "Executive education"],
          education:  ["Embedded social sector TA", "Institutional development", "Capacity strengthening", "Training programmes"],
          climate:    ["Embedded climate TA", "Institutional development", "Capacity strengthening", "Technical training"],
        },
      },
      {
        label: "Programme Implementation & Adaptive Management",
        href:  "/what-we-do/implementation/adaptive-management",
        activities: {
          health:     ["Health programme delivery", "Adaptive management", "Consortium leadership", "Implementing partner services"],
          governance: ["Governance programme delivery", "Adaptive management", "Consortium leadership", "Implementation management"],
          education:  ["Social programme delivery", "Adaptive management", "Consortium leadership", "Programme management"],
          climate:    ["Climate programme delivery", "Adaptive management", "Consortium leadership", "Programme management"],
        },
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ThematicTabs() {
  const [activeTheme, setActiveTheme] = useState<DomainId>("health");
  const [openPillar,  setOpenPillar]  = useState<number | null>(null);

  const theme = THEMES.find((t) => t.id === activeTheme)!;

  function togglePillar(idx: number) {
    setOpenPillar((prev) => (prev === idx ? null : idx));
  }

  // Reset open pillar when switching themes
  function switchTheme(id: DomainId) {
    setActiveTheme(id);
    setOpenPillar(null);
  }

  return (
    <div>
      {/* 2×2 Tab Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTheme(t.id)}
            className={`text-left px-5 py-4 rounded-xl border-2 font-semibold text-base transition-all duration-200 ${
              activeTheme === t.id
                ? "border-brand-gold bg-brand-gold/5 text-brand-navy"
                : "border-gray-200 bg-white text-brand-muted hover:border-brand-gold/50 hover:text-brand-navy"
            }`}
          >
            <span className={`block text-sm font-bold tracking-widest uppercase mb-1 ${
              activeTheme === t.id ? "text-brand-gold" : "text-gray-400"
            }`}>
              {activeTheme === t.id ? "Active" : "Explore"}
            </span>
            {t.title}
          </button>
        ))}
      </div>

      {/* Active Tab Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Photo */}
        <div className="relative h-56 md:h-64 w-full overflow-hidden">
          <Image
            src={theme.img}
            alt={theme.title}
            fill
            className="object-cover transition-all duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 to-transparent" />
          <div className="absolute bottom-0 left-0 px-6 py-4">
            <h3 className="text-white text-2xl font-bold leading-tight">{theme.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">

          {/* Intro */}
          <p className="text-brand-muted text-base leading-relaxed">{theme.intro}</p>

          {/* Read more */}
          <Link
            href={theme.href}
            className="inline-flex items-center gap-2 text-brand-gold font-semibold text-sm hover:gap-3 transition-all"
          >
            Read more about this thematic area
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Pillar intersection */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-bold text-brand-navy mb-3 uppercase tracking-widest">
              How this theme intersects our pillars:
            </p>

            <div className="flex flex-row gap-2 mb-4">
              {PILLARS.map((p, idx) => (
                <button
                  key={p.num}
                  onClick={() => togglePillar(idx)}
                  className={`flex-1 text-center justify-center px-3 py-2.5 rounded-lg border text-[15px] font-semibold transition-all duration-200 block min-h-[3rem] ${
                    openPillar === idx
                      ? `bg-brand-gold border-brand-gold text-white`
                      : `border-brand-gold text-brand-gold bg-white hover:bg-brand-gold/5`
                  }`}
                >
                  <span className="leading-snug">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Dropdown: sub-units + activities */}
            {openPillar !== null && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden divide-y divide-gray-100">
                {PILLARS[openPillar].subUnits.map((su, si) => (
                  <div key={si} className="px-5 py-4">
                    <Link
                      href={su.href}
                      className={`text-base font-bold hover:underline transition-colors ${PILLARS[openPillar].color.split(" ")[1]}`}
                    >
                      {su.label}
                    </Link>
                    <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                      {su.activities[activeTheme].map((act, ai) => (
                        <li key={ai} className="flex items-start gap-2 text-sm text-brand-muted">
                          <span className={`mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 ${PILLARS[openPillar].dot}`} />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="px-5 py-3 bg-white">
                  <Link
                    href={PILLARS[openPillar].href}
                    className="text-sm font-semibold text-brand-gold hover:underline"
                  >
                    Explore {PILLARS[openPillar].label}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
