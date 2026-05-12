import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Policy & Strategy Development | Policy Advisory | Astellic",
  description:
    "Astellic's Policy & Strategy Development sub-unit — national policy frameworks, sector strategies, ministerial guidelines, and reform programme design.",
};

const services = [
  {
    label: "National Policy Framework Development",
    desc: "Design of national policies, sector strategies, and ministerial guidelines, grounded in evidence, aligned with political realities, and structured for implementation rather than decoration.",
  },
  {
    label: "Senior-Level Strategic Advisory",
    desc: "Advisory to government ministries, development partners, and institutional clients on reform strategy, organisational design, and policy architecture, at the level where decisions are made.",
  },
  {
    label: "Reform Programme Design",
    desc: "End-to-end design of governance, health, education, and fiscal reform programmes, from situation analysis through reform logic, sequencing, and the political economy considerations that determine survivability.",
  },
  {
    label: "Donor Programme Design Support",
    desc: "Technical input to concept notes, proposals, and programme documents for donor-funded initiatives, ensuring that design decisions are evidence-based, implementable, and aligned with national policy frameworks.",
  },
  {
    label: "Regulatory Framework Development",
    desc: "Design and review of regulatory frameworks, institutional guidelines, and policy instruments that create the enabling environment for effective service delivery and system performance.",
  },
];

export default function StrategyDevelopmentPage() {
  return (
    <>
      <section className="bg-brand-teal text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-teal-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy & Advisory</Link>
            <span>/</span>
            <span className="text-white font-semibold">Policy & Strategy Development</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.1</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Policy & Strategy<br />Development</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Translating evidence into actionable policy at the highest levels of government and donor engagement.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We design policies that are politically feasible, technically credible, and built
            to be implemented, not filed. This is Astellic&apos;s most senior advisory function.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            The Policy & Strategy Development sub-unit combines technical policy expertise with deep
            institutional knowledge of how African public systems actually work. We understand that
            a technically correct policy that ignores political economy, institutional capacity, or
            implementation sequencing is not a policy; it is a document. Every framework, guideline,
            and reform roadmap we produce is designed to survive in practice.
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
            <p className="font-bold text-brand-navy">Commission policy advisory?</p>
            <p className="text-brand-muted text-sm">We work with ministries, development partners, and institutions.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
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
