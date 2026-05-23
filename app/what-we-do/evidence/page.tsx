import type { Metadata } from "next";
import EvidenceIllustration from "@/components/illustrations/EvidenceIllustration";
import Link from "next/link";
import { Reveal, FadeUp, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Evidence | Astellic",
  description:
    "Astellic's Evidence pillar: rigorous, policy-relevant research, evaluation, audit, and data quality work across Africa.",
};

const subUnits = [
  {
    num: "1.1",
    title: "Research & Analytics",
    tagline: "Policy-relevant intelligence at the point where evidence meets the decision-maker.",
    desc: "Our Research & Analytics sub-unit conducts primary and secondary research across Astellic's thematic domains, combining quantitative rigour with qualitative depth and political economy awareness. We specialise in applied policy research, sector systems analysis, political economy analysis, programme evaluations, institutional diagnostics, and rapid evidence synthesis, producing research that is not only analytically sound but operationally actionable.",
    services: [
      "Primary data collection and analysis across health, governance, education, and climate domains",
      "Political economy analysis (PEA) for reform strategy and programme design",
      "Sector systems and policy analysis across all thematic areas",
      "Landscape assessments, institutional diagnostics, and needs assessments",
      "Rapid evidence synthesis and applied analytics",
    ],
    href: "/what-we-do/evidence/research-analytics",
  },
  {
    num: "1.2",
    title: "Evaluation and Audit",
    tagline: "Independent evaluation, audit, and data integrity: building the institutional conditions for evidence that can be trusted.",
    desc: "Our Evaluation and Audit sub-unit designs, manages, and delivers independent programme evaluation, audit, real-time learning systems, and adaptive MERL support. We go beyond compliance-driven monitoring to ensure that the evidence programmes generate is analytically sound, methodologically rigorous, and ethically compliant. Data quality and research integrity are embedded in everything we do, not treated as afterthoughts.",
    services: [
      "Independent mid-term and end-of-programme evaluations and audit",
      "Impact assessments and formative programme reviews",
      "Real-time learning system design and implementation",
      "Adaptive MERL system strengthening for donor-funded programmes and government initiatives",
      "Data quality assurance: internal and client-facing verification protocols",
      "Research ethics compliance and ethical review management",
      "Structured internal peer review of all research and evaluation outputs",
    ],
    href: "/what-we-do/evidence/evaluation-learning",
  },
];

const offerings = [
  "Applied policy research and landscape assessments",
  "Political economy analysis for reform and programme design",
  "Sector systems and policy analysis across all thematic areas",
  "Programme evaluations across health, governance, education, and climate",
  "Impact assessment and formative programme reviews",
  "Real-time monitoring, evaluation, research, and learning (MERL) systems",
  "Independent programme audit",
  "Data quality assurance and research integrity compliance",
  "Institutional diagnostic reviews and rapid evidence synthesis",
];

export default function EvidencePillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <EvidenceIllustration className="absolute inset-0 w-full h-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-gray-400 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-brand-gold text-sm font-semibold">Pillar 01</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Evidence
          </h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            Producing the rigorous, context-grounded intelligence that drives policy and programme decisions.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            This pillar is Astellic&apos;s analytical engine. It is not a passive research function;
            it is a proactive intelligence system that produces evidence calibrated to
            decision-making, not academic convention.
          </p>
        </div>
      </section>

      {/* Sub-units */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {subUnits.map((s, si) => (
            <Reveal key={s.num} variant="up" delay={si * 100}>
            <div className="border-l-4 border-brand-navy pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-white bg-brand-navy px-2 py-0.5 rounded">{s.num}</span>
                <h2 className="text-xl font-bold text-brand-navy">{s.title}</h2>
              </div>
              <p className="text-brand-muted italic text-base mb-4">{s.tagline}</p>
              <p className="text-brand-muted leading-relaxed mb-6">{s.desc}</p>
              <div className="bg-brand-light rounded-xl p-5 space-y-2 mb-5">
                <p className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">Service Offerings</p>
                {s.services.map((svc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    {svc}
                  </div>
                ))}
              </div>
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-brand-navy font-semibold text-sm hover:gap-3 transition-all"
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

      {/* Full offerings list */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-bold text-brand-navy mb-8 text-center">Evidence Pillar: Full Service Range</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-3">
            {offerings.map((o, i) => (
              <Reveal key={i} variant="up" delay={i * 50}>
              <div className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 text-sm text-brand-muted lift">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-1.5 shrink-0" />
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
            <h2 className="text-xl font-bold text-brand-navy mb-3">Evidence feeds the full delivery system.</h2>
            <p className="text-brand-muted mb-8">
              Our research outputs directly inform Astellic&apos;s policy advisory and programme delivery pillars,
              creating an integrated system where no insight is wasted.
            </p>
          </FadeUp>
          <FadeUp delay={100}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Pillar 02: Policy
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
