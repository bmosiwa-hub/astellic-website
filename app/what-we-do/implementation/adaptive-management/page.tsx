import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programme Implementation & Adaptive Management | Implementation | Astellic",
  description:
    "Astellic's Programme Implementation & Adaptive Management sub-unit — direct delivery, consortium leadership, and real-time adaptive management for donor-funded and government programmes.",
};

const services = [
  {
    label: "End-to-End Programme Management",
    desc: "Complete programme management — financial management, sub-contractor coordination, stakeholder engagement, and donor reporting — positioning Astellic as the primary accountable entity for programme performance.",
  },
  {
    label: "Adaptive Management",
    desc: "Real-time integration of monitoring data and evaluation findings into programme decision-making — enabling iterative course-correction based on what the evidence is showing on the ground, not what the original log frame assumed.",
  },
  {
    label: "Consortium Leadership",
    desc: "Leadership and coordination of multi-organisational consortia on medium-to-large contracts — positioning Astellic as the African anchor and primary accountable entity in large-scale programme delivery.",
  },
  {
    label: "Technical Implementing Partner Services",
    desc: "Serving as the technical implementing partner on donor-funded and government programmes — providing the analytical rigour, adaptive management systems, and senior technical leadership that translate strategic intent into measurable outcomes.",
  },
  {
    label: "Learning Integration Systems",
    desc: "Design and operation of real-time learning integration systems that ensure insights from programme monitoring continuously inform delivery decisions — closing the loop between evidence generation and implementation action.",
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
          <h1 className="text-4xl font-bold mt-2 mb-4">Programme Implementation &<br />Adaptive Management</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Direct delivery with the adaptive management systems to course-correct in real time.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            This is where Astellic acts as programme implementer, consortium lead, or
            technical implementing partner — applying adaptive management throughout
            the delivery cycle so that learning continuously shapes the decisions that determine outcomes.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Programme Implementation & Adaptive Management is Astellic&apos;s direct delivery function —
            the commercial engine of Pillar 03 and the proving ground for our institutional credibility
            as a full-spectrum delivery partner. We apply adaptive management principles throughout
            the implementation cycle, ensuring that learning from our Evaluation & Learning function
            continuously shapes delivery decisions. In an African development context, where
            implementation environments change faster than plans can anticipate, adaptive management
            is not a methodology — it is a survival requirement.
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
