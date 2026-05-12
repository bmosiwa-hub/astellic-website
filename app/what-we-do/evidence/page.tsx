import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evidence Generation & Verification | Astellic",
  description:
    "Astellic's Evidence Generation & Verification pillar — producing rigorous, policy-relevant research, evaluation, and data quality work across Africa.",
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
      "Sector systems & policy analysis across all thematic areas",
      "Landscape assessments, institutional diagnostics, and needs assessments",
      "Rapid evidence synthesis and applied analytics",
    ],
    href: "/what-we-do/evidence/research-analytics",
  },
  {
    num: "1.2",
    title: "Evaluation & Learning",
    tagline: "Not just measuring outputs: engineering the institutional conditions for continuous improvement.",
    desc: "Our Evaluation & Learning sub-unit designs, manages, and delivers independent programme evaluation, real-time learning systems, and adaptive management support. We position Astellic as a premium MERL partner, one that builds the systems through which programmes can continuously improve, not just report on outcomes. As donors intensify demands for evidence and value-for-money, this is one of our fastest-growing and most strategically significant capabilities.",
    services: [
      "Independent mid-term and end-of-programme evaluations",
      "Impact assessments and formative programme reviews",
      "Real-time learning system design and implementation",
      "Theory of change development and results framework design",
      "MERL system strengthening for donor-funded programmes and government initiatives",
    ],
    href: "/what-we-do/evidence/evaluation-learning",
  },
  {
    num: "1.3",
    title: "Data Quality & Research Integrity",
    tagline: "A strategic differentiator: ensuring evidence meets the highest standards of methodological integrity.",
    desc: "This sub-unit is a deliberate competitive differentiator in the African development consulting market. We provide a dedicated function ensuring that the evidence Astellic produces, and the evidence clients present to donors and governments, meets the highest standards of data quality, methodological integrity, and ethical compliance. In a sector where weak evidence undermines both policy design and donor confidence, our explicit commitment to research integrity is both a quality assurance mechanism and a positioning statement.",
    services: [
      "Data quality assurance: internal and client-facing verification protocols",
      "Research ethics compliance and ethical review management",
      "Informed consent framework design and data protection compliance",
      "Structured internal peer review of all research and evaluation outputs",
      "Research integrity training and institutional capacity building",
    ],
    href: "/what-we-do/evidence/data-quality",
  },
];

const offerings = [
  "Applied policy research and landscape assessments",
  "Political economy analysis for reform and programme design",
  "Sector systems & policy analysis across all thematic areas",
  "Programme evaluations across health, governance, education, and climate",
  "Impact assessment and formative programme reviews",
  "Real-time monitoring, evaluation, research, and learning (MERL) systems",
  "Data quality assurance and research integrity compliance",
  "Institutional diagnostic reviews and rapid evidence synthesis",
];

export default function EvidencePillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Evidence generation and research"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-gray-400 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-brand-gold text-sm font-semibold">Pillar 01</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Evidence Generation<br />& Verification
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
          {subUnits.map((s) => (
            <div key={s.num} className="border-l-4 border-brand-navy pl-8">
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
          ))}
        </div>
      </section>

      {/* Full offerings list */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy mb-8 text-center">Evidence Pillar: Full Service Range</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {offerings.map((o, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 text-sm text-brand-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-1.5 shrink-0" />
                {o}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related pillars */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-brand-navy mb-3">Evidence feeds the full delivery system.</h2>
          <p className="text-brand-muted mb-8">
            Our research outputs directly inform Astellic&apos;s policy advisory and programme delivery pillars,
            creating an integrated system where no insight is wasted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Pillar 02: Policy Development &amp; Advisory
            </Link>
            <Link href="/what-we-do/implementation" className="bg-brand-green text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-green/90 transition-colors">
              Pillar 03: Programme Design &amp; Implementation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
