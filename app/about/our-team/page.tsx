import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TeamGrid from "@/components/TeamGrid";

export const metadata: Metadata = {
  title: "Our Team | Astellic",
  description:
    "Meet Dr. Benjamin Azariah Mosiwa — Founder & CEO of Astellic, systems strategist, and evidence-to-delivery specialist with over a decade of senior experience in African development.",
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

const executiveTeam: TeamMember[] = [
  {
    name: "Dr. Benjamin Azariah Mosiwa",
    title: "Founder & CEO",
    shortName: "Dr. Mosiwa",
    photo: "/images/team-benjamin-mosiwa.jpg",
    profileUrl: "https://azariahmosiwa.com/",
    profileLabel: "Read Dr. Mosiwa's full profile",
    bio: "With over a decade of senior experience working inside Malawi's health system and across pan-African development contexts, Dr. Benjamin Azariah Mosiwa brings a distinctive combination of analytical rigour, institutional grounding, and strategic influence to every engagement.\n\nHe has worked embedded within the Ministry of Health and Population, supported donor-funded reform initiatives led by FCDO, WHO, UNICEF, WFP, and USAID implementing partners, contributed to peer-reviewed research, and designed and led the evaluation of complex development programmes across health, governance, and social systems.\n\nThis is not advisory from the outside looking in. It is grounded intelligence from someone who has worked within the institutional machinery he now advises on.\n\nAs Founder and CEO of Astellic, Dr. Mosiwa provides strategic leadership across research, advisory, and implementation engagements — setting the firm's direction, building its specialist capability, and personally leading on business development, partnership cultivation, and quality assurance. He is present throughout every engagement, from inception to learning integration.",
  },
];

const boardMembers: TeamMember[] = [];

const expertise = [
  "Adaptive MERL & learning systems design",
  "Data quality assurance and verification (DQA)",
  "Health systems strengthening and financing",
  "Policy-to-implementation diagnostics",
  "Political economy analysis",
  "Programme evaluation (formative, summative, impact)",
  "Institutional capacity development",
  "Public financial management advisory",
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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Executive Leadership</h2>
          </div>

          {/* Featured founder card */}
          <div className="bg-brand-light rounded-2xl border border-gray-100 p-8 grid md:grid-cols-[auto_1fr] gap-10 items-start mb-8">
            {/* Photo */}
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
                <a
                  href="https://azariahmosiwa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold text-xs font-semibold hover:underline mt-2 inline-block"
                >
                  Full profile →
                </a>
              </div>
            </div>

            {/* Bio content */}
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Systems Strategist", "Evidence-to-Delivery Specialist", "Policy & Implementation Expert", "African Development Advisor"].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-white border border-gray-200 text-brand-navy px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-4 text-brand-muted text-base leading-relaxed">
                <p>
                  With over a decade of senior experience working inside Malawi&apos;s health system
                  and across pan-African development contexts, Dr. Mosiwa brings a distinctive
                  combination of analytical rigour, institutional grounding, and strategic influence
                  to every engagement.
                </p>
                <p>
                  He has worked embedded within the Ministry of Health and Population, supported
                  donor-funded reform initiatives led by FCDO, WHO, UNICEF, WFP, and USAID
                  implementing partners, contributed to peer-reviewed research, and designed and led
                  the evaluation of complex development programmes across health, governance, and
                  social systems.
                </p>
                <p>
                  This is not advisory from the outside looking in. It is grounded intelligence
                  from someone who has worked within the institutional machinery he now advises on.
                </p>
                <p className="text-brand-navy font-medium">
                  As Founder and CEO, Dr. Mosiwa is present throughout every Astellic engagement —
                  from design through to learning integration. The senior expertise does not disappear
                  after the proposal is signed.
                </p>
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
