import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Policy, Systems Analysis & Implementation Support | Astellic",
  description:
    "Astellic's Policy, Systems Analysis & Implementation Support pillar: from evidence-grounded policy development to embedded implementation advisory in African institutional contexts.",
};

const subUnits = [
  {
    num: "3.1",
    title: "Policy & Systems Analysis and Development",
    tagline: "Translating evidence into policy frameworks and systems strategies that are technically credible, politically feasible, and institutionally deliverable.",
    desc: "This is one of Astellic's core competencies. We develop national policies, sector strategies, ministerial guidelines, and reform roadmaps, grounded in evidence, informed by political economy analysis, and structured for the institutional realities of African public systems. We do not produce policy documents that sit on shelves. We produce policy frameworks built for implementation, with the analytical depth and contextual grounding to survive contact with reality.",
    services: [
      "National policy and sector strategy development",
      "Political economy analysis: mapping the actors, interests, and dynamics that shape policy outcomes",
      "Health systems analysis and reform design",
      "Public financial management advisory and budget analysis",
      "Evidence-to-policy translation and strategic communication",
      "Systems strengthening diagnostics and reform roadmaps",
      "Ministerial and institutional advisory on governance and regulatory frameworks",
    ],
    href: "/what-we-do/policy/strategy-development",
  },
  {
    num: "3.2",
    title: "Programme Design & Implementation Readiness",
    tagline: "Designing implementation-ready programmes and diagnosing the systemic conditions that determine whether they succeed.",
    desc: "We develop theories of change, results frameworks, operational models, and implementation plans that are simultaneously technically sound and operationally realistic. Our implementation readiness approach identifies design flaws and systemic barriers before programmes launch, when prevention is still possible. A strong programme design, tested for institutional readiness, is the single most powerful predictor of implementation success.",
    services: [
      "Theory of change and results framework development",
      "Programme architecture: operational models, risk frameworks, and financing design",
      "Implementation Readiness Assessment: a diagnostic for systemic barriers before launch",
      "Embedded technical advisory to government ministries and programme management units",
      "Institutional development: governance design, process mapping, performance management",
      "Organisational development support and systems strengthening",
    ],
    href: "/what-we-do/implementation/programme-design",
  },
  {
    num: "3.3",
    title: "Embedded Implementation Support & Adaptive Management",
    tagline: "Staying alongside institutions to strengthen delivery systems and support adaptive programme management.",
    desc: "Astellic provides embedded implementation support, working alongside governments and implementing organisations to strengthen delivery systems, build institutional routines, and apply adaptive management throughout programme cycles. We are not a large-scale direct delivery contractor. We are a specialist advisory firm that stays embedded, bridges the gap between strategy and execution, and ensures that learning from monitoring continuously shapes delivery decisions.",
    services: [
      "Embedded advisory and technical assistance in government ministries and PMUs",
      "Adaptive management support: real-time integration of monitoring data into programme decisions",
      "Delivery diagnostics: identifying and addressing implementation bottlenecks",
      "Consortium technical support and coordination advisory",
      "Institutional capacity building for sustained performance after the engagement ends",
    ],
    href: "/what-we-do/implementation/adaptive-management",
  },
];

const offerings = [
  "Policy and systems analysis and development",
  "Political economy analysis",
  "Theory of change and results framework design",
  "Programme architecture and operational modelling",
  "Implementation Readiness Assessment",
  "Embedded technical assistance to governments",
  "Institutional development and capacity strengthening",
  "Adaptive management and real-time course-correction",
  "Health systems and public financial management advisory",
  "Systems strengthening diagnostics",
];

export default function ImplementationPillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-24 px-6 overflow-hidden" style={{ backgroundColor: "#3B7D23" }}>
        <Image
          src="/images/hero-approach.jpg"
          alt="Policy and implementation support"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-green-100 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-green-300">/</span>
            <span className="text-white/70 text-sm font-semibold">Service 03</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Policy, Systems Analysis<br />& Implementation Support
          </h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            From evidence-grounded policy development to embedded advisory that strengthens delivery systems in practice.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            Strategies look compelling in documents. They fail when they meet institutional
            inertia, unclear accountability, and systems that were never built to execute them.
            We address that gap: through rigorous policy analysis, strong programme design,
            and embedded advisory that stays until strategy works.
          </p>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="bg-brand-light py-12 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-xl text-brand-navy font-medium leading-relaxed border-l-4 border-brand-gold pl-6">
            "Policy and systems analysis is one of Astellic&apos;s strongest capabilities.
            We do not produce policy documents that sit on shelves. We produce policy that is
            grounded in evidence, tested against political economy realities, and structured
            for implementation in the institutional contexts we know well."
          </blockquote>
          <p className="text-brand-muted text-sm mt-3 pl-6">— Astellic operating principle</p>
        </div>
      </section>

      {/* Sub-units */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {subUnits.map((s, si) => (
            <Reveal key={s.num} variant="up" delay={si * 100}>
            <div className="border-l-4 border-brand-green pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-white bg-brand-green px-2 py-0.5 rounded">{s.num}</span>
                <h2 className="text-xl font-bold text-brand-green">{s.title}</h2>
              </div>
              <p className="text-brand-muted italic text-base mb-4">{s.tagline}</p>
              <p className="text-brand-muted leading-relaxed mb-6">{s.desc}</p>
              <div className="bg-brand-light rounded-xl p-5 space-y-2 mb-5">
                <p className="text-sm font-bold text-brand-green uppercase tracking-wide mb-3">Service Offerings</p>
                {s.services.map((svc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    {svc}
                  </div>
                ))}
              </div>
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-brand-green font-semibold text-sm hover:gap-3 transition-all"
              >
                Explore {s.title}
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
            <h2 className="text-2xl font-bold text-brand-navy mb-2 text-center">Full Service Range</h2>
            <p className="text-center text-brand-muted text-sm mb-8 max-w-xl mx-auto">
              The complete menu of analytical and advisory services within this pillar.
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-3">
            {offerings.map((o, i) => (
              <Reveal key={i} variant="up" delay={i * 50}>
              <div className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 text-sm text-brand-muted lift">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-1.5 shrink-0" />
                {o}
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-4">Explore Implementation Readiness Support</h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Whether you need a policy framework developed, a delivery system diagnosed,
              or an embedded advisor to support implementation; tell us what you are working on.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3 rounded transition-colors">
              Discuss Implementation Support
            </Link>
            <Link href="/what-we-do" className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3 rounded transition-colors">
              All Services
            </Link>
          </div>
          </FadeUp>
        </div>
      </section>

      {/* Related pillars */}
      <section className="py-12 px-6 bg-brand-light">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-muted text-sm mb-6">
            Implementation support is grounded in evidence from Pillar 01 and informed
            by the policy analysis we do within this pillar, ensuring every advisory
            decision is analytically rigorous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/evidence" className="bg-brand-navy text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-navy/90 transition-colors">
              Evidence Generation &amp; Verification
            </Link>
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Policy Development &amp; Advisory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
