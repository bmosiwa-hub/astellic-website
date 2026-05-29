import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Intervention Modelling and Simulation | Delivery | Astellic",
  description:
    "Astellic's Intervention Modelling and Simulation sub-unit: quantitative impact pathway modelling, delivery scenario analysis, and pre-launch simulation to test programme design before resources are committed.",
};

const services = [
  {
    label: "Quantitative Intervention Modelling",
    desc: "Development of quantitative models that trace impact pathways, results chains, and resource flow assumptions for planned programme interventions — giving designers a rigorous, testable picture of the logic underpinning their programme before launch.",
  },
  {
    label: "Delivery Scenario Analysis",
    desc: "Structured analysis of alternative implementation approaches, testing how different delivery models, partnership configurations, and resource sequencing strategies are likely to perform across a range of institutional and contextual conditions.",
  },
  {
    label: "Assumption Stress-Testing",
    desc: "Systematic identification and interrogation of the most consequential design assumptions: which are robust across scenarios, which are fragile, and which, if wrong, would fundamentally undermine programme performance.",
  },
  {
    label: "Pre-Launch Simulation",
    desc: "Application of systems dynamics and agent-based modelling techniques to simulate how programme interventions are likely to behave in complex real-world delivery environments — revealing emergent dynamics, bottlenecks, and unintended consequences before they become operational crises.",
  },
  {
    label: "Design Optimisation",
    desc: "Using modelling outputs to refine programme architecture, delivery sequencing, and resource allocation: translating simulation findings into actionable design improvements that reduce risk and increase the probability of achieving intended outcomes.",
  },
];

export default function InterventionModellingSimulationPage() {
  return (
    <>
      <section className="text-white py-20 px-6" style={{ backgroundColor: "#3B7D23" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-green-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Delivery</Link>
            <span>/</span>
            <span className="text-white font-semibold">Intervention Modelling and Simulation</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.3</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Intervention Modelling<br />and Simulation</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Quantitative and scenario-based modelling of programme interventions to test design assumptions, optimise delivery choices, and anticipate outcomes before resources are committed.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We build models that let programme designers test their assumptions, explore
            alternative delivery configurations, and stress-test their logic before the
            programme launches — when changes are still cheap and the evidence still matters.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Most programme failures are designed in, not implemented in. The decisions made
            at the design stage — which intervention logic to pursue, what delivery pathway
            to use, which assumptions to rely on — are the decisions that most determine
            whether a programme succeeds or fails. Yet these decisions are routinely made
            on intuition, analogy, and incomplete evidence. The Intervention Modelling and
            Simulation sub-unit provides an alternative: analytical rigour applied at the
            design stage, using modelling and simulation to test, refine, and optimise
            programme choices before resources are locked in. We combine quantitative
            impact pathway modelling with scenario analysis and pre-launch simulation to
            give programme designers and commissioners the evidence they need to make
            consequential decisions with confidence.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl p-6 lift">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-green">{s.label}</h3>
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
            <p className="font-bold text-brand-navy">Need your programme design tested before launch?</p>
            <p className="text-brand-muted text-sm">We work with donors, governments, and programme management units.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Discuss Intervention Modelling
            </Link>
            <Link href="/what-we-do/implementation" className="bg-brand-green text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-green/90 transition-colors">
              Back to Pillar 03
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
