import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Technical Assistance & Institutional Development | Implementation | Astellic",
  description:
    "Astellic's Technical Assistance & Institutional Development sub-unit — sustained embedded advisory that builds institutional capability and knowledge within government and implementing organisations.",
};

const services = [
  {
    label: "Embedded Technical Assistance",
    desc: "Placement of Astellic technical advisors within government ministries, programme management units, and implementing organisations, providing real-time analytical support, capacity building, and adaptive management guidance over sustained periods.",
  },
  {
    label: "Institutional Development",
    desc: "Structured organisational development support, including governance design, process mapping, performance management frameworks, and systems strengthening, building institutional capability, not dependence.",
  },
  {
    label: "Policy Analysis Masterclass",
    desc: "Astellic's proprietary training programme for senior government and development sector professionals, building analytical capability for evidence-to-policy translation in African institutional contexts.",
  },
  {
    label: "Health Financing Essentials",
    desc: "A structured training programme equipping health ministry officials, development partners, and programme managers with the health economics and health financing concepts that underpin sound investment decisions.",
  },
  {
    label: "MERL for Development Programmes & Evidence-to-Policy Practicum",
    desc: "Practical, application-focused training on monitoring, evaluation, research, and learning, and on the craft of translating evidence into policy action in real institutional environments.",
  },
];

export default function TechnicalAssistancePage() {
  return (
    <>
      <section className="text-white py-20 px-6" style={{ backgroundColor: "#3B7D23" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-green-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/implementation" className="hover:text-white transition-colors">Implementation</Link>
            <span>/</span>
            <span className="text-white font-semibold">Technical Assistance & Institutional Development</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 3.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Technical Assistance &<br />Institutional Development</h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Sustained embedded advisory that builds institutional capability, not dependence.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We distinguish Astellic from short-term consultancies by offering structured,
            long-duration embedded advisory, deploying senior technical advisors within
            client institutions to build knowledge and the institutional routines that
            sustain performance after the engagement ends.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Short-term technical assistance that leaves when the contract ends is the
            development sector&apos;s most common form of capacity failure.
            This sub-unit is designed around a fundamentally different premise:
            that genuine institutional development requires sustained, embedded presence:
            advisors who understand the institution&apos;s culture, constraints, and politics
            deeply enough to build capability that stays. Every TA engagement we design is
            structured to make itself unnecessary.
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
            <p className="font-bold text-brand-navy">Commission embedded technical assistance?</p>
            <p className="text-brand-muted text-sm">We work with governments, programme units, and donors.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
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
