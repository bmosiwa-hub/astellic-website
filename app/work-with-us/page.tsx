import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work With Us | Astellic",
  description:
    "Explore open positions, consultancy opportunities, and tenders at Astellic.",
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center">
      <p className="text-brand-muted text-base">
        No {label} currently open. Check back soon.
      </p>
    </div>
  );
}

export default async function WorkWithUsPage() {
  const now = new Date();
  const postings = await prisma.jobPosting.findMany({
    where: {
      status: "OPEN",
      isPublishedToWebsite: true,
      OR: [{ deadline: null }, { deadline: { gt: now } }],
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });

  const positions    = postings.filter(p => p.contractType === "PERMANENT");
  const consultancies = postings.filter(p => p.contractType === "CONSULTANCY" || p.contractType === "CONTRACT");
  const internships  = postings.filter(p => p.contractType === "INTERNSHIP" || p.contractType === "VOLUNTEER");

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-work.jpg"
          alt="Professionals in a job interview setting"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Work With Us
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic brings together researchers, policy advisors, and
            implementation specialists. Explore how you can contribute to our
            work — whether as staff, a consultant, or a partner.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* Open Positions */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Open Positions</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Full-time and part-time roles across research, advisory, and
            operations.
          </p>
          {positions.length === 0 ? (
            <EmptyState label="positions" />
          ) : (
            <div className="space-y-4">
              {positions.map((job) => (
                <PostingCard key={job.id} posting={job} applyLabel="Apply" />
              ))}
            </div>
          )}
        </section>

        {/* Consultancies */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Consultancies</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Short- and long-term consultancy assignments across our thematic
            areas.
          </p>
          {consultancies.length === 0 ? (
            <EmptyState label="consultancies" />
          ) : (
            <div className="space-y-4">
              {consultancies.map((c) => (
                <PostingCard key={c.id} posting={c} applyLabel="Express Interest" />
              ))}
            </div>
          )}

          {/* Join Our Roster — sits under Consultancies */}
          <div className="mt-10 bg-brand-navy text-white rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Join Our Roster</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-xl mx-auto">
              We maintain a roster of senior consultants and associates across our
              thematic areas. If you have the experience and want to work with
              Astellic on a consultancy basis, apply to join our roster.
            </p>
            <Link
              href="/join-our-roster"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-lg transition-colors"
            >
              Apply to Our Roster
            </Link>
          </div>
        </section>

        {/* Internships */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Internships</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Opportunities for students and recent graduates to gain hands-on
            experience across research, advisory, and operations.
          </p>
          {internships.length === 0 ? (
            <EmptyState label="internships" />
          ) : (
            <div className="space-y-4">
              {internships.map((i) => (
                <PostingCard key={i.id} posting={i} applyLabel="Apply" />
              ))}
            </div>
          )}
        </section>

        {/* Tenders & Bids */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-navy rounded" />
            <h2 className="text-2xl font-bold text-brand-navy">Tenders &amp; Bids</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Procurement opportunities and requests for proposals from Astellic
            and its partners.
          </p>
          <EmptyState label="tenders" />
        </section>

      </div>
    </>
  );
}

type Posting = {
  id: string;
  title: string;
  contractType: string;
  location: string | null;
  department: string | null;
  deadline: Date | null;
  salary: string | null;
  description: string;
  mandatoryConditions: string[];
};

function PostingCard({ posting, applyLabel }: { posting: Posting; applyLabel: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Open</span>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
              {posting.contractType.replace(/_/g, " ")}
            </span>
            {posting.department && (
              <span className="inline-block bg-brand-light text-brand-navy text-xs px-2.5 py-0.5 rounded-full">{posting.department}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-1">{posting.title}</h3>
          {posting.location && <p className="text-sm text-brand-muted mb-2">{posting.location}</p>}
          <p className="text-brand-muted text-sm leading-relaxed line-clamp-3">{posting.description}</p>
          {posting.deadline && (
            <p className="text-sm text-brand-muted mt-3">
              <span className="font-semibold text-brand-navy">Closing:</span>{" "}
              {new Date(posting.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          {posting.salary && (
            <p className="text-sm text-brand-muted">
              <span className="font-semibold text-brand-navy">Salary:</span> {posting.salary}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <Link
            href={`/vacancies/${posting.id}/apply`}
            className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            {applyLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      {posting.mandatoryConditions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mandatory Requirements</p>
          <ul className="flex flex-wrap gap-2">
            {posting.mandatoryConditions.map((c, i) => (
              <li key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1">{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
