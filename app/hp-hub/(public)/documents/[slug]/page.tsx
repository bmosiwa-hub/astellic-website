import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/hp-hub/CopyButton";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import FeedbackForm from "@/components/hp-hub/FeedbackForm";
import { Breadcrumbs, jsonLdString, VerificationBadge } from "@/components/hp-hub/ui";
import { ACCESS_DESCRIPTIONS, ACCESS_LABELS, HP_HUB_BASE_URL, PERMISSION_LABELS } from "@/lib/hp-hub/constants";
import { getPublicDocument, getRelatedDocuments } from "@/lib/hp-hub/queries";
import { buildCitation, excerpt, fileTypeLabel, formatFileSize, periodLabel } from "@/lib/hp-hub/text";
import { isPubliclyDownloadable, showSyntheticRecords } from "@/lib/hp-hub/visibility";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ action?: string }> };

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
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:grid-cols-[10rem_minmax(0,1fr)] gap-4 py-2.5 border-b border-gray-100 text-[15px]">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-brand-navy min-w-0 break-words">{children}</dd>
    </div>
  );
}

const linkCls = "hover:text-brand-teal underline-offset-4 hover:underline";

const ACTIONS = {
  correction: "CORRECTION",
  access: "ACCESS_REQUEST",
  removal: "TAKEDOWN",
} as const;

