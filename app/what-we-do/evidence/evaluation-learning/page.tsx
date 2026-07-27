import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Monitoring, Evaluation, Accountability & Learning (MEAL) | Evidence | Astellic",
  description:
    "Astellic's MEAL sub-unit: Third-Party Monitoring (TPM), Independent Verification & Validation (IV&V), adaptive MEL, real-time learning systems, data quality assessments, baseline/midline/endline studies, process monitoring, outcome & impact evaluations, learning agendas, and adaptive management systems.",
};

// Signature capabilities — the independent-assurance and adaptive-learning
// offerings donors procure by name.
const signature = [
  {
    label: "Third-Party Monitoring (TPM)",
    desc: "Independent, on-the-ground verification that activities and outputs are delivered as reported — including in remote or hard-to-reach settings — giving funders assurance where they cannot monitor directly.",
  },
  {
    label: "Independent Verification & Validation (IV&V)",
    desc: "Arms-length checking of reported results, disbursement-linked indicators, and data against source evidence, so donors and governments can rely on what implementers report.",
  },
  {
    label: "Adaptive Monitoring, Evaluation & Learning",
    desc: "MEL systems designed to feed evidence back into decisions within the programme cycle, so teams course-correct on what the data actually shows rather than on the original logframe.",
  },
  {
    label: "Real-Time Learning Systems Design & Implementation",
    desc: "Dashboards, feedback loops, and structured review routines that turn monitoring data into timely, usable learning for programme and oversight teams.",
  },
];

// Core MEAL services — the standard catalogue underpinning every engagement.
const core = [
  {
    label: "Data Quality Assessments (DQAs)",
    desc: "Structured assessment of the accuracy, completeness, and reliability of programme data and M&E systems, with practical recommendations to close the gaps.",
  },
  {
    label: "Baseline, Midline & Endline Studies",
    desc: "Rigorous measurement at each stage of a programme to establish the starting point, track progress, and evidence results with methodological credibility.",
  },
  {
    label: "Process Monitoring",
    desc: "Systematic tracking of how implementation actually unfolds — fidelity, bottlenecks, and delivery quality — not just whether targets are met.",
  },
  {
    label: "Outcome & Impact Evaluations",
    desc: "Independent evaluation of what a programme changed and why, using designs matched to the question and the evidence standard the decision requires.",
  },
  {
    label: "Learning Agendas",
    desc: "Structured learning questions and evidence plans that align monitoring, evaluation, and research to the decisions a programme or portfolio actually needs to make.",
  },
  {
    label: "Adaptive Management Systems",
    desc: "Governance and decision routines — including accountability and feedback mechanisms — that convert MEAL evidence into management action, so learning consistently drives adaptation.",
  },
];

function ServiceCard({ label, desc, i }: { label: string; desc: string; i: number }) {
  return (
    <Reveal variant="up" delay={i * 60}>
      <div className="bg-brand-light rounded-xl p-6 lift">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-2 shrink-0" />
          <h3 className="font-bold text-brand-navy">{label}</h3>
        </div>
        <p className="text-brand-muted text-sm leading-relaxed pl-4">{desc}</p>
      </div>
    </Reveal>
  );
}

export default function MEALPage() {
  return (
    <>
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
            <Link href="/what-we-do" className="hover:text-white transition-colors">What We Do</Link>
            <span>/</span>
            <Link href="/what-we-do/evidence" className="hover:text-white transition-colors">Evidence</Link>
            <span>/</span>
            <span className="text-brand-gold">MEAL</span>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sub-unit 1.2</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">Monitoring, Evaluation, Accountability &amp; Learning (MEAL)</h1>
          <p className="text-brand-gold text-lg font-medium mb-4">
            Independent monitoring, verification, and evaluation — building the conditions for evidence that donors and governments can trust and act on.
          </p>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            We go beyond compliance-driven monitoring to design and deliver MEAL systems that genuinely
            improve how programmes perform — combining independent third-party monitoring and verification
            with rigorous evaluation, accountability mechanisms, and real-time learning. Data quality and
            integrity are embedded throughout, not bolted on at the end.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            As donors intensify demands for independent assurance, evidence, and value-for-money, MEAL is one
            of Astellic&apos;s fastest-growing and most strategically significant offerings. We provide the
            independent monitoring and verification funders increasingly require, alongside the evaluation,
            accountability, and adaptive-learning systems that make programmes work — because measurement
            without integrity is an expensive exercise in accountability theatre. Evidence has to be trusted
            to be used.
          </p>

          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-5">Signature Capabilities</h2>
          <div className="space-y-6 mb-14">
            {signature.map((s, i) => <ServiceCard key={s.label} {...s} i={i} />)}
          </div>

          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-5">Core MEAL Services</h2>
          <div className="space-y-6">
            {core.map((s, i) => <ServiceCard key={s.label} {...s} i={i} />)}
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <p className="font-bold text-brand-navy">Commission third-party monitoring, an evaluation, or a MEAL system?</p>
            <p className="text-brand-muted text-sm">We work with implementers, donors, and governments.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors">
              Get in Touch
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
