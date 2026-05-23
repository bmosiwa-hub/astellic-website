import type { Metadata } from "next";
import DeliveryIllustration from "@/components/illustrations/DeliveryIllustration";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Delivery | Astellic",
  description:
    "Astellic's Delivery pillar: programme design and readiness advisory, embedded implementation support, and adaptive management across African institutional contexts.",
};

const subUnits = [
  {
    num: "3.1",
    title: "Programme Design and Readiness Assessment",
    tagline: "Supporting and advising on implementation-ready programme architectures, with the design rigour to close the gap between intent and execution.",
    desc: "We support and advise on the design of theories of change, results frameworks, operational models, and implementation plans that are simultaneously technically sound and operationally realistic. Our Implementation Readiness Assessment identifies design weaknesses and systemic barriers before programmes launch, when prevention is still possible. A programme designed for the institutional reality it will meet is a programme that can actually deliver.",
    services: [
      "Theory of change and results framework development",
      "Programme architecture: operational models, risk frameworks, and financing design",
      "Implementation Readiness Assessment: a diagnostic for systemic barriers before launch",
      "Programme design advisory to government ministries and programme management units",
      "Institutional governance design and process mapping",
    ],
    href: "/what-we-do/implementation/programme-design",
  },
  {
    num: "3.2",
    title: "Implementation Support and Adaptive Management",
    tagline: "Staying embedded alongside institutions to strengthen delivery systems, integrate learning, and sustain programme performance.",
    desc: "Astellic provides embedded implementation support and technical assistance, working alongside governments and implementing organisations to strengthen delivery systems, build institutional routines, and apply adaptive management throughout programme cycles. We are a specialist advisory firm: our role is to bridge the gap between strategy and execution, ensure that learning from monitoring continuously shapes delivery decisions, and build the sustained institutional capability that outlasts the engagement.",
    services: [
      "Embedded advisory and technical assistance in government ministries and PMUs",
      "Adaptive management support: real-time integration of monitoring data into programme decisions",
      "Sustained technical assistance to government ministries across programme cycles",
      "Delivery diagnostics: identifying and addressing implementation bottlenecks",
      "Consortium technical support and coordination advisory",
      "Institutional capacity building for sustained performance after the engagement ends",
    ],
    href: "/what-we-do/implementation/adaptive-management",
  },
];

const offerings = [
  "Theory of change and results framework design",
  "Programme architecture and operational modelling",
  "Implementation Readiness Assessment",
  "Programme design advisory to governments and donors",
  "Embedded technical assistance",
  "Adaptive management and real-time course-correction",
  "Sustained government ministry support",
  "Institutional capacity building",
  "Consortium technical support",
  "Delivery diagnostics and implementation bottleneck analysis",
];

export default function ImplementationPillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-24 px-6 overflow-hidden" style={{ backgroundColor: "#3B7D23" }}>
        <DeliveryIllustration className="absolute inset-0 w-full h-full opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-green-100 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-green-300">/</span>
            <span className="text-white/70 text-sm font-semibold">Pillar 03</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Delivery
          </h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            From programme design advisory to embedded implementation support that strengthens delivery systems in practice.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            Strategies look compelling in documents. They fail when they meet institutional
            inertia, unclear accountability, and systems that were never built to execute them.
            We address that gap: through rigorous programme design advisory and embedded support
            that stays until delivery works.
          </p>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="bg-brand-light py-12 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-xl text-brand-navy font-medium leading-relaxed border-l-4 border-brand-gold pl-6">
            "We support and advise on programme design and delivery, not direct implementation at scale.
            Our value is the rigour we bring to design and the institutional intelligence we embed
            throughout delivery, ensuring that what is planned is what gets delivered."
          </blockquote>
          <p className="text-brand-muted text-sm mt-3 pl-6">Astellic operating principle</p>
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
              The complete menu of advisory and delivery support services within this pillar.
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
            <h2 className="text-2xl font-bold mb-4">Explore Delivery Advisory Support</h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Whether you need a programme designed for delivery, a readiness assessment before launch,
              or an embedded advisor to support implementation, tell us what you are working on.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3 rounded transition-colors">
              Discuss Delivery Support
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
            Delivery support is grounded in evidence from Pillar 01 and informed
            by the policy advisory in Pillar 02, ensuring every programme decision
            is analytically rigorous and policy-aligned.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/evidence" className="bg-brand-navy text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-navy/90 transition-colors">
              Pillar 01: Evidence
            </Link>
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Pillar 02: Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
