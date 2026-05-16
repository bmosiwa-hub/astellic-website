import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Work | Astellic",
  description:
    "Astellic's research, advisory, and implementation support engagements across African health, governance, and development systems. Institutional storytelling, not project catalogues.",
};

// Anonymised or attributed case narratives — structured as institutional stories
const engagements = [
  {
    type: "Research & Evaluation",
    typeColor: "bg-brand-gold",
    sector: "Health Systems",
    geography: "Malawi",
    title: "Political Economy Analysis of TB Care Access",
    challenge: "A bilateral donor needed to understand why tuberculosis care coverage in Malawi remained persistently low despite health system investments. Service availability was not the problem. The question was what was preventing uptake — and whether the barriers were technical or political.",
    contribution: "Conducted a full political economy analysis examining the actors, interests, institutional dynamics, and gender dimensions shaping TB care access at national and subnational levels. Findings challenged the prevailing technical framing and identified systemic incentive misalignments at ministry level.",
    result: "Research contributed to a peer-reviewed publication in World Medical & Health Policy (2025) and directly informed donor strategy on health financing reform in Malawi.",
    attribution: "Dr. Benjamin Azariah Mosiwa (lead author)",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
  },
  {
    type: "Policy Advisory",
    typeColor: "bg-brand-navy",
    sector: "Primary Health Care",
    geography: "Multi-country (Africa)",
    title: "Foundations for Responsive Primary Health Care",
    challenge: "A global health implementing organisation needed a practical, evidence-based guide for policymakers on what it actually takes to build responsive primary health care systems — not aspirational frameworks, but operationally honest guidance grounded in what works in resource-constrained settings.",
    contribution: "Led the research design, evidence synthesis, and drafting of a major policy report drawing on health systems data and field experience across Africa. The guide addressed financing, governance, community systems, and implementation readiness in an integrated framework.",
    result: "Published by VillageReach (2025) as a flagship policy resource. Distributed to government ministries and development partners across Africa.",
    attribution: "Dr. Benjamin Azariah Mosiwa (co-author)",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
  },
  {
    type: "Policy Advisory",
    typeColor: "bg-brand-navy",
    sector: "Digital Health & Regulation",
    geography: "Pan-African",
    title: "Africa Telehealth Regulatory Mapping",
    challenge: "The digital health landscape in Africa is expanding rapidly, with telehealth platforms operating across diverse and often unclear regulatory environments. A development sector partner needed a comprehensive mapping of the regulatory landscape to inform investment readiness and policy advocacy strategies.",
    contribution: "Conducted a multi-country regulatory analysis mapping telehealth governance frameworks, identifying regulatory gaps, investment barriers, and policy advocacy entry points. Presented findings at the HELINA Conference (Botswana, 2025).",
    result: "Informed a regional digital health advocacy strategy and contributed to evidence base for regulatory reform dialogue across multiple African countries.",
    attribution: "Dr. Benjamin Azariah Mosiwa (lead analyst)",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
  },
  {
    type: "Research",
    typeColor: "bg-brand-gold",
    sector: "HIV & Market Systems",
    geography: "Malawi",
    title: "Market Intelligence Analysis — HIV & TB Products",
    challenge: "A legal and health advocacy organisation needed market intelligence on priority HIV and TB commodity supply chains in Malawi to inform procurement reform advocacy and assess whether current market structures were producing optimal access and pricing outcomes.",
    contribution: "Conducted a full market intelligence analysis examining supply chain dynamics, pricing patterns, procurement behaviour, and regulatory constraints for priority HIV and TB products. Provided strategic recommendations on market reform entry points.",
    result: "Published analysis used by KELIN Kenya (2025) to support procurement reform advocacy in Malawi.",
    attribution: "Dr. Benjamin Azariah Mosiwa (author)",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
  },
  {
    type: "Health Systems Advisory",
    typeColor: "bg-brand-teal",
    sector: "Health Financing & Governance",
    geography: "Malawi, Kenya, Nigeria, Zambia",
    title: "Government Capacity Building in Health Financing",
    challenge: "A pan-African policy research institute was supporting governments across the region to strengthen their capacity to lead health financing reform — but many ministries lacked the institutional capacity to analyse health financing data, make evidence-based budget decisions, or engage effectively with donors on reform priorities.",
    contribution: "Provided sustained research and policy advisory support across four countries, conducting health financing research, building government technical capacity, and supporting evidence-informed dialogue between governments and development partners on UHC financing reform.",
    result: "Contributed to strengthened analytical capacity in four national health ministries and informed national health financing strategies across the region.",
    attribution: "Dr. Benjamin Azariah Mosiwa (Research & Policy Associate, AFIDEP)",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
  },
];

const upcomingCapabilities = [
  "Adaptive MERL system design for donor-funded programmes",
  "Independent data quality audits (DQA) for government programmes",
  "Implementation readiness reviews before programme launch",
  "Political economy analysis for reform strategy",
  "Independent programme evaluation (formative, summative, impact)",
  "Corporate social investment strategy and measurement",
];

export default function OurProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic work in the field"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Our Work
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Not a portfolio. An institutional track record.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            These are the institutional challenges we have addressed, the systems we
            have analysed, and the advisory contributions that have shaped policy and delivery.
          </p>
        </div>
      </section>

      {/* Approach statement */}
      <section className="py-12 px-6 bg-brand-light border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-brand-muted text-base leading-relaxed max-w-2xl">
              Astellic is a young firm with a founder who brings over a decade of senior experience.
              The engagements below reflect the track record that preceded and informed the firm.
              We present them as institutional narratives — what the challenge was, what we contributed,
              and what it produced — not as a catalogue of project names.
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-brand-gold font-bold text-3xl">30+</p>
            <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">consulting engagements</p>
            <p className="text-gray-400 text-xs mt-1">15+ global partners and donors</p>
          </div>
        </div>
      </section>

      {/* Engagement narratives */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Selected Engagements</h2>
          </div>

          {engagements.map((eng, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-start justify-between gap-4 px-7 py-5 border-b border-gray-50">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold text-white ${eng.typeColor} px-3 py-1 rounded-full`}>
                    {eng.type}
                  </span>
                  <span className="text-xs font-semibold text-brand-muted bg-brand-light px-3 py-1 rounded-full">
                    {eng.sector}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {eng.geography}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${eng.statusColor}`}>
                  {eng.status}
                </span>
              </div>

              {/* Card body */}
              <div className="px-7 py-6">
                <h3 className="font-bold text-brand-navy text-lg mb-5">{eng.title}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">The Challenge</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{eng.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Astellic&apos;s Contribution</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{eng.contribution}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Result</p>
                    <p className="text-brand-muted text-sm leading-relaxed mb-4">{eng.result}</p>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400 italic">{eng.attribution}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming capability callout */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1fr] gap-12">
          <div>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">
              Astellic As a Firm
            </p>
            <h2 className="text-2xl font-bold mb-5 leading-snug">
              The firm is new. The capabilities are not.
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Astellic was founded in October 2025. The engagements above predate the firm
              but are the direct foundation of its analytical and advisory capability. As Astellic
              grows its institutional portfolio, the following are the services actively available
              for new engagements.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Discuss an Engagement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Available Now</p>
            <ul className="space-y-3">
              {upcomingCapabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
