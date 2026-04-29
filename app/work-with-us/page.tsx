import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work With Us",
  description:
    "Explore open positions, consultancy opportunities, and tenders at Astellic.",
};

const jobs: { title: string; type: string; location: string; closing: string }[] =
  [];

const consultancies: {
  title: string;
  area: string;
  duration: string;
  closing: string;
}[] = [];

const tenders: { title: string; reference: string; closing: string }[] = [];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center">
      <p className="text-brand-muted text-base">
        No {label} currently open. Check back soon.
      </p>
    </div>
  );
}

export default function WorkWithUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
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
            <div className="w-1 h-8 bg-brand-teal rounded" />
            <h2 className="text-2xl font-bold">Open Positions</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Full-time and part-time roles across research, advisory, and
            operations.
          </p>
          {jobs.length === 0 ? (
            <EmptyState label="positions" />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.title}
                  className="bg-brand-light rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-brand-muted text-base mt-1">
                      {job.type} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <p className="text-brand-muted text-sm">
                      Closes: {job.closing}
                    </p>
                    <Link
                      href="/contact"
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white px-5 py-2 rounded text-sm transition-colors"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Consultancies */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-gold rounded" />
            <h2 className="text-2xl font-bold">Consultancies</h2>
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
                <div
                  key={c.title}
                  className="bg-brand-light rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-lg">{c.title}</h3>
                    <p className="text-brand-muted text-base mt-1">
                      {c.area} · {c.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <p className="text-brand-muted text-sm">
                      Closes: {c.closing}
                    </p>
                    <Link
                      href="/contact"
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white px-5 py-2 rounded text-sm transition-colors"
                    >
                      Express Interest
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tenders & Bids */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-brand-navy rounded" />
            <h2 className="text-2xl font-bold">Tenders & Bids</h2>
          </div>
          <p className="text-brand-muted text-lg mb-8">
            Procurement opportunities and requests for proposals from Astellic
            and its partners.
          </p>
          {tenders.length === 0 ? (
            <EmptyState label="tenders" />
          ) : (
            <div className="space-y-4">
              {tenders.map((t) => (
                <div
                  key={t.reference}
                  className="bg-brand-light rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-lg">{t.title}</h3>
                    <p className="text-brand-muted text-base mt-1">
                      Ref: {t.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <p className="text-brand-muted text-sm">
                      Closes: {t.closing}
                    </p>
                    <Link
                      href="/contact"
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white px-5 py-2 rounded text-sm transition-colors"
                    >
                      Submit Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* General CTA */}
        <section className="bg-brand-navy text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Don&apos;t see a fit?</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-xl mx-auto">
            We welcome expressions of interest from exceptional individuals and
            organisations aligned with our mission. Reach out and tell us how
            you can contribute.
          </p>
          <Link
            href="/contact"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white px-8 py-3 rounded font-medium text-base transition-colors"
          >
            Get in Touch
          </Link>
        </section>
      </div>
    </>
  );
}
