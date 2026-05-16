import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Embedded Implementation Support & Adaptive Management | Astellic",
  description:
    "Astellic's embedded implementation support and adaptive management services — staying alongside institutions to strengthen delivery systems, build adaptive management capacity, and support sustained programme performance.",
};

const services = [
  {
    label: "Programme Management Support",
    desc: "Technical advisory and embedded support for programme management — including financial management advisory, sub-contractor coordination support, and donor reporting — positioning Astellic as a senior technical resource within the programme team.",
  },
  {
    label: "Adaptive Management",
    desc: "Real-time integration of monitoring data and evaluation findings into programme decision-making, enabling iterative course-correction based on what the evidence is showing on the ground, not what the original log frame assumed.",
  },
  {
    label: "Consortium Technical Support",
    desc: "Technical advisory and coordination support for multi-organisational consortia — providing analytical rigour, adaptive management expertise, and senior technical leadership within programme delivery structures.",
  },
  {
    label: "Technical Advisory to Implementing Partners",
    desc: "Senior technical advisory embedded within donor-funded and government programmes — providing the evidence integration, adaptive management systems, and institutional intelligence that translate strategic intent into sustained outcomes.",
  },
  {
    label: "Learning Integration Systems",
    desc: "Design and operation of real-time learning integration systems that ensure insights from programme monitoring continuously inform delivery decisions, closing the loop between evidence generation and implementation action.",
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
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Implementation</Link>
            <span>/</span>
            <span className="text-white font-semibold">Implementation & Adaptive Management</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.3</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Embedded Implementation Support<br />& Adaptive Management</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Staying alongside institutions to strengthen delivery systems and build adaptive management capacity.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            Astellic provides embedded advisory support throughout programme cycles — working
            inside institutions to strengthen delivery systems, bridge the gap between strategy
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
            cycle. We are a specialist advisory firm — not a large-scale delivery contractor.
            Our role is to build the institutional capacity, adaptive routines, and evidence
            integration systems that allow organisations to deliver well and learn continuously.
            In African development contexts, where implementation environments change faster
            than plans can anticipate, adaptive management is not a methodology; it is a
            survival requirement.
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

      <section className="bg-brand-navy text-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div>
            <p className="font-bold text-lg mb-1">Ready to deliver?</p>
            <p className="text-gray-300 text-sm">
              We work as implementers, consortium leads, and technical partners on donor and government programmes.
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
