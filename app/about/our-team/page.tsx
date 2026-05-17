import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TeamGrid from "@/components/TeamGrid";
import FounderProfile from "@/components/FounderProfile";
import { Reveal, FadeUp, ScaleIn } from "@/components/Reveal";

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
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-5">
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

        {/* ── Executive Leadership ─────────────────────────────────────────── */}
        <section>
          <FadeUp>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-brand-gold rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Executive Leadership</h2>
            </div>
          </FadeUp>

          <ScaleIn delay={100}>
            <FounderProfile />
          </ScaleIn>
        </section>

        {/* ── Board of Directors ────────────────────────────────────────── */}
        <section>
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-8 bg-brand-navy rounded" />
              <h2 className="text-2xl font-bold text-brand-navy">Board of Directors</h2>
            </div>
          </FadeUp>
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
          <FadeUp>
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
          </FadeUp>
        </section>

      </div>
    </>
  );
}
