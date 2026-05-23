import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Policy & Strategy Analysis and Development | Policy | Astellic",
  description:
    "Astellic's Policy & Strategy Analysis and Development sub-unit: national policy frameworks, sector strategy, political economy analysis, systems analysis, reform roadmaps, health systems, PFM advisory, and ministerial advisory.",
};

const services = [
  {
    label: "National Policy Framework and Sector Strategy Development",
    desc: "Design of national policies, sector strategies, and ministerial guidelines, grounded in evidence, aligned with political realities, and structured for implementation rather than decoration.",
  },
  {
    label: "Political Economy Analysis",
    desc: "Mapping the actors, interests, and institutional dynamics that determine whether reform efforts succeed or stall: essential for any policy initiative operating in complex political environments.",
  },
  {
    label: "Systems Analysis and Health Systems Analysis",
    desc: "Rigorous analysis of system-level constraints, governance structures, and institutional incentives within health, education, fiscal, and governance systems, providing the analytical foundation for credible reform design.",
  },
  {
    label: "Reform Roadmaps and Implementation Sequencing",
    desc: "End-to-end design of governance, health, education, and fiscal reform programmes, from situation analysis through reform logic, sequencing, and the political economy considerations that determine survivability.",
  },
  {
    label: "Public Financial Management Advisory",
    desc: "Advisory on PFM system design, budget analysis, fiscal reform, and intergovernmental fiscal relations, combining technical rigour with deep knowledge of how African public finance systems actually function.",
  },
  {
    label: "Ministerial and Institutional Advisory",
    desc: "Senior advisory to government ministries, development partners, and institutional clients on reform strategy, regulatory frameworks, and policy architecture, at the level where decisions are made.",
  },
  {
    label: "Evidence-to-Policy Translation and Donor Programme Design",
    desc: "Converting research findings and analytical outputs into actionable policy guidance and technical input to donor concept notes, proposals, and programme documents, ensuring that design decisions are evidence-based and implementable.",
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
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy</Link>
            <span>/</span>
            <span className="text-white font-semibold">Policy & Strategy Analysis and Development</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.1</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Policy & Strategy Analysis<br />and Development</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Translating evidence into actionable policy at the highest levels of government and donor engagement.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We design policies that are politically feasible, technically credible, and built
            to be implemented, not filed. This combines rigorous systems and political economy
            analysis with senior advisory and reform design.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            The Policy & Strategy Analysis and Development sub-unit combines technical policy expertise
            with deep systems analysis and institutional knowledge of how African public systems actually
            work. We understand that a technically correct policy that ignores political economy,
            institutional capacity, or implementation sequencing is not a policy; it is a document.
            Every framework, guideline, and reform roadmap we produce is designed to survive in practice.
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
            <p className="font-bold text-brand-navy">Commission policy advisory?</p>
            <p className="text-brand-muted text-sm">We work with ministries, development partners, and institutions.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Discuss Policy Advisory
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
