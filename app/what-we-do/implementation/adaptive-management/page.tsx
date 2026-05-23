import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Implementation Support and Adaptive Management | Delivery | Astellic",
  description:
    "Astellic's Implementation Support and Adaptive Management sub-unit: embedded advisory, technical assistance, adaptive management, and sustained government ministry support across programme cycles.",
};

const services = [
  {
    label: "Embedded Advisory and Technical Assistance",
    desc: "Senior technical advisors embedded within government ministries, programme management units, and implementing organisations, providing the analytical depth, institutional intelligence, and sustained presence that translate strategic intent into operational outcomes.",
  },
  {
    label: "Adaptive Management Support",
    desc: "Real-time integration of monitoring data and evaluation findings into programme decision-making, enabling iterative course-correction based on what the evidence is showing on the ground, not what the original log frame assumed.",
  },
  {
    label: "Sustained Government Ministry Support",
    desc: "Long-term technical assistance to government ministries across programme cycles, building institutional routines, strengthening delivery systems, and providing the continuity of advisory that short-term consultancy cannot deliver.",
  },
  {
    label: "Delivery Diagnostics",
    desc: "Structured identification and analysis of implementation bottlenecks, systemic delivery constraints, and institutional barriers, providing the evidence base for targeted interventions that keep programmes on track.",
  },
  {
    label: "Consortium Technical Support and Coordination",
    desc: "Technical advisory and coordination support for multi-organisational consortia, providing analytical rigour, adaptive management expertise, and senior technical leadership within complex programme delivery structures.",
  },
  {
    label: "Institutional Capacity Building",
    desc: "Building the enduring institutional capacity, adaptive routines, and evidence integration systems that allow organisations to deliver well and learn continuously, sustaining performance after the engagement ends.",
  },
];

export default function AdaptiveManagementPage() {
  return (
    <>
      <section className="text-white py-20 px-6" style={{ backgroundColor: "#3B7D23" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-green-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Delivery</Link>
            <span>/</span>
            <span className="text-white font-semibold">Implementation Support and Adaptive Management</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Implementation Support<br />and Adaptive Management</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Staying embedded alongside institutions to strengthen delivery systems, integrate learning, and sustain programme performance.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            Astellic provides embedded advisory support and technical assistance throughout
            programme cycles, working inside institutions to bridge the gap between strategy
            and execution, and ensure learning continuously shapes programme decisions.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Astellic&apos;s embedded implementation support function stays alongside government
            institutions, implementing organisations, and programme management units to
            strengthen delivery systems and apply adaptive management throughout the programme
            cycle. We are a specialist advisory firm, not a large-scale delivery contractor.
            Our role is to build the institutional capacity, adaptive routines, and evidence
            integration systems that allow organisations to deliver well and learn continuously.
            In African development contexts, where implementation environments change faster
            than plans can anticipate, adaptive management is not a methodology: it is a
            survival requirement.
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

      <section className="bg-brand-navy text-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div>
            <p className="font-bold text-lg mb-1">Ready to deliver?</p>
            <p className="text-gray-300 text-sm">
              We work as embedded advisors, technical partners, and consortium leads on donor and government programmes.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Start a Conversation
            </Link>
            <Link href="/what-we-do/implementation" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Back to Pillar 03
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
