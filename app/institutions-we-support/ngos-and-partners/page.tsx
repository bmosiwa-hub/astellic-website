import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "NGOs & Implementing Partners | Astellic",
  description:
    "Astellic helps NGOs and implementing partners build the programme design, data reliability, and adaptive management systems that turn delivery intent into measurable results.",
};

const differenceItems = [
  {
    label: "Design",
    sub: "Theories of change and delivery architectures built for how your systems actually work",
  },
  {
    label: "Monitor",
    sub: "Data systems that produce reliable intelligence, not just indicator counts",
  },
  {
    label: "Learn",
    sub: "Real-time evidence flows that surface what is working before the evaluation does",
  },
  {
    label: "Adapt",
    sub: "Structured mechanisms for turning evidence into programme adjustments",
  },
  {
    label: "Strengthen",
    sub: "Institutional capacity built into the organisation, not deposited and left",
  },
];

const patterns = [
  {
    num: "01",
    title: "Compliance M&E That Doesn&apos;t Drive Learning",
    desc: "Most implementing organisations have monitoring systems designed to satisfy donor reporting requirements. Indicators are tracked. Reports are filed on schedule. But the data generated rarely flows back to programme staff in a form they can use. Learning is retrospective, infrequent, and disconnected from the decisions being made every week.",
  },
  {
    num: "02",
    title: "Programme Design Without Implementation Architecture",
    desc: "Theories of change describe what will happen if everything works as intended. They rarely describe who is responsible for what, at what point, with what resources, under what accountability structure. The gap between theory and delivery architecture is where most programme underperformance originates.",
  },
  {
    num: "03",
    title: "Data Integrity Failures Under Field Conditions",
    desc: "Field data collection is sensitive to enumerator bias, social desirability effects, translation inconsistencies, and incentive structures that reward reported results over accurate ones. Without embedded verification systems, the data underpinning programme management decisions may not reflect what is happening at the delivery point.",
  },
  {
    num: "04",
    title: "Learning That Never Influences Practice",
    desc: "Evaluations produce findings. Learning reviews generate recommendations. And programmes continue largely as they were. The infrastructure that would translate evidence into adjusted delivery — decision rights, escalation protocols, adaptive management routines — is absent. Learning cycles at implementation speed are replaced by review cycles at reporting speed.",
  },
];

const solutions = [
  {
    title: "Adaptive Learning System Design",
    desc: "End-to-end design of MERL systems built for course-correction rather than compliance. Evidence reaches the people making programme decisions in time to act on it.",
  },
  {
    title: "Theory of Change Redesign",
    desc: "Rebuilding theories of change from delivery logic up — grounding assumptions in political economy, institutional capacity, and evidence of what actually produces change in your context.",
  },
  {
    title: "Implementation Diagnostics",
    desc: "Structured assessment of programme design, delivery architecture, M&E systems, and organisational capacity — identifying the gaps that explain underperformance before they become failures.",
  },
  {
    title: "Field Verification Systems",
    desc: "Independent verification protocols that test reported results against primary field data, surfacing bias, inconsistency, and data integrity issues that internal systems are not designed to detect.",
  },
  {
    title: "Embedded Advisory",
    desc: "Sustained technical advisory presence within your programme team, providing the implementation intelligence and adaptive management support that periodic reviews cannot substitute for.",
  },
  {
    title: "Evidence Translation",
    desc: "Converting programme data and evaluation findings into the decision-focused formats that programme directors, management teams, and donor counterparts can act on without a research background.",
  },
];

const engagementSteps = [
  {
    num: "01",
    title: "Programme Diagnostic",
    desc: "We assess your programme design, monitoring architecture, field data systems, and organisational learning routines — producing a clear picture of where delivery is succeeding and where systemic gaps are costing results.",
  },
  {
    num: "02",
    title: "System Redesign",
    desc: "We redesign the specific systems the diagnostic identifies as failing — whether that is the theory of change, the MERL framework, the data verification protocol, or the learning-to-adaptation mechanism.",
  },
  {
    num: "03",
    title: "Embedded Support",
    desc: "We embed advisory capacity within your team during implementation, providing technical oversight, real-time evidence integration, and adaptive management support at the pace your programme requires.",
  },
  {
    num: "04",
    title: "Capacity Transfer",
    desc: "We build institutional capacity through working practice, not training workshops — ensuring that the systems and analytical habits we introduce are owned and maintained by your organisation after we exit.",
  },
];

