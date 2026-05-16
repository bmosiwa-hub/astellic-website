import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Publications, expressions of interest, calls for consultants, and other documents from Astellic.",
};

interface ResourceDoc {
  title: string;
  description: string;
  type: string;
  closing?: string;
  file: string;
}

const documents: ResourceDoc[] = [
  {
    title: "Expression of Interest — Consultants Roster",
    description:
      "Astellic is building a roster of qualified consultants and associates across its thematic areas in Malawi. Download the expressions of interest to learn more about the recruitment.",
    type: "Expression of Interest",
    file: "/documents/Astellic_EOI_Consultants_Roster.pdf",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-work.jpg"
          alt="Astellic resources and publications"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Resources
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Publications, calls for consultants, expressions of interest, and
            other documents from Astellic. Click any document to open or
            download it.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {documents.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-brand-muted text-lg">
              No documents available at this time. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map((doc) => (
              <div
                key={doc.file}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:items-start gap-6"
              >
                {/* PDF icon */}
                <div className="shrink-0 w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-brand-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-brand-gold/10 text-brand-gold text-sm font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                    {doc.type}
                  </span>
                  <h2 className="text-xl font-bold text-brand-navy mb-2">
                    {doc.title}
                  </h2>
                  <p className="text-brand-muted text-base leading-relaxed mb-4">
                    {doc.description}
                  </p>
                  {doc.closing && (
                    <p className="text-base text-brand-muted mb-4">
                      <span className="font-semibold text-brand-navy">Closing:</span>{" "}
                      {doc.closing}
                    </p>
                  )}
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-base font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Open / Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
