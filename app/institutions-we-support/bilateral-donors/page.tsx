import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Bilateral & Multilateral Donors | Astellic",
  description:
    "Astellic helps bilateral and multilateral donors build the learning architecture, evidence integrity, and implementation realism their portfolios need to close the gap between programme design and delivery.",
};

const differentiators = [
  {
    dot: "bg-brand-teal",
    label: "Implementation Realism",
    sub: "Design assumptions tested against institutional and political reality",
  },
  {
    dot: "bg-brand-teal",
    label: "Adaptive MERL",
    sub: "Evidence systems built for course-correction, not compliance documentation",
  },
  {
    dot: "bg-brand-teal",
    label: "Evidence Integrity",
    sub: "Data you can trust because verification is embedded, not optional",
  },
  {
    dot: "bg-brand-teal",
    label: "Independent DQA",
    sub: "Rigorous data quality assessments that surface what reporting systems conceal",
  },
  {
    dot: "bg-brand-teal",
    label: "Portfolio Strengthening",
    sub: "Cross-programme learning architecture that compounds value across your portfolio",
  },
];

const patterns = [
  {
    num: "01",
    title: "Programmes Designed Without Testing Absorption Capacity",
    desc: "Theories of change assume that implementing partners and government counterparts have the institutional capacity to absorb and execute. That assumption is rarely tested before commitment is made. The result is consistent underperformance at the delivery level, attributed to implementation rather than design.",
  },
  {
    num: "02",
    title: "Monitoring Systems Built for Reporting, Not Learning",
    desc: "Results frameworks are constructed to satisfy accountability requirements rather than generate decision intelligence. Data flows upward to satisfy donor reporting cycles. It rarely flows back to the people who could use it to adjust. Programmes run on evidence that is months old by the time it is acted on.",
  },
  {
    num: "03",
    title: "Programme Data That Cannot Be Trusted",
    desc: "Field data collection is subject to social desirability bias, enumerator inconsistency, and incentive structures that reward reported results over accurate ones. Without independent verification, the data that informs major portfolio decisions may not reflect what is happening on the ground.",
  },
  {
    num: "04",
    title: "Evidence That Doesn&apos;t Drive Adaptation",
    desc: "Even where good data exists, the systems to translate it into programme adjustments are absent. Learning reviews happen once a year. Findings sit in reports. The feedback loop between evidence and decision is too slow, too long, and too bureaucratic to enable genuine adaptive management.",
  },
];

const evidenceServices = [
  "Independent data quality assessments across implementing partners",
  "Research ethics and integrity compliance reviews",
  "Verification of reported results against primary field data",
  "Data system audits for national and sub-national programmes",
];

const adaptiveServices = [
  "Real-time MERL system design and implementation",
  "Learning architecture across multi-partner portfolios",
  "Adaptive management framework development",
  "Evidence-to-decision cycle acceleration",
];

const implementationServices = [
  "Pre-launch implementation readiness reviews",
  "Political economy analysis for programme design",
  "Institutional absorption capacity assessments",
  "Mid-implementation diagnostic reviews",
];

const serviceSolutions = [
  {
    title: "Implementation Readiness Reviews",
    desc: "Structured pre-launch assessments of whether implementing institutions have the capacity, accountability structures, and political conditions to deliver what the programme intends. Conducted before commitments are finalised.",
  },
  {
    title: "Adaptive MERL System Design",
    desc: "End-to-end design of monitoring, evaluation, research, and learning systems calibrated for adaptive management — generating decision intelligence in time to use it, not after the window has closed.",
  },
  {
    title: "Independent Data Quality Assessments",
    desc: "Rigorous, independent verification of programme data against primary sources, surfacing the inconsistencies, gaps, and incentive-driven distortions that internal monitoring systems are structurally unable to detect.",
  },
  {
    title: "Research Integrity Assessments",
    desc: "Systematic review of evaluation design, data collection protocols, analytical methodology, and reporting integrity — ensuring that the evidence your portfolio relies on meets the standards you report against.",
  },
  {
    title: "Evidence-to-Policy Translation",
    desc: "Converting programme evidence and evaluation findings into the decision-focused formats that allow senior donor officials, government counterparts, and portfolio managers to act with confidence.",
  },
  {
    title: "Programme Architecture Advisory",
    desc: "Strategic review of programme design assumptions, results chain logic, partner selection rationale, and implementation architecture — with recommendations grounded in what the evidence and political economy actually support.",
  },
];

const engagementSteps = [
  {
    num: "01",
    title: "Portfolio Assessment",
    desc: "We begin with a structured assessment of your portfolio&apos;s evidence architecture, implementation assumptions, and learning systems — identifying where the gap between design and delivery is widest and where intervention will have the most leverage.",
  },
  {
    num: "02",
    title: "System Design",
    desc: "We design or redesign the MERL systems, data verification protocols, and learning architecture your portfolio needs — built for the institutional context in which your programmes operate, not a generic results framework template.",
  },
  {
    num: "03",
    title: "Embedded Advisory",
    desc: "We embed advisory presence at the programme or portfolio level through implementation, providing the sustained technical continuity that periodic reviews cannot. Our advisors are inside the system when decisions are made.",
  },
  {
    num: "04",
    title: "Learning Integration",
    desc: "We build the mechanisms that translate evidence into programme adjustments — closing the gap between what monitoring surfaces and what management acts on, across the full portfolio lifecycle.",
  },
];