export default async function DocumentPage({ params, searchParams }: Props) {
  const doc = await getPublicDocument((await params).slug);
  if (!doc) notFound();
  const sp = await searchParams;

  const related = await getRelatedDocuments(doc, 4);
  const themes = doc.themes.map((t) => t.theme);
  const keywords = doc.keywords.map((k) => k.keyword.name);
  const period = periodLabel(doc.startYear, doc.endYear);
  const downloadable = isPubliclyDownloadable(doc);
  const sourceVisible = !!doc.sourceUrl && doc.accessType !== "RESTRICTED";
  const base = `/hp-hub/documents/${doc.slug}`;
  const citation =
    doc.citationText ||
    buildCitation({
      title: doc.title,
      authors: doc.authors,
      publisherName: doc.publisher.name,
      publicationYear: doc.publicationYear,
      countryName: doc.country.name,
      documentTypeName: doc.documentType.name,
      sourceUrl: doc.sourceUrl || `${HP_HUB_BASE_URL}${base}`,
      edition: doc.edition,
      version: doc.version,
    });
  const visible = (d: { status: string; isSynthetic: boolean }) => d.status === "PUBLISHED" && (!d.isSynthetic || showSyntheticRecords());
  const supersededBy = doc.supersededBy && visible(doc.supersededBy) ? doc.supersededBy : null;
  const supersedes = doc.supersedes.filter(visible);
  const formType =
    ACTIONS[sp.action as keyof typeof ACTIONS] ?? (doc.accessType === "RESTRICTED" ? "ACCESS_REQUEST" : "CORRECTION");
  const startedAt = Date.now();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: doc.title,
    url: `${HP_HUB_BASE_URL}${base}`,
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

  const btn = "inline-flex items-center justify-center gap-2 h-12 px-6 rounded font-semibold transition-colors";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      {/* ── Top: what it is and how to get it ───────────────────────────────── */}
      <section className="bg-brand-light border-b border-gray-200 px-4 sm:px-6 pt-6 pb-8 sm:pb-10">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "HP-Hub", href: "/hp-hub" },
              { label: doc.country.name, href: `/hp-hub/${doc.country.slug}` },
              { label: doc.title },
            ]}
          />
          {doc.isSynthetic && (
            <p className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
              Synthetic development record: not a real document
            </p>
          )}
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">
            <Link href={`/hp-hub/types/${doc.documentType.slug}`} className="hover:underline underline-offset-4">
              {doc.documentType.name}
            </Link>
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy leading-tight max-w-4xl">{doc.title}</h1>
          <p className="mt-3 text-base sm:text-lg text-brand-muted">
            {[doc.publisher.name, doc.publicationYear, doc.country.name].filter(Boolean).join(" · ")}
          </p>
          {doc.verificationStatus === "VERIFIED" && (
            <p className="mt-2">
              <VerificationBadge status="VERIFIED" />
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {downloadable ? (
              <a href={`${base}/download`} className={`${btn} bg-brand-gold hover:bg-[#b8973f] text-white`}>
                <svg aria-hidden className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {fileTypeLabel(doc.fileType, doc.fileName)}
                {doc.fileSize ? <span className="font-normal opacity-90">({formatFileSize(doc.fileSize)})</span> : null}
              </a>
            ) : sourceVisible ? (
              <a href={`${base}/source`} rel="nofollow noopener" className={`${btn} bg-brand-navy hover:bg-brand-navy/90 text-white`}>
                Access original source <span aria-hidden>↗</span>
              </a>
            ) : (
              <a href={`${base}?action=access#help`} className={`${btn} border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white`}>
                Request access
              </a>
            )}
            {downloadable && sourceVisible && (
              <a href={`${base}/source`} rel="nofollow noopener" className="text-sm font-semibold text-brand-teal hover:underline">
                View at original source ↗
              </a>
            )}
            <a href="#cite" className="text-sm font-semibold text-brand-navy hover:text-brand-teal">
              Cite this document
            </a>
          </div>
          <p className="mt-3 text-sm text-brand-muted">{ACCESS_DESCRIPTIONS[doc.accessType]}</p>
        </div>
      </section>

      {supersededBy && (
        <div className="px-4 sm:px-6 bg-amber-50 border-b border-amber-200">
          <p className="max-w-6xl mx-auto py-3 text-sm text-amber-900">
            This document has been superseded by{" "}
            <Link href={`/hp-hub/documents/${supersededBy.slug}`} className="font-semibold underline underline-offset-2">
              {supersededBy.title}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-16">
          <div className="min-w-0 space-y-10">
            {(doc.abstract || doc.description) && (
              <section aria-labelledby="about">
                <h2 id="about" className="text-xl font-bold text-brand-navy mb-3">
                  About the document
                </h2>
                <div className="text-[17px] leading-relaxed text-gray-700 max-w-3xl whitespace-pre-line">{doc.abstract || doc.description}</div>
                {doc.abstract && doc.description && <div className="mt-4 text-[15px] leading-relaxed text-gray-600 max-w-3xl whitespace-pre-line">{doc.description}</div>}
              </section>
            )}

            <section aria-labelledby="details">
              <h2 id="details" className="text-xl font-bold text-brand-navy mb-1">
                Document details
              </h2>
              <dl>
                <Row label="Publisher">
                  <Link href={`/hp-hub/search?publisher=${doc.publisher.slug}`} className={linkCls}>
                    {doc.publisher.name}
                    {doc.publisher.acronym ? ` (${doc.publisher.acronym})` : ""}
                  </Link>
                </Row>
                {doc.authors.length > 0 && <Row label={doc.authors.length > 1 ? "Authors" : "Author"}>{doc.authors.join("; ")}</Row>}
                <Row label="Publication year">{doc.publicationYear ?? "Not stated"}</Row>
                <Row label="Document type">
                  <Link href={`/hp-hub/types/${doc.documentType.slug}`} className={linkCls}>
                    {doc.documentType.name}
                  </Link>
                </Row>
                <Row label="Country">
                  <Link href={`/hp-hub/${doc.country.slug}`} className={linkCls}>
                    {doc.country.name}
                  </Link>
                </Row>
                {themes.length > 0 && (
                  <Row label="Themes">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {themes.map((t) => (
                        <li key={t.slug}>
                          <Link href={`/hp-hub/themes/${t.slug}`} className={linkCls}>
                            {t.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}
                {period && <Row label="Period covered">{period}</Row>}
                <Row label="Language">{doc.language}</Row>
                {(doc.version || doc.edition) && <Row label="Version / edition">{[doc.version, doc.edition].filter(Boolean).join(" · ")}</Row>}
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
                {supersedes.length > 0 && (
                  <Row label="Replaces">
                    {supersedes.map((s) => (
                      <Link key={s.slug} href={`/hp-hub/documents/${s.slug}`} className={`block ${linkCls}`}>
                        {s.title}
                      </Link>
                    ))}
                  </Row>
                )}
              </dl>
            </section>

            <section aria-labelledby="rights" className="text-sm text-gray-600">
              <h2 id="rights" className="text-base font-bold text-brand-navy mb-2">
                Source and rights
              </h2>
              <ul className="space-y-1.5 leading-relaxed">
                <li>
                  <span className="text-brand-muted">Access:</span> {ACCESS_LABELS[doc.accessType]}
                  {downloadable && doc.fileType && (
                    <>
                      {" "}
                      ({fileTypeLabel(doc.fileType, doc.fileName)}
                      {doc.fileSize ? `, ${formatFileSize(doc.fileSize)}` : ""})
                    </>
                  )}
                </li>
                {sourceVisible && (
                  <li>
                    <span className="text-brand-muted">Original source:</span>{" "}
                    <a href={`${base}/source`} rel="nofollow noopener" className="text-brand-teal hover:underline break-all">
                      {new URL(doc.sourceUrl!).hostname}
                    </a>
                  </li>
                )}
                {doc.rightsHolder && (
                  <li>
                    <span className="text-brand-muted">Rights holder:</span> {doc.rightsHolder}
                  </li>
                )}
                <li>
                  <span className="text-brand-muted">Permission:</span> {PERMISSION_LABELS[doc.permissionStatus]}
                </li>
                {doc.rightsStatement && <li>{doc.rightsStatement}</li>}
                {doc.verificationStatus !== "VERIFIED" && (
                  <li>
                    <span className="text-brand-muted">Verification:</span> <VerificationBadge status={doc.verificationStatus} />
                  </li>
                )}
              </ul>
            </section>

            <section id="cite" aria-labelledby="cite-h" className="scroll-mt-28">
              <h2 id="cite-h" className="text-base font-bold text-brand-navy mb-2">
                Cite this document
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-700 bg-brand-light border-l-2 border-brand-gold px-4 py-3 mb-3 break-words">{citation}</p>
              <CopyButton text={citation} />
            </section>

            {related.length > 0 && (
              <section aria-labelledby="related">
                <h2 id="related" className="text-xl font-bold text-brand-navy border-b border-gray-200 pb-3">
                  Related documents
                </h2>
                <DocumentList docs={related} compact />
              </section>
            )}
          </div>

          {/* ── Help: corrections, access and removal ────────────────────── */}
          <aside id="help" className="scroll-mt-28 lg:sticky lg:top-24 self-start">
            <h2 className="text-lg font-bold text-brand-navy mb-1">Need something?</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-4">
              <li>
                <a href={`${base}?action=correction#help`} className="text-brand-teal hover:underline">
                  Report an error
                </a>
              </li>
              <li>
                <a href={`${base}?action=access#help`} className="text-brand-teal hover:underline">
                  Request access
                </a>
              </li>
              <li>
                <a href={`${base}?action=removal#help`} className="text-brand-teal hover:underline">
                  Request removal
                </a>
              </li>
            </ul>
            {/* Collapsed until a visitor picks an action (or the document is restricted). */}
            <details open={!!sp.action || doc.accessType === "RESTRICTED"} className="group rounded-lg border border-gray-200">
              <summary className="flex items-center justify-between cursor-pointer list-none px-4 h-12 text-sm font-semibold text-brand-navy">
                Send us a message
                <span aria-hidden className="text-brand-muted transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="px-4 pb-5 pt-1">
                <FeedbackForm key={formType} documentId={doc.id} defaultType={formType} startedAt={startedAt} />
              </div>
            </details>
          </aside>
        </div>
      </div>
    </>
  );
}
