import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programme Design & Innovation | Implementation | Astellic",
  description:
    "Astellic's Programme Design & Innovation sub-unit — theories of change, results frameworks, implementation-ready architectures, and proprietary design tools.",
};

const services = [
  {
    label: "Complete Programme Architecture",
    desc: "Development of full programme designs — theory of change, results chain, operational model, implementation sequencing, and risk framework — calibrated to client context and donor requirements.",
  },
  {
    label: "Astellic Implementation Readiness Assessment",
    desc: "A proprietary diagnostic tool that identifies design weaknesses, institutional constraints, and systemic barriers before implementation begins — giving clients a measurable advantage on Day 1.",
  },
  {
    label: "Innovation & Prototyping",
    desc: "Rapid design, testing, and iteration of new delivery models, tools, and approaches — including AI-augmented research services and unconventional implementation models adapted to the African institutional context.",
  },
  {
    label: "Financing Architecture",
    desc: "Design of financing structures for donor-funded programmes, government initiatives, and blended finance mechanisms — including budget justification, cost modelling, and sub-grant design.",
  },
  {
    label: "Results Framework & Theory of Change Development",
    desc: "Rigorous, facilitated development of theories of change, results chains, and indicator frameworks — producing the analytical architecture on which accountable programme performance is built.",
  },
];

export default function ProgrammeDesignPage() {
  return (
    <>
      <section className="text-white py-20 px-6" style={{ backgroundColor: "#3B7D23" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-green-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Implementation</Link>
            <span>/</span>
            <span className="text-white font-semibold">Programme Design & Innovation</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.1</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Programme Design<br />& Innovation</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Translating strategic intent into implementation-ready programme architectures with a measurable design advantage.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            Strong programme design is the single most powerful predictor of implementation success.
            We build the analytical architecture — theory of change, results frameworks, operational
            models — that gives every programme a structural advantage before the first activity begins.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            The Programme Design & Innovation sub-unit applies an innovation lens to every
            design assignment — testing new delivery models, piloting unconventional approaches,
            and building proprietary tools including the Astellic Implementation Readiness Assessment.
            We recognise that in African development contexts, the gap between design intent and
            implementation reality is often a failure of design, not of execution.
            Our role is to close that gap at the design stage.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <div key={i} className="bg-brand-light rounded-xl p-6">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-green">{s.label}</h3>
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
            <p className="font-bold text-brand-navy">Commission a programme design?</p>
            <p className="text-brand-muted text-sm">We work with donors, governments, and implementers.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
            </Link>
            <Link href="/what-we-do/implementation" className="border border-brand-green text-brand-green px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-green hover:text-white transition-colors">
              ← Back to Pillar 03
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
