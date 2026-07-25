"use client";
import { useState } from "react";
import Link from "next/link";

type DomainId = "health" | "climate" | "education";

const DOMAINS = [
  { id: "health"    as DomainId, label: "Health",                       href: "/thematic-areas/health" },
  { id: "climate"   as DomainId, label: "Environmental Sustainability", href: "/thematic-areas/climate" },
  { id: "education" as DomainId, label: "Social Development",           href: "/thematic-areas/education" },
];

interface SubUnit {
  id: string;
  label: string;
  href: string;
  activities: Record<DomainId, string[]>;
}

interface Pillar {
  num: string;
  label: string;
  href: string;
  bg: string;
  text: string;
  activeBg: string;
  headerBg: string;
  subUnits: SubUnit[];
}

const PILLARS: Pillar[] = [
  {
    num:      "01",
    label:    "Evidence Generation & Verification",
    href:     "/what-we-do/evidence",
    bg:       "bg-brand-navy",
    text:     "text-brand-navy",
    activeBg: "bg-brand-navy/5",
    headerBg: "bg-brand-navy",
    subUnits: [
      {
        id:    "research",
        label: "Research & Analytics",
        href:  "/what-we-do/evidence/research-analytics",
        activities: {
          health:     ["Public health research", "Health systems analysis", "Applied & mixed-methods research", "Landscape & needs assessments"],
          education:  ["Social sector research", "Human development analysis", "Applied social research", "Sector needs assessments"],
          climate:    ["Climate & environmental research", "Agricultural systems analysis", "Applied analytics & data analysis", "Landscape assessments"],
        },
      },
      {
        id:    "evaluation",
        label: "Evaluation & Learning",
        href:  "/what-we-do/evidence/evaluation-learning",
        activities: {
          health:     ["Health programme evaluation", "MERL system design", "Impact assessment", "Adaptive learning systems"],
          education:  ["Social programme evaluation", "MERL system design", "Impact assessment", "Adaptive learning systems"],
          climate:    ["Climate programme evaluation", "Environmental impact assessment", "MERL frameworks", "Learning systems"],
        },
      },
      {
        id:    "data-quality",
        label: "Data Quality & Research Integrity",
        href:  "/what-we-do/evidence/data-quality",
        activities: {
          health:     ["Data quality assurance", "Research ethics compliance", "Evidence verification", "Internal peer review"],
          education:  ["Data quality assurance", "Research ethics compliance", "Evidence verification", "Internal peer review"],
          climate:    ["Environmental data quality", "Research ethics compliance", "Evidence verification", "Quality control"],
        },
      },
    ],
  },
  {
    num:      "02",
    label:    "Policy Development & Advisory",
    href:     "/what-we-do/policy",
    bg:       "bg-brand-teal",
    text:     "text-brand-teal",
    activeBg: "bg-brand-teal/5",
    headerBg: "bg-brand-teal",
    subUnits: [
      {
        id:    "strategy",
        label: "Policy & Strategy Development",
        href:  "/what-we-do/policy/strategy-development",
        activities: {
          health:     ["Health policy development", "Sector strategy design", "Reform programme design", "Policy advisory"],
          education:  ["Social sector policy", "Education & social strategy", "Reform programme design", "Policy advisory"],
          climate:    ["Climate & sustainability policy", "Environmental strategy", "Reform programme design", "Policy advisory"],
        },
      },
      {
        id:    "modelling",
        label: "Policy Modelling & Simulation",
        href:  "/what-we-do/policy/policy-modelling-and-simulation",
        activities: {
          health:     ["Health policy modelling", "Disease burden simulation", "Health financing scenarios", "Health impact forecasting"],
          education:  ["Education policy modelling", "Sector simulation", "Education financing scenarios", "Social impact forecasting"],
          climate:    ["Climate policy modelling", "Environmental simulation", "Climate scenario analysis", "Sustainability forecasting"],
        },
      },
      {
        id:    "systems",
        label: "Systems Strengthening & Advisory",
        href:  "/what-we-do/policy/systems-strengthening",
        activities: {
          health:     ["Health systems strengthening", "Institutional capacity building", "Governance & accountability", "Embedded advisory"],
          education:  ["Social sector systems strengthening", "Institutional capacity", "Accountability frameworks", "Embedded advisory"],
          climate:    ["Environmental systems strengthening", "Institutional capacity", "Accountability frameworks", "Sustainability advisory"],
        },
      },
      {
        id:    "knowledge",
        label: "Knowledge Translation & Strategic Communications",
        href:  "/what-we-do/policy/knowledge-translation",
        activities: {
          health:     ["Health policy briefs", "Strategic communications", "Stakeholder engagement", "Thought leadership"],
          education:  ["Social sector policy briefs", "Strategic communications", "Stakeholder engagement", "Knowledge products"],
          climate:    ["Climate policy briefs", "Environmental communications", "Stakeholder engagement", "Thought leadership"],
        },
      },
    ],
  },
  {
    num:      "03",
    label:    "Policy, Systems Analysis & Implementation Support",
    href:     "/what-we-do/implementation",
    bg:       "bg-brand-green",
    text:     "text-brand-green",
    activeBg: "bg-brand-green/5",
    headerBg: "bg-brand-green",
    subUnits: [
      {
        id:    "design",
        label: "Programme Design & Innovation",
        href:  "/what-we-do/implementation/programme-design",
        activities: {
          health:     ["Health programme architecture", "Theory of change development", "Intervention modelling & simulation", "Results framework design", "Financing architecture"],
          education:  ["Social programme architecture", "Theory of change", "Intervention modelling & simulation", "Results framework design", "Programme design"],
          climate:    ["Climate programme architecture", "Theory of change", "Intervention modelling & simulation", "Results frameworks", "Financing architecture"],
        },
      },
      {
        id:    "ta",
        label: "Technical Assistance & Institutional Development",
        href:  "/what-we-do/implementation/technical-assistance",
        activities: {
          health:     ["Embedded health TA", "Institutional development", "Capacity strengthening", "Professional training"],
          education:  ["Embedded social sector TA", "Institutional development", "Capacity strengthening", "Training programmes"],
          climate:    ["Embedded climate TA", "Institutional development", "Capacity strengthening", "Technical training"],
        },
      },
      {
        id:    "delivery",
        label: "Programme Implementation & Adaptive Management",
        href:  "/what-we-do/implementation/adaptive-management",
        activities: {
          health:     ["Health programme delivery", "Adaptive management", "Consortium leadership", "Implementing partner services"],
          education:  ["Social programme delivery", "Adaptive management", "Consortium leadership", "Programme management"],
          climate:    ["Climate programme delivery", "Adaptive management", "Consortium leadership", "Programme management"],
        },
      },
    ],
  },
];

