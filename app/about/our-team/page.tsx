import type { Metadata } from "next";
import Image from "next/image";
import TeamGrid from "@/components/TeamGrid";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the executive management and board of directors of Astellic.",
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
            <TeamGrid members={executiveTeam} />
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
            <TeamGrid members={boardMembers} />
          )}
        </section>

      </div>
    </>
  );
}
