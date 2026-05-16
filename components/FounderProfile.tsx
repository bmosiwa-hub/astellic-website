"use client";

import { useState } from "react";
import Image from "next/image";

const methodologicalStrengths = [
  {
    area: "Adaptive MERL",
    detail: "Real-time monitoring, evaluation, research, and learning system design for complex programmes operating in dynamic contexts.",
  },
  {
    area: "Data Quality Assurance",
    detail: "Verification frameworks, internal audit protocols, and DQA systems for donor-funded programmes and government data infrastructure.",
  },
  {
    area: "Political Economy Analysis",
    detail: "Institutional incentive mapping, reform feasibility assessment, and stakeholder landscape analysis informing programme strategy.",
  },
  {
    area: "Health Systems Analysis",
    detail: "Financing diagnostics, service delivery assessments, and PHC systems strengthening grounded in MoH institutional realities.",
  },
  {
    area: "Programme Evaluation",
    detail: "Formative, summative, and impact evaluations across health, governance, and social systems — theory of change to results synthesis.",
  },
  {
    area: "Institutional Diagnostics",
    detail: "Organisational assessments, capacity gap analysis, and reform readiness diagnostics for government ministries and implementing organisations.",
  },
];

const careerHistory = [
  {
    role: "Founder & CEO",
    org: "Astellic",
    period: "October 2025 — Present",
    desc: "Founded Astellic to provide the kind of institutionally grounded, evidence-to-delivery advisory that the African development sector consistently lacks. Leads all research, evaluation, and advisory engagements directly — including health systems financing diagnostics, adaptive MERL system design, data quality frameworks, and programme evaluations across multiple African contexts. Directs partnership strategy, business development, and quality assurance for the firm's full portfolio.",
  },
  {
    role: "Policy Advisor",
    org: "Kamuzu University of Health Sciences / African Mental Health Research Initiative (AMARI)",
    period: "December 2025 — Present",
    desc: "Supports AMARI's multi-country policy translation work — bridging clinical research evidence and national mental health policy reform processes across Malawi, Ethiopia, South Africa, and Zimbabwe. Advises on evidence synthesis, policy brief development, stakeholder engagement strategy, and the design of policy translation pathways that move research findings into actionable government and donor commitments.",
  },
  {
    role: "Senior Manager, Policy & Advocacy",
    org: "VillageReach (Global)",
    period: "January 2025 — September 2025",
    desc: "Directed VillageReach's global policy and advocacy function, covering primary health care systems, immunisation programme policy, digital health governance, and health financing strategy. Led the development of the organisation's 2025 flagship policy publication — a practical guide on building responsive primary health care systems for policymakers — disseminated across African health ministries, donor networks, and multilateral organisations. Engaged FCDO, USAID, WHO, and Gavi on policy positioning, programme design inputs, and advocacy strategy.",
  },
  {
    role: "Research & Policy Associate",
    org: "African Institute for Development Policy (AFIDEP)",
    period: "January 2023 — December 2024",
    desc: "Conducted applied health financing research and led government capacity building engagements across Malawi, Kenya, Nigeria, and Zambia. Designed and delivered structured learning programmes for Ministry of Health officials on health financing frameworks, benefit package costing, public financial management, and UHC planning systems. Produced policy reports and evidence briefs directly informing donor-funded health reform programmes and national health sector plans.",
  },
  {
    role: "Director of Programs and Strategy",
    org: "Facilitators of Community Transformation (FACT), Malawi",
    period: "2017 — 2021",
    desc: "Led FACT Malawi's health systems and digital health portfolio in direct institutional partnership with the Ministry of Health and Population. Oversaw full programme design, monitoring and evaluation, adaptive management, and stakeholder coordination across multiple USAID and FCDO-supported initiatives. Directed the integration of digital health tools into primary care delivery systems — including community health worker platforms and facility-level data systems — navigating the institutional, political, and implementation realities of the MoH environment from the inside.",
  },
  {
    role: "Medical Officer",
    org: "Ministry of Health — Queen Elizabeth Central Hospital, Blantyre",
    period: "2015 — 2017",
    desc: "Clinical practice at Malawi's largest public referral hospital, providing acute care across internal medicine, paediatrics, and emergency settings. Contributed simultaneously to health system quality improvement initiatives — gaining first-hand, institutional-level insight into the data systems failures, human resource constraints, supply chain fragility, and governance barriers that characterise high-burden public systems. This clinical-institutional foundation underpins the diagnostic precision that defines his advisory practice.",
  },
];

