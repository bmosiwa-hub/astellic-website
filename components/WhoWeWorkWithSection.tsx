"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Problem = {
  challenge: string;
  solutions: [string, string];
};

type Category = {
  id: string;
  title: string;
  summary: string;
  img: string;
  href: string;
  dot: string;
  accentBg: string;
  problems: Problem[];
};

const categories: Category[] = [
  {
    id: "governments",
    title: "Governments & National Ministries",
    summary:
      "Policy intent and delivery reality are rarely the same. We close that gap through implementation readiness assessments, political economy analysis, and embedded advisory that stays until delivery works.",
    img: "/images/hero-approach.jpg",
    href: "/institutions-we-support/governments",
    dot: "bg-brand-gold",
    accentBg: "bg-brand-gold",
    problems: [
      {
        challenge: "Policies that fail at the point of implementation",
        solutions: [
          "Implementation Readiness Assessment before programmes launch",
          "Embedded technical advisory through the full delivery phase",
        ],
      },
      {
        challenge: "Evidence that never reaches the decision-maker",
        solutions: [
          "Evidence translation calibrated to executive and political audiences",
          "Adaptive MERL producing decision-useful intelligence, not compliance data",
        ],
      },
      {
        challenge: "Reforms designed without political economy analysis",
        solutions: [
          "Political economy diagnostics mapping actors, interests, and constraints",
          "Reform sequencing advisory grounded in institutional feasibility",
        ],
      },
      {
        challenge: "Coordination failures across ministries and district systems",
        solutions: [
          "Institutional diagnostic reviews and accountability framework design",
          "Systems strengthening through co-embedded technical assistance",
        ],
      },
    ],
  },
  {
    id: "bilateral-donors",
    title: "Bilateral & Multilateral Donors",
    summary:
      "The gap between programme design and delivery reality erodes accountability and learning. We strengthen implementation realism, evidence integrity, and adaptive management across your portfolio.",
    img: "/images/hero-thematic.jpg",
    href: "/institutions-we-support/bilateral-donors",
    dot: "bg-brand-navy",
    accentBg: "bg-brand-navy",
    problems: [
      {
        challenge: "Programmes designed without testing institutional absorption capacity",
        solutions: [
          "Implementation readiness reviews before commitment and launch",
          "Programme architecture advisory grounded in local institutional realities",
        ],
      },
      {
        challenge: "Monitoring systems that generate data but not decisions",
        solutions: [
          "Adaptive MERL design producing decision-useful evidence in real time",
          "Embedded learning architecture for PMUs and country offices",
        ],
      },
      {
        challenge: "Unreliable programme data undermining accountability and adaptation",
        solutions: [
          "Independent Data Quality Assessments (DQAs) and research integrity reviews",
          "Field verification systems and data governance advisory",
        ],
      },
      {
        challenge: "Evidence generation disconnected from programme course-correction",
        solutions: [
          "Evidence-to-policy translation integrated into programme management cycles",
          "Integrated advisory across evidence, policy, and delivery systems",
        ],
      },
    ],
  },
  {
    id: "ngos-and-partners",
    title: "NGOs & Implementing Partners",
    summary:
      "Implementation effectiveness is not a function of intent. It depends on the quality of programme design, data integrity, and adaptive management capacity. We help implementing organisations strengthen all three.",
    img: "/images/hero-work.jpg",
    href: "/institutions-we-support/ngos-and-partners",
    dot: "bg-brand-teal",
    accentBg: "bg-brand-teal",
    problems: [
      {
        challenge: "M&E designed for donor compliance, not programme learning",
        solutions: [
          "Adaptive learning system redesign generating actionable evidence",
          "Theory of change restructuring aligned to outcomes that matter",
        ],
      },
      {
        challenge: "Delivery systems that cannot adapt to field conditions",
        solutions: [
          "Implementation diagnostics identifying bottlenecks before they compound",
          "Embedded advisory for adaptive management through the delivery cycle",
        ],
      },
      {
        challenge: "Data integrity failures that undermine programme credibility",
        solutions: [
          "Field verification systems and data quality assurance protocols",
          "Research ethics compliance and independent verification frameworks",
        ],
      },
      {
        challenge: "Programme learning that fails to influence policy or sector practice",
        solutions: [
          "Evidence translation converting field learning into actionable policy briefs",
          "Strategic communications and stakeholder engagement for reform environments",
        ],
      },
    ],
  },
  {
    id: "corporations",
    title: "Private Corporations",
    summary:
      "Social investment without governance, measurement, and strategic alignment produces compliance-grade outputs. We build the evidence systems and accountability architecture that institutional credibility demands.",
    img: "/images/thematic-governance.jpg",
    href: "/institutions-we-support/corporations",
    dot: "bg-brand-green",
    accentBg: "bg-brand-green",
    problems: [
      {
        challenge: "CSR programmes without theory of change or results framework",
        solutions: [
          "Social investment strategy design with governance and KPI architecture",
          "Programme design advisory linking investment to measurable institutional outcomes",
        ],
      },
      {
        challenge: "Impact claims that cannot withstand independent scrutiny",
        solutions: [
          "Independent social impact evaluations with defensible methodologies",
          "Impact measurement aligned to GRI, SASB, and institutional investor standards",
        ],
      },
      {
        challenge: "ESG reporting built on narrative rather than evidence",
        solutions: [
          "ESG evidence systems and materiality assessment frameworks",
          "Baseline data architecture for credible international standards disclosure",
        ],
      },
      {
        challenge: "Social investment governed with less rigour than core business",
        solutions: [
          "Social investment governance framework design and accountability structures",
          "Adaptive programme management and results assurance architecture",
        ],
      },
    ],
  },
];

