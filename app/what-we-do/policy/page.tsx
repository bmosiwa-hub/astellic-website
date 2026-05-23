import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Policy | Astellic",
  description:
    "Astellic's Policy pillar: translating evidence into policies, strategies, and systems that are technically credible, politically feasible, and institutionally deliverable.",
};

const subUnits = [
  {
    num: "2.1",
    title: "Policy & Strategy Analysis and Development",
    tagline: "Translating evidence into actionable policy at the highest levels of government and donor engagement.",
    desc: "This sub-unit works at the intersection of technical expertise and political feasibility, supporting ministries in drafting policy, advising donors on programme design, and shaping the strategic intent behind major reform initiatives. We combine national policy and sector strategy development with rigorous systems analysis and political economy work. Every framework, guideline, and reform roadmap we produce is designed to be survived in practice.",
    services: [
      "National policy framework design and sector strategy development",
      "Political economy analysis: mapping actors, interests, and dynamics that shape policy outcomes",
      "Systems analysis and health systems analysis for reform design",
      "Public financial management advisory and budget analysis",
      "Reform roadmaps: from situation analysis through implementation sequencing",
      "Ministerial advisory on governance, regulation, and institutional policy",
      "Evidence-to-policy translation and donor programme design support",
    ],
    href: "/what-we-do/policy/strategy-development",
  },
  {
    num: "2.2",
    title: "Knowledge Translation and Advisory",
    tagline: "Converting evidence into decisions: through communications, advisory, and the institutional capability to act.",
    desc: "In the development sector, the gap between what is known and what is decided is often a communications failure, not an evidence failure. This sub-unit converts technical outputs into policy narratives and engagement strategies that shift understanding at the decision-maker level. It also builds the systems and institutional capacity through which clients can sustain performance beyond the engagement, combining knowledge translation, strategic communications, systems strengthening, and embedded advisory.",
    services: [
      "Knowledge translation: converting research findings into accessible briefs for non-technical audiences",
      "Strategic communications for reform programmes and policy launches",
      "Systems strengthening: governance structures, accountability frameworks, and institutional diagnostics",
      "Capacity development advisory and structured technical assistance",
      "Embedded institutional advisory within government ministries and public bodies",
      "Stakeholder engagement design and narrative development for high-stakes reform environments",
    ],
    href: "/what-we-do/policy/knowledge-translation",
  },
];

const offerings = [
  "National policy framework and sector strategy development",
  "Political economy analysis",
  "Systems analysis and health systems reform design",
  "Senior advisory to government ministries and development partners",
  "Public financial management advisory",
  "Legislative strengthening and governance advisory",
  "Knowledge translation and policy brief production",
  "Strategic communications for reform and institutional change",
  "Systems strengthening and capacity development advisory",
  "Embedded institutional advisory",
];

export default function PolicyPillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-teal text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Policy development and advisory"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-teal-100 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-teal-300">/</span>
            <span className="text-white/70 text-sm font-semibold">Pillar 02</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Policy
          </h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Translating evidence into policies, strategies, and systems that are technically credible, politically feasible, and institutionally deliverable.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            This is where Astellic&apos;s analytical depth meets strategic influence. We convert
            research findings into actionable guidance that accounts for the political economy
            and systemic constraints that determine whether policy intent becomes policy reality.
          </p>
        </div>
      </section>

      {/* Sub-units */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {subUnits.map((s, si) => (
            <Reveal key={s.num} variant="up" delay={si * 100}>
            <div className="border-l-4 border-brand-teal pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-white bg-brand-teal px-2 py-0.5 rounded">{s.num}</span>
                <h2 className="text-xl font-bold text-brand-teal">{s.title}</h2>
              </div>
              <p className="text-brand-muted italic text-base mb-4">{s.tagline}</p>
              <p className="text-brand-muted leading-relaxed mb-6">{s.desc}</p>
              <div className="bg-brand-light rounded-xl p-5 space-y-2 mb-5">
                <p className="text-sm font-bold text-brand-teal uppercase tracking-wide mb-3">Service Offerings</p>
                {s.services.map((svc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    {svc}
                  </div>
                ))}
              </div>
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-brand-teal font-semibold text-sm hover:gap-3 transition-all"
              >
                Learn more about {s.title}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full offerings */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-bold text-brand-navy mb-8 text-center">Policy Pillar: Full Service Range</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-3">
            {offerings.map((o, i) => (
              <Reveal key={i} variant="up" delay={i * 50}>
              <div className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 text-sm text-brand-muted lift">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 shrink-0" />
                {o}
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related pillars */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-xl font-bold text-brand-navy mb-3">Policy advisory works because of evidence, and for delivery.</h2>
            <p className="text-brand-muted mb-8">
              Our policy work is grounded in rigorous evidence from Pillar 01 and designed to be
              deliverable through Pillar 03, ensuring the full results chain holds together.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/evidence" className="bg-brand-navy text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-navy/90 transition-colors">
              Pillar 01: Evidence
            </Link>
            <Link href="/what-we-do/implementation" className="bg-brand-green text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-green/90 transition-colors">
              Pillar 03: Delivery
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
