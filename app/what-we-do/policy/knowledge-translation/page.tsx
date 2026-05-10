import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Knowledge Translation & Strategic Communications | Policy Advisory | Astellic",
  description:
    "Astellic's Knowledge Translation & Strategic Communications sub-unit — converting technical outputs into policy narratives and communications that catalyse action.",
};

const services = [
  {
    label: "Knowledge Translation",
    desc: "Converting complex research findings, policy analysis, and evaluation insights into accessible, decision-relevant briefs, infographics, and summaries — designed for ministers, legislators, donors, and senior officials who need clarity, not complexity.",
  },
  {
    label: "Strategic Communications for Reform",
    desc: "Development of communication strategies for reform programmes, policy launches, and institutional change initiatives — including stakeholder engagement design, media strategy, and narrative development.",
  },
  {
    label: "Policy Intelligence Briefs",
    desc: "Production of Astellic&apos;s flagship Policy Intelligence Brief series — concise, analytically grounded documents positioning our evidence and advisory work as a trusted intellectual resource for decision-makers.",
  },
  {
    label: "Thought Leadership & Publishing",
    desc: "The Astellic Implementation Review, case study series, and sector-specific commentary — positioning the firm as a trusted intellectual voice in African development while building long-term inbound credibility.",
  },
  {
    label: "Stakeholder Engagement Design",
    desc: "Structured approaches to stakeholder mapping, engagement sequencing, and consultation design — ensuring reform and policy processes are technically led and politically intelligent.",
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
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy & Advisory</Link>
            <span>/</span>
            <span className="text-white font-semibold">Knowledge Translation</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.3</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Knowledge Translation &<br />Strategic Communications</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Closing the gap between what is known and what is decided.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            In the development sector, the gap between what is known and what is decided is often
            a communications failure, not an evidence failure. We close that gap — converting
            technical outputs into narratives that shift understanding and catalyse action at the
            level of the decision-maker.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Evidence without communication is an institutional asset that nobody uses.
            This sub-unit ensures that Astellic&apos;s evidence and advisory work reaches,
            influences, and is acted upon by the decision-makers it is designed to inform.
            Whether we are launching a national health policy, communicating a reform strategy
            to parliament, or positioning a knowledge product for donor audiences, we build
            the communications strategy that makes the evidence count.
          </p>
          <div className="space-y-6">
            {services.map((s, i) => (
              <div key={i} className="bg-brand-light rounded-xl p-6">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                  <h3 className="font-bold text-brand-teal">{s.label}</h3>
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
            <p className="font-bold text-brand-navy">Make your evidence matter?</p>
            <p className="text-brand-muted text-sm">We work with research teams, governments, and programme leads.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
            </Link>
            <Link href="/what-we-do/policy" className="border border-brand-teal text-brand-teal px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal hover:text-white transition-colors">
              ← Back to Pillar 02
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
