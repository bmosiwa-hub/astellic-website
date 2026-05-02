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
  photo?: string;
  bio?: string;
  profileUrl?: string;
  profileLabel?: string;
}

const executiveTeam: TeamMember[] = [
  {
    name: "Dr. Benjamin Azariah Mosiwa",
    title: "Founder & CEO",
    photo: "/images/team-benjamin-mosiwa.jpg",
    profileUrl: "https://azariahmosiwa.com/",
    profileLabel: "Read Dr. Mosiwa's full profile",
    bio: "With over a decade of experience across health and development systems strengthening, policy research, strategic advisory, and the evaluation of complex programmes, Dr. Benjamin Azariah Mosiwa brings a distinctive blend of technical rigor and strategic influence to every engagement.\n\nHe has worked directly within government ministries, supported donor-funded reform initiatives, contributed to peer-reviewed research, and strengthened health programmes through evaluation and high-level advisory. His work is consistently driven by a clear objective: translating evidence and analysis into actionable decisions that improve health and development outcomes.\n\nAs Founder and CEO of Astellic, he provides strategic leadership to a growing research, advisory and implementation firm, setting its vision, building high-performing multidisciplinary teams, and positioning the organization within competitive regional and global health and development markets. He leads on business development, partnership cultivation, and quality assurance across all engagements, ensuring that Astellic delivers innovative, evidence-driven solutions while maintaining strong operational sustainability and growth.",
  },
];
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
    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-5">
      {/* Photo + name row */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-light shrink-0">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-brand-navy">{member.name}</h3>
          <p className="text-brand-gold font-medium text-base">{member.title}</p>
        </div>
      </div>
      {/* Bio */}
      {member.bio && (
        <div className="space-y-4">
          {member.bio.split("\n\n").map((para, i) => (
            <p key={i} className="text-brand-muted text-base leading-relaxed">{para}</p>
          ))}
        </div>
      )}
      {/* External profile link */}
      {member.profileUrl && (
        <a
          href={member.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-base font-medium transition-colors self-start"
        >
          {member.profileLabel ?? "View Full Profile"}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
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
          src="/images/hero-thematic.jpg"
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
            <div className={`grid gap-6 ${executiveTeam.length === 1 ? "max-w-3xl" : "md:grid-cols-2"}`}>
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
