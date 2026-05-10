"use client";
import { useState } from "react";
import Link from "next/link";

const PILLARS = [
  {
    id: "evidence",
    num: "01",
    label: "Evidence Generation & Verification",
    short: "Evidence",
    href: "/what-we-do/evidence",
    bg: "bg-brand-navy",
    text: "text-brand-navy",
    border: "border-brand-navy",
    activeBg: "bg-brand-navy/5",
  },
  {
    id: "policy",
    num: "02",
    label: "Policy Development & Advisory",
    short: "Policy",
    href: "/what-we-do/policy",
    bg: "bg-brand-teal",
    text: "text-brand-teal",
    border: "border-brand-teal",
    activeBg: "bg-brand-teal/5",
  },
  {
    id: "implementation",
    num: "03",
    label: "Programme Design & Implementation",
    short: "Implementation",
    href: "/what-we-do/implementation",
    bg: "bg-brand-green",
    text: "text-brand-green",
    border: "border-brand-green",
    activeBg: "bg-brand-green/5",
  },
] as const;

const DOMAINS = [
  { id: "health", label: "Health & Nutrition Systems", href: "/thematic-areas/health" },
  { id: "governance", label: "Governance & Public Sector Reform", href: "/thematic-areas/governance" },
  { id: "education", label: "Human Development & Social Systems", href: "/thematic-areas/education" },
  { id: "climate", label: "Climate, Agriculture & Sustainability", href: "/thematic-areas/climate" },
] as const;

type PillarId = (typeof PILLARS)[number]["id"];
type DomainId = (typeof DOMAINS)[number]["id"];

const MATRIX: Record<PillarId, Record<DomainId, string>> = {
  evidence: {
    health:         "Health financing studies, health information system audits, nutrition research & MERL design",
    governance:     "Political economy analysis, institutional diagnostics, public finance data reviews",
    education:      "Education sector research, social protection evaluations, learning outcome assessments",
    climate:        "Climate policy analysis, agricultural system assessments, resilience & adaptation data",
  },
  policy: {
    health:         "Health financing reform strategy, PHC policy frameworks, subnational health planning",
    governance:     "Public financial management advisory, legislative strengthening, decentralisation reform",
    education:      "Education sector planning, teacher management policy, social protection system design",
    climate:        "Climate policy frameworks, adaptation strategy, climate finance advisory",
  },
  implementation: {
    health:         "Health programme delivery, nutrition initiative implementation, embedded health TA",
    governance:     "Governance reform delivery, ministerial embedded advisory, PFM implementation support",
    education:      "Education programme management, social protection delivery, capacity strengthening",
    climate:        "Climate programme management, resilience initiative delivery, agricultural systems TA",
  },
};

export default function PillarMatrix() {
  const [hoverPillar, setHoverPillar] = useState<PillarId | null>(null);
  const [hoverDomain, setHoverDomain] = useState<DomainId | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead>
          <tr>
            {/* Empty corner cell */}
            <th className="w-48 p-3" />
            {DOMAINS.map((d) => (
              <th
                key={d.id}
                className={`p-3 text-left font-semibold transition-colors duration-150 border-b-2 ${
                  hoverDomain === d.id
                    ? "border-brand-gold text-brand-navy bg-brand-gold/5"
                    : "border-gray-200 text-brand-muted"
                }`}
                onMouseEnter={() => setHoverDomain(d.id)}
                onMouseLeave={() => setHoverDomain(null)}
              >
                <Link href={d.href} className="hover:text-brand-gold transition-colors leading-snug block">
                  {d.label}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PILLARS.map((p) => (
            <tr
              key={p.id}
              className={`transition-colors duration-150 ${hoverPillar === p.id ? p.activeBg : ""}`}
              onMouseEnter={() => setHoverPillar(p.id)}
              onMouseLeave={() => setHoverPillar(null)}
            >
              {/* Pillar row header */}
              <td className="p-3 align-top border-r border-gray-100">
                <Link href={p.href} className="flex items-start gap-2 group">
                  <span className={`shrink-0 mt-0.5 text-[10px] font-bold text-white ${p.bg} px-1.5 py-0.5 rounded`}>
                    {p.num}
                  </span>
                  <span className={`font-semibold leading-snug ${p.text} group-hover:underline`}>
                    {p.label}
                  </span>
                </Link>
              </td>

              {/* Intersection cells */}
              {DOMAINS.map((d) => {
                const isHighlighted = hoverPillar === p.id || hoverDomain === d.id;
                return (
                  <td
                    key={d.id}
                    className={`p-3 align-top border border-gray-100 text-xs leading-relaxed transition-colors duration-150 ${
                      isHighlighted
                        ? `${p.activeBg} text-gray-700`
                        : "text-brand-muted"
                    }`}
                    onMouseEnter={() => { setHoverPillar(p.id); setHoverDomain(d.id); }}
                    onMouseLeave={() => { setHoverPillar(null); setHoverDomain(null); }}
                  >
                    {MATRIX[p.id][d.id]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-brand-muted mt-3 text-center">
        Hover over a pillar or domain to see where they intersect.
      </p>
    </div>
  );
}
