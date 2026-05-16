import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TeamGrid from "@/components/TeamGrid";
import { Reveal, FadeUp, FadeIn, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Our Team | Astellic",
  description:
    "Meet Dr. Benjamin Azariah Mosiwa — Founder & CEO of Astellic. Systems strategist, health policy expert, and evidence-to-delivery specialist with over a decade of senior experience in African development systems.",
};

export interface TeamMember {
  name: string;
  title: string;
  shortName: string;
  photo?: string;
  bio?: string;
  profileUrl?: string;
  profileLabel?: string;
}

const boardMembers: TeamMember[] = [];

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

const institutionalPartners = [
  "USAID",
  "FCDO",
  "World Bank",
  "WHO",
  "UNICEF",
  "Gavi",
  "Global Fund",
  "Africa CDC",
  "Gates Foundation",
  "Palladium",
  "DAI",
  "AFIDEP",
  "VillageReach",
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center">
      <p className="text-brand-muted text-base">
        {label} profiles are being compiled. Check back soon.
      </p>
    </div>
  );
}

export default function OurTeamPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Astellic leadership"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Our Team
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Senior-led. Specialist. Present throughout.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic is founder-led. The person who designs your engagement is the person
            who delivers it — bringing over a decade of embedded experience in African
            development systems to every client relationship.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* ── Founder Feature ───────────────────────────────────────────── */}
        <section>
          <FadeUp>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Executive Leadership</h2>
          </div>
          </FadeUp>

          {/* Featured founder card */}
          <ScaleIn delay={100}>
          <div className="bg-brand-light rounded-2xl border border-gray-100 p-8 grid md:grid-cols-[auto_1fr] gap-10 items-start mb-8">
            {/* Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0">
                <Image
                  src="/images/team-benjamin-mosiwa.jpg"
                  alt="Dr. Benjamin Azariah Mosiwa"
                  width={160}
                  height={160}
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
                  Full profile →
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

            {/* Bio content */}
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Systems Strategist", "Health Policy Expert", "Evidence-to-Delivery Specialist", "Political Economy Analyst", "Institutional Reform Advisor"].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-white border border-gray-200 text-brand-navy px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-4 text-brand-muted text-base leading-relaxed">
                <p>
                  Dr. Benjamin Azariah Mosiwa is a systems strategist and institutional reform
                  advisor with over a decade of senior experience working inside Malawi&apos;s health
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
              <div className="mt-5 flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
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
          </div>
          </ScaleIn>

          {/* ── Methodological Specialisations ────────────────────────────── */}
          <FadeUp delay={80}>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h3 className="text-lg font-bold text-brand-navy mb-1">Methodological Specialisations</h3>
            <p className="text-brand-muted text-sm mb-6">The methods through which Dr. Mosiwa produces analytically rigorous, operationally actionable results.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {methodologicalStrengths.map((m, i) => (
                <div key={i} className="flex items-start gap-3 bg-brand-light rounded-xl p-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy mb-1">{m.area}</p>
                    <p className="text-xs text-brand-muted leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </FadeUp>

          {/* ── Career History ─────────────────────────────────────────── */}
          <FadeUp delay={100}>
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Career History</h3>
            <div className="space-y-0">
              {careerHistory.map((item, i) => (
                <div key={i} className={`grid md:grid-cols-[200px_1fr] gap-4 ${i < careerHistory.length - 1 ? "pb-6 mb-6 border-b border-gray-50" : ""}`}>
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
          </FadeUp>
        </section>

        {/* ── Publications ──────────────────────────────────────────────── */}
        <section>
          <FadeUp>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-teal rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Selected Publications</h2>
          </div>
          </FadeUp>
          <div className="space-y-4">
            {publications.map((pub, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl border border-gray-100 p-5 grid md:grid-cols-[60px_1fr] gap-4 items-start">
                <div className="text-center">
                  <span className="text-brand-gold font-bold text-sm">{pub.year}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{pub.type}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-navy text-sm leading-snug mb-1">{pub.title}</p>
                  <p className="text-xs text-brand-muted italic">{pub.journal}</p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Conferences & Presentations ───────────────────────────────── */}
        <section>
          <FadeUp>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Conferences & Presentations</h2>
          </div>
          </FadeUp>
          <div className="space-y-4">
            {conferences.map((conf, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
              <div className="bg-brand-light rounded-xl border border-gray-100 p-5 grid md:grid-cols-[80px_1fr] gap-4 items-start">
                <div>
                  <span className="text-brand-navy font-bold text-sm">{conf.year}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{conf.location}</p>
                </div>
                <div>
                  <p className="font-semibold text-brand-navy text-sm leading-snug mb-1">{conf.event}</p>
                  <p className="text-xs text-brand-muted leading-relaxed">{conf.topic}</p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Institutional Partners ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <FadeUp>
          <h3 className="text-lg font-bold text-brand-navy mb-2">Institutional Partnerships & Engagements</h3>
          <p className="text-brand-muted text-sm mb-6 leading-relaxed">
            Dr. Mosiwa has worked directly with or supported engagements involving the following
            organisations — listed by category of engagement, not as a client claim.
          </p>
          <div className="flex flex-wrap gap-2">
            {institutionalPartners.map((p) => (
              <span key={p} className="text-xs font-semibold bg-brand-light border border-gray-200 text-brand-navy px-3 py-1.5 rounded-lg">
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">
            We do not publish client logos or claim institutional endorsement without explicit permission.
          </p>
          </FadeUp>
        </section>

        {/* ── Board of Directors ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-navy rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Board of Directors</h2>
          </div>
          <p className="text-brand-muted text-base mb-8 leading-relaxed max-w-xl">
            Astellic&apos;s board provides strategic oversight and governance, bringing
            broad expertise across development, policy, and private sector.
          </p>
          {boardMembers.length === 0 ? (
            <EmptyState label="Board" />
          ) : (
            <TeamGrid members={boardMembers} />
          )}
        </section>

        {/* ── Associate Network ─────────────────────────────────────────── */}
        <section className="bg-brand-light rounded-2xl p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-3">Associate & Expert Network</h2>
          <p className="text-brand-muted text-base leading-relaxed max-w-2xl mb-5">
            Astellic maintains a roster of specialist associates across health systems,
            governance, education, climate, and corporate sustainability — enabling us to
            scale expert capacity for engagements that require additional specialist depth.
          </p>
          <Link
            href="/join-our-roster"
            className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm hover:gap-2.5 transition-all"
          >
            Join our associate roster
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      </div>
    </>
  );
}
