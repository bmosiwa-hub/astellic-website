import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evaluation & Learning | Evidence Generation | Astellic",
  description:
    "Astellic's Evaluation & Learning sub-unit — independent programme evaluation, real-time learning systems, and MERL framework architecture.",
};

const services = [
  {
    label: "Independent Programme Evaluation",
    desc: "Mid-term and end-of-programme evaluations, impact assessments, and formative reviews — designed to be honest, learning-oriented, and decision-informing, not compliance exercises.",
  },
  {
    label: "Real-Time Learning System Design",
    desc: "Development and implementation of adaptive learning systems that enable programmes to course-correct based on what the evidence shows on the ground — not what the original log frame assumed.",
  },
  {
    label: "Theory of Change & Results Framework Development",
    desc: "Rigorous theory of change facilitation, results chain articulation, and indicator selection — building the analytical foundation on which accountable programme performance depends.",
  },
  {
    label: "MERL System Strengthening",
    desc: "Strengthening the monitoring, evaluation, research, and learning systems within implementing organisations and government programmes — building institutional MERL capability, not MERL dependency.",
  },
  {
    label: "Adaptive Management Support",
    desc: "Ongoing MERL advisory embedded within active programmes — providing real-time analytical support that integrates learning data into operational decision-making throughout the programme cycle.",
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
            <Link href="/what-we-do/evidence" className="hover:text-white transition-colors">Evidence Generation</Link>
            <span>/</span>
            <span className="text-brand-gold">Evaluation & Learning</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 1.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Evaluation & Learning</h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            Not just measuring outputs — engineering the institutional conditions for continuous programme improvement.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            We position Astellic as a premium MERL partner — one that does not simply measure
            outputs, but builds the systems through which programmes can continuously improve in
            response to real-world evidence.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            As donors intensify demands for evidence and value-for-money, the Evaluation & Learning
            sub-unit is one of Astellic&apos;s fastest-growing and most strategically significant offerings.
            We go beyond compliance-driven monitoring to design and deliver evaluation and learning
            systems that genuinely improve how programmes perform — because we believe that measurement
            without learning is an expensive exercise in accountability theatre.
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
            <p className="font-bold text-brand-navy">Commission an evaluation or MERL system?</p>
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
