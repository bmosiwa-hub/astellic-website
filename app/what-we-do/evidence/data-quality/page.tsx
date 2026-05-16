import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Data Quality & Research Integrity | Evidence Generation | Astellic",
  description:
    "Astellic's Data Quality, Verification & Research Integrity sub-unit — ensuring every evidence output meets the highest standards of methodological rigour and ethical compliance.",
};

const services = [
  {
    label: "Data Quality Assurance",
    desc: "Internal and client-facing protocols for verifying data accuracy, completeness, and reliability, applied to Astellic's own research outputs and to data systems used in programmes we evaluate.",
  },
  {
    label: "Research Ethics Compliance",
    desc: "End-to-end management of ethical review processes, informed consent frameworks, and data protection compliance, aligned with international standards including the Helsinki Declaration and Malawi Research Ethics Committee requirements.",
  },
  {
    label: "Internal Peer Review",
    desc: "A structured peer review process applied to all Astellic research and evaluation outputs, ensuring methodological defensibility and client confidence before any deliverable reaches an external audience.",
  },
  {
    label: "Client-Facing Data Verification",
    desc: "Independent verification of data and evidence that clients intend to present to donors or governments, identifying weaknesses and strengthening the evidentiary basis before high-stakes submissions.",
  },
  {
    label: "Research Integrity Capacity Building",
    desc: "Training and advisory to research teams and implementing organisations on ethical research practice, data quality standards, and integrity protocols, building institutional capability for sustained compliance.",
  },
];

export default function DataQualityPage() {
  return (
    <>
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/evidence" className="hover:text-white transition-colors">Evidence Generation</Link>
            <span>/</span>
            <span className="text-brand-gold">Data Quality & Research Integrity</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 1.3</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Data Quality &<br />Research Integrity</h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            A strategic differentiator: ensuring every evidence output meets the highest standards of methodological rigour and ethical compliance.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            In a sector where weak evidence undermines both policy design and donor confidence,
            Astellic&apos;s explicit commitment to research integrity is both a quality control
            mechanism and a competitive positioning statement.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            This sub-unit is a deliberate differentiator in the African development consulting market.
            Most firms treat data quality and ethics as compliance afterthoughts.
            At Astellic, they are built into every stage of the research cycle, because we know
            that the authority of evidence depends entirely on the integrity of the process
            through which it was produced. We apply this standard to our own work and, when
            commissioned, to the evidence our clients intend to use in high-stakes policy and donor environments.
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
            <p className="font-bold text-brand-navy">Need an independent data quality review?</p>
            <p className="text-brand-muted text-sm">We work with research teams, donors, and implementers.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Request a Data Quality Audit
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
