import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Our Work | Astellic",
  description:
    "Astellic's research, advisory, and implementation support engagements across African health, governance, and development systems. Institutional case narratives, not project catalogues.",
};

// Structured case narratives: challenge → systems issue → contribution → implementation insight → strategic outcome → capability demonstrated
const engagements = [
  {
    type: "Research & Evaluation",
    typeColor: "bg-brand-gold",
    sector: "Health Systems",
    geography: "Malawi",
    title: "Political Economy Analysis of TB Care Access",
    challenge: "A bilateral donor needed to understand why tuberculosis care coverage in Malawi remained persistently low despite sustained health system investments. Service availability was not the bottleneck. The question was what was preventing uptake — and whether the barriers were technical, institutional, or political.",
    systemsIssue: "Persistent low TB coverage despite resource inputs signalled a political economy failure, not a service design failure. Institutional incentive structures at ministry level were generating behaviours that undermined programme uptake — a diagnostic invisible to standard monitoring systems.",
    contribution: "Conducted a full political economy analysis examining the actors, interests, institutional dynamics, and gender dimensions shaping TB care access at national and subnational levels. Applied a structured PEA framework to map stakeholder incentives, identify institutional misalignments, and separate technical barriers from politically manufactured ones. Findings challenged the prevailing technical framing of the problem.",
    outcome: "Research contributed to a peer-reviewed publication in World Medical & Health Policy (2025) and directly reoriented donor strategy on health financing reform in Malawi. The PEA framing has since shaped how the programme approaches institutional engagement.",
    capabilities: ["Political Economy Analysis", "Evidence-to-Policy Translation", "Health Systems Diagnostics"],
    attribution: "Dr. Benjamin Azariah Mosiwa (lead author)",
    status: "Completed",
  },
  {
    type: "Policy Advisory",
    typeColor: "bg-brand-navy",
    sector: "Primary Health Care",
    geography: "Multi-country (Africa)",
    title: "Foundations for Responsive Primary Health Care",
    challenge: "A global health implementing organisation needed a practical, evidence-based guide for policymakers on what it actually takes to build responsive primary health care systems. Not aspirational frameworks — but operationally honest guidance grounded in what works, and what fails, in resource-constrained settings.",
    systemsIssue: "Most PHC reform frameworks were designed for optimal conditions. The systems failure was that development partners and governments were applying aspiration-based models to contexts defined by financing shortfalls, governance fragmentation, and implementation readiness gaps that the frameworks did not account for.",
    contribution: "Led the research design, evidence synthesis, and drafting of a major policy publication drawing on health systems data and field implementation experience across Africa. The guide addressed financing architecture, governance design, community health system integration, and implementation readiness in an integrated, context-honest framework — structured to be used by Ministry of Health officials, not just read by academics.",
    outcome: "Published by VillageReach (2025) as a flagship policy resource. Distributed to health ministries and development partners across Africa. The guide has since been cited in PHC programme design discussions and referenced in donor strategy documents.",
    capabilities: ["Applied Policy Research", "Evidence Synthesis", "Health Systems Advisory"],
    attribution: "Dr. Benjamin Azariah Mosiwa (co-author)",
    status: "Completed",
  },
  {
    type: "Policy Advisory",
    typeColor: "bg-brand-navy",
    sector: "Digital Health & Regulation",
    geography: "Pan-African",
    title: "Africa Telehealth Regulatory Landscape Analysis",
    challenge: "The digital health landscape in Africa was expanding rapidly, with telehealth platforms operating across diverse and often legally unclear regulatory environments. A development sector partner needed a comprehensive analysis of the regulatory landscape to inform investment readiness assessments and policy advocacy strategy.",
    systemsIssue: "Platform growth had outpaced regulatory infrastructure. The systemic gap was not merely missing legislation — it was the absence of harmonised regional frameworks, creating investment uncertainty, cross-border governance risks, and patient safety vulnerabilities that fragmented national approaches could not resolve.",
    contribution: "Conducted a multi-country regulatory analysis mapping telehealth governance frameworks across African jurisdictions. Identified regulatory gaps, investment barriers, and policy advocacy entry points at national and regional levels. Developed a comparative framework for assessing regulatory readiness and risk. Presented findings at the HELINA Conference (Botswana, 2025).",
    outcome: "Informed a regional digital health advocacy strategy and contributed to the evidence base for regulatory reform dialogue across multiple African countries. Findings have been used to support investor engagement and regulatory reform advocacy in target markets.",
    capabilities: ["Regulatory Analysis", "Digital Health Policy", "Landscape Assessment"],
    attribution: "Dr. Benjamin Azariah Mosiwa (lead analyst)",
    status: "Completed",
  },
  {
    type: "Research",
    typeColor: "bg-brand-gold",
    sector: "HIV & Market Systems",
    geography: "Malawi",
    title: "Market Intelligence Analysis — Priority HIV & TB Products",
    challenge: "A legal and health advocacy organisation needed market intelligence on priority HIV and TB commodity supply chains in Malawi to inform procurement reform advocacy and assess whether current market structures were producing optimal access and pricing outcomes for patients.",
    systemsIssue: "The market was producing suboptimal outcomes — but the mechanisms were not visible from standard programme monitoring. The structural issue was procurement fragmentation, pricing opacity, and regulatory constraints that collectively reduced the impact of health financing investments without appearing in routine health data.",
    contribution: "Conducted a full market intelligence analysis examining supply chain dynamics, pricing patterns, procurement behaviour, regulatory constraints, and market concentration risks for priority HIV and TB products. Provided structured strategic recommendations on procurement reform entry points and advocacy strategy, sequenced by feasibility and impact potential.",
    outcome: "Published analysis used by KELIN Kenya (2025) to support procurement reform advocacy in Malawi. Specific recommendations were incorporated into the organisation's policy positions on Malawi's health commodity procurement systems.",
    capabilities: ["Market Systems Analysis", "Health Financing Research", "Advocacy Support"],
    attribution: "Dr. Benjamin Azariah Mosiwa (author)",
    status: "Completed",
  },
  {
    type: "Health Systems Advisory",
    typeColor: "bg-brand-teal",
    sector: "Health Financing & Governance",
    geography: "Malawi · Kenya · Nigeria · Zambia",
    title: "Government Capacity Building in Health Financing",
    challenge: "A pan-African policy research institute was supporting governments across the region to lead health financing reform — but the limiting factor was not resources, nor political will. It was that ministries lacked the institutional capacity to interrogate financing data, stress-test reform scenarios, or engage with donors from an independent evidence base.",
    systemsIssue: "The systemic issue was asymmetric capacity: donors and implementing partners could analyse financing systems; governments often could not. This imbalance produced dependency relationships that undermined reform ownership and sustainability — and meant that national health financing strategies were frequently shaped by external analysis that governments could not independently verify or challenge.",
    contribution: "Provided sustained research and advisory support across four countries — conducting applied health financing research, designing and delivering structured learning programmes for Ministry of Health technical staff, and supporting evidence-informed dialogue between governments and development partners. Equipped government counterparts with the analytical frameworks, data tools, and negotiation capacity to engage substantively on UHC financing reform.",
    outcome: "Contributed to strengthened institutional analytical capacity in four national health ministries. Supported the development of evidence-grounded health financing strategies at national level, and helped shift the tenor of government-donor dialogue from passive reception to active engagement.",
    capabilities: ["Government Capacity Building", "Health Financing Advisory", "Institutional Diagnostics"],
    attribution: "Dr. Benjamin Azariah Mosiwa (Research & Policy Associate, AFIDEP)",
    status: "Completed",
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
            These are the institutional challenges we have addressed, the systems
            we have diagnosed, and the advisory contributions that have shaped
            policy and delivery across Africa.
          </p>
        </div>
      </section>

      {/* Approach statement */}
      <section className="py-12 px-6 bg-brand-light border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <FadeUp>
            <div>
              <p className="text-brand-muted text-base leading-relaxed max-w-2xl">
                Astellic is a young firm with a founder who brings over a decade of senior experience.
                The engagements below reflect the institutional track record that preceded and
                directly shaped the firm. Each is presented as a case narrative — structured around
                the underlying systems issue, the analytical contribution, and the strategic outcome —
                not as a catalogue of project titles.
              </p>
            </div>
          </FadeUp>
          <ScaleIn>
            <div className="text-center shrink-0">
              <p className="text-brand-gold font-bold text-3xl">30+</p>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">engagements</p>
              <p className="text-gray-400 text-xs mt-1">15+ global partners & donors</p>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Engagement narratives */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          <FadeUp>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1 h-8 bg-brand-gold rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Selected Engagements</h2>
            </div>
          </FadeUp>

          {engagements.map((eng, i) => (
            <Reveal key={i} variant="up" delay={i * 90}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lift">
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
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 bg-gray-100 text-gray-600">
                    {eng.status}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-7 py-6">
                  <h3 className="font-bold text-brand-navy text-lg mb-4">{eng.title}</h3>

                  {/* Systems issue callout */}
                  <div className="bg-brand-light border-l-4 border-brand-gold rounded-r-xl px-4 py-3 mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Systems Issue</p>
                    <p className="text-brand-navy text-sm leading-relaxed">{eng.systemsIssue}</p>
                  </div>

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
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Strategic Outcome</p>
                      <p className="text-brand-muted text-sm leading-relaxed mb-4">{eng.outcome}</p>
                      <div className="border-t border-gray-100 pt-3 space-y-2.5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1.5">Capability Demonstrated</p>
                          <div className="flex flex-wrap gap-1.5">
                            {eng.capabilities.map((cap) => (
                              <span key={cap} className="text-xs bg-brand-navy text-white px-2 py-0.5 rounded font-medium">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 italic">{eng.attribution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Upcoming capability callout */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1fr] gap-12">
          <SlideLeft>
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
                builds its institutional portfolio, the following services are available
                for immediate engagement.
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
          </SlideLeft>
          <SlideRight>
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
          </SlideRight>
        </div>
      </section>
    </>
  );
}
