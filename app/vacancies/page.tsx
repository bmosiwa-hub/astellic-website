import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vacancies | Astellic",
  description: "Current job vacancies and open positions at Astellic.",
};

export default async function VacanciesPage() {
  const now = new Date();
  const postings = await prisma.jobPosting.findMany({
    where: {
      status: "OPEN",
      isPublishedToWebsite: true,
      OR: [{ deadline: null }, { deadline: { gt: now } }],
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">Vacancies</h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            Current open positions at Astellic. We hire people who are rigorous, intellectually honest,
            and driven to make development work better.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {postings.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-brand-muted text-lg mb-2">No open positions at this time.</p>
            <p className="text-brand-muted text-sm">Check back soon, or submit an expression of interest.</p>
            <a href="/vacancies/eoi" className="mt-6 inline-block text-brand-navy font-semibold text-sm hover:underline">
              Submit expression of interest →
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {postings.map((posting) => (
              <div key={posting.id} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Open</span>
                      {posting.contractType && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
                          {posting.contractType.replace(/_/g, " ")}
                        </span>
                      )}
                      {posting.department && (
                        <span className="inline-block bg-brand-light text-brand-navy text-xs px-2.5 py-0.5 rounded-full">{posting.department}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-brand-navy mb-1">{posting.title}</h2>
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
                      Apply Here
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
            ))}
          </div>
        )}

        {/* EOI callout */}
        <div className="mt-12 bg-brand-light rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-brand-navy mb-1">Consultants Roster</p>
          <p className="text-brand-muted text-sm mb-4">
            Not seeing a match? We maintain a consultants roster for future opportunities.
          </p>
          <a
            href="/documents/Astellic_EOI_Consultants_Roster.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Download EOI
          </a>
        </div>
      </div>
    </>
  );
}
