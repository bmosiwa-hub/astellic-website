import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Systems Strengthening & Advisory | Policy Advisory | Astellic",
  description:
    "Astellic's Systems Strengthening & Advisory sub-unit — embedded institutional development that builds genuine capability within governments and public institutions.",
};

const services = [
  {
    label: "Public Financial Management Systems",
    desc: "Design and strengthening of PFM systems — budget processes, expenditure control, financial reporting, and audit mechanisms — building the fiscal infrastructure that makes accountable governance possible.",
  },
  {
    label: "Health Information System Strengthening",
    desc: "Design, improvement, and institutionalisation of health information systems that generate reliable data for subnational planning, programme management, and national health policy decisions.",
  },
  {
    label: "Governance & Accountability Frameworks",
    desc: "Design of accountability frameworks, intergovernmental coordination mechanisms, and governance structures — grounded in political economy analysis and calibrated for the institutional realities of each context.",
  },
  {
    label: "Capacity Strengthening",
    desc: "Structured technical assistance, coaching, and embedded advisory — building genuine institutional capability in partner governments and organisations, not dependence on external advisors.",
  },
  {
    label: "Anti-Corruption System Design",
    desc: "Advisory on anti-corruption institutional design, legislative effectiveness, and transparency systems — approached as a political economy and governance challenge, not a technical compliance exercise.",
  },
];

export default function SystemsStrengtheningPage() {
  return (
    <>
      <section className="bg-brand-teal text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-teal-200 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/policy" className="hover:text-white transition-colors">Policy & Advisory</Link>
            <span>/</span>
            <span className="text-white font-semibold">Systems Strengthening & Advisory</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 2.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Systems Strengthening<br />& Advisory</h1>
          <p className="text-teal-100 text-lg font-medium mb-4">
            Embedded institutional development that builds genuine capability — not dependence.
          </p>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed opacity-90">
            We work within governments and public institutions to build the enduring systems and
            governance structures through which sustained performance becomes possible —
            distinguishing Astellic from firms that deliver recommendations without building
            the absorptive capacity to act on them.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            The difference between advice and change is institutional capability. This sub-unit
            operates at the intersection of technical advisory and institutional transformation.
            We do not simply tell institutions what to do — we work within them, building
            the systems, processes, and human capability through which they can perform
            and sustain that performance independently. Every engagement is designed to leave
            the institution stronger, not more dependent on external expertise.
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
            <p className="font-bold text-brand-navy">Strengthen your institution&apos;s systems?</p>
            <p className="text-brand-muted text-sm">We work with governments, programme units, and implementing organisations.</p>
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
