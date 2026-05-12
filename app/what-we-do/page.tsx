import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PillarMatrix from "@/components/PillarMatrix";

export const metadata: Metadata = {
  title: "What We Do | Astellic",
  description:
    "Astellic's three-pillar integrated delivery architecture — Evidence Generation, Policy Development & Advisory, and Programme Design & Implementation — operating across four thematic domains.",
};

const pillars = [
  {
    num: "01",
    title: "Evidence Generation & Verification",
    tagline: "Producing the rigorous, context-grounded intelligence that drives policy and programme decisions.",
    desc: "This pillar is Astellic's analytical engine. It generates the empirical foundation upon which sound policy is designed and effective programmes are built. The evidence we produce is policy-relevant by design, contextually grounded by discipline, and verified for integrity before it reaches any client or partner.",
    href: "/what-we-do/evidence",
    bgClass: "bg-brand-navy",
    borderClass: "border-brand-navy",
    textClass: "text-brand-navy",
    subUnits: [
      {
        label: "Research & Analytics",
        desc: "Primary research, political economy analysis, health financing studies, and applied analytics calibrated for decision-makers.",
        href: "/what-we-do/evidence/research-analytics",
      },
      {
        label: "Evaluation & Learning",
        desc: "Independent programme evaluation, real-time learning systems, and MERL framework architecture for donor and government programmes.",
        href: "/what-we-do/evidence/evaluation-learning",
      },
      {
        label: "Data Quality & Research Integrity",
        desc: "Data quality assurance, research ethics compliance, and peer review — ensuring every output meets the highest methodological standards.",
        href: "/what-we-do/evidence/data-quality",
      },
    ],
  },
  {
    num: "02",
    title: "Policy Development & Advisory",
    tagline: "Translating evidence into policies, strategies, and systems that are technically credible, politically feasible, and institutionally deliverable.",
    desc: "This pillar is where Astellic's analytical depth meets strategic influence. It converts research findings into actionable policy frameworks, reform strategies, and institutional advisory — delivered not as generic recommendations, but as contextually informed guidance that accounts for the political economy and systemic constraints that determine whether policy intent becomes policy reality.",
    href: "/what-we-do/policy",
    bgClass: "bg-brand-teal",
    borderClass: "border-brand-teal",
    textClass: "text-brand-teal",
    subUnits: [
      {
        label: "Policy & Strategy Development",
        desc: "National policies, sector strategies, ministerial guidelines, and reform roadmaps — grounded in evidence, aligned with political realities, structured for implementation.",
        href: "/what-we-do/policy/strategy-development",
      },
      {
        label: "Systems Strengthening & Advisory",
        desc: "Embedded institutional development — building enduring capacity, systems, and governance structures within governments and public institutions.",
        href: "/what-we-do/policy/systems-strengthening",
      },
      {
        label: "Knowledge Translation & Strategic Communications",
        desc: "Converting technical outputs into policy narratives and engagement strategies that shift understanding and catalyse action at the decision-maker level.",
        href: "/what-we-do/policy/knowledge-translation",
      },
    ],
  },
  {
    num: "03",
    title: "Programme Design & Implementation",
    tagline: "Designing and delivering programmes that work — not on paper, but in the institutional realities of African public systems.",
    desc: "This pillar is where Astellic's analysis becomes action. It encompasses the design of implementation-ready interventions and the hands-on delivery of programmes — with adaptive management systems to course-correct in real time. We do not hand over a report and leave. We stay to ensure the strategy works.",
    href: "/what-we-do/implementation",
    bgClass: "bg-brand-green",
    borderClass: "border-brand-green",
    textClass: "text-brand-green",
    subUnits: [
      {
        label: "Programme Design & Innovation",
        desc: "Theories of change, results frameworks, and operational models — simultaneously technically sound and operationally realistic, with an innovation lens.",
        href: "/what-we-do/implementation/programme-design",
      },
      {
        label: "Technical Assistance & Institutional Development",
        desc: "Sustained, embedded advisory — deploying senior technical advisors within client institutions to build knowledge and institutional routines that outlast the engagement.",
        href: "/what-we-do/implementation/technical-assistance",
      },
      {
        label: "Programme Implementation & Adaptive Management",
        desc: "End-to-end programme management and direct delivery — applying adaptive management to ensure real-time learning continuously shapes implementation decisions.",
        href: "/what-we-do/implementation/adaptive-management",
      },
    ],
  },
];