export default function PillarMatrix() {
  const [hoverPillarIdx, setHoverPillarIdx] = useState<number | null>(null);
  const [hoverSubUnitId, setHoverSubUnitId] = useState<string | null>(null);
  const [hoverDomainId, setHoverDomainId]   = useState<DomainId | null>(null);

  function isRowHighlighted(pillarIdx: number, subUnitId: string) {
    return hoverPillarIdx === pillarIdx || hoverSubUnitId === subUnitId;
  }

  function isCellHighlighted(pillarIdx: number, subUnitId: string, domainId: DomainId) {
    return isRowHighlighted(pillarIdx, subUnitId) || hoverDomainId === domainId;
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="border-collapse text-xs"
        style={{ minWidth: 900 }}
      >
        <thead>
          <tr>
            {/* Pillar header */}
            <th className="w-20 border border-gray-200 bg-gray-50 p-2 text-left text-[12px] font-bold text-brand-muted uppercase tracking-wide">
              Pillar
            </th>
            {/* Sub-unit header */}
            <th className="w-40 border border-gray-200 bg-gray-50 p-2 text-left text-[12px] font-bold text-brand-muted uppercase tracking-wide">
              Sub-unit
            </th>
            {/* Domain headers */}
            {DOMAINS.map((d) => (
              <th
                key={d.id}
                className={`border p-2 text-left align-top font-semibold transition-colors duration-150 cursor-pointer ${
                  hoverDomainId === d.id
                    ? "bg-brand-gold/10 border-brand-gold text-brand-navy"
                    : "bg-gray-50 border-gray-200 text-brand-muted"
                }`}
                style={{ width: "17%" }}
                onMouseEnter={() => setHoverDomainId(d.id)}
                onMouseLeave={() => setHoverDomainId(null)}
              >
                <Link
                  href={d.href}
                  className="hover:text-brand-gold transition-colors leading-snug block text-[13px]"
                >
                  {d.label}
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {PILLARS.map((pillar, pi) =>
            pillar.subUnits.map((su, si) => {
              const isFirstRow = si === 0;
              const rowHl      = isRowHighlighted(pi, su.id);

              return (
                <tr
                  key={su.id}
                  className="transition-colors duration-150"
                  onMouseEnter={() => { setHoverPillarIdx(pi); setHoverSubUnitId(su.id); }}
                  onMouseLeave={() => { setHoverPillarIdx(null); setHoverSubUnitId(null); }}
                >
                  {/* Pillar cell — only rendered on first sub-unit row */}
                  {isFirstRow && (
                    <td
                      rowSpan={pillar.subUnits.length}
                      className={`border border-gray-200 p-0 align-middle text-center ${pillar.headerBg} transition-colors duration-150`}
                      style={{ width: 80 }}
                    >
                      <Link
                        href={pillar.href}
                        className="flex flex-col items-center justify-center gap-1.5 h-full py-4 px-2 group"
                      >
                        <span className="text-[12px] font-bold text-white/60 tracking-widest">{pillar.num}</span>
                        <span
                          className="text-white font-bold text-[12px] leading-snug tracking-wide group-hover:underline text-center"
                          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}
                        >
                          {pillar.label}
                        </span>
                      </Link>
                    </td>
                  )}

                  {/* Sub-unit cell */}
                  <td
                    className={`border border-gray-200 p-2.5 align-top transition-colors duration-150 ${
                      rowHl ? pillar.activeBg : "bg-white"
                    }`}
                  >
                    <Link
                      href={su.href}
                      className={`text-[13px] font-semibold leading-snug hover:underline transition-colors ${pillar.text}`}
                    >
                      {su.label}
                    </Link>
                  </td>

                  {/* Activity cells — one per domain */}
                  {DOMAINS.map((d) => {
                    const cellHl = isCellHighlighted(pi, su.id, d.id);
                    return (
                      <td
                        key={d.id}
                        className={`border border-gray-100 p-2.5 align-top transition-colors duration-150 ${
                          cellHl ? pillar.activeBg : "bg-white"
                        }`}
                        onMouseEnter={() => { setHoverPillarIdx(pi); setHoverSubUnitId(su.id); setHoverDomainId(d.id); }}
                        onMouseLeave={() => { setHoverDomainId(null); }}
                      >
                        <ul className="space-y-1">
                          {su.activities[d.id].map((act, ai) => (
                            <li
                              key={ai}
                              className={`flex items-start gap-1.5 text-[13px] leading-snug transition-colors ${
                                cellHl ? "text-gray-700" : "text-brand-muted"
                              }`}
                            >
                              <span className={`mt-[4px] w-1 h-1 rounded-full shrink-0 ${cellHl ? pillar.bg : "bg-gray-300"}`} />
                              {act}
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <p className="text-[13px] text-brand-muted mt-3 text-center">
        Hover over a pillar, sub-unit, or thematic domain to highlight intersections.
      </p>
    </div>
  );
}
