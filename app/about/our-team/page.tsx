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

const expertise = [
  "Adaptive MERL & learning systems design",
  "Data quality assurance and verification (DQA)",
  "Health systems strengthening and financing",
  "Policy and systems analysis and development",
  "Political economy analysis",
  "Programme evaluation (formative, summative, impact)",
  "Institutional capacity development",
  "Public financial management advisory",
  "Digital health policy and governance",
  "Universal health coverage (UHC) financing",
];

const careerHistory = [
  {
    role: "Founder & CEO",
    org: "Astellic",
    period: "October 2025 — Present",
    desc: "Leads all research, advisory, and implementation engagements. Directs business development, partnership cultivation, and quality assurance across the firm's growing portfolio.",
  },
  {
    role: "Policy Advisor",
    org: "Kamuzu University of Health Sciences / African Mental Health Research Initiative (AMARI)",
    period: "December 2025 — Present",
    desc: "Multi-country mental health policy and research translation across Malawi, Ethiopia, South Africa, and Zimbabwe.",
  },
  {
    role: "Senior Manager, Policy & Advocacy",
    org: "VillageReach (Global)",
    period: "January 2025 — September 2025",
    desc: "Primary health care, immunisation, digital health, and health financing policy. Co-authored the 2025 VillageReach guide on responsive primary health care for policymakers.",
  },
  {
    role: "Research & Policy Associate",
    org: "African Institute for Development Policy (AFIDEP)",
    period: "January 2023 — December 2024",
    desc: "Health financing research and government capacity building across Malawi, Kenya, Nigeria, and Zambia.",
  },
  {
    role: "Director of Programs and Strategy",
    org: "Facilitators of Community Transformation (FACT), Malawi",
    period: "2017 — 2021",
    desc: "Led health systems and digital health programmes in direct partnership with Malawi's Ministry of Health and Population.",
  },
  {
    role: "Medical Officer",
    org: "Ministry of Health — Queen Elizabeth Central Hospital, Blantyre",
    period: "2015 — 2017",
    desc: "Clinical care and health system quality improvement at Malawi's largest public referral hospital.",
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
                {["Systems Strategist", "Health Policy Expert", "Evidence-to-Delivery Specialist", "Political Economy Analyst", "African Development Advisor"].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-white border border-gray-200 text-brand-navy px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-4 text-brand-muted text-base leading-relaxed">
                <p>
                  Dr. Benjamin Azariah Mosiwa is a systems strategist and evidence-to-delivery
                  specialist with over a decade of senior experience working inside Malawi&apos;s
                  health system and across African development contexts. He founded Astellic in
                  October 2025 to provide the kind of grounded, intellectually rigorous advisory
                  that the development sector consistently lacks.
                </p>
                <p>
                  His career spans clinical practice, government-embedded programme management,
                  institutional policy research, and senior advisory — giving him a rare vantage
                  point across the full evidence-to-delivery chain. He has worked embedded within
                  the Ministry of Health and Population, supported donor-funded reform initiatives
                  led by FCDO, WHO, UNICEF, WFP, and USAID implementing partners, contributed to
                  peer-reviewed research, and designed and led the evaluation of complex development
                  programmes across health, governance, and social systems.
                </p>
                <p>
                  This is not advisory from the outside looking in. It is grounded intelligence
                  from someone who has worked within the institutional machinery he now advises on.
                  He understands why well-designed programmes fail, where data quality breaks down,
                  and what implementation readiness actually requires in African public systems.
                </p>
                <p className="text-brand-navy font-medium">
                  As Founder and CEO, Dr. Mosiwa is present throughout every Astellic engagement —
                  from design through to learning integration. The senior expertise does not disappear
                  after the proposal is signed.
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
                  <p className="text-xs text-gray-400">Malawi, Kenya, Nigeria, Zambia, Ethiopia, South Africa, Zimbabwe, and across the region</p>
                </div>
              </div>

              {/* Expertise areas */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Areas of Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((e) => (
                    <span key={e} className="text-xs bg-white border border-gray-200 text-brand-muted px-3 py-1.5 rounded-lg">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </ScaleIn>

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
                    <p className="text-brand-teal text-xs font-semibold mb-1">{item.org}</p>
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
            <p className="text-xs text-gray-400 pl-1">
              Also presented at: Global Symposium for Health Systems Research (Japan, 2024),
              HELINA Conference (Botswana, 2025), AFREhealth Conference (Zimbabwe, 2022).
            </p>
          </div>
        </section>

        {/* ── Institutional Partners ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-brand-navy mb-2">Institutional Partnerships & Engagements</h3>
          <p className="text-brand-muted text-sm mb-6 leading-relaxed">
            Dr. Mosiwa has worked directly with or supported engagements involving the following
            organisations. Listed by category, not by client claim.
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
