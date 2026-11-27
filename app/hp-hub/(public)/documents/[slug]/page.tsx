import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/hp-hub/CopyButton";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import FeedbackForm from "@/components/hp-hub/FeedbackForm";
import { AccessBadge, Breadcrumbs, jsonLdString, SectionHeading, VerificationBadge } from "@/components/hp-hub/ui";
import { ACCESS_DESCRIPTIONS, HP_HUB_BASE_URL, PERMISSION_LABELS } from "@/lib/hp-hub/constants";
import { getPublicDocument, getRelatedDocuments } from "@/lib/hp-hub/queries";
import { buildCitation, excerpt, fileTypeLabel, formatFileSize, periodLabel } from "@/lib/hp-hub/text";
import { isPubliclyDownloadable, showSyntheticRecords } from "@/lib/hp-hub/visibility";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getPublicDocument((await params).slug);
  if (!doc) return { title: "Document not found", robots: { index: false } };
  const description =
    excerpt(doc.description || doc.abstract, 160) ||
    `${doc.documentType.name} published by ${doc.publisher.name}${doc.publicationYear ? ` in ${doc.publicationYear}` : ""} (${doc.country.name}).`;
  const url = `/hp-hub/documents/${doc.slug}`;
  return {
    title: `${doc.title}${doc.publicationYear ? ` (${doc.publicationYear})` : ""}`,
    description,
    alternates: { canonical: url },
    robots: doc.isSynthetic ? { index: false, follow: false } : undefined,
    openGraph: { title: doc.title, description, url, type: "article" },
    other: {
      // Google Scholar-style citation tags help academic indexing.
      citation_title: doc.title,
      ...(doc.authors.length ? { citation_author: doc.authors } : {}),
      citation_publisher: doc.publisher.name,
      ...(doc.publicationYear ? { citation_publication_date: String(doc.publicationYear) } : {}),
      citation_language: doc.language,
    },
  };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] gap-4 py-3 border-b border-gray-100 text-[15px]">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-brand-navy min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default async function DocumentPage({ params }: Props) {
  const doc = await getPublicDocument((await params).slug);
  if (!doc) notFound();

  const related = await getRelatedDocuments(doc, 4);
  const themes = doc.themes.map((t) => t.theme);
  const keywords = doc.keywords.map((k) => k.keyword.name);
  const period = periodLabel(doc.startYear, doc.endYear);
  const downloadable = isPubliclyDownloadable(doc);
  const citation =
    doc.citationText ||
    buildCitation({
      title: doc.title,
      authors: doc.authors,
      publisherName: doc.publisher.name,
      publicationYear: doc.publicationYear,
      countryName: doc.country.name,
      documentTypeName: doc.documentType.name,
      sourceUrl: doc.sourceUrl || `${HP_HUB_BASE_URL}/hp-hub/documents/${doc.slug}`,
      edition: doc.edition,
      version: doc.version,
    });
  const visible = (d: { status: string; isSynthetic: boolean }) => d.status === "PUBLISHED" && (!d.isSynthetic || showSyntheticRecords());
  const supersededBy = doc.supersededBy && visible(doc.supersededBy) ? doc.supersededBy : null;
  const supersedes = doc.supersedes.filter(visible);
  const startedAt = Date.now();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: doc.title,
    url: `${HP_HUB_BASE_URL}/hp-hub/documents/${doc.slug}`,
    description: excerpt(doc.description || doc.abstract, 300) || undefined,
    inLanguage: doc.language,
    datePublished: doc.publicationDate?.toISOString().slice(0, 10) ?? (doc.publicationYear ? String(doc.publicationYear) : undefined),
    publisher: { "@type": "Organization", name: doc.publisher.name, ...(doc.publisher.website ? { url: doc.publisher.website } : {}) },
    author: doc.authors.length ? doc.authors.map((name) => ({ "@type": "Person", name })) : { "@type": "Organization", name: doc.publisher.name },
    spatialCoverage: { "@type": "Country", name: doc.country.name },
    ...(period ? { temporalCoverage: `${doc.startYear ?? ".."}/${doc.endYear ?? ".."}` } : {}),
    keywords: [...themes.map((t) => t.name), ...keywords].join(", ") || undefined,
    genre: doc.documentType.name,
    isAccessibleForFree: doc.accessType !== "RESTRICTED",
    ...(doc.sourceUrl ? { sameAs: doc.sourceUrl } : {}),
    ...(doc.rightsHolder ? { copyrightHolder: { "@type": "Organization", name: doc.rightsHolder } } : {}),
    includedInDataCatalog: { "@type": "DataCatalog", name: "Health Policy Intelligence Hub (HP-Hub)", url: `${HP_HUB_BASE_URL}/hp-hub` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <section className="bg-brand-light border-b border-gray-200 px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "HP-Hub", href: "/hp-hub" },
              { label: doc.country.name, href: `/hp-hub/${doc.country.slug}` },
              { label: doc.documentType.name, href: `/hp-hub/types/${doc.documentType.slug}` },
              { label: doc.title },
            ]}
          />
          {doc.isSynthetic && (
            <p className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
              Synthetic development record: not a real document
            </p>
          )}
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">{doc.documentType.name}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-brand-navy leading-tight max-w-4xl">{doc.title}</h1>
          <p className="mt-4 text-lg text-brand-muted">
            {[doc.publisher.name, doc.publicationYear, doc.country.name].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <AccessBadge access={doc.accessType} />
            <VerificationBadge status={doc.verificationStatus} />
          </div>
        </div>
      </section>

      {supersededBy && (
        <div className="px-6 bg-amber-50 border-b border-amber-200">
          <p className="max-w-6xl mx-auto py-3 text-sm text-amber-900">
            This document has been superseded by{" "}
            <Link href={`/hp-hub/documents/${supersededBy.slug}`} className="font-semibold underline underline-offset-2">
              {supersededBy.title}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_340px] gap-12 lg:gap-16">
          <div className="min-w-0 space-y-12">
            {(doc.abstract || doc.description) && (
              <section aria-labelledby="summary">
                <h2 id="summary" className="text-xl font-bold text-brand-navy mb-4">
                  {doc.abstract ? "Abstract" : "Description"}
                </h2>
                <div className="text-[17px] leading-relaxed text-gray-700 space-y-4 max-w-3xl whitespace-pre-line">{doc.abstract || doc.description}</div>
                {doc.abstract && doc.description && (
                  <div className="mt-6 text-[15px] leading-relaxed text-gray-600 max-w-3xl whitespace-pre-line">{doc.description}</div>
                )}
              </section>
            )}

            <section aria-labelledby="details">
              <h2 id="details" className="text-xl font-bold text-brand-navy mb-2">
                Document details
              </h2>
              <dl>
                <Row label="Title">{doc.title}</Row>
                <Row label="Publisher">
                  <Link href={`/hp-hub/search?publisher=${doc.publisher.slug}`} className="hover:text-brand-teal underline-offset-4 hover:underline">
                    {doc.publisher.name}
                    {doc.publisher.acronym ? ` (${doc.publisher.acronym})` : ""}
                  </Link>
                </Row>
                {doc.authors.length > 0 && <Row label={doc.authors.length > 1 ? "Authors" : "Author"}>{doc.authors.join("; ")}</Row>}
                <Row label="Publication year">{doc.publicationYear ?? "Not stated"}</Row>
                {period && <Row label="Period covered">{period}</Row>}
                <Row label="Country">
                  <Link href={`/hp-hub/${doc.country.slug}`} className="hover:text-brand-teal underline-offset-4 hover:underline">
                    {doc.country.name}
                  </Link>
                </Row>
                <Row label="Document type">
                  <Link href={`/hp-hub/types/${doc.documentType.slug}`} className="hover:text-brand-teal underline-offset-4 hover:underline">
                    {doc.documentType.name}
                  </Link>
                </Row>
                {themes.length > 0 && (
                  <Row label="Themes">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {themes.map((t) => (
                        <li key={t.slug}>
                          <Link href={`/hp-hub/themes/${t.slug}`} className="hover:text-brand-teal underline-offset-4 hover:underline">
                            {t.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}
                {keywords.length > 0 && (
                  <Row label="Keywords">
                    <ul className="flex flex-wrap gap-2">
                      {keywords.map((k) => (
                        <li key={k}>
                          <Link href={`/hp-hub/search?q=${encodeURIComponent(`"${k}"`)}`} className="text-sm bg-brand-light rounded px-2 py-0.5 hover:bg-gray-200">
                            {k}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}
                <Row label="Language">{doc.language}</Row>
                {(doc.version || doc.edition) && <Row label="Version / edition">{[doc.version, doc.edition].filter(Boolean).join(" · ")}</Row>}
                <Row label="Verification">
                  <VerificationBadge status={doc.verificationStatus} />
                </Row>
                {doc.fileType && downloadable && (
                  <Row label="File">
                    {fileTypeLabel(doc.fileType, doc.fileName)}
                    {doc.fileSize ? `, ${formatFileSize(doc.fileSize)}` : ""}
                  </Row>
                )}
                {doc.sourceUrl && doc.accessType !== "RESTRICTED" && (
                  <Row label="Original source">
                    <a href={`/hp-hub/documents/${doc.slug}/source`} rel="nofollow noopener" className="text-brand-teal hover:underline break-all">
                      {new URL(doc.sourceUrl).hostname}
                    </a>
                  </Row>
                )}
                {supersedes.length > 0 && (
                  <Row label="Replaces">
                    {supersedes.map((s) => (
                      <Link key={s.slug} href={`/hp-hub/documents/${s.slug}`} className="block hover:text-brand-teal">
                        {s.title}
                      </Link>
                    ))}
                  </Row>
                )}
              </dl>
            </section>

            <section aria-labelledby="cite">
              <h2 id="cite" className="text-xl font-bold text-brand-navy mb-3">
                Cite this document
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-700 bg-brand-light border-l-2 border-brand-gold px-5 py-4 mb-3 break-words">{citation}</p>
              <CopyButton text={citation} />
            </section>

            {related.length > 0 && (
              <section aria-labelledby="related">
                <SectionHeading id="related" title="Related documents" />
                <DocumentList docs={related} compact />
              </section>
            )}
          </div>

          {/* ── Access panel ─────────────────────────────────────────────── */}
          <aside className="space-y-8 lg:sticky lg:top-24 self-start">
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-muted mb-3">Access</p>
              <AccessBadge access={doc.accessType} />
              <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-5">{ACCESS_DESCRIPTIONS[doc.accessType]}</p>
              {downloadable ? (
                <a
                  href={`/hp-hub/documents/${doc.slug}/download`}
                  className="flex items-center justify-center gap-2 h-12 rounded bg-brand-gold hover:bg-[#b8973f] text-white font-semibold transition-colors"
                >
                  <svg aria-hidden className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {fileTypeLabel(doc.fileType, doc.fileName)}
                  {doc.fileSize ? <span className="font-normal opacity-90">({formatFileSize(doc.fileSize)})</span> : null}
                </a>
              ) : doc.accessType !== "RESTRICTED" && doc.sourceUrl ? (
                <a
                  href={`/hp-hub/documents/${doc.slug}/source`}
                  rel="nofollow noopener"
                  className="flex items-center justify-center gap-2 h-12 rounded bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold transition-colors"
                >
                  Access at original source <span aria-hidden>↗</span>
                </a>
              ) : (
                <a href="#request-access" className="flex items-center justify-center h-12 rounded border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
                  Request access
                </a>
              )}
              {downloadable && doc.sourceUrl && (
                <a href={`/hp-hub/documents/${doc.slug}/source`} rel="nofollow noopener" className="block text-center text-sm text-brand-teal hover:underline mt-3">
                  View at original source ↗
                </a>
              )}
              <dl className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-sm">
                {doc.rightsHolder && (
                  <div>
                    <dt className="text-brand-muted inline">Rights holder: </dt>
                    <dd className="inline text-brand-navy">{doc.rightsHolder}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-brand-muted inline">Permission: </dt>
                  <dd className="inline text-brand-navy">{PERMISSION_LABELS[doc.permissionStatus]}</dd>
                </div>
                {doc.rightsStatement && <dd className="text-gray-600 leading-relaxed">{doc.rightsStatement}</dd>}
              </dl>
            </div>

            <div id={doc.accessType === "RESTRICTED" ? "request-access" : "report"} className="scroll-mt-28">
              <h2 className="text-lg font-bold text-brand-navy mb-1">{doc.accessType === "RESTRICTED" ? "Request access or report an issue" : "Report an issue"}</h2>
              <p className="text-sm text-brand-muted mb-4">
                Spotted an error, a broken link, or hold the rights to this document? Let us know.
              </p>
              <FeedbackForm documentId={doc.id} defaultType={doc.accessType === "RESTRICTED" ? "ACCESS_REQUEST" : "CORRECTION"} startedAt={startedAt} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
