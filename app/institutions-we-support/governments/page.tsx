import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Governments & National Ministries | Astellic",
  description:
    "Astellic works alongside governments to close the gap between policy intent and delivery reality — through institutional diagnostics, political economy analysis, and embedded advisory.",
};

const strengths = [
  {
    label: "Evidence-Led",
    sub: "Recommendations grounded in what the data actually shows",
  },
  {
    label: "Context-Grounded",
    sub: "Advice built for how African systems actually work",
  },
  {
    label: "Implementation-Focused",
    sub: "We stay engaged through delivery, not just design",
  },
  {
    label: "Politically Aware",
    sub: "Solutions that account for institutional feasibility",
  },
];

const failures = [
  {
    num: "01",
    title: "The Implementation Gap is Structural",
    desc: "Reforms are designed by one set of people and implemented by another, in institutions that had no input into design. By the time strategy reaches district level, its original intent is unrecognisable. Coordination structures are absent. Accountability is unclear. Resources arrive late if at all.",
  },
  {
    num: "02",
    title: "Evidence Doesn’t Travel Upward",
    desc: "Data collection happens. Reports are filed. But the evidence that would improve decisions rarely reaches the people making them. Translation is poor. Briefs are too technical. The political calendar doesn’t align with the evidence calendar.",
  },
  {
    num: "03",
    title: "Political Economy is Treated as Background",
    desc: "Most reform designs acknowledge political economy in a paragraph and then ignore it in execution. Interests are not mapped. Incentive structures are not designed around. Resistance is treated as irrational rather than as information.",
  },
  {
    num: "04",
    title: "Institutional Readiness is Assumed",
    desc: "Launch timelines are set before anyone has assessed whether the institutions responsible for delivery are actually ready. Staffing gaps, procurement constraints, and accountability weaknesses are discovered mid-implementation, when the cost of discovery is highest.",
  },
];

const approach = [
  {
    num: "01",
    title: "Diagnose the System",
    desc: "We begin with a structured assessment of the institutional landscape: mapping delivery actors, accountability structures, political economy dynamics, and capacity constraints. Our diagnostics are designed to identify what will obstruct implementation before it does.",
  },
  {
    num: "02",
    title: "Build Implementation Readiness",
    desc: "Before a programme launches, we work with the responsible institutions to close the gaps our diagnostic surfaces — sequencing milestones, clarifying accountability, and ensuring that the people who will deliver have the tools, authority, and routines to do so.",
  },
  {
    num: "03",
    title: "Stay Through Delivery",
    desc: "We embed advisory presence through the implementation phase, integrating real-time evidence, adjusting for political economy shifts, and building the institutional habits that convert a well-designed reform into a consistently performing system.",
  },
];

const solutions = [
  {
    title: "Policy to Implementation Advisory",
    desc: "Translating sector strategies into operational delivery plans with clear accountability structures, sequenced milestones, and institutional readiness assessments.",
  },
  {
    title: "Political Economy Analysis",
    desc: "Systematic mapping of actors, interests, and systemic constraints that determine whether reform intent becomes reform reality.",
  },
  {
    title: "Evidence Translation for Executives",
    desc: "Converting research findings and programme data into the concise, decision-focused formats that ministerial and cabinet-level stakeholders can act on.",
  },
  {
    title: "Adaptive MERL for Government Systems",
    desc: "Monitoring and evaluation frameworks designed to generate real-time decision intelligence, not retrospective compliance documentation.",
  },
  {
    title: "Institutional Diagnostics",
    desc: "Independent assessment of organisational structures, process gaps, accountability frameworks, and capacity constraints that affect delivery performance.",
  },
  {
    title: "Embedded Technical Advisory",
    desc: "Sustained, in-house advisory presence within ministries and government agencies, providing the expert continuity that periodic consultancies cannot.",
  },
];

const outcomes = [
  {
    title: "Reforms That Reach the District Level Intact",
    desc: "Clear delivery plans, institutional alignment, and embedded advisory ensure that policy intent does not dissolve between design and execution.",
  },
  {
    title: "Evidence That Reaches the Right Desks",
    desc: "Decision intelligence calibrated for executive use — not academic publication — so ministers and senior officials act on what the data shows.",
  },
  {
    title: "Institutions That Can Sustain Performance",
    desc: "We do not build capacity in isolation. We build the routines, accountability structures, and organisational habits that hold performance after we leave.",
  },
  {
    title: "Political Economy Risk Contained, Not Ignored",
    desc: "Reform strategies designed with full awareness of who gains, who loses, and how resistance can be anticipated, managed, and converted into support.",
  },
];

