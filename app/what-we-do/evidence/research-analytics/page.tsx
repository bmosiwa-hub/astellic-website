import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research & Analytics | Evidence Generation | Astellic",
  description:
    "Astellic's Research & Analytics sub-unit — applied policy research, sector systems analysis, political economy analysis, and evidence synthesis calibrated for decision-makers across all thematic domains.",
};

const services = [
  {
    label: "Primary Data Collection & Analysis",
    desc: "Quantitative surveys, qualitative fieldwork, and mixed-methods studies across health, governance, education, and climate domains, producing datasets that are analytically robust and operationally actionable.",
  },
  {
    label: "Political Economy Analysis",
    desc: "Structured PEA to map power dynamics, incentive structures, and institutional constraints, giving policy and reform teams the contextual intelligence to design interventions that survive in practice.",
  },
  {
    label: "Sector Systems & Policy Analysis",
    desc: "In-depth analysis of how systems perform, where they fail, and what constrains them, applied across health systems, public sector governance, social services, and climate and agricultural systems.",
  },
  {
    label: "Landscape Assessments & Institutional Diagnostics",
    desc: "Rapid and comprehensive reviews of sector landscapes, institutional capacity, and system performance, providing the foundational intelligence for programme design and reform planning.",
  },
  {
    label: "Rapid Evidence Synthesis",
    desc: "Short-turnaround literature reviews, policy environment analyses, and evidence scans, commissioned by donors, governments, and INGOs within tight timelines without sacrificing analytical rigour.",
  },
];

export default function ResearchAnalyticsPage() {
  return (
    <>
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/evidence" className="hover:text-white transition-colors">Evidence Generation</Link>
            <span>/</span>
            <span className="text-brand-gold">Research & Analytics</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 1.1</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Research & Analytics</h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            Policy-relevant intelligence at the point where evidence meets the decision-maker.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            We produce research that is not only analytically sound but operationally actionable,
            combining quantitative rigour with qualitative depth and political economy awareness
            across all of Astellic&apos;s thematic domains.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Our Research & Analytics sub-unit is Astellic&apos;s primary engine of evidence production.
            It conducts primary and secondary research across the firm&apos;s thematic domains,
            specialising in applied policy research, sector systems analysis, political economy analysis,
            programme evaluations, institutional diagnostics, and rapid evidence synthesis.
            What distinguishes us is the production of research positioned at the precise point
            where evidence meets the decision-maker, calibrated for action, not academic convention.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <div key={i} className="bg-brand-light rounded-xl p-6">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-navy">{s.label}</h3>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed pl-4">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <p className="font-bold text-brand-navy">Ready to commission evidence?</p>
            <p className="text-brand-muted text-sm">We work with governments, donors, and institutions.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Commission Research Support
            </Link>
            <Link href="/what-we-do/evidence" className="bg-brand-navy text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-navy/90 transition-colors">
              Back to Pillar 01
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
