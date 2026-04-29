import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "Astellic's 6-stage value delivery system — from evidence generation to system strengthening.",
};

const stages = [
  {
    num: "01",
    title: "Generate Evidence",
    desc: "Policy-relevant research, data analysis, and political economy insight grounded in context.",
  },
  {
    num: "02",
    title: "Translate Evidence into Policy & Strategy",
    desc: "Actionable policy frameworks, strategies, and guidelines that are technically credible and politically feasible.",
  },
  {
    num: "03",
    title: "Design Programmes",
    desc: "Implementation-ready interventions with clear theories of change, robust results frameworks, and operational models.",
  },
  {
    num: "04",
    title: "Implement & Adapt",
    desc: "Hands-on delivery combined with adaptive management — maintaining responsiveness to evolving contexts and institutional dynamics.",
  },
  {
    num: "05",
    title: "Measure & Learn",
    desc: "Monitoring, evaluation, and learning systems that inform real-time decision-making and improve performance.",
  },
  {
    num: "06",
    title: "Strengthen Systems & Capacity",
    desc: "Cross-cutting investments in institutional systems, data infrastructure, and human capability that determine long-term sustainability.",
  },
];

const principles = [
  "We prioritise honest analysis over convenience",
  "We design solutions that work within systems, not around them",
  "We measure success by outcomes, not outputs",
];

export default function ApproachPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Professionals analysing policy data"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            From Evidence to Impact
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            Our value delivery system follows a structured, end-to-end delivery
            model, ensuring policy priorities are translated into effective and
            sustainable outcomes. Each stage reinforces the others, with system
            strengthening running as a continuous thread throughout.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">The Problem We Solve</h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            The development sector is not short of evidence, strategies, funding,
            or technical expertise. What is consistently scarce is the ability to
            translate them into results at scale. This is not a technical
            failure — it is a systems failure. Astellic was created to fill that
            gap.
          </p>
          <div className="bg-brand-navy text-white rounded-xl p-8">
            <h3 className="font-semibold text-brand-gold mb-4">
              Professional Trust — How We Work
            </h3>
            <ul className="space-y-3">
              {principles.map((p) => (
                <li key={p} className="flex gap-3 text-gray-300 text-base">
                  <span className="text-brand-teal mt-0.5">→</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">
            Our 6-Stage Delivery Model
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-8">
              {stages.map((s) => (
                <div key={s.num} className="md:flex gap-8 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-base relative z-10">
                    {s.num}
                  </div>
                  <div className="mt-4 md:mt-0 bg-brand-light rounded-xl p-6 flex-1">
                    <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-brand-muted text-base leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
