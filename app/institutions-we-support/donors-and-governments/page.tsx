import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donors & Governments | Institutions We Support | Astellic",
  description:
    "Astellic helps bilateral donors, multilateral funders, and national governments strengthen evidence systems, improve aid effectiveness, and translate policy into measurable results.",
};

const services = [
  {
    title: "Programme Evaluation & Impact Assessment",
    description:
      "We design and conduct rigorous evaluations — formative, process, summative, and impact — that give funders and governments credible evidence on what their investments are achieving. Our evaluations are built for use, not just reporting.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Public Financial Management Support",
    description:
      "We work with national and subnational governments to strengthen budget systems, expenditure tracking, and accountability frameworks — ensuring public resources reach intended beneficiaries and deliver value for money.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    title: "Policy Development & Strategic Advisory",
    description:
      "From sector strategy to legislative frameworks, we provide evidence-grounded policy advisory that bridges technical analysis and political economy realities. We help clients develop policies that are both technically sound and institutionally feasible.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Aid Effectiveness & Portfolio Review",
    description:
      "We help bilateral and multilateral donors assess the effectiveness of their portfolios — identifying patterns of success and failure across programmes, countries, and sectors to sharpen future investment decisions.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "National Data & Evidence Systems",
    description:
      "We support governments to build sustainable national data systems — from routine health information to civil registration, agricultural surveys, and social protection registers — that produce timely, reliable data for decision-making.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "Institutional Capacity Strengthening",
    description:
      "Beyond advisory, we build lasting institutional capacity through embedded technical assistance, training, and co-creation of systems that governments and agencies can own and operate long after our engagement ends.",
    icon: (
      <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
];

const clientTypes = [
  { label: "Bilateral Donors", desc: "USAID, FCDO, GIZ, Sida, AFD, and other country-to-country aid programmes" },
  { label: "Multilateral Agencies", desc: "World Bank, African Development Bank, IMF, EU, and other multilateral financiers" },
  { label: "National Governments", desc: "Line ministries, planning commissions, and treasury departments across Africa" },
  { label: "Subnational Authorities", desc: "Regional and district governments implementing decentralised programmes" },
  { label: "Central Banks & Regulators", desc: "Financial regulators and monetary authorities strengthening oversight systems" },
  { label: "Parliamentary Bodies", desc: "Budget committees, oversight bodies, and accountability institutions" },
];

const approach = [
  {
    step: "01",
    title: "Understand the System",
    desc: "We begin by mapping the policy environment, institutional landscape, and political economy — not just the technical problem. Every recommendation accounts for what is feasible in context.",
  },
  {
    step: "02",
    title: "Build the Evidence Base",
    desc: "We draw on primary data collection, existing administrative data, and comparative evidence from similar contexts to ground our analysis in what the data actually shows.",
  },
  {
    step: "03",
    title: "Co-develop Solutions",
    desc: "Our advisory products are developed collaboratively with client teams. We build shared ownership from the start so our recommendations don't sit on shelves.",
  },
  {
    step: "04",
    title: "Support Implementation",
    desc: "We stay engaged through the implementation phase — providing technical backstopping, adaptive management support, and course-correction as realities on the ground emerge.",
  },
];

export default function DonorsAndGovernmentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Donors and Governments"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-brand-gold font-semibold tracking-widest uppercase mb-4">
            <Link href="/institutions-we-support" className="hover:text-white transition-colors">
              Institutions We Support
            </Link>
            <span className="text-white/40">›</span>
            <span>Donors &amp; Governments</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Donors &amp; Governments
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Closing the gap between funding intent and measurable outcomes.
            We help donors and governments build the systems, evidence, and
            institutional capacity to make their investments count.
          </p>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-navy mb-5">
              The Challenge We Solve Together
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed mb-5">
              Donors and governments invest substantial resources in development programming — but too
              often, the evidence needed to know what works, what does not, and why, is fragmented,
              delayed, or disconnected from decision-making. Policy reforms are designed without
              adequate data. Programmes are scaled before they are proven. Budgets are allocated
              based on precedent rather than performance.
            </p>
            <p className="text-brand-muted text-lg leading-relaxed">
              Astellic exists to bridge that gap. We work alongside donor agencies and government
              institutions to generate credible evidence, develop actionable policy, and build
              the systems that make adaptive management possible — not as a one-off engagement,
              but as a sustained partnership oriented toward institutional change.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "Evidence-Led", sub: "Every recommendation grounded in data" },
              { stat: "Context-Sensitive", sub: "Solutions built for local realities" },
              { stat: "Results-Oriented", sub: "Focused on measurable outcomes" },
              { stat: "Capacity-Building", sub: "Systems that outlast the engagement" },
            ].map((item) => (
              <div key={item.stat} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-brand-gold font-bold text-lg mb-1">{item.stat}</p>
                <p className="text-brand-muted text-sm leading-snug">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">What We Deliver</h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">
              Our services for donors and governments span the full cycle from evidence generation
              through to policy and implementation support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center mb-5">
                  {svc.icon}
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-3">{svc.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Who We Work With</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              Our donor and government portfolio spans the full landscape of public sector
              and development finance institutions.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clientTypes.map((ct) => (
              <div key={ct.label} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="w-2 h-6 bg-brand-gold rounded-full mb-4" />
                <h3 className="font-bold text-brand-navy mb-2">{ct.label}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{ct.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our approach / process */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">How We Work</h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto">
              Our approach is rigorous, collaborative, and oriented toward lasting institutional change.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {approach.map((step) => (
              <div key={step.step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <span className="text-brand-gold font-bold text-sm">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy mb-2">{step.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Work Together?</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Whether you are a donor designing a new portfolio, a government ministry building
            a data system, or a development agency seeking an evaluation partner — we would
            like to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              Get in Touch
            </Link>
            <Link
              href="/our-projects"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded transition-colors"
            >
              See Our Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