export default function NGOsAndPartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-teal text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-work.jpg"
          alt="NGOs & Implementing Partners — Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-5 text-sm">
            <Link
              href="/institutions-we-support"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Institutions We Support
            </Link>
            <span className="text-white/40">›</span>
            <span className="text-white/70">NGOs &amp; Implementing Partners</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            NGOs &amp; Implementing Partners
          </h1>
          <p className="text-gray-200 text-xl max-w-2xl leading-relaxed">
            Delivery effectiveness is not a function of intent. It depends on the quality of
            programme design, the reliability of data systems, and the capacity for adaptive
            management. We help implementing organisations build all three.
          </p>
        </div>
      </section>

      {/* The Implementer's Challenge */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <SlideLeft>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                When Programmes Know What to Do But Struggle to Do It Well
              </h2>
              <p className="text-brand-muted leading-relaxed mb-5">
                Most implementing organisations are staffed with people who care deeply about the
                outcomes they are working toward. The problem is not commitment. It is the systems
                that sit between commitment and results: M&E frameworks calibrated for compliance
                rather than learning, programme designs that do not translate into delivery
                architecture, data collection practices that generate volume without integrity.
              </p>
              <p className="text-brand-muted leading-relaxed">
                Programmes adapt slowly when they adapt at all. Evidence rarely reaches the people
                making operational decisions in a form they can act on. The gap between what a
                programme is funded to achieve and what it demonstrably delivers persists — not
                because delivery staff are failing, but because the systems supporting delivery were
                never designed for it.
              </p>
            </SlideLeft>
            <SlideRight>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-6">
                  The Astellic Difference
                </p>
                <div className="space-y-5">
                  {differenceItems.map((d, i) => (
                    <Reveal key={i} variant="up" delay={i * 60}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-teal mt-1.5 shrink-0" />
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
                Four Patterns We Address
              </h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Recurring failures that sit between funding and results in most implementing organisations.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            {patterns.map((p, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm lift">
                  <span className="inline-block text-xs font-bold text-brand-teal bg-brand-teal/10 px-2.5 py-1 rounded mb-4 tracking-wider">
                    {p.num}
                  </span>
                  <h3 className="text-base font-bold text-brand-navy mb-3"
                    dangerouslySetInnerHTML={{ __html: p.title }}
                  />
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

      {/* Our Positioning */}
      <section className="py-20 px-6 bg-brand-teal text-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <blockquote className="border-l-4 border-white/40 pl-6 text-white/90 text-xl leading-relaxed italic max-w-3xl mx-auto">
              &ldquo;We help implementing organisations move from activity delivery to genuine results
              delivery: by fixing the design, the data, and the learning systems that sit between
              what is funded and what is achieved.&rdquo;
            </blockquote>
          </FadeUp>
        </div>
      </section>

      {/* Solution Areas */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Our Service Areas</h2>
              <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                Six core services targeting the systems that determine whether delivery intent
                becomes demonstrable results.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lift">
                  <div className="h-1 bg-brand-teal w-full" />
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
                A process that mirrors the implementation lifecycle and builds capacity at each stage.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementSteps.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div>
                  <span className="text-5xl font-black text-brand-teal/10 block mb-3">{s.num}</span>
                  <h3 className="text-base font-bold text-brand-navy mb-2">{s.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{s.desc}</p>
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
              Strengthen Your Organisation&apos;s Delivery Systems
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-10">
              Whether you need a programme diagnostic, a learning system redesign, or an embedded
              advisory partner who stays through delivery, we have a precise entry point for your
              organisation.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Request a Programme Diagnostic
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
              >
                Discuss an Evaluation Partnership
              </Link>
            </div>
            <Link
              href="/propose-partnership"
              className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold hover:gap-3 transition-all"
            >
              Propose a Partnership
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
