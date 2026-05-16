"use client";

import { useState } from "react";
import Image from "next/image";

interface Engagement {
  type: string;
  typeColor: string;
  sector: string;
  geography: string;
  period: string;
  title: string;
  client: string;
  systemsIssue: string;
  challenge: string;
  contribution: string;
  outcome: string;
  capabilities: string[];
  status: string;
}

interface Member {
  name: string;
  title: string;
  photo?: string;
  website?: string;
  summary: string;
  engagements: Engagement[];
}

const members: Member[] = [
  {
    name: "Dr. Benjamin Azariah Mosiwa",
    title: "Founder & CEO",
    photo: "/images/team-benjamin-mosiwa.jpg",
    website: "https://www.azariahmosiwa.com",
    summary:
      "Systems strategist and health policy expert with over a decade of senior experience across African development institutions — spanning clinical practice, government-embedded programme management, applied policy research, and global health advisory.",
    engagements: [
      {
        type: "Policy Development",
        typeColor: "bg-brand-green",
        sector: "SRHR / Faith Institutions",
        geography: "Malawi",
        period: "March 2026 – May 2026",
        title: "Policy Evaluation and Update: Faith-Based Approach to SRHR",
        client: "Norwegian Church Aid / DanChurchAid",
        systemsIssue:
          "Faith-based institutions hold significant influence over SRHR access and attitudes across Malawi, yet their internal policies were often outdated, inconsistent, or misaligned with national frameworks — creating a gap between institutional reach and policy effectiveness.",
        challenge:
          "Three major faith-based institutions — Blantyre Synod, Livingstonia Synod, and Evangelical Association of Malawi — required their SRHR policies reviewed and updated to align with national and international frameworks while maintaining cultural and religious sensitivity.",
        contribution:
          "Led policy review and revision for all three institutions. Conducted in-depth desk reviews and policy benchmarking against national frameworks. Designed and facilitated stakeholder consultations and validation processes with faith leaders, youth groups, implementing partners, and government stakeholders. Coordinated professional editing and translation into English, Chichewa, and Tumbuka.",
        outcome:
          "Produced revised, publication-ready SRHR policy documents aligned with national and international frameworks, accessible across all target faith populations and linguistically inclusive.",
        capabilities: ["Policy Development", "Stakeholder Engagement", "Evidence Synthesis", "Multilingual Policy Translation"],
        status: "Completed",
      },
      {
        type: "Health Systems Advisory",
        typeColor: "bg-brand-navy",
        sector: "Health Planning & Governance",
        geography: "Malawi",
        period: "December 2025 – March 2026",
        title: "Sub-National District Implementation Planning — HSSP III",
        client: "Ministry of Health, Malawi",
        systemsIssue:
          "District implementation plans were frequently generic, insufficiently costed, and disconnected from national 'One Plan, One Budget, One Report' mechanisms — limiting their effectiveness in driving equitable service delivery for women, children, and newborns.",
        challenge:
          "The Ministry of Health needed embedded technical assistance to strengthen the 2025/26 District Implementation Planning process under Health Sector Strategic Plan III, with particular emphasis on primary healthcare for women, children, and marginalised groups.",
        contribution:
          "Provided embedded technical assistance to the MoH Department of Planning. Supported district health teams to finalise cost-effective, risk-informed, equity-focused DIPs. Documented progress, bottlenecks, and disparities. Developed case studies on facility-to-district planning alignment. Facilitated alignment of Global Fund, Gavi, and World Bank resources with district-led planning. Engaged UNICEF, WHO, World Bank, Global Fund Principal Recipients, FCDO, and district councils.",
        outcome:
          "Strengthened 2025/26 DIP process with documented equity analysis, actionable bottleneck recommendations, and stronger alignment between district plans and national 'One Plan' mechanisms.",
        capabilities: ["Embedded Advisory", "Health Systems Strengthening", "Implementation Planning", "Stakeholder Coordination"],
        status: "Completed",
      },
      {
        type: "Programme Evaluation",
        typeColor: "bg-brand-teal",
        sector: "Cervical Cancer / Women's Health",
        geography: "Malawi",
        period: "November 2024 – April 2025",
        title: "Midline Evaluation: Sondra Smalley Cervical Cancer Prevention Project",
        client: "Mothers2Mothers",
        systemsIssue:
          "Cervical cancer prevention and screening in Malawi suffered from fragmented implementation — weak integration between community-level Mentor Mothers and facility-based clinical services undermined reach and implementation fidelity.",
        challenge:
          "Mothers2Mothers needed an independent midline evaluation to assess the reach, early outcomes, and implementation quality of their Sondra Smalley cervical cancer prevention project across target facilities.",
        contribution:
          "Conducted a policy and health systems analysis for cervical cancer prevention in Malawi. Facilitated key informant interviews with national and district health officials. Conducted FGDs and surveys with Mentor Mothers and health workers in project-supported facilities. Generated mixed-methods evidence on project reach, early outcomes, and implementation fidelity.",
        outcome:
          "Midline evaluation report with detailed recommendations for strengthening cervical cancer screening and management through the Sondra Smalley project, informing Mothers2Mothers programme adaptation.",
        capabilities: ["Mixed-Methods Evaluation", "Programme Evaluation", "Health Systems Analysis", "Qualitative Research"],
        status: "Completed",
      },
      {
        type: "Programme Evaluation",
        typeColor: "bg-brand-teal",
        sector: "HIV / Adolescent Health",
        geography: "Malawi",
        period: "October 2024 – March 2025",
        title: "Baseline Assessment: READY+ Project for AGYW Living with HIV",
        client: "Frontline AIDS",
        systemsIssue:
          "AGYW living with HIV face compounded vulnerabilities in accessing integrated HIV and SRH services — yet institutional, social, and structural barriers were poorly quantified, limiting targeted programme design.",
        challenge:
          "Frontline AIDS needed a rigorous baseline assessment for the READY+ project to establish benchmarks and assess the policy and service environment for adolescent girls and young women living with HIV in Malawi.",
        contribution:
          "Conducted a policy analysis of HIV and SRH policy frameworks relevant to AGYW. Led digitised surveys with AGYW living with HIV. Facilitated interviews with key stakeholders in HIV programming across national and subnational levels.",
        outcome:
          "Comprehensive baseline dataset and policy analysis establishing benchmarks and informing the READY+ project design, targeting strategy, and monitoring framework.",
        capabilities: ["Baseline Assessment", "Policy Analysis", "Adolescent Health Assessment", "Quantitative & Qualitative Methods"],
        status: "Completed",
      },
      {
        type: "Market Intelligence",
        typeColor: "bg-brand-gold",
        sector: "HIV & TB Health Commodities",
        geography: "Malawi",
        period: "October 2024 – December 2024",
        title: "National Market Intelligence Assessment: HIV and TB Health Commodities",
        client: "KELIN / CHeRA Malawi / ITPC Global",
        systemsIssue:
          "Donor dependency, procurement fragmentation, and pricing opacity were reducing the health system's ability to sustain equitable access to essential HIV and TB commodities — without these structural constraints being visible in routine programme data.",
        challenge:
          "KELIN, CHeRA Malawi, and ITPC Global needed a national market intelligence assessment to generate the evidence base for sustainable financing, procurement reform advocacy, and access expansion strategies.",
        contribution:
          "Mapped financing sources and procurement flows for priority HIV and TB commodities. Engaged pharmaceutical suppliers and government agencies including the National TB Programme, Directorate of HIV & Viral Hepatitis, CMST, and Malawi Revenue Authority. Applied bubble chart visualisation and composite scoring models to classify commodities by cost impact and usage frequency. Facilitated national and Africa-regional multi-stakeholder workshops with regulators, civil society, and procurement agencies. Collaborated with Global Fund, PEPFAR, WHO, PMRA, and UNDP. Authored technical report submitted to KELIN and ITPC Global.",
        outcome:
          "Evidence-based advocacy framework for cost reduction, procurement optimisation, and EDL reform. Findings used in regional and national pharmaceutical policy dialogues and aligned with TRIPS flexibilities advocacy.",
        capabilities: ["Market Systems Analysis", "Health Financing Research", "Procurement Reform Advisory", "Stakeholder Facilitation"],
        status: "Completed",
      },
      {
        type: "Health Systems Advisory",
        typeColor: "bg-brand-navy",
        sector: "Family Planning / Primary Health Care",
        geography: "Malawi",
        period: "April 2024 – January 2025",
        title: "Assessment Framework: Integration of Family Planning into Primary Health Care",
        client: "The Palladium Group / USAID PROPEL Health Project",
        systemsIssue:
          "Family planning services in Malawi remained weakly integrated into primary health care — gaps in governance, financing, workforce, and information systems meant FP was treated as a vertical programme rather than a core PHC function.",
        challenge:
          "Under the USAID PROPEL Health project, the Malawi Ministry of Health needed a structured assessment framework and tool to evaluate and strengthen FP integration across the six WHO health system building blocks.",
        contribution:
          "Worked closely with the Reproductive Health Directorate to co-design an FP–PHC integration assessment tool. Conducted a secondary desk review of FP and PHC policies, strategies, and guidelines. Mapped and engaged national and sub-national stakeholders for tool validation. Led key informant interviews at national and district levels to assess policy coherence, implementation bottlenecks, and system readiness.",
        outcome:
          "Comprehensive assessment tool and report providing detailed recommendations for strengthening FP–PHC integration across governance, financing, service delivery, workforce, information systems, and commodities. Delivered to USAID PROPEL Health and MoH.",
        capabilities: ["Health Systems Assessment", "Tool Development", "Policy Analysis", "Stakeholder Engagement"],
        status: "Completed",
      },
      {
        type: "Programme Evaluation",
        typeColor: "bg-brand-teal",
        sector: "HIV / Adolescent SRH",
        geography: "Malawi (Mangochi)",
        period: "November 2023 – February 2024",
        title: "Endline Evaluation: HIV and SRH Services Integration for AGYW",
        client: "World Education Inc.",
        systemsIssue:
          "Fragmented service delivery for adolescent girls and young women across HIV and SRH sectors — weak referral systems, poor partner coordination, and inconsistent youth-friendly service quality — limited the integrated impact of joint programming.",
        challenge:
          "World Education Inc. needed an endline evaluation of their ISA project assessing integration gains, service access improvements, and implementation fidelity across six health facilities and their catchment communities in Mangochi.",
        contribution:
          "Reviewed project documents and conducted in-depth interviews and FGDs with diverse stakeholders to assess impact on partner coordination, referral systems, access to services, youth-friendly service quality, and integration support from DHO and partners. Documented experiences of adolescents and young people accessing services in ISA-supported facilities.",
        outcome:
          "Evaluation reports outlining lessons learned, implementation fidelity findings, and policy-relevant recommendations for scaling integrated HIV/SRH services for AGYW in Malawi.",
        capabilities: ["Programme Evaluation", "Qualitative Research", "Adolescent Health Assessment", "Mixed-Methods Evaluation"],
        status: "Completed",
      },
      {
        type: "Programme Evaluation",
        typeColor: "bg-brand-teal",
        sector: "HIV / Adolescent SRH",
        geography: "Malawi",
        period: "November 2022 – January 2023",
        title: "Baseline Assessment: HIV and SRH Services Integration for AGYW",
        client: "World Education Inc.",
        systemsIssue:
          "Baseline data on HIV and SRH service integration for AGYW in Malawi was fragmented and unstandardised — there was no validated scorecard for assessing youth-friendly health service quality consistently across facilities.",
        challenge:
          "World Education Inc. needed a credible baseline for their ISA project, including a validated quality assessment tool to track service integration consistently across facilities over the project lifecycle.",
        contribution:
          "Conducted a policy analysis of HIV and SRH policies and guidelines relevant to adolescents in Malawi. Led key informant interviews with national and district stakeholders involved in HIV and SRH programming to establish baseline values. Redesigned, refined, and validated the Malawi Ministry of Health Youth Friendly Health Services Scorecard.",
        outcome:
          "Validated baseline dataset and a revised MoH youth-friendly services scorecard — providing the ISA project with rigorous benchmarks and a reusable quality assessment tool endorsed by the Ministry.",
        capabilities: ["Baseline Assessment", "Tool Development", "Policy Analysis", "Qualitative Research"],
        status: "Completed",
      },
      {
        type: "Market Assessment",
        typeColor: "bg-brand-gold",
        sector: "HIV Prevention / Sexual Health",
        geography: "Malawi",
        period: "2022 – 2023",
        title: "Total Market Approach Assessment for Condom Programming",
        client: "Kamuzu University of Health Sciences (KUHeS) / UNAIDS",
        systemsIssue:
          "Malawi's condom market was not optimally segmented — free, socially marketed, and commercial products were not distributed in a way that maximised coverage across income groups and key populations.",
        challenge:
          "UNAIDS required a feasibility assessment for implementing a Total Market Approach to condom programming in Malawi — examining policy, market structure, and key population access barriers.",
        contribution:
          "Led policy analysis and stakeholder consultations with MoH officials, regulatory authorities, private distributors, civil society organisations, and key populations including female sex workers, men who have sex with men, and young people living with HIV. Assessed access barriers, market segmentation feasibility, and sustainability of distribution channels.",
        outcome:
          "Technical assessment informing national condom programming strategies and market sustainability discussions at MoH and UNAIDS levels.",
        capabilities: ["Market Assessment", "Key Population Engagement", "HIV Prevention Policy", "Stakeholder Consultations"],
        status: "Completed",
      },
      {
        type: "Health Systems Advisory",
        typeColor: "bg-brand-navy",
        sector: "HIV Surveillance & Systems Strengthening",
        geography: "Malawi",
        period: "2022 – 2023",
        title: "Blantyre HIV Prevention Strategy: Health Systems & Surveillance Assessment",
        client: "Kamuzu University of Health Sciences (KUHeS) / Gates Foundation",
        systemsIssue:
          "HIV surveillance in Malawi was not sufficiently integrated into Integrated Disease Surveillance and Response (IDSR) systems — leaving outbreak detection, preparedness, and community-based surveillance for HIV operating through parallel, poorly connected structures.",
        challenge:
          "The Gates-funded BPS consortium required health systems assessment, M&E coordination, and capacity building for community-based organisations implementing HIV surveillance in Blantyre District.",
        contribution:
          "Served as the KUHeS focal person within the BPS consortium. Conducted comprehensive health systems and policy assessments. Coordinated M&E activities for BPS interventions. Led capacity and gap assessments of CBOs to evaluate institutional readiness for case-based and event-based surveillance. Designed and delivered targeted capacity development interventions for district-level actors. Developed analytical reports and policy communication materials. Participated in Health Technical Working Groups.",
        outcome:
          "Strengthened CBO capacity for HIV surveillance reporting, data verification, and routine data use for decision-making. Policy briefs informing MoH decision-making on IDSR-HIV integration and preparedness planning.",
        capabilities: ["Health Systems Assessment", "M&E Coordination", "Capacity Building", "Policy Communication", "Surveillance Systems"],
        status: "Completed",
      },
      {
        type: "Programme Evaluation",
        typeColor: "bg-brand-teal",
        sector: "Community Health Systems",
        geography: "Zambia",
        period: "March 2022 – August 2022",
        title: "Effectiveness of Community Health Systems: National Health Committees in Zambia",
        client: "On Call Africa",
        systemsIssue:
          "National Health Committees in Zambia were operating without consistent assessment of their effectiveness — leaving gaps in the evidence base needed to strengthen community-level governance of health services at scale.",
        challenge:
          "On Call Africa needed an independent evaluation of NHC effectiveness in improving access to health services in Zambia, examining governance, institutional functioning, and health system contributions.",
        contribution:
          "Conducted a desk review of policies and programme documents. Led structured interviews with health workers and officials from the Zambian Ministry of Health on the governance and functioning of community health services through NHCs.",
        outcome:
          "Evaluation findings on NHC effectiveness contributing to the evidence base for community health governance reform and informing On Call Africa's programme strategy in Zambia.",
        capabilities: ["Programme Evaluation", "Community Health Systems", "Policy Review", "Key Informant Interviews"],
        status: "Completed",
      },
      {
        type: "Policy & Advocacy Research",
        typeColor: "bg-brand-teal",
        sector: "TB / Prison Health",
        geography: "Malawi",
        period: "March 2020 – June 2020",
        title: "Policy and Prison Health Assessment for TB and Drug-Resistant TB",
        client: "Southern Africa Litigation Centre (SALC)",
        systemsIssue:
          "Malawian prisons were managing MDR-TB among inmates without adequate policy frameworks, referral pathways, or health system capacity — creating both a serious public health risk and a human rights violation.",
        challenge:
          "SALC needed a comprehensive policy analysis and capacity assessment to build the evidence base for advocacy aimed at reforming how Malawi's correctional system manages drug-resistant tuberculosis.",
        contribution:
          "Conducted a comprehensive policy analysis and literature review of TB and DRTB management guidelines in Malawi and globally. Led a capacity assessment of Malawian prisons in managing MDR-TB. Assessed health system readiness, referral pathways, and human rights considerations in correctional settings. Produced a technical report to inform advocacy on TB management in correctional facilities.",
        outcome:
          "The project directly informed TB in Prison Policy reforms in Malawi — allowing inmates with MDR-TB to be released for proper hospital-based management. A direct policy change resulting from the evidence generated.",
        capabilities: ["Policy Analysis", "Advocacy Research", "Health Systems Assessment", "Human Rights & Health"],
        status: "Completed",
      },
    ],
  },
];