const sectors = [
  "Health",
  "Education & Social Systems",
  "Public Financial Management",
  "Environmental Sustainability",
  "Civil Registration & Statistics",
];

export default function GovernmentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Governments & National Ministries — Astellic"
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
            <span className="text-white/70">Governments &amp; National Ministries</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Governments &amp; National Ministries
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Most policy reforms are well-designed. Most fail during implementation. We help governments
            close the gap between what policy intends and what institutions actually deliver.
          </p>
        </div>
      </section>

      {/* The Governance Reality */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                The Gap Between Policy Intent and Delivery Reality
              </h2>
              <p className="text-brand-muted leading-relaxed mb-5">
                The failure is not in the policy documents. Sector strategies are often technically sound.
                Legislation is drafted with care. Reforms are designed by competent people. The failure
                happens downstream: when reforms meet institutions that were never built to execute them,
                when evidence fails to reach the people who need it, when political economy dynamics stall
                what should be straightforward implementation.
              </p>
              <p className="text-brand-muted leading-relaxed">
                Astellic works alongside governments to address that downstream failure: building
                implementation readiness before programmes launch, embedding technical advisory through
                the delivery phase, and producing evidence that is calibrated for decision-making rather
                than academic publication.
              </p>
            </SlideLeft>
            <SlideRight>
              <div className="grid grid-cols-2 gap-4">
                {strengths.map((s, i) => (
                  <Reveal key={i} variant="up" delay={i * 80}>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <p className="text-brand-gold font-bold text-base mb-1">{s.label}</p>
                      <p className="text-brand-muted text-sm leading-relaxed">{s.sub}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Why Technically Sound Reforms Fail */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                Why Technically Sound Reforms Fail
              </h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                The problems are not technical. They are systemic.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {failures.map((f, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm lift">
                  <span className="inline-block text-xs font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded mb-4 tracking-wider">
                    {f.num}
                  </span>
                  <h3 className="text-lg font-bold text-brand-navy mb-3">{f.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Astellic's Approach */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <blockquote className="border-l-4 border-brand-gold pl-6 text-gray-300 text-xl leading-relaxed italic max-w-3xl mx-auto text-center mb-16">
              &ldquo;We do not hand over a reform roadmap and leave. We stay embedded alongside the
              institutions responsible for delivery, integrating evidence, adjusting for political
              economy, and building the institutional routines that make sustained performance
              possible.&rdquo;
            </blockquote>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {approach.map((a, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="border border-white/10 rounded-2xl p-7 bg-white/5">
                  <span className="text-4xl font-black text-brand-gold/30 block mb-3">{a.num}</span>
                  <h3 className="text-lg font-bold text-white mb-3">{a.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Key Solution Areas */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Where We Work With Governments</h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Six core engagement areas, each targeting a distinct point of failure in the policy-to-delivery chain.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lift">
                  <div className="h-1 bg-brand-gold w-full" />
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

      {/* Expected Outcomes */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                What Governments Gain from Working with Astellic
              </h2>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {outcomes.map((o, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy mb-1.5">{o.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{o.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-14 px-6 bg-brand-light">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <p className="text-xs font-bold text-brand-navy uppercase tracking-widest mb-6">
              Sectors We Cover
            </p>
          </FadeUp>
          <div className="flex flex-wrap justify-center gap-3">
            {sectors.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 50}>
                <span className="bg-white border border-gray-200 text-brand-navy text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                  {s}
                </span>
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
              Work With Astellic on a Government Engagement
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              Whether you are launching a reform, strengthening a ministry&apos;s delivery capacity,
              or building evidence systems that drive real decisions, we have a precise entry point
              for your institution.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Request an Institutional Diagnostic
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Discuss a Policy Engagement
              </Link>
            </div>
            <Link
              href="/what-we-do/evidence"
              className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold hover:gap-3 transition-all"
            >
              See Our Approach
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
