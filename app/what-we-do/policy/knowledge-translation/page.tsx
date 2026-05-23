import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Knowledge Translation and Advisory | Policy | Astellic",
  description:
    "Astellic's Knowledge Translation and Advisory sub-unit: converting technical evidence into actionable communications, systems strengthening, capacity development, and embedded institutional advisory.",
};

const services = [
  {
    label: "Knowledge Translation",
    desc: "Converting complex research findings, policy analysis, and evaluation insights into accessible, decision-relevant briefs, infographics, and summaries, designed for ministers, legislators, donors, and senior officials who need clarity, not complexity.",
  },
  {
    label: "Strategic Communications for Reform",
    desc: "Development of communication strategies for reform programmes, policy launches, and institutional change initiatives, including stakeholder engagement design, media strategy, and narrative development for high-stakes reform environments.",
  },
  {
    label: "Systems Strengthening",
    desc: "Working within governments and public institutions to strengthen governance structures, accountability frameworks, and institutional systems, building the enduring capability through which sustained performance becomes possible.",
  },
  {
    label: "Capacity Development Advisory",
    desc: "Structured approaches to institutional capacity strengthening, combining technical assistance, coaching, and embedded advisory to build genuine capability rather than compliance-driven training outputs.",
  },
  {
    label: "Embedded Institutional Advisory",
    desc: "Senior advisory embedded within government ministries, public institutions, and programme teams, providing the technical depth and institutional intelligence needed to translate strategic intent into sustained operational performance.",
  },
  {
    label: "Stakeholder Engagement Design",
    desc: "Structured stakeholder mapping, engagement sequencing, and consultation design, ensuring reform and policy processes are technically led, politically intelligent, and positioned to build the coalitions that reform requires.",
  },
];

export default function KnowledgeTranslationPage() {
  return (
    <>
      <section className="bg-brand-teal text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-teal-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy</Link>
            <span>/</span>
            <span className="text-white font-semibold">Knowledge Translation and Advisory</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Knowledge Translation<br />and Advisory</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Converting evidence into decisions: through communications, advisory, and the institutional capability to act.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            In the development sector, the gap between what is known and what is decided is often
            a communications failure, not an evidence failure. We close that gap, converting
            technical outputs into narratives that shift understanding, and building the
            institutional capability that allows organisations to act on what they know.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Evidence without communication is an institutional asset that nobody uses.
            Advisory without capability building creates dependency, not performance.
            This sub-unit ensures that Astellic&apos;s evidence and advisory work reaches,
            influences, and is acted upon by the decision-makers it is designed to inform,
            while building the systems and institutional capacity through which clients
            can sustain that performance long after the engagement concludes.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl p-6 lift">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-teal">{s.label}</h3>
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
            <p className="font-bold text-brand-navy">Make your evidence matter?</p>
            <p className="text-brand-muted text-sm">We work with research teams, governments, and programme leads.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Discuss Knowledge Translation
            </Link>
            <Link href="/what-we-do/policy" className="bg-brand-teal text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal/90 transition-colors">
              Back to Pillar 02
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