function EngagementCard({ eng }: { eng: Engagement }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold text-white ${eng.typeColor} px-3 py-1 rounded-full`}>
            {eng.type}
          </span>
          <span className="text-xs font-semibold text-brand-muted bg-white border border-gray-200 px-3 py-1 rounded-full">
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
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-brand-navy leading-tight">{eng.client}</p>
          <p className="text-xs text-gray-400 mt-0.5">{eng.period}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-5">
        <h4 className="font-bold text-brand-navy text-base mb-4">{eng.title}</h4>

        {/* Systems issue callout */}
        <div className="bg-brand-light border-l-4 border-brand-gold rounded-r-xl px-4 py-3 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Systems Issue</p>
          <p className="text-brand-navy text-sm leading-relaxed">{eng.systemsIssue}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">The Challenge</p>
            <p className="text-brand-muted text-sm leading-relaxed">{eng.challenge}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">The Work Done</p>
            <p className="text-brand-muted text-sm leading-relaxed">{eng.contribution}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Outcome</p>
            <p className="text-brand-muted text-sm leading-relaxed mb-4">{eng.outcome}</p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1.5">Capabilities Demonstrated</p>
              <div className="flex flex-wrap gap-1.5">
                {eng.capabilities.map((cap) => (
                  <span key={cap} className="text-xs bg-brand-navy text-white px-2 py-0.5 rounded font-medium">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberSection({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* Member header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-white hover:bg-brand-light/60 transition-colors duration-200 px-7 py-6 flex items-center gap-6"
        aria-expanded={open}
      >
        {member.photo && (
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shrink-0">
            <Image src={member.photo} alt={member.name} width={64} height={64} className="object-cover w-full h-full" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-brand-navy text-lg leading-snug">{member.name}</p>
          <p className="text-brand-teal text-sm font-semibold mb-1">{member.title}</p>
          <p className="text-brand-muted text-sm leading-snug line-clamp-2">{member.summary}</p>
          {member.website && (
            <a
              href={member.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-brand-gold text-xs font-semibold hover:underline mt-1.5"
            >
              Full profile & CV →
            </a>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-brand-gold font-black text-2xl leading-none">{member.engagements.length}</p>
            <p className="text-xs text-brand-muted font-semibold mt-0.5">
              {member.engagements.length === 1 ? "Engagement" : "Engagements"}
            </p>
          </div>
          <div className={`w-8 h-8 rounded-full bg-brand-light flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
            <svg className="w-4 h-4 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Collapsible engagements */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? "max-h-[99999px] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!open}
      >
        <div className="border-t border-gray-100 bg-gray-50/40 px-7 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
              {member.engagements.length} Prior Consultancy {member.engagements.length === 1 ? "Engagement" : "Engagements"}
            </p>
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-gold text-xs font-semibold hover:underline"
              >
                View full profile at azariahmosiwa.com →
              </a>
            )}
          </div>
          {member.engagements.map((eng, i) => (
            <EngagementCard key={i} eng={eng} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MemberEngagements() {
  return (
    <div className="space-y-4">
      {members.map((member) => (
        <MemberSection key={member.name} member={member} />
      ))}
    </div>
  );
}