const domains = [
  {
    title: "Health & Nutrition Systems",
    desc: "From primary health care financing and service delivery to subnational health planning and nutrition programme design — grounded in political economy and fiscal realism.",
    href: "/thematic-areas/health",
  },
  {
    title: "Governance & Public Sector Reform",
    desc: "Public financial management, fiscal decentralisation, legislative strengthening, anti-corruption systems, and intergovernmental relations — approached as a political economy challenge.",
    href: "/thematic-areas/governance",
  },
  {
    title: "Human Development & Social Systems",
    desc: "Education sector planning, teacher management systems, social protection design and monitoring — closing the gap between policy intent and service delivery outcomes.",
    href: "/thematic-areas/education",
  },
  {
    title: "Climate, Agriculture & Sustainability",
    desc: "Climate policy analysis, adaptation programme design, agricultural systems strengthening, and resilience monitoring — grounded in the understanding that climate action is a governance challenge.",
    href: "/thematic-areas/climate",
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic integrated delivery"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <span className="text-3xl font-bold text-brand-gold mb-4 block">What We Do</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Three Pillars. Four Domains.<br />One Integrated System.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic&apos;s organisational architecture is structured around three functional
            pillars that operate in deliberate sequence and mutual reinforcement —
            constituting a complete, end-to-end institutional delivery capability from
            evidence through to implementation.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {pillars.map((p, i) => (
            <div
              key={p.num}
              className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 items-start`}
            >
              {/* Pillar label block */}
              <div className="md:w-56 shrink-0">
                <div className={`inline-flex items-center gap-2 mb-4`}>
                  <span className={`text-sm font-bold text-white ${p.bgClass} px-2 py-1 rounded`}>{p.num}</span>
                  <span className="text-sm font-bold text-brand-muted uppercase tracking-wide">Pillar</span>
                </div>
                <h2 className={`text-2xl font-bold ${p.textClass} leading-snug mb-3`}>{p.title}</h2>
                <Link
                  href={p.href}
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${p.textClass} hover:gap-3 transition-all`}
                >
                  Explore pillar
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Content */}
              <div className={`flex-1 border-l-4 ${p.borderClass} pl-8`}>
                <p className="text-brand-muted italic text-base mb-3">{p.tagline}</p>
                <p className="text-brand-muted leading-relaxed mb-8">{p.desc}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {p.subUnits.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="group bg-brand-light rounded-xl p-5 hover:shadow-sm transition-shadow"
                    >
                      <h3 className={`font-bold text-base mb-2 ${p.textClass} group-hover:underline`}>{s.label}</h3>
                      <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Flywheel */}
      <section className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-3xl font-bold text-brand-gold mb-4 block">The Delivery Flywheel</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Three pillars. One continuous system.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            The three pillars function as a self-reinforcing delivery system.
            Programme implementation generates learning that feeds evidence generation.
            Evidence informs policy advisory. Policy advisory shapes programme design.
            Better design drives better implementation — and the cycle deepens.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { num: "01", label: "Evidence", sub: "Research → insight → intelligence" },
              { num: "02", label: "Policy", sub: "Strategy → reform → advisory" },
              { num: "03", label: "Delivery", sub: "Design → implement → adapt" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex flex-col items-center justify-center mx-auto mb-2">
                    <span className="text-brand-gold text-sm font-bold">{step.num}</span>
                    <span className="text-white font-bold text-sm">{step.label}</span>
                  </div>
                  <p className="text-gray-300 text-sm max-w-[100px] mx-auto">{step.sub}</p>
                </div>
                {i < 2 && (
                  <svg className="w-6 h-6 text-brand-gold shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
            {/* Loop arrow */}
            <div className="hidden md:flex items-center gap-4">
              <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-brand-gold font-bold tracking-wide">↺ loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Thematic Domains */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <span className="text-3xl font-bold text-brand-gold mb-4 block text-center">Thematic Domains</span>
          <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
            The Lens Through Which the Pillars Operate
          </h2>
          <p className="text-center text-brand-muted text-lg max-w-3xl mx-auto mb-14">
            Astellic&apos;s four thematic domains cut horizontally across all three pillars —
            ensuring functional expertise is always deployed with deep sector knowledge
            and political economy awareness.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {domains.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-1 bg-brand-gold rounded mb-4" />
                <h3 className="font-bold text-brand-navy mb-2 group-hover:text-brand-gold transition-colors">{d.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{d.desc}</p>
              </Link>
            ))}
          </div>

          {/* Interactive Matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-brand-navy mb-1">Pillar × Domain Matrix</h3>
            <p className="text-sm text-brand-muted mb-6">
              How Astellic&apos;s three pillars activate within each thematic domain.
            </p>
            <PillarMatrix />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            Ready to work with us?
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            Whether you need rigorous evidence, strategic advisory, or full programme
            delivery — Astellic brings the integrated capability to deliver across the full results chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-base transition-colors">
              Start a Conversation
            </Link>
            <Link href="/our-projects" className="bg-brand-navy text-white px-8 py-3 rounded font-medium text-base hover:bg-brand-navy/90 transition-colors">
              See Our Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