const publications = [
  {
    year: "2025",
    title: "Gender-Equitable Access to Tuberculosis Care and Prevention in Malawi",
    journal: "World Medical & Health Policy, 17(3), 306–318",
    type: "Peer-reviewed article",
  },
  {
    year: "2025",
    title: "Building the Foundations for Responsive Primary Health Care: A Practical Guide for Policymakers",
    journal: "VillageReach Policy Report",
    type: "Policy report",
  },
  {
    year: "2025",
    title: "Market Intelligence Analysis for Priority HIV and TB Products in Malawi",
    journal: "KELIN Kenya",
    type: "Policy report",
  },
  {
    year: "2022",
    title: "Emerging Public Health Challenges During the COVID-19 Pandemic in Malawi",
    journal: "Public Health Challenges, 1, e40",
    type: "Peer-reviewed article",
  },
];

const conferences = [
  {
    year: "2025",
    event: "HELINA Conference",
    location: "Botswana",
    topic: "Digital health governance, data systems readiness, and implementation constraints in Sub-Saharan African health systems.",
  },
  {
    year: "2024",
    event: "Global Symposium for Health Systems Research",
    location: "Japan",
    topic: "Health financing reforms and evidence-to-policy translation across African health systems.",
  },
  {
    year: "2022",
    event: "AFREhealth Conference",
    location: "Zimbabwe",
    topic: "Health system resilience, emerging public health challenges, and institutional response capacity during the COVID-19 period.",
  },
];

const consultancies = [
  {
    period: "Mar 2026 – May 2026",
    client: "Norwegian Church Aid / DanChurchAid",
    title: "Policy Evaluation for Faith-Based SRHR Programming",
    geography: "Malawi",
    summary: "Evaluated the policy environment for faith-based organisations delivering SRHR services, mapping institutional barriers, stakeholder incentives, and reform entry points for advocacy strategy.",
  },
  {
    period: "Dec 2025 – Mar 2026",
    client: "Ministry of Health, Malawi",
    title: "Sub-National District Implementation Planning — HSSP III",
    geography: "Malawi",
    summary: "Led sub-national costing and implementation planning for Malawi's Health Sector Strategic Plan III, translating national priorities into district-level operational frameworks aligned with MoH financing realities.",
  },
  {
    period: "Nov 2024 – Apr 2025",
    client: "Mothers2Mothers",
    title: "Midline Evaluation — Sondra Smalley Project",
    geography: "Malawi",
    summary: "Conducted a midline evaluation of a community-based PMTCT and maternal health programme, assessing reach, quality of service delivery, and adaptive learning mechanisms against the theory of change.",
  },
  {
    period: "Oct 2024 – Mar 2025",
    client: "Frontline AIDS",
    title: "Baseline Assessment — READY+ Programme",
    geography: "Malawi",
    summary: "Established baseline for a multi-country programme supporting key population-led HIV responses, designing the measurement framework, data collection instruments, and learning architecture for the programme cycle.",
  },
  {
    period: "Oct 2024 – Dec 2024",
    client: "KELIN Kenya / CHeRA / ITPC Global",
    title: "National Market Intelligence Analysis — HIV & TB Commodities",
    geography: "Malawi",
    summary: "Produced a national market intelligence report mapping commodity availability, procurement channels, pricing dynamics, and supply chain vulnerabilities for priority HIV and TB products — informing regional advocacy and procurement strategy.",
  },
  {
    period: "Apr 2024 – Jan 2025",
    client: "Palladium / USAID PROPEL Health",
    title: "Family Planning–Primary Health Care Integration Assessment",
    geography: "Malawi",
    summary: "Assessed the institutional and operational readiness for integrating family planning services into primary health care platforms, including supply chain, human resource, and health information system dimensions.",
  },
  {
    period: "Nov 2023 – Feb 2024",
    client: "World Education Inc.",
    title: "Endline Evaluation — HIV & Sexual and Reproductive Health Programme",
    geography: "Malawi",
    summary: "Led the endline evaluation of a USAID-funded HIV and SRH programme, assessing outcome-level results against the theory of change and synthesising learning for programme closure and donor reporting.",
  },
  {
    period: "Nov 2022 – Jan 2023",
    client: "World Education Inc.",
    title: "Baseline Assessment — HIV & Sexual and Reproductive Health Programme",
    geography: "Malawi",
    summary: "Designed and conducted the programme baseline, establishing performance benchmarks, data quality standards, and the adaptive monitoring framework for the full programme cycle.",
  },
  {
    period: "2022 – 2023",
    client: "Kamuzu University of Health Sciences / UNAIDS",
    title: "Total Market Approach Assessment for Condom Programming",
    geography: "Malawi",
    summary: "Mapped the full condom market — public, social, and commercial sectors — assessing segmentation, distribution reach, pricing gaps, and the conditions required for a coordinated total market approach.",
  },
  {
    period: "2022 – 2023",
    client: "Kamuzu University of Health Sciences / Gates Foundation",
    title: "Blantyre HIV Prevention Strategy",
    geography: "Malawi",
    summary: "Contributed to the development of a city-level HIV prevention strategy for Blantyre, analysing epidemiological data, programme coverage gaps, and implementation bottlenecks to inform strategic prioritisation.",
  },
  {
    period: "Mar 2022 – Aug 2022",
    client: "On Call Africa",
    title: "Community Health Systems Strengthening",
    geography: "Zambia",
    summary: "Assessed community health worker deployment, supervision structures, and data reporting systems in Zambia, identifying institutional strengthening priorities for programme scale-up.",
  },
  {
    period: "Mar 2020 – Jun 2020",
    client: "Southern Africa Litigation Centre (SALC)",
    title: "Policy and Prison Health Assessment — TB and Drug-Resistant TB",
    geography: "Malawi",
    summary: "Conducted a legal, policy, and health systems assessment of TB and DRTB management in prison settings, documenting rights gaps, clinical care failures, and reform recommendations for litigation and advocacy use.",
  },
];

