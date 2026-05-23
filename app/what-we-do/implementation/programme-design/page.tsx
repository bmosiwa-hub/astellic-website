import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Programme Design and Readiness Assessment | Delivery | Astellic",
  description:
    "Astellic's Programme Design and Readiness Assessment sub-unit: advisory support on theories of change, results frameworks, programme architecture, and implementation readiness diagnostics.",
};

const services = [
  {
    label: "Theory of Change and Results Framework Development",
    desc: "Rigorous, facilitated development of theories of change, results chains, and indicator frameworks, building the analytical architecture on which accountable programme performance depends.",
  },
  {
    label: "Programme Architecture Advisory",
    desc: "Advisory support on full programme design, including operational models, implementation sequencing, risk frameworks, and financing design, calibrated to the institutional context and donor requirements of each engagement.",
  },
  {
    label: "Implementation Readiness Assessment",
    desc: "A structured diagnostic that identifies design weaknesses, institutional constraints, and systemic barriers before implementation begins, giving clients a measurable advantage before the first activity starts.",
  },
  {
    label: "Programme Design Advisory to Governments and Donors",
    desc: "Technical advisory to government ministries and programme management units on programme design decisions, ensuring that intent is translated into operational structures that can actually be executed.",
  },
  {
    label: "Institutional Governance Design and Process Mapping",
    desc: "Design of institutional governance arrangements, accountability structures, and operational processes that give programmes the organisational infrastructure needed to perform consistently under pressure.",
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
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Delivery</Link>
            <span>/</span>
            <span className="text-white font-semibold">Programme Design and Readiness Assessment</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.1</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Programme Design and<br />Readiness Assessment</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Supporting and advising on implementation-ready programme architectures, with the design rigour to close the gap between intent and execution.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We support and advise on programme design, not direct implementation at scale.
            Strong programme design, tested against institutional readiness, is the single
            most powerful predictor of implementation success.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            The Programme Design and Readiness Assessment sub-unit brings rigorous advisory
            support to the most consequential phase of any programme: the design stage.
            We recognise that in African development contexts, the gap between design intent
            and implementation reality is often a failure of design, not of execution.
            Our role is to close that gap before programmes launch, through sound architecture,
            honest readiness diagnostics, and advisory grounded in how institutions actually work.
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
            <p className="font-bold text-brand-navy">Commission programme design advisory?</p>
            <p className="text-brand-muted text-sm">We work with donors, governments, and implementers.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Discuss Programme Design
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
