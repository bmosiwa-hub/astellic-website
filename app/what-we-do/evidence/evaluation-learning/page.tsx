import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Evaluation and Audit | Evidence | Astellic",
  description:
    "Astellic's Evaluation and Audit sub-unit: independent programme evaluation and audit, real-time learning systems, adaptive MERL, data quality assurance, and research ethics and integrity.",
};

const services = [
  {
    label: "Independent Programme Evaluation and Audit",
    desc: "Mid-term and end-of-programme evaluations, independent audit, impact assessments, and formative reviews, designed to be honest, learning-oriented, and decision-informing, not compliance exercises.",
  },
  {
    label: "Real-Time Learning System Design",
    desc: "Development and implementation of adaptive learning systems that enable programmes to course-correct based on what the evidence shows on the ground, not what the original log frame assumed.",
  },
  {
    label: "Adaptive MERL System Strengthening",
    desc: "Strengthening the monitoring, evaluation, research, and learning systems within implementing organisations and government programmes, building institutional MERL capability, not MERL dependency.",
  },
  {
    label: "Data Quality Assurance",
    desc: "Internal and client-facing data verification protocols that ensure the evidence programmes generate and present to donors and governments meets the highest standards of methodological integrity and statistical robustness.",
  },
  {
    label: "Research Ethics and Integrity",
    desc: "Ethics compliance management, informed consent framework design, data protection compliance, and structured peer review of all research and evaluation outputs, ensuring that evidence is both rigorous and responsibly produced.",
  },
  {
    label: "Peer Review and Research Integrity Advisory",
    desc: "Structured internal peer review processes, research integrity training, and institutional capacity building for organisations that commission, produce, or report on research and evaluation evidence.",
  },
];

export default function EvaluationLearningPage() {
  return (
    <>
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/evidence" className="hover:text-white transition-colors">Evidence</Link>
            <span>/</span>
            <span className="text-brand-gold">Evaluation and Audit</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 1.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Evaluation and Audit</h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            Independent evaluation, audit, and data integrity: building the institutional conditions for evidence that can be trusted.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            We go beyond compliance-driven monitoring to design and deliver evaluation and audit
            systems that genuinely improve how programmes perform. Data quality and research
            integrity are embedded in everything we do, not bolted on at the end.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            As donors intensify demands for evidence and value-for-money, the Evaluation and Audit
            sub-unit is one of Astellic&apos;s fastest-growing and most strategically significant offerings.
            We combine independent evaluation and audit with rigorous data quality assurance and research
            ethics compliance, because we believe that measurement without integrity is an expensive
            exercise in accountability theatre. Evidence has to be trusted to be used.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl p-6 lift">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-navy">{s.label}</h3>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed pl-4">{s.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <p className="font-bold text-brand-navy">Commission an evaluation, audit, or MERL system?</p>
            <p className="text-brand-muted text-sm">We work with implementers, donors, and governments.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
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