function CategoryCard({
  cat,
  idx,
  isExpanded,
  onToggle,
}: {
  cat: Category;
  idx: number;
  isExpanded: boolean;
  onToggle: (idx: number) => void;
}) {
  return (
    <div
      className={`group rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${
        isExpanded ? "ring-2 ring-brand-gold shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* Photo */}
      <div className="relative h-72 overflow-hidden">
        <Image
          src={cat.img}
          alt={cat.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        <div className={`absolute top-5 left-5 w-2.5 h-2.5 rounded-full ${cat.dot} ring-2 ring-white/25`} />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-bold text-lg leading-tight mb-2">{cat.title}</h3>
          <p className="text-white/75 text-sm leading-relaxed line-clamp-3">{cat.summary}</p>
        </div>
      </div>

      {/* Thin accent bar */}
      <div className={`h-0.5 ${cat.accentBg}`} />

      {/* Buttons */}
      <div className="p-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onToggle(idx)}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all duration-200 ${
            isExpanded
              ? "bg-brand-navy text-white"
              : "bg-brand-light text-brand-navy hover:bg-brand-navy hover:text-white"
          }`}
        >
          {isExpanded ? "Close Panel" : "Explore Challenges & Solutions"}
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Link
          href={cat.href}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded text-sm font-semibold border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
        >
          Read More
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function ExpandPanel({
  cat,
  onClose,
}: {
  cat: Category;
  onClose: () => void;
}) {
  return (
    <div className="bg-[#0c1a35] rounded-2xl overflow-hidden mt-4">
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">
              Challenges &amp; Solutions
            </p>
            <h3 className="text-white font-bold text-xl leading-snug">{cat.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors shrink-0 mt-1 ml-4"
            aria-label="Close panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Column headers — desktop only */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-x-10 mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Challenge</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Astellic&apos;s Response
          </p>
        </div>
        <div className="w-full h-px bg-white/10 mb-2" />

        {/* Rows */}
        <div>
          {cat.problems.map((p, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[1fr_1fr] gap-x-10 gap-y-3 py-5 border-b border-white/10 last:border-0"
            >
              {/* Challenge */}
              <div className="flex items-start gap-3">
                <span className="text-brand-gold font-black text-xs shrink-0 mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-white/90 text-sm font-medium leading-snug">{p.challenge}</p>
              </div>
              {/* Solutions */}
              <div className="space-y-2 pl-6 md:pl-0">
                {p.solutions.map((s, si) => (
                  <div key={si} className="flex items-start gap-2">
                    <span className="text-brand-gold shrink-0 mt-0.5 text-sm">→</span>
                    <p className="text-gray-300 text-sm leading-snug">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors"
          >
            Start a Conversation
          </Link>
          <Link
            href={cat.href}
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors"
          >
            Read the Full Brief
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WhoWeWorkWithSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setExpandedCard((prev) => (prev === idx ? null : idx));
  };

  const topExpanded = expandedCard === 0 || expandedCard === 1 ? expandedCard : null;
  const bottomExpanded = expandedCard === 2 || expandedCard === 3 ? expandedCard : null;

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-3">
            Who We Work With
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Institutions at Every Stage of the Results Chain
          </h2>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you fund, design, or deliver development outcomes, Astellic has a precise
            entry point for you. Select an institution type to explore the challenges we address
            and how we address them.
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.slice(0, 2).map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              idx={i}
              isExpanded={expandedCard === i}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Expand panel — row 1 */}
        {topExpanded !== null && (
          <ExpandPanel
            cat={categories[topExpanded]}
            onClose={() => setExpandedCard(null)}
          />
        )}

        {/* Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {categories.slice(2, 4).map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              idx={i + 2}
              isExpanded={expandedCard === i + 2}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Expand panel — row 2 */}
        {bottomExpanded !== null && (
          <ExpandPanel
            cat={categories[bottomExpanded]}
            onClose={() => setExpandedCard(null)}
          />
        )}
      </div>
    </section>
  );
}