export default function BilateralDonorsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Bilateral & Multilateral Donors — Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-5 text-sm">
            <Link
              href="/institutions-we-support"
              className="text-brand-gold hover:text-white transition-colors font-medium"
            >
              Institutions We Support
            </Link>
            <span className="text-white/40">›</span>
            <span className="text-white/70">Bilateral &amp; Multilateral Donors</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Bilateral &amp; Multilateral Donors
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Programme design and delivery reality are rarely the same. We help donors build the
            learning architecture, evidence integrity, and implementation realism their portfolios
            need to close that gap.
          </p>
        </div>
      </section>

      {/* The Donor Challenge */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                The Gap Between Programme Design and Programme Delivery
              </h2>
              <p className="text-brand-muted leading-relaxed mb-5">
                Donors invest substantial resources in programme design. Theories of change are
                developed. Results frameworks are built. Implementation partners are selected with
                care. And yet, a consistent pattern emerges: programmes underperform not because of
                poor intent or insufficient funding, but because design assumptions about
                institutional capacity, political economy, and learning systems are not tested against
                reality.
              </p>
              <p className="text-brand-muted leading-relaxed">
                The monitoring data that arrives is often unreliable. Course-correction decisions are
                made late, if at all. Evidence systems are built for accountability reporting rather
                than adaptive management. Astellic exists to address these systemic gaps: as a
                strategic implementation and learning partner, not a contractor.
              </p>
            </SlideLeft>
            <SlideRight>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <p className="text-xs font-bold text-brand-navy uppercase tracking-widest mb-6">
                  The Astellic Difference
                </p>
                <div className="space-y-5">
                  {differentiators.map((d, i) => (
                    <Reveal key={i} variant="up" delay={i * 60}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full ${d.dot} mt-1.5 shrink-0`} />
                        <div>
                          <p className="text-brand-navy font-semibold text-sm">{d.label}</p>
                          <p className="text-brand-muted text-sm leading-relaxed">{d.sub}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Four Patterns We Address */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                What Consistently Undermines Donor Programmes
              </h2>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {patterns.map((p, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm lift">
                  <span className="inline-block text-xs font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded mb-4 tracking-wider">
                    {p.num}
                  </span>
                  <h3 className="text-base font-bold text-brand-navy mb-3">{p.title}</h3>
                  <p
                    className="text-brand-muted text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: p.desc }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How Astellic Positions With Donors */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <blockquote className="border-l-4 border-brand-gold pl-6 text-gray-300 text-xl leading-relaxed italic max-w-3xl mx-auto text-center mb-16">
              &ldquo;We are not a monitoring contractor. We are a strategic partner that strengthens
              the evidence architecture, adaptive learning systems, and implementation realism that
              make donor investments deliver what they promised.&rdquo;
            </blockquote>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal variant="up" delay={0}>
              <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
                <h3 className="text-brand-gold font-bold text-base mb-4">Evidence Integrity</h3>
                <ul className="space-y-2">
                  {evidenceServices.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal variant="up" delay={80}>
              <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
                <h3 className="text-brand-gold font-bold text-base mb-4">Adaptive Management</h3>
                <ul className="space-y-2">
                  {adaptiveServices.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal variant="up" delay={160}>
              <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
                <h3 className="text-brand-gold font-bold text-base mb-4">Implementation Intelligence</h3>
                <ul className="space-y-2">
                  {implementationServices.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Solution Areas */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Our Service Areas</h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Six engagement types, each addressing a distinct failure point in donor portfolio performance.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceSolutions.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lift">
                  <div className="h-1 bg-brand-navy w-full" />
                  <div className="p-7">
                    <h3 className="text-base font-bold text-brand-navy mb-3">{s.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How We Engage */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">How We Engage</h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                A structured process that moves from portfolio diagnosis to sustained delivery intelligence.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementSteps.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="relative">
                  <span className="text-5xl font-black text-brand-navy/10 block mb-3">{s.num}</span>
                  <h3 className="text-base font-bold text-brand-navy mb-2">{s.title}</h3>
                  <p
                    className="text-brand-muted text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: s.desc }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold mb-5">
              Strengthen Your Portfolio&apos;s Evidence and Delivery Architecture
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              Whether you are commissioning a data quality assessment, redesigning a learning system,
              or building implementation realism into a new programme cycle, we have a precise entry
              point for your portfolio.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Request an Implementation Readiness Review
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Discuss Portfolio Advisory
              </Link>
            </div>
            <Link
              href="/what-we-do/evidence"
              className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold hover:gap-3 transition-all"
            >
              Read about our Evidence Pillar
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