const institutionalPartners = [
  "USAID", "FCDO", "World Bank", "WHO", "UNICEF", "Gavi",
  "Global Fund", "Africa CDC", "Gates Foundation", "Palladium", "DAI",
  "AFIDEP", "VillageReach",
];

const tags = [
  "Systems Strategist",
  "Health Policy Expert",
  "Evidence-to-Delivery Specialist",
  "Political Economy Analyst",
  "Institutional Reform Advisor",
];

export default function FounderProfile() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-brand-light rounded-2xl border border-gray-100 overflow-hidden">

      {/* ── Always-visible compact card ── */}
      <div className="p-8 grid md:grid-cols-[auto_1fr] gap-8 items-start">
        {/* Photo column */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0">
            <Image
              src="/images/team-benjamin-mosiwa.jpg"
              alt="Dr. Benjamin Azariah Mosiwa"
              width={144}
              height={144}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-brand-navy text-sm">Dr. Benjamin Azariah Mosiwa</p>
            <p className="text-brand-teal text-xs font-semibold mt-0.5">Founder & CEO</p>
            <p className="text-gray-400 text-xs mt-1">Lilongwe, Malawi</p>
            <a
              href="https://azariahmosiwa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold text-xs font-semibold hover:underline mt-2 inline-block"
            >
              Personal website →
            </a>
          </div>
          {/* Credentials */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-center w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Credentials</p>
            <div className="space-y-2 text-xs text-brand-muted">
              <p className="font-medium text-brand-navy">MSc Global Health Policy</p>
              <p className="text-gray-400">University of Edinburgh, 2022</p>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="font-medium text-brand-navy">MBBS</p>
                <p className="text-gray-400">University of Malawi, 2015</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio preview column */}
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold bg-white border border-gray-200 text-brand-navy px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Summary bio (always visible) */}
          <p className="text-brand-muted text-base leading-relaxed mb-4">
            Dr. Benjamin Azariah Mosiwa is a systems strategist and institutional reform
            advisor with over a decade of senior experience working inside Malawi's health
            system and across African development institutions. He founded Astellic in
            October 2025 to provide the kind of grounded, intellectually rigorous advisory
            that the development sector consistently lacks.
          </p>

          {/* Key stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: "10+", label: "Years in African systems" },
              { value: "9+",  label: "Countries engaged" },
              { value: "4",   label: "Peer-reviewed publications" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-brand-gold font-black text-xl leading-none mb-1">{s.value}</p>
                <p className="text-xs text-brand-muted leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Expand / collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200"
            aria-expanded={expanded}
          >
            {expanded ? "Collapse profile" : "View full profile"}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expandable full profile ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!expanded}
      >
        <div className="border-t border-gray-200 px-8 pb-8 pt-8 space-y-10">

          {/* Full bio */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Full Biography</p>
            <div className="space-y-4 text-brand-muted text-base leading-relaxed">
              <p>
                Dr. Benjamin Azariah Mosiwa is a systems strategist and institutional reform
                advisor with over a decade of senior experience working inside Malawi's health
                system and across African development institutions. He founded Astellic in
                October 2025 to provide the kind of grounded, intellectually rigorous advisory
                that the development sector consistently lacks: counsel that is embedded in
                institutional reality, not detached from it.
              </p>
              <p>
                His career spans clinical practice at a major public referral hospital, government-embedded
                programme management in direct partnership with the Ministry of Health and Population,
                institutional policy research across four African countries, and global-level
                policy advisory at a leading international health organisation. This progression
                across the full evidence-to-delivery chain — from system-level clinical work to
                executive policy leadership — is rare. It produces a quality of diagnostic
                insight that most advisory firms cannot replicate.
              </p>
              <p>
                He has designed and overseen the evaluation of complex, multi-country programmes;
                built adaptive MERL systems for donor-funded initiatives; advised governments on
                health financing frameworks and UHC planning; and supported evidence-to-policy
                translation processes for mental health, primary health care, and health
                system reform. He has worked embedded within the institutional machinery he
                now advises on — which means he understands why well-designed programmes fail,
                where data quality breaks down, and what implementation readiness actually
                requires in African public systems.
              </p>
              <p>
                He has engaged directly with FCDO, USAID implementing partners, WHO, UNICEF,
                WFP, Gavi, and the Global Fund — supporting reform initiatives, contributing
                peer-reviewed research, and co-authoring policy publications that have reached
                health ministries and multilateral organisations across the region. His work
                has been presented at international health systems conferences in Japan,
                Botswana, and Zimbabwe.
              </p>
              <p className="text-brand-navy font-medium">
                As Founder and CEO, Dr. Mosiwa is present throughout every Astellic engagement —
                from diagnostic design through to learning integration. The senior expertise does
                not disappear after the proposal is signed.
              </p>
            </div>

            {/* Geographic reach */}
            <div className="mt-6 flex items-start gap-3 bg-brand-light rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Geographic Reach</p>
                <p className="text-sm text-brand-navy font-medium">9+ African countries + United Kingdom</p>
                <p className="text-xs text-gray-400">Malawi · Kenya · Nigeria · Zambia · Ethiopia · South Africa · Zimbabwe · Botswana · Japan (global engagement)</p>
              </div>
            </div>
          </div>

          {/* Methodological Specialisations */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Methodological Specialisations</p>
            <p className="text-brand-muted text-sm mb-5">The methods through which Dr. Mosiwa produces analytically rigorous, operationally actionable results.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {methodologicalStrengths.map((m, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy mb-1">{m.area}</p>
                    <p className="text-xs text-brand-muted leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career History */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Career History</p>
            <div className="space-y-0">
              {careerHistory.map((item, i) => (
                <div
                  key={i}
                  className={`grid md:grid-cols-[200px_1fr] gap-4 ${
                    i < careerHistory.length - 1 ? "pb-6 mb-6 border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.period}</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm">{item.role}</p>
                    <p className="text-brand-teal text-xs font-semibold mb-2">{item.org}</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Consultancies */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Prior Consultancy Engagements</p>
              <a
                href="https://www.azariahmosiwa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold text-xs font-semibold hover:underline"
              >
                Full profile & CV at azariahmosiwa.com →
              </a>
            </div>
            <p className="text-brand-muted text-sm mb-5 leading-relaxed">
              The following engagements were completed by Dr. Mosiwa as an independent consultant or in a principal advisory role, prior to founding Astellic. They form the direct professional foundation for Astellic's advisory practice.
            </p>
            <div className="space-y-0">
              {consultancies.map((c, i) => (
                <div
                  key={i}
                  className={`grid md:grid-cols-[160px_1fr] gap-4 ${
                    i < consultancies.length - 1 ? "pb-5 mb-5 border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-xs text-gray-400 font-medium leading-snug">{c.period}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.geography}</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm leading-snug mb-0.5">{c.title}</p>
                    <p className="text-brand-teal text-xs font-semibold mb-1.5">{c.client}</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{c.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publications */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Selected Publications</p>
            <div className="space-y-3">
              {publications.map((pub, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 grid md:grid-cols-[60px_1fr] gap-4 items-start">
                  <div>
                    <span className="text-brand-gold font-bold text-sm">{pub.year}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{pub.type}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm leading-snug mb-1">{pub.title}</p>
                    <p className="text-xs text-brand-muted italic">{pub.journal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conferences */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Conferences & Presentations</p>
            <div className="space-y-3">
              {conferences.map((conf, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 grid md:grid-cols-[80px_1fr] gap-4 items-start">
                  <div>
                    <span className="text-brand-navy font-bold text-sm">{conf.year}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{conf.location}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm leading-snug mb-1">{conf.event}</p>
                    <p className="text-xs text-brand-muted leading-relaxed">{conf.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Partners */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Institutional Partnerships & Engagements</p>
            <p className="text-brand-muted text-sm mb-4 leading-relaxed">
              Listed by category of engagement, not as a client claim.
            </p>
            <div className="flex flex-wrap gap-2">
              {institutionalPartners.map((p) => (
                <span key={p} className="text-xs font-semibold bg-white border border-gray-200 text-brand-navy px-3 py-1.5 rounded-lg">
                  {p}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">
              We do not publish client logos or claim institutional endorsement without explicit permission.
            </p>
          </div>

          {/* Collapse button at bottom */}
          <div className="pt-2">
            <button
              onClick={() => { setExpanded(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-navy text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Collapse profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
