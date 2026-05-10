import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programme Design & Implementation | Astellic",
  description:
    "Astellic's Programme Design & Implementation pillar — designing and delivering programmes that work in the institutional realities of African public systems.",
};

const subUnits = [
  {
    num: "3.1",
    title: "Programme Design & Innovation",
    tagline: "Translating strategic intent into implementation-ready programme architectures with a measurable design advantage.",
    desc: "We develop theories of change, results frameworks, operational models, and implementation plans that are simultaneously technically sound and operationally realistic. We apply an innovation lens — testing new delivery models, piloting unconventional approaches, and building proprietary tools such as the Astellic Implementation Readiness Assessment — to give clients a design advantage before implementation begins. A strong programme design is the single most powerful predictor of implementation success.",
    services: [
      "Complete programme architecture — theory of change, results chain, operational model, and risk framework",
      "Implementation Readiness Assessment — a proprietary diagnostic for identifying design and systemic barriers before launch",
      "Innovation and rapid prototyping of new delivery models and approaches",
      "Financing architecture design — budget justification, cost modelling, and sub-grant design",
      "AI-augmented research and programme design services",
    ],
    href: "/what-we-do/implementation/programme-design",
  },
  {
    num: "3.2",
    title: "Technical Assistance & Institutional Development",
    tagline: "Sustained embedded advisory that builds institutional capability — not dependence.",
    desc: "This sub-unit provides sustained, embedded advisory support to government institutions, implementing organisations, and programme management units. We distinguish Astellic from short-term consultancies by offering structured, long-duration embedded advisory — deploying Astellic associates and senior technical advisors within client institutions to build both technical knowledge and the institutional routines that sustain performance after the engagement ends.",
    services: [
      "Embedded technical assistance — Astellic advisors placed within government ministries and programme management units",
      "Institutional development — governance design, process mapping, and performance management frameworks",
      "Organisational development support and systems strengthening",
      "Executive education — Policy Analysis Masterclass, Health Financing Essentials, MERL for Development Programmes",
      "Evidence-to-Policy Practicum for senior government and development sector professionals",
    ],
    href: "/what-we-do/implementation/technical-assistance",
  },
  {
    num: "3.3",
    title: "Programme Implementation & Adaptive Management",
    tagline: "Direct delivery with the adaptive management systems to course-correct in real time.",
    desc: "This sub-unit is where Astellic acts as programme implementer, consortium lead, or technical implementing partner on donor-funded and government programmes. We apply adaptive management principles throughout the implementation cycle — ensuring that learning from our Evaluation & Learning function continuously shapes delivery decisions. This is the commercial engine of Pillar 03 and the proving ground for Astellic's credibility as a full-spectrum delivery partner.",
    services: [
      "End-to-end programme management — financial management, sub-contractor coordination, and donor reporting",
      "Adaptive management — real-time integration of monitoring data into programme decision-making",
      "Consortium leadership and coordination of multi-organisational partnerships",
      "Technical implementing partner services for donor-funded and government programmes",
      "Real-time monitoring, learning, and course-correction systems embedded in programme delivery",
    ],
    href: "/what-we-do/implementation/adaptive-management",
  },
];

const offerings = [
  "Theory of change and results framework development",
  "Programme architecture design and operational modelling",
  "Implementation Readiness Assessment",
  "Embedded technical assistance to governments and programme units",
  "Institutional development and capacity strengthening",
  "Executive education and professional training",
  "Programme implementation and end-to-end management",
  "Adaptive management and real-time course-correction",
  "Consortium leadership for large-scale programmes",
];

export default function ImplementationPillarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-24 px-6 overflow-hidden" style={{ backgroundColor: "#3B7D23" }}>
        <Image
          src="/images/hero-approach.jpg"
          alt="Programme implementation and delivery"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/what-we-do" className="text-green-100 hover:text-white text-sm transition-colors">
              What We Do
            </Link>
            <span className="text-green-300">/</span>
            <span className="text-white/70 text-sm font-semibold">Pillar 03</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Programme Design<br />& Implementation
          </h1>
          <p className="text-green-100 text-lg font-medium mb-4">
            Designing and delivering programmes that work — not on paper, but in the institutional realities of African public systems.
          </p>
          <p className="text-green-50 text-lg max-w-2xl leading-relaxed opacity-90">
            This is where Astellic&apos;s analysis becomes action. We design implementation-ready
            interventions and deliver them with adaptive management systems that ensure real-world
            complexity is met with real-time intelligence.
          </p>
        </div>
      </section>

      {/* Sub-units */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-14">
          {subUnits.map((s) => (
            <div key={s.num} className="border-l-4 border-brand-green pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white bg-brand-green px-2 py-0.5 rounded">{s.num}</span>
                <h2 className="text-xl font-bold text-brand-green">{s.title}</h2>
              </div>
              <p className="text-brand-muted italic text-sm mb-4">{s.tagline}</p>
              <p className="text-gray-700 leading-relaxed mb-6">{s.desc}</p>
              <div className="bg-brand-light rounded-xl p-5 space-y-2 mb-5">
                <p className="text-xs font-bold text-brand-green uppercase tracking-wide mb-3">Service Offerings</p>
                {s.services.map((svc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    {svc}
                  </div>
                ))}
              </div>
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-brand-green font-semibold text-sm hover:gap-3 transition-all"
              >
                Learn more about {s.title}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Full offerings */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-brand-navy mb-8 text-center">Implementation Pillar — Full Service Range</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {offerings.map((o, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-1.5 shrink-0" />
                {o}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related pillars */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-brand-navy mb-3">Implementation is the output of the full delivery system.</h2>
          <p className="text-brand-muted mb-8">
            Our programmes are designed using evidence from Pillar 01 and structured on policy
            frameworks from Pillar 02 — ensuring that every delivery decision is grounded in
            rigorous analysis and strategic intent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/what-we-do/evidence" className="border border-brand-navy text-brand-navy px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-navy hover:text-white transition-colors">
              ← Pillar 01: Evidence Generation & Verification
            </Link>
            <Link href="/what-we-do/policy" className="border border-brand-teal text-brand-teal px-6 py-2.5 rounded font-medium text-sm hover:bg-brand-teal hover:text-white transition-colors">
              ← Pillar 02: Policy Development & Advisory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
