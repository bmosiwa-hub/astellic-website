import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the executive management and board of directors of Astellic.",
};

interface TeamMember {
  name: string;
  title: string;
  bio?: string;
}

const executiveTeam: TeamMember[] = [];
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

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-3">
      <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center shrink-0">
        <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-navy">{member.name}</h3>
        <p className="text-brand-gold font-medium text-base">{member.title}</p>
      </div>
      {member.bio && (
        <p className="text-brand-muted text-base leading-relaxed">{member.bio}</p>
      )}
    </div>
  );
}

export default function OurTeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-about.jpg"
          alt="Astellic team"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Our Team
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic is led by a team of experienced researchers, advisors, and
            development practitioners committed to evidence-based policy and
            effective implementation across Africa.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* Executive Management */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold">Executive Management</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            The leadership team responsible for driving Astellic&apos;s strategy,
            operations, and client delivery.
          </p>
          {executiveTeam.length === 0 ? (
            <EmptyState label="Executive team" />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {executiveTeam.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          )}
        </section>

        {/* Board of Directors */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-navy rounded" />
            <h2 className="text-2xl font-bold">Board of Directors</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Astellic&apos;s board provides strategic oversight and governance,
            bringing broad expertise across development, policy, and private sector.
          </p>
          {boardMembers.length === 0 ? (
            <EmptyState label="Board" />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {boardMembers.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
}
