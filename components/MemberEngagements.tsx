"use client";

import { useState } from "react";
import Image from "next/image";

interface Engagement {
  type: string;
  typeColor: string;
  sector: string;
  geography: string;
  title: string;
  challenge: string;
  systemsIssue: string;
  contribution: string;
  outcome: string;
  capabilities: string[];
  priorRole: string;
  status: string;
}

interface Member {
  name: string;
  title: string;
  photo?: string;
  summary: string;
  engagements: Engagement[];
}

const members: Member[] = [
  {
    name: "Dr. Benjamin Azariah Mosiwa",
    title: "Founder & CEO",
    photo: "/images/team-benjamin-mosiwa.jpg",
    summary:
      "Systems strategist and health policy expert with over a decade of senior experience across African development institutions — spanning clinical practice, government-embedded programme management, applied policy research, and global health advisory.",
    engagements: [
      {
        type: "Research & Evaluation",
        typeColor: "bg-brand-gold",
        sector: "Health Systems",
        geography: "Malawi",
        title: "Political Economy Analysis of TB Care Access",
        challenge:
          "A bilateral donor needed to understand why tuberculosis care coverage in Malawi remained persistently low despite sustained health system investments. Service availability was not the bottleneck. The question was what was preventing uptake — and whether the barriers were technical, institutional, or political.",
        systemsIssue:
          "Persistent low TB coverage despite resource inputs signalled a political economy failure, not a service design failure. Institutional incentive structures at ministry level were generating behaviours that undermined programme uptake — a diagnostic invisible to standard monitoring systems.",
        contribution:
          "Conducted a full political economy analysis examining the actors, interests, institutional dynamics, and gender dimensions shaping TB care access at national and subnational levels. Applied a structured PEA framework to map stakeholder incentives, identify institutional misalignments, and separate technical barriers from politically manufactured ones.",
        outcome:
          "Research contributed to a peer-reviewed publication in World Medical & Health Policy (2025) and directly reoriented donor strategy on health financing reform in Malawi.",
        capabilities: ["Political Economy Analysis", "Evidence-to-Policy Translation", "Health Systems Diagnostics"],
        priorRole: "Independent Research",
        status: "Completed",
      },
      {
        type: "Policy Advisory",
        typeColor: "bg-brand-navy",
        sector: "Primary Health Care",
        geography: "Multi-country (Africa)",
        title: "Foundations for Responsive Primary Health Care",
        challenge:
          "A global health implementing organisation needed a practical, evidence-based guide for policymakers on what it actually takes to build responsive primary health care systems — not aspirational frameworks, but operationally honest guidance grounded in what works in resource-constrained settings.",
        systemsIssue:
          "Most PHC reform frameworks were designed for optimal conditions. Development partners and governments were applying aspiration-based models to contexts defined by financing shortfalls, governance fragmentation, and implementation readiness gaps the frameworks did not account for.",
        contribution:
          "Led the research design, evidence synthesis, and drafting of a major policy publication drawing on health systems data and field implementation experience across Africa. Addressed financing architecture, governance design, community health system integration, and implementation readiness in an integrated, context-honest framework.",
        outcome:
          "Published by VillageReach (2025) as a flagship policy resource. Distributed to health ministries and development partners across Africa.",
        capabilities: ["Applied Policy Research", "Evidence Synthesis", "Health Systems Advisory"],
        priorRole: "Senior Manager, Policy & Advocacy — VillageReach",
        status: "Completed",
      },
      {
        type: "Policy Advisory",
        typeColor: "bg-brand-navy",
        sector: "Digital Health & Regulation",
        geography: "Pan-African",
        title: "Africa Telehealth Regulatory Landscape Analysis",
        challenge:
          "The digital health landscape in Africa was expanding rapidly, with telehealth platforms operating across diverse and often legally unclear regulatory environments. A development sector partner needed a comprehensive analysis to inform investment readiness assessments and policy advocacy strategy.",
        systemsIssue:
          "Platform growth had outpaced regulatory infrastructure. The absence of harmonised regional frameworks was creating investment uncertainty, cross-border governance risks, and patient safety vulnerabilities that fragmented national approaches could not resolve.",
        contribution:
          "Conducted a multi-country regulatory analysis mapping telehealth governance frameworks across African jurisdictions. Identified regulatory gaps, investment barriers, and policy advocacy entry points. Presented findings at the HELINA Conference (Botswana, 2025).",
        outcome:
          "Informed a regional digital health advocacy strategy and contributed to the evidence base for regulatory reform dialogue across multiple African countries.",
        capabilities: ["Regulatory Analysis", "Digital Health Policy", "Landscape Assessment"],
        priorRole: "Senior Manager, Policy & Advocacy — VillageReach",
        status: "Completed",
      },
      {
        type: "Research",
        typeColor: "bg-brand-gold",
        sector: "HIV & Market Systems",
        geography: "Malawi",
        title: "Market Intelligence Analysis — Priority HIV & TB Products",
        challenge:
          "A legal and health advocacy organisation needed market intelligence on priority HIV and TB commodity supply chains in Malawi to inform procurement reform advocacy and assess whether current market structures were producing optimal access outcomes for patients.",
        systemsIssue:
          "Procurement fragmentation, pricing opacity, and regulatory constraints were collectively reducing the impact of health financing investments — without appearing in routine health data.",
        contribution:
          "Conducted a full market intelligence analysis examining supply chain dynamics, pricing patterns, procurement behaviour, regulatory constraints, and market concentration risks. Provided strategic recommendations on procurement reform entry points sequenced by feasibility and impact.",
        outcome:
          "Published analysis used by KELIN Kenya (2025) to support procurement reform advocacy in Malawi. Specific recommendations incorporated into the organisation's policy positions.",
        capabilities: ["Market Systems Analysis", "Health Financing Research", "Advocacy Support"],
        priorRole: "Research & Policy Associate — AFIDEP",
        status: "Completed",
      },
      {
        type: "Health Systems Advisory",
        typeColor: "bg-brand-teal",
        sector: "Health Financing & Governance",
        geography: "Malawi · Kenya · Nigeria · Zambia",
        title: "Government Capacity Building in Health Financing",
        challenge:
          "A pan-African policy research institute was supporting governments across the region to lead health financing reform — but ministries lacked the institutional capacity to interrogate financing data, stress-test reform scenarios, or engage with donors from an independent evidence base.",
        systemsIssue:
          "Asymmetric capacity between donors and governments produced dependency relationships that undermined reform ownership. National health financing strategies were frequently shaped by external analysis that governments could not independently verify or challenge.",
        contribution:
          "Provided sustained research and advisory support across four countries — conducting applied health financing research, designing and delivering structured learning programmes for Ministry of Health technical staff, and supporting evidence-informed dialogue between governments and development partners.",
        outcome:
          "Strengthened institutional analytical capacity in four national health ministries. Contributed to evidence-grounded health financing strategies and shifted government-donor dialogue from passive reception to active engagement.",
        capabilities: ["Government Capacity Building", "Health Financing Advisory", "Institutional Diagnostics"],
        priorRole: "Research & Policy Associate — AFIDEP",
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
          <p className="text-xs font-semibold text-brand-navy leading-tight">{eng.priorRole}</p>
          <span className="text-xs text-gray-400">{eng.status}</span>
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
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Strategic Outcome</p>
            <p className="text-brand-muted text-sm leading-relaxed mb-4">{eng.outcome}</p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1.5">Capability Demonstrated</p>
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
      {/* Member header — always visible, click to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-white hover:bg-brand-light/60 transition-colors duration-200 px-7 py-6 flex items-center gap-6"
        aria-expanded={open}
      >
        {/* Photo */}
        {member.photo && (
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shrink-0">
            <Image
              src={member.photo}
              alt={member.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-brand-navy text-lg leading-snug">{member.name}</p>
          <p className="text-brand-teal text-sm font-semibold mb-1">{member.title}</p>
          <p className="text-brand-muted text-sm leading-snug line-clamp-2">{member.summary}</p>
        </div>

        {/* Engagement count + chevron */}
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="border-t border-gray-100 bg-gray-50/40 px-7 py-6 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            {member.engagements.length} Prior {member.engagements.length === 1 ? "Engagement" : "Engagements"}
          </p>
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
